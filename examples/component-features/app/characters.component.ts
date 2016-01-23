import { Component, EventEmitter, Input, OnInit, Output } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';
import { Observable } from 'rxjs/Rx';

import { Character, CharacterService } from './character.service';
import { CharacterDetailComponent } from './character-detail.component';

@Component({
  selector: 'story-characters',
  templateUrl: './app/characters.component.html',
  // styleUrls: ['./app/characters.component.css'],
  styles: [`
    .characters { list-style-type: none; }
    *.characters li { padding: 4px; }
  `],
  directives: [CharacterDetailComponent],
  providers: [HTTP_PROVIDERS, CharacterService]
})
export class CharactersComponent implements OnInit {
  @Output() changed: EventEmitter<Character>;
  @Input() storyId: number;
  characters: Observable<Character[]>;
  selectedCharacter: Character;

  constructor(private _characterService: CharacterService) {
    this.changed = new EventEmitter();
  }

  ngOnInit() {
    console.log(`Characters Component was provided the story ID = ${this.storyId}`);
    this.characters = this._characterService.getCharacters(this.storyId);
  }

  select(selectedCharacter: Character) {
    this.selectedCharacter = selectedCharacter;
    this.changed.emit(selectedCharacter);
  }
}
