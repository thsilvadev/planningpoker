import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { BehaviorSubject } from "rxjs";
import { Room } from "../models/room.models";
import {
  CreateRoomRequest,
  JoinRoomRequest,
  CreateTaskRequest,
  SubmitVoteRequest,
  RevealVotesRequest,
  QuitRoomRequest,
  RemoveRoomRequest,
  StartRoundRequest,
} from "../models/request.models";
import { environment } from "../../src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class SocketService {
  //// Propriedades privadas (internas)
  private socket: Socket;

  // Subjects da sala para manter o estado da sala atual, conexão e erros 
  private roomSubject = new BehaviorSubject<Room | null>(null);
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  //// Propriedades públicas (compartilhadas com os components Angular):
  // Observables a partir dos Subjects 
  public room$ = this.roomSubject.asObservable();
  public connected$ = this.connectedSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  // Variáveis para armazenar o ID do usuário atual
  public participantId: string | null = null;
  public participantName: string | null = null;
  public creatorId: string | null = null;



  constructor() {
    //// Recupera o ID do criador e do participante do localStorage para reconexão
    this.creatorId = localStorage.getItem("creatorId");
    this.participantId = localStorage.getItem("participantId");
    this.participantName = localStorage.getItem("participantName");;
    const backendUrl = this.getBackendUrl();
    // Usar extraHeaders em vez de query params
    const socketConfig: any = {
      forceNew: true,
      transportOptions: {
        polling: {
          extraHeaders: {},
        },
      },
    };
    // Adiciona os IDs do criador e do participante aos headers da requisição
    if (this.creatorId) {
      socketConfig.transportOptions.polling.extraHeaders["x-creator-id"] =
        this.creatorId;
    }

    if (this.participantId) {
      socketConfig.transportOptions.polling.extraHeaders["x-participant-id"] =
        this.participantId;
    }

    this.socket = io(backendUrl, socketConfig);
    this.setupSocketListeners();
  }

  private getBackendUrl(): string {
    const hostname = environment.BACKEND_URL;
    const port = "3000";

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `http://localhost:${port}`;
    } else {
      return `${hostname}`;
    }
    
  }

  // LISTENERS PARA ATUALIZAÇÕES DO SERVIDOR

  private setupSocketListeners(): void {
    //[CONEXÃO]

    this.socket.on("connect", () => {
      this.connectedSubject.next(true);
      this.errorSubject.next(null);
    });

    this.socket.on("disconnect", () => {
      this.connectedSubject.next(false);
      this.roomSubject.next(null);
    });

    //[SOBRE ERROS]

    this.socket.on("error", (error: string) => {
      this.errorSubject.next(error);
      this.roomSubject.next(null);
    });

    this.socket.on("voteError", (error: string) => {
      this.errorSubject.next(error);
    });

    this.socket.on("joinError", (error: string) => {
      this.errorSubject.next(error);
      this.roomSubject.next(null);
    });

    //[SOBRE SALAS]

    this.socket.on("moderateRoom", (room: Room) => {
      // Limpar participantId
      this.participantId = null;
      localStorage.removeItem("participantId");
      // Atualiza o ID do criador e armazena no localStorage
      this.creatorId = room.creatorId;
      localStorage.setItem("creatorId", room.creatorId);

      this.roomSubject.next(room);
      console.log("Room moderated:", room);
    });

    this.socket.on("roomJoined", (participantId: string, callback: Function) => {
    console.log(" Received participantId:", participantId);
    
    // Salvar no localStorage e na propriedade
    localStorage.setItem("participantId", participantId);
    this.participantId = participantId;
    this.participantName = localStorage.getItem("participantName");
    
    console.log(" ParticipantId saved to localStorage");
    
    // ✅ IMPORTANTE: Confirmar que processou
    callback({ success: true, message: "ParticipantId saved successfully" });
  });

    //[SOBRE AÇÕES]

    this.socket.on("enterRoom", (room: Room) => {
      this.roomSubject.next(room);
    });

    this.socket.on("taskCreated", (room: Room) => {
      this.roomSubject.next(room);
      console.log("Task created:", room);
    });

    this.socket.on("votingStart", (room: Room) => {
      this.roomSubject.next(room);
    });

    this.socket.on("voteSubmitted", (room: Room) => {
      this.roomSubject.next(room);
    });

    this.socket.on("votesRevealed", (room: Room) => {
      this.roomSubject.next(room);
    });

    this.socket.on("roomRemoved", (response: string) => {
      this.roomSubject.next(null);
      localStorage.removeItem("creatorId");
      localStorage.removeItem("participantId");
      console.log(response);
    });

    this.socket.on("participantLeft", (room: Room) => {
      this.roomSubject.next(room);
      console.log("Participant left:", room);
    });

    this.socket.on("exitedRoom", (response: string) => {
      this.roomSubject.next(null);
      localStorage.removeItem("participantId");
      console.log(response);
    });

    //[RECONEXÃO]: Quando há um participantId ou creatorId nos headers da requisão, é porque o usuário está se reconectando ao servidor sem ter saído de uma sala -> vamos utilizar o seu id para redirecioná-lo à sua sala.
    this.socket.on("roomRejoined", (room: Room) => {
      this.roomSubject.next(room);
    });

    this.socket.on("roomRemoderated", (room: Room) => {
      this.roomSubject.next(room);
      console.log("Room remoderated:", room);
    });
  }

  // FUNÇÕES PARA EMITIR EVENTOS PARA O SERVIDOR

  createRoom(request: CreateRoomRequest): void {
    this.errorSubject.next(null) // Limpar erros aqui
    this.socket.emit("createRoom", request);
  }

  removeRoom(request: RemoveRoomRequest): void {
    this.socket.emit("removeRoom", request);
  }

  joinRoom(request: JoinRoomRequest): void {
    this.errorSubject.next(null) // Limpar erros aqui
    this.socket.emit("joinRoom", request);
  }

  quitRoom(request: QuitRoomRequest): void {
    this.socket.emit("quitRoom", request);
  }

  createTask(request: CreateTaskRequest): void {
    this.socket.emit("createTask", request);
  }

  startRound(request: StartRoundRequest): void {
    this.socket.emit("startRound", request);
  }

  submitVote(request: SubmitVoteRequest): void {
    this.socket.emit("submitVote", request);
  }

  revealVotes(request: RevealVotesRequest): void {
    this.socket.emit("revealVotes", request);
  }
}
