import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CONFIG } from '../config';

let charactersUrl = CONFIG.baseUrls.characters;

export class Character {
  id: number;
  name: string;
  side: string;
}

@Injectable()
export class CharacterService {
  constructor(private http: HttpClient) {}

  getCharacter(id: number) {
    return this.getCharacters().pipe(
      map(characters => characters.find(character => character.id === id))
    );
  }

  getCharacters() {
    return this.http
      .get(charactersUrl)
      .pipe(map((data: any) => <Character[]>data.data));
  }
}
