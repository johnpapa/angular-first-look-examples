import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'my-vehicles',
  templateUrl: 'vehicles.component.html',
})
export class VehiclesComponent {
  vehicles = this.vehicleService.getVehicles();

  constructor(private vehicleService: VehicleService) { }
}
