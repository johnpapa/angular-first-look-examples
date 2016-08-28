System.register(['angular2/core', 'angular2/http', '../config'], function(exports_1) {
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
    var core_1, http_1, config_1;
    var charactersUrl, CharacterService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (config_1_1) {
                config_1 = config_1_1;
            }],
        execute: function() {
            charactersUrl = config_1.CONFIG.baseUrls.characters;
            CharacterService = (function () {
                function CharacterService(_http) {
                    this._http = _http;
                }
                CharacterService.prototype.getCharacters = function () {
                    return this._http.get(charactersUrl)
                        .map(function (response) { return response.json().data; });
                };
                CharacterService.prototype.getCharacter = function (id) {
                    return this.getCharacters()
                        .map(function (characters) { return characters.find(function (character) { return character.id == id; }); });
                };
                CharacterService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [http_1.Http])
                ], CharacterService);
                return CharacterService;
            }());
            exports_1("CharacterService", CharacterService);
        }
    }
});
//# sourceMappingURL=character.service.js.map