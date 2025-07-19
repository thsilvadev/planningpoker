import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CreateRoomDto } from './room/dto/create-room.dto';

import { RoomService } from './room/room.service';
import { JoinRoomDto } from './participant/dto/join-room.dto';
import { TaskService } from './task/task.service';
import { CreateTaskDto } from './task/dto/create-task.dto';
import { StartRoundDto } from './task/dto/start-round.dto';
import { PlanningService } from './planning.service';
import { RevealVotesDto } from './room/dto/reveal-votes.dto';
import { SubmitVoteDto } from './participant/dto/submit-vote.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PlanningGateway implements OnModuleInit, OnGatewayDisconnect {
  //Injetar e iniciar os serviços
  constructor(
    private readonly roomService: RoomService,
    private readonly taskService: TaskService,
    private readonly planningService: PlanningService,
  ) {}
  @WebSocketServer()
  private server: Server;

  onModuleInit() {
    this.server.on('connection', (socketClient) => {
      console.log(`socketClient connected: ${socketClient.id}`);
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`socketClient disconnected: ${client.id}`);
    // Obs: o frontend deve anotar o nome do usuário e o roomId no socketClient no momento em que entra/cria a sala
    // Se o usuário tem nome, ele está em uma sala (estado).
    const { name, roomId } = client.handshake.query;
    if (typeof name === 'string' && typeof roomId === 'string') {
      //Avisar os demais do usuário desconectado
      //Remover o usuário da sala (estado)
      this.server.emit('userDisconnected', name);
      const room = this.roomService.getRoom(roomId);
      if (room) {
        room.participants = room.participants.filter((p) => p.name !== name);
      }
    }
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    @MessageBody() createRoomDto: CreateRoomDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { name } = createRoomDto;

    const newRoom = this.roomService.createRoom(name);
    if (newRoom) {
      console.log(`Room created: ${newRoom.id} by ${name}`);
      //Cria uma sala Socket.IO (chamarei de Session) com o ID da sala
      //Envia a sala recém-criada para o cliente que a criou
      this.planningService.joinSession(client, newRoom.id);
      this.server.to(client.id).emit('moderateRoom', newRoom);
    } else {
      // Envia uma mensagem de erro para o cliente
      console.error(`Failed to create room for moderator ${name}`);
      client.emit('error', 'Failed to create room');
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() joinRoomDto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, name } = joinRoomDto;
    //newRoomState aqui é basicamente o estado da sala, que deve ser devolvido e atualizado no frontend.
    const newRoomState = this.roomService.addParticipant(roomId, name);

    if (newRoomState) {
      console.log(`Participant ${name} joined room ${roomId}`);
      //Entra numa session com o ID da sala
      //Envia a sala(estado) atualizada para todos os participantes da sala
      this.planningService.joinSession(client, roomId);
      this.server.to(roomId).emit('enterRoom', newRoomState);
    } else {
      console.error(`Failed to join room ${roomId} for participant ${name}`);
      client.emit('error', 'Failed to join room');
    }
  }

  @SubscribeMessage('createTask')
  handleCreateTask(
    @MessageBody() createTaskDto: CreateTaskDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { title, description, roomId } = createTaskDto;
    const newTask = this.taskService.createTask(title, description);
    const newRoomState = this.roomService.getRoom(roomId);
    if (newRoomState) {
      newRoomState.tasks.push(newTask);
      console.log(`Task '${title}' created in room ${roomId}`);
      this.server.to(roomId).emit(`taskCreated`, newRoomState);
    } else {
      console.error(`Failed to create task in room ${roomId}`);
      client.emit('error', 'Failed to create task');
    }
  }

  @SubscribeMessage('startRound')
  handleStartRound(
    @MessageBody() startRoundDto: StartRoundDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, taskId } = startRoundDto;
    const newRoomState = this.roomService.getRoom(roomId);
    if (newRoomState) {
      newRoomState.currentTaskId = taskId;
      console.log(`Task '${taskId}' to be voted in room ${roomId}`);
      this.server.to(roomId).emit(`votingStart`, newRoomState);
    } else {
      console.error(`Failed to start round in room ${roomId}`);
      client.emit('error', 'Failed to start round');
    }
  }

  @SubscribeMessage('revealVotes')
  handleRevealVotes(
    @MessageBody() revealVotesDto: RevealVotesDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId } = revealVotesDto;
    const newRoomState = this.roomService.getRoom(roomId);
    if (newRoomState) {
      newRoomState.votesRevealed = true;
      console.log(`Votes revealed in room ${roomId}`);
      this.server.to(roomId).emit('votesRevealed', newRoomState);
    } else {
      console.error(`Failed to reveal votes in room ${roomId}`);
      client.emit('error', 'Failed to reveal votes');
    }
  }

  @SubscribeMessage('submitVote')
  handleSubmitVote(
    @MessageBody()
    submitVoteDto: SubmitVoteDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, participantId, vote } = submitVoteDto;
    const newRoomState = this.roomService.getRoom(roomId);
    if (newRoomState) {
      const currentTask = newRoomState.tasks.find(
        (t) => t.id === newRoomState.currentTaskId,
      );
      if (currentTask) {
        currentTask.votes[participantId] = vote;
        console.log(
          `Vote submitted by ${participantId} for task ${currentTask.id} in room ${roomId}`,
        );
        this.server.to(roomId).emit('voteSubmitted', newRoomState);
      } else {
        console.error(`Task not found in room ${roomId}`);
        client.emit('error', 'Task not found');
      }
    } else {
      console.error(`Failed to submit vote in room ${roomId}`);
      client.emit('error', 'Failed to submit vote');
    }
  }
}
