import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import './rxjs-extensions';

import { AppComponent } from './app.component';
import { CharacterListComponent } from './characters/character-list.component';
import { CharacterService } from './characters/character.service';
import { VehicleListComponent } from './vehicles/vehicle-list.component';
import { VehicleComponent } from './vehicles/vehicle.component';
import { VehicleService } from './vehicles/vehicle.service';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [
    AppComponent,
    CharacterListComponent,
    VehicleListComponent,
    VehicleComponent
  ],
  providers: [
    CharacterService,
    VehicleService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
