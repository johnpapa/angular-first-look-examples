import { NgModule } from '@angular/core';

import { routing, routedComponents } from './login.routing';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [SharedModule, routing],
  declarations: [routedComponents],
})
export class LoginModule { }
