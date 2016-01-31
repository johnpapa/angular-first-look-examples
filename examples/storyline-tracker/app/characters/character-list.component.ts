import { Component, OnDestroy, OnInit, ViewChild } from 'angular2/core';
import { ROUTER_DIRECTIVES } from 'angular2/router';
import { Observable, Subscription } from 'rxjs/Rx';

import { Character, CharacterService } from './character.service';
import { SortCharactersPipe } from './sort-characters.pipe';
import { FilterService, FilterTextComponent } from '../blocks/blocks';

@Component({
  selector: 'story-characters',
  templateUrl: './app/characters/character-list.component.html',
  directives: [FilterTextComponent, ROUTER_DIRECTIVES],
  styleUrls: ['./app/characters/character-list.component.css'],
  pipes: [SortCharactersPipe],
  providers: [FilterService]
})
export class CharacterListComponent implements OnDestroy, OnInit {
  private _dbResetSubscription: Subscription<any>;

  characters: Character[];
  filteredCharacters = this.characters;
  @ViewChild(FilterTextComponent) filterComponent: FilterTextComponent;

  constructor(private _characterService: CharacterService,
    private _filterService: FilterService) { }

  filterChanged(searchText: string) {
    this.filteredCharacters = this._filterService.filter(searchText, ['id', 'name', 'side'], this.characters);
  }

  getCharacters() {
    this.characters = [];

    this._characterService.getCharacters()
      .subscribe(characters => {
        this.characters = this.filteredCharacters = characters;
        this.filterComponent.clear();
      });
  }

  ngOnDestroy() {
    this._dbResetSubscription.unsubscribe();
  }

  ngOnInit() {
    componentHandler.upgradeDom();
    this.getCharacters();
    this._dbResetSubscription = this._characterService.onDbReset
      .subscribe(() => this.getCharacters());
  }
}
