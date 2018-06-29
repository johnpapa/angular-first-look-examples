import * as tslib_1 from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationBuilder, AnimationFactory, sequence } from '@angular/animations';
import { Inject, Injectable, RendererFactory2, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
var BrowserAnimationBuilder = /** @class */ (function (_super) {
    tslib_1.__extends(BrowserAnimationBuilder, _super);
    function BrowserAnimationBuilder(rootRenderer, doc) {
        var _this = _super.call(this) || this;
        _this._nextAnimationId = 0;
        var typeData = {
            id: '0',
            encapsulation: ViewEncapsulation.None,
            styles: [],
            data: { animation: [] }
        };
        _this._renderer = rootRenderer.createRenderer(doc.body, typeData);
        return _this;
    }
    BrowserAnimationBuilder.prototype.build = function (animation) {
        var id = this._nextAnimationId.toString();
        this._nextAnimationId++;
        var entry = Array.isArray(animation) ? sequence(animation) : animation;
        issueAnimationCommand(this._renderer, null, id, 'register', [entry]);
        return new BrowserAnimationFactory(id, this._renderer);
    };
    BrowserAnimationBuilder.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    BrowserAnimationBuilder.ctorParameters = function () { return [
        { type: RendererFactory2 },
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
    ]; };
    return BrowserAnimationBuilder;
}(AnimationBuilder));
export { BrowserAnimationBuilder };
var BrowserAnimationFactory = /** @class */ (function (_super) {
    tslib_1.__extends(BrowserAnimationFactory, _super);
    function BrowserAnimationFactory(_id, _renderer) {
        var _this = _super.call(this) || this;
        _this._id = _id;
        _this._renderer = _renderer;
        return _this;
    }
    BrowserAnimationFactory.prototype.create = function (element, options) {
        return new RendererAnimationPlayer(this._id, element, options || {}, this._renderer);
    };
    return BrowserAnimationFactory;
}(AnimationFactory));
export { BrowserAnimationFactory };
var RendererAnimationPlayer = /** @class */ (function () {
    function RendererAnimationPlayer(id, element, options, _renderer) {
        this.id = id;
        this.element = element;
        this._renderer = _renderer;
        this.parentPlayer = null;
        this._started = false;
        this.totalTime = 0;
        this._command('create', options);
    }
    RendererAnimationPlayer.prototype._listen = function (eventName, callback) {
        return this._renderer.listen(this.element, "@@" + this.id + ":" + eventName, callback);
    };
    RendererAnimationPlayer.prototype._command = function (command) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return issueAnimationCommand(this._renderer, this.element, this.id, command, args);
    };
    RendererAnimationPlayer.prototype.onDone = function (fn) { this._listen('done', fn); };
    RendererAnimationPlayer.prototype.onStart = function (fn) { this._listen('start', fn); };
    RendererAnimationPlayer.prototype.onDestroy = function (fn) { this._listen('destroy', fn); };
    RendererAnimationPlayer.prototype.init = function () { this._command('init'); };
    RendererAnimationPlayer.prototype.hasStarted = function () { return this._started; };
    RendererAnimationPlayer.prototype.play = function () {
        this._command('play');
        this._started = true;
    };
    RendererAnimationPlayer.prototype.pause = function () { this._command('pause'); };
    RendererAnimationPlayer.prototype.restart = function () { this._command('restart'); };
    RendererAnimationPlayer.prototype.finish = function () { this._command('finish'); };
    RendererAnimationPlayer.prototype.destroy = function () { this._command('destroy'); };
    RendererAnimationPlayer.prototype.reset = function () { this._command('reset'); };
    RendererAnimationPlayer.prototype.setPosition = function (p) { this._command('setPosition', p); };
    RendererAnimationPlayer.prototype.getPosition = function () { return 0; };
    return RendererAnimationPlayer;
}());
export { RendererAnimationPlayer };
function issueAnimationCommand(renderer, element, id, command, args) {
    return renderer.setProperty(element, "@@" + id + ":" + command, args);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL2FuaW1hdGlvbnMvc3JjL2FuaW1hdGlvbl9idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQTZFLFFBQVEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzVKLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFpQixpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFJbkQ7SUFDNkMsbURBQWdCO0lBSTNELGlDQUFZLFlBQThCLEVBQW9CLEdBQVE7UUFBdEUsWUFDRSxpQkFBTyxTQVFSO1FBWk8sc0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBSzNCLElBQU0sUUFBUSxHQUFHO1lBQ2YsRUFBRSxFQUFFLEdBQUc7WUFDUCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtZQUNyQyxNQUFNLEVBQUUsRUFBRTtZQUNWLElBQUksRUFBRSxFQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUM7U0FDTCxDQUFDO1FBQ25CLEtBQUksQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBc0IsQ0FBQzs7SUFDeEYsQ0FBQztJQUVELHVDQUFLLEdBQUwsVUFBTSxTQUFnRDtRQUNwRCxJQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDNUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDeEIsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FB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LENBQUM7SUFDdkIsQ0FBQztJQUVELHVDQUFLLEdBQUwsY0FBZ0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFekMseUNBQU8sR0FBUCxjQUFrQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU3Qyx3Q0FBTSxHQUFOLGNBQWlCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTNDLHlDQUFPLEdBQVAsY0FBa0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFN0MsdUNBQUssR0FBTCxjQUFnQixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV6Qyw2Q0FBVyxHQUFYLFVBQVksQ0FBUyxJQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVqRSw2Q0FBVyxHQUFYLGNBQXdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBR3JDLDhCQUFDO0FBQUQsQ0FBQyxBQWhERCxJQWdEQzs7QUFFRCwrQkFDSSxRQUEyQixFQUFFLE9BQVksRUFBRSxFQUFVLEVBQUUsT0FBZSxFQUFFLElBQVc7SUFDckYsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLE9BQUssRUFBRSxTQUFJLE9BQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRpb25CdWlsZGVyLCBBbmltYXRpb25GYWN0b3J5LCBBbmltYXRpb25NZXRhZGF0YSwgQW5pbWF0aW9uT3B0aW9ucywgQW5pbWF0aW9uUGxheWVyLCBOb29wQW5pbWF0aW9uUGxheWVyLCBzZXF1ZW5jZX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgUmVuZGVyZXJGYWN0b3J5MiwgUmVuZGVyZXJUeXBlMiwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbmltcG9ydCB7QW5pbWF0aW9uUmVuZGVyZXJ9IGZyb20gJy4vYW5pbWF0aW9uX3JlbmRlcmVyJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJyb3dzZXJBbmltYXRpb25CdWlsZGVyIGV4dGVuZHMgQW5pbWF0aW9uQnVpbGRlciB7XG4gIHByaXZhdGUgX25leHRBbmltYXRpb25JZCA9IDA7XG4gIHByaXZhdGUgX3JlbmRlcmVyOiBBbmltYXRpb25SZW5kZXJlcjtcblxuICBjb25zdHJ1Y3Rvcihyb290UmVuZGVyZXI6IFJlbmRlcmVyRmFjdG9yeTIsIEBJbmplY3QoRE9DVU1FTlQpIGRvYzogYW55KSB7XG4gICAgc3VwZXIoKTtcbiAgICBjb25zdCB0eXBlRGF0YSA9IHtcbiAgICAgIGlkOiAnMCcsXG4gICAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICAgICAgc3R5bGVzOiBbXSxcbiAgICAgIGRhdGE6IHthbmltYXRpb246IFtdfVxuICAgIH0gYXMgUmVuZGVyZXJUeXBlMjtcbiAgICB0aGlzLl9yZW5kZXJlciA9IHJvb3RSZW5kZXJlci5jcmVhdGVSZW5kZXJlcihkb2MuYm9keSwgdHlwZURhdGEpIGFzIEFuaW1hdGlvblJlbmRlcmVyO1xuICB9XG5cbiAgYnVpbGQoYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdKTogQW5pbWF0aW9uRmFjdG9yeSB7XG4gICAgY29uc3QgaWQgPSB0aGlzLl9uZXh0QW5pbWF0aW9uSWQudG9TdHJpbmcoKTtcbiAgICB0aGlzLl9uZXh0QW5pbWF0aW9uSWQrKztcbiAgICBjb25zdCBlbnRyeSA9IEFycmF5LmlzQXJyYXkoYW5pbWF0aW9uKSA/IHNlcXVlbmNlKGFuaW1hdGlvbikgOiBhbmltYXRpb247XG4gICAgaXNzdWVBbmltYXRpb25Db21tYW5kKHRoaXMuX3JlbmRlcmVyLCBudWxsLCBpZCwgJ3JlZ2lzdGVyJywgW2VudHJ5XSk7XG4gICAgcmV0dXJuIG5ldyBCcm93c2VyQW5pbWF0aW9uRmFjdG9yeShpZCwgdGhpcy5fcmVuZGVyZXIpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCcm93c2VyQW5pbWF0aW9uRmFjdG9yeSBleHRlbmRzIEFuaW1hdGlvbkZhY3Rvcnkge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pZDogc3RyaW5nLCBwcml2YXRlIF9yZW5kZXJlcjogQW5pbWF0aW9uUmVuZGVyZXIpIHsgc3VwZXIoKTsgfVxuXG4gIGNyZWF0ZShlbGVtZW50OiBhbnksIG9wdGlvbnM/OiBBbmltYXRpb25PcHRpb25zKTogQW5pbWF0aW9uUGxheWVyIHtcbiAgICByZXR1cm4gbmV3IFJlbmRlcmVyQW5pbWF0aW9uUGxheWVyKHRoaXMuX2lkLCBlbGVtZW50LCBvcHRpb25zIHx8IHt9LCB0aGlzLl9yZW5kZXJlcik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmRlcmVyQW5pbWF0aW9uUGxheWVyIGltcGxlbWVudHMgQW5pbWF0aW9uUGxheWVyIHtcbiAgcHVibGljIHBhcmVudFBsYXllcjogQW5pbWF0aW9uUGxheWVyfG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9zdGFydGVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgaWQ6IHN0cmluZywgcHVibGljIGVsZW1lbnQ6IGFueSwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyxcbiAgICAgIHByaXZhdGUgX3JlbmRlcmVyOiBBbmltYXRpb25SZW5kZXJlcikge1xuICAgIHRoaXMuX2NvbW1hbmQoJ2NyZWF0ZScsIG9wdGlvbnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuKGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGFueSk6ICgpID0+IHZvaWQge1xuICAgIHJldHVybiB0aGlzLl9yZW5kZXJlci5saXN0ZW4odGhpcy5lbGVtZW50LCBgQEAke3RoaXMuaWR9OiR7ZXZlbnROYW1lfWAsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbW1hbmQoY29tbWFuZDogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkge1xuICAgIHJldHVybiBpc3N1ZUFuaW1hdGlvbkNvbW1hbmQodGhpcy5fcmVuZGVyZXIsIHRoaXMuZWxlbWVudCwgdGhpcy5pZCwgY29tbWFuZCwgYXJncyk7XG4gIH1cblxuICBvbkRvbmUoZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fbGlzdGVuKCdkb25lJywgZm4pOyB9XG5cbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9saXN0ZW4oJ3N0YXJ0JywgZm4pOyB9XG5cbiAgb25EZXN0cm95KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX2xpc3RlbignZGVzdHJveScsIGZuKTsgfVxuXG4gIGluaXQoKTogdm9pZCB7IHRoaXMuX2NvbW1hbmQoJ2luaXQnKTsgfVxuXG4gIGhhc1N0YXJ0ZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9zdGFydGVkOyB9XG5cbiAgcGxheSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21tYW5kKCdwbGF5Jyk7XG4gICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gIH1cblxuICBwYXVzZSgpOiB2b2lkIHsgdGhpcy5fY29tbWFuZCgncGF1c2UnKTsgfVxuXG4gIHJlc3RhcnQoKTogdm9pZCB7IHRoaXMuX2NvbW1hbmQoJ3Jlc3RhcnQnKTsgfVxuXG4gIGZpbmlzaCgpOiB2b2lkIHsgdGhpcy5fY29tbWFuZCgnZmluaXNoJyk7IH1cblxuICBkZXN0cm95KCk6IHZvaWQgeyB0aGlzLl9jb21tYW5kKCdkZXN0cm95Jyk7IH1cblxuICByZXNldCgpOiB2b2lkIHsgdGhpcy5fY29tbWFuZCgncmVzZXQnKTsgfVxuXG4gIHNldFBvc2l0aW9uKHA6IG51bWJlcik6IHZvaWQgeyB0aGlzLl9jb21tYW5kKCdzZXRQb3NpdGlvbicsIHApOyB9XG5cbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyIHsgcmV0dXJuIDA7IH1cblxuICBwdWJsaWMgdG90YWxUaW1lID0gMDtcbn1cblxuZnVuY3Rpb24gaXNzdWVBbmltYXRpb25Db21tYW5kKFxuICAgIHJlbmRlcmVyOiBBbmltYXRpb25SZW5kZXJlciwgZWxlbWVudDogYW55LCBpZDogc3RyaW5nLCBjb21tYW5kOiBzdHJpbmcsIGFyZ3M6IGFueVtdKTogYW55IHtcbiAgcmV0dXJuIHJlbmRlcmVyLnNldFByb3BlcnR5KGVsZW1lbnQsIGBAQCR7aWR9OiR7Y29tbWFuZH1gLCBhcmdzKTtcbn1cbiJdfQ==