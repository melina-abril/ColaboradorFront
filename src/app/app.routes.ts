import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'employee-homes' },
  {
    path: 'employee-homes',
    loadChildren: () => import('./features/employee-home/employee-home.routes').then(m => m.EMPLOYEE_HOME_ROUTES)
  },
  {
    path: 'overtime-records',
    loadChildren: () => import('./features/overtime-records/overtime-records.routes').then(m => m.OVERTIME_RECORDS_ROUTES)
  },
  {
    path: 'employee-profiles',
    loadChildren: () => import('./features/employee-profile/employee-profile.routes').then(m => m.EMPLOYEE_PROFILE_ROUTES)
  },
  {
    path: 'employee-benefits',
    loadChildren: () => import('./features/employee-benefits/employee-benefits.routes').then(m => m.EMPLOYEE_BENEFITS_ROUTES)
  },
  { path: '**', redirectTo: '' }
];
