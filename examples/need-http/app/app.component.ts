import { Component } from 'angular2/core';

import { Vehicle, VehicleService } from './vehicle.service';
import { VehicleListComponent } from './vehicle-list.component';

@Component({
  selector: 'my-app',
  template: '<my-vehicle-list></my-vehicle-list>',
  directives: [VehicleListComponent],
  providers: [
    VehicleService
  ]
})
export class AppComponent {}

