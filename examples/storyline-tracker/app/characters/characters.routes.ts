import { RouterConfig }          from '@angular/router';

import { CharacterListComponent } from './character-list';
import { CharacterComponent } from './character';
import { CharactersComponent } from './characters.component';

import { CanDeactivateGuard } from '../app.interfaces';

export const CharactersRoutes: RouterConfig = [
  {
    path: 'characters',
    component: CharactersComponent,
    children: [
      {
        path: '',
        component: CharacterListComponent
      },
      {
        path: ':id',
        component: CharacterComponent,
        canDeactivate: [CanDeactivateGuard]
      },
    ]
  },
];

