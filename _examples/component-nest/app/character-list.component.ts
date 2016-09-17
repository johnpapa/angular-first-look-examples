import { Component } from '@angular/core';
import { Character } from './character';

@Component({
  moduleId: module.id,
  selector: 'my-character-list',
  templateUrl: 'character-list.component.html'
})
export class CharacterListComponent {
  characters = [
    new Character(1, 'Han Solo'),
    new Character(2, 'Luke Skywalker'),
    new Character(3, 'BB-8'),
    new Character(4, 'Rey')
  ];
  selectedCharacter: Character;

  select(character: Character) {
    this.selectedCharacter = character;
  }
}

