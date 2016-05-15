import { Component } from '@angular/core';
import 'rxjs/Rx'; // load the full rxjs

import { VehicleService } from './vehicle.service';
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

