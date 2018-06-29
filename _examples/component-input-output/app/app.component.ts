import { Component } from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/common/http';

import { CharactersComponent } from './characters.component';

@Component({

  selector: 'story-app',
  template: `
  <div>
    <h1>Storyline Tracker</h1>
    <h3>Component Demo</h3>
    <story-characters [storyId]="7" (changed)=changed($event)></story-characters>
  </div>
  `
})
export class AppComponent {
  changed(changedCharacter: any) {
    if (changedCharacter) {
      console.log(`Event Emitter said you selected ${changedCharacter.name}`);
    }
  }
}
