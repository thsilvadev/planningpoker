import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../../services/socket.service';
import { Room, Participant, Task, Round, Vote } from '../../../models/room.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-moderator-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './moderator-room.component.html',
  styleUrls: ['./moderator-room.component.scss']
})
export class ModeratorRoomComponent implements OnInit, OnDestroy {
  room: Room | null = null;
  roomId: string = '';
  taskTitle = '';
  taskDescription = '';
  voting = false;
  showAddTaskModal = false;
  
  // Mock data for task queue and completed tasks
  taskQueue: Task[] = [
    {
      id: 'task-2',
      title: 'Criar API de autenticação',
      description: 'Implementar endpoints para login, logout e refresh token',
      createdAt: new Date()
    },
    {
      id: 'task-3',
      title: 'Design do dashboard',
      description: 'Criar wireframes e protótipos do painel administrativo',
      createdAt: new Date()
    },
    {
      id: 'task-4',
      title: 'Integração com banco de dados',
      description: 'Configurar conexão e migrations do PostgreSQL',
      createdAt: new Date()
    }
  ];

  completedTasks: Task[] = [
    {
      id: 'completed-1',
      title: 'Setup inicial do projeto Angular',
      description: 'Configuração do ambiente de desenvolvimento',
      createdAt: new Date()
    },
    {
      id: 'completed-2',
      title: 'Implementação do sistema de roteamento',
      description: 'Configurar rotas e guards de autenticação',
      createdAt: new Date()
    },
    {
      id: 'completed-3',
      title: 'Criação dos componentes base da aplicação',
      description: 'Header, sidebar, footer e layout principal',
      createdAt: new Date()
    }
  ];
  
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.params['id'];
    
    this.subscription.add(
      this.socketService.room$.subscribe(room => {
        this.room = room;
        if (room?.currentRound) {
          this.voting = room.currentRound.isActive && !room.currentRound.isRevealed;
        } else {
          this.voting = false;
        }
      })
    );

    this.subscription.add(
      this.socketService.error$.subscribe(error => {
        if (error) {
          console.error('Socket error:', error);
          this.router.navigate(['/']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  openAddTaskModal(): void {
    this.showAddTaskModal = true;
  }

  closeAddTaskModal(): void {
    this.showAddTaskModal = false;
    this.taskTitle = '';
    this.taskDescription = '';
  }

  createTask(): void {
    if (this.taskTitle.trim()) {
      const newTask: Task = {
        id: 'task-' + Date.now(),
        title: this.taskTitle.trim(),
        description: this.taskDescription.trim(),
        createdAt: new Date()
      };
      
      this.taskQueue.push(newTask);
      this.closeAddTaskModal();
    }
  }

  sendTaskToVoting(task: Task): void {
    if (!this.voting) {
      this.socketService.createTask({
        title: task.title,
        description: task.description
      });
      
      // Remove task from queue and start round
      this.taskQueue = this.taskQueue.filter(t => t.id !== task.id);
      
      setTimeout(() => {
        this.socketService.startRound();
      }, 500);
    }
  }

  revealVotes(): void {
    if (this.voting) {
      this.socketService.revealVotes();
      
      // Move current task to completed tasks
      if (this.room?.currentTask) {
        this.completedTasks.unshift(this.room.currentTask);
      }
    }
  }

  hasVoted(participantId: string): boolean {
    if (!this.room?.currentRound) return false;
    return this.room.currentRound.votes.some((vote: Vote) => vote.participantId === participantId);
  }

  getTruncatedTitle(title: string): string {
    const maxLength = 40;
    if (title.length <= maxLength) {
      return title;
    }
    return title.substring(0, maxLength - 3) + '...';
  }

  leaveRoom(): void {
    this.socketService.leaveRoom();
    this.router.navigate(['/']);
  }
}