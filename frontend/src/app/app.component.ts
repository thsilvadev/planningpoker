import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="container">
          <h1><a class="home-logo" href="/">PP</a></h1>
          <p class="subtitle">Planning Poker</p>
        </div>
      </header>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .app-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      height: 50px;
    }

    .container {
      max-width: 1200px;
      margin: 0 0;
      padding: 0 1rem;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: start;
      gap: 30px;
    }

    .home-logo {
      text-decoration: none;
    }

    .app-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #2563eb;
      margin: 0;
    }

    .subtitle {
      color: #6b7280;
      margin: 0.25rem 0 0 0;
      font-size: 0.975rem;
    }

    .main-content {
      padding: 2rem 0;
    }
  `]
})
export class AppComponent {}