import { Component } from 'angular2/core';
import { CharacterListComponent } from './character-list.component';

@Component({
  selector: 'my-app',
  template: '<my-character-list></my-character-list>',
  directives: [CharacterListComponent]
})
export class AppComponent {}

