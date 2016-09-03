import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VehicleService } from './vehicle.service';
import { vehiclesRouterModule, routedComponents } from './vehicles.routing';

@NgModule({
  imports: [CommonModule, FormsModule, vehiclesRouterModule],
  declarations: [routedComponents],
  providers: [VehicleService],
})
export class VehiclesModule { }
