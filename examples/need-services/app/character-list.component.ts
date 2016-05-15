import { Component } from '@angular/core';
import { Character } from './character';
import { CharacterComponent } from './character.component';

@Component({
  selector: 'my-character-list',
  templateUrl: 'app/character-list.component.html',
  styles: ['li {cursor: pointer;}'],
  directives: [CharacterComponent]
})
export class CharacterListComponent {
  selectedCharacter: Character;
  characters = [
    new Character(1, 'Han Solo', 'light'),
    new Character(2, 'Luke Skywalker', 'light'),
    new Character(3, 'Kylo', 'dark'),
    new Character(4, 'Rey', 'light')
  ];
  messages: string[] = [];

  select(character: Character) {
    this.selectedCharacter = character;
  }
}

