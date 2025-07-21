import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { Room, Participant, Task, Round, Vote, CreateRoomRequest, JoinRoomRequest, CreateTaskRequest, SubmitVoteRequest } from '../models/room.models';

// Mock data for testing
const MOCK_ROOM: Room = {
  id: '1',
  name: 'Sala de Teste - Planning Poker',
  participants: [
    {
      id: 'user-1',
      name: 'João (Moderador)',
      isOnline: true,
      isModerator: true
    },
    {
      id: 'user-2',
      name: 'Maria',
      isOnline: true,
      isModerator: false
    },
    {
      id: 'user-3',
      name: 'Pedro',
      isOnline: true,
      isModerator: false
    },
    {
      id: 'user-4',
      name: 'Ana',
      isOnline: false,
      isModerator: false
    }
  ],
  currentTask: {
    id: 'task-1',
    title: 'Implementar sistema de login',
    description: 'Criar tela de login com validação de email/senha e integração com backend',
    createdAt: new Date()
  },
  createdBy: 'user-1'
};

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private roomSubject = new BehaviorSubject<Room | null>(null);
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private currentUserId: string | null = null;

  public room$ = this.roomSubject.asObservable();
  public connected$ = this.connectedSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor() {
    this.socket = io('http://localhost:3000');
    // Comment out real socket for mock
    // this.setupSocketListeners();
    
    // Simulate connection for mock
    setTimeout(() => {
      this.connectedSubject.next(true);
    }, 100);
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      this.connectedSubject.next(true);
      this.errorSubject.next(null);
    });

    this.socket.on('disconnect', () => {
      this.connectedSubject.next(false);
    });

    this.socket.on('room-updated', (room: Room) => {
      this.roomSubject.next(room);
    });

    this.socket.on('error', (error: string) => {
      this.errorSubject.next(error);
    });

    this.socket.on('room-created', (room: Room) => {
      this.roomSubject.next(room);
    });

    this.socket.on('joined-room', (room: Room) => {
      this.roomSubject.next(room);
    });

    this.socket.on('task-created', (task: Task) => {
      const currentRoom = this.roomSubject.value;
      if (currentRoom) {
        this.roomSubject.next({ ...currentRoom, currentTask: task });
      }
    });

    this.socket.on('round-started', (round: Round) => {
      const currentRoom = this.roomSubject.value;
      if (currentRoom) {
        this.roomSubject.next({ ...currentRoom, currentRound: round });
      }
    });

    this.socket.on('vote-submitted', (vote: Vote) => {
      const currentRoom = this.roomSubject.value;
      if (currentRoom && currentRoom.currentRound) {
        const updatedVotes = [...currentRoom.currentRound.votes, vote];
        const updatedRound = { ...currentRoom.currentRound, votes: updatedVotes };
        this.roomSubject.next({ ...currentRoom, currentRound: updatedRound });
      }
    });

    this.socket.on('votes-revealed', (round: Round) => {
      const currentRoom = this.roomSubject.value;
      if (currentRoom) {
        this.roomSubject.next({ ...currentRoom, currentRound: round });
      }
    });
  }

  createRoom(request: CreateRoomRequest): void {
    // Mock room creation
    this.currentUserId = 'user-1';
    const mockRoom = {
      ...MOCK_ROOM,
      participants: [
        {
          id: 'user-1',
          name: request.moderatorName,
          isOnline: true,
          isModerator: true
        }
      ]
    };
    
    setTimeout(() => {
      this.roomSubject.next(mockRoom);
    }, 500);
  }

  joinRoom(request: JoinRoomRequest): void {
    // Mock joining room
    if (request.roomId === '1' || request.roomId.toLowerCase() === 'teste') {
      this.currentUserId = 'user-2';
      const mockRoom = {
        ...MOCK_ROOM,
        participants: [
          ...MOCK_ROOM.participants.slice(0, 1), // Keep moderator
          {
            id: 'user-2',
            name: request.participantName,
            isOnline: true,
            isModerator: false
          },
          ...MOCK_ROOM.participants.slice(2) // Keep other participants
        ]
      };
      
      setTimeout(() => {
        this.roomSubject.next(mockRoom);
      }, 500);
    } else {
      setTimeout(() => {
        this.errorSubject.next('Sala não encontrada');
      }, 500);
    }
  }

  leaveRoom(): void {
    this.currentUserId = null;
    this.roomSubject.next(null);
  }

  createTask(request: CreateTaskRequest): void {
    const currentRoom = this.roomSubject.value;
    if (currentRoom) {
      const newTask: Task = {
        id: 'task-' + Date.now(),
        title: request.title,
        description: request.description,
        createdAt: new Date()
      };
      
      setTimeout(() => {
        this.roomSubject.next({ 
          ...currentRoom, 
          currentTask: newTask,
          currentRound: undefined 
        });
      }, 300);
    }
  }

  startRound(): void {
    const currentRoom = this.roomSubject.value;
    if (currentRoom && currentRoom.currentTask) {
      const newRound: Round = {
        id: 'round-' + Date.now(),
        taskId: currentRoom.currentTask.id,
        votes: [],
        isActive: true,
        isRevealed: false,
        startedAt: new Date()
      };
      
      setTimeout(() => {
        this.roomSubject.next({ 
          ...currentRoom, 
          currentRound: newRound 
        });
      }, 300);
    }
  }

  submitVote(request: SubmitVoteRequest): void {
    const currentRoom = this.roomSubject.value;
    if (currentRoom && currentRoom.currentRound && this.currentUserId) {
      const currentUser = currentRoom.participants.find(p => p.id === this.currentUserId);
      if (currentUser) {
        const newVote: Vote = {
          participantId: this.currentUserId,
          participantName: currentUser.name,
          value: request.value,
          submittedAt: new Date()
        };
        
        const updatedVotes = [
          ...currentRoom.currentRound.votes.filter(v => v.participantId !== this.currentUserId),
          newVote
        ];
        
        setTimeout(() => {
          this.roomSubject.next({
            ...currentRoom,
            currentRound: {
              ...currentRoom.currentRound!,
              votes: updatedVotes
            }
          });
        }, 300);
      }
    }
  }

  revealVotes(): void {
    const currentRoom = this.roomSubject.value;
    if (currentRoom && currentRoom.currentRound) {
      // Add some mock votes if there aren't enough
      const mockVotes: Vote[] = [
        {
          participantId: 'user-1',
          participantName: 'João (Moderador)',
          value: '5',
          submittedAt: new Date()
        },
        {
          participantId: 'user-2',
          participantName: currentRoom.participants.find(p => p.id === 'user-2')?.name || 'Maria',
          value: '8',
          submittedAt: new Date()
        },
        {
          participantId: 'user-3',
          participantName: 'Pedro',
          value: '5',
          submittedAt: new Date()
        }
      ];
      
      setTimeout(() => {
        this.roomSubject.next({
          ...currentRoom,
          currentRound: {
            ...currentRoom.currentRound!,
            votes: mockVotes,
            isRevealed: true,
            endedAt: new Date()
          }
        });
      }, 500);
    }
  }

  startNewRound(): void {
    const currentRoom = this.roomSubject.value;
    if (currentRoom) {
      setTimeout(() => {
        this.roomSubject.next({
          ...currentRoom,
          currentRound: undefined
        });
      }, 300);
    }
  }

  disconnect(): void {
    // Mock disconnect
    this.connectedSubject.next(false);
    this.roomSubject.next(null);
  }
}