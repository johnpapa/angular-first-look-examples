import { Component, OnDestroy, ElementRef, Renderer } from '@angular/core';
import { ToastService } from './toast.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'story-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnDestroy {
  private defaults = {
    title: '',
    message: 'May the Force be with You'
  };
  private toastSubscription: Subscription;

  title: string;
  message: string;

  constructor(private toastService: ToastService,
              private renderer: Renderer,
              private elementRef: ElementRef) {
    this.toastSubscription = this.toastService.toastState.subscribe((toastMessage) => {
      console.log(`activiting toast: ${toastMessage.message}`);
      this.activate(toastMessage.message);
    });
  }

  activate(message = this.defaults.message, title = this.defaults.title) {
    this.title = title;
    this.message = message;
    this.show();
  }

  ngOnDestroy() {
    this.toastSubscription.unsubscribe();
  }

  private show() {
    console.log(this.message);
    this.renderer.setElementStyle(this.elementRef.nativeElement, 'opacity', '1');
    this.renderer.setElementStyle(this.elementRef.nativeElement, 'zIndex', '9999');

    window.setTimeout(() => this.hide(), 2500);
  }

  private hide() {
    this.renderer.setElementStyle(this.elementRef.nativeElement, 'opacity', '0');
    window.setTimeout(() => this.renderer.setElementStyle(this.elementRef.nativeElement, 'zIndex', '0'), 400);
  }
}
