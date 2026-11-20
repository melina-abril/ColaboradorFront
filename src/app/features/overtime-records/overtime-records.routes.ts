import { Routes } from '@angular/router';

export const OVERTIME_RECORDS_ROUTES: Routes = [
  {
    path: '',
    title: 'Horas extras',
    loadComponent: () => import('./pages/overtime-records-page/overtime-records-page').then((m) => m.OvertimeRecordsPage),
  },
];
