import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { SocketService } from "../../../services/socket.service";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
    
})
export class HomeComponent {
  moderatorName = "";
  roomId = "";
  participantName = "";
  error: string | null = null;
  moving = false; // Controle do loading

  constructor(private socketService: SocketService, private router: Router) {
    this.socketService.error$.subscribe((error) => {
      this.error = error;
    });

    this.socketService.room$.subscribe((room) => {
      if (room) {
        if (this.socketService.creatorId) {
          setTimeout(() => {
            this.router.navigate(["/moderate-room", room.id]);
          }, 1000); // Aguardar 1 segundo antes de navegar
        }
        if (this.socketService.participantId) {
          setTimeout(() => {
            this.router.navigate(["/participant-room", room.id]);
          }, 1000); // Aguardar 1 segundo antes de navegar
        }
      }
    });
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
    }
  }
}
