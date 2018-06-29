"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var character_list_component_1 = require("./character-list/character-list.component");
var character_component_1 = require("./character/character.component");
var characters_component_1 = require("./characters.component");
var core_2 = require("../core");
var routes = [
    {
        path: '',
        component: characters_component_1.CharactersComponent,
        children: [
            {
                path: '',
                component: character_list_component_1.CharacterListComponent,
            },
            {
                path: ':id',
                component: character_component_1.CharacterComponent,
                canDeactivate: [core_2.CanDeactivateGuard]
            },
        ]
    },
];
var CharactersRoutingModule = /** @class */ (function () {
    function CharactersRoutingModule() {
    }
    CharactersRoutingModule = __decorate([
        core_1.NgModule({
            imports: [router_1.RouterModule.forChild(routes)],
            exports: [router_1.RouterModule],
        })
    ], CharactersRoutingModule);
    return CharactersRoutingModule;
}());
exports.CharactersRoutingModule = CharactersRoutingModule;
exports.routedComponents = [characters_component_1.CharactersComponent, character_list_component_1.CharacterListComponent, character_component_1.CharacterComponent];
//# sourceMappingURL=characters-routing.module.js.map