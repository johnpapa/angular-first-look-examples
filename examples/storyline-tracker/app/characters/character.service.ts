import { Injectable } from 'angular2/core';
import { Http, Response } from 'angular2/http';
import { Observable } from 'rxjs/Rx';

import { ExceptionService, SpinnerService } from '../blocks/blocks';
import { CONFIG, MessageService } from '../shared/shared';

let charactersUrl = CONFIG.baseUrls.characters;

export interface Character {
  id: number;
  name: string;
  side: string;
}

@Injectable()
export class CharacterService {
  constructor(private _http: Http,
    private _exceptionService: ExceptionService,
    private _messageService: MessageService,
    private _spinnerService: SpinnerService) {
    this._messageService.state.subscribe(state => this.getCharacters());
  }

  addCharacter(character: Character) {
    let body = JSON.stringify(character);
    this._spinnerService.show();
    return this._http
      .post(`${charactersUrl}`, body)
      .map(res => res.json().data)
      .catch(this._exceptionService.catchBadResponse)
      .finally(() => this._spinnerService.hide());
  }

  deleteCharacter(character: Character) {
    this._spinnerService.show();
    return this._http
      .delete(`${charactersUrl}/${character.id}`)
      .catch(this._exceptionService.catchBadResponse)
      .finally(() => this._spinnerService.hide());
  }

  getCharacters() {
    this._spinnerService.show();
    return this._http.get(charactersUrl)
      .map((response: Response) => <Character[]>response.json().data)
      .catch(this._exceptionService.catchBadResponse)
      .finally(() => this._spinnerService.hide());
  }

  getCharacter(id: number) {
    this._spinnerService.show();
    return this._http.get(`${charactersUrl}/${id}`)
      .map((response: Response) => response.json().data)
      .catch(this._exceptionService.catchBadResponse)
      .finally(() => this._spinnerService.hide());
  }

  onDbReset = this._messageService.state;

  updateCharacter(character: Character) {
    let body = JSON.stringify(character);
    this._spinnerService.show();

    return this._http
      .put(`${charactersUrl}/${character.id}`, body)
      .catch(this._exceptionService.catchBadResponse)
      .finally(() => this._spinnerService.hide());
  }
}
