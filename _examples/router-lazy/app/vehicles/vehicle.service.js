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
var http_1 = require("@angular/http");
var config_1 = require("../config");
var vehiclesUrl = config_1.CONFIG.baseUrls.vehicles;
var Vehicle = (function () {
    function Vehicle() {
    }
    return Vehicle;
}());
exports.Vehicle = Vehicle;
var VehicleService = (function () {
    function VehicleService(http) {
        this.http = http;
        console.log('created vehicle service');
    }
    VehicleService.prototype.getVehicle = function (id) {
        return this.getVehicles()
            .map(function (vehicles) { return vehicles.find(function (vehicle) { return vehicle.id === id; }); });
    };
    VehicleService.prototype.getVehicles = function () {
        return this.http
            .get(vehiclesUrl)
            .map(function (response) { return response.json().data; });
    };
    return VehicleService;
}());
VehicleService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], VehicleService);
exports.VehicleService = VehicleService;
//# sourceMappingURL=vehicle.service.js.map