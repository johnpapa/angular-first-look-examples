System.register(['angular2/core', 'angular2/http', 'angular2/router', 'rxjs/Rx', './characters/character-list.component', './characters/character.component', './characters/character.service', './vehicles/vehicle-list.component', './vehicles/vehicle.component', './vehicles/vehicle.service'], function(exports_1) {
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
    var core_1, http_1, router_1, character_list_component_1, character_component_1, character_service_1, vehicle_list_component_1, vehicle_component_1, vehicle_service_1;
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
            function (character_list_component_1_1) {
                character_list_component_1 = character_list_component_1_1;
            },
            function (character_component_1_1) {
                character_component_1 = character_component_1_1;
            },
            function (character_service_1_1) {
                character_service_1 = character_service_1_1;
            },
            function (vehicle_list_component_1_1) {
                vehicle_list_component_1 = vehicle_list_component_1_1;
            },
            function (vehicle_component_1_1) {
                vehicle_component_1 = vehicle_component_1_1;
            },
            function (vehicle_service_1_1) {
                vehicle_service_1 = vehicle_service_1_1;
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
                            character_service_1.CharacterService,
                            vehicle_service_1.VehicleService
                        ]
                    }),
                    router_1.RouteConfig([
                        { path: '/characters', name: 'Characters', component: character_list_component_1.CharacterListComponent, useAsDefault: true },
                        { path: '/character/:id', name: 'Character', component: character_component_1.CharacterComponent },
                        { path: '/vehicles', name: 'Vehicles', component: vehicle_list_component_1.VehicleListComponent },
                        { path: '/vehicle/:id', name: 'Vehicle', component: vehicle_component_1.VehicleComponent }
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