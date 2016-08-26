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
var shared_1 = require('../../../app/shared');
var shared_2 = require('../shared');
var VehicleListComponent = (function () {
    function VehicleListComponent(filterService, vehicleService) {
        this.filterService = filterService;
        this.vehicleService = vehicleService;
        this.filteredVehicles = this.vehicles;
    }
    VehicleListComponent.prototype.filterChanged = function (searchText) {
        this.filteredVehicles = this.filterService.filter(searchText, ['id', 'name', 'type'], this.vehicles);
    };
    VehicleListComponent.prototype.getVehicles = function () {
        var _this = this;
        this.vehicles = [];
        this.vehicleService.getVehicles()
            .subscribe(function (vehicles) {
            _this.vehicles = _this.filteredVehicles = vehicles;
            _this.filterComponent.clear();
        });
    };
    VehicleListComponent.prototype.ngOnDestroy = function () {
        this.dbResetSubscription.unsubscribe();
    };
    VehicleListComponent.prototype.ngOnInit = function () {
        var _this = this;
        componentHandler.upgradeDom();
        this.getVehicles();
        this.dbResetSubscription = this.vehicleService.onDbReset
            .subscribe(function () { return _this.getVehicles(); });
    };
    __decorate([
        core_1.ViewChild(shared_1.FilterTextComponent), 
        __metadata('design:type', shared_1.FilterTextComponent)
    ], VehicleListComponent.prototype, "filterComponent", void 0);
    VehicleListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'story-vehicles',
            templateUrl: 'vehicle-list.component.html',
            directives: [shared_1.FilterTextComponent, router_1.ROUTER_DIRECTIVES],
            styleUrls: ['vehicle-list.component.css'],
            pipes: [shared_1.InitCapsPipe],
            providers: [shared_1.FilterService]
        }), 
        __metadata('design:paramtypes', [shared_1.FilterService, shared_2.VehicleService])
    ], VehicleListComponent);
    return VehicleListComponent;
}());
exports.VehicleListComponent = VehicleListComponent;
//# sourceMappingURL=vehicle-list.component.js.map