import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Character, CharacterService } from '../../app/models';
import { ToastService } from '../../app/core';

@Component({
  moduleId: module.id,
  selector: 'story-dashboard',
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
    this.characters = this.characterService.getCharacters()
      .do(() => this.toastService.activate('Got characters for the dashboard'))
      .catch(e => {
        this.toastService.activate(`${e}`);
        return Observable.of([]);
      });
  }

  gotoDetail(character: Character) {
    let link = ['/characters', character.id];
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

  trackByCharacters(index: number, character: Character) {
    return character.id;
  }
}
