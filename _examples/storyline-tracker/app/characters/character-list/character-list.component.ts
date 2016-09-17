import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/subscription';

import { Character, CharacterService } from '../../models';
import { FilterTextComponent } from '../../shared/filter-text/filter-text.component';
import { FilterTextService } from '../../shared/filter-text/filter-text.service';

@Component({
  moduleId: module.id,
  selector: 'story-character-list',
  templateUrl: 'character-list.component.html',
  styleUrls: ['character-list.component.css'],
})
export class CharacterListComponent implements OnDestroy, OnInit {
  private dbResetSubscription: Subscription;

  characters: Character[] = [];
  filteredCharacters = this.characters;
  @ViewChild(FilterTextComponent) filterComponent: FilterTextComponent;

  constructor(private characterService: CharacterService,
    private filterService: FilterTextService) { }

  filterChanged(searchText: string) {
    this.filteredCharacters = this.filterService.filter(searchText, ['id', 'name', 'side'], this.characters);
  }

  getCharacters() {
    this.characters = [];

    this.characterService.getCharacters()
      .subscribe(characters => {
        this.characters = this.filteredCharacters = characters;
        // this.filterComponent.clear();
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

  trackByCharacters(index: number, character: Character) {
    return character.id;
  }
}
