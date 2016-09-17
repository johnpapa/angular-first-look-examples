import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CharacterComponent } from './character.component';
import { CharacterListComponent } from './character-list.component';
import { CharacterService } from './character.service';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [
    AppComponent,
    CharacterComponent,
    CharacterListComponent
  ],
  providers: [CharacterService],
  bootstrap: [AppComponent],
})
export class AppModule { }
