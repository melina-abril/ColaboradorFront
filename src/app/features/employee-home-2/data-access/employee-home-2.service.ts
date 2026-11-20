import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { Page } from '../../../shared/models/page';
import { AnnouncementFilters, AnnouncementResponse, CalendarResponse } from '../models/employee-home-2.models';
import { getMyAnnouncementMock, getMyCalendarMock, listMyAnnouncementsMock } from './employee-home-2.mock';

@Injectable({ providedIn: 'root' })
export class EmployeeHome2Service {
  private readonly http = inject(HttpClient);

  getMyCalendar(month: number, year: number): Observable<CalendarResponse> {
    if (environment.useMock) return getMyCalendarMock(month, year);
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<CalendarResponse>(apiUrl('/api/employee-homes/calendar'), { params });
  }

  listMyAnnouncements(filters: AnnouncementFilters): Observable<Page<AnnouncementResponse>> {
    if (environment.useMock) return listMyAnnouncementsMock(filters.page, filters.size);
    const params = new HttpParams().set('page', filters.page).set('size', filters.size);
    return this.http.get<Page<AnnouncementResponse>>(apiUrl('/api/employee-homes/announcements'), { params });
  }

  getMyAnnouncement(id: string): Observable<AnnouncementResponse> {
    if (environment.useMock) return getMyAnnouncementMock(id);
    return this.http.get<AnnouncementResponse>(apiUrl(`/api/employee-homes/announcements/${encodeURIComponent(id)}`));
  }
}
