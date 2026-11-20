import { BadgeTone } from '../../../shared/components/status-badge';
import { Page } from '../../../shared/models/page';

export type OvertimeType = 'PLANNED' | 'WORKED';
export type OvertimeStatus = 'PLANNED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface OvertimeRecordResponse {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: OvertimeType;
  status: OvertimeStatus;
  durationHours: number;
  reason: string;
  requestedBy: string;
  rejectionReason: string | null;
  reviewedAt: string | null;
}

export interface OvertimeTotalsResponse {
  availableForCompensation: number;
  pendingReview: number;
  plannedHours: number;
}

export interface OvertimeRecordRequest {
  type: OvertimeType;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  requestedBy: string;
}

export interface CompleteOvertimeRequest {
  startTime: string;
  endTime: string;
}

export interface OvertimeListResponse extends Page<OvertimeRecordResponse> {
  totals: OvertimeTotalsResponse;
}

export const OVERTIME_STATUS: Record<OvertimeStatus, { label: string; tone: BadgeTone }> = {
  PLANNED: { label: 'Previstas', tone: 'info' },
  PENDING: { label: 'Pendiente de revisión', tone: 'warning' },
  APPROVED: { label: 'Aprobadas', tone: 'success' },
  REJECTED: { label: 'Rechazadas', tone: 'danger' },
};

export const OVERTIME_TYPE: Record<OvertimeType, string> = {
  PLANNED: 'Prevista',
  WORKED: 'Trabajada',
};
