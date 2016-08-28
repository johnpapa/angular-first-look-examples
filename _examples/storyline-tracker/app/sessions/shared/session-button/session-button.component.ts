import { Component, Input, OnInit } from '@angular/core';

import { Vehicle } from '../vehicle.model';

@Component({
  moduleId: module.id,
  selector: 'story-vehicle-button',
  templateUrl: 'vehicle-button.component.html',
  styleUrls: ['vehicle-button.component.css'],
})
export class VehicleButtonComponent implements OnInit {
  @Input() vehicle: Vehicle;

  constructor() {}

  ngOnInit() {
  }

}
