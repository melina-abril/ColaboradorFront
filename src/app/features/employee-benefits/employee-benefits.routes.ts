import { Routes } from '@angular/router';

export const EMPLOYEE_BENEFITS_ROUTES: Routes = [
  {
    path: '',
    title: 'Beneficios y saldos',
    loadComponent: () => import('./pages/employee-benefits-page/employee-benefits-page').then((m) => m.EmployeeBenefitsPage),
  },
];
