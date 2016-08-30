import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
];

export const dashboardRouterModule = RouterModule.forChild(routes);

// export const routedComponents = routes.filter(r => r.component !== undefined).map(r => r.component);
export const routedComponents = [DashboardComponent];
