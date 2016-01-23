import { Component } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import 'rxjs/Rx'; // load the full rxjs

import { CharactersDashboardComponent } from './characters/characters-dashboard.component';
import { CharacterService } from './characters/character.service';
import { VehiclesDashboardComponent } from './vehicles/vehicles-dashboard.component';
import { CONFIG } from './config';

@Component({
  selector: 'story-app',
  templateUrl: 'app/app.component.html',
  directives: [ROUTER_DIRECTIVES],
  providers: [
    HTTP_PROVIDERS,
    ROUTER_PROVIDERS,
    CharacterService
  ]
})
@RouteConfig([
  { path: '/characters/...', name: 'CharactersDashboard', component: CharactersDashboardComponent, useAsDefault: true },
  { path: '/vehicles/...', name: 'VehiclesDashboard', component: VehiclesDashboardComponent }
])
export class AppComponent { }
