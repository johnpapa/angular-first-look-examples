import { Component } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';

import { CharacterComponent } from './character.component';

@Component({
  selector: 'story-app',
  template: `
  <div>
    <h3>Storyline Tracker - Data Binding Demo</h3>
    <story-character></story-character>
  </div>
  `,
  directives: [CharacterComponent],
  providers: [HTTP_PROVIDERS]
})
export class AppComponent {}
