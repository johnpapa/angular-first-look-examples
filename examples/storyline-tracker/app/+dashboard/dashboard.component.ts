import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs/Rx';

import { Character, CharacterService, ToastService } from '../../app/shared';

@Component({
  moduleId: module.id,
  selector: 'my-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.css']
})
export class DashboardComponent implements OnDestroy, OnInit {
  private dbResetSubscription: Subscription;

  characters: Observable<Character[]>;

  constructor(
    private characterService: CharacterService,
    private router: Router,
    private toastService: ToastService) { }

  getCharacters() {
    // this._spinnerService.show();
    this.characters = this.characterService.getCharacters()
      .catch((e: any) => {
        this.toastService.activate(`${e}`);
        return Observable.of([]);
      });
      // .finally(() => { this._spinnerService.hide(); })
  }

  gotoDetail(character: Character) {
    let link = ['Characters', 'Character', { id: character.id }];
    this.router.navigate(link);
  }

  ngOnDestroy() {
    this.dbResetSubscription.unsubscribe();
  }

  ngOnInit() {
    this.getCharacters();
    this.dbResetSubscription = this.characterService.onDbReset
      .subscribe(() => this.getCharacters());
  }
}
