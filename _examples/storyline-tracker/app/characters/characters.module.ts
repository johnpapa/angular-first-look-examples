import { NgModule } from '@angular/core';

import { CharacterButtonComponent } from './shared/character-button/character-button.component';
import { SortCharactersPipe } from './shared/sort-characters.pipe';
import { charactersRouterModule, routedComponents } from './characters.routing';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [charactersRouterModule, SharedModule],
  declarations: [CharacterButtonComponent, SortCharactersPipe, routedComponents]
})
export class CharactersModule { }
