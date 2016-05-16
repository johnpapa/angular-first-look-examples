import { Component } from '@angular/core';
import 'rxjs/Observable';

import { Vehicle, VehicleService } from './vehicle.service';
import { VehicleComponent } from './vehicle.component';

@Component({
  moduleId: module.id,
  selector: 'my-vehicle-list',
  templateUrl: 'vehicle-list.component.html',
  styles: ['li {cursor: pointer;} .error {color:red;}'],
  directives: [VehicleComponent]
})
export class VehicleListComponent {
  errorMessage: string;
  selectedVehicle: Vehicle;
  vehicles: Observable<Vehicle[]>;

  constructor(private vehicleService: VehicleService) { }

  ngOnInit() { this.getHeroes(); }

  getHeroes(value?: string) {
    this.vehicles = this.vehicleService.getVehicles(value);
  }

  select(vehicle: Vehicle) {
    this.selectedVehicle = vehicle;
  }
}
