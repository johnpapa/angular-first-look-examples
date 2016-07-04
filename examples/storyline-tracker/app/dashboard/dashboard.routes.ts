import { RouterConfig }          from '@angular/router';
import { DashboardComponent }     from './dashboard.component';

export const DashboardRoutes: RouterConfig = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard',  component: DashboardComponent },
];
