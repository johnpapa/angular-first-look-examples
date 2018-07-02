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
var vehicle_list_component_1 = require("./vehicle-list/vehicle-list.component");
var vehicle_component_1 = require("./vehicle/vehicle.component");
var vehicles_component_1 = require("./vehicles.component");
var vehicle_resolver_service_1 = require("./shared/vehicle-resolver.service");
var core_2 = require("../core");
var routes = [
    {
        path: '',
        component: vehicles_component_1.VehiclesComponent,
        children: [
            {
                path: '',
                component: vehicle_list_component_1.VehicleListComponent,
            },
            {
                path: ':id',
                component: vehicle_component_1.VehicleComponent,
                canDeactivate: [core_2.CanDeactivateGuard],
                resolve: {
                    vehicle: vehicle_resolver_service_1.VehicleResolver
                }
            },
        ]
    },
];
var VehiclesRoutingModule = /** @class */ (function () {
    function VehiclesRoutingModule() {
    }
    VehiclesRoutingModule = __decorate([
        core_1.NgModule({
            imports: [router_1.RouterModule.forChild(routes)],
            exports: [router_1.RouterModule],
            providers: [vehicle_resolver_service_1.VehicleResolver]
        })
    ], VehiclesRoutingModule);
    return VehiclesRoutingModule;
}());
exports.VehiclesRoutingModule = VehiclesRoutingModule;
exports.routedComponents = [vehicles_component_1.VehiclesComponent, vehicle_list_component_1.VehicleListComponent, vehicle_component_1.VehicleComponent];
//# sourceMappingURL=vehicles-routing.module.js.map