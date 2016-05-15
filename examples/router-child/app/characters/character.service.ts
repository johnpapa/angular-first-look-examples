import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { CONFIG } from '../config';

let charactersUrl = CONFIG.baseUrls.characters;

export interface Character {
  id: number;
  name: string;
  side: string;
}

@Injectable()
export class CharacterService {
  constructor(private _http: Http) { }

  getCharacters() {
    return this._http.get(charactersUrl)
      .map((response: Response) => <Character[]>response.json().data);
  }

  getCharacter(id: number) {
    return this.getCharacters()
      .map(characters => characters.find(character => character.id == id));
  }
}
