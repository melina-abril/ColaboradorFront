import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { EmployeeHome2Service } from '../../data-access/employee-home-2.service';
import { CalendarCell, CalendarEventResponse, CalendarResponse } from '../../models/employee-home-2.models';

const WEEKDAYS: readonly string[] = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

@Component({
  selector: 'app-calendar-page',
  imports: [RouterLink, DatePipe, EmptyState, ErrorAlert, LoadingState],
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPage {
  private readonly service = inject(EmployeeHome2Service);
  private readonly today = new Date();
  protected readonly month = signal(this.today.getMonth() + 1);
  protected readonly year = signal(this.today.getFullYear());
  protected readonly weekdays = WEEKDAYS;
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => ({ month: this.month(), year: this.year(), reload: this.reloadCount() }));
  protected readonly calendarState = toSignal(
    toObservable(this.request).pipe(switchMap(({ month, year }) => toLoadState(this.service.getMyCalendar(month, year)))),
    { initialValue: { status: 'loading' } as LoadState<CalendarResponse> },
  );
  protected readonly monthDate = computed(() => new Date(Date.UTC(this.year(), this.month() - 1, 1)).toISOString());
  protected readonly cells = computed<CalendarCell[]>(() => {
    const state = this.calendarState();
    const events = state.status === 'ready' && state.data.month === this.month() && state.data.year === this.year()
      ? state.data.events : [];
    const first = new Date(Date.UTC(this.year(), this.month() - 1, 1));
    const offset = (first.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(this.year(), this.month(), 0)).getUTCDate();
    const count = Math.ceil((offset + days) / 7) * 7;
    return Array.from({ length: count }, (_, index): CalendarCell => {
      const date = new Date(Date.UTC(this.year(), this.month() - 1, index - offset + 1));
      const iso = date.toISOString().slice(0, 10);
      return {
        date: iso,
        day: date.getUTCDate(),
        inMonth: date.getUTCMonth() === this.month() - 1,
        events: events.filter((event) => event.startDate.slice(0, 10) <= iso && event.endDate.slice(0, 10) >= iso),
      };
    });
  });

  protected changeMonth(delta: number): void {
    const date = new Date(Date.UTC(this.year(), this.month() - 1 + delta, 1));
    const year = date.getUTCFullYear();
    if (year < 1900 || year > 2100) return;
    this.month.set(date.getUTCMonth() + 1);
    this.year.set(year);
  }

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }

  protected isAbsence(event: CalendarEventResponse): boolean {
    return event.type === 'APPROVED_ABSENCE';
  }
}
