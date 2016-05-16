import { Component } from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/http';

import { CharacterListComponent } from './characters/character-list.component';
import { CharacterService } from './characters/character.service';
import { VehicleListComponent } from './vehicles/vehicle-list.component';
import { VehicleComponent } from './vehicles/vehicle.component';
import { VehicleService } from './vehicles/vehicle.service';
import { CONFIG } from './config';

@Component({
  moduleId: module.id,
  selector: 'story-app',
  templateUrl: 'app.component.html',
  styles: [`
    nav ul {list-style-type: none;}
    nav ul li {padding: 4px;cursor: pointer;display:inline-block}
  `],
  providers: [
    HTTP_PROVIDERS,
    CharacterService,
    VehicleService
  ]
})
export class AppComponent { }
