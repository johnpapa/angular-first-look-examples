import { Component, Input, OnInit } from 'angular2/core';

@Component({
  selector: 'story-vehicle',
  templateUrl: 'app/vehicles/vehicle.component.html'
})
export class VehicleComponent implements OnInit {
  @Input() vehicle: Vehicle;

  constructor() { }

  ngOnInit() {
  }
}
