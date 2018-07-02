import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule, routableComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { CharacterService } from './characters/character.service';
import { VehicleService } from './vehicles/vehicle.service';

@NgModule({
  imports: [BrowserModule, FormsModule, HttpClientModule, AppRoutingModule],
  declarations: [AppComponent, routableComponents],
  providers: [CharacterService, VehicleService],
  bootstrap: [AppComponent]
})
export class AppModule {}
