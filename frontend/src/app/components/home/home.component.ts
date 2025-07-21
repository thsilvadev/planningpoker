import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="home-container">
      <div class="container">
        <div class="welcome-section">
          <h2>Bem-vindo ao Planning Poker</h2>
          <p>Realize estimativas colaborativas com sua equipe usando a técnica Planning Poker.</p>
        </div>

        <div class="actions-grid">
          <div class="action-card">
            <h3>Criar Nova Sala</h3>
            <p>Inicie uma nova sessão de Planning Poker</p>
            <form (ngSubmit)="createRoom()" class="action-form">
              <div class="form-group">
                <label>Seu nome</label>
                <input 
                  type="text" 
                  [(ngModel)]="moderatorName" 
                  name="moderatorName"
                  placeholder="Digite seu nome"
                  required
                  maxlength="50"
                />
              </div>
              <button type="submit" class="btn btn-primary" [disabled]="!moderatorName.trim()">
                Criar Sala
              </button>
            </form>
          </div>

          <div class="action-card">
            <h3>Entrar em Sala</h3>
            <p>Participe de uma sessão existente</p>
            <form (ngSubmit)="joinRoom()" class="action-form">
              <div class="form-group">
                <label>ID da Sala</label>
                <input 
                  type="text" 
                  [(ngModel)]="roomId" 
                  name="roomId"
                  placeholder="ID da sala"
                  required
                  maxlength="100"
                />
              </div>
              <div class="form-group">
                <label>Seu nome</label>
                <input 
                  type="text" 
                  [(ngModel)]="participantName" 
                  name="participantName"
                  placeholder="Digite seu nome"
                  required
                  maxlength="50"
                />
              </div>
              <button type="submit" class="btn btn-secondary" [disabled]="!roomId.trim() || !participantName.trim()">
                Entrar na Sala
              </button>
            </form>
          </div>
        </div>

        <div class="features-section">
          <h3>Como funciona?</h3>
          <div class="features-grid">
            <div class="feature-item">
              <div class="feature-icon">🎯</div>
              <h4>Defina Tarefas</h4>
              <p>O moderador define tarefas com título e descrição para estimativa</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🃏</div>
              <h4>Vote com Cartas</h4>
              <p>Participantes escolhem cartas (1, 2, 3, 5, 8, 13, etc.) para estimar</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">👥</div>
              <h4>Revele Resultados</h4>
              <p>Veja os votos de todos simultaneamente após a rodada</p>
            </div>
          </div>
        </div>

        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: calc(100vh - 120px);
      padding: 2rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 3rem;
    }

    .welcome-section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      margin-bottom: 1rem;
    }

    .welcome-section p {
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.9);
      max-width: 600px;
      margin: 0 auto;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .action-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .action-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2563eb;
      margin-bottom: 0.5rem;
    }

    .action-card p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .action-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 500;
      color: #374151;
    }

    .form-group input {
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
    }

    .btn-secondary {
      background: #10b981;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #059669;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .features-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .features-section h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2563eb;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .feature-item {
      text-align: center;
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-item h4 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .feature-item p {
      color: #6b7280;
      line-height: 1.5;
    }

    .error-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .actions-grid {
        grid-template-columns: 1fr;
      }
      
      .welcome-section h2 {
        font-size: 2rem;
      }
      
      .welcome-section p {
        font-size: 1.125rem;
      }
    }
  `]
})
export class HomeComponent {
  moderatorName = '';
  roomId = '';
  participantName = '';
  error: string | null = null;

  constructor(
    private socketService: SocketService,
    private router: Router
  ) {
    this.socketService.error$.subscribe(error => {
      this.error = error;
    });

    this.socketService.room$.subscribe(room => {
      if (room) {
        this.router.navigate(['/room', room.id]);
      }
    });
  }

  createRoom(): void {
    if (this.moderatorName.trim()) {
      this.socketService.createRoom({ moderatorName: this.moderatorName.trim() });
    }
  }

  joinRoom(): void {
    if (this.roomId.trim() && this.participantName.trim()) {
      this.socketService.joinRoom({ 
        roomId: this.roomId.trim(), 
        participantName: this.participantName.trim() 
      });
    }
  }
}