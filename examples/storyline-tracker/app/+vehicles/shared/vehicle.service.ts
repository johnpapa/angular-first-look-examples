import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { Vehicle } from './vehicle.model';
import { CONFIG, ExceptionService, MessageService, SpinnerService } from '../../../app/shared';

let vehiclesUrl = CONFIG.baseUrls.vehicles;

@Injectable()
export class VehicleService {
  onDbReset = this.messageService.state;

  constructor(private http: Http,
    private exceptionService: ExceptionService,
    private messageService: MessageService,
    private spinnerService: SpinnerService) {
    this.messageService.state.subscribe(state => this.getVehicles());
  }

  addVehicle(vehicle: Vehicle) {
    let body = JSON.stringify(vehicle);
    this.spinnerService.show();
    return <Observable<Vehicle>>this.http
      .post(`${vehiclesUrl}`, body)
      .map((res: Response) => res.json().data)
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }

  deleteVehicle(vehicle: Vehicle) {
    this.spinnerService.show();
    return <Observable<Vehicle>>this.http
      .delete(`${vehiclesUrl}/${vehicle.id}`)
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }

  getVehicles() {
    this.spinnerService.show();
    return <Observable<Vehicle[]>>this.http
      .get(vehiclesUrl)
      .map((response: Response) => <Vehicle[]>response.json().data)
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }

  getVehicle(id: number) {
    this.spinnerService.show();
    return <Observable<Vehicle>>this.http
      .get(`${vehiclesUrl}/${id}`)
      .map((response: Response) => response.json().data)
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }

  updateVehicle(vehicle: Vehicle) {
    let body = JSON.stringify(vehicle);
    this.spinnerService.show();

    return <Observable<Vehicle>>this.http
      .put(`${vehiclesUrl}/${vehicle.id}`, body)
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }
}
