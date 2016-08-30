import { Routes, RouterModule } from '@angular/router';

import { PageNotFoundComponent } from './page-not-found.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/characters' },
  { path: 'vehicles', loadChildren: 'app/vehicles/vehicles.module#VehiclesModule' },
  { path: '**', pathMatch: 'full', component: PageNotFoundComponent },
];

export const appRouterModule = RouterModule.forRoot(routes);

export const routableComponents = [PageNotFoundComponent];
