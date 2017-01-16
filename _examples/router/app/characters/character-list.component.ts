import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Character, CharacterService } from './character.service';

@Component({
  moduleId: module.id,
  selector: 'story-characters',
   templateUrl: './character-list.component.html',
  styles: [`
    .characters {list-style-type: none;}
    *.characters li {padding: 4px;cursor: pointer;}
  `]
})
export class CharacterListComponent implements OnInit {
  characters: Observable<Character[]>;

  constructor(private characterService: CharacterService) { }

  ngOnInit() {
    this.characters = this.characterService.getCharacters();
  }
}
