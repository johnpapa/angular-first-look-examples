import { Component, Input } from '@angular/core';
import { Vehicle } from './vehicle.service';

@Component({
  selector: 'my-vehicle',
  templateUrl: './vehicle.component.html'
})
export class VehicleComponent {
  @Input() vehicle: Vehicle;
}
