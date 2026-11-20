import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { FileDisposition, ProfileResponse, TrainingRequest, TrainingResponse } from '../models/employee-profile.models';
import { createMyTrainingMock, getMyContractMock, getMyProfileMock, getMyTrainingDocumentMock, listMyTrainingsMock } from './employee-profile.mock';

@Injectable({ providedIn: 'root' })
export class EmployeeProfileService {
  private readonly http = inject(HttpClient);

  getMyProfile(): Observable<ProfileResponse> {
    return environment.useMock ? getMyProfileMock() : this.http.get<ProfileResponse>(apiUrl('/api/employee-profiles/me'));
  }

  getMyContract(disposition: FileDisposition): Observable<Blob> {
    if (environment.useMock) return getMyContractMock();
    return this.http.get(apiUrl('/api/employee-profiles/me/contract'), {
      params: new HttpParams().set('disposition', disposition),
      responseType: 'blob',
    });
  }

  listMyTrainings(): Observable<TrainingResponse[]> {
    return environment.useMock ? listMyTrainingsMock() : this.http.get<TrainingResponse[]>(apiUrl('/api/employee-profiles/me/trainings'));
  }

  createMyTraining(request: TrainingRequest): Observable<TrainingResponse> {
    return environment.useMock ? createMyTrainingMock(request) : this.http.post<TrainingResponse>(apiUrl('/api/employee-profiles/me/trainings'), request);
  }

  getMyTrainingDocument(id: string, disposition: FileDisposition): Observable<Blob> {
    if (environment.useMock) return getMyTrainingDocumentMock(id);
    return this.http.get(apiUrl(`/api/employee-profiles/me/trainings/${encodeURIComponent(id)}/document`), {
      params: new HttpParams().set('disposition', disposition),
      responseType: 'blob',
    });
  }
}
