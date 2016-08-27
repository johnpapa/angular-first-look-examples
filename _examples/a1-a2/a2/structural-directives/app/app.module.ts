import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';

import { VehiclesComponent } from './vehicles.component';

@NgModule({
  imports: [BrowserModule],
  declarations: [VehiclesComponent],
  bootstrap: [VehiclesComponent],
})
export class AppModule { }
