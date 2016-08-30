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

export const vehiclesRouterModule = RouterModule.forChild(routes);

export const routedComponents = [
  VehiclesComponent,
  VehicleListComponent,
  VehicleComponent
];
