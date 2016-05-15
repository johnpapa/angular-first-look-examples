import { Component } from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/http';

import { Vehicle, VehicleService } from './vehicle.service';
import { VehicleListComponent } from './vehicle-list.component';

@Component({
  selector: 'my-app',
  template: '<my-vehicle-list></my-vehicle-list>',
  directives: [VehicleListComponent],
  providers: [
    HTTP_PROVIDERS,
    VehicleService
  ]
})
export class AppComponent {}

