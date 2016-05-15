import {Component, OnDestroy, OnInit} from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { SpinnerState, SpinnerService } from './spinner.service';

@Component({
  moduleId: module.id,
  selector: 'story-spinner',
  template: `
    <div
      class="spinner mdl-spinner mdl-js-spinner mdl-spinner--single-color"
      [class.is-active]="visible"></div>
  `,
  styles: [`.spinner {position: absolute;left: 46%;top: 12%`]
})

export class SpinnerComponent implements OnDestroy, OnInit {
  visible = false;

  private spinnerStateChanged: Subscription;

  constructor(private spinnerService: SpinnerService) { }

  ngOnInit() {
    componentHandler.upgradeDom();
    this.spinnerStateChanged = this.spinnerService.spinnerState
      .subscribe((state: SpinnerState) => this.visible = state.show);
  }

  ngOnDestroy() {
    this.spinnerStateChanged.unsubscribe();
  }
}
