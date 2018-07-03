import { Http, Response } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export class Vehicle {
  constructor(public id: number, public name: string, public side: string) {}
}

@Injectable()
export class VehicleService {
  constructor(private http: Http) {}

  getVehicles() {
    return this.http.get('assets/vehicles.json').pipe(
      map((data: any) => <Vehicle[]>data.data),
      catchError(this.handleError)
    );
  }

  private handleError(error: Response) {
    console.error(error);
    return throwError(error.json().error || 'Server error');
  }
}
