import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'veneto',
        loadComponent: () =>
          import('./pages/veneto/veneto.component').then(m => m.VenetoComponent)
      },
      {
        path: 'malopolska',
        loadComponent: () =>
          import('./pages/malopolska/malopolska.component').then(m => m.MalopolskaComponent)
      }
      
    ]
  }
];
