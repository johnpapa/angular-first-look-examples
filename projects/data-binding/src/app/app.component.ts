import { Component } from '@angular/core';

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
      <ng-template [ngSwitchCase]="true">
        <story-character-solved></story-character-solved>
      </ng-template>
      <ng-template ngSwitchDefault>
        <story-character></story-character>
      </ng-template>
    </span>
  </div>
  `
})
export class AppComponent {
  buttonText = 'Switch to Solution';
  showSolution = false;

  solve() {
    this.showSolution = !this.showSolution;
    this.buttonText = this.showSolution
      ? 'Switch to  Starter'
      : 'Switch to Solution';
  }
}
