import { Component, Input, OnInit } from '@angular/core';
import { RouteParams, Router, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

import { Character, CharacterService } from './character.service';

@Component({
  moduleId: module.id,
  selector: 'story-character',
  templateUrl: 'character.component.html',
  directives: [ROUTER_DIRECTIVES]
})
export class CharacterComponent implements OnInit {
  @Input() character: Character;

  constructor(
    private characterService: CharacterService,
    private routeParams: RouteParams,
    private router: Router) { }

  ngOnInit() {
    if (!this.character) {
      let id = +this.routeParams.get('id');
      this.characterService.getCharacter(id)
        .subscribe(character => this.setEditCharacter(character));
    }
  }

  private gotoCharacters() {
    let route = ['Characters', { id: this.character ? this.character.id : null }];
    this.router.navigate(route);
  }

  private setEditCharacter(character: Character) {
    if (character) {
      this.character = character;
    } else {
      this.gotoCharacters();
    }
  }
}
