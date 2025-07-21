import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketService } from "../../../services/socket.service";
import {
  Room,
  Task,
  Vote,
} from "../../../models/room.models";
import { Subscription } from "rxjs";

@Component({
  selector: "app-moderator-room",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./moderator-room.component.html",
  styleUrls: ["./moderator-room.component.scss"],
})
export class ModeratorRoomComponent implements OnInit, OnDestroy {
  room: Room | null = null;
  roomId: string = "";
  taskTitle = "";
  taskDescription = "";
  voting = this.room?.votingStatus.status === "voting" ? true : false;
  showAddTaskModal = false;
  taskQueue: Task[] =
    this.room?.tasks.filter((task) => task.status === "waiting") || [];
  completedTasks: Task[] =
    this.room?.tasks.filter((task) => task.status === "finished") || [];

  //Encapsula observables aplicando métodos como add() e unsuscribe()
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.params["id"];
    //Adiciona o Observable do socketService para receber atualizações da sala e se inscreve nele.
    this.subscription.add(
      this.socketService.room$.subscribe((room) => {
        this.room = room;
      })
    );
    // Adiciona o Observable do socketService para receber atualizações de conexão e erros e se inscreve nele.
    this.subscription.add(
      this.socketService.error$.subscribe((error) => {
        if (error) {
          console.error("Socket error:", error);
          this.router.navigate(["/"]);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // AÇÕES DO MODERADOR

  createTask(): void {
    if (this.room && this.socketService.creatorId) {
      this.socketService.createTask({
        title: this.taskTitle,
        description: this.taskDescription,
        creatorId: this.socketService.creatorId,
        roomId: this.roomId,
      });
      this.closeAddTaskModal();
    }
  }

  sendTaskToVoting(task: Task): void {
    if (!this.voting && this.room && this.socketService.creatorId) {
      this.socketService.startRound({
        roomId: this.roomId,
        taskId: task.id,
        creatorId: this.socketService.creatorId,
      });
    }
  }

  revealVotes(): void {
    if (this.voting && this.room && this.socketService.creatorId) {
      this.socketService.revealVotes({
        roomId: this.roomId,
        creatorId: this.socketService.creatorId,
      });
    }
  }

  // FUNÇÕES DE MODAL

  openAddTaskModal(): void {
    this.showAddTaskModal = true;
  }

  closeAddTaskModal(): void {
    this.showAddTaskModal = false;
    this.taskTitle = "";
    this.taskDescription = "";
  }

  // UTILIDADES

  hasVoted(participantId: string): boolean {
    if (this.room?.votingStatus.status !== 'voting') return false;
    return this.room.participants.some(
      (participant) => participant.id === participantId && participant.hasVoted
    );
  }

  getTruncatedTitle(title: string): string {
    const maxLength = 40;
    if (title.length <= maxLength) {
      return title;
    }
    return title.substring(0, maxLength - 3) + "...";
  }

  removeRoom(): void {
    if (this.room && this.socketService.creatorId) {
      this.socketService.removeRoom({
        roomId: this.roomId,
        creatorId: this.socketService.creatorId,
      });
      this.router.navigate(["/"]);
    }
  }
}
