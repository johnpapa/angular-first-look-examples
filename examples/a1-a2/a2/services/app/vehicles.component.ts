import { Component } from 'angular2/core';

import { VehicleService } from './vehicle.service';

@Component({
  selector: 'my-vehicles',
  templateUrl: 'app/vehicles.component.html',
  providers: [VehicleService]
})
export class VehiclesComponent {
  constructor(
    private _vehicleService: VehicleService) { }
  vehicles = this._vehicleService.getVehicles();
}



