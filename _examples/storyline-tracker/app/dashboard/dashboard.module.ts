import { NgModule } from '@angular/core';

import { DashboardButtonComponent } from './shared/dashboard-button/dashboard-button.component';
import { routing, routedComponents } from './dashboard.routing';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [routing, SharedModule],
  declarations: [DashboardButtonComponent, routedComponents]
})
export class DashboardModule { }
