import { Component } from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

import { VehicleListComponent } from './vehicle-list.component';
import { VehicleComponent } from './vehicle.component';
import { VehicleService } from './vehicle.service';

@Component({
  moduleId: module.id,
  selector: 'story-vehicles-root',
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
