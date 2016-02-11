import { Injectable } from 'angular2/core';
import { Http, Response } from 'angular2/http';
import { Observable } from 'rxjs/Rx';

export class Vehicle {
  constructor(public id: number, public name: string, public side: string) { }
}

@Injectable()
export class VehicleService {
  constructor(private _http: Http) { }

  getVehicles(value?: string) {
    return this._http.get('api/vehicles.json')
      .map((response: Response) => {
        let vehicles = <Vehicle[]>response.json().data;
        if (!value) return vehicles;
        return vehicles.filter(v => v.name.toLowerCase().includes(value.toLowerCase()))
      })
      .toPromise()
      .catch(this.handleError);
    // return this._http.get('api/vehicles.json')
    //   .map((response: Response) => <Vehicle[]>response.json().data)
    //   .toPromise()
    //   .catch(this.handleError);
  }

  private handleError(error: Response) {
    console.error(error);
    return Observable.throw(error.json().error || 'Server error');
  }
}
