import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { CharacterComponent } from './character.component';
import { CharactersComponent } from './characters.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule
  ],
  declarations: [
    AppComponent,
    CharacterComponent,
    CharactersComponent
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
