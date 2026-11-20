import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { errorMessage } from '../http/api-error';
import { CurrentUser, DEMO_PASSWORD } from './current-user';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main class="login-page">
      <section class="login-card" aria-labelledby="login-title">
        <div class="login-brand">
          <span class="login-mark" aria-hidden="true">C</span>
          <p class="login-brand-name">Colaborador</p>
          <h1 id="login-title">Bienvenido a tu espacio</h1>
          <p>Consulta tu información laboral y sigue tus gestiones en un solo lugar.</p>
        </div>
        <div class="login-form-panel">
          <h2>Iniciar sesión</h2>
          <p class="login-description">Ingresa con tu correo y contraseña.</p>
          @if (isDemo) {
            <p class="demo-notice">Modo demostración: usa cualquier correo y la contraseña {{ demoPassword }}.</p>
          }
          @if (error(); as message) {
            <p class="login-error" role="alert">{{ message }}</p>
          }
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="form-field">
              <label for="login-email">Correo electrónico</label>
              <input id="login-email" type="email" autocomplete="username" formControlName="email"
                [attr.aria-invalid]="showError('email')" [attr.aria-describedby]="showError('email') ? 'login-email-error' : null" />
              @if (showError('email')) {
                <small id="login-email-error" class="field-error">Ingresa un correo electrónico válido.</small>
              }
            </div>
            <div class="form-field">
              <label for="login-password">Contraseña</label>
              <input id="login-password" type="password" autocomplete="current-password" formControlName="password"
                [attr.aria-invalid]="showError('password')" [attr.aria-describedby]="showError('password') ? 'login-password-error' : null" />
              @if (showError('password')) {
                <small id="login-password-error" class="field-error">Ingresa tu contraseña.</small>
              }
            </div>
            <button type="submit" [disabled]="loading()">{{ loading() ? 'Ingresando…' : 'Ingresar' }}</button>
          </form>
        </div>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      min-height: 100dvh;
    }
    .login-page {
      display: grid;
      place-items: center;
      width: 100%;
      min-height: 100dvh;
      padding: var(--space-lg);
      background: var(--background);
    }
    .login-card {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
      min-height: calc(100dvh - 2 * var(--space-lg));
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      box-shadow: var(--shadow-card);
    }
    .login-brand {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding: clamp(var(--space-xl), 7vw, 6rem);
      background: var(--brand-gradient);
      color: var(--surface);
    }
    .login-mark {
      display: grid;
      place-items: center;
      width: 3rem;
      height: 3rem;
      border: 1px solid var(--surface);
      border-radius: var(--radius-md);
      font-size: 1.5rem;
      font-weight: 700;
    }
    .login-brand-name {
      font-size: 1.25rem;
      font-weight: 700;
    }
    .login-brand h1 {
      color: var(--surface);
      font-size: clamp(2rem, 4vw, 3rem);
    }
    .login-brand p {
      max-width: 32rem;
    }
    .login-form-panel {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: min(100%, 32rem);
      margin: auto;
      padding: var(--space-xl);
    }
    .login-description {
      color: var(--text-secondary);
    }
    .demo-notice {
      padding: var(--space-md);
      border-radius: var(--radius-sm);
      background: var(--soft-background);
      color: var(--primary);
    }
    .login-error {
      padding: var(--space-md);
      border: 1px solid var(--error);
      border-radius: var(--radius-sm);
      color: var(--error);
    }
    .form-field {
      display: grid;
      gap: var(--space-xs);
      margin-bottom: var(--space-lg);
    }
    .form-field input {
      width: 100%;
    }
    .field-error {
      color: var(--error);
    }
    button {
      width: 100%;
      padding: var(--space-md);
      border: 0;
      border-radius: var(--radius-sm);
      background: var(--primary);
      color: var(--surface);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.6;
      cursor: wait;
    }
    @media (max-width: 700px) {
      .login-page {
        padding: 0;
      }
      .login-card {
        grid-template-columns: 1fr;
        min-height: 100dvh;
        border: 0;
        border-radius: 0;
      }
      .login-brand {
        padding: var(--space-xl);
      }
      .login-form-panel {
        padding: var(--space-xl);
      }
    }
  `,
})
export class LoginPage {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly currentUser = inject(CurrentUser);
  private readonly router = inject(Router);

  readonly returnUrl = input<string>();
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly isDemo = environment.useMock;
  readonly demoPassword = DEMO_PASSWORD;
  readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  showError(field: 'email' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  submit(): void {
    if (this.loading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    this.currentUser.login(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigateByUrl(this.safeReturnUrl(this.returnUrl()));
      },
      error: (cause: unknown) => {
        this.loading.set(false);
        this.error.set(errorMessage(cause));
      },
    });
  }

  private safeReturnUrl(value: string | undefined): string {
    return value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !value.startsWith('/login')
      ? value
      : '/';
  }
}
