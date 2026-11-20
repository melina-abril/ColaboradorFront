import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { ApiProblemError, errorMessage } from '../../../../core/http/api-error';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { EmployeeProfileService } from '../../data-access/employee-profile.service';
import { FileDisposition, TRAINING_TYPES, TRAINING_TYPE_LABELS, TrainingMimeType, TrainingRequest, TrainingResponse, TrainingType } from '../../models/employee-profile.models';

const validObtainedAt: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value as string;
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { date: true };
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value || value > new Date().toISOString().slice(0, 10)
    ? { date: true }
    : null;
};

type TrainingField = 'type' | 'name' | 'institution' | 'obtainedAt' | 'document';

@Component({
  selector: 'app-trainings-page',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, EmptyState, ErrorAlert, LoadingState],
  templateUrl: './trainings-page.html',
  styleUrl: './trainings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingsPage {
  private readonly service = inject(EmployeeProfileService);
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => this.reloadCount());
  private readonly serverErrors = signal<Record<string, string[]>>({});
  private readonly selectedFile = signal<File | null>(null);
  protected readonly types = TRAINING_TYPES;
  protected readonly typeLabels = TRAINING_TYPE_LABELS;
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly documentError = signal<string | null>(null);
  protected readonly fileBusy = signal(false);
  protected readonly fileTouched = signal(false);
  protected readonly fileError = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    type: ['', Validators.required],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    institution: ['', [Validators.required, Validators.maxLength(200)]],
    obtainedAt: ['', [Validators.required, validObtainedAt]],
  });
  protected readonly trainingsState = toSignal(
    toObservable(this.request).pipe(switchMap(() => toLoadState(this.service.listMyTrainings()))),
    { initialValue: { status: 'loading' } as LoadState<TrainingResponse[]> },
  );

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }

  protected onFileSelected(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    this.selectedFile.set(target.files?.item(0) ?? null);
    this.fileTouched.set(true);
    this.fileError.set(null);
    this.serverErrors.set({});
    this.saved.set(false);
  }

  protected errorFor(field: TrainingField): string {
    const server = this.serverErrors()[field]?.[0];
    if (server) return server;
    if (field === 'document') {
      if (this.fileError()) return this.fileError() ?? '';
      return this.fileTouched() && !this.selectedFile() ? 'Completa este campo.' : '';
    }
    const control = this.form.controls[field];
    if (!control.touched || control.valid) return '';
    if (field === 'type') return control.hasError('required') ? 'Selecciona un tipo de formación válido.' : 'Selecciona un tipo de formación válido.';
    if (field === 'obtainedAt' && control.hasError('date')) return 'Ingresa una fecha de obtención válida.';
    return control.hasError('maxlength') ? 'El texto es demasiado largo.' : 'Completa este campo.';
  }

  protected async submit(fileInput: HTMLInputElement): Promise<void> {
    this.saved.set(false);
    this.saveError.set(null);
    this.serverErrors.set({});
    this.fileTouched.set(true);
    this.form.markAllAsTouched();
    const file = this.selectedFile();
    const allowed: readonly string[] = ['application/pdf', 'image/jpeg', 'image/png'];
    if (file && !allowed.includes(file.type)) this.fileError.set('Adjunta un archivo PDF, JPG o PNG.');
    if (this.form.invalid || !file || this.fileError()) return;
    const values = this.form.getRawValue();
    if (!this.types.some((option) => option.value === values.type)) return;
    this.saving.set(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = '';
      for (let offset = 0; offset < bytes.length; offset += 8192) {
        binary += Array.from(bytes.subarray(offset, offset + 8192), (value) => String.fromCharCode(value)).join('');
      }
      const request: TrainingRequest = {
        type: values.type as TrainingType,
        name: values.name.trim(),
        institution: values.institution.trim(),
        obtainedAt: values.obtainedAt,
        document: { name: file.name, mimeType: file.type as TrainingMimeType, contentBase64: btoa(binary) },
      };
      this.service.createMyTraining(request).subscribe({
        next: () => {
          this.saving.set(false);
          this.saved.set(true);
          this.form.reset({ type: '', name: '', institution: '', obtainedAt: '' });
          this.selectedFile.set(null);
          this.fileTouched.set(false);
          fileInput.value = '';
          this.reload();
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.saveError.set('No pudimos guardar tu formación. Intenta nuevamente más tarde.');
          if (error instanceof ApiProblemError) this.serverErrors.set(error.fieldErrors);
          console.error(errorMessage(error));
        },
      });
    } catch {
      this.saving.set(false);
      this.saveError.set('No pudimos guardar tu formación. Intenta nuevamente más tarde.');
    }
  }

  protected openDocument(training: TrainingResponse, disposition: FileDisposition): void {
    if (!training.documentName || this.fileBusy()) return;
    this.fileBusy.set(true);
    this.documentError.set(null);
    this.service.getMyTrainingDocument(training.id, disposition).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = disposition === 'attachment' ? training.documentName ?? '' : '';
        if (disposition === 'inline') link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        this.fileBusy.set(false);
      },
      error: (error: unknown) => {
        this.fileBusy.set(false);
        this.documentError.set(error instanceof ApiProblemError && error.status === 404
          ? 'El documento no está disponible'
          : 'No pudimos abrir el documento. Intenta nuevamente más tarde.');
      },
    });
  }
}
