import {Injectable} from '@angular/core';

@Injectable()
export class VehicleService {
  getVehicles = () => [
    { id: 1, name: 'X-Wing Fighter' },
    { id: 2, name: 'Tie Fighter' },
    { id: 3, name: 'Y-Wing Fighter' }
  ];
}

