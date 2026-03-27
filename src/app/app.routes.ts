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
      
    ]
  }
];
