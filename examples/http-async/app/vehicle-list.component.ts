import { Component } from 'angular2/core';
import { Observable } from 'rxjs/Rx';

import { Vehicle, VehicleService } from './vehicle.service';
import { VehicleComponent } from './vehicle.component';

@Component({
  selector: 'my-vehicle-list',
  templateUrl: 'app/vehicle-list.component.html',
  styles: ['li {cursor: pointer;} .error {color:red;}'],
  directives: [VehicleComponent]
})
export class VehicleListComponent {
  errorMessage: string;
  vehicles: Observable<Vehicle[]>;
  selectedVehicle: Vehicle;

  constructor(private _vehicleService: VehicleService) { }

  ngOnInit() { this.getHeroes(); }

  getHeroes() {
    this.vehicles = this._vehicleService.getVehicles();
  }

  select(vehicle: Vehicle) {
    this.selectedVehicle = vehicle;
  }
}

