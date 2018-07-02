import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule, routableComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { CharactersModule } from './characters/characters.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@NgModule({
  imports: [
    BrowserModule,
    CharactersModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    VehiclesModule,
    AppRoutingModule
  ],
  declarations: [AppComponent, routableComponents],
  bootstrap: [AppComponent]
})
export class AppModule {}
