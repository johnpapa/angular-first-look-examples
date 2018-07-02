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
var core_2 = require("../../core");
var vehicle_model_1 = require("../shared/vehicle.model");
var vehicle_service_1 = require("../shared/vehicle.service");
var VehicleComponent = /** @class */ (function () {
    function VehicleComponent(entityService, modalService, route, router, vehicleService, toastService) {
        this.entityService = entityService;
        this.modalService = modalService;
        this.route = route;
        this.router = router;
        this.vehicleService = vehicleService;
        this.toastService = toastService;
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
        return !this.vehicle ||
            !this.isDirty() ||
            this.modalService.activate();
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
                );
            }
        });
    };
    VehicleComponent.prototype.isAddMode = function () { return isNaN(this.id); };
    VehicleComponent.prototype.ngOnDestroy = function () {
        this.dbResetSubscription.unsubscribe();
    };
    VehicleComponent.prototype.ngOnInit = function () {
        var _this = this;
        componentHandler.upgradeDom();
        this.dbResetSubscription =
            this.vehicleService.onDbReset.subscribe(function () { return _this.getVehicle(); });
        // ** Could use a snapshot here, as long as the parameters do not change.
        // ** This may happen when a component is re-used, such as fwd/back.
        // this.id = +this.route.snapshot.params['id'];
        //
        // ** We could use a subscription to get the parameter, too.
        // ** The ActivatedRoute gets unsubscribed
        // this.route
        //   .params
        //   .map(params => params['id'])
        //   .do(id => this.id = +id)
        //   .subscribe(id => this.getVehicle());
        //
        // ** Instead we will use a Resolve(r)
        this.route.data.subscribe(function (data) {
            _this.setEditVehicle(data.vehicle);
            _this.id = _this.vehicle.id;
        });
    };
    VehicleComponent.prototype.save = function () {
        var _this = this;
        var vehicle = this.vehicle =
            this.entityService.merge(this.vehicle, this.editVehicle);
        if (vehicle.id == null) {
            this.vehicleService.addVehicle(vehicle).subscribe(function (s) {
                _this.setEditVehicle(s);
                _this.toastService.activate("Successfully added " + s.name);
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
        ;
        if (this.isAddMode()) {
            this.vehicle = { name: '', type: '' };
            this.editVehicle = this.entityService.clone(this.vehicle);
            return;
        }
        this.vehicleService.getVehicle(this.id).subscribe(function (vehicle) { return _this.setEditVehicle(vehicle); });
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
        __metadata("design:type", vehicle_model_1.Vehicle)
    ], VehicleComponent.prototype, "vehicle", void 0);
    VehicleComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'story-vehicle',
            templateUrl: './vehicle.component.html',
            styleUrls: ['./vehicle.component.css']
        }),
        __metadata("design:paramtypes", [core_2.EntityService,
            core_2.ModalService,
            router_1.ActivatedRoute,
            router_1.Router,
            vehicle_service_1.VehicleService,
            core_2.ToastService])
    ], VehicleComponent);
    return VehicleComponent;
}());
exports.VehicleComponent = VehicleComponent;
//# sourceMappingURL=vehicle.component.js.map