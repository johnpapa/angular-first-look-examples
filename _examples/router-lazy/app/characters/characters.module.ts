import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CharacterService } from './character.service';
import { charactersRouterModule, routedComponents } from './characters.routing';

@NgModule({
  imports: [CommonModule, FormsModule, charactersRouterModule],
  declarations: [routedComponents],
  providers: [CharacterService],
})
export class CharactersModule { }
