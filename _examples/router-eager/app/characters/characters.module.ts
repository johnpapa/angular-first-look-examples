import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CharacterService } from './character.service';
import { routing, routedComponents } from './characters.routing';

@NgModule({
  imports: [CommonModule, FormsModule, routing],
  exports: [],
  declarations: [routedComponents],
  providers: [CharacterService],
})
export class CharactersModule { }
