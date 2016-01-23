import { Component, OnInit } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES } from 'angular2/router';

import { VehiclesComponent } from './vehicles.component';
import { VehicleDetailComponent } from './vehicle-detail.component';
import { VehicleService } from './vehicle.service';

@Component({
  selector: 'story-vehicle-dashboard',
  template: `
    <router-outlet></router-outlet>
  `,
  directives: [ROUTER_DIRECTIVES],
  providers: [VehicleService]
})
@RouteConfig([
  { path: '/', name: 'VehiclesDashboard', component: VehiclesComponent, useAsDefault: true },
	{ path: '/:id', name: 'VehicleDetail', component: VehicleDetailComponent }
])
export class VehiclesDashboardComponent { }
