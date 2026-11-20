import { ChangeDetectionStrategy, Component } from '@angular/core';
import { APP_TITLE } from '../../app.navigation';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="site-footer" [attr.aria-label]="title + ': información de soporte'">
      <span>RH smart · Soporte: <a href="mailto:soporte@techforb.com">soporte@techforb.com</a></span>
      <span>Versión 1.0.0</span>
    </footer>
  `,
  styles: `
    .site-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      min-height: 56px;
      padding: 14px 28px;
      border-top: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-secondary);
      font-size: 12px;
    }
    .site-footer a {
      color: var(--accent);
      font-weight: 600;
      text-decoration: none;
    }
    .site-footer a:hover {
      text-decoration: underline;
    }
    .site-footer a:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 3px;
    }
  `,
})
export class AppFooter {
  protected readonly title = APP_TITLE;
}
