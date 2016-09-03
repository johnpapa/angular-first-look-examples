import { NgModule } from '@angular/core';

import { AdminRoutingModule, routedComponents }   from './admin.routing';

@NgModule({
  imports: [AdminRoutingModule],
  declarations: [routedComponents],
})
export class AdminModule { }

