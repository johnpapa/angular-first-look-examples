import { Component, Input, OnInit } from '@angular/core';

import { Character } from '../../../models';

@Component({
  moduleId: module.id,
  selector: 'story-dashboard-button',
   templateUrl: './dashboard-button.component.html',
  styleUrls: ['./dashboard-button.component.css']
})
export class DashboardButtonComponent implements OnInit {
  @Input() character: Character;

  constructor() {}

  ngOnInit() {
  }
}
