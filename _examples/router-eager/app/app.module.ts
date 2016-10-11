import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import './rxjs-extensions';

import { AppComponent } from './app.component';
import { CharactersModule } from './characters/characters.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { AppRoutingModule, routableComponents } from './app-routing.module';

@NgModule({
  imports: [
    BrowserModule,
    CharactersModule,
    FormsModule,
    HttpModule,
    RouterModule,
    VehiclesModule,
    AppRoutingModule
  ],
  declarations: [AppComponent, routableComponents],
  bootstrap: [AppComponent]
})
export class AppModule { }
