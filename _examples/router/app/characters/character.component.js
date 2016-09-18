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
var character_service_1 = require('../characters/character.service');
var CharacterComponent = (function () {
    function CharacterComponent(characterService, route, router) {
        this.characterService = characterService;
        this.route = route;
        this.router = router;
    }
    CharacterComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (!this.character) {
            this.route
                .params
                .map(function (params) { return params['id']; })
                .do(function (id) { return _this.id = +id; })
                .subscribe(function (id) { return _this.getCharacter(); });
        }
    };
    CharacterComponent.prototype.getCharacter = function () {
        var _this = this;
        this.characterService.getCharacter(this.id)
            .subscribe(function (character) { return _this.setEditCharacter(character); });
    };
    CharacterComponent.prototype.gotoCharacters = function () {
        var route = ['/characters'];
        this.router.navigate(route);
    };
    CharacterComponent.prototype.setEditCharacter = function (character) {
        if (character) {
            this.character = character;
        }
        else {
            this.gotoCharacters();
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', character_service_1.Character)
    ], CharacterComponent.prototype, "character", void 0);
    CharacterComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'story-character',
            templateUrl: 'character.component.html'
        }), 
        __metadata('design:paramtypes', [character_service_1.CharacterService, router_1.ActivatedRoute, router_1.Router])
    ], CharacterComponent);
    return CharacterComponent;
}());
exports.CharacterComponent = CharacterComponent;
//# sourceMappingURL=character.component.js.map