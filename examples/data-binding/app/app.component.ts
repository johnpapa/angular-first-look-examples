import { Component } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';

import { CharacterComponent } from './character.component';
import { CharacterSolvedComponent } from './solution/character-solved.component';

@Component({
  selector: 'story-app',
  template: `
  <div>
    <h3>Storyline Tracker - Data Binding Demo</h3>

    <div>
      <button class="dashboard-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect
      mdl-button--accent"
        (click)="solve()">Show Solution</button>
    </div>
    <div *ngIf="!showSolution">
        <story-character></story-character>
    </div>
    <div *ngIf="showSolution">
        <story-character-solved></story-character-solved>
    </div>
  </div>
  `,
  directives: [CharacterComponent, CharacterSolvedComponent],
  providers: [HTTP_PROVIDERS]
})
export class AppComponent {
  showSolution = false;

  solve() {
    this.showSolution = !this.showSolution;
  }
}
