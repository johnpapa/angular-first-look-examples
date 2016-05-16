import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';

import { CONFIG } from '../config';

let vehiclesUrl = CONFIG.baseUrls.vehicles;

export class Vehicle {
  id: number;
  name: string;
  type: string;
}

@Injectable()
export class VehicleService {
  constructor(private http: Http) { }

  getVehicles() {
    return this.http
      .get(vehiclesUrl)
      .map((response: Response) => <Vehicle[]>response.json().data);
  }

  getVehicle(id: number) {
    return this.getVehicles()
      .map(vehicles => vehicles.find(vehicle => vehicle.id === id));
  }
}
