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
  templateUrl: "./participant-room.component.html",
  styleUrls: ["./participant-room.component.scss"],
})
export class ParticipantRoomComponent implements OnInit, OnDestroy {
  room: Room | null = null;
  roomId: string = "";
  voting = false;
  queuedTasks: number = 0;
  completedTasks: Task[] = [];
  currentTask: Task | null | undefined = null;
  participants: Participant[] = [];

  // Controle do loading spinner
  removing = false;

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

        if (room) {
          this.updateRoomData();
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

  private updateRoomData(): void {
    if (!this.room) return;

    this.voting = this.room.votingStatus.status === "voting";
    this.currentTask = this.voting
      ? this.room.tasks.find((task) => task.status === "voting")
      : null;
    this.queuedTasks = this.room.tasks.filter(
      (task) => task.status === "waiting"
    ).length;
    this.completedTasks = this.room.tasks.filter(
      (task) => task.status === "finished"
    );
    this.participants = this.room.participants;
  }

  // DELETAR SALA

  confirmQuitRoom(): void {
    const confirmed = confirm(
      "Tem certeza que deseja fechar esta sala?\n\n" +
        "Esta ação é irreversível e todos os participantes serão desconectados."
    );

    if (confirmed) {
      this.quitRoom();
    }
  }

  quitRoom(): void {
    if (this.room && this.socketService.participantId) {
      this.removing = true; // Inicia o spinner
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
