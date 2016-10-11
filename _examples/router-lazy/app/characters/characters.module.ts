import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CharacterService } from './character.service';
import { CharactersRouterModule, routedComponents } from './characters-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, CharactersRouterModule],
  declarations: [routedComponents],
  providers: [CharacterService],
})
export class CharactersModule { }
