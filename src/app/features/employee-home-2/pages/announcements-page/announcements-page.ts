import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { ApiProblemError } from '../../../../core/http/api-error';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { Page } from '../../../../shared/models/page';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { EmployeeHome2Service } from '../../data-access/employee-home-2.service';
import { AnnouncementResponse } from '../../models/employee-home-2.models';

@Component({
  selector: 'app-announcements-page',
  imports: [DatePipe, RouterLink, EmptyState, ErrorAlert, LoadingState],
  templateUrl: './announcements-page.html',
  styleUrl: './announcements-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementsPage {
  readonly id = input<string>();
  private readonly service = inject(EmployeeHome2Service);
  protected readonly page = signal(0);
  protected readonly size = 10;
  protected readonly expandedId = signal<string | null>(null);
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => ({ page: this.page(), reload: this.reloadCount() }));
  protected readonly announcementsState = toSignal(
    toObservable(this.request).pipe(switchMap(({ page }) => toLoadState(this.service.listMyAnnouncements({ page, size: this.size })))),
    { initialValue: { status: 'loading' } as LoadState<Page<AnnouncementResponse>> },
  );
  private readonly featuredRequest = computed(() => ({ id: this.id(), reload: this.reloadCount() }));
  protected readonly featuredState = toSignal(
    toObservable(this.featuredRequest).pipe(switchMap(({ id }) => id
      ? toLoadState(this.service.getMyAnnouncement(id)).pipe(catchError((error: unknown) => of<LoadState<AnnouncementResponse>>({ status: 'error', message: error instanceof ApiProblemError && error.status === 404 ? 'El comunicado no está disponible' : 'No pudimos cargar los comunicados. Intenta nuevamente más tarde' })))
      : of<LoadState<AnnouncementResponse>>({ status: 'empty' }))),
    { initialValue: { status: 'empty' } as LoadState<AnnouncementResponse> },
  );

  protected toggle(id: string): void {
    this.expandedId.update((current) => current === id ? null : id);
  }

  protected goToPage(page: number): void {
    this.expandedId.set(null);
    this.page.set(page);
  }

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }
}
