import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

export class Vehicle {
  constructor(public id: number, public name: string, public side: string) { }
}

@Injectable()
export class VehicleService {
  constructor(private http: Http) { }

  getVehicles() {
    return this.http
      .get("assets/vehicles.json")
      .map((response: Response) => <Vehicle[]>response.json().data)
      .catch(this.handleError);
  }

  private handleError(error: Response) {
    console.error(error);
    return Observable.throw(error.json().error || 'Server error');
  }
}
