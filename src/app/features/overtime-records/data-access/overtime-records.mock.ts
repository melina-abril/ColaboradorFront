import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { toPage } from '../../../shared/models/page';
import { CompleteOvertimeRequest, OvertimeListResponse, OvertimeRecordRequest, OvertimeRecordResponse, OvertimeTotalsResponse } from '../models/overtime-records.models';

let records: OvertimeRecordResponse[] = [
  { id: 'ot-106', date: '2026-06-18', startTime: '18:00', endTime: '20:00', type: 'PLANNED', status: 'PLANNED', durationHours: 2, reason: 'Cierre mensual de nómina', requestedBy: 'Mariana Torres', rejectionReason: null, reviewedAt: null },
  { id: 'ot-105', date: '2026-06-10', startTime: '18:00', endTime: '20:00', type: 'WORKED', status: 'PENDING', durationHours: 2, reason: 'Cierre mensual de nómina', requestedBy: 'Mariana Torres', rejectionReason: null, reviewedAt: null },
  { id: 'ot-104', date: '2026-06-05', startTime: '17:00', endTime: '20:00', type: 'WORKED', status: 'APPROVED', durationHours: 3, reason: 'Entrega del proyecto', requestedBy: 'Lucía Ramos', rejectionReason: null, reviewedAt: '2026-06-08T14:00:00Z' },
  { id: 'ot-103', date: '2026-05-28', startTime: '18:00', endTime: '19:30', type: 'WORKED', status: 'REJECTED', durationHours: 1.5, reason: 'Jornada extendida', requestedBy: 'Mariana Torres', rejectionReason: 'No se registró autorización previa para la jornada extendida.', reviewedAt: '2026-05-30T11:00:00Z' },
  { id: 'ot-102', date: '2026-05-21', startTime: '18:00', endTime: '20:00', type: 'WORKED', status: 'APPROVED', durationHours: 2, reason: 'Soporte al cierre', requestedBy: 'Lucía Ramos', rejectionReason: null, reviewedAt: '2026-05-23T10:00:00Z' },
  { id: 'ot-101', date: '2026-05-13', startTime: '18:00', endTime: '19:00', type: 'WORKED', status: 'PENDING', durationHours: 1, reason: 'Revisión de reportes', requestedBy: 'Mariana Torres', rejectionReason: null, reviewedAt: null },
];

function duration(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  return ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60;
}

function validSchedule(startTime: string, endTime: string): boolean {
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  return time.test(startTime) && time.test(endTime) && endTime > startTime;
}

function totals(): OvertimeTotalsResponse {
  return records.reduce<OvertimeTotalsResponse>((sum, record) => ({
    availableForCompensation: sum.availableForCompensation + (record.type === 'WORKED' && record.status === 'APPROVED' ? record.durationHours : 0),
    pendingReview: sum.pendingReview + (record.type === 'WORKED' && record.status === 'PENDING' ? record.durationHours : 0),
    plannedHours: sum.plannedHours + (record.status === 'PLANNED' ? record.durationHours : 0),
  }), { availableForCompensation: 0, pendingReview: 0, plannedHours: 0 });
}

export function listMyOvertimeRecordsMock(page: number, size: number): Observable<OvertimeListResponse> {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  return mockResponse({ ...toPage(sorted, page, size), totals: totals() });
}

export function getMyOvertimeRecordMock(id: string): Observable<OvertimeRecordResponse> {
  const record = records.find((item) => item.id === id);
  return record ? mockResponse(record) : mockError(404, 'El registro no está disponible.');
}

export function createMyOvertimeRecordMock(request: OvertimeRecordRequest): Observable<OvertimeRecordResponse> {
  const date = new Date(`${request.date}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(request.date) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== request.date || !validSchedule(request.startTime, request.endTime) || !request.reason.trim() || !request.requestedBy.trim()) {
    return mockError(422, 'Revisa los datos de la carga.');
  }
  const record: OvertimeRecordResponse = {
    ...request,
    id: `ot-${Date.now()}`,
    reason: request.reason.trim(),
    requestedBy: request.requestedBy.trim(),
    status: request.type === 'PLANNED' ? 'PLANNED' : 'PENDING',
    durationHours: duration(request.startTime, request.endTime),
    rejectionReason: null,
    reviewedAt: null,
  };
  records = [record, ...records];
  return mockResponse(record);
}

export function completeMyPlannedOvertimeMock(id: string, request: CompleteOvertimeRequest): Observable<OvertimeRecordResponse> {
  const current = records.find((record) => record.id === id);
  if (!current) return mockError(404, 'El registro no está disponible.');
  if (current.status !== 'PLANNED') return mockError(409, 'Este registro ya no se puede completar.');
  if (!validSchedule(request.startTime, request.endTime)) return mockError(422, 'Ingresa una fecha y un horario válidos.', { endTime: ['Ingresa una fecha y un horario válidos.'] });
  const updated: OvertimeRecordResponse = { ...current, ...request, type: 'WORKED', status: 'PENDING', durationHours: duration(request.startTime, request.endTime) };
  records = records.map((record) => record.id === id ? updated : record);
  return mockResponse(updated);
}
