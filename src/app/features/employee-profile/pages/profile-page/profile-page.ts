import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { ApiProblemError, errorMessage } from '../../../../core/http/api-error';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { EmployeeProfileService } from '../../data-access/employee-profile.service';
import { FileDisposition, ProfileResponse } from '../../models/employee-profile.models';

@Component({
  selector: 'app-profile-page',
  imports: [DatePipe, DecimalPipe, RouterLink, ErrorAlert, LoadingState],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly service = inject(EmployeeProfileService);
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => this.reloadCount());
  protected readonly fileError = signal<string | null>(null);
  protected readonly fileBusy = signal(false);
  protected readonly profileState = toSignal(
    toObservable(this.request).pipe(switchMap(() => toLoadState(this.service.getMyProfile()))),
    { initialValue: { status: 'loading' } as LoadState<ProfileResponse> },
  );

  protected reload(): void {
    this.fileError.set(null);
    this.reloadCount.update((count) => count + 1);
  }

  protected contractFile(disposition: FileDisposition, name: string): void {
    if (this.fileBusy()) return;
    this.fileBusy.set(true);
    this.fileError.set(null);
    this.service.getMyContract(disposition).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = disposition === 'attachment' ? name : '';
        if (disposition === 'inline') link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        this.fileBusy.set(false);
      },
      error: (error: unknown) => {
        this.fileBusy.set(false);
        this.fileError.set(error instanceof ApiProblemError && error.status === 404
          ? 'No hay un contrato disponible en tu legajo'
          : disposition === 'inline'
            ? 'No pudimos abrir el contrato. Intenta nuevamente más tarde.'
            : 'No pudimos descargar el contrato. Intenta nuevamente más tarde.');
        console.error(errorMessage(error));
      },
    });
  }
}
