import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';

import { CharacterComponent } from './character.component';

@NgModule({
  imports: [BrowserModule],
  declarations: [CharacterComponent],
  bootstrap: [CharacterComponent],
})
export class AppModule { }
