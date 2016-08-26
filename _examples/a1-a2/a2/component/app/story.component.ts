import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'my-story',
  template: `
    <h3>{{story.name}}</h3>
    <h3 [innerText]="story.name"></h3>
    <div [style.color]="color">{{story.name}}</div>
  `
})
export class StoryComponent {
  story = { id: 100, name: 'The Force Awakens' };
  color = 'blue';
}
