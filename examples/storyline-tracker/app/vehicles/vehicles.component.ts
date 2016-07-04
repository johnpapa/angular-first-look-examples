import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { VehicleListComponent } from './vehicle-list';
import { VehicleComponent } from './vehicle';
import { VehicleService } from './shared';

@Component({
  selector: 'story-vehicles',
  template: `
    <router-outlet></router-outlet>
  `,
  directives: [ROUTER_DIRECTIVES],
  providers: [VehicleService]
})
export class VehiclesComponent { }
