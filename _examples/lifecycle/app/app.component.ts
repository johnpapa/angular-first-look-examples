import { Component } from '@angular/core';

import { CharacterService } from './character.service';

@Component({
  moduleId: module.id,
  selector: 'my-app',
  template: '<my-character-list></my-character-list>',
  providers: [CharacterService]
})
export class AppComponent {}
