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
var vehicle_service_1 = require("./vehicle.service");
var vehicles_routing_module_1 = require("./vehicles-routing.module");
var VehiclesModule = (function () {
    function VehiclesModule() {
    }
    return VehiclesModule;
}());
VehiclesModule = __decorate([
    core_1.NgModule({
        imports: [common_1.CommonModule, forms_1.FormsModule, vehicles_routing_module_1.VehiclesRoutingModule],
        declarations: [vehicles_routing_module_1.routedComponents],
        providers: [vehicle_service_1.VehicleService],
    })
], VehiclesModule);
exports.VehiclesModule = VehiclesModule;
//# sourceMappingURL=vehicles.module.js.map