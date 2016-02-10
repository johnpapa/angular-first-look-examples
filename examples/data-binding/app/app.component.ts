import { Component } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';

import { CharacterComponent } from './character.component';
import { CharacterSolvedComponent } from './solution/character-solved.component';

@Component({
  selector: 'story-app',
  template: `
  <div>
    <h3>Storyline Tracker - Data Binding Demo</h3>

    <div style="margin:1em">
      <button class="dashboard-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect
      mdl-button--accent"
        (click)="solve()">{{buttonText}}</button>
    </div>

    <span [ngSwitch]="showSolution">
      <template [ngSwitchWhen]="true">
        <story-character-solved></story-character-solved>
      </template>
      <template ngSwitchDefault>
        <story-character></story-character>
      </template>
    </span>
  </div>
  `,
  directives: [CharacterComponent, CharacterSolvedComponent],
  providers: [HTTP_PROVIDERS]
})
export class AppComponent {
  showSolution = false;
  buttonText = 'Switch to Solution';

  solve() {
    this.showSolution = !this.showSolution;
    this.buttonText = this.showSolution ? 'Switch to  Starter' : 'Switch to Solution';
  }
}