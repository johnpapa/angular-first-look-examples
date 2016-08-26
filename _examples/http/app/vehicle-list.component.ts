import { Component } from '@angular/core';
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
  vehicles: Vehicle[];

  constructor(private vehicleService: VehicleService) { }

  getHeroes() {
    this.vehicleService.getVehicles()
      .subscribe(
        vehicles => this.vehicles = vehicles,
        error =>  this.errorMessage = <any>error
    );
  }

  ngOnInit() { this.getHeroes(); }

  select(vehicle: Vehicle) {
    this.selectedVehicle = vehicle;
  }
}

