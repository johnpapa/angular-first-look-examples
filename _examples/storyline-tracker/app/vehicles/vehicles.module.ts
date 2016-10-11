import { NgModule } from '@angular/core';

import { VehicleButtonComponent } from './shared/vehicle-button/vehicle-button.component';

import { routedComponents, VehiclesRoutingModule } from './vehicles-routing.module';

import { SharedModule } from '../shared/shared.module';
import { VehicleService } from './shared/vehicle.service';  // TODO: Remove this when bug is fixed in A2 RC5

@NgModule({
  imports: [SharedModule, VehiclesRoutingModule],
  declarations: [VehicleButtonComponent, routedComponents],

  // TODO: Remove this when bug is fixed in A2 RC5.
  // We can put this in the component when it is fixed ... or we can do it in the module.
  // In the module, everyone gets it everywhere tho.
  providers: [VehicleService]
})
export class VehiclesModule { }
// avoids having to lazy load with loadChildren: "app/vehicles/vehicle.module#VehicleModule"
