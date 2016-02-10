import { Component, OnInit } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';
import { Character, CharacterService } from './character.service';
import { CharacterComponent } from './character.component';

@Component({
  selector: 'my-character-list',
  templateUrl: 'app/character-list.component.html',
  directives: [CharacterComponent],
  providers: [HTTP_PROVIDERS, CharacterService]
})
export class CharacterListComponent implements OnInit {
  selectedCharacter: Character;
  characters: Character[] = [];
  // characters = [
  //   new Character(1, 'Han Solo', 'light'),
  //   new Character(2, 'Luke Skywalker', 'light'),
  //   new Character(3, 'Kylo', 'dark'),
  //   new Character(4, 'Rey', 'light')
  // ];
  messages: string[] = [];

  constructor(private _characterService: CharacterService) { }

  ngOnInit() {
    this._characterService.getCharacters()
      .subscribe(characters => this.characters = characters);
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

