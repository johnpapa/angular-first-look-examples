import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CanDeactivate, OnActivate, Router, RouteSegment, RouteTree } from '@angular/router';
import { Observable, Subscription } from 'rxjs/Rx';

import { Character, CharacterService, EntityService, ModalService, ToastService } from '../../../app/shared';

@Component({
  moduleId: module.id,
  selector: 'story-character',
  templateUrl: 'character.component.html',
  styles: ['.mdl-textfield__label {top: 0;}']
})
export class CharacterComponent implements CanDeactivate, OnDestroy, OnInit {
  @Input() character: Character;

  editCharacter: Character = <Character>{};

  private dbResetSubscription: Subscription;
  private id: any;

  constructor(
    private characterService: CharacterService,
    private entityService: EntityService,
    private modalService: ModalService,
    private router: Router,
    private toastService: ToastService) { }

  cancel(showToast = true) {
    this.editCharacter = this.entityService.clone(this.character);
    if (showToast) {
      this.toastService.activate(`Cancelled changes to ${this.character.name}`);
    }
  }

  delete() {
    let msg = `Do you want to delete ${this.character.name}?`;
    this.modalService.activate(msg).then(responseOK => {
      if (responseOK) {
        this.cancel(false);
        this.characterService.deleteCharacter(this.character)
          .subscribe(() => {
            this.toastService.activate(`Deleted ${this.character.name}`);
            this.gotoCharacters();
          });
      }
    });
  }

  isAddMode() {
    return isNaN(this.id);
  }

  ngOnDestroy() {
    this.dbResetSubscription.unsubscribe();
  }

  ngOnInit() {
    componentHandler.upgradeDom();
    this.getCharacter();
    this.dbResetSubscription = this.characterService.onDbReset
      .subscribe(() => this.getCharacter());
  }

  routerOnActivate(
    current: RouteSegment,
    prev?: RouteSegment,
    currTree?: RouteTree,
    prevTree?: RouteTree
  ) {
    let id = +current.getParam('id');
    this.id = id;
  }

  routerCanDeactivate(currTree?: RouteTree, futureTree?: RouteTree) {
    let deactivate = !this.character ||
      !this.isDirty() ||
      this.modalService.activate();
    return <Promise<boolean>>deactivate;
  }

  save() {
    let character = this.character = this.entityService.merge(this.character, this.editCharacter);
    if (character.id == null) {
      this.characterService.addCharacter(character)
        .subscribe(char => {
          this.setEditCharacter(char);
          this.toastService.activate(`Successfully added ${char.name}`);
          this.gotoCharacters();
        });
      return;
    }
    this.characterService.updateCharacter(character)
      .subscribe(() => this.toastService.activate(`Successfully saved ${character.name}`));
  }

  private getCharacter() {
    if (this.id === 0) return;
    if (this.isAddMode()) {
      this.character = <Character>{ name: '', side: 'dark' };
      this.editCharacter = this.entityService.clone(this.character);
      return;
    }
    this.characterService.getCharacter(this.id)
      .subscribe(character => this.setEditCharacter(character));
  }

  private gotoCharacters() {
    let id = this.character ? this.character.id : null;
    this.router.navigate(['/characters', id]);
  }

  private handleServiceError(op: string, err: any) {
    console.error(`${op} error: ${err.message || err}`);
  }

  private isDirty() {
    return this.entityService.propertiesDiffer(this.character, this.editCharacter);
  }

  private setEditCharacter(character: Character) {
    if (character) {
      this.character = character;
      this.editCharacter = this.entityService.clone(this.character);
    } else {
      this.gotoCharacters();
    }
  }
}
