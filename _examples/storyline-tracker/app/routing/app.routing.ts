import { Routes, RouterModule } from '@angular/router';

import { CanActivateAuthGuard } from './can-activate-auth.service';
import { CanDeactivateGuard } from './can-deactivate.service';
import { UserProfileService } from '../core';
import { PageNotFoundComponent } from '../page-not-found.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    loadChildren: 'app/dashboard/dashboard.module#DashboardModule'
  },
  {
    path: 'characters',
    loadChildren: 'app/characters/characters.module#CharactersModule',
    canActivate: [CanActivateAuthGuard],
    // canLoad: [CanActivateAuthGuard],
  },
  {
    path: 'vehicles',
    loadChildren: 'app/vehicles/vehicles.module#VehiclesModule',
    canActivate: [CanActivateAuthGuard],
    // canLoad: [CanActivateAuthGuard],
  },
  {
    path: '**',
    pathMatch: 'full',
    component: PageNotFoundComponent
  },
];

export const routing = RouterModule.forRoot(routes);

routing.providers.push([
  CanActivateAuthGuard,
  CanDeactivateGuard,
  UserProfileService
]);