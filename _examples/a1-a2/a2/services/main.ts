import { bootstrap } from '@angular/platform-browser-dynamic';
import { VehiclesComponent } from './app/vehicles.component';

bootstrap(VehiclesComponent)
  .then(success => console.log(`Bootstrap success`))
  .catch(error => console.log(error));

