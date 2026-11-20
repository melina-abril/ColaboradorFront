import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { Page, toPage } from '../../../shared/models/page';
import { AnnouncementResponse, CalendarEventResponse, CalendarResponse } from '../models/employee-home-2.models';

const announcements: AnnouncementResponse[] = [
  { id: 'a-6', title: 'Inscripción a las capacitaciones de julio', publishedAt: '2026-06-17T10:00:00Z', issuer: 'Recursos Humanos', recipients: 'Todos los colaboradores', text: 'Ya está disponible la inscripción a las capacitaciones internas de julio. Este mes se ofrecerán talleres de comunicación efectiva, seguridad de la información y herramientas de trabajo colaborativo. Puedes consultar los horarios y solicitar tu lugar hasta el 30 de junio a través de Recursos Humanos. Las plazas son limitadas y la confirmación se enviará por correo institucional.' },
  { id: 'a-5', title: 'Actualización de la cobertura médica', publishedAt: '2026-06-03T09:00:00Z', issuer: 'Recursos Humanos', recipients: 'Todos los colaboradores', text: 'A partir de julio se actualizarán los canales de atención de la cobertura médica. Encontrarás los datos vigentes en la sección de beneficios de Mi perfil. Si necesitas asistencia para acceder, comunícate con Recursos Humanos.' },
  { id: 'a-4', title: 'Jornada de bienestar: actividades de junio', publishedAt: '2026-05-22T09:00:00Z', issuer: 'Recursos Humanos', recipients: 'Todos los colaboradores', text: 'Durante junio realizaremos una jornada de bienestar con actividades presenciales y virtuales. Recursos Humanos compartirá los horarios y las indicaciones para participar por correo institucional.' },
  { id: 'a-3', title: 'Recordatorio para actualizar tu perfil técnico', publishedAt: '2026-05-08T09:00:00Z', issuer: 'Recursos Humanos', recipients: 'Todos los colaboradores', text: 'Te invitamos a revisar tu perfil técnico en Mi perfil. Puedes actualizar tus conocimientos y adjuntar los títulos o certificados recientes para que Recursos Humanos los incorpore a tu legajo.' },
  { id: 'a-2', title: 'Consulta de feriados en el calendario personal', publishedAt: '2026-04-17T09:00:00Z', issuer: 'Recursos Humanos', recipients: 'Todos los colaboradores', text: 'Recuerda que en el calendario personal puedes consultar los feriados que te corresponden y tus ausencias aprobadas.' },
  { id: 'a-1', title: 'Cómo consultar el estado de tus solicitudes', publishedAt: '2026-04-02T09:00:00Z', issuer: 'Recursos Humanos', recipients: 'Todos los colaboradores', text: 'En Mis solicitudes puedes consultar los trámites pendientes y revisar el historial de solicitudes resueltas.' },
];

export function getMyCalendarMock(month: number, year: number): Observable<CalendarResponse> {
  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 1900 || year > 2100) {
    return mockError(422, 'Indica un mes y un año válidos.');
  }
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const events: CalendarEventResponse[] = [
    { id: `${prefix}-holiday`, name: 'Feriado aplicable', type: 'HOLIDAY', startDate: `${prefix}-02`, endDate: `${prefix}-02`, days: null, status: null, requestId: null },
    { id: `${prefix}-absence`, name: 'Vacaciones', type: 'APPROVED_ABSENCE', startDate: `${prefix}-13`, endDate: `${prefix}-17`, days: 5, status: 'APPROVED', requestId: '1856' },
  ];
  return mockResponse({ employeeName: 'Sofía Álvarez', month, year, events, totalEvents: events.length });
}

export function listMyAnnouncementsMock(page: number, size: number): Observable<Page<AnnouncementResponse>> {
  if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
    return mockError(422, 'Indica una página válida.');
  }
  return mockResponse(toPage(announcements, page, size));
}

export function getMyAnnouncementMock(id: string): Observable<AnnouncementResponse> {
  const announcement = announcements.find((item) => item.id === id);
  return announcement ? mockResponse(announcement) : mockError(404, 'El comunicado no está disponible.');
}
