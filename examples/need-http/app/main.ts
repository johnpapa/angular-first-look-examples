import { bootstrap } from 'angular2/platform/browser';
import { AppComponent } from './app.component';
import 'rxjs/Rx';

bootstrap(AppComponent)
  .then(success => console.log(`Bootstrap success`))
  .catch(error => console.log(error));

