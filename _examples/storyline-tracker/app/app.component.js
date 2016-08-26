"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var router_1 = require('@angular/router');
require('rxjs/add/operator/catch');
require('rxjs/add/operator/do');
require('rxjs/add/operator/finally');
require('rxjs/add/operator/map');
var angular2_in_memory_web_api_1 = require('angular2-in-memory-web-api');
var in_memory_story_service_1 = require('../api/in-memory-story.service');
var shared_1 = require('./shared');
var AppComponent = (function () {
    function AppComponent(messageService, modalService) {
        this.messageService = messageService;
        this.modalService = modalService;
        this.menuItems = [
            { caption: 'Dashboard', link: ['/dashboard'] },
            { caption: 'Characters', link: ['/characters'] },
            { caption: 'Vehicles', link: ['/vehicles'] }
        ];
    }
    AppComponent.prototype.resetDb = function () {
        var _this = this;
        var msg = 'Are you sure you want to reset the database?';
        this.modalService.activate(msg).then(function (responseOK) {
            if (responseOK) {
                _this.messageService.resetDb();
            }
        });
    };
    AppComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'story-app',
            templateUrl: 'app.component.html',
            styleUrls: ['app.component.css'],
            directives: [router_1.ROUTER_DIRECTIVES, shared_1.ModalComponent, shared_1.SpinnerComponent, shared_1.ToastComponent],
            providers: [
                http_1.HTTP_PROVIDERS,
                core_1.provide(http_1.XHRBackend, { useClass: angular2_in_memory_web_api_1.InMemoryBackendService }),
                core_1.provide(angular2_in_memory_web_api_1.SEED_DATA, { useClass: in_memory_story_service_1.InMemoryStoryService }),
                core_1.provide(angular2_in_memory_web_api_1.InMemoryBackendConfig, { useValue: { delay: 600 } }),
                shared_1.CharacterService,
                shared_1.EntityService,
                shared_1.ExceptionService,
                shared_1.GuardService,
                shared_1.MessageService,
                shared_1.ModalService,
                shared_1.SpinnerService,
                shared_1.ToastService
            ]
        }), 
        __metadata('design:paramtypes', [shared_1.MessageService, shared_1.ModalService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map