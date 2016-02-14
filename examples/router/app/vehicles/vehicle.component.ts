import { Component, Input, OnInit } from 'angular2/core';
import { RouteParams, Router } from 'angular2/router';

import { Vehicle, VehicleService } from '../vehicles/vehicle.service';

@Component({
  selector: 'story-vehicle',
  templateUrl: 'app/vehicles/vehicle.component.html'
})
export class VehicleComponent implements OnInit {
  @Input() vehicle: Vehicle;

  constructor(
    private _routeParams: RouteParams,
    private _router: Router,
    private _vehicleService: VehicleService) { }

  ngOnInit() {
    if (!this.vehicle) {
      let id = +this._routeParams.get('id');
      this._vehicleService.getVehicle(id)
        .subscribe((vehicle: Vehicle) => this._setEditVehicle(vehicle));
    }
  }

  private _gotoVehicles() {
    let route = ['Vehicles', { id: this.vehicle ? this.vehicle.id : null }]
    this._router.navigate(route);
  }

  private _setEditVehicle(vehicle: Vehicle) {
    if (vehicle) {
      this.vehicle = vehicle;
    } else {
      this._gotoVehicles();
    }
  }
}
