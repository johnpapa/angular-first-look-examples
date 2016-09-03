import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { CanComponentDeactivate, EntityService, ModalService, ToastService } from '../../core';
import { Vehicle } from '../shared/vehicle.model';
import { VehicleService } from '../shared/vehicle.service';

@Component({
  moduleId: module.id,
  selector: 'story-vehicle',
  templateUrl: 'vehicle.component.html',
  styleUrls: ['vehicle.component.css']
})
export class VehicleComponent implements OnDestroy, OnInit, CanComponentDeactivate {
  @Input() vehicle: Vehicle;
  editVehicle: Vehicle = <Vehicle>{};

  private dbResetSubscription: Subscription;
  private id: any;

  constructor(private entityService: EntityService,
    private modalService: ModalService,
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private toastService: ToastService) { }

  cancel(showToast = true) {
    this.editVehicle = this.entityService.clone(this.vehicle);
    if (showToast) {
      this.toastService.activate(`Cancelled changes to ${this.vehicle.name}`);
    }
  }

  canDeactivate() {
    return !this.vehicle ||
      !this.isDirty() ||
      this.modalService.activate();
  }

  delete() {
    let msg = `Do you want to delete the ${this.vehicle.name}?`;
    this.modalService.activate(msg).then((responseOK) => {
      if (responseOK) {
        this.cancel(false);
        this.vehicleService.deleteVehicle(this.vehicle)
          .subscribe(
          () => { // Success path
            this.toastService.activate(`Deleted ${this.vehicle.name}`);
            this.gotoVehicles();
          },
          (err) => this.handleServiceError('Delete', err), // Failure path
          () => console.log('Delete Completed') // Completed actions
          );
      }
    });
  }

  isAddMode() { return isNaN(this.id); }

  ngOnDestroy() {
    this.dbResetSubscription.unsubscribe();
  }

  ngOnInit() {
    componentHandler.upgradeDom();
    this.dbResetSubscription =
      this.vehicleService.onDbReset.subscribe(() => this.getVehicle());

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
    this.route.data.subscribe((data: { vehicle: Vehicle }) => {
      this.setEditVehicle(data.vehicle);
      this.id = this.vehicle.id;
    });
  }

  save() {
    let vehicle = this.vehicle =
      this.entityService.merge(this.vehicle, this.editVehicle);
    if (vehicle.id == null) {
      this.vehicleService.addVehicle(vehicle).subscribe(s => {
        this.setEditVehicle(s);
        this.toastService.activate(`Successfully added ${s.name}`);
        this.gotoVehicles();
      });
      return;
    }
    this.vehicleService.updateVehicle(this.vehicle)
      .subscribe(() => this.toastService.activate(
        `Successfully saved ${this.vehicle.name}`));
  }

  private getVehicle() {
    if (this.id === 0) {
      return;
    };
    if (this.isAddMode()) {
      this.vehicle = <Vehicle>{ name: '', type: '' };
      this.editVehicle = this.entityService.clone(this.vehicle);
      return;
    }
    this.vehicleService.getVehicle(this.id).subscribe(
      (vehicle: Vehicle) => this.setEditVehicle(vehicle));
  }

  private gotoVehicles() {
    this.router.navigate(['/vehicles']);
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
