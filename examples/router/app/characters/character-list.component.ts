import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { Character, CharacterService } from './character.service';

@Component({
  selector: 'story-characters',
  templateUrl: './app/characters/character-list.component.html',
  styles: [`
    .characters {list-style-type: none;}
    *.characters li {padding: 4px;cursor: pointer;}
  `],
  directives: [ROUTER_DIRECTIVES]
})
export class CharacterListComponent implements OnInit {
  characters: Observable<Character[]>;

  constructor(private _characterService: CharacterService) { }

  ngOnInit() {
    this.characters = this._characterService.getCharacters();
  }
}
