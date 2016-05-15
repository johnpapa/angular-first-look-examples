import { Component } from '@angular/core';
import { Routes, ROUTER_DIRECTIVES } from '@angular/router';

import { CharacterComponent } from './character';
import { CharacterListComponent } from './character-list';
import { CharacterService } from '../../app/shared';

@Component({
  selector: 'story-characters-root',
  template: `
    <router-outlet></router-outlet>
  `,
  directives: [ROUTER_DIRECTIVES]
})
@Routes([
  { path: '/', component: CharacterListComponent },
	{ path: '/list/:id', component: CharacterListComponent	},
	{ path: '/:id', component: CharacterComponent }
])
export class CharactersComponent { }
