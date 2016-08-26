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
    var CharacterComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            CharacterComponent = (function () {
                function CharacterComponent() {
                }
                __decorate([
                    core_1.Input(), 
                    __metadata('design:type', Object)
                ], CharacterComponent.prototype, "character", void 0);
                CharacterComponent = __decorate([
                    core_1.Component({
                        selector: 'story-character',
                        template: '<h3 *ngIf="character">You selected {{character.name}}</h3>',
                    }), 
                    __metadata('design:paramtypes', [])
                ], CharacterComponent);
                return CharacterComponent;
            }());
            exports_1("CharacterComponent", CharacterComponent);
        }
    }
});
//# sourceMappingURL=character.component.js.map