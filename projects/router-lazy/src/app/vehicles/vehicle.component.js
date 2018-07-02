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
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var vehicle_service_1 = require("./vehicle.service");
var VehicleComponent = (function () {
    function VehicleComponent(route, router, vehicleService) {
        this.route = route;
        this.router = router;
        this.vehicleService = vehicleService;
    }
    VehicleComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (!this.vehicle) {
            this.route
                .params
                .map(function (params) { return params['id']; })
                .do(function (id) { return _this.id = +id; })
                .subscribe(function (id) { return _this.getVehicle(); });
        }
    };
    VehicleComponent.prototype.getVehicle = function () {
        var _this = this;
        this.vehicleService.getVehicle(this.id)
            .subscribe(function (vehicle) { return _this.setEditVehicle(vehicle); });
    };
    VehicleComponent.prototype.gotoVehicles = function () {
        var route = ['/vehicles'];
        this.router.navigate(route);
    };
    VehicleComponent.prototype.setEditVehicle = function (vehicle) {
        if (vehicle) {
            this.vehicle = vehicle;
        }
        else {
            this.gotoVehicles();
        }
    };
    return VehicleComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", vehicle_service_1.Vehicle)
], VehicleComponent.prototype, "vehicle", void 0);
VehicleComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'story-vehicle',
        templateUrl: 'vehicle.component.html'
    }),
    __metadata("design:paramtypes", [router_1.ActivatedRoute,
        router_1.Router,
        vehicle_service_1.VehicleService])
], VehicleComponent);
exports.VehicleComponent = VehicleComponent;
//# sourceMappingURL=vehicle.component.js.map