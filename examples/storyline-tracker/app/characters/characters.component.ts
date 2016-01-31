import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES } from 'angular2/router';

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
	{ path: '/list/:id', name: 'Characters', component: CharacterListComponent	},
	{ path: '/:id', name: 'Character', component: CharacterComponent }
])
export class CharactersComponent { }
