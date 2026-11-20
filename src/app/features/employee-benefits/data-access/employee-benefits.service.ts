import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { EmployeeBenefitsResponse } from '../models/employee-benefits.models';
import { listMyBenefitsMock } from './employee-benefits.mock';

@Injectable({ providedIn: 'root' })
export class EmployeeBenefitsService {
  private readonly http = inject(HttpClient);

  /** El backend identifica el legajo y la empresa exclusivamente mediante la sesión. */
  listMyBenefits(): Observable<EmployeeBenefitsResponse> {
    if (environment.useMock) return listMyBenefitsMock();
    return this.http.get<EmployeeBenefitsResponse>(apiUrl('/api/employee-benefits'), { withCredentials: true });
  }
}
