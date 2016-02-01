  import { bootstrap } from 'angular2/platform/browser';
  import { StoryComponent } from './story.component';

  bootstrap(StoryComponent);
    .then(success => console.log(`Bootstrap success`))
    .catch(error => console.log(error));

