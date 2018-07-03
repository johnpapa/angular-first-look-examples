import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { VehicleListComponent } from './vehicle-list.component';
import { VehicleService } from './vehicle.service';

@NgModule({
  imports: [BrowserModule, HttpClientModule],
  declarations: [AppComponent, VehicleListComponent],
  providers: [VehicleService],
  bootstrap: [AppComponent]
})
export class AppModule {}
