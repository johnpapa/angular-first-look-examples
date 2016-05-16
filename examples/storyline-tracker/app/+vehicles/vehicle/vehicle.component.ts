import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CanDeactivate, ComponentInstruction, RouteParams, Router } from '@angular/router-deprecated';
import { Subscription } from 'rxjs/Rx';

import { EntityService, ModalService, ToastService } from '../../../app/shared';
import { Vehicle, VehicleService } from '../shared';

@Component({
  moduleId: module.id,
  selector: 'story-vehicle',
  templateUrl: 'vehicle.component.html',
  styles: ['.mdl-textfield__label {top: 0;}']
})
export class VehicleComponent implements CanDeactivate, OnDestroy, OnInit {
  @Input() vehicle: Vehicle;

  editVehicle: Vehicle = <Vehicle>{};

  private dbResetSubscription: Subscription;
  private id: any;

  constructor(
    private entityService: EntityService,
    private modalService: ModalService,
    private routeParams: RouteParams,
    private router: Router,
    private toastService: ToastService,
    private vehicleService: VehicleService) { }

  cancel(showToast = true) {
    this.editVehicle = this.entityService.clone(this.vehicle);
    if (showToast) {
      this.toastService.activate(`Cancelled changes to ${this.vehicle.name}`);
    }
  }

  delete() {
    let msg = `Do you want to delete the ${this.vehicle.name}?`;
    this.modalService.activate(msg).then((responseOK) => {
      if (responseOK) {
        this.cancel(false);
        this.vehicleService.deleteVehicle(this.vehicle)
          .subscribe(() => { // Success path
            this.toastService.activate(`Deleted ${this.vehicle.name}`);
            this.gotoVehicles();
          },
          (err) => this.handleServiceError('Delete', err), // Failure path
          () => console.log('Delete Completed') // Completed actions
          );
      }
    });
  }

  isAddMode() {
    return isNaN(this.id);
  }

  ngOnDestroy() {
    this.dbResetSubscription.unsubscribe();
  }

  ngOnInit() {
    componentHandler.upgradeDom();
    this.id = +this.routeParams.get('id');
    this.getVehicle();
    this.dbResetSubscription = this.vehicleService.onDbReset
      .subscribe(() => {
        this.getVehicle();
      });
  }

  routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    return !this.vehicle ||
      !this.isDirty() ||
      this.modalService.activate();
  }

  save() {
    let vehicle = this.vehicle = this.entityService.merge(this.vehicle, this.editVehicle);
    if (vehicle.id == null) {
      this.vehicleService.addVehicle(vehicle)
        .subscribe(v => {
          this.setEditVehicle(v);
          this.toastService.activate(`Successfully added ${v.name}`);
          this.gotoVehicles();
        });
      return;
    }
    this.vehicleService.updateVehicle(this.vehicle)
      .subscribe(() => this.toastService.activate(`Successfully saved ${this.vehicle.name}`));
  }

  private getVehicle() {
    if (this.id === 0) {
      return;
    }
    if (this.isAddMode()) {
      this.vehicle = <Vehicle>{ name: '', type: '' };
      this.editVehicle = this.entityService.clone(this.vehicle);
      return;
    }
    this.vehicleService.getVehicle(this.id)
      .subscribe((vehicle: Vehicle) => this.setEditVehicle(vehicle));
  }

  private gotoVehicles() {
    this.router.navigate(['Vehicles']);
  }

  private handleServiceError(op: string, err: any) {
    console.error(`${op} error: ${err.message || err}`);
  }

  private isDirty() {
    return this.entityService.propertiesDiffer(this.vehicle, this.editVehicle);
  }

  private setEditVehicle(vehicle: Vehicle) {
    if (vehicle) {
      this.vehicle = vehicle;
      this.editVehicle = this.entityService.clone(this.vehicle);
    } else {
      this.gotoVehicles();
    }
  }
}
