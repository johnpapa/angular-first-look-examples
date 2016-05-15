import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Vehicle } from './vehicle.service';

@Component({
  selector: 'my-vehicle',
  templateUrl: 'app/vehicle.component.html'
})
export class VehicleComponent {
  @Input() vehicle: Vehicle;
}

