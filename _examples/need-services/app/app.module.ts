import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CharacterComponent } from './character.component';
import { CharacterListComponent } from './character-list.component';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [
    AppComponent,
    CharacterComponent,
    CharacterListComponent
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
