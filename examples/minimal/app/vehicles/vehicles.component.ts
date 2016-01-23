import { Component, OnInit } from 'angular2/core';
import { ROUTER_DIRECTIVES } from 'angular2/router';

import { Vehicle, VehicleService } from './vehicle.service';

@Component({
  selector: 'story-vehicles',
  templateUrl: './app/vehicles/vehicles.component.html',
  directives: [ROUTER_DIRECTIVES]
})
export class VehiclesComponent implements OnInit {
  vehicles: Vehicle[];

  constructor(private _vehicleService: VehicleService) { }

  ngOnInit() {
    this.vehicles = [];
    this._vehicleService.getVehicles()
      .subscribe(vehicles => this.vehicles = vehicles);
  }
}
