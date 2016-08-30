import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import './rxjs-extensions';

import { AppComponent } from './app.component';
import { CharactersModule } from './characters/characters.module';
import { appRouterModule, routableComponents } from './app.routing';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,

    CharactersModule,
    appRouterModule,
  ],
  declarations: [AppComponent, ...routableComponents],
  bootstrap: [AppComponent]
})
export class AppModule { }
