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
import { Inject, Injectable, SecurityContext, ɵ_sanitizeHtml as _sanitizeHtml, ɵ_sanitizeStyle as _sanitizeStyle, ɵ_sanitizeUrl as _sanitizeUrl } from '@angular/core';
import { DOCUMENT } from '../dom/dom_tokens';
export { SecurityContext };
/**
 * Marker interface for a value that's safe to use in a particular context.
 *
 *
 * @record
 */
export function SafeValue() { }
function SafeValue_tsickle_Closure_declarations() {
}
/**
 * Marker interface for a value that's safe to use as HTML.
 *
 *
 * @record
 */
export function SafeHtml() { }
function SafeHtml_tsickle_Closure_declarations() {
}
/**
 * Marker interface for a value that's safe to use as style (CSS).
 *
 *
 * @record
 */
export function SafeStyle() { }
function SafeStyle_tsickle_Closure_declarations() {
}
/**
 * Marker interface for a value that's safe to use as JavaScript.
 *
 *
 * @record
 */
export function SafeScript() { }
function SafeScript_tsickle_Closure_declarations() {
}
/**
 * Marker interface for a value that's safe to use as a URL linking to a document.
 *
 *
 * @record
 */
export function SafeUrl() { }
function SafeUrl_tsickle_Closure_declarations() {
}
/**
 * Marker interface for a value that's safe to use as a URL to load executable code from.
 *
 *
 * @record
 */
export function SafeResourceUrl() { }
function SafeResourceUrl_tsickle_Closure_declarations() {
}
/**
 * DomSanitizer helps preventing Cross Site Scripting Security bugs (XSS) by sanitizing
 * values to be safe to use in the different DOM contexts.
 *
 * For example, when binding a URL in an `<a [href]="someValue">` hyperlink, `someValue` will be
 * sanitized so that an attacker cannot inject e.g. a `javascript:` URL that would execute code on
 * the website.
 *
 * In specific situations, it might be necessary to disable sanitization, for example if the
 * application genuinely needs to produce a `javascript:` style link with a dynamic value in it.
 * Users can bypass security by constructing a value with one of the `bypassSecurityTrust...`
 * methods, and then binding to that value from the template.
 *
 * These situations should be very rare, and extraordinary care must be taken to avoid creating a
 * Cross Site Scripting (XSS) security bug!
 *
 * When using `bypassSecurityTrust...`, make sure to call the method as early as possible and as
 * close as possible to the source of the value, to make it easy to verify no security bug is
 * created by its use.
 *
 * It is not required (and not recommended) to bypass security if the value is safe, e.g. a URL that
 * does not start with a suspicious protocol, or an HTML snippet that does not contain dangerous
 * code. The sanitizer leaves safe values intact.
 *
 * \@security Calling any of the `bypassSecurityTrust...` APIs disables Angular's built-in
 * sanitization for the value passed in. Carefully check and audit all values and code paths going
 * into this call. Make sure any user data is appropriately escaped for this security context.
 * For more detail, see the [Security Guide](http://g.co/ng/security).
 *
 *
 * @abstract
 */
export class DomSanitizer {
}
function DomSanitizer_tsickle_Closure_declarations() {
    /**
     * Sanitizes a value for use in the given SecurityContext.
     *
     * If value is trusted for the context, this method will unwrap the contained safe value and use
     * it directly. Otherwise, value will be sanitized to be safe in the given context, for example
     * by replacing URLs that have an unsafe protocol part (such as `javascript:`). The implementation
     * is responsible to make sure that the value can definitely be safely used in the given context.
     * @abstract
     * @param {?} context
     * @param {?} value
     * @return {?}
     */
    DomSanitizer.prototype.sanitize = function (context, value) { };
    /**
     * Bypass security and trust the given value to be safe HTML. Only use this when the bound HTML
     * is unsafe (e.g. contains `<script>` tags) and the code should be executed. The sanitizer will
     * leave safe HTML intact, so in most situations this method should not be used.
     *
     * **WARNING:** calling this method with untrusted user data exposes your application to XSS
     * security risks!
     * @abstract
     * @param {?} value
     * @return {?}
     */
    DomSanitizer.prototype.bypassSecurityTrustHtml = function (value) { };
    /**
     * Bypass security and trust the given value to be safe style value (CSS).
     *
     * **WARNING:** calling this method with untrusted user data exposes your application to XSS
     * security risks!
     * @abstract
     * @param {?} value
     * @return {?}
     */
    DomSanitizer.prototype.bypassSecurityTrustStyle = function (value) { };
    /**
     * Bypass security and trust the given value to be safe JavaScript.
     *
     * **WARNING:** calling this method with untrusted user data exposes your application to XSS
     * security risks!
     * @abstract
     * @param {?} value
     * @return {?}
     */
    DomSanitizer.prototype.bypassSecurityTrustScript = function (value) { };
    /**
     * Bypass security and trust the given value to be a safe style URL, i.e. a value that can be used
     * in hyperlinks or `<img src>`.
     *
     * **WARNING:** calling this method with untrusted user data exposes your application to XSS
     * security risks!
     * @abstract
     * @param {?} value
     * @return {?}
     */
    DomSanitizer.prototype.bypassSecurityTrustUrl = function (value) { };
    /**
     * Bypass security and trust the given value to be a safe resource URL, i.e. a location that may
     * be used to load executable code from, like `<script src>`, or `<iframe src>`.
     *
     * **WARNING:** calling this method with untrusted user data exposes your application to XSS
     * security risks!
     * @abstract
     * @param {?} value
     * @return {?}
     */
    DomSanitizer.prototype.bypassSecurityTrustResourceUrl = function (value) { };
}
export class DomSanitizerImpl extends DomSanitizer {
    /**
     * @param {?} _doc
     */
    constructor(_doc) {
        super();
        this._doc = _doc;
    }
    /**
     * @param {?} ctx
     * @param {?} value
     * @return {?}
     */
    sanitize(ctx, value) {
        if (value == null)
            return null;
        switch (ctx) {
            case SecurityContext.NONE:
                return /** @type {?} */ (value);
            case SecurityContext.HTML:
                if (value instanceof SafeHtmlImpl)
                    return value.changingThisBreaksApplicationSecurity;
                this.checkNotSafeValue(value, 'HTML');
                return _sanitizeHtml(this._doc, String(value));
            case SecurityContext.STYLE:
                if (value instanceof SafeStyleImpl)
                    return value.changingThisBreaksApplicationSecurity;
                this.checkNotSafeValue(value, 'Style');
                return _sanitizeStyle(/** @type {?} */ (value));
            case SecurityContext.SCRIPT:
                if (value instanceof SafeScriptImpl)
                    return value.changingThisBreaksApplicationSecurity;
                this.checkNotSafeValue(value, 'Script');
                throw new Error('unsafe value used in a script context');
            case SecurityContext.URL:
                if (value instanceof SafeResourceUrlImpl || value instanceof SafeUrlImpl) {
                    // Allow resource URLs in URL contexts, they are strictly more trusted.
                    return value.changingThisBreaksApplicationSecurity;
                }
                this.checkNotSafeValue(value, 'URL');
                return _sanitizeUrl(String(value));
            case SecurityContext.RESOURCE_URL:
                if (value instanceof SafeResourceUrlImpl) {
                    return value.changingThisBreaksApplicationSecurity;
                }
                this.checkNotSafeValue(value, 'ResourceURL');
                throw new Error('unsafe value used in a resource URL context (see http://g.co/ng/security#xss)');
            default:
                throw new Error(`Unexpected SecurityContext ${ctx} (see http://g.co/ng/security#xss)`);
        }
    }
    /**
     * @param {?} value
     * @param {?} expectedType
     * @return {?}
     */
    checkNotSafeValue(value, expectedType) {
        if (value instanceof SafeValueImpl) {
            throw new Error(`Required a safe ${expectedType}, got a ${value.getTypeName()} ` +
                `(see http://g.co/ng/security#xss)`);
        }
    }
    /**
     * @param {?} value
     * @return {?}
     */
    bypassSecurityTrustHtml(value) { return new SafeHtmlImpl(value); }
    /**
     * @param {?} value
     * @return {?}
     */
    bypassSecurityTrustStyle(value) { return new SafeStyleImpl(value); }
    /**
     * @param {?} value
     * @return {?}
     */
    bypassSecurityTrustScript(value) { return new SafeScriptImpl(value); }
    /**
     * @param {?} value
     * @return {?}
     */
    bypassSecurityTrustUrl(value) { return new SafeUrlImpl(value); }
    /**
     * @param {?} value
     * @return {?}
     */
    bypassSecurityTrustResourceUrl(value) {
        return new SafeResourceUrlImpl(value);
    }
}
DomSanitizerImpl.decorators = [
    { type: Injectable }
];
/** @nocollapse */
DomSanitizerImpl.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
function DomSanitizerImpl_tsickle_Closure_declarations() {
    /** @type {?} */
    DomSanitizerImpl.prototype._doc;
}
/**
 * @abstract
 */
class SafeValueImpl {
    /**
     * @param {?} changingThisBreaksApplicationSecurity
     */
    constructor(changingThisBreaksApplicationSecurity) {
        // empty
        this.changingThisBreaksApplicationSecurity = changingThisBreaksApplicationSecurity;
    }
    /**
     * @return {?}
     */
    toString() {
        return `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity}` +
            ` (see http://g.co/ng/security#xss)`;
    }
}
function SafeValueImpl_tsickle_Closure_declarations() {
    /** @type {?} */
    SafeValueImpl.prototype.changingThisBreaksApplicationSecurity;
    /**
     * @abstract
     * @return {?}
     */
    SafeValueImpl.prototype.getTypeName = function () { };
}
class SafeHtmlImpl extends SafeValueImpl {
    /**
     * @return {?}
     */
    getTypeName() { return 'HTML'; }
}
class SafeStyleImpl extends SafeValueImpl {
    /**
     * @return {?}
     */
    getTypeName() { return 'Style'; }
}
class SafeScriptImpl extends SafeValueImpl {
    /**
     * @return {?}
     */
    getTypeName() { return 'Script'; }
}
class SafeUrlImpl extends SafeValueImpl {
    /**
     * @return {?}
     */
    getTypeName() { return 'URL'; }
}
class SafeResourceUrlImpl extends SafeValueImpl {
    /**
     * @return {?}
     */
    getTypeName() { return 'ResourceURL'; }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX3Nhbml0aXphdGlvbl9zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcGxhdGZvcm0tYnJvd3Nlci9zcmMvc2VjdXJpdHkvZG9tX3Nhbml0aXphdGlvbl9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQWEsZUFBZSxFQUFFLGNBQWMsSUFBSSxhQUFhLEVBQUUsZUFBZSxJQUFJLGNBQWMsRUFBRSxhQUFhLElBQUksWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRWhMLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQyxPQUFPLEVBQUMsZUFBZSxFQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZFekIsTUFBTTtDQXNETDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlELE1BQU0sdUJBQXdCLFNBQVEsWUFBWTs7OztJQUNoRCxZQUFzQyxJQUFTO1FBQUksS0FBSyxFQUFFLENBQUM7UUFBckIsU0FBSSxHQUFKLElBQUksQ0FBSztLQUFjOzs7Ozs7SUFFN0QsUUFBUSxDQUFDLEdBQW9CLEVBQUUsS0FBNEI7UUFDekQsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDL0IsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNaLEtBQUssZUFBZSxDQUFDLElBQUk7Z0JBQ3ZCLE1BQU0sbUJBQUMsS0FBZSxFQUFDO1lBQ3pCLEtBQUssZUFBZSxDQUFDLElBQUk7Z0JBQ3ZCLEVB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QW1CLHFDQUE2Qzs7UUFBN0MsMENBQXFDLEdBQXJDLHFDQUFxQyxDQUFRO0tBRS9EOzs7O0lBSUQsUUFBUTtRQUNOLE1BQU0sQ0FBQywwQ0FBMEMsSUFBSSxDQUFDLHFDQUFxQyxFQUFFO1lBQ3pGLG9DQUFvQyxDQUFDO0tBQzFDO0NBQ0Y7Ozs7Ozs7Ozs7QUFFRCxrQkFBbUIsU0FBUSxhQUFhOzs7O0lBQ3RDLFdBQVcsS0FBSyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7Q0FDakM7QUFDRCxtQkFBb0IsU0FBUSxhQUFhOzs7O0lBQ3ZDLFdBQVcsS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7Q0FDbEM7QUFDRCxvQkFBcUIsU0FBUSxhQUFhOzs7O0lBQ3hDLFdBQVcsS0FBSyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7Q0FDbkM7QUFDRCxpQkFBa0IsU0FBUSxhQUFhOzs7O0lBQ3JDLFdBQVcsS0FBSyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7Q0FDaEM7QUFDRCx5QkFBMEIsU0FBUSxhQUFhOzs7O0lBQzdDLFdBQVcsS0FBSyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUU7Q0FDeEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBTYW5pdGl6ZXIsIFNlY3VyaXR5Q29udGV4dCwgybVfc2FuaXRpemVIdG1sIGFzIF9zYW5pdGl6ZUh0bWwsIMm1X3Nhbml0aXplU3R5bGUgYXMgX3Nhbml0aXplU3R5bGUsIMm1X3Nhbml0aXplVXJsIGFzIF9zYW5pdGl6ZVVybH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJy4uL2RvbS9kb21fdG9rZW5zJztcblxuZXhwb3J0IHtTZWN1cml0eUNvbnRleHR9O1xuXG5cblxuLyoqXG4gKiBNYXJrZXIgaW50ZXJmYWNlIGZvciBhIHZhbHVlIHRoYXQncyBzYWZlIHRvIHVzZSBpbiBhIHBhcnRpY3VsYXIgY29udGV4dC5cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNhZmVWYWx1ZSB7fVxuXG4vKipcbiAqIE1hcmtlciBpbnRlcmZhY2UgZm9yIGEgdmFsdWUgdGhhdCdzIHNhZmUgdG8gdXNlIGFzIEhUTUwuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTYWZlSHRtbCBleHRlbmRzIFNhZmVWYWx1ZSB7fVxuXG4vKipcbiAqIE1hcmtlciBpbnRlcmZhY2UgZm9yIGEgdmFsdWUgdGhhdCdzIHNhZmUgdG8gdXNlIGFzIHN0eWxlIChDU1MpLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2FmZVN0eWxlIGV4dGVuZHMgU2FmZVZhbHVlIHt9XG5cbi8qKlxuICogTWFya2VyIGludGVyZmFjZSBmb3IgYSB2YWx1ZSB0aGF0J3Mgc2FmZSB0byB1c2UgYXMgSmF2YVNjcmlwdC5cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNhZmVTY3JpcHQgZXh0ZW5kcyBTYWZlVmFsdWUge31cblxuLyoqXG4gKiBNYXJrZXIgaW50ZXJmYWNlIGZvciBhIHZhbHVlIHRoYXQncyBzYWZlIHRvIHVzZSBhcyBhIFVSTCBsaW5raW5nIHRvIGEgZG9jdW1lbnQuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTYWZlVXJsIGV4dGVuZHMgU2FmZVZhbHVlIHt9XG5cbi8qKlxuICogTWFya2VyIGludGVyZmFjZSBmb3IgYSB2YWx1ZSB0aGF0J3Mgc2FmZSB0byB1c2UgYXMgYSBVUkwgdG8gbG9hZCBleGVjdXRhYmxlIGNvZGUgZnJvbS5cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNhZmVSZXNvdXJjZVVybCBleHRlbmRzIFNhZmVWYWx1ZSB7fVxuXG4vKipcbiAqIERvbVNhbml0aXplciBoZWxwcyBwcmV2ZW50aW5nIENyb3NzIFNpdGUgU2NyaXB0aW5nIFNlY3VyaXR5IGJ1Z3MgKFhTUykgYnkgc2FuaXRpemluZ1xuICogdmFsdWVzIHRvIGJlIHNhZmUgdG8gdXNlIGluIHRoZSBkaWZmZXJlbnQgRE9NIGNvbnRleHRzLlxuICpcbiAqIEZvciBleGFtcGxlLCB3aGVuIGJpbmRpbmcgYSBVUkwgaW4gYW4gYDxhIFtocmVmXT1cInNvbWVWYWx1ZVwiPmAgaHlwZXJsaW5rLCBgc29tZVZhbHVlYCB3aWxsIGJlXG4gKiBzYW5pdGl6ZWQgc28gdGhhdCBhbiBhdHRhY2tlciBjYW5ub3QgaW5qZWN0IGUuZy4gYSBgamF2YXNjcmlwdDpgIFVSTCB0aGF0IHdvdWxkIGV4ZWN1dGUgY29kZSBvblxuICogdGhlIHdlYnNpdGUuXG4gKlxuICogSW4gc3BlY2lmaWMgc2l0dWF0aW9ucywgaXQgbWlnaHQgYmUgbmVjZXNzYXJ5IHRvIGRpc2FibGUgc2FuaXRpemF0aW9uLCBmb3IgZXhhbXBsZSBpZiB0aGVcbiAqIGFwcGxpY2F0aW9uIGdlbnVpbmVseSBuZWVkcyB0byBwcm9kdWNlIGEgYGphdmFzY3JpcHQ6YCBzdHlsZSBsaW5rIHdpdGggYSBkeW5hbWljIHZhbHVlIGluIGl0LlxuICogVXNlcnMgY2FuIGJ5cGFzcyBzZWN1cml0eSBieSBjb25zdHJ1Y3RpbmcgYSB2YWx1ZSB3aXRoIG9uZSBvZiB0aGUgYGJ5cGFzc1NlY3VyaXR5VHJ1c3QuLi5gXG4gKiBtZXRob2RzLCBhbmQgdGhlbiBiaW5kaW5nIHRvIHRoYXQgdmFsdWUgZnJvbSB0aGUgdGVtcGxhdGUuXG4gKlxuICogVGhlc2Ugc2l0dWF0aW9ucyBzaG91bGQgYmUgdmVyeSByYXJlLCBhbmQgZXh0cmFvcmRpbmFyeSBjYXJlIG11c3QgYmUgdGFrZW4gdG8gYXZvaWQgY3JlYXRpbmcgYVxuICogQ3Jvc3MgU2l0ZSBTY3JpcHRpbmcgKFhTUykgc2VjdXJpdHkgYnVnIVxuICpcbiAqIFdoZW4gdXNpbmcgYGJ5cGFzc1NlY3VyaXR5VHJ1c3QuLi5gLCBtYWtlIHN1cmUgdG8gY2FsbCB0aGUgbWV0aG9kIGFzIGVhcmx5IGFzIHBvc3NpYmxlIGFuZCBhc1xuICogY2xvc2UgYXMgcG9zc2libGUgdG8gdGhlIHNvdXJjZSBvZiB0aGUgdmFsdWUsIHRvIG1ha2UgaXQgZWFzeSB0byB2ZXJpZnkgbm8gc2VjdXJpdHkgYnVnIGlzXG4gKiBjcmVhdGVkIGJ5IGl0cyB1c2UuXG4gKlxuICogSXQgaXMgbm90IHJlcXVpcmVkIChhbmQgbm90IHJlY29tbWVuZGVkKSB0byBieXBhc3Mgc2VjdXJpdHkgaWYgdGhlIHZhbHVlIGlzIHNhZmUsIGUuZy4gYSBVUkwgdGhhdFxuICogZG9lcyBub3Qgc3RhcnQgd2l0aCBhIHN1c3BpY2lvdXMgcHJvdG9jb2wsIG9yIGFuIEhUTUwgc25pcHBldCB0aGF0IGRvZXMgbm90IGNvbnRhaW4gZGFuZ2Vyb3VzXG4gKiBjb2RlLiBUaGUgc2FuaXRpemVyIGxlYXZlcyBzYWZlIHZhbHVlcyBpbnRhY3QuXG4gKlxuICogQHNlY3VyaXR5IENhbGxpbmcgYW55IG9mIHRoZSBgYnlwYXNzU2VjdXJpdHlUcnVzdC4uLmAgQVBJcyBkaXNhYmxlcyBBbmd1bGFyJ3MgYnVpbHQtaW5cbiAqIHNhbml0aXphdGlvbiBmb3IgdGhlIHZhbHVlIHBhc3NlZCBpbi4gQ2FyZWZ1bGx5IGNoZWNrIGFuZCBhdWRpdCBhbGwgdmFsdWVzIGFuZCBjb2RlIHBhdGhzIGdvaW5nXG4gKiBpbnRvIHRoaXMgY2FsbC4gTWFrZSBzdXJlIGFueSB1c2VyIGRhdGEgaXMgYXBwcm9wcmlhdGVseSBlc2NhcGVkIGZvciB0aGlzIHNlY3VyaXR5IGNvbnRleHQuXG4gKiBGb3IgbW9yZSBkZXRhaWwsIHNlZSB0aGUgW1NlY3VyaXR5IEd1aWRlXShodHRwOi8vZy5jby9uZy9zZWN1cml0eSkuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERvbVNhbml0aXplciBpbXBsZW1lbnRzIFNhbml0aXplciB7XG4gIC8qKlxuICAgKiBTYW5pdGl6ZXMgYSB2YWx1ZSBmb3IgdXNlIGluIHRoZSBnaXZlbiBTZWN1cml0eUNvbnRleHQuXG4gICAqXG4gICAqIElmIHZhbHVlIGlzIHRydXN0ZWQgZm9yIHRoZSBjb250ZXh0LCB0aGlzIG1ldGhvZCB3aWxsIHVud3JhcCB0aGUgY29udGFpbmVkIHNhZmUgdmFsdWUgYW5kIHVzZVxuICAgKiBpdCBkaXJlY3RseS4gT3RoZXJ3aXNlLCB2YWx1ZSB3aWxsIGJlIHNhbml0aXplZCB0byBiZSBzYWZlIGluIHRoZSBnaXZlbiBjb250ZXh0LCBmb3IgZXhhbXBsZVxuICAgKiBieSByZXBsYWNpbmcgVVJMcyB0aGF0IGhhdmUgYW4gdW5zYWZlIHByb3RvY29sIHBhcnQgKHN1Y2ggYXMgYGphdmFzY3JpcHQ6YCkuIFRoZSBpbXBsZW1lbnRhdGlvblxuICAgKiBpcyByZXNwb25zaWJsZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgY2FuIGRlZmluaXRlbHkgYmUgc2FmZWx5IHVzZWQgaW4gdGhlIGdpdmVuIGNvbnRleHQuXG4gICAqL1xuICBhYnN0cmFjdCBzYW5pdGl6ZShjb250ZXh0OiBTZWN1cml0eUNvbnRleHQsIHZhbHVlOiBTYWZlVmFsdWV8c3RyaW5nfG51bGwpOiBzdHJpbmd8bnVsbDtcblxuICAvKipcbiAgICogQnlwYXNzIHNlY3VyaXR5IGFuZCB0cnVzdCB0aGUgZ2l2ZW4gdmFsdWUgdG8gYmUgc2FmZSBIVE1MLiBPbmx5IHVzZSB0aGlzIHdoZW4gdGhlIGJvdW5kIEhUTUxcbiAgICogaXMgdW5zYWZlIChlLmcuIGNvbnRhaW5zIGA8c2NyaXB0PmAgdGFncykgYW5kIHRoZSBjb2RlIHNob3VsZCBiZSBleGVjdXRlZC4gVGhlIHNhbml0aXplciB3aWxsXG4gICAqIGxlYXZlIHNhZmUgSFRNTCBpbnRhY3QsIHNvIGluIG1vc3Qgc2l0dWF0aW9ucyB0aGlzIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4gICAqXG4gICAqICoqV0FSTklORzoqKiBjYWxsaW5nIHRoaXMgbWV0aG9kIHdpdGggdW50cnVzdGVkIHVzZXIgZGF0YSBleHBvc2VzIHlvdXIgYXBwbGljYXRpb24gdG8gWFNTXG4gICAqIHNlY3VyaXR5IHJpc2tzIVxuICAgKi9cbiAgYWJzdHJhY3QgYnlwYXNzU2VjdXJpdHlUcnVzdEh0bWwodmFsdWU6IHN0cmluZyk6IFNhZmVIdG1sO1xuXG4gIC8qKlxuICAgKiBCeXBhc3Mgc2VjdXJpdHkgYW5kIHRydXN0IHRoZSBnaXZlbiB2YWx1ZSB0byBiZSBzYWZlIHN0eWxlIHZhbHVlIChDU1MpLlxuICAgKlxuICAgKiAqKldBUk5JTkc6KiogY2FsbGluZyB0aGlzIG1ldGhvZCB3aXRoIHVudHJ1c3RlZCB1c2VyIGRhdGEgZXhwb3NlcyB5b3VyIGFwcGxpY2F0aW9uIHRvIFhTU1xuICAgKiBzZWN1cml0eSByaXNrcyFcbiAgICovXG4gIGFic3RyYWN0IGJ5cGFzc1NlY3VyaXR5VHJ1c3RTdHlsZSh2YWx1ZTogc3RyaW5nKTogU2FmZVN0eWxlO1xuXG4gIC8qKlxuICAgKiBCeXBhc3Mgc2VjdXJpdHkgYW5kIHRydXN0IHRoZSBnaXZlbiB2YWx1ZSB0byBiZSBzYWZlIEphdmFTY3JpcHQuXG4gICAqXG4gICAqICoqV0FSTklORzoqKiBjYWxsaW5nIHRoaXMgbWV0aG9kIHdpdGggdW50cnVzdGVkIHVzZXIgZGF0YSBleHBvc2VzIHlvdXIgYXBwbGljYXRpb24gdG8gWFNTXG4gICAqIHNlY3VyaXR5IHJpc2tzIVxuICAgKi9cbiAgYWJzdHJhY3QgYnlwYXNzU2VjdXJpdHlUcnVzdFNjcmlwdCh2YWx1ZTogc3RyaW5nKTogU2FmZVNjcmlwdDtcblxuICAvKipcbiAgICogQnlwYXNzIHNlY3VyaXR5IGFuZCB0cnVzdCB0aGUgZ2l2ZW4gdmFsdWUgdG8gYmUgYSBzYWZlIHN0eWxlIFVSTCwgaS5lLiBhIHZhbHVlIHRoYXQgY2FuIGJlIHVzZWRcbiAgICogaW4gaHlwZXJsaW5rcyBvciBgPGltZyBzcmM+YC5cbiAgICpcbiAgICogKipXQVJOSU5HOioqIGNhbGxpbmcgdGhpcyBtZXRob2Qgd2l0aCB1bnRydXN0ZWQgdXNlciBkYXRhIGV4cG9zZXMgeW91ciBhcHBsaWNhdGlvbiB0byBYU1NcbiAgICogc2VjdXJpdHkgcmlza3MhXG4gICAqL1xuICBhYnN0cmFjdCBieXBhc3NTZWN1cml0eVRydXN0VXJsKHZhbHVlOiBzdHJpbmcpOiBTYWZlVXJsO1xuXG4gIC8qKlxuICAgKiBCeXBhc3Mgc2VjdXJpdHkgYW5kIHRydXN0IHRoZSBnaXZlbiB2YWx1ZSB0byBiZSBhIHNhZmUgcmVzb3VyY2UgVVJMLCBpLmUuIGEgbG9jYXRpb24gdGhhdCBtYXlcbiAgICogYmUgdXNlZCB0byBsb2FkIGV4ZWN1dGFibGUgY29kZSBmcm9tLCBsaWtlIGA8c2NyaXB0IHNyYz5gLCBvciBgPGlmcmFtZSBzcmM+YC5cbiAgICpcbiAgICogKipXQVJOSU5HOioqIGNhbGxpbmcgdGhpcyBtZXRob2Qgd2l0aCB1bnRydXN0ZWQgdXNlciBkYXRhIGV4cG9zZXMgeW91ciBhcHBsaWNhdGlvbiB0byBYU1NcbiAgICogc2VjdXJpdHkgcmlza3MhXG4gICAqL1xuICBhYnN0cmFjdCBieXBhc3NTZWN1cml0eVRydXN0UmVzb3VyY2VVcmwodmFsdWU6IHN0cmluZyk6IFNhZmVSZXNvdXJjZVVybDtcbn1cblxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRG9tU2FuaXRpemVySW1wbCBleHRlbmRzIERvbVNhbml0aXplciB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgX2RvYzogYW55KSB7IHN1cGVyKCk7IH1cblxuICBzYW5pdGl6ZShjdHg6IFNlY3VyaXR5Q29udGV4dCwgdmFsdWU6IFNhZmVWYWx1ZXxzdHJpbmd8bnVsbCk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgc3dpdGNoIChjdHgpIHtcbiAgICAgIGNhc2UgU2VjdXJpdHlDb250ZXh0Lk5PTkU6XG4gICAgICAgIHJldHVybiB2YWx1ZSBhcyBzdHJpbmc7XG4gICAgICBjYXNlIFNlY3VyaXR5Q29udGV4dC5IVE1MOlxuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBTYWZlSHRtbEltcGwpIHJldHVybiB2YWx1ZS5jaGFuZ2luZ1RoaXNCcmVha3NBcHBsaWNhdGlvblNlY3VyaXR5O1xuICAgICAgICB0aGlzLmNoZWNrTm90U2FmZVZhbHVlKHZhbHVlLCAnSFRNTCcpO1xuICAgICAgICByZXR1cm4gX3Nhbml0aXplSHRtbCh0aGlzLl9kb2MsIFN0cmluZyh2YWx1ZSkpO1xuICAgICAgY2FzZSBTZWN1cml0eUNvbnRleHQuU1RZTEU6XG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFNhZmVTdHlsZUltcGwpIHJldHVybiB2YWx1ZS5jaGFuZ2luZ1RoaXNCcmVha3NBcHBsaWNhdGlvblNlY3VyaXR5O1xuICAgICAgICB0aGlzLmNoZWNrTm90U2FmZVZhbHVlKHZhbHVlLCAnU3R5bGUnKTtcbiAgICAgICAgcmV0dXJuIF9zYW5pdGl6ZVN0eWxlKHZhbHVlIGFzIHN0cmluZyk7XG4gICAgICBjYXNlIFNlY3VyaXR5Q29udGV4dC5TQ1JJUFQ6XG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFNhZmVTY3JpcHRJbXBsKSByZXR1cm4gdmFsdWUuY2hhbmdpbmdUaGlzQnJlYWtzQXBwbGljYXRpb25TZWN1cml0eTtcbiAgICAgICAgdGhpcy5jaGVja05vdFNhZmVWYWx1ZSh2YWx1ZSwgJ1NjcmlwdCcpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc2FmZSB2YWx1ZSB1c2VkIGluIGEgc2NyaXB0IGNvbnRleHQnKTtcbiAgICAgIGNhc2UgU2VjdXJpdHlDb250ZXh0LlVSTDpcbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgU2FmZVJlc291cmNlVXJsSW1wbCB8fCB2YWx1ZSBpbnN0YW5jZW9mIFNhZmVVcmxJbXBsKSB7XG4gICAgICAgICAgLy8gQWxsb3cgcmVzb3VyY2UgVVJMcyBpbiBVUkwgY29udGV4dHMsIHRoZXkgYXJlIHN0cmljdGx5IG1vcmUgdHJ1c3RlZC5cbiAgICAgICAgICByZXR1cm4gdmFsdWUuY2hhbmdpbmdUaGlzQnJlYWtzQXBwbGljYXRpb25TZWN1cml0eTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNoZWNrTm90U2FmZVZhbHVlKHZhbHVlLCAnVVJMJyk7XG4gICAgICAgIHJldHVybiBfc2FuaXRpemVVcmwoU3RyaW5nKHZhbHVlKSk7XG4gICAgICBjYXNlIFNlY3VyaXR5Q29udGV4dC5SRVNPVVJDRV9VUkw6XG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFNhZmVSZXNvdXJjZVVybEltcGwpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUuY2hhbmdpbmdUaGlzQnJlYWtzQXBwbGljYXRpb25TZWN1cml0eTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNoZWNrTm90U2FmZVZhbHVlKHZhbHVlLCAnUmVzb3VyY2VVUkwnKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ3Vuc2FmZSB2YWx1ZSB1c2VkIGluIGEgcmVzb3VyY2UgVVJMIGNvbnRleHQgKHNlZSBodHRwOi8vZy5jby9uZy9zZWN1cml0eSN4c3MpJyk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgU2VjdXJpdHlDb250ZXh0ICR7Y3R4fSAoc2VlIGh0dHA6Ly9nLmNvL25nL3NlY3VyaXR5I3hzcylgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNoZWNrTm90U2FmZVZhbHVlKHZhbHVlOiBhbnksIGV4cGVjdGVkVHlwZTogc3RyaW5nKSB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgU2FmZVZhbHVlSW1wbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBSZXF1aXJlZCBhIHNhZmUgJHtleHBlY3RlZFR5cGV9LCBnb3QgYSAke3ZhbHVlLmdldFR5cGVOYW1lKCl9IGAgK1xuICAgICAgICAgIGAoc2VlIGh0dHA6Ly9nLmNvL25nL3NlY3VyaXR5I3hzcylgKTtcbiAgICB9XG4gIH1cblxuICBieXBhc3NTZWN1cml0eVRydXN0SHRtbCh2YWx1ZTogc3RyaW5nKTogU2FmZUh0bWwgeyByZXR1cm4gbmV3IFNhZmVIdG1sSW1wbCh2YWx1ZSk7IH1cbiAgYnlwYXNzU2VjdXJpdHlUcnVzdFN0eWxlKHZhbHVlOiBzdHJpbmcpOiBTYWZlU3R5bGUgeyByZXR1cm4gbmV3IFNhZmVTdHlsZUltcGwodmFsdWUpOyB9XG4gIGJ5cGFzc1NlY3VyaXR5VHJ1c3RTY3JpcHQodmFsdWU6IHN0cmluZyk6IFNhZmVTY3JpcHQgeyByZXR1cm4gbmV3IFNhZmVTY3JpcHRJbXBsKHZhbHVlKTsgfVxuICBieXBhc3NTZWN1cml0eVRydXN0VXJsKHZhbHVlOiBzdHJpbmcpOiBTYWZlVXJsIHsgcmV0dXJuIG5ldyBTYWZlVXJsSW1wbCh2YWx1ZSk7IH1cbiAgYnlwYXNzU2VjdXJpdHlUcnVzdFJlc291cmNlVXJsKHZhbHVlOiBzdHJpbmcpOiBTYWZlUmVzb3VyY2VVcmwge1xuICAgIHJldHVybiBuZXcgU2FmZVJlc291cmNlVXJsSW1wbCh2YWx1ZSk7XG4gIH1cbn1cblxuYWJzdHJhY3QgY2xhc3MgU2FmZVZhbHVlSW1wbCBpbXBsZW1lbnRzIFNhZmVWYWx1ZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjaGFuZ2luZ1RoaXNCcmVha3NBcHBsaWNhdGlvblNlY3VyaXR5OiBzdHJpbmcpIHtcbiAgICAvLyBlbXB0eVxuICB9XG5cbiAgYWJzdHJhY3QgZ2V0VHlwZU5hbWUoKTogc3RyaW5nO1xuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBgU2FmZVZhbHVlIG11c3QgdXNlIFtwcm9wZXJ0eV09YmluZGluZzogJHt0aGlzLmNoYW5naW5nVGhpc0JyZWFrc0FwcGxpY2F0aW9uU2VjdXJpdHl9YCArXG4gICAgICAgIGAgKHNlZSBodHRwOi8vZy5jby9uZy9zZWN1cml0eSN4c3MpYDtcbiAgfVxufVxuXG5jbGFzcyBTYWZlSHRtbEltcGwgZXh0ZW5kcyBTYWZlVmFsdWVJbXBsIGltcGxlbWVudHMgU2FmZUh0bWwge1xuICBnZXRUeXBlTmFtZSgpIHsgcmV0dXJuICdIVE1MJzsgfVxufVxuY2xhc3MgU2FmZVN0eWxlSW1wbCBleHRlbmRzIFNhZmVWYWx1ZUltcGwgaW1wbGVtZW50cyBTYWZlU3R5bGUge1xuICBnZXRUeXBlTmFtZSgpIHsgcmV0dXJuICdTdHlsZSc7IH1cbn1cbmNsYXNzIFNhZmVTY3JpcHRJbXBsIGV4dGVuZHMgU2FmZVZhbHVlSW1wbCBpbXBsZW1lbnRzIFNhZmVTY3JpcHQge1xuICBnZXRUeXBlTmFtZSgpIHsgcmV0dXJuICdTY3JpcHQnOyB9XG59XG5jbGFzcyBTYWZlVXJsSW1wbCBleHRlbmRzIFNhZmVWYWx1ZUltcGwgaW1wbGVtZW50cyBTYWZlVXJsIHtcbiAgZ2V0VHlwZU5hbWUoKSB7IHJldHVybiAnVVJMJzsgfVxufVxuY2xhc3MgU2FmZVJlc291cmNlVXJsSW1wbCBleHRlbmRzIFNhZmVWYWx1ZUltcGwgaW1wbGVtZW50cyBTYWZlUmVzb3VyY2VVcmwge1xuICBnZXRUeXBlTmFtZSgpIHsgcmV0dXJuICdSZXNvdXJjZVVSTCc7IH1cbn1cbiJdfQ==