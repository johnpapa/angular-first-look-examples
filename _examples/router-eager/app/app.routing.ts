import { Routes, RouterModule } from '@angular/router';

import { PageNotFoundComponent } from './page-not-found.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/characters' },
  { path: '**', pathMatch: 'full', component: PageNotFoundComponent },
];

export const routing = RouterModule.forRoot(routes);

export const routableComponents = [PageNotFoundComponent];
