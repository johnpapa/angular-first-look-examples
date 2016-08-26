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
var core_1 = require('@angular/core');
var router_1 = require('@angular/router');
var shared_1 = require('./shared');
var VehiclesComponent = (function () {
    function VehiclesComponent() {
    }
    VehiclesComponent = __decorate([
        core_1.Component({
            selector: 'story-vehicles',
            template: "\n    <router-outlet></router-outlet>\n  ",
            directives: [router_1.ROUTER_DIRECTIVES],
            providers: [shared_1.VehicleService]
        }), 
        __metadata('design:paramtypes', [])
    ], VehiclesComponent);
    return VehiclesComponent;
}());
exports.VehiclesComponent = VehiclesComponent;
//# sourceMappingURL=vehicles.component.js.map