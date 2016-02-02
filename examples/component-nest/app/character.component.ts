import { Component, Input } from 'angular2/core';
import { Character } from './character';

@Component({
  selector: 'my-character',
  templateUrl: 'app/character.component.html'
})
export class CharacterComponent {
  @Input() character: Character;
}

