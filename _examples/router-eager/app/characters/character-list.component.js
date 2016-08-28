System.register(['angular2/core', 'angular2/router', './character.service'], function(exports_1) {
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
    var core_1, router_1, character_service_1;
    var CharacterListComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (character_service_1_1) {
                character_service_1 = character_service_1_1;
            }],
        execute: function() {
            CharacterListComponent = (function () {
                function CharacterListComponent(_characterService) {
                    this._characterService = _characterService;
                }
                CharacterListComponent.prototype.ngOnInit = function () {
                    this.characters = this._characterService.getCharacters();
                };
                CharacterListComponent = __decorate([
                    core_1.Component({
                        selector: 'story-characters',
                        templateUrl: './app/characters/character-list.component.html',
                        styles: ["\n    .characters {list-style-type: none;}\n    *.characters li {padding: 4px;cursor: pointer;}\n  "],
                        directives: [router_1.ROUTER_DIRECTIVES]
                    }), 
                    __metadata('design:paramtypes', [character_service_1.CharacterService])
                ], CharacterListComponent);
                return CharacterListComponent;
            }());
            exports_1("CharacterListComponent", CharacterListComponent);
        }
    }
});
//# sourceMappingURL=character-list.component.js.map