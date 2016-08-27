import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { VehiclesComponent } from './vehicles.component';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [VehiclesComponent],
  bootstrap: [VehiclesComponent],
})
export class AppModule { }
