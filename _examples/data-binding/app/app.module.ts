import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { CharacterComponent } from './character.component';
import { CharacterSolvedComponent } from './solution/character-solved.component';

@NgModule({
  imports: [BrowserModule, FormsModule, HttpModule],
  declarations: [
    AppComponent,
    CharacterComponent,
    CharacterSolvedComponent
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
