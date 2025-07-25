import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketService } from "../../../services/socket.service";
import { Participant, Room, Task, Vote } from "../../../models/room.models";
import { Subscription } from "rxjs";

@Component({
  selector: "app-participant-room",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./participant-room.component.html",
  styleUrls: ["./participant-room.component.scss"],
})
export class ParticipantRoomComponent implements OnInit, OnDestroy {

  //// Propriedades públicas (compartilhadas com o template):
  public room: Room | null = null;
  public completedTasks: Task[] = [];
  public currentTask: Task | null | undefined = null;
  public participants: Participant[] = [];
  public votingValues: Vote[] = ["0", "1", "2", "3", "5", "8", "13", "20"];
  public selectedVote: Vote | null = null;
  public queuedTasks: number = 0;
  public isLeavingRoom = false;
  public isVoting = false;
  public userVoted = false;
  
  //// Propriedades privadas (só usadas internamente)
  private participantId: string | null = null;
  private participantName: string = "";
  private roomId: string = "";
  //Encapsula observables aplicando métodos como add() e unsuscribe()
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
  ) {
    this.roomId = this.route.snapshot.params["id"];
  }
  
  ngOnInit(): void {
    
    //Adiciona o Observable do socketService para receber atualizações da sala e se inscreve nele.
    this.subscription.add(
      this.socketService.room$.subscribe((room) => {
        this.room = room;
        
        if (this.room) {
          console.log(room)
          this.participantId = this.socketService.participantId;
          if (this.socketService.participantName && !this.participantName) {
          this.participantName = this.socketService.participantName;
        }
          this.updateLocalData();
        } else {
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

  // AÇÕES DO PARTICIPANTE

  submitVote(): void {
    if (
      this.selectedVote !== null &&
      this.currentTask &&
      this.socketService.participantId
    ) {
      console.log("📤 Submitting vote:", this.selectedVote);
      console.log("participantName: ", this.participantName)
      this.socketService.submitVote({
        roomId: this.roomId,
        participantId: this.socketService.participantId,
        participantName: this.participantName,
        vote: this.selectedVote,
      });

      // Resetar seleção após votar
      this.selectedVote = null;
    }
  }

  // UTILIDADES

  hasVoted(participantName: string | null): boolean {
    if (this.room?.votingStatus.status !== "voting") return false;
    return this.room.participants.some(
      (participant) => participant.name === participantName && participant.hasVoted
    );
  }

  getTruncatedTitle(title: string): string {
    const maxLength = 40;
    if (title.length <= maxLength) {
      return title;
    }
    return title.substring(0, maxLength - 3) + "...";
  }

  getCompletedTaskTooltip(task: Task): string {
    const description = task.description || "Sem descrição";

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

  private updateLocalData(): void {
    if (!this.room) return;

    this.isVoting = this.room.votingStatus.status === "voting";
    this.currentTask = this.isVoting
      ? this.room.tasks.find((task) => task.status === "voting")
      : null;
    this.queuedTasks = this.room.tasks.filter(
      (task) => task.status === "waiting"
    ).length;
    this.completedTasks = this.room.tasks.filter(
      (task) => task.status === "finished"
    );
    this.participants = this.room.participants;
    this.userVoted = this.hasVoted(this.participantName);
    console.log('updating local Data: \n',
      'isVoting:', this.isVoting,
      'currentTask:', this.currentTask,
      'queuedTasks:', this.queuedTasks,
      'completedTasks:', this.completedTasks,
      'participants:', this.participants,
      'participantId', this.participantId,
      'participantName:', this.participantName,
      'userVoted:', this.userVoted
    );
  }

  selectVote(value: Vote): void {
    this.selectedVote = value;
    console.log("🗳️ Vote selected:", value);
  }

  // DELETAR SALA

  confirmQuitRoom(): void {
    const confirmed = confirm("Tem certeza que deseja sair desta sala?");

    if (confirmed) {
      this.quitRoom();
    }
  }

  quitRoom(): void {
    if (this.room && this.socketService.participantId) {
      this.isLeavingRoom = true; // Inicia o spinner
      this.socketService.quitRoom({
        roomId: this.roomId,
        participantId: this.socketService.participantId,
      });

      // Aguardar um pouco antes de navegar
      setTimeout(() => {
        console.log("Navegando para home...");
        this.router.navigate(["/"]);
      }, 1000);
    }
  }
}
