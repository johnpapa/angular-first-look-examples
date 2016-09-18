import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CharactersComponent } from './characters/characters.component';
import { CharacterListComponent } from './characters/character-list.component';
import { CharacterComponent } from './characters/character.component';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { VehicleListComponent } from './vehicles/vehicle-list.component';
import { VehicleComponent } from './vehicles/vehicle.component';

import { CanActivateAuthGuard } from './can-activate.service';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'characters', },
  { path: 'login', component: LoginComponent },
  // { path: 'characters', component: CharacterListComponent },
  // { path: 'character/:id', component: CharacterComponent },
  {
    path: 'characters',
    component: CharactersComponent,
    children: [
      { path: '', component: CharacterListComponent },
      { path: ':id', component: CharacterComponent },
    ]
  },
  { path: 'vehicles', component: VehicleListComponent, canActivate: [CanActivateAuthGuard] },
  { path: 'vehicles/:id', component: VehicleComponent, canActivate: [CanActivateAuthGuard] },
  { path: '**', pathMatch: 'full', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const routableComponents = [
  CharacterListComponent,
  CharacterComponent,
  CharactersComponent,
  LoginComponent,
  VehicleListComponent,
  VehicleComponent,
  PageNotFoundComponent
];
