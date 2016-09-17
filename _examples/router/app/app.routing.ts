import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CharacterListComponent } from './characters/character-list.component';
import { CharacterComponent } from './characters/character.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { VehicleListComponent } from './vehicles/vehicle-list.component';
import { VehicleComponent } from './vehicles/vehicle.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'characters', },
  { path: 'characters', component: CharacterListComponent },
  { path: 'character/:id', component: CharacterComponent },
  { path: 'vehicles', component: VehicleListComponent },
  { path: 'vehicle/:id', component: VehicleComponent },
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
  VehicleListComponent,
  VehicleComponent,
  PageNotFoundComponent
];
