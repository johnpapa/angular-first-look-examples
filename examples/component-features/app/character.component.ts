import { Component, Input, OnChanges } from 'angular2/core';

import { Character } from './character.service';

@Component({
  selector: 'story-character',
  template: `
    <div *ngIf="character">Selected Character is {{character.name}}</div>
  `
})

export class CharacterComponent implements OnChanges {
  @Input() character: Character;

  ngOnChanges() {
    if (this.character) {
      console.log(`Character Component's Input was provided ${this.character.name}`);
    }
  }
}