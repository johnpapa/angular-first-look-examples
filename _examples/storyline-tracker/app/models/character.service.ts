import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Character } from './character.model';
import { CONFIG, ExceptionService, MessageService, SpinnerService } from '../core';

let charactersUrl = CONFIG.baseUrls.characters;

@Injectable()
export class CharacterService {
  onDbReset = this.messageService.state;

  constructor(private http: Http,
    private exceptionService: ExceptionService,
    private messageService: MessageService,
    private spinnerService: SpinnerService) {
    this.messageService.state.subscribe(state => this.getCharacters());
  }

  addCharacter(character: Character) {
    let body = JSON.stringify(character);
    this.spinnerService.show();
    return <Observable<Character>>this.http
      .post(`${charactersUrl}`, body)
      .map(res => res.json().data)
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }

  deleteCharacter(character: Character) {
    this.spinnerService.show();
    return <Observable<Character>>this.http
      .delete(`${charactersUrl}/${character.id}`)
      .map(res => this.extractData<Character>(res))
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }

  getCharacters() {
    this.spinnerService.show();
    return <Observable<Character[]>>this.http
      .get(charactersUrl)
      .map(res => this.extractData<Character[]>(res))
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }

  getCharacter(id: number) {
    this.spinnerService.show();
    return <Observable<Character>>this.http
      .get(`${charactersUrl}/${id}`)
      .map(res => this.extractData<Character>(res))
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }

  updateCharacter(character: Character) {
    let body = JSON.stringify(character);
    this.spinnerService.show();

    return <Observable<Character>>this.http
      .put(`${charactersUrl}/${character.id}`, body)
      .map(res => this.extractData<Character>(res))
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }

  private extractData<T>(res: Response) {
    if (res.status < 200 || res.status >= 300) {
      throw new Error('Bad response status: ' + res.status);
    }
    let body = res.json ? res.json() : null;
    return <T>(body && body.data || {});
  }
}
