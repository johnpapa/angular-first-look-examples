import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';

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
  vehicles: Observable<Vehicle[]>;

  constructor(private vehicleService: VehicleService) { }

  ngOnInit() { this.getVehicles(); }

  getVehicles(value?: string) {
    this.vehicles = this.vehicleService.getVehicles(value);
  }

  select(vehicle: Vehicle) {
    this.selectedVehicle = vehicle;
  }
}
