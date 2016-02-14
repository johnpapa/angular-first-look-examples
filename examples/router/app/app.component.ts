import { Component } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import 'rxjs/Rx'; // load the full rxjs

import { CharacterListComponent } from './characters/character-list.component';
import { CharacterComponent } from './characters/character.component';
import { CharacterService } from './characters/character.service';
import { VehicleListComponent } from './vehicles/vehicle-list.component';
import { VehicleComponent } from './vehicles/vehicle.component';
import { VehicleService } from './vehicles/vehicle.service';
import { CONFIG } from './config';

@Component({
  selector: 'story-app',
  templateUrl: 'app/app.component.html',
  styles: [`
    nav ul {list-style-type: none;}
    nav ul li {padding: 4px;cursor: pointer;display:inline-block}
  `],
  directives: [ROUTER_DIRECTIVES],
  providers: [
    HTTP_PROVIDERS,
    ROUTER_PROVIDERS,
    CharacterService,
    VehicleService
  ]
})
@RouteConfig([
  { path: '/characters', name: 'Characters', component: CharacterListComponent, useAsDefault: true },
  { path: '/characters/:id', name: 'Character', component: CharacterComponent },
  { path: '/vehicles', name: 'Vehicles', component: VehicleListComponent },
	{ path: '/vehicles/:id', name: 'Vehicle', component: VehicleComponent }
  ])
export class AppComponent { }
