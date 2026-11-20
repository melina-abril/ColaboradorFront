import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { APP_ROLES as SYSTEM_ROLES, APP_TITLE } from '../../app.navigation';
import { CurrentUser } from '../session/current-user';
import { AppRole } from './navigation.model';

const APP_ROLES: readonly AppRole[] = SYSTEM_ROLES;

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="site-header" [attr.aria-label]="title">
      <div class="site-header__brand">
        <span class="site-header__logo" aria-hidden="true">
          <svg width="27" height="27" viewBox="0 0 27 27" fill="none">
            <path d="M5 5h7v7H5zM15 5h7v7h-7zM5 15h7v7H5z" fill="currentColor" opacity=".95" />
            <path d="M15 15h7v7h-7z" fill="currentColor" opacity=".55" />
          </svg>
        </span>
        <span class="site-header__brand-text">
          <strong>RH smart</strong>
          <small>Portal del colaborador</small>
        </span>
      </div>
      @if (currentUser.user(); as user) {
        <div class="site-header__actions">
          <div class="site-header__identity">
            <span class="site-header__avatar" aria-hidden="true">{{ initials() }}</span>
            <span class="site-header__user">
              <strong>{{ user.name }}</strong>
              <small>Legajo {{ user.id }}</small>
            </span>
          </div>
          @if (canSwitchRole) {
            <label class="site-header__role">
              <span>Ver como</span>
              <select [value]="user.role ?? ''" (change)="changeRole($event)">
                @for (role of roles; track role.value) {
                  <option [value]="role.value">{{ role.label }}</option>
                }
              </select>
            </label>
          }
          <button class="site-header__logout" type="button" (click)="logout()" [disabled]="leaving()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 16l4-4-4-4M19 12H9" />
            </svg>
            Cerrar sesión
          </button>
        </div>
        @if (logoutError()) {
          <p class="site-header__error" role="alert">{{ logoutError() }}</p>
        }
      }
    </header>
  `,
  styles: `
    .site-header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px;
      min-height: 80px;
      padding: 16px 28px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-primary);
    }
    .site-header__brand, .site-header__actions, .site-header__identity {
      display: flex;
      align-items: center;
    }
    .site-header__brand {
      gap: 12px;
    }
    .site-header__logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: var(--surface);
    }
    .site-header__brand-text, .site-header__user {
      display: grid;
      line-height: 1.35;
    }
    .site-header__brand-text strong {
      font-size: 17px;
      letter-spacing: -0.025em;
    }
    .site-header__brand-text small, .site-header__user small {
      color: var(--text-secondary);
      font-size: 12px;
    }
    .site-header__actions {
      gap: 18px;
      flex-wrap: wrap;
    }
    .site-header__identity {
      gap: 10px;
    }
    .site-header__avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--active-item);
      color: var(--primary);
      font-size: 12px;
      font-weight: 700;
    }
    .site-header__user strong {
      font-weight: 600;
    }
    .site-header__role {
      display: grid;
      gap: 2px;
      font-size: 12px;
    }
    .site-header__role select {
      min-width: 110px;
      padding: 6px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      color: var(--text-primary);
    }
    .site-header__logout {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 40px;
      padding: 9px 16px;
      border: 0;
      border-radius: 8px;
      background: var(--primary);
      color: var(--surface);
      font: 600 13px Inter, 'Segoe UI', Arial, sans-serif;
      cursor: pointer;
    }
    .site-header__logout:hover {
      background: var(--accent);
    }
    .site-header__logout:disabled {
      opacity: .6;
      cursor: wait;
    }
    .site-header__error {
      flex-basis: 100%;
      margin: 0;
      color: var(--error);
      font-size: 13px;
    }
    @media (max-width: 600px) {
      .site-header {
        padding: 16px 20px;
      }
      .site-header__actions {
        width: 100%;
        justify-content: space-between;
      }
    }
  `,
})
export class AppHeader {
  protected readonly currentUser = inject(CurrentUser);
  protected readonly title = APP_TITLE;
  protected readonly roles = APP_ROLES;
  protected readonly canSwitchRole = environment.useMock && APP_ROLES.length > 1;
  protected readonly leaving = signal(false);
  protected readonly logoutError = signal('');
  protected readonly initials = computed(() => {
    const words = this.currentUser.user()?.name.trim().split(/\s+/) ?? [];
    return [words[0], words.length > 1 ? words[words.length - 1] : undefined]
      .filter((word): word is string => Boolean(word))
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  });
  private readonly router = inject(Router);

  protected changeRole(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    this.currentUser.setRole(target.value);
    void this.router.navigateByUrl('/');
  }

  protected logout(): void {
    if (this.leaving()) return;
    this.logoutError.set('');
    this.leaving.set(true);
    this.currentUser.logout().subscribe({
      next: () => {
        this.leaving.set(false);
        void this.router.navigateByUrl('/login');
      },
      error: () => {
        this.leaving.set(false);
        this.logoutError.set('No pudimos cerrar sesión. Intenta nuevamente');
      },
    });
  }
}
