import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { EmployeeBenefitsService } from '../../data-access/employee-benefits.service';
import { EmployeeBenefitResponse, EmployeeBenefitsResponse } from '../../models/employee-benefits.models';

type DayCategory = 'vacation' | 'study' | 'moving';
interface DaySummary {
  category: DayCategory;
  label: string;
  benefit: EmployeeBenefitResponse;
}

@Component({
  selector: 'app-employee-benefits-page',
  imports: [RouterLink, DatePipe, DecimalPipe, MoneyPipe, LoadingState, ErrorAlert, EmptyState],
  templateUrl: './employee-benefits-page.html',
  styleUrl: './employee-benefits-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeBenefitsPage {
  private readonly service = inject(EmployeeBenefitsService);
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => this.reloadCount());

  protected readonly benefitsState = toSignal(
    toObservable(this.request).pipe(
      switchMap(() => toLoadState(this.service.listMyBenefits()).pipe(
        map((state): LoadState<EmployeeBenefitsResponse> => state.status === 'error'
          ? { status: 'error', message: 'No pudimos cargar tus beneficios. Intenta nuevamente más tarde' }
          : state),
      )),
    ),
    { initialValue: { status: 'loading' } as LoadState<EmployeeBenefitsResponse> },
  );

  protected readonly daySummaries = computed<DaySummary[]>(() => {
    const state = this.benefitsState();
    if (state.status !== 'ready') return [];
    const categories: readonly { category: DayCategory; label: string; names: readonly string[] }[] = [
      { category: 'vacation', label: 'Vacaciones', names: ['VACATION', 'VACATIONS', 'VACACIONES'] },
      { category: 'study', label: 'Días de estudio', names: ['STUDY', 'STUDY_LEAVE', 'ESTUDIO'] },
      { category: 'moving', label: 'Días por mudanza', names: ['MOVING', 'MOVING_LEAVE', 'MUDANZA'] },
    ];
    return categories.flatMap(({ category, label, names }) => {
      const benefit = state.data.benefits.find((item) =>
        this.isDays(item.unit) && (names.includes(item.category.toUpperCase()) || names.includes(item.name.toUpperCase())));
      return benefit ? [{ category, label, benefit }] : [];
    });
  });

  protected isDays(unit: string): boolean {
    return ['DAYS', 'DAY', 'DÍAS', 'DIAS'].includes(unit.toUpperCase());
  }

  protected isMoney(unit: string): boolean {
    return ['ARS', 'USD'].includes(unit.toUpperCase());
  }

  protected daysLabel(amount: number): string {
    return amount === 1 ? 'día' : 'días';
  }

  protected usedPercent(benefit: EmployeeBenefitResponse): number {
    return benefit.assigned > 0 ? Math.max(0, Math.min(100, (benefit.used / benefit.assigned) * 100)) : 0;
  }

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }
}
