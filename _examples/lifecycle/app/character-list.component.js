System.register(['angular2/core', './character.service', './character.component'], function(exports_1) {
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
    var core_1, character_service_1, character_component_1;
    var CharacterListComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (character_service_1_1) {
                character_service_1 = character_service_1_1;
            },
            function (character_component_1_1) {
                character_component_1 = character_component_1_1;
            }],
        execute: function() {
            CharacterListComponent = (function () {
                function CharacterListComponent(_characterService) {
                    this._characterService = _characterService;
                    this.characters = [];
                    this.messages = [];
                }
                CharacterListComponent.prototype.ngOnInit = function () {
                    this.characters = this._characterService.getCharacters();
                };
                CharacterListComponent.prototype.select = function (character) {
                    this.selectedCharacter = character;
                };
                CharacterListComponent.prototype.clear = function () {
                    this.selectedCharacter = null;
                };
                CharacterListComponent.prototype.log = function (msg) {
                    this.messages.splice(0, 0, msg);
                    console.log(msg);
                };
                CharacterListComponent = __decorate([
                    core_1.Component({
                        selector: 'my-character-list',
                        templateUrl: 'app/character-list.component.html',
                        styles: ['li {cursor: pointer;}'],
                        directives: [character_component_1.CharacterComponent]
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