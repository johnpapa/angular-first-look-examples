import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule, routableComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { CanActivateAuthGuard } from './can-activate.service';
import { CharacterService } from './characters/character.service';
import { UserProfileService } from './login/user-profile.service';
import { VehicleService } from './vehicles/vehicle.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule
  ],
  declarations: [AppComponent, routableComponents],
  providers: [
    CanActivateAuthGuard,
    CharacterService,
    UserProfileService,
    VehicleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
