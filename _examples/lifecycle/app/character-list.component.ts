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
  selectedCharacter: Character;

  constructor(private characterService: CharacterService) { }

  clearSelection() {
    this.selectedCharacter = null;
  }

  ngOnInit() {
    this.characters = this.characterService.getCharacters();
  }

  select(character: Character) {
    this.selectedCharacter = character;
  }
}
