import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Angular Two-Way Binding';
  story = {
    name: 'The Empire Strikes Back'
  };
}
