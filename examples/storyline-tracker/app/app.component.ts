import { Component, provide } from '@angular/core';
import { HTTP_PROVIDERS, XHRBackend } from '@angular/http';
import { ROUTER_DIRECTIVES } from '@angular/router';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/map';

import {
  InMemoryBackendConfig,
  InMemoryBackendService,
  SEED_DATA
} from 'angular2-in-memory-web-api';
import { InMemoryStoryService } from '../api/in-memory-story.service';
import { CharactersComponent } from './characters';
import { DashboardComponent } from './dashboard';
import { VehiclesComponent } from './vehicles';
import {
  CharacterService,
  EntityService,
  ExceptionService,
  MessageService,
  ModalComponent,
  ModalService,
  SpinnerComponent,
  SpinnerService,
  ToastComponent,
  ToastService
} from './shared';

@Component({
  moduleId: module.id,
  selector: 'story-app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [ROUTER_DIRECTIVES, ModalComponent, SpinnerComponent, ToastComponent],
  providers: [
    HTTP_PROVIDERS,
    provide(XHRBackend, { useClass: InMemoryBackendService }),
    provide(SEED_DATA, { useClass: InMemoryStoryService }),
    provide(InMemoryBackendConfig, { useValue: { delay: 600 } }),
    CharacterService,
    EntityService,
    ExceptionService,
    MessageService,
    ModalService,
    SpinnerService,
    ToastService
  ]
})
export class AppComponent {
  public menuItems = [
    { caption: 'Dashboard', link: ['/dashboard'] },
    { caption: 'Characters', link: ['/characters'] },
    { caption: 'Vehicles', link: ['/vehicles'] }
  ];

  constructor(
    private messageService: MessageService,
    private modalService: ModalService) {
  }

  resetDb() {
    let msg = 'Are you sure you want to reset the database?';
    this.modalService.activate(msg).then(responseOK => {
      if (responseOK) {
        this.messageService.resetDb();
      }
    });
  }
}
