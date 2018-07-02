import { Http, Response } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import {
  CONFIG,
  ExceptionService,
  MessageService,
  SpinnerService
} from '../../core';
import { Vehicle } from './vehicle.model';

let vehiclesUrl = CONFIG.baseUrls.vehicles;

@Injectable()
export class VehicleService {
  onDbReset = this.messageService.state;

  constructor(
    private http: Http,
    private exceptionService: ExceptionService,
    private messageService: MessageService,
    private spinnerService: SpinnerService
  ) {
    this.messageService.state.subscribe(state => this.getVehicles());
  }

  addVehicle(vehicle: Vehicle) {
    let body = JSON.stringify(vehicle);
    this.spinnerService.show();
    return <Observable<Vehicle>>this.http.post(`${vehiclesUrl}`, body).pipe(
      map(res => <Vehicle>res.json().data),
      catchError(this.exceptionService.catchBadResponse),
      finalize(() => this.spinnerService.hide())
    );
  }

  deleteVehicle(vehicle: Vehicle) {
    this.spinnerService.show();
    return <Observable<Vehicle>>(
      this.http.delete(`${vehiclesUrl}/${vehicle.id}`).pipe(
        map(res => this.extractData<Vehicle>(res)),
        catchError(this.exceptionService.catchBadResponse),
        finalize(() => this.spinnerService.hide())
      )
    );
  }

  getVehicles() {
    this.spinnerService.show();
    return <Observable<Vehicle[]>>this.http.get(vehiclesUrl).pipe(
      map(res => this.extractData<Vehicle[]>(res)),
      catchError(this.exceptionService.catchBadResponse),
      finalize(() => this.spinnerService.hide())
    );
  }

  private extractData<T>(res: Response) {
    if (res.status < 200 || res.status >= 300) {
      throw new Error('Bad response status: ' + res.status);
    }
    let body = res.json ? res.json() : null;
    return <T>((body && body.data) || {});
  }

  getVehicle(id: number) {
    this.spinnerService.show();
    return <Observable<Vehicle>>this.http.get(`${vehiclesUrl}/${id}`).pipe(
      map(res => this.extractData<Vehicle>(res)),
      catchError(this.exceptionService.catchBadResponse),
      finalize(() => this.spinnerService.hide())
    );
  }

  updateVehicle(vehicle: Vehicle) {
    let body = JSON.stringify(vehicle);
    this.spinnerService.show();

    return <Observable<Vehicle>>(
      this.http.put(`${vehiclesUrl}/${vehicle.id}`, body).pipe(
        map(res => this.extractData<Vehicle>(res)),
        catchError(this.exceptionService.catchBadResponse),
        finalize(() => this.spinnerService.hide())
      )
    );
  }
}
