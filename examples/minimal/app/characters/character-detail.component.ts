import { Component, Input, OnInit } from 'angular2/core';
import { RouteParams, Router, ROUTER_DIRECTIVES } from 'angular2/router';

import { Character, CharacterService } from '../characters/character.service';

@Component({
  selector: 'story-character-detail',
  templateUrl: 'app/characters/character-detail.component.html',
  directives: [ROUTER_DIRECTIVES]
})
export class CharacterDetailComponent implements OnInit {
  @Input() character: Character;

  constructor(
    private _characterService: CharacterService,
    private _routeParams: RouteParams,
    private _router: Router) { }

  ngOnInit() {
    if (!this.character) {
      let id = +this._routeParams.get('id');
      this._characterService.getCharacter(id)
        .subscribe(character => this._setEditCharacter(character));
    }
  }

  private _gotoCharacters() {
    let route = ['Characters', { id: this.character ? this.character.id : null }]
    this._router.navigate(route);
  }

  private _setEditCharacter(character: Character) {
    if (character) {
      this.character = character;
    } else {
      this._gotoCharacters();
    }
  }
}
