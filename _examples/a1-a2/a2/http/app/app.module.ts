import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { VehicleListComponent } from './vehicle-list.component';

@NgModule({
  imports: [BrowserModule, HttpModule],
  declarations: [
    AppComponent,
    VehicleListComponent
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
