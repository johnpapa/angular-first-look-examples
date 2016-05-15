import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { Character } from './character.model';
import { CONFIG } from '../config';
import { ExceptionService } from '../exception.service';
import { MessageService } from '../message.service';
import { SpinnerService } from '../spinner';

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
      .map((res: Response) => res.json().data)
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }

  deleteCharacter(character: Character) {
    this.spinnerService.show();
    return <Observable<Character>>this.http
      .delete(`${charactersUrl}/${character.id}`)
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }

  getCharacters() {
    this.spinnerService.show();
    return <Observable<Character[]>>this.http
      .get(charactersUrl)
      .map(res => <Character[]>res.json().data)
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }

  getCharacter(id: number) {
    this.spinnerService.show();
    return <Observable<Character>>this.http
      .get(`${charactersUrl}/${id}`)
      .map((response: Response) => response.json().data)
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }

  updateCharacter(character: Character) {
    let body = JSON.stringify(character);
    this.spinnerService.show();

    return <Observable<Character>>this.http
      .put(`${charactersUrl}/${character.id}`, body)
      .catch(this.exceptionService.catchBadResponse)
      .finally(() => this.spinnerService.hide());
  }
}
