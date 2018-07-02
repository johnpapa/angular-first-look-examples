import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import {
  CharactersRoutingModule,
  routedComponents
} from './characters-routing.module';
import { CharacterButtonComponent } from './shared/character-button/character-button.component';
import { SortCharactersPipe } from './shared/sort-characters.pipe';

@NgModule({
  imports: [CharactersRoutingModule, SharedModule],
  declarations: [CharacterButtonComponent, SortCharactersPipe, routedComponents]
})
export class CharactersModule {}
