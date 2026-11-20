import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { APP_NAVIGATION as SYSTEM_NAVIGATION } from '../../app.navigation';
import { CurrentUser } from '../session/current-user';
import { NavigationItem } from './navigation.model';

const APP_NAVIGATION: readonly NavigationItem[] = SYSTEM_NAVIGATION;

type MenuGroup = { title: string; icon: string; items: readonly NavigationItem[] };

function groupFor(item: NavigationItem): string {
  const path = item.path.toLowerCase();
  const label = item.label.toLowerCase();
  if (path === 'employee-homes' || label.includes('inicio')) return 'Acceso e Inicio';
  if (path === 'employee-profiles' || path === 'employee-benefits' || label.includes('perfil') || label.includes('beneficio') || label.includes('contrato')) return 'Mi perfil';
  if (path === 'overtime-records' || label.includes('solicitud') || label.includes('horas extras')) return 'Mis solicitudes';
  if (label.includes('calendario') || label.includes('ausencia') || label.includes('feriado')) return 'Calendario';
  if (label.includes('comunicado')) return 'Comunicados';
  return 'Otras secciones';
}

@Component({
  selector: 'app-side-nav',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="navigation-container">
      <button class="navigation-toggle" type="button" [attr.aria-expanded]="open()" aria-controls="module-navigation" (click)="open.set(!open())">
        Secciones ☰
      </button>
      <nav id="module-navigation" class="navigation" aria-label="Secciones del portal" [class.navigation--open]="open()">
        <div class="navigation__eyebrow">MENÚ PRINCIPAL</div>
        @for (group of groups(); track group.title) {
          <div class="navigation__group">
            <div class="navigation__group-title">
              @switch (group.icon) {
                @case ('home') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></svg>
                }
                @case ('profile') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></svg>
                }
                @case ('requests') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5h6M9 10h6M9 14h6" /></svg>
                }
                @case ('calendar') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></svg>
                }
                @case ('announcements') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 20a2 2 0 0 0 4 0" /></svg>
                }
                @default {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                }
              }
              <span>{{ group.title }}</span>
            </div>
            @for (item of group.items; track item.path) {
              <a class="navigation__link" [routerLink]="'/' + item.path" routerLinkActive="navigation__link--active" [routerLinkActiveOptions]="{ exact: false }" ariaCurrentWhenActive="page" (click)="open.set(false)">{{ item.label }}</a>
            }
          </div>
        }
      </nav>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
      background: var(--primary);
      color: var(--surface);
    }
    .navigation-container {
      padding: 26px 14px;
    }
    .navigation {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .navigation__eyebrow {
      padding: 0 12px 6px;
      color: var(--active-item);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .11em;
    }
    .navigation__group {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .navigation__group-title {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      color: var(--surface);
      font-weight: 600;
    }
    .navigation__group-title svg {
      flex: 0 0 18px;
      width: 18px;
      height: 18px;
    }
    .navigation__link {
      display: block;
      margin-left: 27px;
      padding: 7px 10px;
      border-radius: 8px;
      color: var(--active-item);
      font-size: 12px;
      text-decoration: none;
    }
    .navigation__link:hover, .navigation__link:focus-visible {
      background: color-mix(in srgb, var(--surface) 12%, transparent);
      color: var(--surface);
    }
    .navigation__link--active, .navigation__link--active:hover {
      background: color-mix(in srgb, var(--surface) 18%, transparent);
      color: var(--surface);
      font-weight: 600;
    }
    .navigation-toggle {
      display: none;
      padding: 9px 12px;
      border: 1px solid var(--active-item);
      border-radius: 8px;
      background: var(--primary);
      color: var(--surface);
      font: inherit;
      cursor: pointer;
    }
    @media (max-width: 760px) {
      .navigation-container {
        padding: 12px 20px;
      }
      .navigation-toggle {
        display: inline-flex;
      }
      .navigation {
        display: none;
        padding-top: 16px;
      }
      .navigation--open {
        display: flex;
      }
    }
  `,
})
export class SideNav {
  private readonly currentUser = inject(CurrentUser);
  private readonly router = inject(Router);
  protected readonly open = signal(false);
  protected readonly items = computed(() => APP_NAVIGATION.filter((item) => this.currentUser.hasRole(item.roles)));
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );
  protected readonly groups = computed<readonly MenuGroup[]>(() => {
    const definitions = [
      { title: 'Acceso e Inicio', icon: 'home' },
      { title: 'Mi perfil', icon: 'profile' },
      { title: 'Mis solicitudes', icon: 'requests' },
      { title: 'Calendario', icon: 'calendar' },
      { title: 'Comunicados', icon: 'announcements' },
      { title: 'Otras secciones', icon: 'other' },
    ];
    return definitions
      .map((definition) => ({ ...definition, items: this.items().filter((item) => groupFor(item) === definition.title) }))
      .filter((group) => group.items.length > 0);
  });
  readonly activeTitle = computed(() => {
    const path = this.url().split(/[?#]/)[0];
    const current = this.items().find((item) => path === '/' + item.path || path.startsWith('/' + item.path + '/'));
    return current?.label ?? this.items()[0]?.label ?? 'Portal del colaborador';
  });
}
