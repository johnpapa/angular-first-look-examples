/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Subject, Subscription } from 'rxjs';
/**
 * Use by directives and components to emit custom Events.
 *
 * \@usageNotes
 * ### Examples
 *
 * In the following example, `Zippy` alternatively emits `open` and `close` events when its
 * title gets clicked:
 *
 * ```
 * \@Component({
 *   selector: 'zippy',
 *   template: `
 *   <div class="zippy">
 *     <div (click)="toggle()">Toggle</div>
 *     <div [hidden]="!visible">
 *       <ng-content></ng-content>
 *     </div>
 *  </div>`})
 * export class Zippy {
 *   visible: boolean = true;
 * \@Output() open: EventEmitter<any> = new EventEmitter();
 * \@Output() close: EventEmitter<any> = new EventEmitter();
 *
 *   toggle() {
 *     this.visible = !this.visible;
 *     if (this.visible) {
 *       this.open.emit(null);
 *     } else {
 *       this.close.emit(null);
 *     }
 *   }
 * }
 * ```
 *
 * The events payload can be accessed by the parameter `$event` on the components output event
 * handler:
 *
 * ```
 * <zippy (open)="onOpen($event)" (close)="onClose($event)"></zippy>
 * ```
 *
 * ### Notes
 *
 * Uses Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 *
 * @template T
 */
export class EventEmitter extends Subject {
    /**
     * Creates an instance of {\@link EventEmitter}, which depending on `isAsync`,
     * delivers events synchronously or asynchronously.
     *
     * @param {?=} isAsync By default, events are delivered synchronously (default value: `false`).
     * Set to `true` for asynchronous event delivery.
     */
    constructor(isAsync = false) {
        super();
        this.__isAsync = isAsync;
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    emit(value) { super.next(value); }
    /**
     * @param {?=} generatorOrNext
     * @param {?=} error
     * @param {?=} complete
     * @return {?}
     */
    subscribe(generatorOrNext, error, complete) {
        let /** @type {?} */ schedulerFn;
        let /** @type {?} */ errorFn = (err) => null;
        let /** @type {?} */ completeFn = () => null;
        if (generatorOrNext && typeof generatorOrNext === 'object') {
            schedulerFn = this.__isAsync ? (value) => {
                setTimeout(() => generatorOrNext.next(value));
            } : (value) => { generatorOrNext.next(value); };
            if (generatorOrNext.error) {
                errorFn = this.__isAsync ? (err) => { setTimeout(() => generatorOrNext.error(err)); } :
                    (err) => { generatorOrNext.error(err); };
            }
            if (generatorOrNext.complete) {
                completeFn = this.__isAsync ? () => { setTimeout(() => generatorOrNext.complete()); } :
                    () => { generatorOrNext.complete(); };
            }
        }
        else {
            schedulerFn = this.__isAsync ? (value) => { setTimeout(() => generatorOrNext(value)); } :
                (value) => { generatorOrNext(value); };
            if (error) {
                errorFn =
                    this.__isAsync ? (err) => { setTimeout(() => error(err)); } : (err) => { error(err); };
            }
            if (complete) {
                completeFn =
                    this.__isAsync ? () => { setTimeout(() => complete()); } : () => { complete(); };
            }
        }
        const /** @type {?} */ sink = super.subscribe(schedulerFn, errorFn, completeFn);
        if (generatorOrNext instanceof Subscription) {
            generatorOrNext.add(sink);
        }
        return sink;
    }
}
function EventEmitter_tsickle_Closure_declarations() {
    /** @type {?} */
    EventEmitter.prototype.__isAsync;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2V2ZW50X2VtaXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9EM0MsTUFBTSxtQkFBdUIsU0FBUSxPQUFVOzs7Ozs7OztJQWU3QyxZQUFZLFVBQW1CLEtBQUs7UUFDbEMsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztLQUMxQjs7Ozs7SUFFRCxJQUFJLENBQUMsS0FBUyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTs7Ozs7OztJQUV0QyxTQUFTLENBQUMsZUFBcUIsRUFBRSxLQUFXLEVBQUUsUUFBYztRQUMxRCxxQkFBSSxXQUE0QixDQUFDO1FBQ2pDLHFCQUFJLE9BQU8sR0FBRyxDQUFDLEdBQVEsRUFBTyxFQUFFLENBQUMsSUFBSSxDQUFDO1FBQ3RDLHFCQUFJLFVBQVUsR0FBRyxHQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFFakMsRUFBRSxDQUFDLENBQUMsZUFBZSxJQUFJLE9BQU8sZUFBZSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDM0QsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUU7Z0JBQzVDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDL0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFVLEVBQUUsRUFBRSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRXJELEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQzVELENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQzthQUNyRTtZQUVELEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6RCxHQUFHLEVBQUUsR0FBRyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ3JFO1NBQ0Y7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMvRCxDQUFDLEtBQVUsRUFBRSxFQUFFLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUUzRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNWLE9BQU87b0JBQ0gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO2FBQzVGO1lBRUQsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDYixVQUFVO29CQUNOLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ3RGO1NBQ0Y7UUFFRCx1QkFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRS9ELEVBQUUsQ0FBQyxDQUFDLGVBQWUsWUFBWSxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQzVDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDM0I7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO0tBQ2I7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdWJqZWN0LCBTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuXG4vKipcbiAqIFVzZSBieSBkaXJlY3RpdmVzIGFuZCBjb21wb25lbnRzIHRvIGVtaXQgY3VzdG9tIEV2ZW50cy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVzXG4gKlxuICogSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlLCBgWmlwcHlgIGFsdGVybmF0aXZlbHkgZW1pdHMgYG9wZW5gIGFuZCBgY2xvc2VgIGV2ZW50cyB3aGVuIGl0c1xuICogdGl0bGUgZ2V0cyBjbGlja2VkOlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnemlwcHknLFxuICogICB0ZW1wbGF0ZTogYFxuICogICA8ZGl2IGNsYXNzPVwiemlwcHlcIj5cbiAqICAgICA8ZGl2IChjbGljayk9XCJ0b2dnbGUoKVwiPlRvZ2dsZTwvZGl2PlxuICogICAgIDxkaXYgW2hpZGRlbl09XCIhdmlzaWJsZVwiPlxuICogICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICogICAgIDwvZGl2PlxuICogIDwvZGl2PmB9KVxuICogZXhwb3J0IGNsYXNzIFppcHB5IHtcbiAqICAgdmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG4gKiAgIEBPdXRwdXQoKSBvcGVuOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAqICAgQE91dHB1dCgpIGNsb3NlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAqXG4gKiAgIHRvZ2dsZSgpIHtcbiAqICAgICB0aGlzLnZpc2libGUgPSAhdGhpcy52aXNpYmxlO1xuICogICAgIGlmICh0aGlzLnZpc2libGUpIHtcbiAqICAgICAgIHRoaXMub3Blbi5lbWl0KG51bGwpO1xuICogICAgIH0gZWxzZSB7XG4gKiAgICAgICB0aGlzLmNsb3NlLmVtaXQobnVsbCk7XG4gKiAgICAgfVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGUgZXZlbnRzIHBheWxvYWQgY2FuIGJlIGFjY2Vzc2VkIGJ5IHRoZSBwYXJhbWV0ZXIgYCRldmVudGAgb24gdGhlIGNvbXBvbmVudHMgb3V0cHV0IGV2ZW50XG4gKiBoYW5kbGVyOlxuICpcbiAqIGBgYFxuICogPHppcHB5IChvcGVuKT1cIm9uT3BlbigkZXZlbnQpXCIgKGNsb3NlKT1cIm9uQ2xvc2UoJGV2ZW50KVwiPjwvemlwcHk+XG4gKiBgYGBcbiAqXG4gKiAjIyMgTm90ZXNcbiAqXG4gKiBVc2VzIFJ4Lk9ic2VydmFibGUgYnV0IHByb3ZpZGVzIGFuIGFkYXB0ZXIgdG8gbWFrZSBpdCB3b3JrIGFzIHNwZWNpZmllZCBoZXJlOlxuICogaHR0cHM6Ly9naXRodWIuY29tL2podXNhaW4vb2JzZXJ2YWJsZS1zcGVjXG4gKlxuICogT25jZSBhIHJlZmVyZW5jZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgc3BlYyBpcyBhdmFpbGFibGUsIHN3aXRjaCB0byBpdC5cbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudEVtaXR0ZXI8VD4gZXh0ZW5kcyBTdWJqZWN0PFQ+IHtcbiAgLy8gVE9ETzogbWFyayB0aGlzIGFzIGludGVybmFsIG9uY2UgYWxsIHRoZSBmYWNhZGVzIGFyZSBnb25lXG4gIC8vIHdlIGNhbid0IG1hcmsgaXQgYXMgaW50ZXJuYWwgbm93IGJlY2F1c2UgRXZlbnRFbWl0dGVyIGV4cG9ydGVkIHZpYSBAYW5ndWxhci9jb3JlIHdvdWxkIG5vdFxuICAvLyBjb250YWluIHRoaXMgcHJvcGVydHkgbWFraW5nIGl0IGluY29tcGF0aWJsZSB3aXRoIGFsbCB0aGUgY29kZSB0aGF0IHVzZXMgRXZlbnRFbWl0dGVyIHZpYVxuICAvLyBmYWNhZGVzLCB3aGljaCBhcmUgbG9jYWwgdG8gdGhlIGNvZGUgYW5kIGRvIG5vdCBoYXZlIHRoaXMgcHJvcGVydHkgc3RyaXBwZWQuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuICBfX2lzQXN5bmM6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2Yge0BsaW5rIEV2ZW50RW1pdHRlcn0sIHdoaWNoIGRlcGVuZGluZyBvbiBgaXNBc3luY2AsXG4gICAqIGRlbGl2ZXJzIGV2ZW50cyBzeW5jaHJvbm91c2x5IG9yIGFzeW5jaHJvbm91c2x5LlxuICAgKlxuICAgKiBAcGFyYW0gaXNBc3luYyBCeSBkZWZhdWx0LCBldmVudHMgYXJlIGRlbGl2ZXJlZCBzeW5jaHJvbm91c2x5IChkZWZhdWx0IHZhbHVlOiBgZmFsc2VgKS5cbiAgICogU2V0IHRvIGB0cnVlYCBmb3IgYXN5bmNocm9ub3VzIGV2ZW50IGRlbGl2ZXJ5LlxuICAgKi9cbiAgY29uc3RydWN0b3IoaXNBc3luYzogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9faXNBc3luYyA9IGlzQXN5bmM7XG4gIH1cblxuICBlbWl0KHZhbHVlPzogVCkgeyBzdXBlci5uZXh0KHZhbHVlKTsgfVxuXG4gIHN1YnNjcmliZShnZW5lcmF0b3JPck5leHQ/OiBhbnksIGVycm9yPzogYW55LCBjb21wbGV0ZT86IGFueSk6IGFueSB7XG4gICAgbGV0IHNjaGVkdWxlckZuOiAodDogYW55KSA9PiBhbnk7XG4gICAgbGV0IGVycm9yRm4gPSAoZXJyOiBhbnkpOiBhbnkgPT4gbnVsbDtcbiAgICBsZXQgY29tcGxldGVGbiA9ICgpOiBhbnkgPT4gbnVsbDtcblxuICAgIGlmIChnZW5lcmF0b3JPck5leHQgJiYgdHlwZW9mIGdlbmVyYXRvck9yTmV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHNjaGVkdWxlckZuID0gdGhpcy5fX2lzQXN5bmMgPyAodmFsdWU6IGFueSkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGdlbmVyYXRvck9yTmV4dC5uZXh0KHZhbHVlKSk7XG4gICAgICB9IDogKHZhbHVlOiBhbnkpID0+IHsgZ2VuZXJhdG9yT3JOZXh0Lm5leHQodmFsdWUpOyB9O1xuXG4gICAgICBpZiAoZ2VuZXJhdG9yT3JOZXh0LmVycm9yKSB7XG4gICAgICAgIGVycm9yRm4gPSB0aGlzLl9faXNBc3luYyA/IChlcnIpID0+IHsgc2V0VGltZW91dCgoKSA9PiBnZW5lcmF0b3JPck5leHQuZXJyb3IoZXJyKSk7IH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZXJyKSA9PiB7IGdlbmVyYXRvck9yTmV4dC5lcnJvcihlcnIpOyB9O1xuICAgICAgfVxuXG4gICAgICBpZiAoZ2VuZXJhdG9yT3JOZXh0LmNvbXBsZXRlKSB7XG4gICAgICAgIGNvbXBsZXRlRm4gPSB0aGlzLl9faXNBc3luYyA/ICgpID0+IHsgc2V0VGltZW91dCgoKSA9PiBnZW5lcmF0b3JPck5leHQuY29tcGxldGUoKSk7IH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7IGdlbmVyYXRvck9yTmV4dC5jb21wbGV0ZSgpOyB9O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzY2hlZHVsZXJGbiA9IHRoaXMuX19pc0FzeW5jID8gKHZhbHVlOiBhbnkpID0+IHsgc2V0VGltZW91dCgoKSA9PiBnZW5lcmF0b3JPck5leHQodmFsdWUpKTsgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHZhbHVlOiBhbnkpID0+IHsgZ2VuZXJhdG9yT3JOZXh0KHZhbHVlKTsgfTtcblxuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGVycm9yRm4gPVxuICAgICAgICAgICAgdGhpcy5fX2lzQXN5bmMgPyAoZXJyKSA9PiB7IHNldFRpbWVvdXQoKCkgPT4gZXJyb3IoZXJyKSk7IH0gOiAoZXJyKSA9PiB7IGVycm9yKGVycik7IH07XG4gICAgICB9XG5cbiAgICAgIGlmIChjb21wbGV0ZSkge1xuICAgICAgICBjb21wbGV0ZUZuID1cbiAgICAgICAgICAgIHRoaXMuX19pc0FzeW5jID8gKCkgPT4geyBzZXRUaW1lb3V0KCgpID0+IGNvbXBsZXRlKCkpOyB9IDogKCkgPT4geyBjb21wbGV0ZSgpOyB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNpbmsgPSBzdXBlci5zdWJzY3JpYmUoc2NoZWR1bGVyRm4sIGVycm9yRm4sIGNvbXBsZXRlRm4pO1xuXG4gICAgaWYgKGdlbmVyYXRvck9yTmV4dCBpbnN0YW5jZW9mIFN1YnNjcmlwdGlvbikge1xuICAgICAgZ2VuZXJhdG9yT3JOZXh0LmFkZChzaW5rKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2luaztcbiAgfVxufVxuIl19