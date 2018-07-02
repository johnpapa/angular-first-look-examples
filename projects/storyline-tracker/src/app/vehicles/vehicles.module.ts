import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { VehicleButtonComponent } from './shared/vehicle-button/vehicle-button.component';
import { VehicleService } from './shared/vehicle.service';
import {
  routedComponents,
  VehiclesRoutingModule
} from './vehicles-routing.module';

@NgModule({
  imports: [SharedModule, VehiclesRoutingModule],
  declarations: [VehicleButtonComponent, routedComponents],
  providers: [VehicleService]
})
export class VehiclesModule {}
// avoids having to lazy load with loadChildren: "app/vehicles/vehicle.module#VehicleModule"
