import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryStoreService } from '../assets/in-memory-store.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
/* Feature Modules */
import { CoreModule } from './core/core.module';
import { LoginModule } from './login/login.module';
import { CharacterService } from './models';
import { PageNotFoundComponent } from './page-not-found.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,

    LoginModule,
    // Routes get loaded in order. It is important that login
    // come before AppRoutingModule, as
    // AppRoutingModule defines the catch-all ** route
    AppRoutingModule,
    CoreModule,
    InMemoryWebApiModule.forRoot(InMemoryStoreService, { delay: 600 })
  ],
  declarations: [AppComponent, PageNotFoundComponent],
  providers: [CharacterService],
  bootstrap: [AppComponent]
})
export class AppModule {}
