import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
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
      <template [ngSwitchCase]="true">
        <story-character-solved></story-character-solved>
      </template>
      <template ngSwitchDefault>
        <story-character></story-character>
      </template>
    </span>
  </div>
  `
})
export class AppComponent {
  buttonText = 'Switch to Solution';
  showSolution = false;

  solve() {
    this.showSolution = !this.showSolution;
    this.buttonText = this.showSolution ? 'Switch to  Starter' : 'Switch to Solution';
  }
}
