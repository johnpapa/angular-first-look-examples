/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { AnimationBuilder, AnimationFactory, sequence } from '@angular/animations';
import { Inject, Injectable, RendererFactory2, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
export class BrowserAnimationBuilder extends AnimationBuilder {
    /**
     * @param {?} rootRenderer
     * @param {?} doc
     */
    constructor(rootRenderer, doc) {
        super();
        this._nextAnimationId = 0;
        const /** @type {?} */ typeData = /** @type {?} */ ({
            id: '0',
            encapsulation: ViewEncapsulation.None,
            styles: [],
            data: { animation: [] }
        });
        this._renderer = /** @type {?} */ (rootRenderer.createRenderer(doc.body, typeData));
    }
    /**
     * @param {?} animation
     * @return {?}
     */
    build(animation) {
        const /** @type {?} */ id = this._nextAnimationId.toString();
        this._nextAnimationId++;
        const /** @type {?} */ entry = Array.isArray(animation) ? sequence(animation) : animation;
        issueAnimationCommand(this._renderer, null, id, 'register', [entry]);
        return new BrowserAnimationFactory(id, this._renderer);
    }
}
BrowserAnimationBuilder.decorators = [
    { type: Injectable }
];
/** @nocollapse */
BrowserAnimationBuilder.ctorParameters = () => [
    { type: RendererFactory2 },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
function BrowserAnimationBuilder_tsickle_Closure_declarations() {
    /** @type {?} */
    BrowserAnimationBuilder.prototype._nextAnimationId;
    /** @type {?} */
    BrowserAnimationBuilder.prototype._renderer;
}
export class BrowserAnimationFactory extends AnimationFactory {
    /**
     * @param {?} _id
     * @param {?} _renderer
     */
    constructor(_id, _renderer) {
        super();
        this._id = _id;
        this._renderer = _renderer;
    }
    /**
     * @param {?} element
     * @param {?=} options
     * @return {?}
     */
    create(element, options) {
        return new RendererAnimationPlayer(this._id, element, options || {}, this._renderer);
    }
}
function BrowserAnimationFactory_tsickle_Closure_declarations() {
    /** @type {?} */
    BrowserAnimationFactory.prototype._id;
    /** @type {?} */
    BrowserAnimationFactory.prototype._renderer;
}
export class RendererAnimationPlayer {
    /**
     * @param {?} id
     * @param {?} element
     * @param {?} options
     * @param {?} _renderer
     */
    constructor(id, element, options, _renderer) {
        this.id = id;
        this.element = element;
        this._renderer = _renderer;
        this.parentPlayer = null;
        this._started = false;
        this.totalTime = 0;
        this._command('create', options);
    }
    /**
     * @param {?} eventName
     * @param {?} callback
     * @return {?}
     */
    _listen(eventName, callback) {
        return this._renderer.listen(this.element, `@@${this.id}:${eventName}`, callback);
    }
    /**
     * @param {?} command
     * @param {...?} args
     * @return {?}
     */
    _command(command, ...args) {
        return issueAnimationCommand(this._renderer, this.element, this.id, command, args);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDone(fn) { this._listen('done', fn); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onStart(fn) { this._listen('start', fn); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDestroy(fn) { this._listen('destroy', fn); }
    /**
     * @return {?}
     */
    init() { this._command('init'); }
    /**
     * @return {?}
     */
    hasStarted() { return this._started; }
    /**
     * @return {?}
     */
    play() {
        this._command('play');
        this._started = true;
    }
    /**
     * @return {?}
     */
    pause() { this._command('pause'); }
    /**
     * @return {?}
     */
    restart() { this._command('restart'); }
    /**
     * @return {?}
     */
    finish() { this._command('finish'); }
    /**
     * @return {?}
     */
    destroy() { this._command('destroy'); }
    /**
     * @return {?}
     */
    reset() { this._command('reset'); }
    /**
     * @param {?} p
     * @return {?}
     */
    setPosition(p) { this._command('setPosition', p); }
    /**
     * @return {?}
     */
    getPosition() { return 0; }
}
function RendererAnimationPlayer_tsickle_Closure_declarations() {
    /** @type {?} */
    RendererAnimationPlayer.prototype.parentPlayer;
    /** @type {?} */
    RendererAnimationPlayer.prototype._started;
    /** @type {?} */
    RendererAnimationPlayer.prototype.totalTime;
    /** @type {?} */
    RendererAnimationPlayer.prototype.id;
    /** @type {?} */
    RendererAnimationPlayer.prototype.element;
    /** @type {?} */
    RendererAnimationPlayer.prototype._renderer;
}
/**
 * @param {?} renderer
 * @param {?} element
 * @param {?} id
 * @param {?} command
 * @param {?} args
 * @return {?}
 */
function issueAnimationCommand(renderer, element, id, command, args) {
    return renderer.setProperty(element, `@@${id}:${command}`, args);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL2FuaW1hdGlvbnMvc3JjL2FuaW1hdGlvbl9idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFPQSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQTZFLFFBQVEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzVKLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFpQixpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFLbkQsTUFBTSw4QkFBK0IsU0FBUSxnQkFBZ0I7Ozs7O0lBSTNELFlBQVksWUFBOEIsRUFBb0IsR0FBUTtRQUNwRSxLQUFLLEVBQUUsQ0FBQztnQ0FKaUIsQ0FBQztRQUsxQix1QkFBTSxRQUFRLHFCQUFHO1lBQ2YsRUFBRSxFQUFFLEdBQUc7WUFDUCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtZQUNyQyxNQUFNLEVBQUUsRUFBRTtZQUNWLElBQUksRUFBRSxFQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUM7U0FDTCxDQUFBLENBQUM7UUFDbkIsSUFBSSxDQUFDLFNBQVMscUJBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBc0IsQ0FBQSxDQUFDO0tBQ3ZGOzs7OztJQUVELEtBQUssQ0FBQyxTQUFnRDtRQUNwRCx1QkFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzVDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hCLHVCQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENB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LENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Ozs7O0lBRXpDLFdBQVcsQ0FBQyxDQUFTLElBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTs7OztJQUVqRSxXQUFXLEtBQWEsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO0NBR3BDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELCtCQUNJLFFBQTJCLEVBQUUsT0FBWSxFQUFFLEVBQVUsRUFBRSxPQUFlLEVBQUUsSUFBVztJQUNyRixNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDbEUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvbkJ1aWxkZXIsIEFuaW1hdGlvbkZhY3RvcnksIEFuaW1hdGlvbk1ldGFkYXRhLCBBbmltYXRpb25PcHRpb25zLCBBbmltYXRpb25QbGF5ZXIsIE5vb3BBbmltYXRpb25QbGF5ZXIsIHNlcXVlbmNlfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBSZW5kZXJlckZhY3RvcnkyLCBSZW5kZXJlclR5cGUyLCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcblxuaW1wb3J0IHtBbmltYXRpb25SZW5kZXJlcn0gZnJvbSAnLi9hbmltYXRpb25fcmVuZGVyZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQnJvd3NlckFuaW1hdGlvbkJ1aWxkZXIgZXh0ZW5kcyBBbmltYXRpb25CdWlsZGVyIHtcbiAgcHJpdmF0ZSBfbmV4dEFuaW1hdGlvbklkID0gMDtcbiAgcHJpdmF0ZSBfcmVuZGVyZXI6IEFuaW1hdGlvblJlbmRlcmVyO1xuXG4gIGNvbnN0cnVjdG9yKHJvb3RSZW5kZXJlcjogUmVuZGVyZXJGYWN0b3J5MiwgQEluamVjdChET0NVTUVOVCkgZG9jOiBhbnkpIHtcbiAgICBzdXBlcigpO1xuICAgIGNvbnN0IHR5cGVEYXRhID0ge1xuICAgICAgaWQ6ICcwJyxcbiAgICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gICAgICBzdHlsZXM6IFtdLFxuICAgICAgZGF0YToge2FuaW1hdGlvbjogW119XG4gICAgfSBhcyBSZW5kZXJlclR5cGUyO1xuICAgIHRoaXMuX3JlbmRlcmVyID0gcm9vdFJlbmRlcmVyLmNyZWF0ZVJlbmRlcmVyKGRvYy5ib2R5LCB0eXBlRGF0YSkgYXMgQW5pbWF0aW9uUmVuZGVyZXI7XG4gIH1cblxuICBidWlsZChhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW10pOiBBbmltYXRpb25GYWN0b3J5IHtcbiAgICBjb25zdCBpZCA9IHRoaXMuX25leHRBbmltYXRpb25JZC50b1N0cmluZygpO1xuICAgIHRoaXMuX25leHRBbmltYXRpb25JZCsrO1xuICAgIGNvbnN0IGVudHJ5ID0gQXJyYXkuaXNBcnJheShhbmltYXRpb24pID8gc2VxdWVuY2UoYW5pbWF0aW9uKSA6IGFuaW1hdGlvbjtcbiAgICBpc3N1ZUFuaW1hdGlvbkNvbW1hbmQodGhpcy5fcmVuZGVyZXIsIG51bGwsIGlkLCAncmVnaXN0ZXInLCBbZW50cnldKTtcbiAgICByZXR1cm4gbmV3IEJyb3dzZXJBbmltYXRpb25GYWN0b3J5KGlkLCB0aGlzLl9yZW5kZXJlcik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJyb3dzZXJBbmltYXRpb25GYWN0b3J5IGV4dGVuZHMgQW5pbWF0aW9uRmFjdG9yeSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2lkOiBzdHJpbmcsIHByaXZhdGUgX3JlbmRlcmVyOiBBbmltYXRpb25SZW5kZXJlcikgeyBzdXBlcigpOyB9XG5cbiAgY3JlYXRlKGVsZW1lbnQ6IGFueSwgb3B0aW9ucz86IEFuaW1hdGlvbk9wdGlvbnMpOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIHJldHVybiBuZXcgUmVuZGVyZXJBbmltYXRpb25QbGF5ZXIodGhpcy5faWQsIGVsZW1lbnQsIG9wdGlvbnMgfHwge30sIHRoaXMuX3JlbmRlcmVyKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuZGVyZXJBbmltYXRpb25QbGF5ZXIgaW1wbGVtZW50cyBBbmltYXRpb25QbGF5ZXIge1xuICBwdWJsaWMgcGFyZW50UGxheWVyOiBBbmltYXRpb25QbGF5ZXJ8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX3N0YXJ0ZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBpZDogc3RyaW5nLCBwdWJsaWMgZWxlbWVudDogYW55LCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zLFxuICAgICAgcHJpdmF0ZSBfcmVuZGVyZXI6IEFuaW1hdGlvblJlbmRlcmVyKSB7XG4gICAgdGhpcy5fY29tbWFuZCgnY3JlYXRlJywgb3B0aW9ucyk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW4oZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55KTogKCkgPT4gdm9pZCB7XG4gICAgcmV0dXJuIHRoaXMuX3JlbmRlcmVyLmxpc3Rlbih0aGlzLmVsZW1lbnQsIGBAQCR7dGhpcy5pZH06JHtldmVudE5hbWV9YCwgY2FsbGJhY2spO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tbWFuZChjb21tYW5kOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgcmV0dXJuIGlzc3VlQW5pbWF0aW9uQ29tbWFuZCh0aGlzLl9yZW5kZXJlciwgdGhpcy5lbGVtZW50LCB0aGlzLmlkLCBjb21tYW5kLCBhcmdzKTtcbiAgfVxuXG4gIG9uRG9uZShmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9saXN0ZW4oJ2RvbmUnLCBmbik7IH1cblxuICBvblN0YXJ0KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX2xpc3Rlbignc3RhcnQnLCBmbik7IH1cblxuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fbGlzdGVuKCdkZXN0cm95JywgZm4pOyB9XG5cbiAgaW5pdCgpOiB2b2lkIHsgdGhpcy5fY29tbWFuZCgnaW5pdCcpOyB9XG5cbiAgaGFzU3RhcnRlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3N0YXJ0ZWQ7IH1cblxuICBwbGF5KCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbW1hbmQoJ3BsYXknKTtcbiAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgfVxuXG4gIHBhdXNlKCk6IHZvaWQgeyB0aGlzLl9jb21tYW5kKCdwYXVzZScpOyB9XG5cbiAgcmVzdGFydCgpOiB2b2lkIHsgdGhpcy5fY29tbWFuZCgncmVzdGFydCcpOyB9XG5cbiAgZmluaXNoKCk6IHZvaWQgeyB0aGlzLl9jb21tYW5kKCdmaW5pc2gnKTsgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7IHRoaXMuX2NvbW1hbmQoJ2Rlc3Ryb3knKTsgfVxuXG4gIHJlc2V0KCk6IHZvaWQgeyB0aGlzLl9jb21tYW5kKCdyZXNldCcpOyB9XG5cbiAgc2V0UG9zaXRpb24ocDogbnVtYmVyKTogdm9pZCB7IHRoaXMuX2NvbW1hbmQoJ3NldFBvc2l0aW9uJywgcCk7IH1cblxuICBnZXRQb3NpdGlvbigpOiBudW1iZXIgeyByZXR1cm4gMDsgfVxuXG4gIHB1YmxpYyB0b3RhbFRpbWUgPSAwO1xufVxuXG5mdW5jdGlvbiBpc3N1ZUFuaW1hdGlvbkNvbW1hbmQoXG4gICAgcmVuZGVyZXI6IEFuaW1hdGlvblJlbmRlcmVyLCBlbGVtZW50OiBhbnksIGlkOiBzdHJpbmcsIGNvbW1hbmQ6IHN0cmluZywgYXJnczogYW55W10pOiBhbnkge1xuICByZXR1cm4gcmVuZGVyZXIuc2V0UHJvcGVydHkoZWxlbWVudCwgYEBAJHtpZH06JHtjb21tYW5kfWAsIGFyZ3MpO1xufVxuIl19