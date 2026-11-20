import { Routes } from '@angular/router';

export const EMPLOYEE_PROFILE_ROUTES: Routes = [
  {
    path: '',
    title: 'Datos y contrato',
    loadComponent: () => import('./pages/profile-page/profile-page').then((m) => m.ProfilePage),
  },
  {
    path: 'trainings',
    title: 'Perfil técnico',
    loadComponent: () => import('./pages/trainings-page/trainings-page').then((m) => m.TrainingsPage),
  },
];
