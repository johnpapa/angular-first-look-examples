import { Http, Response } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
export class Vehicle {
  constructor(public id: number, public name: string, public side: string) {}
}

@Injectable()
export class VehicleService {
  constructor(private http: Http) {}

  getVehicles() {
    return this.http.get('api/vehicles.json').pipe(
      map((data: any) => <Vehicle[]>data.data),
      catchError(this.handleError)
    );
  }

  private handleError(error: Response) {
    console.error(error);
    return Observable.throw(error.json().error || 'Server error');
  }
}
