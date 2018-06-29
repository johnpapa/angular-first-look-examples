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
import { Directive, Input, TemplateRef, ViewContainerRef, ɵstringify as stringify } from '@angular/core';
/**
 * Conditionally includes a template based on the value of an `expression`.
 *
 * `ngIf` evaluates the `expression` and then renders the `then` or `else` template in its place
 * when expression is truthy or falsy respectively. Typically the:
 *  - `then` template is the inline template of `ngIf` unless bound to a different value.
 *  - `else` template is blank unless it is bound.
 *
 * ## Most common usage
 *
 * The most common usage of the `ngIf` directive is to conditionally show the inline template as
 * seen in this example:
 * {\@example common/ngIf/ts/module.ts region='NgIfSimple'}
 *
 * ## Showing an alternative template using `else`
 *
 * If it is necessary to display a template when the `expression` is falsy use the `else` template
 * binding as shown. Note that the `else` binding points to a `<ng-template>` labeled `#elseBlock`.
 * The template can be defined anywhere in the component view but is typically placed right after
 * `ngIf` for readability.
 *
 * {\@example common/ngIf/ts/module.ts region='NgIfElse'}
 *
 * ## Using non-inlined `then` template
 *
 * Usually the `then` template is the inlined template of the `ngIf`, but it can be changed using
 * a binding (just like `else`). Because `then` and `else` are bindings, the template references can
 * change at runtime as shown in this example.
 *
 * {\@example common/ngIf/ts/module.ts region='NgIfThenElse'}
 *
 * ## Storing conditional result in a variable
 *
 * A common pattern is that we need to show a set of properties from the same object. If the
 * object is undefined, then we have to use the safe-traversal-operator `?.` to guard against
 * dereferencing a `null` value. This is especially the case when waiting on async data such as
 * when using the `async` pipe as shown in following example:
 *
 * ```
 * Hello {{ (userStream|async)?.last }}, {{ (userStream|async)?.first }}!
 * ```
 *
 * There are several inefficiencies in the above example:
 *  - We create multiple subscriptions on `userStream`. One for each `async` pipe, or two in the
 *    example above.
 *  - We cannot display an alternative screen while waiting for the data to arrive asynchronously.
 *  - We have to use the safe-traversal-operator `?.` to access properties, which is cumbersome.
 *  - We have to place the `async` pipe in parenthesis.
 *
 * A better way to do this is to use `ngIf` and store the result of the condition in a local
 * variable as shown in the the example below:
 *
 * {\@example common/ngIf/ts/module.ts region='NgIfAs'}
 *
 * Notice that:
 *  - We use only one `async` pipe and hence only one subscription gets created.
 *  - `ngIf` stores the result of the `userStream|async` in the local variable `user`.
 *  - The local `user` can then be bound repeatedly in a more efficient way.
 *  - No need to use the safe-traversal-operator `?.` to access properties as `ngIf` will only
 *    display the data if `userStream` returns a value.
 *  - We can display an alternative template while waiting for the data.
 *
 * ### Syntax
 *
 * Simple form:
 * - `<div *ngIf="condition">...</div>`
 * - `<ng-template [ngIf]="condition"><div>...</div></ng-template>`
 *
 * Form with an else block:
 * ```
 * <div *ngIf="condition; else elseBlock">...</div>
 * <ng-template #elseBlock>...</ng-template>
 * ```
 *
 * Form with a `then` and `else` block:
 * ```
 * <div *ngIf="condition; then thenBlock else elseBlock"></div>
 * <ng-template #thenBlock>...</ng-template>
 * <ng-template #elseBlock>...</ng-template>
 * ```
 *
 * Form with storing the value locally:
 * ```
 * <div *ngIf="condition as value; else elseBlock">{{value}}</div>
 * <ng-template #elseBlock>...</ng-template>
 * ```
 *
 *
 */
export class NgIf {
    /**
     * @param {?} _viewContainer
     * @param {?} templateRef
     */
    constructor(_viewContainer, templateRef) {
        this._viewContainer = _viewContainer;
        this._context = new NgIfContext();
        this._thenTemplateRef = null;
        this._elseTemplateRef = null;
        this._thenViewRef = null;
        this._elseViewRef = null;
        this._thenTemplateRef = templateRef;
    }
    /**
     * @param {?} condition
     * @return {?}
     */
    set ngIf(condition) {
        this._context.$implicit = this._context.ngIf = condition;
        this._updateView();
    }
    /**
     * @param {?} templateRef
     * @return {?}
     */
    set ngIfThen(templateRef) {
        assertTemplate('ngIfThen', templateRef);
        this._thenTemplateRef = templateRef;
        this._thenViewRef = null; // clear previous view if any.
        this._updateView();
    }
    /**
     * @param {?} templateRef
     * @return {?}
     */
    set ngIfElse(templateRef) {
        assertTemplate('ngIfElse', templateRef);
        this._elseTemplateRef = templateRef;
        this._elseViewRef = null; // clear previous view if any.
        this._updateView();
    }
    /**
     * @return {?}
     */
    _updateView() {
        if (this._context.$implicit) {
            if (!this._thenViewRef) {
                this._viewContainer.clear();
                this._elseViewRef = null;
                if (this._thenTemplateRef) {
                    this._thenViewRef =
                        this._viewContainer.createEmbeddedView(this._thenTemplateRef, this._context);
                }
            }
        }
        else {
            if (!this._elseViewRef) {
                this._viewContainer.clear();
                this._thenViewRef = null;
                if (this._elseTemplateRef) {
                    this._elseViewRef =
                        this._viewContainer.createEmbeddedView(this._elseTemplateRef, this._context);
                }
            }
        }
    }
}
NgIf.decorators = [
    { type: Directive, args: [{ selector: '[ngIf]' },] }
];
/** @nocollapse */
NgIf.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: TemplateRef }
];
NgIf.propDecorators = {
    ngIf: [{ type: Input }],
    ngIfThen: [{ type: Input }],
    ngIfElse: [{ type: Input }]
};
function NgIf_tsickle_Closure_declarations() {
    /**
     * \@internal
     * @type {?}
     */
    NgIf.ngIfUseIfTypeGuard;
    /** @type {?} */
    NgIf.prototype._context;
    /** @type {?} */
    NgIf.prototype._thenTemplateRef;
    /** @type {?} */
    NgIf.prototype._elseTemplateRef;
    /** @type {?} */
    NgIf.prototype._thenViewRef;
    /** @type {?} */
    NgIf.prototype._elseViewRef;
    /** @type {?} */
    NgIf.prototype._viewContainer;
}
export class NgIfContext {
    constructor() {
        this.$implicit = null;
        this.ngIf = null;
    }
}
function NgIfContext_tsickle_Closure_declarations() {
    /** @type {?} */
    NgIfContext.prototype.$implicit;
    /** @type {?} */
    NgIfContext.prototype.ngIf;
}
/**
 * @param {?} property
 * @param {?} templateRef
 * @return {?}
 */
function assertTemplate(property, templateRef) {
    const /** @type {?} */ isTemplateRefOrNull = !!(!templateRef || templateRef.createEmbeddedView);
    if (!isTemplateRefOrNull) {
        throw new Error(`${property} must be a TemplateRef, but received '${stringify(templateRef)}'.`);
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfaWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfaWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsU0FBUyxFQUFtQixLQUFLLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLFVBQVUsSUFBSSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZGeEgsTUFBTTs7Ozs7SUFPSixZQUFvQixjQUFnQyxFQUFFLFdBQXFDO1FBQXZFLG1CQUFjLEdBQWQsY0FBYyxDQUFrQjt3QkFOcEIsSUFBSSxXQUFXLEVBQUU7Z0NBQ1MsSUFBSTtnQ0FDSixJQUFJOzRCQUNKLElBQUk7NEJBQ0osSUFBSTtRQUc1RCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDO0tBQ3JDOzs7OztJQUVELElBQ0ksSUFBSSxDQUFDLFNBQWM7UUFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO1FBQ3pELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNwQjs7Ozs7SUFFRCxJQUNJLFFBQVEsQ0FBQyxXQUEwQztRQUNyRCxjQUFjLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxXQUFXLENBQUM7UUFDcEMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3BCOzs7OztJQUVELElBQ0ksUUFBUSxDQUFDLFdBQTBDO1FBQ3JELGNBQWMsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQztRQUNwQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDcEI7Ozs7SUFFTyxXQUFXO1FBQ2pCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUM1QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztnQkFDekIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztvQkFDMUIsSUFBSSxDQUFDLFlBQVk7d0JBQ2IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNsRjthQUNGO1NBQ0Y7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO29CQUMxQixJQUFJLENBQUMsWUFBWTt3QkFDYixJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ2xGO2FBQ0Y7U0FDRjs7OztZQXJESixTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFDOzs7O1lBNUZ5QixnQkFBZ0I7WUFBN0IsV0FBVzs7O21CQXdHbkQsS0FBSzt1QkFNTCxLQUFLO3VCQVFMLEtBQUs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtDUixNQUFNOzt5QkFDb0IsSUFBSTtvQkFDVCxJQUFJOztDQUN4Qjs7Ozs7Ozs7Ozs7O0FBRUQsd0JBQXdCLFFBQWdCLEVBQUUsV0FBbUM7SUFDM0UsdUJBQU0sbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDL0UsRUFBRSxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7UUFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLFFBQVEseUNBQXlDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDakc7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEVtYmVkZGVkVmlld1JlZiwgSW5wdXQsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmLCDJtXN0cmluZ2lmeSBhcyBzdHJpbmdpZnl9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5cbi8qKlxuICogQ29uZGl0aW9uYWxseSBpbmNsdWRlcyBhIHRlbXBsYXRlIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiBhbiBgZXhwcmVzc2lvbmAuXG4gKlxuICogYG5nSWZgIGV2YWx1YXRlcyB0aGUgYGV4cHJlc3Npb25gIGFuZCB0aGVuIHJlbmRlcnMgdGhlIGB0aGVuYCBvciBgZWxzZWAgdGVtcGxhdGUgaW4gaXRzIHBsYWNlXG4gKiB3aGVuIGV4cHJlc3Npb24gaXMgdHJ1dGh5IG9yIGZhbHN5IHJlc3BlY3RpdmVseS4gVHlwaWNhbGx5IHRoZTpcbiAqICAtIGB0aGVuYCB0ZW1wbGF0ZSBpcyB0aGUgaW5saW5lIHRlbXBsYXRlIG9mIGBuZ0lmYCB1bmxlc3MgYm91bmQgdG8gYSBkaWZmZXJlbnQgdmFsdWUuXG4gKiAgLSBgZWxzZWAgdGVtcGxhdGUgaXMgYmxhbmsgdW5sZXNzIGl0IGlzIGJvdW5kLlxuICpcbiAqICMjIE1vc3QgY29tbW9uIHVzYWdlXG4gKlxuICogVGhlIG1vc3QgY29tbW9uIHVzYWdlIG9mIHRoZSBgbmdJZmAgZGlyZWN0aXZlIGlzIHRvIGNvbmRpdGlvbmFsbHkgc2hvdyB0aGUgaW5saW5lIHRlbXBsYXRlIGFzXG4gKiBzZWVuIGluIHRoaXMgZXhhbXBsZTpcbiAqIHtAZXhhbXBsZSBjb21tb24vbmdJZi90cy9tb2R1bGUudHMgcmVnaW9uPSdOZ0lmU2ltcGxlJ31cbiAqXG4gKiAjIyBTaG93aW5nIGFuIGFsdGVybmF0aXZlIHRlbXBsYXRlIHVzaW5nIGBlbHNlYFxuICpcbiAqIElmIGl0IGlzIG5lY2Vzc2FyeSB0byBkaXNwbGF5IGEgdGVtcGxhdGUgd2hlbiB0aGUgYGV4cHJlc3Npb25gIGlzIGZhbHN5IHVzZSB0aGUgYGVsc2VgIHRlbXBsYXRlXG4gKiBiaW5kaW5nIGFzIHNob3duLiBOb3RlIHRoYXQgdGhlIGBlbHNlYCBiaW5kaW5nIHBvaW50cyB0byBhIGA8bmctdGVtcGxhdGU+YCBsYWJlbGVkIGAjZWxzZUJsb2NrYC5cbiAqIFRoZSB0ZW1wbGF0ZSBjYW4gYmUgZGVmaW5lZCBhbnl3aGVyZSBpbiB0aGUgY29tcG9uZW50IHZpZXcgYnV0IGlzIHR5cGljYWxseSBwbGFjZWQgcmlnaHQgYWZ0ZXJcbiAqIGBuZ0lmYCBmb3IgcmVhZGFiaWxpdHkuXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9uZ0lmL3RzL21vZHVsZS50cyByZWdpb249J05nSWZFbHNlJ31cbiAqXG4gKiAjIyBVc2luZyBub24taW5saW5lZCBgdGhlbmAgdGVtcGxhdGVcbiAqXG4gKiBVc3VhbGx5IHRoZSBgdGhlbmAgdGVtcGxhdGUgaXMgdGhlIGlubGluZWQgdGVtcGxhdGUgb2YgdGhlIGBuZ0lmYCwgYnV0IGl0IGNhbiBiZSBjaGFuZ2VkIHVzaW5nXG4gKiBhIGJpbmRpbmcgKGp1c3QgbGlrZSBgZWxzZWApLiBCZWNhdXNlIGB0aGVuYCBhbmQgYGVsc2VgIGFyZSBiaW5kaW5ncywgdGhlIHRlbXBsYXRlIHJlZmVyZW5jZXMgY2FuXG4gKiBjaGFuZ2UgYXQgcnVudGltZSBhcyBzaG93biBpbiB0aGlzIGV4YW1wbGUuXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9uZ0lmL3RzL21vZHVsZS50cyByZWdpb249J05nSWZUaGVuRWxzZSd9XG4gKlxuICogIyMgU3RvcmluZyBjb25kaXRpb25hbCByZXN1bHQgaW4gYSB2YXJpYWJsZVxuICpcbiAqIEEgY29tbW9uIHBhdHRlcm4gaXMgdGhhdCB3ZSBuZWVkIHRvIHNob3cgYSBzZXQgb2YgcHJvcGVydGllcyBmcm9tIHRoZSBzYW1lIG9iamVjdC4gSWYgdGhlXG4gKiBvYmplY3QgaXMgdW5kZWZpbmVkLCB0aGVuIHdlIGhhdmUgdG8gdXNlIHRoZSBzYWZlLXRyYXZlcnNhbC1vcGVyYXRvciBgPy5gIHRvIGd1YXJkIGFnYWluc3RcbiAqIGRlcmVmZXJlbmNpbmcgYSBgbnVsbGAgdmFsdWUuIFRoaXMgaXMgZXNwZWNpYWxseSB0aGUgY2FzZSB3aGVuIHdhaXRpbmcgb24gYXN5bmMgZGF0YSBzdWNoIGFzXG4gKiB3aGVuIHVzaW5nIHRoZSBgYXN5bmNgIHBpcGUgYXMgc2hvd24gaW4gZm9sbG93aW5nIGV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiBIZWxsbyB7eyAodXNlclN0cmVhbXxhc3luYyk/Lmxhc3QgfX0sIHt7ICh1c2VyU3RyZWFtfGFzeW5jKT8uZmlyc3QgfX0hXG4gKiBgYGBcbiAqXG4gKiBUaGVyZSBhcmUgc2V2ZXJhbCBpbmVmZmljaWVuY2llcyBpbiB0aGUgYWJvdmUgZXhhbXBsZTpcbiAqICAtIFdlIGNyZWF0ZSBtdWx0aXBsZSBzdWJzY3JpcHRpb25zIG9uIGB1c2VyU3RyZWFtYC4gT25lIGZvciBlYWNoIGBhc3luY2AgcGlwZSwgb3IgdHdvIGluIHRoZVxuICogICAgZXhhbXBsZSBhYm92ZS5cbiAqICAtIFdlIGNhbm5vdCBkaXNwbGF5IGFuIGFsdGVybmF0aXZlIHNjcmVlbiB3aGlsZSB3YWl0aW5nIGZvciB0aGUgZGF0YSB0byBhcnJpdmUgYXN5bmNocm9ub3VzbHkuXG4gKiAgLSBXZSBoYXZlIHRvIHVzZSB0aGUgc2FmZS10cmF2ZXJzYWwtb3BlcmF0b3IgYD8uYCB0byBhY2Nlc3MgcHJvcGVydGllcywgd2hpY2ggaXMgY3VtYmVyc29tZS5cbiAqICAtIFdlIGhhdmUgdG8gcGxhY2UgdGhlIGBhc3luY2AgcGlwZSBpbiBwYXJlbnRoZXNpcy5cbiAqXG4gKiBBIGJldHRlciB3YXkgdG8gZG8gdGhpcyBpcyB0byB1c2UgYG5nSWZgIGFuZCBzdG9yZSB0aGUgcmVzdWx0IG9mIHRoZSBjb25kaXRpb24gaW4gYSBsb2NhbFxuICogdmFyaWFibGUgYXMgc2hvd24gaW4gdGhlIHRoZSBleGFtcGxlIGJlbG93OlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbmdJZi90cy9tb2R1bGUudHMgcmVnaW9uPSdOZ0lmQXMnfVxuICpcbiAqIE5vdGljZSB0aGF0OlxuICogIC0gV2UgdXNlIG9ubHkgb25lIGBhc3luY2AgcGlwZSBhbmQgaGVuY2Ugb25seSBvbmUgc3Vic2NyaXB0aW9uIGdldHMgY3JlYXRlZC5cbiAqICAtIGBuZ0lmYCBzdG9yZXMgdGhlIHJlc3VsdCBvZiB0aGUgYHVzZXJTdHJlYW18YXN5bmNgIGluIHRoZSBsb2NhbCB2YXJpYWJsZSBgdXNlcmAuXG4gKiAgLSBUaGUgbG9jYWwgYHVzZXJgIGNhbiB0aGVuIGJlIGJvdW5kIHJlcGVhdGVkbHkgaW4gYSBtb3JlIGVmZmljaWVudCB3YXkuXG4gKiAgLSBObyBuZWVkIHRvIHVzZSB0aGUgc2FmZS10cmF2ZXJzYWwtb3BlcmF0b3IgYD8uYCB0byBhY2Nlc3MgcHJvcGVydGllcyBhcyBgbmdJZmAgd2lsbCBvbmx5XG4gKiAgICBkaXNwbGF5IHRoZSBkYXRhIGlmIGB1c2VyU3RyZWFtYCByZXR1cm5zIGEgdmFsdWUuXG4gKiAgLSBXZSBjYW4gZGlzcGxheSBhbiBhbHRlcm5hdGl2ZSB0ZW1wbGF0ZSB3aGlsZSB3YWl0aW5nIGZvciB0aGUgZGF0YS5cbiAqXG4gKiAjIyMgU3ludGF4XG4gKlxuICogU2ltcGxlIGZvcm06XG4gKiAtIGA8ZGl2ICpuZ0lmPVwiY29uZGl0aW9uXCI+Li4uPC9kaXY+YFxuICogLSBgPG5nLXRlbXBsYXRlIFtuZ0lmXT1cImNvbmRpdGlvblwiPjxkaXY+Li4uPC9kaXY+PC9uZy10ZW1wbGF0ZT5gXG4gKlxuICogRm9ybSB3aXRoIGFuIGVsc2UgYmxvY2s6XG4gKiBgYGBcbiAqIDxkaXYgKm5nSWY9XCJjb25kaXRpb247IGVsc2UgZWxzZUJsb2NrXCI+Li4uPC9kaXY+XG4gKiA8bmctdGVtcGxhdGUgI2Vsc2VCbG9jaz4uLi48L25nLXRlbXBsYXRlPlxuICogYGBgXG4gKlxuICogRm9ybSB3aXRoIGEgYHRoZW5gIGFuZCBgZWxzZWAgYmxvY2s6XG4gKiBgYGBcbiAqIDxkaXYgKm5nSWY9XCJjb25kaXRpb247IHRoZW4gdGhlbkJsb2NrIGVsc2UgZWxzZUJsb2NrXCI+PC9kaXY+XG4gKiA8bmctdGVtcGxhdGUgI3RoZW5CbG9jaz4uLi48L25nLXRlbXBsYXRlPlxuICogPG5nLXRlbXBsYXRlICNlbHNlQmxvY2s+Li4uPC9uZy10ZW1wbGF0ZT5cbiAqIGBgYFxuICpcbiAqIEZvcm0gd2l0aCBzdG9yaW5nIHRoZSB2YWx1ZSBsb2NhbGx5OlxuICogYGBgXG4gKiA8ZGl2ICpuZ0lmPVwiY29uZGl0aW9uIGFzIHZhbHVlOyBlbHNlIGVsc2VCbG9ja1wiPnt7dmFsdWV9fTwvZGl2PlxuICogPG5nLXRlbXBsYXRlICNlbHNlQmxvY2s+Li4uPC9uZy10ZW1wbGF0ZT5cbiAqIGBgYFxuICpcbiAqXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nSWZdJ30pXG5leHBvcnQgY2xhc3MgTmdJZiB7XG4gIHByaXZhdGUgX2NvbnRleHQ6IE5nSWZDb250ZXh0ID0gbmV3IE5nSWZDb250ZXh0KCk7XG4gIHByaXZhdGUgX3RoZW5UZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8TmdJZkNvbnRleHQ+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9lbHNlVGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE5nSWZDb250ZXh0PnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfdGhlblZpZXdSZWY6IEVtYmVkZGVkVmlld1JlZjxOZ0lmQ29udGV4dD58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2Vsc2VWaWV3UmVmOiBFbWJlZGRlZFZpZXdSZWY8TmdJZkNvbnRleHQ+fG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxOZ0lmQ29udGV4dD4pIHtcbiAgICB0aGlzLl90aGVuVGVtcGxhdGVSZWYgPSB0ZW1wbGF0ZVJlZjtcbiAgfVxuXG4gIEBJbnB1dCgpXG4gIHNldCBuZ0lmKGNvbmRpdGlvbjogYW55KSB7XG4gICAgdGhpcy5fY29udGV4dC4kaW1wbGljaXQgPSB0aGlzLl9jb250ZXh0Lm5nSWYgPSBjb25kaXRpb247XG4gICAgdGhpcy5fdXBkYXRlVmlldygpO1xuICB9XG5cbiAgQElucHV0KClcbiAgc2V0IG5nSWZUaGVuKHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxOZ0lmQ29udGV4dD58bnVsbCkge1xuICAgIGFzc2VydFRlbXBsYXRlKCduZ0lmVGhlbicsIHRlbXBsYXRlUmVmKTtcbiAgICB0aGlzLl90aGVuVGVtcGxhdGVSZWYgPSB0ZW1wbGF0ZVJlZjtcbiAgICB0aGlzLl90aGVuVmlld1JlZiA9IG51bGw7ICAvLyBjbGVhciBwcmV2aW91cyB2aWV3IGlmIGFueS5cbiAgICB0aGlzLl91cGRhdGVWaWV3KCk7XG4gIH1cblxuICBASW5wdXQoKVxuICBzZXQgbmdJZkVsc2UodGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE5nSWZDb250ZXh0PnxudWxsKSB7XG4gICAgYXNzZXJ0VGVtcGxhdGUoJ25nSWZFbHNlJywgdGVtcGxhdGVSZWYpO1xuICAgIHRoaXMuX2Vsc2VUZW1wbGF0ZVJlZiA9IHRlbXBsYXRlUmVmO1xuICAgIHRoaXMuX2Vsc2VWaWV3UmVmID0gbnVsbDsgIC8vIGNsZWFyIHByZXZpb3VzIHZpZXcgaWYgYW55LlxuICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVZpZXcoKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRleHQuJGltcGxpY2l0KSB7XG4gICAgICBpZiAoIXRoaXMuX3RoZW5WaWV3UmVmKSB7XG4gICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5fZWxzZVZpZXdSZWYgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5fdGhlblRlbXBsYXRlUmVmKSB7XG4gICAgICAgICAgdGhpcy5fdGhlblZpZXdSZWYgPVxuICAgICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLl90aGVuVGVtcGxhdGVSZWYsIHRoaXMuX2NvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdGhpcy5fZWxzZVZpZXdSZWYpIHtcbiAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lci5jbGVhcigpO1xuICAgICAgICB0aGlzLl90aGVuVmlld1JlZiA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLl9lbHNlVGVtcGxhdGVSZWYpIHtcbiAgICAgICAgICB0aGlzLl9lbHNlVmlld1JlZiA9XG4gICAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIuY3JlYXRlRW1iZWRkZWRWaWV3KHRoaXMuX2Vsc2VUZW1wbGF0ZVJlZiwgdGhpcy5fY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBzdGF0aWMgbmdJZlVzZUlmVHlwZUd1YXJkOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgTmdJZkNvbnRleHQge1xuICBwdWJsaWMgJGltcGxpY2l0OiBhbnkgPSBudWxsO1xuICBwdWJsaWMgbmdJZjogYW55ID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0VGVtcGxhdGUocHJvcGVydHk6IHN0cmluZywgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPGFueT58IG51bGwpOiB2b2lkIHtcbiAgY29uc3QgaXNUZW1wbGF0ZVJlZk9yTnVsbCA9ICEhKCF0ZW1wbGF0ZVJlZiB8fCB0ZW1wbGF0ZVJlZi5jcmVhdGVFbWJlZGRlZFZpZXcpO1xuICBpZiAoIWlzVGVtcGxhdGVSZWZPck51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7cHJvcGVydHl9IG11c3QgYmUgYSBUZW1wbGF0ZVJlZiwgYnV0IHJlY2VpdmVkICcke3N0cmluZ2lmeSh0ZW1wbGF0ZVJlZil9Jy5gKTtcbiAgfVxufVxuIl19