import { Component } from '@angular/core';

@Component({
  selector: 'app-welcome-page',
  standalone: true,
  template: `
    <main class="welcome">
      <h1>Bienvenido a Colaborador</h1>
      <p>Tu espacio para consultar tu información laboral.</p>
    </main>
  `,
  styles: `
    .welcome {
      padding: var(--space-xl);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }
    .welcome h1 {
      margin-top: 0;
      color: var(--text-primary);
    }
    .welcome p {
      color: var(--text-secondary);
    }
  `,
})
export class WelcomePage {}
