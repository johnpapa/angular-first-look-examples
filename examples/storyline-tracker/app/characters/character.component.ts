import { Component, Input, OnDestroy, OnInit } from 'angular2/core';
import { CanDeactivate, ComponentInstruction, RouteParams, Router, ROUTER_DIRECTIVES } from 'angular2/router';
import { Observable, Subscription } from 'rxjs/Rx';

import { EntityService, ModalService, ToastService } from '../blocks/blocks';
import { Character, CharacterService } from '../characters/character.service';

@Component({
  selector: 'story-character',
  templateUrl: 'app/characters/character.component.html',
  styles: ['.mdl-textfield__label {top: 0;}'],
  directives: [ROUTER_DIRECTIVES]
})
export class CharacterComponent implements CanDeactivate, OnDestroy, OnInit {
  private _dbResetSubscription: Subscription<any>;

  @Input() character: Character;
  editCharacter: Character = <Character>{};

  constructor(
    private _characterService: CharacterService,
    private _entityService: EntityService,
    private _modalService: ModalService,
    private _routeParams: RouteParams,
    private _router: Router,
    private _toastService: ToastService) { }

  cancel(showToast = true) {
    this.editCharacter = this._entityService.clone(this.character);
    if (showToast) {
      this._toastService.activate(`Cancelled changes to ${this.character.name}`);
    }
  }

  delete() {
    let msg = `Do you want to delete ${this.character.name}?`;
    this._modalService.activate(msg).then(responseOK => {
      if (responseOK) {
        this.cancel(false);
        this._characterService.deleteCharacter(this.character)
          .subscribe(() => {
            this._toastService.activate(`Deleted ${this.character.name}`);
            this._gotoCharacters();
          });
      }
    });
  }

  isAddMode() {
    let id = +this._routeParams.get('id');
    return isNaN(id);
  }

  ngOnDestroy() {
    this._dbResetSubscription.unsubscribe();
  }

  ngOnInit() {
    componentHandler.upgradeDom();
    this._getCharacter();
    this._dbResetSubscription = this._characterService.onDbReset
      .subscribe(() => this._getCharacter());
  }

  routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    return !this.character ||
      !this._isDirty() ||
      this._modalService.activate();
  }

  save() {
    let character = this.character = this._entityService.merge(this.character, this.editCharacter);
    if (character.id == null) {
      this._characterService.addCharacter(character)
        .subscribe(char => {
          this._setEditCharacter(char);
          this._toastService.activate(`Successfully added ${char.name}`);
          this._gotoCharacters();
        });
      return;
    }
    this._characterService.updateCharacter(character)
      .subscribe(() => this._toastService.activate(`Successfully saved ${character.name}`));
  }

  private _getCharacter() {
    let id = +this._routeParams.get('id');
    if (id === 0) return;
    if (this.isAddMode()) {
      this.character = <Character>{ name: '', side: 'dark' };
      this.editCharacter = this._entityService.clone(this.character);
      return;
    }
    this._characterService.getCharacter(id)
      .subscribe(character => this._setEditCharacter(character));
  }

  private _gotoCharacters() {
    let id = this.character ? this.character.id : null;
    let route = ['Characters', { id: id }];
    this._router.navigate(route);
  }

  private _handleServiceError(op: string, err: any) {
    console.error(`${op} error: ${err.message || err}`);
  }

  private _isDirty() {
    return this._entityService.propertiesDiffer(this.character, this.editCharacter);
  }

  private _setEditCharacter(character: Character) {
    if (character) {
      this.character = character;
      this.editCharacter = this._entityService.clone(this.character);
    } else {
      this._gotoCharacters();
    }
  }
}
