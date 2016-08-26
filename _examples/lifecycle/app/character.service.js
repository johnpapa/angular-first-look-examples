System.register(['angular2/core'], function(exports_1) {
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
    var core_1;
    var Character, CharacterService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            Character = (function () {
                function Character(id, name, side) {
                    this.id = id;
                    this.name = name;
                    this.side = side;
                }
                return Character;
            }());
            exports_1("Character", Character);
            CharacterService = (function () {
                function CharacterService() {
                }
                CharacterService.prototype.getCharacters = function () {
                    return [
                        new Character(1, 'Han Solo', 'light'),
                        new Character(2, 'Luke Skywalker', 'light'),
                        new Character(3, 'Kylo', 'dark'),
                        new Character(4, 'Rey', 'light')
                    ];
                };
                CharacterService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [])
                ], CharacterService);
                return CharacterService;
            }());
            exports_1("CharacterService", CharacterService);
        }
    }
});
//# sourceMappingURL=character.service.js.map