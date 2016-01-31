import { Component, OnDestroy, OnInit, ViewChild } from 'angular2/core';
import { ROUTER_DIRECTIVES } from 'angular2/router';
import { Observable, Subscription } from 'rxjs/Rx';

import { FilterTextComponent, FilterService, InitCapsPipe } from '../blocks/blocks';
import { Vehicle, VehicleService } from './vehicle.service';

@Component({
  selector: 'story-vehicles',
  templateUrl: './app/vehicles/vehicle-list.component.html',
  directives: [FilterTextComponent, ROUTER_DIRECTIVES],
  styleUrls: ['./app/vehicles/vehicle-list.component.css'],
  pipes: [InitCapsPipe],
  providers: [FilterService]
})
export class VehicleListComponent implements OnDestroy, OnInit {
  private _dbResetSubscription: Subscription<any>;

  vehicles: Vehicle[];
  filteredVehicles = this.vehicles;
  @ViewChild(FilterTextComponent) filterComponent: FilterTextComponent;

  constructor(
    private _filterService: FilterService,
    private _vehicleService: VehicleService) { }

  filterChanged(searchText: string) {
    this.filteredVehicles = this._filterService.filter(searchText, ['id', 'name', 'type'], this.vehicles);
  }

  getVehicles() {
    this.vehicles = [];
    this._vehicleService.getVehicles()
      .subscribe(vehicles => {
        this.vehicles = this.filteredVehicles = vehicles;
        this.filterComponent.clear();
      });
  }

  ngOnDestroy() {
    this._dbResetSubscription.unsubscribe();
  }

  ngOnInit() {
    componentHandler.upgradeDom();
    this.getVehicles();
    this._dbResetSubscription = this._vehicleService.onDbReset
      .subscribe(() => this.getVehicles());
  }
}
