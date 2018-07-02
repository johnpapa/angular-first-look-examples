import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export class Vehicle {
  constructor(public id: number, public name: string, public side: string) {}
}

@Injectable()
export class VehicleService {
  constructor(private http: HttpClient) {}

  getVehicles(value?: string) {
    return this.http
      .get('assets/vehicles.json')
      .pipe(
        map((data: any) => <Vehicle[]>data.data),
        catchError(this.handleError)
      )
      .toPromise();
  }

  private handleError(error: HttpErrorResponse) {
    console.error(error);
    let msg = `Error status code ${error.status} at ${error.url}`;
    return throwError(msg);
  }
}
