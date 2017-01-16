import { Component } from '@angular/core';

import { Vehicle, VehicleService } from './vehicle.service';

@Component({
  moduleId: module.id,
  selector: 'my-vehicle-list',
   templateUrl: './vehicle-list.component.html',
  styles: ['li {cursor: pointer;} .error {color:red;}']
})
export class VehicleListComponent {
  errorMessage: string;
  selectedVehicle: Vehicle;
  vehicles: Vehicle[];

  constructor(private vehicleService: VehicleService) { }

  getVehicles() {
    this.vehicles = this.vehicleService.getVehicles();
  }

  ngOnInit() { this.getVehicles(); }

  select(vehicle: Vehicle) {
    this.selectedVehicle = vehicle;
  }
}
