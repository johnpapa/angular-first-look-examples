import { Component, EventEmitter, Input, Output } from 'angular2/core';
import { Vehicle } from './vehicle.service';

@Component({
  selector: 'my-vehicle',
  templateUrl: 'app/vehicle.component.html'
})
export class VehicleComponent {
  @Input() vehicle: Vehicle;
}

