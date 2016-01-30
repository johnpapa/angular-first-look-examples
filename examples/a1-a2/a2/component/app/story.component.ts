    import { Component } from 'angular2/core';

    @Component({
      selector: 'my-story',
      template: '<h3>{{story.name}}</h3>'
    })
    export class StoryComponent {
      story = { id: 100, name: 'The Force Awakens' };
    }


