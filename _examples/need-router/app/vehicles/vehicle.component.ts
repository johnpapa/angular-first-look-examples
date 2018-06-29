import { Component, Input, OnInit } from '@angular/core';
import { Vehicle } from './vehicle.service';

@Component({
  selector: 'story-vehicle',
  templateUrl: './vehicle.component.html'
})
export class VehicleComponent implements OnInit {
  @Input() vehicle: Vehicle;

  constructor() {}

  ngOnInit() {}
}
