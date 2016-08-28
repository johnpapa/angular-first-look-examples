System.register(['angular2/core', 'angular2/router', './vehicle-list.component', './vehicle.component', './vehicle.service'], function(exports_1) {
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
    var core_1, router_1, vehicle_list_component_1, vehicle_component_1, vehicle_service_1;
    var VehiclesComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
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
            VehiclesComponent = (function () {
                function VehiclesComponent() {
                }
                VehiclesComponent = __decorate([
                    core_1.Component({
                        selector: 'story-vehicles-root',
                        template: "\n    <router-outlet></router-outlet>\n  ",
                        directives: [router_1.ROUTER_DIRECTIVES],
                        providers: [vehicle_service_1.VehicleService]
                    }),
                    router_1.RouteConfig([
                        {
                            path: '/',
                            name: 'Vehicles',
                            component: vehicle_list_component_1.VehicleListComponent,
                            useAsDefault: true
                        },
                        {
                            path: '/:id',
                            name: 'Vehicle',
                            component: vehicle_component_1.VehicleComponent
                        }
                    ]), 
                    __metadata('design:paramtypes', [])
                ], VehiclesComponent);
                return VehiclesComponent;
            }());
            exports_1("VehiclesComponent", VehiclesComponent);
        }
    }
});
//# sourceMappingURL=vehicles.component.js.map