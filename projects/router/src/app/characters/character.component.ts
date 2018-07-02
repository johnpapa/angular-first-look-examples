import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { Character, CharacterService } from '../characters/character.service';

@Component({
  selector: 'story-character',
  templateUrl: './character.component.html'
})
export class CharacterComponent implements OnInit {
  @Input() character: Character;

  private id: any;

  constructor(
    private characterService: CharacterService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.character) {
      this.route.params
        .pipe(
          map(params => params['id']),
          tap(id => (this.id = +id))
        )
        .subscribe(id => this.getCharacter());
    }
  }

  private getCharacter() {
    this.characterService
      .getCharacter(this.id)
      .subscribe(character => this.setEditCharacter(character));
  }

  private gotoCharacters() {
    let route = ['/characters'];
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
