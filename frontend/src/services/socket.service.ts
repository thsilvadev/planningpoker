import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { Observable, BehaviorSubject } from "rxjs";
import { Room, Participant, Task, Vote } from "../models/room.models";
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

@Injectable({
  providedIn: "root",
})
export class SocketService {
  private socket: Socket;
  // Subject da sala para manter o estado da sala atual
  // e emitir atualizações para os componentes interessados
  private roomSubject = new BehaviorSubject<Room | null>(null);
  // Subjects para manter o estado da conexão e erros
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Variáveis para armazenar o ID do usuário atual
  public participantId: string | null = null;
  public creatorId: string | null = null;

  public room$ = this.roomSubject.asObservable();
  public connected$ = this.connectedSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor() {
    // Recupera o ID do criador e do participante do localStorage
    this.creatorId = localStorage.getItem("creatorId");
    this.participantId = localStorage.getItem("participantId");
    // Construir URL dinamicamente
    const backendUrl = this.getBackendUrl();
    const queryParams = this.buildQueryParams();
    const fullUrl = `${backendUrl}${queryParams}`;

    console.log("🔌 Connecting to:", fullUrl);
    this.socket = io(fullUrl);

    this.setupSocketListeners();
  }

  private getBackendUrl(): string {
    const hostname = window.location.hostname;
    const port = "3000";

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `http://localhost:${port}`;
    } else {
      return `http://${hostname}:${port}`;
    }
  }

  private buildQueryParams(): string {
    const params = new URLSearchParams();

    // Só adicionar se não for null/undefined
    if (this.creatorId && this.creatorId !== "null") {
      params.append("creatorId", this.creatorId);
    }

    if (this.participantId && this.participantId !== "null") {
      params.append("participantId", this.participantId);
    }

    const queryString = params.toString();
    return queryString ? `/?${queryString}` : "";
  }

  // LISTENERS PARA ATUALIZAÇÕES DO SERVIDOR

  // Configura os listeners do socket para receber eventos do servidor
  // e atualizar os Subjects correspondentes

  private setupSocketListeners(): void {
    this.socket.on("connect", () => {
      this.connectedSubject.next(true);
      this.errorSubject.next(null);
    });

    this.socket.on("disconnect", () => {
      this.connectedSubject.next(false);
    });

    this.socket.on("error", (error: string) => {
      this.errorSubject.next(error);
    });

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

    this.socket.on("roomRemoderated", (room: Room) => {
      this.roomSubject.next(room);
      console.log("Room remoderated:", room);
    });

    this.socket.on("roomJoined", (participantId: string) => {
      // Limpar creatorId
      this.creatorId = null;
      localStorage.removeItem("creatorId");
      // Atualiza o ID do participante e armazena no localStorage
      this.participantId = participantId;
      localStorage.setItem("participantId", participantId);
    });

    this.socket.on("roomRejoined", (room: Room) => {
      this.roomSubject.next(room);
    });

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
      console.log(response);
    });

    this.socket.on("participantLeft", (room: Room) => {
      this.roomSubject.next(room);
      console.log("Participant left:", room);
    });

    this.socket.on("exitedRoom", (response: string) => {
      this.roomSubject.next(null);
      console.log(response);
    });
  }

  // FUNÇÕES PARA EMITIR EVENTOS PARA O SERVIDOR
  // Essas funções emitem eventos para o servidor com os dados necessários
  // para criar, entrar, sair ou modificar salas e tarefas.

  createRoom(request: CreateRoomRequest): void {
    this.socket.emit("createRoom", request);
  }

  removeRoom(request: RemoveRoomRequest): void {
    this.socket.emit("removeRoom", request);
  }

  joinRoom(request: JoinRoomRequest): void {
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
