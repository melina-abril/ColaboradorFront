import { Routes } from '@angular/router';

export const EMPLOYEE_HOME_2_ROUTES: Routes = [
  {
    path: '',
    title: 'Mis ausencias y feriados',
    loadComponent: () => import('./pages/calendar-page/calendar-page').then((m) => m.CalendarPage),
  },
  {
    path: 'announcements',
    title: 'Lectura de comunicados',
    loadComponent: () => import('./pages/announcements-page/announcements-page').then((m) => m.AnnouncementsPage),
  },
  {
    path: 'announcements/:id',
    title: 'Lectura de comunicados',
    loadComponent: () => import('./pages/announcements-page/announcements-page').then((m) => m.AnnouncementsPage),
  },
];
