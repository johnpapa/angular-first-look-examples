import { Component, Input, OnChanges } from 'angular2/core';

import { Character } from './character.service';

@Component({
  selector: 'story-character-detail',
  template: `
    <div *ngIf="character">Selected Character is {{character.name}}</div>
  `
})

export class CharacterDetailComponent implements OnChanges {
  @Input() character: Character;

  ngOnChanges() {
    if (this.character) {
      console.log(`Details Component's Input was provided ${this.character.name}`);
    }
  }
}