import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VehicleComponent } from './vehicle.component';
import { VehiclesComponent } from './vehicles.component';
import { VehicleListComponent } from './vehicle-list.component';

const routes: Routes = [
  {
    path: '',
    component: VehiclesComponent,
    children: [
      { path: '', component: VehicleListComponent },
      { path: ':id', component: VehicleComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiclesRoutingModule { }

export const routedComponents = [
  VehiclesComponent,
  VehicleListComponent,
  VehicleComponent
];
