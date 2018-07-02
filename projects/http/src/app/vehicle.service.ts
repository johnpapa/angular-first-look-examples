import { Http, Response } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, tap, throwError } from 'rxjs/operators';

export class Vehicle {
  constructor(public id: number, public name: string) {}
}

@Injectable()
export class VehicleService {
  constructor(private http: Http) {}

  getVehicles() {
    return this.http.get('api/vehicles.json').pipe(
      map((response: Response) => <Vehicle[]>response.json().data),
      tap(data => console.log(data)),
      catchError(this.handleError)
    );
  }

  private handleError(error: Response) {
    console.error(error);
    let msg = `Error status code ${error.status} at ${error.url}`;
    return throwError(msg);
  }
}
