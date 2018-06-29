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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var models_1 = require("../../../models");
var CharacterButtonComponent = /** @class */ (function () {
    function CharacterButtonComponent() {
    }
    CharacterButtonComponent.prototype.ngOnInit = function () {
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", models_1.Character)
    ], CharacterButtonComponent.prototype, "character", void 0);
    CharacterButtonComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'story-character-button',
            templateUrl: './character-button.component.html',
            styleUrls: ['./character-button.component.css'],
        }),
        __metadata("design:paramtypes", [])
    ], CharacterButtonComponent);
    return CharacterButtonComponent;
}());
exports.CharacterButtonComponent = CharacterButtonComponent;
//# sourceMappingURL=character-button.component.js.map