import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import {
  DashboardRoutingModule,
  routedComponents
} from './dashboard-routing.module';
import { DashboardButtonComponent } from './shared/dashboard-button/dashboard-button.component';

@NgModule({
  imports: [DashboardRoutingModule, SharedModule],
  declarations: [DashboardButtonComponent, routedComponents]
})
export class DashboardModule {}
