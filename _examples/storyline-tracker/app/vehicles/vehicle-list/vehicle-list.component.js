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
var filter_text_component_1 = require("../../shared/filter-text/filter-text.component");
var filter_text_service_1 = require("../../shared/filter-text/filter-text.service");
var vehicle_service_1 = require("../shared/vehicle.service");
var VehicleListComponent = /** @class */ (function () {
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
        }, function (error) {
            console.log('error occurred here');
            console.log(error);
        }, function () {
            console.log('vehicle retrieval completed');
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
    VehicleListComponent.prototype.trackByVehicles = function (index, vehicle) {
        return vehicle.id;
    };
    __decorate([
        core_1.ViewChild(filter_text_component_1.FilterTextComponent),
        __metadata("design:type", filter_text_component_1.FilterTextComponent)
    ], VehicleListComponent.prototype, "filterComponent", void 0);
    VehicleListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'story-vehicle-list',
            templateUrl: './vehicle-list.component.html',
            styleUrls: ['./vehicle-list.component.css']
        }),
        __metadata("design:paramtypes", [filter_text_service_1.FilterTextService,
            vehicle_service_1.VehicleService])
    ], VehicleListComponent);
    return VehicleListComponent;
}());
exports.VehicleListComponent = VehicleListComponent;
//# sourceMappingURL=vehicle-list.component.js.map