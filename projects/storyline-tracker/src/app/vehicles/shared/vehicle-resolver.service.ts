import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Vehicle } from './vehicle.model';
import { VehicleService } from './vehicle.service';

@Injectable()
export class VehicleResolver implements Resolve<Vehicle> {
  constructor(private vehicleService: VehicleService, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Vehicle> {
    const id = +route.params['id'];
    if (isNaN(id)) {
      return of(new Vehicle());
    }
    return this.vehicleService.getVehicle(id).pipe(
      map(vehicle => {
        if (vehicle) {
          return vehicle;
        }
        // Return a new object, because we're going to create a new one
        return new Vehicle();
        // We could throw an error here and catch it
        // and route back to the speaker list
        // let msg = `vehicle id ${id} not found`;
        // console.log(msg);
        // throw new Error(msg)
      }),
      catchError((error: any) => {
        console.log(`${error}. Heading back to vehicle list`);
        this.router.navigate(['/vehicles']);
        return of(null as Vehicle); // null
      })
    );
  }
}
