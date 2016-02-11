import { Component } from 'angular2/core';
import { Vehicle, VehicleService } from './vehicle.service';

@Component({
  selector: 'my-vehicle-list',
  templateUrl: 'app/vehicle-list.component.html',
  styles: ['li {cursor: pointer;} .error {color:red;}']
})
export class VehicleListComponent {
  errorMessage: string;
  vehicles: Vehicle[];

  constructor(private _vehicleService: VehicleService) { }

  ngOnInit() { this.getHeroes(); }

  getHeroes() {
    this._vehicleService.getVehicles()
      .subscribe(
        vehicles => this.vehicles = vehicles,
        error =>  this.errorMessage = <any>error
    );
  }
}

