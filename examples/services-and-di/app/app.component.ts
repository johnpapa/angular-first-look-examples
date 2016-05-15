import { Component } from '@angular/core';
import { Character, CharacterService } from './character.service';
import { CharacterListComponent } from './character-list.component';

@Component({
  selector: 'my-app',
  template: '<my-character-list></my-character-list>',
  directives: [CharacterListComponent],
  providers: [CharacterService]
})
export class AppComponent {}

