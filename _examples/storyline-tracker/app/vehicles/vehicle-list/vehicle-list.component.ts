import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { FilterTextComponent } from '../../shared/filter-text/filter-text.component';
import { FilterTextService } from '../../shared/filter-text/filter-text.service';
import { Vehicle } from '../shared/vehicle.model';
import { VehicleService } from '../shared/vehicle.service';

@Component({
  moduleId: module.id,
  selector: 'story-vehicle-list',
  templateUrl: 'vehicle-list.component.html',
  styleUrls: ['vehicle-list.component.css']
})
export class VehicleListComponent implements OnDestroy, OnInit {
  private dbResetSubscription: Subscription;

  vehicles: Vehicle[];
  filteredVehicles = this.vehicles;
  @ViewChild(FilterTextComponent) filterComponent: FilterTextComponent;

  constructor(
    private filterService: FilterTextService,
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
      },
      error => {
        console.log('error occurred here');
        console.log(error);
      },
       () => {
        console.log('vehicle retrieval completed');
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

  trackByVehicles(index: number, vehicle: Vehicle) {
    return vehicle.id;
  }
}
