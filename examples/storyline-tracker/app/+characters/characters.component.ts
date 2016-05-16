import { Component } from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

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
@RouteConfig([
  { path: '/', name: 'Characters', component: CharacterListComponent, useAsDefault: true },
  { path: '/:id', name: 'Character', component: CharacterComponent }
])
export class CharactersComponent { }
