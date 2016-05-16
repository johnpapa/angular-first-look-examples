import { Component, Input } from '@angular/core';
import { Character } from './character.service';

@Component({
  moduleId: module.id,
  selector: 'my-character',
  templateUrl: 'character.component.html'
})
export class CharacterComponent {
  @Input() character: Character;
}
