import { Component, OnInit } from 'angular2/core';

import { Vehicle, VehicleService } from './vehicle.service';

@Component({
  selector: 'story-vehicles',
  templateUrl: './app/vehicles/vehicle-list.component.html',
  styles: [`
    .vehicles {list-style-type: none;}
    *.vehicles li {padding: 4px;cursor: pointer;}
  `]
})
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[];

  constructor(private _vehicleService: VehicleService) { }

  ngOnInit() {
    this.vehicles = [];
    this._vehicleService.getVehicles()
      .subscribe(vehicles => this.vehicles = vehicles);
  }
}
