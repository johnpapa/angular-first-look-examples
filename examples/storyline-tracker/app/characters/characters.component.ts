import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { CharacterComponent } from './character';
import { CharacterListComponent } from './character-list';

@Component({
  moduleId: module.id,
  selector: 'story-characters-root',
  template: `
    <router-outlet></router-outlet>
  `,
  directives: [ROUTER_DIRECTIVES]
})
export class CharactersComponent { }
