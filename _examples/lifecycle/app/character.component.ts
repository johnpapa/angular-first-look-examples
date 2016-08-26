import { Component, EventEmitter, Input, Output, OnChanges, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Character } from './character.service';

@Component({
  moduleId: module.id,
  selector: 'my-character',
  templateUrl: 'character.component.html'
})
export class CharacterComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  @Input() character: Character;
  @Output() onLifecycleHookFire = new EventEmitter<string>();

  ngAfterViewInit() {
    this.onLifecycleHookFire.emit(`ngAfterViewInit for ${this.character.name}`);
  }

  ngOnChanges() {
    this.onLifecycleHookFire.emit(`ngOnChanges for ${this.character.name}`);
  }

  ngOnDestroy() {
    console.log(`ngOnDestroy for ${this.character.name}`);
  }

  ngOnInit() {
    this.onLifecycleHookFire.emit(`ngOnInit for ${this.character.name}`);
  }
}
