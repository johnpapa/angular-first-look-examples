"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var character_service_1 = require("./character.service");
var characters_routing_module_1 = require("./characters-routing.module");
var CharactersModule = (function () {
    function CharactersModule() {
    }
    return CharactersModule;
}());
CharactersModule = __decorate([
    core_1.NgModule({
        imports: [common_1.CommonModule, forms_1.FormsModule, characters_routing_module_1.CharactersRouterModule],
        declarations: [characters_routing_module_1.routedComponents],
        providers: [character_service_1.CharacterService],
    })
], CharactersModule);
exports.CharactersModule = CharactersModule;
//# sourceMappingURL=characters.module.js.map