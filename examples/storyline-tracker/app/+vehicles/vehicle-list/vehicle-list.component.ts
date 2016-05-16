import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { Subscription } from 'rxjs/Rx';

import { FilterTextComponent, FilterService, InitCapsPipe } from '../../../app/shared';
import { Vehicle, VehicleService } from '../shared';

@Component({
  moduleId: module.id,
  selector: 'story-vehicles',
  templateUrl: 'vehicle-list.component.html',
  directives: [FilterTextComponent, ROUTER_DIRECTIVES],
  styleUrls: ['vehicle-list.component.css'],
  pipes: [InitCapsPipe],
  providers: [FilterService]
})
export class VehicleListComponent implements OnDestroy, OnInit {
  private dbResetSubscription: Subscription;

  vehicles: Vehicle[];
  filteredVehicles = this.vehicles;
  @ViewChild(FilterTextComponent) filterComponent: FilterTextComponent;

  constructor(
    private filterService: FilterService,
    private vehicleService: VehicleService) { }

  filterChanged(searchText: string) {
    this.filteredVehicles = this.filterService.filter(searchText, ['id', 'name', 'type'], this.vehicles);
  }

  getVehicles() {
    this.vehicles = [];
    this.vehicleService.getVehicles()
      .subscribe(vehicles => {
        this.vehicles = this.filteredVehicles = vehicles;
        this.filterComponent.clear();
      });
  }

  ngOnDestroy() {
    this.dbResetSubscription.unsubscribe();
  }

  ngOnInit() {
    componentHandler.upgradeDom();
    this.getVehicles();
    this.dbResetSubscription = this.vehicleService.onDbReset
      .subscribe(() => this.getVehicles());
  }
}
