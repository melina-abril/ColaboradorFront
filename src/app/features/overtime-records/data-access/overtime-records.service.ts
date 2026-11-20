import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { CompleteOvertimeRequest, OvertimeListResponse, OvertimeRecordRequest, OvertimeRecordResponse } from '../models/overtime-records.models';
import { completeMyPlannedOvertimeMock, createMyOvertimeRecordMock, getMyOvertimeRecordMock, listMyOvertimeRecordsMock } from './overtime-records.mock';

@Injectable({ providedIn: 'root' })
export class OvertimeRecordsService {
  private readonly http = inject(HttpClient);

  listMyOvertimeRecords(page: number, size: number): Observable<OvertimeListResponse> {
    if (environment.useMock) return listMyOvertimeRecordsMock(page, size);
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<OvertimeListResponse>(apiUrl('/api/overtime-records'), { params });
  }

  getMyOvertimeRecord(id: string): Observable<OvertimeRecordResponse> {
    if (environment.useMock) return getMyOvertimeRecordMock(id);
    return this.http.get<OvertimeRecordResponse>(apiUrl(`/api/overtime-records/${encodeURIComponent(id)}`));
  }

  createMyOvertimeRecord(request: OvertimeRecordRequest): Observable<OvertimeRecordResponse> {
    if (environment.useMock) return createMyOvertimeRecordMock(request);
    return this.http.post<OvertimeRecordResponse>(apiUrl('/api/overtime-records'), request);
  }

  completeMyPlannedOvertime(id: string, request: CompleteOvertimeRequest): Observable<OvertimeRecordResponse> {
    if (environment.useMock) return completeMyPlannedOvertimeMock(id, request);
    return this.http.patch<OvertimeRecordResponse>(apiUrl(`/api/overtime-records/${encodeURIComponent(id)}/complete`), request);
  }
}
