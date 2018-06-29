/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable } from '@angular/core';
import { getDOM } from '../dom/dom_adapter';
import { DOCUMENT } from '../dom/dom_tokens';
/**
 * A service that can be used to get and set the title of a current HTML document.
 *
 * Since an Angular application can't be bootstrapped on the entire HTML document (`<html>` tag)
 * it is not possible to bind to the `text` property of the `HTMLTitleElement` elements
 * (representing the `<title>` tag). Instead, this service can be used to set and get the current
 * title value.
 *
 * @experimental
 */
var Title = /** @class */ (function () {
    function Title(_doc) {
        this._doc = _doc;
    }
    /**
     * Get the title of the current HTML document.
     */
    Title.prototype.getTitle = function () { return getDOM().getTitle(this._doc); };
    /**
     * Set the title of the current HTML document.
     * @param newTitle
     */
    Title.prototype.setTitle = function (newTitle) { getDOM().setTitle(this._doc, newTitle); };
    Title.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    Title.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
    ]; };
    return Title;
}());
export { Title };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL3NyYy9icm93c2VyL3RpdGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRWpELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUMxQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFHM0M7Ozs7Ozs7OztHQVNHO0FBQ0g7SUFFRSxlQUFzQyxJQUFTO1FBQVQsU0FBSSxHQUFKLElBQUksQ0FBSztJQUFHLENBQUM7SUFDbkQ7O09BRUc7SUFDSCx3QkFBUSxHQUFSLGNBQXFCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUzRDs7O09BR0c7SUFDSCx3QkFBUSxHQUFSLFVBQVMsUUFBZ0IsSUFBSSxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7O2dCQVp2RSxVQUFVOzs7O2dEQUVJLE1BQU0sU0FBQyxRQUFROztJQVc5QixZQUFDO0NBQUEsQUFiRCxJQWFDO1NBWlksS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2dldERPTX0gZnJvbSAnLi4vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJy4uL2RvbS9kb21fdG9rZW5zJztcblxuXG4vKipcbiAqIEEgc2VydmljZSB0aGF0IGNhbiBiZSB1c2VkIHRvIGdldCBhbmQgc2V0IHRoZSB0aXRsZSBvZiBhIGN1cnJlbnQgSFRNTCBkb2N1bWVudC5cbiAqXG4gKiBTaW5jZSBhbiBBbmd1bGFyIGFwcGxpY2F0aW9uIGNhbid0IGJlIGJvb3RzdHJhcHBlZCBvbiB0aGUgZW50aXJlIEhUTUwgZG9jdW1lbnQgKGA8aHRtbD5gIHRhZylcbiAqIGl0IGlzIG5vdCBwb3NzaWJsZSB0byBiaW5kIHRvIHRoZSBgdGV4dGAgcHJvcGVydHkgb2YgdGhlIGBIVE1MVGl0bGVFbGVtZW50YCBlbGVtZW50c1xuICogKHJlcHJlc2VudGluZyB0aGUgYDx0aXRsZT5gIHRhZykuIEluc3RlYWQsIHRoaXMgc2VydmljZSBjYW4gYmUgdXNlZCB0byBzZXQgYW5kIGdldCB0aGUgY3VycmVudFxuICogdGl0bGUgdmFsdWUuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGl0bGUge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIF9kb2M6IGFueSkge31cbiAgLyoqXG4gICAqIEdldCB0aGUgdGl0bGUgb2YgdGhlIGN1cnJlbnQgSFRNTCBkb2N1bWVudC5cbiAgICovXG4gIGdldFRpdGxlKCk6IHN0cmluZyB7IHJldHVybiBnZXRET00oKS5nZXRUaXRsZSh0aGlzLl9kb2MpOyB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdGl0bGUgb2YgdGhlIGN1cnJlbnQgSFRNTCBkb2N1bWVudC5cbiAgICogQHBhcmFtIG5ld1RpdGxlXG4gICAqL1xuICBzZXRUaXRsZShuZXdUaXRsZTogc3RyaW5nKSB7IGdldERPTSgpLnNldFRpdGxlKHRoaXMuX2RvYywgbmV3VGl0bGUpOyB9XG59XG4iXX0=