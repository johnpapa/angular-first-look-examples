import { Component, Input, OnDestroy, OnInit } from 'angular2/core';
import { CanDeactivate, ComponentInstruction, RouteParams, Router, ROUTER_DIRECTIVES } from 'angular2/router';
import { Observable, Subscription } from 'rxjs/Rx';

import { EntityService, ModalService, ToastService } from '../blocks/blocks';
import { Vehicle, VehicleService } from '../vehicles/vehicle.service';

@Component({
  selector: 'story-vehicle',
  templateUrl: 'app/vehicles/vehicle.component.html',
  styles: ['.mdl-textfield__label {top: 0;}'],
  directives: [ROUTER_DIRECTIVES]
})
export class VehicleComponent implements CanDeactivate, OnDestroy, OnInit {
  private _dbResetSubscription: Subscription<any>;

  @Input() vehicle: Vehicle;
  editVehicle: Vehicle = <Vehicle>{};

  constructor(
    private _entityService: EntityService,
    private _modalService: ModalService,
    private _routeParams: RouteParams,
    private _router: Router,
    private _toastService: ToastService,
    private _vehicleService: VehicleService) { }

  cancel(showToast = true) {
    this.editVehicle = this._entityService.clone(this.vehicle);
    if (showToast) {
      this._toastService.activate(`Cancelled changes to ${this.vehicle.name}`);
    }
  }

  delete() {
    let msg = `Do you want to delete the ${this.vehicle.name}?`;
    this._modalService.activate(msg).then((responseOK) => {
      if (responseOK) {
        this.cancel(false);
        this._vehicleService.deleteVehicle(this.vehicle)
          .subscribe(() => { // Success path
            this._toastService.activate(`Deleted ${this.vehicle.name}`);
            this._gotoVehicles();
          },
          (err) => this._handleServiceError('Delete', err), // Failure path
          () => console.log('Delete Completed') // Completed actions
          );
      }
    });
  }

  isAddMode() {
    let id = +this._routeParams.get('id');
    return isNaN(id);
  }

  ngOnDestroy() {
    this._dbResetSubscription.unsubscribe();
  }

  ngOnInit() {
    componentHandler.upgradeDom();
    this._getVehicle();
    this._dbResetSubscription = this._vehicleService.onDbReset
      .subscribe(() => {
        this._getVehicle();
      });
  }

  routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    return !this.vehicle ||
      !this._isDirty() ||
      this._modalService.activate();
  }

  save() {
    let vehicle = this.vehicle = this._entityService.merge(this.vehicle, this.editVehicle);
    if (vehicle.id == null) {
      this._vehicleService.addVehicle(vehicle)
        .subscribe(v => {
          this._setEditVehicle(v);
          this._toastService.activate(`Successfully added ${v.name}`);
          this._gotoVehicles();
        });
      return;
    }
    this._vehicleService.updateVehicle(this.vehicle)
      .subscribe(() => this._toastService.activate(`Successfully saved ${this.vehicle.name}`));
  }

  private _getVehicle() {
    let id = +this._routeParams.get('id');
    if (id === 0) return;
    if (this.isAddMode()) {
      this.vehicle = <Vehicle>{ name: '', type: '' };
      this.editVehicle = this._entityService.clone(this.vehicle);
      return;
    }
    this._vehicleService.getVehicle(id)
      .subscribe((vehicle: Vehicle) => this._setEditVehicle(vehicle));
  }

  private _gotoVehicles() {
    let id = this.vehicle ? this.vehicle.id : null;
    let route = ['Vehicles', { id: id }];
    this._router.navigate(route);
  }

  private _handleServiceError(op: string, err: any) {
    console.error(`${op} error: ${err.message || err}`);
  }

  private _isDirty() {
    return this._entityService.propertiesDiffer(this.vehicle, this.editVehicle);
  }

  private _setEditVehicle(vehicle: Vehicle) {
    if (vehicle) {
      this.vehicle = vehicle;
      this.editVehicle = this._entityService.clone(this.vehicle);
    } else {
      this._gotoVehicles();
    }
  }
}
