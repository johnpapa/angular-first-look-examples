import { Inject, Injectable } from 'angular2/core';
import { Http, Response } from 'angular2/http';
import 'rxjs/Rx'; // load the full rxjs

export class Character {
  constructor(public id: number, public name: string, public side: string) {}

}

@Injectable()
export class CharacterService {
  constructor(private _http: Http) { }

  getCharacters() {
    return this._http.get('api/characters.json')
      .map((response: Response) => response.json().data);
  }
}
