import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { ApiProblemError } from '../../../../core/http/api-error';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { StatusBadge } from '../../../../shared/components/status-badge';
import { LoadState } from '../../../../shared/models/load-state';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { OvertimeRecordsService } from '../../data-access/overtime-records.service';
import { OVERTIME_STATUS, OVERTIME_TYPE, OvertimeListResponse, OvertimeRecordRequest, OvertimeRecordResponse, OvertimeType } from '../../models/overtime-records.models';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const validDate: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value as string;
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { date: true };
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? { date: true } : null;
};
const validSchedule: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const start: string = control.get('startTime')?.value as string;
  const end: string = control.get('endTime')?.value as string;
  return start && end && timePattern.test(start) && timePattern.test(end) && end <= start ? { schedule: true } : null;
};

type FormField = keyof OvertimeRecordRequest;

@Component({
  selector: 'app-overtime-records-page',
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, EmptyState, ErrorAlert, LoadingState, StatusBadge],
  templateUrl: './overtime-records-page.html',
  styleUrl: './overtime-records-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OvertimeRecordsPage {
  private readonly service = inject(OvertimeRecordsService);
  protected readonly statusInfo = OVERTIME_STATUS;
  protected readonly typeInfo = OVERTIME_TYPE;
  protected readonly page = signal(0);
  protected readonly reloadCount = signal(0);
  private readonly request = computed(() => ({ page: this.page(), reload: this.reloadCount() }));
  protected readonly listState = toSignal(
    toObservable(this.request).pipe(switchMap(({ page }) => toLoadState(this.service.listMyOvertimeRecords(page, 10)))),
    { initialValue: { status: 'loading' } as LoadState<OvertimeListResponse> },
  );

  protected readonly formOpen = signal(false);
  protected readonly completing = signal<OvertimeRecordResponse | null>(null);
  protected readonly selected = signal<OvertimeRecordResponse | null>(null);
  protected readonly selectionLoading = signal(false);
  protected readonly selectionError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly success = signal(false);
  protected readonly submitted = signal(false);
  private readonly serverErrors = signal<Record<string, string[]>>({});
  protected readonly form = inject(NonNullableFormBuilder).group({
    type: ['PLANNED' as OvertimeType, Validators.required],
    date: ['', [Validators.required, validDate]],
    startTime: ['', [Validators.required, Validators.pattern(timePattern)]],
    endTime: ['', [Validators.required, Validators.pattern(timePattern)]],
    reason: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(/.*\S.*/)]],
    requestedBy: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(/.*\S.*/)]],
  }, { validators: validSchedule });

  protected reload(): void {
    this.reloadCount.update((value) => value + 1);
  }

  protected goToPage(page: number): void {
    this.page.set(page);
  }

  protected openNew(): void {
    this.form.reset({ type: 'PLANNED', date: '', startTime: '', endTime: '', reason: '', requestedBy: '' });
    this.form.controls.type.enable();
    this.completing.set(null);
    this.selected.set(null);
    this.selectionError.set(null);
    this.saveError.set(null);
    this.serverErrors.set({});
    this.submitted.set(false);
    this.success.set(false);
    this.formOpen.set(true);
    this.scrollToForm();
  }

  protected closeForm(): void {
    if (this.saving()) return;
    this.formOpen.set(false);
    this.completing.set(null);
    this.saveError.set(null);
  }

  protected inspect(id: string, action: 'complete' | 'reason'): void {
    this.selectionLoading.set(true);
    this.selectionError.set(null);
    this.selected.set(null);
    this.formOpen.set(false);
    this.service.getMyOvertimeRecord(id).subscribe({
      next: (record) => {
        this.selectionLoading.set(false);
        if ((action === 'complete' && record.status !== 'PLANNED') || (action === 'reason' && record.status !== 'REJECTED')) {
          this.selectionError.set('El registro no está disponible');
          return;
        }
        if (action === 'reason') {
          this.selected.set(record);
          return;
        }
        this.completing.set(record);
        this.form.reset({ type: 'WORKED', date: record.date, startTime: record.startTime, endTime: record.endTime, reason: record.reason, requestedBy: record.requestedBy });
        this.form.controls.type.disable();
        this.saveError.set(null);
        this.serverErrors.set({});
        this.submitted.set(false);
        this.success.set(false);
        this.formOpen.set(true);
        this.scrollToForm();
      },
      error: (error: unknown) => {
        this.selectionLoading.set(false);
        this.selectionError.set(error instanceof ApiProblemError && error.status === 404 ? 'El registro no está disponible' : 'No pudimos cargar tus horas extras. Intenta nuevamente más tarde.');
      },
    });
  }

  protected errorFor(field: FormField): string {
    const server = this.serverErrors()[field]?.[0];
    if (server) return server;
    const control = this.form.controls[field];
    if (!(control.touched || this.submitted())) return '';
    if (field === 'endTime' && this.form.hasError('schedule')) return 'Ingresa una fecha y un horario válidos.';
    if (!control.invalid) return '';
    if (control.hasError('required') || control.hasError('pattern') && (field === 'reason' || field === 'requestedBy')) return 'Completa este campo.';
    if (control.hasError('date') || control.hasError('pattern')) return 'Ingresa una fecha y un horario válidos.';
    return 'Usa hasta 500 caracteres.';
  }

  protected submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    const value = this.form.getRawValue();
    const current = this.completing();
    this.saving.set(true);
    this.saveError.set(null);
    this.serverErrors.set({});
    const operation = current
      ? this.service.completeMyPlannedOvertime(current.id, { startTime: value.startTime, endTime: value.endTime })
      : this.service.createMyOvertimeRecord({ ...value, reason: value.reason.trim(), requestedBy: value.requestedBy.trim() });
    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.completing.set(null);
        this.success.set(true);
        this.page.set(0);
        this.reload();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.saveError.set('No pudimos registrar tus horas extras. Intenta nuevamente más tarde.');
        if (error instanceof ApiProblemError) this.serverErrors.set(error.fieldErrors);
      },
    });
  }

  private scrollToForm(): void {
    setTimeout(() => document.getElementById('overtime-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }
}
