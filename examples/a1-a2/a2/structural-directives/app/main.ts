  import { bootstrap } from 'angular2/platform/browser';
  import { VehiclesComponent } from './vehicles.component';

  bootstrap(VehiclesComponent)
    .then(success => console.log(`Bootstrap success`))
    .catch(error => console.log(error));

