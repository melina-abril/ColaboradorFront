import { BadgeTone } from '../../../shared/components/status-badge';

export type LeaveCategory = 'VACATION' | 'STUDY' | 'RELOCATION';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type CalendarEventType = 'HOLIDAY' | 'APPROVED_ABSENCE';

export interface LeaveBalanceResponse {
  category: LeaveCategory;
  assignedDays: number;
  usedDays: number;
  availableDays: number;
  asOf: string;
}

export interface VacationExpirationResponse {
  days: number;
  expiresAt: string;
}

export interface LatestRequestResponse {
  id: string;
  category: LeaveCategory;
  startDate: string;
  endDate: string;
  submittedAt: string;
  status: RequestStatus;
}

export interface NextCalendarEventResponse {
  id: string;
  name: string;
  type: CalendarEventType;
  eventDate: string;
  requestId: string | null;
}

export interface LatestAnnouncementResponse {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
}

export interface EmployeeSummaryResponse {
  employeeName: string;
  asOf: string;
  balances: Record<LeaveCategory, LeaveBalanceResponse | null>;
  vacationExpiration: VacationExpirationResponse | null;
  latestRequest: LatestRequestResponse | null;
  nextCalendarEvent: NextCalendarEventResponse | null;
  latestAnnouncement: LatestAnnouncementResponse | null;
}

export const LEAVE_CATEGORY_LABELS: Record<LeaveCategory, string> = {
  VACATION: 'Vacaciones',
  STUDY: 'Estudio',
  RELOCATION: 'Mudanza',
};

export const REQUEST_STATUS: Record<RequestStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'Pendiente', tone: 'warning' },
  APPROVED: { label: 'Aprobada', tone: 'success' },
  REJECTED: { label: 'Rechazada', tone: 'danger' },
};

export const CALENDAR_EVENT_LABELS: Record<CalendarEventType, string> = {
  HOLIDAY: 'Feriado',
  APPROVED_ABSENCE: 'Ausencia aprobada',
};
