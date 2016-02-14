import { Injectable } from 'angular2/core';
import { Http, Response } from 'angular2/http';
import { Observable } from 'rxjs/Rx';

export class Vehicle {
  constructor(public id: number, public name: string) { }
}

@Injectable()
export class VehicleService {
  constructor(private _http: Http) { }

  getVehicles() {
    return this._http.get('api/vehicles.json')
      .map((response: Response) => <Vehicle[]>response.json().data)
      .do(data => console.log(data))
      .catch(this.handleError);
  }

  private handleError(error: Response) {
    console.error(error);
    return Observable.throw(error.json().error || 'Server error');
  }
}
