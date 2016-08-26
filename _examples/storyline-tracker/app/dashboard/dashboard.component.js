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
var router_1 = require('@angular/router');
var observable_1 = require('rxjs/observable');
require('rxjs/add/observable/of');
var shared_1 = require('../../app/shared');
var DashboardComponent = (function () {
    function DashboardComponent(characterService, router, toastService) {
        this.characterService = characterService;
        this.router = router;
        this.toastService = toastService;
    }
    DashboardComponent.prototype.getCharacters = function () {
        var _this = this;
        // this._spinnerService.show();
        this.characters = this.characterService.getCharacters()
            .catch(function (e) {
            _this.toastService.activate("" + e);
            return observable_1.Observable.of([]);
        });
        // .finally(() => { this._spinnerService.hide(); })
    };
    DashboardComponent.prototype.gotoDetail = function (character) {
        var link = ['/characters', character.id];
        this.router.navigate(link);
    };
    DashboardComponent.prototype.ngOnDestroy = function () {
        this.dbResetSubscription.unsubscribe();
    };
    DashboardComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.getCharacters();
        this.dbResetSubscription = this.characterService.onDbReset
            .subscribe(function () { return _this.getCharacters(); });
    };
    DashboardComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'my-dashboard',
            templateUrl: 'dashboard.component.html',
            styleUrls: ['dashboard.component.css']
        }), 
        __metadata('design:paramtypes', [shared_1.CharacterService, router_1.Router, shared_1.ToastService])
    ], DashboardComponent);
    return DashboardComponent;
}());
exports.DashboardComponent = DashboardComponent;
//# sourceMappingURL=dashboard.component.js.map