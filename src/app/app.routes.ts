import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'EV Charging Stations',
    loadComponent: () => import('./pages/map/map.page').then((m) => m.MapPage),
  },
  { path: '**', redirectTo: '' },
];
