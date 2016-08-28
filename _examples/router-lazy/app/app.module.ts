import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import './rxjs-extensions';

import { AppComponent } from './app.component';
import { CharactersModule } from './characters/characters.module';
import { routing, routableComponents } from './app.routing';

@NgModule({
  imports: [
    BrowserModule,
    CharactersModule,
    FormsModule,
    HttpModule,
    RouterModule,
    routing
  ],
  declarations: [AppComponent, ...routableComponents],
  bootstrap: [AppComponent]
})
export class AppModule { }
