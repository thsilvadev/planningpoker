import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayDisconnect,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { OnModuleInit, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { CleanupRoomsService } from '../utils/cleanupRooms.service';
import { RoomSanitizerService } from '../utils/roomSanitizer.service';
import { QuitRoomDto } from './room/dto/quit-room.dto';
import { RemoveRoomDto } from './room/dto/remove-room.dto';

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
    private readonly cleanupRoomsService: CleanupRoomsService,
    private readonly roomSanitizerService: RoomSanitizerService,
  ) {}
  @WebSocketServer()
  private server: Server;

  onModuleInit() {
    this.server.on('connection', (socketClient) => {
      console.log(
        `socketClient connected: ${socketClient.id}, handshake:`,
        socketClient.handshake.headers,
      );
      // Se o cliente já tem um participantId, ele está reconectando
      const participantId = socketClient.handshake.headers[
        'x-participant-id'
      ] as string;
      const creatorId = socketClient.handshake.headers[
        'x-creator-id'
      ] as string;
      if (!participantId && !creatorId) {
        // Se não tem participantId nem creatorId, é um novo cliente
        socketClient.emit('newConnection', {
          message: 'Welcome to Planning Poker!',
        });
      } else {
        if (participantId) {
          const room = this.roomService.getRoomByParticipantId(participantId);
          if (room) {
            this.planningService.joinSession(socketClient, room.id);
            socketClient.emit('roomRejoined', room);
            console.log(`Participant reconnected to room ${room.id}`);
          }
        }
        if (creatorId) {
          const room = this.roomService.getRoomByCreatorId(creatorId);
          if (room) {
            this.planningService.joinSession(socketClient, room.id);
            socketClient.emit('roomRemoderated', room);
            console.log(`Moderator reconnected to room ${room.id}`);
          }
        }
      }
    });

    this.server.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    this.server.setMaxListeners(0);

    // Registrar callback de limpeza
    this.cleanupRoomsService.setCleanupCallback(() => {
      this.cleanupInactiveRooms();
    });
  }
  // Handler padrão do NestJS
  handleDisconnect(client: Socket) {
    console.log(`socketClient disconnected: ${client.id}`);
  }

  //Depois de muita pesquisa eu consegui fazer as validações de interface (DTO) funcionarem com o WebSocketGateway.
  //Aparentemente, o ValidationPipe não funciona diretamente no WebSocketGateway (mesmo lá no main.ts estar o .useGlobalPipes()), então eu
  //usei o UsePipes() decorator para aplicar o ValidationPipe em cada método de manipulação de mensagem.
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new WsException(errors),
    }),
  )
  @SubscribeMessage('createRoom')
  handleCreateRoom(
    @MessageBody() createRoomDto: CreateRoomDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { name } = createRoomDto;

    const newRoom = this.roomService.createRoom(name, client.id);
    if (newRoom) {
      //Cria uma sala Socket.IO (chamarei de Session) com o ID da sala
      //Envia a sala recém-criada para o cliente que a criou
      this.planningService.joinSession(client, newRoom.id);
      client.emit('moderateRoom', newRoom);
      console.log(
        `Room created: ${newRoom.id} by ${name}, socketId: ${client.id}`,
      );
    } else {
      // Envia uma mensagem de erro para o cliente
      console.error(`Failed to create room for moderator ${name}`);
      client.emit('error', 'Failed to create room');
    }
  }

  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new WsException(errors),
    }),
  )
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() joinRoomDto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, name } = joinRoomDto;
    const result = this.roomService.addParticipant(roomId, name);
    if (!result) {
      console.error(
        `Failed to join room ${roomId} for participant ${name}, socket ID: ${client.id}`,
      );
      client.emit(
        'joinError',
        'Erro ao entrar na sala -> tente mudar o seu nome.',
      );
      return;
    }
    const { newRoomState, participantId } = result;
    //Entra numa session com o ID da sala
    const joinedSession: boolean = this.planningService.joinSession(
      client,
      roomId,
    );
    if (newRoomState && joinedSession) {
      // Enviar participantId com callback de confirmação
      client.emit('roomJoined', participantId, (acknowledgment: any) => {
        // Este callback só executa DEPOIS que o frontend processar
        console.log(
          'Frontend confirmed participantId received:',
          acknowledgment,
        );

        // AGORA sim enviar para todos na sala
        this.server
          .to(roomId)
          .emit(
            'enterRoom',
            this.roomSanitizerService.sanitizeRoom(newRoomState),
          );
        console.log(`Participant ${name} joined room ${roomId}`);
      });
    } else {
      console.error(
        `Failed to join room ${roomId} for participant ${name}, socket ID: ${client.id}`,
      );
      client.emit('error', 'Failed to join room');
    }
  }

  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new WsException(errors),
    }),
  )
  @SubscribeMessage('createTask')
  handleCreateTask(
    @MessageBody() createTaskDto: CreateTaskDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { title, description, roomId, creatorId } = createTaskDto;
    const newTask = this.taskService.createTask(title, description);
    const newRoomState = this.roomService.getRoom(roomId);
    if (newRoomState && newTask && newRoomState.creatorId === creatorId) {
      newRoomState.tasks.push(newTask);

      this.server
        .to(roomId)
        .emit(
          `taskCreated`,
          this.roomSanitizerService.sanitizeRoom(newRoomState),
        );
      console.log(`Task '${title}' created in room ${roomId}`);
    } else {
      console.error(`Failed to create task in room ${roomId}`);
      client.emit('error', 'Failed to create task');
    }
  }

  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new WsException(errors),
    }),
  )
  @SubscribeMessage('startRound')
  handleStartRound(
    @MessageBody() startRoundDto: StartRoundDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, taskId, creatorId } = startRoundDto;
    const newRoomState = this.roomService.getRoom(roomId);
    const task = newRoomState?.tasks.find((t) => t.id === taskId);
    if (newRoomState && newRoomState.creatorId === creatorId && task) {
      newRoomState.votingStatus = { status: 'voting', taskId };
      task.status = 'voting'; // Atualiza o status da tarefa para 'voting'
      newRoomState.participants.forEach((p) => {
        p.hasVoted = false; // Resetar hasVoted para false
      });

      this.server
        .to(roomId)
        .emit(
          `votingStart`,
          this.roomSanitizerService.sanitizeRoom(newRoomState),
        );
      console.log(`Task '${taskId}' to be voted in room ${roomId}`);
    } else {
      console.error(`Failed to start round in room ${roomId}`);
      client.emit('error', 'Failed to start round');
    }
  }

  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new WsException(errors),
    }),
  )
  @SubscribeMessage('revealVotes')
  handleRevealVotes(
    @MessageBody() revealVotesDto: RevealVotesDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, creatorId } = revealVotesDto;
    const newRoomState = this.roomService.getRoom(roomId);
    if (
      newRoomState &&
      newRoomState.votingStatus.status === 'voting' &&
      newRoomState.creatorId === creatorId
    ) {
      newRoomState.votingStatus = {
        status: 'revealed',
        taskId: newRoomState.votingStatus.taskId,
      };
      newRoomState.tasks.forEach((task) => {
        if (task.status === 'voting') {
          task.status = 'finished'; // Atualiza o status da tarefa para 'finished'
        }
      });

      this.server
        .to(roomId)
        .emit(
          'votesRevealed',
          this.roomSanitizerService.sanitizeRoom(newRoomState),
        );
      console.log(`Votes revealed in room ${roomId}`);
    } else {
      console.error(`Failed to reveal votes in room ${roomId}`);
      client.emit('error', 'Failed to reveal votes');
    }
  }

  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new WsException(errors),
    }),
  )
  @SubscribeMessage('submitVote')
  handleSubmitVote(
    @MessageBody()
    submitVoteDto: SubmitVoteDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, participantId, participantName, vote } = submitVoteDto;
    const newRoomState = this.roomService.getRoom(roomId);

    if (newRoomState && newRoomState.votingStatus.status === 'voting') {
      const newVotingStatus = newRoomState.votingStatus;
      const currentTask = newRoomState.tasks.find(
        (t) => t.id === newVotingStatus.taskId,
      );
      const participant = newRoomState.participants.find(
        (p) =>
          p.id === participantId && !p.hasVoted && p.name === participantName,
      );

      if (currentTask && participant) {
        // Salvar o voto na task
        currentTask.votes[participantName] = vote;

        // Marcar que o participante votou
        participant.hasVoted = true;

        this.server
          .to(roomId)
          .emit(
            'voteSubmitted',
            this.roomSanitizerService.sanitizeRoom(newRoomState),
          );
        console.log(
          `Vote submitted by ${participantId} for task ${currentTask.id} in room ${roomId}`,
        );
      } else {
        console.error(
          `Task not found in room ${roomId} or participant has already voted`,
        );
        client.emit('voteError', 'Task not found or you have already voted');
      }
    } else {
      console.error(`Failed to submit vote in room ${roomId}`);
      client.emit('error', 'Failed to submit vote');
    }
  }

  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new WsException(errors),
    }),
  )
  @SubscribeMessage('quitRoom')
  handleQuitRoom(
    @MessageBody() quitRoomDto: QuitRoomDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, participantId } = quitRoomDto;
    let room = this.roomService.getRoom(roomId);
    if (room) {
      void client.leave(roomId);
      room = this.roomService.removeParticipant(roomId, participantId);
      if (room) {
        this.server
          .to(roomId)
          .emit(
            'participantLeft',
            this.roomSanitizerService.sanitizeRoom(room),
          );
        client.emit('exitedRoom', `You exited the room ${roomId}`);
        console.log(`Participant ${participantId} left room ${roomId}`);
      } else {
        console.error(`Failed to quit room ${roomId}`);
        client.emit('error', 'Failed to quit room');
      }
    } else {
      console.error(`Failed to quit room ${roomId}`);
      client.emit('error', 'Failed to quit room');
    }
  }

  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new WsException(errors),
    }),
  )
  @SubscribeMessage('removeRoom')
  handleRemoveRoom(
    @MessageBody() removeRoomDto: RemoveRoomDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, creatorId } = removeRoomDto;
    const room = this.roomService.getRoom(roomId);
    if (room && creatorId === room.creatorId) {
      this.roomService.removeRoom(roomId);
      this.server.to(roomId).emit('roomRemoved', `Room ${roomId} was removed`);
      void this.planningService.removeSession(roomId, this.server);
      console.log(`Room ${roomId} removed`);
    } else {
      console.error(`Failed to remove room ${roomId}`);
      client.emit('error', 'Failed to remove room');
    }
  }

  /// EXTRA: Método para limpar salas inativas

  private cleanupInactiveRooms(): void {
    // 1. Pegar todas as salas
    const allRooms = this.roomService.getAllRooms();

    // 2. Identificar salas inativas
    const roomsToRemove =
      this.cleanupRoomsService.cleanupInactiveRooms(allRooms);

    // 3. Para cada sala inativa, remover do RoomService e do Socket
    roomsToRemove.forEach((roomId) => {
      // Remover do socket (Sessão)
      void this.planningService.removeSession(roomId, this.server);

      // Remover do RoomService
      this.roomService.removeRoom(roomId);

      console.log(`Inactive room ${roomId} has been cleaned up`);
    });

    if (roomsToRemove.length > 0) {
      console.log(`Cleaned up ${roomsToRemove.length} inactive rooms`);
    }
  }
}
