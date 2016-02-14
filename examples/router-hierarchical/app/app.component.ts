import { Component } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import 'rxjs/Rx'; // load the full rxjs

import { CharactersComponent } from './characters/characters.component';
import { CharacterService } from './characters/character.service';
import { VehiclesComponent } from './vehicles/vehicles.component';
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
    CharacterService
  ]
})
@RouteConfig([
  { path: '/characters/...', name: 'Characters', component: CharactersComponent, useAsDefault: true },
  { path: '/vehicles/...', name: 'Vehicles', component: VehiclesComponent }
])
export class AppComponent { }
