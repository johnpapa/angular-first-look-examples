import { Injectable } from 'angular2/core';
import { Http, Response } from 'angular2/http';
import { Observable, Subject } from 'rxjs/Rx';

import { CONFIG } from './config';
import { ToastService } from '../blocks/toast/toast.service';

export interface IResetMessage {
  message: string
}

@Injectable()
export class MessageService {
  private _subject = new Subject();

  state = <Observable<IResetMessage>>this._subject;

  constructor(private _http: Http,
    private _toastService: ToastService) {
  }

  resetDb() {
    let msg = 'Reset the Data Successfully';
    this._http.post(CONFIG.baseUrls.resetDb, null)
      .subscribe(() => {
        this._subject.next({ message: msg });
        this._toastService.activate(msg);
      });
  }
}
