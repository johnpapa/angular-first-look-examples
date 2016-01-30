import { Component, ViewChild } from 'angular2/core';

import { CharactersComponent } from './characters.component';

@Component({
  selector: 'story-app',
  template: `
  <div>
    <h1>Storyline Tracker</h1>
    <h3>Component Demo</h3>
    <story-characters [storyId]="7" (changed)=changed($event)></story-characters>
  </div>
  `,
  directives: [CharactersComponent]
})
export class AppComponent {
  @ViewChild(CharactersComponent) cc: CharactersComponent;

  changed(c: any) {
    if (c) {
      console.log(`Event Emitter said you selected ${c.name}`);
    }
  }
}
