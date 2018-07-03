import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ToastService } from './toast/toast.service';

@Injectable()
export class ExceptionService {
  constructor(private toastService: ToastService) {}

  catchBadResponse: (errorResponse: any) => Observable<any> = (
    errorResponse: any
  ) => {
    let res = <HttpErrorResponse>errorResponse;
    let err = res;
    let emsg = err
      ? err.error
        ? err.error
        : JSON.stringify(err)
      : res.statusText || 'unknown error';
    this.toastService.activate(`Error - Bad Response - ${emsg}`);
    return of(false);
  };
}
