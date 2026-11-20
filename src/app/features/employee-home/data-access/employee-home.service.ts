import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { EmployeeSummaryResponse } from '../models/employee-home.models';
import { getEmployeeSummaryMock } from './employee-home.mock';

@Injectable({ providedIn: 'root' })
export class EmployeeHomeService {
  private readonly http = inject(HttpClient);

  /** GET /api/employee-homes/summary; la identidad la determina la sesión del backend. */
  getEmployeeSummary(): Observable<EmployeeSummaryResponse> {
    if (environment.useMock) return getEmployeeSummaryMock();
    return this.http.get<EmployeeSummaryResponse>(apiUrl('/employee-homes/summary'));
  }
}
