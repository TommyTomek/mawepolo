import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/shell/shell.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'veneto',
        loadComponent: () =>
          import('./pages/veneto/veneto.component').then(m => m.VenetoComponent),
          canActivate: [authGuard],
      },
      {
        path: 'malopolska',
        loadComponent: () =>
          import('./pages/malopolska/malopolska.component').then(m => m.MalopolskaComponent)
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/register/register').then(m => m.Register)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword)
      }
    ]
  }
];
