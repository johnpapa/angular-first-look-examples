import { Inject, Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx'; // load the full rxjs

export interface Character {
  id: number;
  name: string;
}

@Injectable()
export class CharacterService {
  constructor(private _http: Http) { }

  getCharacters(storyId: number) {
    return this._http.get('api/characters.json')
      .map((response: Response) => response.json().data);
  }
}
