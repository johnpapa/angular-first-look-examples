import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { LoginRoutingModule, routedComponents } from './login-routing.module';

@NgModule({
  imports: [LoginRoutingModule, SharedModule],
  declarations: [routedComponents]
})
export class LoginModule {}
