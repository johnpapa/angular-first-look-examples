//our root app component
import {Component} from 'angular2/core'

@Component({
  selector: 'my-app',
  templateUrl: 'app/app.component.html',
  styles: ['app/app.component.css']
})
export class AppComponent {
  title: string;
  imagePath = 'papa.png';
  messages: string[] = [];

  constructor() {
    this.title = 'Angular 2 Binding Events'
  }

  log(msg: string, data: string) {
    this.messages.splice(0, 0, msg);
    console.log(msg);
    if (data) {
      console.log(data);
    }
  }
}