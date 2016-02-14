import { Injectable } from 'angular2/core';
import { Http, Response } from 'angular2/http';

import { CONFIG } from '../config';

let vehiclesUrl = CONFIG.baseUrls.vehicles;

export interface Vehicle {
  id: number;
  name: string;
  type: string;
}

@Injectable()
export class VehicleService {
  constructor(private _http: Http) { }

  getVehicles() {
    return this._http.get(vehiclesUrl)
      .map((response: Response) => <Vehicle[]>response.json().data);
  }

  getVehicle(id: number) {
    return this.getVehicles()
      .map(vehicles => vehicles.find(vehicle => vehicle.id == id));
  }
}