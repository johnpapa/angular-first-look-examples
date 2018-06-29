import { Component } from '@angular/core';

@Component({
  selector: 'story-app',
  templateUrl: './app.component.html',
  styles: [
    `
      nav ul {
        list-style-type: none;
      }
      nav ul li {
        padding: 4px;
        cursor: pointer;
        display: inline-block;
      }
    `
  ]
})
export class AppComponent {}
