/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Subject, Subscription } from 'rxjs';
/**
 * Use by directives and components to emit custom Events.
 *
 * @usageNotes
 * ### Examples
 *
 * In the following example, `Zippy` alternatively emits `open` and `close` events when its
 * title gets clicked:
 *
 * ```
 * @Component({
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
 *   @Output() open: EventEmitter<any> = new EventEmitter();
 *   @Output() close: EventEmitter<any> = new EventEmitter();
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
 */
var EventEmitter = /** @class */ (function (_super) {
    tslib_1.__extends(EventEmitter, _super);
    /**
     * Creates an instance of {@link EventEmitter}, which depending on `isAsync`,
     * delivers events synchronously or asynchronously.
     *
     * @param isAsync By default, events are delivered synchronously (default value: `false`).
     * Set to `true` for asynchronous event delivery.
     */
    function EventEmitter(isAsync) {
        if (isAsync === void 0) { isAsync = false; }
        var _this = _super.call(this) || this;
        _this.__isAsync = isAsync;
        return _this;
    }
    EventEmitter.prototype.emit = function (value) { _super.prototype.next.call(this, value); };
    EventEmitter.prototype.subscribe = function (generatorOrNext, error, complete) {
        var schedulerFn;
        var errorFn = function (err) { return null; };
        var completeFn = function () { return null; };
        if (generatorOrNext && typeof generatorOrNext === 'object') {
            schedulerFn = this.__isAsync ? function (value) {
                setTimeout(function () { return generatorOrNext.next(value); });
            } : function (value) { generatorOrNext.next(value); };
            if (generatorOrNext.error) {
                errorFn = this.__isAsync ? function (err) { setTimeout(function () { return generatorOrNext.error(err); }); } :
                    function (err) { generatorOrNext.error(err); };
            }
            if (generatorOrNext.complete) {
                completeFn = this.__isAsync ? function () { setTimeout(function () { return generatorOrNext.complete(); }); } :
                    function () { generatorOrNext.complete(); };
            }
        }
        else {
            schedulerFn = this.__isAsync ? function (value) { setTimeout(function () { return generatorOrNext(value); }); } :
                function (value) { generatorOrNext(value); };
            if (error) {
                errorFn =
                    this.__isAsync ? function (err) { setTimeout(function () { return error(err); }); } : function (err) { error(err); };
            }
            if (complete) {
                completeFn =
                    this.__isAsync ? function () { setTimeout(function () { return complete(); }); } : function () { complete(); };
            }
        }
        var sink = _super.prototype.subscribe.call(this, schedulerFn, errorFn, completeFn);
        if (generatorOrNext instanceof Subscription) {
            generatorOrNext.add(sink);
        }
        return sink;
    };
    return EventEmitter;
}(Subject));
export { EventEmitter };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2V2ZW50X2VtaXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRTNDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaURHO0FBQ0g7SUFBcUMsd0NBQVU7SUFRN0M7Ozs7OztPQU1HO0lBQ0gsc0JBQVksT0FBd0I7UUFBeEIsd0JBQUEsRUFBQSxlQUF3QjtRQUFwQyxZQUNFLGlCQUFPLFNBRVI7UUFEQyxLQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQzs7SUFDM0IsQ0FBQztJQUVELDJCQUFJLEdBQUosVUFBSyxLQUFTLElBQUksaUJBQU0sSUFBSSxZQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV0QyxnQ0FBUyxHQUFULFVBQVUsZUFBcUIsRUFBRSxLQUFXLEVBQUUsUUFBYztRQUMxRCxJQUFJLFdBQTRCLENBQUM7UUFDakMsSUFBSSxPQUFPLEdBQUcsVUFBQyxHQUFRLElBQVUsT0FBQSxJQUFJLEVBQUosQ0FBSSxDQUFDO1FBQ3RDLElBQUksVUFBVSxHQUFHLGNBQVcsT0FBQSxJQUFJLEVBQUosQ0FBSSxDQUFDO1FBRWpDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzNELFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFDLEtBQVU7Z0JBQ3hDLFVBQVUsQ0FBQyxjQUFNLE9BQUEsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBM0IsQ0FBMkIsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBQyxLQUFVLElBQU8sZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVyRCxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQUMsR0FBRyxJQUFPLFVBQVUsQ0FBQyxjQUFNLE9BQUEsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVELFVBQUMsR0FBRyxJQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEUsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBUSxVQUFVLENBQUMsY0FBTSxPQUFBLGVBQWUsQ0FBQyxRQUFRLEVBQUUsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pELGNBQVEsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLENBQUM7UUFDSCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBQyxLQUFVLElBQU8sVUFBVSxDQUFDLGNBQU0sT0FBQSxlQUFlLENBQUMsS0FBSyxDQUFDLEVBQXRCLENBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvRCxVQUFDLEtBQVUsSUFBTyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFM0UsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDVixPQUFPO29CQUNILElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQUMsR0FBRyxJQUFPLFVBQVUsQ0FBQyxjQUFNLE9BQUEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFWLENBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFDLEdBQUcsSUFBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0YsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsVUFBVTtvQkFDTixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxjQUFRLFVBQVUsQ0FBQyxjQUFNLE9BQUEsUUFBUSxFQUFFLEVBQVYsQ0FBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQVEsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkYsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFNLElBQUksR0FBRyxpQkFBTSxTQUFTLFlBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUUvRCxFQUFFLENBQUMsQ0FBQyxlQUFlLFlBQVksWUFBWSxDQUFDLENBQUMsQ0FBQztZQUM1QyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQWhFRCxDQUFxQyxPQUFPLEdBZ0UzQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdWJqZWN0LCBTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuXG4vKipcbiAqIFVzZSBieSBkaXJlY3RpdmVzIGFuZCBjb21wb25lbnRzIHRvIGVtaXQgY3VzdG9tIEV2ZW50cy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVzXG4gKlxuICogSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlLCBgWmlwcHlgIGFsdGVybmF0aXZlbHkgZW1pdHMgYG9wZW5gIGFuZCBgY2xvc2VgIGV2ZW50cyB3aGVuIGl0c1xuICogdGl0bGUgZ2V0cyBjbGlja2VkOlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnemlwcHknLFxuICogICB0ZW1wbGF0ZTogYFxuICogICA8ZGl2IGNsYXNzPVwiemlwcHlcIj5cbiAqICAgICA8ZGl2IChjbGljayk9XCJ0b2dnbGUoKVwiPlRvZ2dsZTwvZGl2PlxuICogICAgIDxkaXYgW2hpZGRlbl09XCIhdmlzaWJsZVwiPlxuICogICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICogICAgIDwvZGl2PlxuICogIDwvZGl2PmB9KVxuICogZXhwb3J0IGNsYXNzIFppcHB5IHtcbiAqICAgdmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG4gKiAgIEBPdXRwdXQoKSBvcGVuOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAqICAgQE91dHB1dCgpIGNsb3NlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAqXG4gKiAgIHRvZ2dsZSgpIHtcbiAqICAgICB0aGlzLnZpc2libGUgPSAhdGhpcy52aXNpYmxlO1xuICogICAgIGlmICh0aGlzLnZpc2libGUpIHtcbiAqICAgICAgIHRoaXMub3Blbi5lbWl0KG51bGwpO1xuICogICAgIH0gZWxzZSB7XG4gKiAgICAgICB0aGlzLmNsb3NlLmVtaXQobnVsbCk7XG4gKiAgICAgfVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGUgZXZlbnRzIHBheWxvYWQgY2FuIGJlIGFjY2Vzc2VkIGJ5IHRoZSBwYXJhbWV0ZXIgYCRldmVudGAgb24gdGhlIGNvbXBvbmVudHMgb3V0cHV0IGV2ZW50XG4gKiBoYW5kbGVyOlxuICpcbiAqIGBgYFxuICogPHppcHB5IChvcGVuKT1cIm9uT3BlbigkZXZlbnQpXCIgKGNsb3NlKT1cIm9uQ2xvc2UoJGV2ZW50KVwiPjwvemlwcHk+XG4gKiBgYGBcbiAqXG4gKiAjIyMgTm90ZXNcbiAqXG4gKiBVc2VzIFJ4Lk9ic2VydmFibGUgYnV0IHByb3ZpZGVzIGFuIGFkYXB0ZXIgdG8gbWFrZSBpdCB3b3JrIGFzIHNwZWNpZmllZCBoZXJlOlxuICogaHR0cHM6Ly9naXRodWIuY29tL2podXNhaW4vb2JzZXJ2YWJsZS1zcGVjXG4gKlxuICogT25jZSBhIHJlZmVyZW5jZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgc3BlYyBpcyBhdmFpbGFibGUsIHN3aXRjaCB0byBpdC5cbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudEVtaXR0ZXI8VD4gZXh0ZW5kcyBTdWJqZWN0PFQ+IHtcbiAgLy8gVE9ETzogbWFyayB0aGlzIGFzIGludGVybmFsIG9uY2UgYWxsIHRoZSBmYWNhZGVzIGFyZSBnb25lXG4gIC8vIHdlIGNhbid0IG1hcmsgaXQgYXMgaW50ZXJuYWwgbm93IGJlY2F1c2UgRXZlbnRFbWl0dGVyIGV4cG9ydGVkIHZpYSBAYW5ndWxhci9jb3JlIHdvdWxkIG5vdFxuICAvLyBjb250YWluIHRoaXMgcHJvcGVydHkgbWFraW5nIGl0IGluY29tcGF0aWJsZSB3aXRoIGFsbCB0aGUgY29kZSB0aGF0IHVzZXMgRXZlbnRFbWl0dGVyIHZpYVxuICAvLyBmYWNhZGVzLCB3aGljaCBhcmUgbG9jYWwgdG8gdGhlIGNvZGUgYW5kIGRvIG5vdCBoYXZlIHRoaXMgcHJvcGVydHkgc3RyaXBwZWQuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuICBfX2lzQXN5bmM6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2Yge0BsaW5rIEV2ZW50RW1pdHRlcn0sIHdoaWNoIGRlcGVuZGluZyBvbiBgaXNBc3luY2AsXG4gICAqIGRlbGl2ZXJzIGV2ZW50cyBzeW5jaHJvbm91c2x5IG9yIGFzeW5jaHJvbm91c2x5LlxuICAgKlxuICAgKiBAcGFyYW0gaXNBc3luYyBCeSBkZWZhdWx0LCBldmVudHMgYXJlIGRlbGl2ZXJlZCBzeW5jaHJvbm91c2x5IChkZWZhdWx0IHZhbHVlOiBgZmFsc2VgKS5cbiAgICogU2V0IHRvIGB0cnVlYCBmb3IgYXN5bmNocm9ub3VzIGV2ZW50IGRlbGl2ZXJ5LlxuICAgKi9cbiAgY29uc3RydWN0b3IoaXNBc3luYzogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9faXNBc3luYyA9IGlzQXN5bmM7XG4gIH1cblxuICBlbWl0KHZhbHVlPzogVCkgeyBzdXBlci5uZXh0KHZhbHVlKTsgfVxuXG4gIHN1YnNjcmliZShnZW5lcmF0b3JPck5leHQ/OiBhbnksIGVycm9yPzogYW55LCBjb21wbGV0ZT86IGFueSk6IGFueSB7XG4gICAgbGV0IHNjaGVkdWxlckZuOiAodDogYW55KSA9PiBhbnk7XG4gICAgbGV0IGVycm9yRm4gPSAoZXJyOiBhbnkpOiBhbnkgPT4gbnVsbDtcbiAgICBsZXQgY29tcGxldGVGbiA9ICgpOiBhbnkgPT4gbnVsbDtcblxuICAgIGlmIChnZW5lcmF0b3JPck5leHQgJiYgdHlwZW9mIGdlbmVyYXRvck9yTmV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHNjaGVkdWxlckZuID0gdGhpcy5fX2lzQXN5bmMgPyAodmFsdWU6IGFueSkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGdlbmVyYXRvck9yTmV4dC5uZXh0KHZhbHVlKSk7XG4gICAgICB9IDogKHZhbHVlOiBhbnkpID0+IHsgZ2VuZXJhdG9yT3JOZXh0Lm5leHQodmFsdWUpOyB9O1xuXG4gICAgICBpZiAoZ2VuZXJhdG9yT3JOZXh0LmVycm9yKSB7XG4gICAgICAgIGVycm9yRm4gPSB0aGlzLl9faXNBc3luYyA/IChlcnIpID0+IHsgc2V0VGltZW91dCgoKSA9PiBnZW5lcmF0b3JPck5leHQuZXJyb3IoZXJyKSk7IH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZXJyKSA9PiB7IGdlbmVyYXRvck9yTmV4dC5lcnJvcihlcnIpOyB9O1xuICAgICAgfVxuXG4gICAgICBpZiAoZ2VuZXJhdG9yT3JOZXh0LmNvbXBsZXRlKSB7XG4gICAgICAgIGNvbXBsZXRlRm4gPSB0aGlzLl9faXNBc3luYyA/ICgpID0+IHsgc2V0VGltZW91dCgoKSA9PiBnZW5lcmF0b3JPck5leHQuY29tcGxldGUoKSk7IH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7IGdlbmVyYXRvck9yTmV4dC5jb21wbGV0ZSgpOyB9O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzY2hlZHVsZXJGbiA9IHRoaXMuX19pc0FzeW5jID8gKHZhbHVlOiBhbnkpID0+IHsgc2V0VGltZW91dCgoKSA9PiBnZW5lcmF0b3JPck5leHQodmFsdWUpKTsgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHZhbHVlOiBhbnkpID0+IHsgZ2VuZXJhdG9yT3JOZXh0KHZhbHVlKTsgfTtcblxuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGVycm9yRm4gPVxuICAgICAgICAgICAgdGhpcy5fX2lzQXN5bmMgPyAoZXJyKSA9PiB7IHNldFRpbWVvdXQoKCkgPT4gZXJyb3IoZXJyKSk7IH0gOiAoZXJyKSA9PiB7IGVycm9yKGVycik7IH07XG4gICAgICB9XG5cbiAgICAgIGlmIChjb21wbGV0ZSkge1xuICAgICAgICBjb21wbGV0ZUZuID1cbiAgICAgICAgICAgIHRoaXMuX19pc0FzeW5jID8gKCkgPT4geyBzZXRUaW1lb3V0KCgpID0+IGNvbXBsZXRlKCkpOyB9IDogKCkgPT4geyBjb21wbGV0ZSgpOyB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNpbmsgPSBzdXBlci5zdWJzY3JpYmUoc2NoZWR1bGVyRm4sIGVycm9yRm4sIGNvbXBsZXRlRm4pO1xuXG4gICAgaWYgKGdlbmVyYXRvck9yTmV4dCBpbnN0YW5jZW9mIFN1YnNjcmlwdGlvbikge1xuICAgICAgZ2VuZXJhdG9yT3JOZXh0LmFkZChzaW5rKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2luaztcbiAgfVxufVxuIl19