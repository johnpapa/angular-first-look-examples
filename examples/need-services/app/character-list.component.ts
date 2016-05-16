import { Component } from '@angular/core';
import { Character } from './character';
import { CharacterComponent } from './character.component';

@Component({
  moduleId: module.id,
  selector: 'my-character-list',
  templateUrl: 'character-list.component.html',
  styles: ['li {cursor: pointer;}'],
  directives: [CharacterComponent]
})
export class CharacterListComponent {
  characters = [
    new Character(1, 'Han Solo', 'light'),
    new Character(2, 'Luke Skywalker', 'light'),
    new Character(3, 'Kylo', 'dark'),
    new Character(4, 'Rey', 'light')
  ];
  messages: string[] = [];
  selectedCharacter: Character;

  select(character: Character) {
    this.selectedCharacter = character;
  }
}

