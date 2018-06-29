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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var Observable_1 = require("rxjs/Observable");
var vehicle_model_1 = require("./vehicle.model");
var vehicle_service_1 = require("./vehicle.service");
var VehicleResolver = /** @class */ (function () {
    function VehicleResolver(vehicleService, router) {
        this.vehicleService = vehicleService;
        this.router = router;
    }
    VehicleResolver.prototype.resolve = function (route, state) {
        var _this = this;
        var id = +route.params['id'];
        return this.vehicleService.getVehicle(id)
            .map(function (vehicle) {
            if (vehicle) {
                return vehicle;
            }
            // Return a new object, because we're going to create a new one
            return new vehicle_model_1.Vehicle();
            // We could throw an error here and catch it
            // and route back to the speaker list
            // let msg = `vehicle id ${id} not found`;
            // console.log(msg);
            // throw new Error(msg)
        })
            .catch(function (error) {
            console.log(error + ". Heading back to vehicle list");
            _this.router.navigate(['/vehicles']);
            return Observable_1.Observable.of(null);
        });
    };
    VehicleResolver = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [vehicle_service_1.VehicleService,
            router_1.Router])
    ], VehicleResolver);
    return VehicleResolver;
}());
exports.VehicleResolver = VehicleResolver;
//# sourceMappingURL=vehicle-resolver.service.js.map