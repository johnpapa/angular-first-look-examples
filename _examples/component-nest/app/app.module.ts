import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { CharacterComponent } from './character.component';
import { CharacterListComponent } from './character-list.component';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    CharacterComponent,
    CharacterListComponent
  ],
  bootstrap: [CharacterListComponent],
})
export class AppModule { }
