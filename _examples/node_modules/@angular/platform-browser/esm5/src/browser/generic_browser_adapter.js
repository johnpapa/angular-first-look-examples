/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { DomAdapter } from '../dom/dom_adapter';
/**
 * Provides DOM operations in any browser environment.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
var GenericBrowserDomAdapter = /** @class */ (function (_super) {
    tslib_1.__extends(GenericBrowserDomAdapter, _super);
    function GenericBrowserDomAdapter() {
        var _this = _super.call(this) || this;
        _this._animationPrefix = null;
        _this._transitionEnd = null;
        try {
            var element_1 = _this.createElement('div', document);
            if (_this.getStyle(element_1, 'animationName') != null) {
                _this._animationPrefix = '';
            }
            else {
                var domPrefixes = ['Webkit', 'Moz', 'O', 'ms'];
                for (var i = 0; i < domPrefixes.length; i++) {
                    if (_this.getStyle(element_1, domPrefixes[i] + 'AnimationName') != null) {
                        _this._animationPrefix = '-' + domPrefixes[i].toLowerCase() + '-';
                        break;
                    }
                }
            }
            var transEndEventNames_1 = {
                WebkitTransition: 'webkitTransitionEnd',
                MozTransition: 'transitionend',
                OTransition: 'oTransitionEnd otransitionend',
                transition: 'transitionend'
            };
            Object.keys(transEndEventNames_1).forEach(function (key) {
                if (_this.getStyle(element_1, key) != null) {
                    _this._transitionEnd = transEndEventNames_1[key];
                }
            });
        }
        catch (e) {
            _this._animationPrefix = null;
            _this._transitionEnd = null;
        }
        return _this;
    }
    GenericBrowserDomAdapter.prototype.getDistributedNodes = function (el) { return el.getDistributedNodes(); };
    GenericBrowserDomAdapter.prototype.resolveAndSetHref = function (el, baseUrl, href) {
        el.href = href == null ? baseUrl : baseUrl + '/../' + href;
    };
    GenericBrowserDomAdapter.prototype.supportsDOMEvents = function () { return true; };
    GenericBrowserDomAdapter.prototype.supportsNativeShadowDOM = function () {
        return typeof document.body.createShadowRoot === 'function';
    };
    GenericBrowserDomAdapter.prototype.getAnimationPrefix = function () { return this._animationPrefix ? this._animationPrefix : ''; };
    GenericBrowserDomAdapter.prototype.getTransitionEnd = function () { return this._transitionEnd ? this._transitionEnd : ''; };
    GenericBrowserDomAdapter.prototype.supportsAnimation = function () {
        return this._animationPrefix != null && this._transitionEnd != null;
    };
    return GenericBrowserDomAdapter;
}(DomAdapter));
export { GenericBrowserDomAdapter };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJpY19icm93c2VyX2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL3NyYy9icm93c2VyL2dlbmVyaWNfYnJvd3Nlcl9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFJOUM7Ozs7O0dBS0c7QUFDSDtJQUF1RCxvREFBVTtJQUcvRDtRQUFBLFlBQ0UsaUJBQU8sU0FnQ1I7UUFuQ08sc0JBQWdCLEdBQWdCLElBQUksQ0FBQztRQUNyQyxvQkFBYyxHQUFnQixJQUFJLENBQUM7UUFHekMsSUFBSSxDQUFDO1lBQ0gsSUFBTSxTQUFPLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDcEQsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxTQUFPLEVBQUUsZUFBZSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDcEQsS0FBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztZQUM3QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sSUFBTSxXQUFXLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFakQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQzVDLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxRQUFRLENBQUMsU0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxlQUFlLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUNyRSxLQUFJLENBQUMsZ0JBQWdCLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUM7d0JBQ2pFLEtBQUssQ0FBQztvQkFDUixDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO1lBRUQsSUFBTSxvQkFBa0IsR0FBNEI7Z0JBQ2xELGdCQUFnQixFQUFFLHFCQUFxQjtnQkFDdkMsYUFBYSxFQUFFLGVBQWU7Z0JBQzlCLFdBQVcsRUFBRSwrQkFBK0I7Z0JBQzVDLFVBQVUsRUFBRSxlQUFlO2FBQzVCLENBQUM7WUFFRixNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBVztnQkFDbEQsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxTQUFPLEVBQUUsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDeEMsS0FBSSxDQUFDLGNBQWMsR0FBRyxvQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEQsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDWCxLQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1lBQzdCLEtBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQzdCLENBQUM7O0lBQ0gsQ0FBQztJQUVELHNEQUFtQixHQUFuQixVQUFvQixFQUFlLElBQVksTUFBTSxDQUFPLEVBQUcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN4RixvREFBaUIsR0FBakIsVUFBa0IsRUFBcUIsRUFBRSxPQUFlLEVBQUUsSUFBWTtRQUNwRSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDN0QsQ0FBQztJQUNELG9EQUFpQixHQUFqQixjQUErQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM3QywwREFBdUIsR0FBdkI7UUFDRSxNQUFNLENBQUMsT0FBWSxRQUFRLENBQUMsSUFBSyxDQUFDLGdCQUFnQixLQUFLLFVBQVUsQ0FBQztJQUNwRSxDQUFDO0lBQ0QscURBQWtCLEdBQWxCLGNBQStCLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMzRixtREFBZ0IsR0FBaEIsY0FBNkIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckYsb0RBQWlCLEdBQWpCO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUM7SUFDdEUsQ0FBQztJQUNILCtCQUFDO0FBQUQsQ0FBQyxBQW5ERCxDQUF1RCxVQUFVLEdBbURoRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEb21BZGFwdGVyfSBmcm9tICcuLi9kb20vZG9tX2FkYXB0ZXInO1xuXG5cblxuLyoqXG4gKiBQcm92aWRlcyBET00gb3BlcmF0aW9ucyBpbiBhbnkgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAqXG4gKiBAc2VjdXJpdHkgVHJlYWQgY2FyZWZ1bGx5ISBJbnRlcmFjdGluZyB3aXRoIHRoZSBET00gZGlyZWN0bHkgaXMgZGFuZ2Vyb3VzIGFuZFxuICogY2FuIGludHJvZHVjZSBYU1Mgcmlza3MuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIgZXh0ZW5kcyBEb21BZGFwdGVyIHtcbiAgcHJpdmF0ZSBfYW5pbWF0aW9uUHJlZml4OiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX3RyYW5zaXRpb25FbmQ6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuY3JlYXRlRWxlbWVudCgnZGl2JywgZG9jdW1lbnQpO1xuICAgICAgaWYgKHRoaXMuZ2V0U3R5bGUoZWxlbWVudCwgJ2FuaW1hdGlvbk5hbWUnKSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvblByZWZpeCA9ICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZG9tUHJlZml4ZXMgPSBbJ1dlYmtpdCcsICdNb3onLCAnTycsICdtcyddO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZG9tUHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAodGhpcy5nZXRTdHlsZShlbGVtZW50LCBkb21QcmVmaXhlc1tpXSArICdBbmltYXRpb25OYW1lJykgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uUHJlZml4ID0gJy0nICsgZG9tUHJlZml4ZXNbaV0udG9Mb3dlckNhc2UoKSArICctJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCB0cmFuc0VuZEV2ZW50TmFtZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgICBXZWJraXRUcmFuc2l0aW9uOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICAgIE1velRyYW5zaXRpb246ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgT1RyYW5zaXRpb246ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCcsXG4gICAgICAgIHRyYW5zaXRpb246ICd0cmFuc2l0aW9uZW5kJ1xuICAgICAgfTtcblxuICAgICAgT2JqZWN0LmtleXModHJhbnNFbmRFdmVudE5hbWVzKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAodGhpcy5nZXRTdHlsZShlbGVtZW50LCBrZXkpICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl90cmFuc2l0aW9uRW5kID0gdHJhbnNFbmRFdmVudE5hbWVzW2tleV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX2FuaW1hdGlvblByZWZpeCA9IG51bGw7XG4gICAgICB0aGlzLl90cmFuc2l0aW9uRW5kID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXREaXN0cmlidXRlZE5vZGVzKGVsOiBIVE1MRWxlbWVudCk6IE5vZGVbXSB7IHJldHVybiAoPGFueT5lbCkuZ2V0RGlzdHJpYnV0ZWROb2RlcygpOyB9XG4gIHJlc29sdmVBbmRTZXRIcmVmKGVsOiBIVE1MQW5jaG9yRWxlbWVudCwgYmFzZVVybDogc3RyaW5nLCBocmVmOiBzdHJpbmcpIHtcbiAgICBlbC5ocmVmID0gaHJlZiA9PSBudWxsID8gYmFzZVVybCA6IGJhc2VVcmwgKyAnLy4uLycgKyBocmVmO1xuICB9XG4gIHN1cHBvcnRzRE9NRXZlbnRzKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuICBzdXBwb3J0c05hdGl2ZVNoYWRvd0RPTSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHlwZW9mKDxhbnk+ZG9jdW1lbnQuYm9keSkuY3JlYXRlU2hhZG93Um9vdCA9PT0gJ2Z1bmN0aW9uJztcbiAgfVxuICBnZXRBbmltYXRpb25QcmVmaXgoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX2FuaW1hdGlvblByZWZpeCA/IHRoaXMuX2FuaW1hdGlvblByZWZpeCA6ICcnOyB9XG4gIGdldFRyYW5zaXRpb25FbmQoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX3RyYW5zaXRpb25FbmQgPyB0aGlzLl90cmFuc2l0aW9uRW5kIDogJyc7IH1cbiAgc3VwcG9ydHNBbmltYXRpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2FuaW1hdGlvblByZWZpeCAhPSBudWxsICYmIHRoaXMuX3RyYW5zaXRpb25FbmQgIT0gbnVsbDtcbiAgfVxufVxuIl19