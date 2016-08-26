import { Component, Input, OnInit } from '@angular/core';
import { RouteParams, Router } from '@angular/router-deprecated';

import { Vehicle, VehicleService } from './vehicle.service';

@Component({
  moduleId: module.id,
  selector: 'story-vehicle',
  templateUrl: 'vehicle.component.html'
})
export class VehicleComponent implements OnInit {
  @Input() vehicle: Vehicle;

  constructor(
    private routeParams: RouteParams,
    private router: Router,
    private vehicleService: VehicleService) { }

  ngOnInit() {
    if (!this.vehicle) {
      let id = +this.routeParams.get('id');
      this.vehicleService.getVehicle(id)
        .subscribe((vehicle: Vehicle) => this.setEditVehicle(vehicle));
    }
  }

  private gotoVehicles() {
    let route = ['Vehicles', { id: this.vehicle ? this.vehicle.id : null }];
    this.router.navigate(route);
  }

  private setEditVehicle(vehicle: Vehicle) {
    if (vehicle) {
      this.vehicle = vehicle;
    } else {
      this.gotoVehicles();
    }
  }
}
