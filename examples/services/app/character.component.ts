import { Component, EventEmitter, Input, Output } from 'angular2/core';
import { Character } from './character.service';

@Component({
  selector: 'my-character',
  templateUrl: 'app/character.component.html'
})
export class CharacterComponent {
  @Input() character: Character;
}

