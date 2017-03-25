// our root app component
import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'my-app',
   templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  imagePath = 'images/angular.png';
  messages: string[] = [];
  title: string;

  constructor() {
    this.title = 'Angular 2 Binding Events';
  }

  log(msg: string, data: string) {
    this.messages.splice(0, 0, msg);
    console.log(msg);
    if (data) {
      console.log(data);
    }
  }
}
