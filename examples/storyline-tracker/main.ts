import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';

import { AppComponent } from './app/app.component';
import { environment } from './app/environment';

if (environment.production) {
  enableProdMode();
}

bootstrap(AppComponent)
  .then(success => console.log(`Bootstrap success`))
  .catch(error => console.log(error));
