import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { Observable, Subscription } from 'rxjs/Rx';

import { SortCharactersPipe } from '../shared';
import { Character, CharacterService, FilterService, FilterTextComponent } from '../../../app/shared';

@Component({
  moduleId: module.id,
  selector: 'story-characters',
  templateUrl: 'character-list.component.html',
  directives: [FilterTextComponent, ROUTER_DIRECTIVES],
  styleUrls: ['character-list.component.css'],
  pipes: [SortCharactersPipe],
  providers: [FilterService]
})
export class CharacterListComponent implements OnDestroy, OnInit {
  private dbResetSubscription: Subscription;

  characters: Character[];
  filteredCharacters = this.characters;
  @ViewChild(FilterTextComponent) filterComponent: FilterTextComponent;

  constructor(private characterService: CharacterService,
    private filterService: FilterService) { }

  filterChanged(searchText: string) {
    this.filteredCharacters = this.filterService.filter(searchText, ['id', 'name', 'side'], this.characters);
  }

  getCharacters() {
    this.characters = [];

    this.characterService.getCharacters()
      .subscribe(characters => {
        this.characters = this.filteredCharacters = characters;
        this.filterComponent.clear();
      });
  }

  ngOnDestroy() {
    this.dbResetSubscription.unsubscribe();
  }

  ngOnInit() {
    componentHandler.upgradeDom();
    this.getCharacters();
    this.dbResetSubscription = this.characterService.onDbReset
      .subscribe(() => this.getCharacters());
  }
}
