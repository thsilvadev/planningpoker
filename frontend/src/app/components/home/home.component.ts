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
        console.log("📡 Room received:", room);
        console.log("🔑 CreatorId:", this.socketService.creatorId);
        console.log("👤 ParticipantId:", this.socketService.participantId);

        if (this.socketService.creatorId) {
          console.log("🏛️ Navigating to moderate-room");
          setTimeout(() => {
            this.router.navigate(["/moderate-room", room.id]);
          }, 1000);
        } else if (this.socketService.participantId) {
          console.log("👥 Navigating to participant-room");
          setTimeout(() => {
            this.router.navigate(["/participant-room", room.id]);
          }, 1000);
        } else {
          console.error("❌ Neither creatorId nor participantId is set");
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
