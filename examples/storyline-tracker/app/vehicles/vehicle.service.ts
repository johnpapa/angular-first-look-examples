import { Injectable } from 'angular2/core';
import { Http, Response } from 'angular2/http';
import { Observable } from 'rxjs/Rx';

import { ExceptionService, SpinnerService } from '../blocks/blocks';
import { CONFIG, MessageService } from '../shared/shared';

let vehiclesUrl = CONFIG.baseUrls.vehicles;

export interface Vehicle {
  id: number;
  name: string;
  type: string;
}

@Injectable()
export class VehicleService {
  constructor(private _http: Http,
    private _exceptionService: ExceptionService,
    private _messageService: MessageService,
    private _spinnerService: SpinnerService) {
    this._messageService.state.subscribe(state => this.getVehicles());
  }

  addVehicle(vehicle: Vehicle) {
    let body = JSON.stringify(vehicle);
    this._spinnerService.show();
    return this._http
      .post(`${vehiclesUrl}`, body)
      .map(res => res.json().data)
      .catch(this._exceptionService.catchBadResponse)
      .finally(() => this._spinnerService.hide());
  }

  deleteVehicle(vehicle: Vehicle) {
    this._spinnerService.show();
    return this._http
      .delete(`${vehiclesUrl}/${vehicle.id}`)
      .catch(this._exceptionService.catchBadResponse)
      .finally(() => this._spinnerService.hide());
  }

  getVehicles() {
    this._spinnerService.show();
    return this._http.get(vehiclesUrl)
      .map((response: Response) => <Vehicle[]>response.json().data)
      .catch(this._exceptionService.catchBadResponse)
      .finally(() => this._spinnerService.hide());
  }

  getVehicle(id: number) {
    this._spinnerService.show();
    return this._http.get(`${vehiclesUrl}/${id}`)
      .map((response: Response) => response.json().data)
      .catch(this._exceptionService.catchBadResponse)
      .finally(() => this._spinnerService.hide());
  }

  onDbReset = this._messageService.state;

  updateVehicle(vehicle: Vehicle) {
    let body = JSON.stringify(vehicle);
    this._spinnerService.show();

    return this._http
      .put(`${vehiclesUrl}/${vehicle.id}`, body)
      .catch(this._exceptionService.catchBadResponse)
      .finally(() => this._spinnerService.hide());
  }
}