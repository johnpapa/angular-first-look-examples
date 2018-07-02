import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleListComponent } from './vehicle-list.component';
import { VehicleComponent } from './vehicle.component';
import { VehiclesComponent } from './vehicles.component';

const routes: Routes = [
  {
    path: '',
    component: VehiclesComponent,
    children: [
      { path: '', component: VehicleListComponent },
      { path: ':id', component: VehicleComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiclesRoutingModule {}

export const routedComponents = [
  VehiclesComponent,
  VehicleListComponent,
  VehicleComponent
];
