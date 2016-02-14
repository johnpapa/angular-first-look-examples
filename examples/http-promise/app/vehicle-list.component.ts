import { Component } from 'angular2/core';
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
  vehicles: Promise<Vehicle[]>;
  selectedVehicle: Vehicle;

  constructor(private _vehicleService: VehicleService) { }

  ngOnInit() { this.getHeroes(); }

  getHeroes(value?: string) {
    this.vehicles = this._vehicleService.getVehicles(value);
  }

  select(vehicle: Vehicle) {
    this.selectedVehicle = vehicle;
  }
}

