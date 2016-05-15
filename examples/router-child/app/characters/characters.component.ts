import { Component } from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES } from '@angular/router';

import { CharacterComponent } from './character.component';
import { CharacterListComponent } from './character-list.component';
import { CharacterService } from './character.service';

@Component({
  selector: 'story-characters-root',
  template: `
    <router-outlet></router-outlet>
  `,
  directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
  { path: '/', name: 'Characters', component: CharacterListComponent, useAsDefault: true },
	{ path: '/:id', name: 'Character', component: CharacterComponent }
])
export class CharactersComponent { }
