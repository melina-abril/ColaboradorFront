import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'employee-homes' },
  {
    path: 'employee-homes',
    loadChildren: () => import('./features/employee-home/employee-home.routes').then(m => m.EMPLOYEE_HOME_ROUTES)
  },
  { path: '**', redirectTo: '' }
];
