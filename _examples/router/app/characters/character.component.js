System.register(['angular2/core', 'angular2/router', '../characters/character.service'], function(exports_1) {
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
    var CharacterComponent;
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
            CharacterComponent = (function () {
                function CharacterComponent(_characterService, _routeParams, _router) {
                    this._characterService = _characterService;
                    this._routeParams = _routeParams;
                    this._router = _router;
                }
                CharacterComponent.prototype.ngOnInit = function () {
                    var _this = this;
                    if (!this.character) {
                        var id = +this._routeParams.get('id');
                        this._characterService.getCharacter(id)
                            .subscribe(function (character) { return _this._setEditCharacter(character); });
                    }
                };
                CharacterComponent.prototype._gotoCharacters = function () {
                    var route = ['Characters', { id: this.character ? this.character.id : null }];
                    this._router.navigate(route);
                };
                CharacterComponent.prototype._setEditCharacter = function (character) {
                    if (character) {
                        this.character = character;
                    }
                    else {
                        this._gotoCharacters();
                    }
                };
                __decorate([
                    core_1.Input(), 
                    __metadata('design:type', Object)
                ], CharacterComponent.prototype, "character", void 0);
                CharacterComponent = __decorate([
                    core_1.Component({
                        selector: 'story-character',
                        templateUrl: 'app/characters/character.component.html'
                    }), 
                    __metadata('design:paramtypes', [character_service_1.CharacterService, router_1.RouteParams, router_1.Router])
                ], CharacterComponent);
                return CharacterComponent;
            }());
            exports_1("CharacterComponent", CharacterComponent);
        }
    }
});
//# sourceMappingURL=character.component.js.map