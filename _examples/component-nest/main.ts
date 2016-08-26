import { bootstrap } from '@angular/platform-browser-dynamic';
import { CharacterListComponent } from './app/character-list.component';

bootstrap(CharacterListComponent)
  .then(success => console.log(`Bootstrap success`))
  .catch(error => console.log(error));

