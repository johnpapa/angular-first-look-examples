import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import './rxjs-extensions';

import { AppComponent } from './app.component';
import { VehicleComponent } from './vehicle.component';
import { VehicleListComponent } from './vehicle-list.component';


@NgModule({
  imports: [BrowserModule, FormsModule, HttpModule],
  declarations: [
    AppComponent,
    VehicleComponent,
    VehicleListComponent
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
