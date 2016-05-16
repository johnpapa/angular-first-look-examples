import { Component, provide } from '@angular/core';
import { HTTP_PROVIDERS, XHRBackend } from '@angular/http';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from '@angular/router-deprecated';
import 'rxjs/Rx'; // for now, til we start importing just what we need

import {
  InMemoryBackendConfig,
  InMemoryBackendService,
  SEED_DATA
} from 'angular2-in-memory-web-api/core';
import { InMemoryStoryService } from '../api/in-memory-story.service';
import { CharactersComponent } from './+characters';
import { DashboardComponent } from './+dashboard';
import { VehiclesComponent } from './+vehicles';
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
    ROUTER_PROVIDERS,
    CharacterService,
    EntityService,
    ExceptionService,
    MessageService,
    ModalService,
    SpinnerService,
    ToastService
  ]
})
@RouteConfig([
  { path: '/dashboard', name: 'Dashboard', component: DashboardComponent, useAsDefault: true },
  { path: '/vehicles/...', name: 'Vehicles', component: VehiclesComponent },
  { path: '/characters/...', name: 'Characters', component: CharactersComponent },
])
export class AppComponent {
  public menuItems = [
    { caption: 'Dashboard', link: ['Dashboard'] },
    { caption: 'Characters', link: ['Characters'] },
    { caption: 'Vehicles', link: ['Vehicles'] }
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
