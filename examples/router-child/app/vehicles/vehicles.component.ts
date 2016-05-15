import { Component, OnInit } from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES } from '@angular/router';

import { VehicleListComponent } from './vehicle-list.component';
import { VehicleComponent } from './vehicle.component';
import { VehicleService } from './vehicle.service';

@Component({
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
