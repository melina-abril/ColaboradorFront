export type CalendarEventType = 'APPROVED_ABSENCE' | 'HOLIDAY';

export interface CalendarEventResponse {
  id: string;
  name: string;
  type: CalendarEventType;
  startDate: string;
  endDate: string;
  days: number | null;
  status: 'APPROVED' | null;
  requestId: string | null;
}

export interface CalendarResponse {
  employeeName: string;
  month: number;
  year: number;
  events: CalendarEventResponse[];
  totalEvents: number;
}

export interface AnnouncementResponse {
  id: string;
  title: string;
  publishedAt: string;
  issuer: string;
  recipients: string;
  text: string;
}

export interface CalendarCell {
  date: string;
  day: number;
  inMonth: boolean;
  events: CalendarEventResponse[];
}

export interface AnnouncementFilters {
  page: number;
  size: number;
}
