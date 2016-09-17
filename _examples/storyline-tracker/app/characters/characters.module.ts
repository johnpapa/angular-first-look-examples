import { NgModule } from '@angular/core';

import { CharacterButtonComponent } from './shared/character-button/character-button.component';
import { SortCharactersPipe } from './shared/sort-characters.pipe';
import { CharactersRoutingModule, routedComponents } from './characters.routing';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CharactersRoutingModule, SharedModule],
  declarations: [CharacterButtonComponent, SortCharactersPipe, routedComponents]
})
export class CharactersModule { }
