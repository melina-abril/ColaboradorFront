import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { APP_TITLE } from '../../app.navigation';
import { errorMessage } from '../http/api-error';
import { CurrentUser, DEMO_PASSWORD } from './current-user';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="login">
      <section class="login__card" aria-labelledby="login-title">
        <p class="login__system">{{ title }}</p>
        <h1 id="login-title">Iniciar sesión</h1>
        <p class="login__hint">Ingresa con tu correo y tu contraseña para acceder a tu portal.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="form-field">
            <label for="login-email">Correo</label>
            <input id="login-email" type="email" formControlName="email" autocomplete="username"
              [attr.aria-invalid]="showError('email')"
              [attr.aria-describedby]="showError('email') ? 'login-email-error' : null" />
            @if (showError('email')) {
              <span id="login-email-error" class="form-field__error">Ingresa un correo válido.</span>
            }
          </div>
          <div class="form-field">
            <label for="login-password">Contraseña</label>
            <input id="login-password" type="password" formControlName="password" autocomplete="current-password"
              [attr.aria-invalid]="showError('password')"
              [attr.aria-describedby]="showError('password') ? 'login-password-error' : null" />
            @if (showError('password')) {
              <span id="login-password-error" class="form-field__error">Ingresa tu contraseña.</span>
            }
          </div>

          @if (error(); as message) {
            <p class="login__error" role="alert">{{ message }}</p>
          }

          <button class="button login__submit" type="submit" [disabled]="loading()">
            {{ loading() ? 'Ingresando…' : 'Ingresar' }}
          </button>
        </form>

        @if (demo) {
          <p class="login__demo">Modo demostración: usa cualquier correo y la contraseña <strong>{{ demoPassword }}</strong>.</p>
        }
      </section>
    </main>
  `,
  styles: `
    .login {
      width: 100%;
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: var(--space-lg);
      background: var(--color-background);
    }
    .login__card {
      width: min(26rem, 100%);
      display: grid;
      gap: var(--space-md);
      padding: var(--space-lg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: var(--color-surface);
    }
    .login__card h1 {
      margin: 0;
      color: var(--color-text);
    }
    .login__system {
      margin: 0;
      color: var(--color-primary);
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .login__hint {
      margin: 0;
      color: var(--color-text-muted);
    }
    form {
      display: grid;
      gap: var(--space-md);
    }
    .login__error {
      margin: 0;
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius);
      background: var(--color-danger-surface);
      color: var(--color-danger);
    }
    .login__submit {
      width: 100%;
    }
    .login__demo {
      margin: 0;
      color: var(--color-text-muted);
      font-size: 0.85rem;
    }
  `,
})
export class LoginPage {
  readonly returnUrl = input<string>();

  private readonly currentUser = inject(CurrentUser);
  private readonly router = inject(Router);
  protected readonly title = APP_TITLE;
  protected readonly demo = environment.useMock;
  protected readonly demoPassword = DEMO_PASSWORD;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitted = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected showError(field: 'email' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);
    this.currentUser.login(email, password).subscribe({
      next: () => void this.router.navigateByUrl(this.safeReturnUrl()),
      error: (error: unknown) => {
        this.error.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }

  private safeReturnUrl(): string {
    const target = this.returnUrl();
    return target?.startsWith('/') && !target.startsWith('//') ? target : '/';
  }
}
