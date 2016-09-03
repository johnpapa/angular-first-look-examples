import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import './rxjs-extensions';

import { AppComponent } from './app.component';
import { CharactersModule } from './characters/characters.module';
import { AppRoutingModule, routableComponents } from './app.routing';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,

    CharactersModule,
    AppRoutingModule,
  ],
  declarations: [AppComponent, routableComponents],
  bootstrap: [AppComponent]
})
export class AppModule { }
