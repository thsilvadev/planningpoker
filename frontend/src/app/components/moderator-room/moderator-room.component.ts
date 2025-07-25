import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketService } from "../../../services/socket.service";
import { Participant, Room, Task, Vote } from "../../../models/room.models";
import { Subscription } from "rxjs";

@Component({
  selector: "app-moderator-room",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./moderator-room.component.html",
  styleUrls: ["./moderator-room.component.scss"],
})
export class ModeratorRoomComponent implements OnInit, OnDestroy {
  //// Propriedades públicas (compartilhadas com o template):
  public room: Room | null = null;
  public taskTitle = "";
  public taskDescription = "";
  public showAddTaskModal = false;
  public voting = false;
  public taskQueue: Task[] = [];
  public completedTasks: Task[] = [];
  public currentTask: Task | null | undefined = null;
  public participants: Participant[] = [];
  public isRemovingRoom = false;

  //// Propriedades privadas (só usadas internamente)
  private roomId: string = "";
  //Encapsula observables aplicando métodos como add() e unsuscribe()
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService
  ) {
    this.roomId = this.route.snapshot.params["id"];
  }

  ngOnInit(): void {
    //Adiciona o Observable do socketService para receber atualizações da sala e se inscreve nele.
    this.subscription.add(
      this.socketService.room$.subscribe((room) => {
        this.room = room;

        if (room) {
          this.updateLocalData();
        }
        else {
          this.router.navigate(["/"]);
        }
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
      console.log("Task created, this room:", this.room);
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
    if (this.room?.votingStatus.status !== "voting") return false;
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

  private updateLocalData(): void {
    if (!this.room) return;

    this.voting = this.room.votingStatus.status === "voting";
    this.currentTask = this.voting
      ? this.room.tasks.find((task) => task.status === "voting")
      : null;
    this.taskQueue = this.room.tasks.filter(
      (task) => task.status === "waiting"
    );
    this.completedTasks = this.room.tasks.filter(
      (task) => task.status === "finished"
    );
    this.participants = this.room.participants;
  }

  copyRoomId(): void {
    if (this.roomId) {
      navigator.clipboard.writeText(this.roomId).then(
        () => {
          console.log("Room ID copied to clipboard:", this.roomId);
          // Feedback visual opcional (você pode remover se não quiser)
          alert("ID da sala copiado para a área de transferência!");
        },
        (err) => {
          console.error("Failed to copy room ID:", err);
          // Fallback para navegadores mais antigos
        }
      );
    }
  }

  getCompletedTaskTooltip(task: Task): string {
    const description = task.description || "Sem descrição";

    console.log("🔍 Task votes:", task.votes);
    console.log("🔍 Task votes keys:", Object.keys(task.votes || {}));

    // Verificar se há votos (objeto não vazio)
    if (!task.votes || Object.keys(task.votes).length === 0) {
      return `${description}\n\nNenhum voto registrado`;
    }

    // Converter objeto para array de strings
    const votesText = Object.entries(task.votes)
      .map(([participantName, vote]) => {
        return `${participantName}: ${vote}`;
      })
      .join("\n");

    return `${description}\n\nVotos:\n${votesText}`;
  }

  // DELETAR SALA

  confirmRemoveRoom(): void {
    const confirmed = confirm(
      "Tem certeza que deseja fechar esta sala?\n\n" +
        "Esta ação é irreversível e todos os participantes serão desconectados."
    );

    if (confirmed) {
      this.removeRoom();
    }
  }

  removeRoom(): void {
    if (this.room && this.socketService.creatorId) {
      this.isRemovingRoom = true; // Inicia o spinner
      this.socketService.removeRoom({
        roomId: this.roomId,
        creatorId: this.socketService.creatorId,
      });

      // Aguardar um pouco antes de navegar
      setTimeout(() => {
        console.log("Navegando para home...");
        this.router.navigate(["/"]);
      }, 1000);
    }
  }
}
