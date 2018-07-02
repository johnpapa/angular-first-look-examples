import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CONFIG } from '../config';

let vehiclesUrl = CONFIG.baseUrls.vehicles;

export class Vehicle {
  id: number;
  name: string;
  type: string;
}

@Injectable()
export class VehicleService {
  constructor(private http: HttpClient) {
    console.log('created vehicle service');
  }

  getVehicle(id: number) {
    return this.getVehicles().pipe(
      map(vehicles => vehicles.find(vehicle => vehicle.id === id))
    );
  }

  getVehicles() {
    return this.http
      .get(vehiclesUrl)
      .pipe(map((data: any) => <Vehicle[]>data.data));
  }
}
