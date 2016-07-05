import { RouterConfig }          from '@angular/router';

import { VehicleListComponent } from './vehicle-list';
import { VehicleComponent } from './vehicle';
import { VehiclesComponent } from './vehicles.component';

import { CanDeactivateGuard } from '../app.interfaces';

export const VehiclesRoutes: RouterConfig = [
  {
    path: 'vehicles',
    component: VehiclesComponent,
    children: [
      {
        path: '',
        component: VehicleListComponent
      },
      {
        path: ':id',
        component: VehicleComponent,
        canDeactivate: [CanDeactivateGuard]
      },
    ]
  },
];

