import { Routes } from '@angular/router';

export const EMPLOYEE_HOME_ROUTES: Routes = [
  {
    path: '',
    title: 'Inicio del colaborador',
    loadComponent: () => import('./pages/employee-home-page/employee-home-page').then((m) => m.EmployeeHomePage),
  },
];
