import { Component } from '@angular/core';
import { VehicleService } from './vehicle.service';


@Component({

  selector: 'my-vehicles',
   templateUrl: './vehicles.component.html',
})
export class VehiclesComponent {
  vehicles = this.vehicleService.getVehicles();

  constructor(private vehicleService: VehicleService) { }
}
