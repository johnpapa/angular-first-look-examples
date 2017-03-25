// our root app component
import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'my-app',
   templateUrl: './app.component.html',
})
export class AppComponent {
  imagePath = 'angular.png';
  link = 'http://angular.io';
  story = 'The Empire Strikes Back';
  title = 'Angular Property Binding';
}
