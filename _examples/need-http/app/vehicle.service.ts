import { Injectable } from '@angular/core';

export class Vehicle {
  constructor(public id: number, public name: string) { }
}

@Injectable()
export class VehicleService {
  getVehicles() {
    return [
      new Vehicle(1, 'X-Wing Fighter'),
      new Vehicle(2, 'B-Wing Fighter'),
      new Vehicle(3, 'Y-Wing Fighter')
    ];
  }
}
