import { Component, OnInit } from '@angular/core';
import { Character, CharacterService } from './character.service';
import { CharacterComponent } from './character.component';

@Component({
  selector: 'my-character-list',
  templateUrl: 'app/character-list.component.html',
  styles: ['li {cursor: pointer;}'],
  directives: [CharacterComponent]
})
export class CharacterListComponent implements OnInit {
  selectedCharacter: Character;
  characters: Character[] = [];
  messages: string[] = [];

  constructor(private _characterService: CharacterService) { }

  ngOnInit() {
    this.characters = this._characterService.getCharacters();
  }

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

