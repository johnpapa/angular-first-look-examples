import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES } from 'angular2/router';

import { CharacterDetailComponent } from './character-detail.component';
import { CharactersComponent } from './characters.component';
import { CharacterService } from './character.service';

@Component({
  selector: 'story-character-dashboard',
  template: `
    <router-outlet></router-outlet>
  `,
  directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
  { path: '/', name: 'CharactersDashboard', component: CharactersComponent, useAsDefault: true },
	{ path: '/:id', name: 'CharacterDetail', component: CharacterDetailComponent }
])
export class CharactersDashboardComponent {
}
