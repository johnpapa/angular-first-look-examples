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
var VehicleComponent = (function () {
    function VehicleComponent(entityService, modalService, guardService, route, router, toastService, vehicleService) {
        this.entityService = entityService;
        this.modalService = modalService;
        this.guardService = guardService;
        this.route = route;
        this.router = router;
        this.toastService = toastService;
        this.vehicleService = vehicleService;
        this.editVehicle = {};
    }
    VehicleComponent.prototype.cancel = function (showToast) {
        if (showToast === void 0) { showToast = true; }
        this.editVehicle = this.entityService.clone(this.vehicle);
        if (showToast) {
            this.toastService.activate("Cancelled changes to " + this.vehicle.name);
        }
    };
    VehicleComponent.prototype.canDeactivate = function () {
        var deactivate = !this.vehicle ||
            !this.isDirty() ||
            this.modalService.activate();
        return this.guardService.canDeactivate(deactivate);
    };
    VehicleComponent.prototype.delete = function () {
        var _this = this;
        var msg = "Do you want to delete the " + this.vehicle.name + "?";
        this.modalService.activate(msg).then(function (responseOK) {
            if (responseOK) {
                _this.cancel(false);
                _this.vehicleService.deleteVehicle(_this.vehicle)
                    .subscribe(function () {
                    _this.toastService.activate("Deleted " + _this.vehicle.name);
                    _this.gotoVehicles();
                }, function (err) { return _this.handleServiceError('Delete', err); }, // Failure path
                function () { return console.log('Delete Completed'); } // Completed actions
                 // Completed actions
                );
            }
        });
    };
    VehicleComponent.prototype.isAddMode = function () {
        return isNaN(this.id);
    };
    VehicleComponent.prototype.ngOnDestroy = function () {
        this.dbResetSubscription.unsubscribe();
        if (this.routerSub) {
            this.routerSub.unsubscribe();
        }
    };
    VehicleComponent.prototype.ngOnInit = function () {
        var _this = this;
        componentHandler.upgradeDom();
        this.dbResetSubscription = this.vehicleService.onDbReset
            .subscribe(function () {
            _this.getVehicle();
        });
        this.routerSub = this.route.params.subscribe(function (params) {
            _this.id = +params['id'];
            _this.getVehicle();
        });
    };
    VehicleComponent.prototype.save = function () {
        var _this = this;
        var vehicle = this.vehicle = this.entityService.merge(this.vehicle, this.editVehicle);
        if (vehicle.id == null) {
            this.vehicleService.addVehicle(vehicle)
                .subscribe(function (v) {
                _this.setEditVehicle(v);
                _this.toastService.activate("Successfully added " + v.name);
                _this.gotoVehicles();
            });
            return;
        }
        this.vehicleService.updateVehicle(this.vehicle)
            .subscribe(function () { return _this.toastService.activate("Successfully saved " + _this.vehicle.name); });
    };
    VehicleComponent.prototype.getVehicle = function () {
        var _this = this;
        if (this.id === 0) {
            return;
        }
        if (this.isAddMode()) {
            this.vehicle = { name: '', type: '' };
            this.editVehicle = this.entityService.clone(this.vehicle);
            return;
        }
        this.vehicleService.getVehicle(this.id)
            .subscribe(function (vehicle) { return _this.setEditVehicle(vehicle); });
    };
    VehicleComponent.prototype.gotoVehicles = function () {
        this.router.navigate(['/vehicles']);
    };
    VehicleComponent.prototype.handleServiceError = function (op, err) {
        console.error(op + " error: " + (err.message || err));
    };
    VehicleComponent.prototype.isDirty = function () {
        return this.entityService.propertiesDiffer(this.vehicle, this.editVehicle);
    };
    VehicleComponent.prototype.setEditVehicle = function (vehicle) {
        if (vehicle) {
            this.vehicle = vehicle;
            this.editVehicle = this.entityService.clone(this.vehicle);
        }
        else {
            this.gotoVehicles();
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', shared_2.Vehicle)
    ], VehicleComponent.prototype, "vehicle", void 0);
    VehicleComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'story-vehicle',
            templateUrl: 'vehicle.component.html',
            styles: ['.mdl-textfield__label {top: 0;}']
        }), 
        __metadata('design:paramtypes', [shared_1.EntityService, shared_1.ModalService, shared_1.GuardService, router_1.ActivatedRoute, router_1.Router, shared_1.ToastService, shared_2.VehicleService])
    ], VehicleComponent);
    return VehicleComponent;
}());
exports.VehicleComponent = VehicleComponent;
//# sourceMappingURL=vehicle.component.js.map