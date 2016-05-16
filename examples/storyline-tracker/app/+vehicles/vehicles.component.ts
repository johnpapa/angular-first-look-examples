import { Component } from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

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
@RouteConfig([
  { path: '/', name: 'Vehicles', component: VehicleListComponent, useAsDefault: true },
  { path: '/:id', name: 'Vehicle', component: VehicleComponent }
])
export class VehiclesComponent { }
