import { Component } from '@angular/core';
import { Character, CharacterService } from './character.service';
import { CharacterComponent } from './character.component';

@Component({
  moduleId: module.id,
  selector: 'my-character-list',
  templateUrl: 'character-list.component.html',
  styles: ['li {cursor: pointer;}'],
  directives: [CharacterComponent]
})
export class CharacterListComponent {
  characters: Character[];
  messages: string[] = [];
  selectedCharacter: Character;

  constructor(private characterService: CharacterService) {
    this.characters = this.characterService.getCharacters();
  }

  select(character: Character) {
    this.selectedCharacter = character;
  }
}

