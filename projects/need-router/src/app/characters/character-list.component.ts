import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Character, CharacterService } from './character.service';

@Component({
  selector: 'story-characters',
  templateUrl: './character-list.component.html',
  styles: [
    `
      .characters {
        list-style-type: none;
      }
      *.characters li {
        padding: 4px;
        cursor: pointer;
      }
    `
  ]
})
export class CharacterListComponent implements OnInit {
  characters: Observable<Character[]>;

  constructor(private characterService: CharacterService) {}

  ngOnInit() {
    this.characters = this.characterService.getCharacters();
  }
}
