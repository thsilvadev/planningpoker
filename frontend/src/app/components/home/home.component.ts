import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { SocketService } from "../../../services/socket.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  //// Propriedades públicas (compartilhadas com o template):
  public moderatorName = "";
  public roomId = "";
  public participantName = "";
  public moving = false; // Controle do loading
  public error: string | null = null;

  //// Propriedades privadas (só usadas internamente)
  private subscription = new Subscription();

  constructor(private socketService: SocketService, private router: Router) {}

  ngOnInit(): void {
    this.subscription.add(
      // Inscrever-se no Observable de erros para checar erros e logar.
      this.socketService.error$.subscribe((error) => {
        if (error !== null) {
          this.error = error;
          console.log(this.error);
          if (error == "Erro ao entrar na sala -> tente mudar o seu nome.") {
            this.moving = false;
          } else {
            this.router.navigate(["/"]);
          }
        } else {
          this.error = null;
          this.moving = false;
        }
      })
    );

    this.subscription.add(
      // Inscrever-se no Observable de sala para redirecionar o usuário [RECONEXÃO]
      this.socketService.room$.subscribe((room) => {
        if (room) {
          console.log("📡 Room received:", room);
          console.log("🔑 CreatorId:", this.socketService.creatorId);
          console.log("👤 ParticipantId:", this.socketService.participantId);

          if (
            this.socketService.creatorId &&
            this.socketService.creatorId !== null &&
            this.socketService.creatorId !== undefined
          ) {
            // Se o usuário for o criador de uma sala existente, redireciona para a respectiva sala [moderate-room]
            console.log("🏛️ Modeator reconnected! Navigating to moderate-room");
            this.moving = true;
            setTimeout(() => {
              this.router.navigate(["/moderate-room", room.id]);
            }, 1000);
          } else if (
            this.socketService.participantId &&
            this.socketService.participantId !== null &&
            this.socketService.participantId !== undefined
          ) {
            // Se o usuário for um participante de uma sala existente, redireciona para a sala [participant-room]
            console.log(
              "👥 Participant reconnected! Navigating to participant-room"
            );
            this.moving = true;
            setTimeout(() => {
              this.router.navigate(["/participant-room", room.id]);
            }, 1000);
          } else {
            // Mantém o usuário na página inicial se nenhum ID estiver definido
            console.log("Neither creatorId nor participantId is set: new User");
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    console.log("🏠 HomeComponent destroyed - subscriptions cleaned up");
  }

  createRoom(): void {
    if (this.moderatorName.trim()) {
      this.moving = true;
      this.socketService.createRoom({ name: this.moderatorName.trim() });
    }
  }

  joinRoom(): void {
    if (this.roomId.trim() && this.participantName.trim()) {
      this.moving = true;
      this.socketService.joinRoom({
        roomId: this.roomId.trim(),
        name: this.participantName.trim(),
      });
      localStorage.setItem("participantName", this.participantName.trim());
    }
  }
}
