import { Routes, RouterModule } from '@angular/router';

import { CharacterComponent } from './character.component';
import { CharactersComponent } from './characters.component';
import { CharacterListComponent } from './character-list.component';

export const routes: Routes = [
  // { path: '', pathMatch: 'full', redirectTo: '/characters' },
  {
    path: 'characters',
    component: CharactersComponent,
    children: [
      { path: '', component: CharacterListComponent },
      { path: ':id', component: CharacterComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);

export const routedComponents = [
  CharactersComponent,
  CharacterListComponent,
  CharacterComponent
];
