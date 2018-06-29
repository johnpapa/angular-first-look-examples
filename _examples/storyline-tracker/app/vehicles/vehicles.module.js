"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var vehicle_button_component_1 = require("./shared/vehicle-button/vehicle-button.component");
var vehicles_routing_module_1 = require("./vehicles-routing.module");
var shared_module_1 = require("../shared/shared.module");
var vehicle_service_1 = require("./shared/vehicle.service");
var VehiclesModule = /** @class */ (function () {
    function VehiclesModule() {
    }
    VehiclesModule = __decorate([
        core_1.NgModule({
            imports: [shared_module_1.SharedModule, vehicles_routing_module_1.VehiclesRoutingModule],
            declarations: [vehicle_button_component_1.VehicleButtonComponent, vehicles_routing_module_1.routedComponents],
            providers: [vehicle_service_1.VehicleService]
        })
    ], VehiclesModule);
    return VehiclesModule;
}());
exports.VehiclesModule = VehiclesModule;
// avoids having to lazy load with loadChildren: "app/vehicles/vehicle.module#VehicleModule"
//# sourceMappingURL=vehicles.module.js.map