import { Component, Input, OnInit } from 'angular2/core';

import { Vehicle, VehicleService } from '../vehicles/vehicle.service';

@Component({
  selector: 'story-vehicle',
  templateUrl: 'app/vehicles/vehicle.component.html'
})
export class VehicleComponent implements OnInit {
  @Input() vehicle: Vehicle;

  constructor(
    private _vehicleService: VehicleService) { }

  ngOnInit() {
    if (!this.vehicle) {
      // let id = +this._routeParams.get('id');
      this._vehicleService.getVehicle(id)
        .subscribe((vehicle: Vehicle) => this.vehicle = vehicle);
    }
  }
}
