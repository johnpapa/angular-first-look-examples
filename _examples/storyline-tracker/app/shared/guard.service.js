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
var Observable_1 = require('rxjs/Observable');
require('rxjs/add/observable/fromPromise');
var GuardService = (function () {
    function GuardService() {
    }
    GuardService.prototype.canDeactivate = function (deactivate) {
        var p = Promise.resolve(deactivate);
        var o = Observable_1.Observable.fromPromise(p);
        return o;
    };
    GuardService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], GuardService);
    return GuardService;
}());
exports.GuardService = GuardService;
//# sourceMappingURL=guard.service.js.map