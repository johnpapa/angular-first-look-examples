System.register(['angular2/core', 'angular2/http', 'angular2/router', 'rxjs/Rx', './characters/characters.component', './characters/character.service', './vehicles/vehicles.component'], function(exports_1) {
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
    var core_1, http_1, router_1, characters_component_1, character_service_1, vehicles_component_1;
    var AppComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (_1) {},
            function (characters_component_1_1) {
                characters_component_1 = characters_component_1_1;
            },
            function (character_service_1_1) {
                character_service_1 = character_service_1_1;
            },
            function (vehicles_component_1_1) {
                vehicles_component_1 = vehicles_component_1_1;
            }],
        execute: function() {
            AppComponent = (function () {
                function AppComponent() {
                }
                AppComponent = __decorate([
                    core_1.Component({
                        selector: 'story-app',
                        templateUrl: 'app/app.component.html',
                        styles: ["\n    nav ul {list-style-type: none;}\n    nav ul li {padding: 4px;cursor: pointer;display:inline-block}\n  "],
                        directives: [router_1.ROUTER_DIRECTIVES],
                        providers: [
                            http_1.HTTP_PROVIDERS,
                            router_1.ROUTER_PROVIDERS,
                            character_service_1.CharacterService
                        ]
                    }),
                    router_1.RouteConfig([
                        { path: '/dashboard', name: 'Dashboard', component: DashboardComponent, useAsDefault: true },
                        { path: '/characters/...', name: 'Characters', component: characters_component_1.CharactersComponent },
                        { path: '/vehicles/...', name: 'Vehicles', component: vehicles_component_1.VehiclesComponent }
                    ]), 
                    __metadata('design:paramtypes', [])
                ], AppComponent);
                return AppComponent;
            }());
            exports_1("AppComponent", AppComponent);
        }
    }
});
//# sourceMappingURL=app.component.js.map