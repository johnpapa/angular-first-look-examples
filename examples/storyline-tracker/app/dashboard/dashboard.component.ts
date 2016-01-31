import { Component, OnDestroy, OnInit } from 'angular2/core';
import { Router } from 'angular2/router';
import { Observable, Subscription } from 'rxjs/Rx';

import { Character, CharacterService } from '../characters/characters';
import { ToastService } from '../blocks/blocks';

@Component({
  selector: 'my-dashboard',
  templateUrl: 'app/dashboard/dashboard.component.html',
  styleUrls: ['app/dashboard/dashboard.component.css']
})
export class DashboardComponent implements OnDestroy, OnInit {
  private _dbResetSubscription: Subscription<any>;

  characters: Observable<Character[]>;

  constructor(
    private _characterService: CharacterService,
    private _router: Router,
    private _toastService: ToastService) { }

  getCharacters() {
    // this._spinnerService.show();
    this.characters = this._characterService.getCharacters()
      .catch(e => {
        this._toastService.activate(`${e}`);
        return Observable.of();
      })
      // .finally(() => { this._spinnerService.hide(); })
  }

  gotoDetail(character: Character) {
    let link = ['Characters', 'Character', { id: character.id }];
    this._router.navigate(link);
  }

  ngOnDestroy() {
    this._dbResetSubscription.unsubscribe();
  }

  ngOnInit() {
    this.getCharacters();
    this._dbResetSubscription = this._characterService.onDbReset
      .subscribe(() => this.getCharacters());
  }
}
