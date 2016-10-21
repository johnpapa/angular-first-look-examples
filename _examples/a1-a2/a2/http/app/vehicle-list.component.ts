import { Component } from '@angular/core';
import { Vehicle, VehicleService } from './vehicle.service';

@Component({
  moduleId: module.id,
  selector: 'my-vehicle-list',
  templateUrl: 'vehicle-list.component.html',
  styles: ['li {cursor: pointer;} .error {color:red;}']
})
export class VehicleListComponent {
  errorMessage: string;
  vehicles: Vehicle[];

  constructor(private _vehicleService: VehicleService) { }

  getVehicles() {
    this._vehicleService.getVehicles()
      .subscribe(
        vehicles => this.vehicles = vehicles,
        error =>  this.errorMessage = <any>error
    );
  }

  ngOnInit() { this.getVehicles(); }
}

