import { Component } from '@angular/core';

import { VehicleService } from './vehicle.service';

@Component({
  moduleId: module.id,
  selector: 'my-app',
  template: '<my-vehicle-list></my-vehicle-list>',
  providers: [VehicleService]
})
export class AppComponent {}
