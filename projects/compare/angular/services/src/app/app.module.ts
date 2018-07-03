import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { VehicleService } from './vehicle.service';
import { VehiclesComponent } from './vehicles.component';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [VehiclesComponent],
  providers: [VehicleService],
  bootstrap: [VehiclesComponent]
})
export class AppModule {}
