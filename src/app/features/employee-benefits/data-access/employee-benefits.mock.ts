import { Observable } from 'rxjs';
import { mockResponse } from '../../../core/http/mock-response';
import { EmployeeBenefitsResponse } from '../models/employee-benefits.models';

/** Los saldos del modo demostración tienen exactamente la forma de la respuesta del backend. */
export function listMyBenefitsMock(): Observable<EmployeeBenefitsResponse> {
  return mockResponse({
    asOf: new Date().toISOString(),
    benefits: [
      { id: 'vacations', category: 'VACATION', name: 'Vacaciones', unit: 'DAYS', assigned: 20, used: 8, available: 12, expiresAt: '2026-12-31' },
      { id: 'study', category: 'STUDY', name: 'Días de estudio', unit: 'DAYS', assigned: 10, used: 2, available: 8, expiresAt: '2026-12-31' },
      { id: 'moving', category: 'MOVING', name: 'Días por mudanza', unit: 'DAYS', assigned: 1, used: 0, available: 1, expiresAt: null },
      { id: 'wellness', category: 'BONUS', name: 'Bono de bienestar', unit: 'ARS', assigned: 120000, used: 35000, available: 85000, expiresAt: '2026-12-31' },
      { id: 'connectivity', category: 'BONUS', name: 'Bono de conectividad', unit: 'ARS', assigned: 60000, used: 45000, available: 15000, expiresAt: '2026-12-31' },
    ],
  });
}
