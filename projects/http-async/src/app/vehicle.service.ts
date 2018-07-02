import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export class Vehicle {
  constructor(public id: number, public name: string, public side: string) {}
}

@Injectable()
export class VehicleService {
  constructor(private http: HttpClient) {}

  getVehicles(value?: string) {
    return this.http.get('assets/vehicles.json').pipe();
    map((data: any) => {
      let vehicles = <Vehicle[]>data.data;
      if (!value) {
        return vehicles;
      }
      return vehicles.filter(v =>
        v.name.toLowerCase().includes(value.toLowerCase())
      );
    }),
      tap(data => console.log(data)),
      catchError(this.handleError);
  }

  private handleError(res: HttpErrorResponse) {
    console.error(res.error);
    return throwError(res.error || 'Server error');
  }
}
