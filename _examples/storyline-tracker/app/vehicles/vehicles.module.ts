import { NgModule } from '@angular/core';

import { VehicleButtonComponent } from './shared/vehicle-button/vehicle-button.component';

import { routedComponents, VehiclesRoutingModule } from './vehicles-routing.module';

import { SharedModule } from '../shared/shared.module';
import { VehicleService } from './shared/vehicle.service'; 

@NgModule({
  imports: [SharedModule, VehiclesRoutingModule],
  declarations: [VehicleButtonComponent, routedComponents],
  providers: [VehicleService]
})
export class VehiclesModule { }
// avoids having to lazy load with loadChildren: "app/vehicles/vehicle.module#VehicleModule"
