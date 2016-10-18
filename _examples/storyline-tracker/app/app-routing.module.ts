import { NgModule } from '@angular/core';
import { PreloadAllModules, Routes, RouterModule } from '@angular/router';

import { AuthGuard, CanDeactivateGuard, UserProfileService } from './core';
import { PageNotFoundComponent } from './page-not-found.component';

/***************************************************************
* Lazy Loading to Eager Loading
*
* 1. Remove the module and NgModule imports in `app.module.ts`
*
* 2. Remove the lazy load route from `app.routing.ts`
*
* 3. Change the module's default route path from '' to 'pathname'
*****************************************************************/
const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard', },
  {
    path: 'admin',
    loadChildren: 'app/admin/admin.module#AdminModule',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    canLoad: [AuthGuard],
  },
  { path: 'dashboard', loadChildren: 'app/dashboard/dashboard.module#DashboardModule' },
  { path: 'characters', loadChildren: 'app/characters/characters.module#CharactersModule' },
  { path: 'vehicles', loadChildren: 'app/vehicles/vehicles.module#VehiclesModule' },
  { path: '**', pathMatch: 'full', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: [
    AuthGuard,
    CanDeactivateGuard,
    UserProfileService
  ]
})
export class AppRoutingModule { }
