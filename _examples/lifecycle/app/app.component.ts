import { Component } from '@angular/core';
import { CharacterService } from './character.service';
import { CharacterListComponent } from './character-list.component';

@Component({
  moduleId: module.id,
  selector: 'my-app',
  template: '<my-character-list></my-character-list>',
  directives: [CharacterListComponent],
  providers: [CharacterService]
})
export class AppComponent {}
