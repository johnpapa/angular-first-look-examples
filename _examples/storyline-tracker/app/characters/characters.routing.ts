import { Routes, RouterModule } from '@angular/router';

import { CharacterListComponent } from './character-list/character-list.component';
import { CharacterComponent } from './character/character.component';
import { CharactersComponent } from './characters.component';
import { CanDeactivateGuard } from '../core';

const routes: Routes = [
  {
    path: '',
    component: CharactersComponent,
    children: [
      {
        path: '',
        component: CharacterListComponent,
      },
      {
        path: ':id',
        component: CharacterComponent,
        canDeactivate: [CanDeactivateGuard]
      },
    ]
  },
];

export const routing = RouterModule.forChild(routes);

export const routedComponents = [CharactersComponent, CharacterListComponent, CharacterComponent]
