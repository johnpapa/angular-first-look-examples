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
var shared_1 = require('../shared');
var shared_2 = require('../../../app/shared');
var CharacterListComponent = (function () {
    function CharacterListComponent(characterService, filterService) {
        this.characterService = characterService;
        this.filterService = filterService;
        this.filteredCharacters = this.characters;
    }
    CharacterListComponent.prototype.filterChanged = function (searchText) {
        this.filteredCharacters = this.filterService.filter(searchText, ['id', 'name', 'side'], this.characters);
    };
    CharacterListComponent.prototype.getCharacters = function () {
        var _this = this;
        this.characters = [];
        this.characterService.getCharacters()
            .subscribe(function (characters) {
            _this.characters = _this.filteredCharacters = characters;
            _this.filterComponent.clear();
        });
    };
    CharacterListComponent.prototype.ngOnDestroy = function () {
        this.dbResetSubscription.unsubscribe();
    };
    CharacterListComponent.prototype.ngOnInit = function () {
        var _this = this;
        componentHandler.upgradeDom();
        this.getCharacters();
        this.dbResetSubscription = this.characterService.onDbReset
            .subscribe(function () { return _this.getCharacters(); });
    };
    __decorate([
        core_1.ViewChild(shared_2.FilterTextComponent), 
        __metadata('design:type', shared_2.FilterTextComponent)
    ], CharacterListComponent.prototype, "filterComponent", void 0);
    CharacterListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'story-characters',
            templateUrl: 'character-list.component.html',
            directives: [shared_2.FilterTextComponent, router_1.ROUTER_DIRECTIVES],
            styleUrls: ['character-list.component.css'],
            pipes: [shared_1.SortCharactersPipe],
            providers: [shared_2.FilterService]
        }), 
        __metadata('design:paramtypes', [shared_2.CharacterService, shared_2.FilterService])
    ], CharacterListComponent);
    return CharacterListComponent;
}());
exports.CharacterListComponent = CharacterListComponent;
//# sourceMappingURL=character-list.component.js.map