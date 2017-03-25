import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { VehicleListComponent } from './vehicle-list.component';
import { VehicleService } from './vehicle.service';

@NgModule({
  imports: [BrowserModule, HttpModule],
  declarations: [
    AppComponent,
    VehicleListComponent
  ],
  providers: [VehicleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
