import { Observable } from 'rxjs';
import { mockResponse } from '../../../core/http/mock-response';
import { EmployeeSummaryResponse } from '../models/employee-home.models';

/** Datos de demostración con la misma estructura que GET /api/employee-homes/summary. */
export function getEmployeeSummaryMock(): Observable<EmployeeSummaryResponse> {
  const summary: EmployeeSummaryResponse = {
    employeeName: 'Sofía Álvarez',
    asOf: '2026-11-20',
    balances: {
      VACATION: {
        category: 'VACATION',
        assignedDays: 20,
        usedDays: 8,
        availableDays: 12,
        asOf: '2026-11-20',
      },
      STUDY: {
        category: 'STUDY',
        assignedDays: 10,
        usedDays: 3,
        availableDays: 7,
        asOf: '2026-11-20',
      },
      RELOCATION: {
        category: 'RELOCATION',
        assignedDays: 2,
        usedDays: 0,
        availableDays: 2,
        asOf: '2026-11-20',
      },
    },
    vacationExpiration: { days: 5, expiresAt: '2026-12-31' },
    latestRequest: {
      id: 'request-demo-1',
      category: 'VACATION',
      startDate: '2026-12-07',
      endDate: '2026-12-11',
      submittedAt: '2026-11-18T10:30:00Z',
      status: 'PENDING',
    },
    nextCalendarEvent: {
      id: 'event-demo-1',
      name: 'Día de la Soberanía Nacional',
      type: 'HOLIDAY',
      eventDate: '2026-11-23',
      requestId: null,
    },
    latestAnnouncement: {
      id: 'announcement-demo-1',
      title: 'Calendario de feriados actualizado',
      summary: 'Ya puedes consultar las próximas fechas en tu calendario.',
      publishedAt: '2026-11-19T09:00:00Z',
    },
  };
  return mockResponse(summary);
}
