import { NgZone } from '@angular/core';
import { EventManagerPlugin } from './event_manager';
export declare class DomEventsPlugin extends EventManagerPlugin {
    private ngZone;
    constructor(doc: any, ngZone: NgZone, platformId: {} | null);
    private patchEvent();
    supports(eventName: string): boolean;
    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function;
    removeEventListener(target: any, eventName: string, callback: Function): void;
}
