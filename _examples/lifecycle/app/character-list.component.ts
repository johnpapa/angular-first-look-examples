import { Component, OnInit } from '@angular/core';

import { Character, CharacterService } from './character.service';

@Component({
  moduleId: module.id,
  selector: 'my-character-list',
  templateUrl: 'character-list.component.html',
  styles: ['li {cursor: pointer;}']
})
export class CharacterListComponent implements OnInit {
  characters: Character[] = [];
  messages: string[] = [];
  selectedCharacter: Character;

  constructor(private characterService: CharacterService) { }

  clear() {
    this.selectedCharacter = null;
  }

  log(msg: string) {
    this.messages.splice(0, 0, msg);
    console.log(msg);
  }

  ngOnInit() {
    this.characters = this.characterService.getCharacters();
  }

  select(character: Character) {
    this.selectedCharacter = character;
  }
}
