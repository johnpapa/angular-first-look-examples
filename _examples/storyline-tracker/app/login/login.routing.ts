import { Routes, RouterModule } from '@angular/router';

import { LoginComponent }     from './login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent }
];

export const loginRouterModule = RouterModule.forChild(routes);

export const routedComponents = [LoginComponent];
