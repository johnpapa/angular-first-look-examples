import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';

import './core/rxjs-extensions';
import { InMemoryWebApiModule } from 'angular2-in-memory-web-api';
import { InMemoryStoreService } from '../api/in-memory-store.service';
import { appRouterModule } from './app.routing';
import { CharacterService } from './models';
import { PageNotFoundComponent } from './page-not-found.component';

/* Feature Modules */
import { CoreModule } from './core/core.module';
import { LoginModule } from './login/login.module';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,

    appRouterModule,
    CoreModule,
    InMemoryWebApiModule.forRoot(InMemoryStoreService, { delay: 600 }),
    LoginModule,
  ],
  declarations: [AppComponent, PageNotFoundComponent],
  providers: [CharacterService],
  bootstrap: [AppComponent],
})
export class AppModule { }
