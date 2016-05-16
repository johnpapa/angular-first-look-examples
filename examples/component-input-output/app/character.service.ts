import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';

export class Character {
  id: number;
  name: string;
}

@Injectable()
export class CharacterService {
  constructor(private http: Http) { }

  getCharacters(storyId: number) {
    return this.http
      .get('api/characters.json')
      .map((response: Response) => response.json().data);
  }
}
