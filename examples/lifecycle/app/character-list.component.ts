import { Component } from 'angular2/core';
import { Character } from './character';
import { CharacterComponent } from './character.component';

@Component({
  selector: 'my-character-list',
  templateUrl: 'app/character-list.component.html',
  directives: [CharacterComponent]
})
export class CharacterListComponent {
  selectedCharacter: Character;
  characters = [
    new Character(1, 'Han Solo'),
    new Character(2, 'Luke Skywalker'),
    new Character(3, 'BB-8'),
    new Character(4, 'Rey')
  ];
  messages: string[] = [];

  select(character: Character) {
    this.selectedCharacter = character;
  }
  clear() {
    this.selectedCharacter = null;
  }

  log(msg: string) {
    this.messages.splice(0, 0, msg);
    console.log(msg);
  }
}

