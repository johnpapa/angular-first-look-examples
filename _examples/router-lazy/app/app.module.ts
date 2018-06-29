import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule, routableComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { CharactersModule } from './characters/characters.module';
import './rxjs-extensions';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,

    CharactersModule,
    AppRoutingModule
  ],
  declarations: [AppComponent, routableComponents],
  bootstrap: [AppComponent]
})
export class AppModule {}
