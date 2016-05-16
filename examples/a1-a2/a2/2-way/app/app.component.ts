// our root app component
import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'my-app',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  title = 'Angular 2 Two-Way Binding';
  story = {
    name: 'The Empire Strikes Back'
  };
}
