System.register(['angular2/core'], function(exports_1) {
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
    var core_1;
    var Vehicle, VehicleService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            Vehicle = (function () {
                function Vehicle(id, name) {
                    this.id = id;
                    this.name = name;
                }
                return Vehicle;
            }());
            exports_1("Vehicle", Vehicle);
            VehicleService = (function () {
                function VehicleService() {
                }
                VehicleService.prototype.getVehicles = function () {
                    return [
                        new Vehicle(1, 'X-Wing Fighter'),
                        new Vehicle(2, 'B-Wing Fighter'),
                        new Vehicle(3, 'Y-Wing Fighter')
                    ];
                };
                VehicleService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [])
                ], VehicleService);
                return VehicleService;
            }());
            exports_1("VehicleService", VehicleService);
        }
    }
});
//# sourceMappingURL=vehicle.service.js.map