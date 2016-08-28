import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VehicleService } from './vehicle.service';
import { routing, routedComponents } from './vehicles.routing';

@NgModule({
  imports: [CommonModule, FormsModule, routing],
  declarations: [routedComponents],
  providers: [VehicleService],
})
export class VehiclesModule { }
