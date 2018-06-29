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
 * \@experimental
 */
export class Title {
    /**
     * @param {?} _doc
     */
    constructor(_doc) {
        this._doc = _doc;
    }
    /**
     * Get the title of the current HTML document.
     * @return {?}
     */
    getTitle() { return getDOM().getTitle(this._doc); }
    /**
     * Set the title of the current HTML document.
     * @param {?} newTitle
     * @return {?}
     */
    setTitle(newTitle) { getDOM().setTitle(this._doc, newTitle); }
}
Title.decorators = [
    { type: Injectable }
];
/** @nocollapse */
Title.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
function Title_tsickle_Closure_declarations() {
    /** @type {?} */
    Title.prototype._doc;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL3NyYy9icm93c2VyL3RpdGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFakQsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQzFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQzs7Ozs7Ozs7Ozs7QUFjM0MsTUFBTTs7OztJQUNKLFlBQXNDLElBQVM7UUFBVCxTQUFJLEdBQUosSUFBSSxDQUFLO0tBQUk7Ozs7O0lBSW5ELFFBQVEsS0FBYSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFOzs7Ozs7SUFNM0QsUUFBUSxDQUFDLFFBQWdCLElBQUksTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRTs7O1lBWnZFLFVBQVU7Ozs7NENBRUksTUFBTSxTQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtnZXRET019IGZyb20gJy4uL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi9kb20vZG9tX3Rva2Vucyc7XG5cblxuLyoqXG4gKiBBIHNlcnZpY2UgdGhhdCBjYW4gYmUgdXNlZCB0byBnZXQgYW5kIHNldCB0aGUgdGl0bGUgb2YgYSBjdXJyZW50IEhUTUwgZG9jdW1lbnQuXG4gKlxuICogU2luY2UgYW4gQW5ndWxhciBhcHBsaWNhdGlvbiBjYW4ndCBiZSBib290c3RyYXBwZWQgb24gdGhlIGVudGlyZSBIVE1MIGRvY3VtZW50IChgPGh0bWw+YCB0YWcpXG4gKiBpdCBpcyBub3QgcG9zc2libGUgdG8gYmluZCB0byB0aGUgYHRleHRgIHByb3BlcnR5IG9mIHRoZSBgSFRNTFRpdGxlRWxlbWVudGAgZWxlbWVudHNcbiAqIChyZXByZXNlbnRpbmcgdGhlIGA8dGl0bGU+YCB0YWcpLiBJbnN0ZWFkLCB0aGlzIHNlcnZpY2UgY2FuIGJlIHVzZWQgdG8gc2V0IGFuZCBnZXQgdGhlIGN1cnJlbnRcbiAqIHRpdGxlIHZhbHVlLlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRpdGxlIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBfZG9jOiBhbnkpIHt9XG4gIC8qKlxuICAgKiBHZXQgdGhlIHRpdGxlIG9mIHRoZSBjdXJyZW50IEhUTUwgZG9jdW1lbnQuXG4gICAqL1xuICBnZXRUaXRsZSgpOiBzdHJpbmcgeyByZXR1cm4gZ2V0RE9NKCkuZ2V0VGl0bGUodGhpcy5fZG9jKTsgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRpdGxlIG9mIHRoZSBjdXJyZW50IEhUTUwgZG9jdW1lbnQuXG4gICAqIEBwYXJhbSBuZXdUaXRsZVxuICAgKi9cbiAgc2V0VGl0bGUobmV3VGl0bGU6IHN0cmluZykgeyBnZXRET00oKS5zZXRUaXRsZSh0aGlzLl9kb2MsIG5ld1RpdGxlKTsgfVxufVxuIl19