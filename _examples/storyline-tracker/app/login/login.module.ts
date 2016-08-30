import { NgModule } from '@angular/core';

import { loginRouterModule, routedComponents } from './login.routing';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [loginRouterModule, SharedModule],
  declarations: [routedComponents],
})
export class LoginModule { }
