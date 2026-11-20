import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, startWith, switchMap } from 'rxjs';
import { LoadingState } from '../../../../shared/components/loading-state';
import { StatusBadge } from '../../../../shared/components/status-badge';
import { LoadState } from '../../../../shared/models/load-state';
import { EmployeeHomeService } from '../../data-access/employee-home.service';
import {
  CALENDAR_EVENT_LABELS,
  EmployeeSummaryResponse,
  LEAVE_CATEGORY_LABELS,
  LeaveCategory,
  REQUEST_STATUS,
} from '../../models/employee-home.models';

@Component({
  selector: 'app-employee-home-page',
  imports: [DatePipe, LoadingState, StatusBadge],
  templateUrl: './employee-home-page.html',
  styleUrl: './employee-home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeHomePage {
  private readonly service = inject(EmployeeHomeService);
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => ({ reload: this.reloadCount() }));

  protected readonly categories: readonly LeaveCategory[] = ['VACATION', 'STUDY', 'RELOCATION'];
  protected readonly categoryLabels = LEAVE_CATEGORY_LABELS;
  protected readonly requestStatus = REQUEST_STATUS;
  protected readonly eventLabels = CALENDAR_EVENT_LABELS;

  protected readonly summaryState = toSignal(
    toObservable(this.request).pipe(
      switchMap(() => this.service.getEmployeeSummary().pipe(
        switchMap((data) => of<LoadState<EmployeeSummaryResponse>>({ status: 'ready', data })),
        catchError(() => of<LoadState<EmployeeSummaryResponse>>({
          status: 'error',
          message: 'No pudimos cargar tu resumen. Intenta nuevamente más tarde.',
        })),
        startWith({ status: 'loading' } as LoadState<EmployeeSummaryResponse>),
      )),
    ),
    { initialValue: { status: 'loading' } as LoadState<EmployeeSummaryResponse> },
  );

  protected usedPercentage(usedDays: number, assignedDays: number): number {
    if (assignedDays <= 0) return 0;
    return Math.min(100, Math.max(0, (usedDays / assignedDays) * 100));
  }

  protected retry(): void {
    this.reloadCount.update((count) => count + 1);
  }
}
