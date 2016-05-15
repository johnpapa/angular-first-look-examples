import { bootstrap } from '@angular/platform-browser-dynamic';
import { StoryComponent } from './app/story.component';

bootstrap(StoryComponent)
  .then(success => console.log(`Bootstrap success`))
  .catch(error => console.log(error));

