import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CharacterComponent } from './character.component';
import { CharactersComponent } from './characters.component';
import { CharacterListComponent } from './character-list.component';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CharactersRouterModule { }

export const routedComponents = [
  CharactersComponent,
  CharacterListComponent,
  CharacterComponent
];
