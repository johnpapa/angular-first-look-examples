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
var http_1 = require("@angular/http");
var Observable_1 = require("rxjs/Observable");
var Vehicle = /** @class */ (function () {
    function Vehicle(id, name) {
        this.id = id;
        this.name = name;
    }
    return Vehicle;
}());
exports.Vehicle = Vehicle;
var VehicleService = /** @class */ (function () {
    function VehicleService(http) {
        this.http = http;
    }
    VehicleService.prototype.getVehicles = function () {
        return this.http
            .get('api/vehicles.json')
            .map(function (response) { return response.json().data; })
            .do(function (data) { return console.log(data); })
            .catch(this.handleError);
    };
    VehicleService.prototype.handleError = function (error) {
        console.error(error);
        var msg = "Error status code " + error.status + " at " + error.url;
        return Observable_1.Observable.throw(msg);
    };
    VehicleService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http])
    ], VehicleService);
    return VehicleService;
}());
exports.VehicleService = VehicleService;
//# sourceMappingURL=vehicle.service.js.map