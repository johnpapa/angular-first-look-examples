import { Component } from '@angular/core';
import { Routes, ROUTER_DIRECTIVES } from '@angular/router';

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
@Routes([
  { path: '/', component: VehicleListComponent },
  { path: '/list/:id', component: VehicleListComponent },
  { path: '/:id', component: VehicleComponent }
])
export class VehiclesComponent { }
