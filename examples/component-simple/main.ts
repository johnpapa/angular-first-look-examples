import { bootstrap } from '@angular/platform-browser-dynamic';
import { CharacterComponent } from './app/character.component';

bootstrap(CharacterComponent)
  .then(success => console.log(`Bootstrap success`))
  .catch(error => console.log(error));

