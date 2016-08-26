import { Component } from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { VehicleService } from './vehicle.service';
import { VehicleListComponent } from './vehicle-list.component';

@Component({
  moduleId: module.id,
  selector: 'my-app',
  template: '<my-vehicle-list></my-vehicle-list>',
  directives: [VehicleListComponent],
  providers: [
    HTTP_PROVIDERS,
    VehicleService
  ]
})
export class AppComponent {}
