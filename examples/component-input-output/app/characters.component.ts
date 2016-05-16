import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Character, CharacterService } from './character.service';
import { CharacterComponent } from './character.component';

@Component({
  moduleId: module.id,
  selector: 'story-characters',
  templateUrl: 'characters.component.html',
  styleUrls: ['characters.component.css'],
  directives: [CharacterComponent],
  providers: [CharacterService]
})
export class CharactersComponent implements OnInit {
  @Output() changed = new EventEmitter<Character>();
  @Input() storyId: number;

  characters: Character[];
  selectedCharacter: Character;

  constructor(private characterService: CharacterService) { }

  ngOnInit() {
    this.characterService.getCharacters(this.storyId)
      .subscribe(characters => this.characters = characters);
  }

  select(selectedCharacter: Character) {
    this.selectedCharacter = selectedCharacter;
    this.changed.emit(selectedCharacter);
  }
}

