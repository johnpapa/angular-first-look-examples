System.register(['angular2/core', 'angular2/router', './character.component', './character-list.component'], function(exports_1) {
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
    var core_1, router_1, character_component_1, character_list_component_1;
    var CharactersComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (character_component_1_1) {
                character_component_1 = character_component_1_1;
            },
            function (character_list_component_1_1) {
                character_list_component_1 = character_list_component_1_1;
            }],
        execute: function() {
            CharactersComponent = (function () {
                function CharactersComponent() {
                }
                CharactersComponent = __decorate([
                    core_1.Component({
                        selector: 'story-characters-root',
                        template: "\n    <router-outlet></router-outlet>\n  ",
                        directives: [router_1.ROUTER_DIRECTIVES]
                    }),
                    router_1.RouteConfig([
                        { path: '/', name: 'Characters', component: character_list_component_1.CharacterListComponent, useAsDefault: true },
                        { path: '/:id', name: 'Character', component: character_component_1.CharacterComponent }
                    ]), 
                    __metadata('design:paramtypes', [])
                ], CharactersComponent);
                return CharactersComponent;
            }());
            exports_1("CharactersComponent", CharactersComponent);
        }
    }
});
//# sourceMappingURL=characters.component.js.map