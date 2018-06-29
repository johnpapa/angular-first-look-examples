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
var core_2 = require("../../core");
var vehiclesUrl = core_2.CONFIG.baseUrls.vehicles;
var VehicleService = /** @class */ (function () {
    function VehicleService(http, exceptionService, messageService, spinnerService) {
        var _this = this;
        this.http = http;
        this.exceptionService = exceptionService;
        this.messageService = messageService;
        this.spinnerService = spinnerService;
        this.onDbReset = this.messageService.state;
        this.messageService.state.subscribe(function (state) { return _this.getVehicles(); });
    }
    VehicleService.prototype.addVehicle = function (vehicle) {
        var _this = this;
        var body = JSON.stringify(vehicle);
        this.spinnerService.show();
        return this.http
            .post("" + vehiclesUrl, body)
            .map(function (res) { return res.json().data; })
            .catch(this.exceptionService.catchBadResponse)
            .finally(function () { return _this.spinnerService.hide(); });
    };
    VehicleService.prototype.deleteVehicle = function (vehicle) {
        var _this = this;
        this.spinnerService.show();
        return this.http
            .delete(vehiclesUrl + "/" + vehicle.id)
            .map(function (res) { return _this.extractData(res); })
            .catch(this.exceptionService.catchBadResponse)
            .finally(function () { return _this.spinnerService.hide(); });
    };
    VehicleService.prototype.getVehicles = function () {
        var _this = this;
        this.spinnerService.show();
        return this.http
            .get(vehiclesUrl)
            .map(function (res) { return _this.extractData(res); })
            .catch(this.exceptionService.catchBadResponse)
            .finally(function () { return _this.spinnerService.hide(); });
    };
    VehicleService.prototype.extractData = function (res) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        var body = res.json ? res.json() : null;
        return (body && body.data || {});
    };
    VehicleService.prototype.getVehicle = function (id) {
        var _this = this;
        this.spinnerService.show();
        return this.http
            .get(vehiclesUrl + "/" + id)
            .map(function (res) { return _this.extractData(res); })
            .catch(this.exceptionService.catchBadResponse)
            .finally(function () { return _this.spinnerService.hide(); });
    };
    VehicleService.prototype.updateVehicle = function (vehicle) {
        var _this = this;
        var body = JSON.stringify(vehicle);
        this.spinnerService.show();
        return this.http
            .put(vehiclesUrl + "/" + vehicle.id, body)
            .map(function (res) { return _this.extractData(res); })
            .catch(this.exceptionService.catchBadResponse)
            .finally(function () { return _this.spinnerService.hide(); });
    };
    VehicleService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http,
            core_2.ExceptionService,
            core_2.MessageService,
            core_2.SpinnerService])
    ], VehicleService);
    return VehicleService;
}());
exports.VehicleService = VehicleService;
//# sourceMappingURL=vehicle.service.js.map