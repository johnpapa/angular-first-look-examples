import { provideRouter, RouterConfig } from '@angular/router';

import { DashboardRoutes } from './dashboard';
import { CharactersRoutes } from './characters';
import { VehiclesRoutes } from './vehicles';
import { CanDeactivateGuard } from './app.interfaces';

export const routes: RouterConfig = [
  ...DashboardRoutes,
  ...CharactersRoutes,
  ...VehiclesRoutes,
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes),
  CanDeactivateGuard
];
