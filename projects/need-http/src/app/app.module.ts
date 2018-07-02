import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { VehicleListComponent } from './vehicle-list.component';
import { VehicleComponent } from './vehicle.component';
import { VehicleService } from './vehicle.service';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, VehicleComponent, VehicleListComponent],
  providers: [VehicleService],
  bootstrap: [AppComponent]
})
export class AppModule {}
