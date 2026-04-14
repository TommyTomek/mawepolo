import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/shell/shell.component';
import { authGuard } from './guards/auth.guard';
import { RegionResolver } from './resolvers/region.resolver';

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
        path: 'region/:region',
        loadComponent: () =>
          import('./pages/region-site/region.component').then(m => m.RegionComponent),
        resolve: {
          region: RegionResolver
        },
        canActivate: [authGuard],
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
