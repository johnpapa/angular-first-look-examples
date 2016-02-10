  import { bootstrap } from 'angular2/platform/browser';
  import { CharacterListComponent } from './character-list.component';

  bootstrap(CharacterListComponent)
    .then(success => console.log(`Bootstrap success`))
    .catch(error => console.log(error));

