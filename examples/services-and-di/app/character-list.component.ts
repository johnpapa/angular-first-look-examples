import { Component } from '@angular/core';
import { Character, CharacterService } from './character.service';
import { CharacterComponent } from './character.component';

@Component({
  selector: 'my-character-list',
  templateUrl: 'app/character-list.component.html',
  styles: ['li {cursor: pointer;}'],
  directives: [CharacterComponent]
})
export class CharacterListComponent {
  selectedCharacter: Character;
  characters: Character[];
  messages: string[] = [];

  constructor(private _characterService: CharacterService) {
    this.characters = this._characterService.getCharacters();
  }

  select(character: Character) {
    this.selectedCharacter = character;
  }
}

