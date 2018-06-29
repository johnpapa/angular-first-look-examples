/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { stringToArrayBuffer } from './http_utils';
import { URLSearchParams } from './url_search_params';
/**
 * HTTP request body used by both {@link Request} and {@link Response}
 * https://fetch.spec.whatwg.org/#body
 */
var Body = /** @class */ (function () {
    function Body() {
    }
    /**
     * Attempts to return body as parsed `JSON` object, or raises an exception.
     */
    Body.prototype.json = function () {
        if (typeof this._body === 'string') {
            return JSON.parse(this._body);
        }
        if (this._body instanceof ArrayBuffer) {
            return JSON.parse(this.text());
        }
        return this._body;
    };
    /**
     * Returns the body as a string, presuming `toString()` can be called on the response body.
     *
     * When decoding an `ArrayBuffer`, the optional `encodingHint` parameter determines how the
     * bytes in the buffer will be interpreted. Valid values are:
     *
     * - `legacy` - incorrectly interpret the bytes as UTF-16 (technically, UCS-2). Only characters
     *   in the Basic Multilingual Plane are supported, surrogate pairs are not handled correctly.
     *   In addition, the endianness of the 16-bit octet pairs in the `ArrayBuffer` is not taken
     *   into consideration. This is the default behavior to avoid breaking apps, but should be
     *   considered deprecated.
     *
     * - `iso-8859` - interpret the bytes as ISO-8859 (which can be used for ASCII encoded text).
     */
    Body.prototype.text = function (encodingHint) {
        if (encodingHint === void 0) { encodingHint = 'legacy'; }
        if (this._body instanceof URLSearchParams) {
            return this._body.toString();
        }
        if (this._body instanceof ArrayBuffer) {
            switch (encodingHint) {
                case 'legacy':
                    return String.fromCharCode.apply(null, new Uint16Array(this._body));
                case 'iso-8859':
                    return String.fromCharCode.apply(null, new Uint8Array(this._body));
                default:
                    throw new Error("Invalid value for encodingHint: " + encodingHint);
            }
        }
        if (this._body == null) {
            return '';
        }
        if (typeof this._body === 'object') {
            return JSON.stringify(this._body, null, 2);
        }
        return this._body.toString();
    };
    /**
     * Return the body as an ArrayBuffer
     */
    Body.prototype.arrayBuffer = function () {
        if (this._body instanceof ArrayBuffer) {
            return this._body;
        }
        return stringToArrayBuffer(this.text());
    };
    /**
      * Returns the request's body as a Blob, assuming that body exists.
      */
    Body.prototype.blob = function () {
        if (this._body instanceof Blob) {
            return this._body;
        }
        if (this._body instanceof ArrayBuffer) {
            return new Blob([this._body]);
        }
        throw new Error('The request body isn\'t either a blob or an array buffer');
    };
    return Body;
}());
export { Body };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9keS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2h0dHAvc3JjL2JvZHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ2pELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUdwRDs7O0dBR0c7QUFDSDtJQUFBO0lBdUZBLENBQUM7SUFqRkM7O09BRUc7SUFDSCxtQkFBSSxHQUFKO1FBQ0UsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxZQUFZLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7OztPQWFHO0lBQ0gsbUJBQUksR0FBSixVQUFLLFlBQTRDO1FBQTVDLDZCQUFBLEVBQUEsdUJBQTRDO1FBQy9DLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLFlBQVksZUFBZSxDQUFDLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMvQixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssWUFBWSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLEtBQUssUUFBUTtvQkFDWCxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFvQixDQUFDLENBQUMsQ0FBQztnQkFDckYsS0FBSyxVQUFVO29CQUNiLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQW9CLENBQUMsQ0FBQyxDQUFDO2dCQUNwRjtvQkFDRSxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFtQyxZQUFjLENBQUMsQ0FBQztZQUN2RSxDQUFDO1FBQ0gsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN2QixNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRUQ7O09BRUc7SUFDSCwwQkFBVyxHQUFYO1FBQ0UsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssWUFBWSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBYyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVEOztRQUVJO0lBQ0osbUJBQUksR0FBSjtRQUNFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUMxQixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssWUFBWSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUNILFdBQUM7QUFBRCxDQUFDLEFBdkZELElBdUZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3N0cmluZ1RvQXJyYXlCdWZmZXJ9IGZyb20gJy4vaHR0cF91dGlscyc7XG5pbXBvcnQge1VSTFNlYXJjaFBhcmFtc30gZnJvbSAnLi91cmxfc2VhcmNoX3BhcmFtcyc7XG5cblxuLyoqXG4gKiBIVFRQIHJlcXVlc3QgYm9keSB1c2VkIGJ5IGJvdGgge0BsaW5rIFJlcXVlc3R9IGFuZCB7QGxpbmsgUmVzcG9uc2V9XG4gKiBodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jYm9keVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQm9keSB7XG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHByb3RlY3RlZCBfYm9keTogYW55O1xuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byByZXR1cm4gYm9keSBhcyBwYXJzZWQgYEpTT05gIG9iamVjdCwgb3IgcmFpc2VzIGFuIGV4Y2VwdGlvbi5cbiAgICovXG4gIGpzb24oKTogYW55IHtcbiAgICBpZiAodHlwZW9mIHRoaXMuX2JvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZSg8c3RyaW5nPnRoaXMuX2JvZHkpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ib2R5IGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHRoaXMudGV4dCgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fYm9keTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBib2R5IGFzIGEgc3RyaW5nLCBwcmVzdW1pbmcgYHRvU3RyaW5nKClgIGNhbiBiZSBjYWxsZWQgb24gdGhlIHJlc3BvbnNlIGJvZHkuXG4gICAqXG4gICAqIFdoZW4gZGVjb2RpbmcgYW4gYEFycmF5QnVmZmVyYCwgdGhlIG9wdGlvbmFsIGBlbmNvZGluZ0hpbnRgIHBhcmFtZXRlciBkZXRlcm1pbmVzIGhvdyB0aGVcbiAgICogYnl0ZXMgaW4gdGhlIGJ1ZmZlciB3aWxsIGJlIGludGVycHJldGVkLiBWYWxpZCB2YWx1ZXMgYXJlOlxuICAgKlxuICAgKiAtIGBsZWdhY3lgIC0gaW5jb3JyZWN0bHkgaW50ZXJwcmV0IHRoZSBieXRlcyBhcyBVVEYtMTYgKHRlY2huaWNhbGx5LCBVQ1MtMikuIE9ubHkgY2hhcmFjdGVyc1xuICAgKiAgIGluIHRoZSBCYXNpYyBNdWx0aWxpbmd1YWwgUGxhbmUgYXJlIHN1cHBvcnRlZCwgc3Vycm9nYXRlIHBhaXJzIGFyZSBub3QgaGFuZGxlZCBjb3JyZWN0bHkuXG4gICAqICAgSW4gYWRkaXRpb24sIHRoZSBlbmRpYW5uZXNzIG9mIHRoZSAxNi1iaXQgb2N0ZXQgcGFpcnMgaW4gdGhlIGBBcnJheUJ1ZmZlcmAgaXMgbm90IHRha2VuXG4gICAqICAgaW50byBjb25zaWRlcmF0aW9uLiBUaGlzIGlzIHRoZSBkZWZhdWx0IGJlaGF2aW9yIHRvIGF2b2lkIGJyZWFraW5nIGFwcHMsIGJ1dCBzaG91bGQgYmVcbiAgICogICBjb25zaWRlcmVkIGRlcHJlY2F0ZWQuXG4gICAqXG4gICAqIC0gYGlzby04ODU5YCAtIGludGVycHJldCB0aGUgYnl0ZXMgYXMgSVNPLTg4NTkgKHdoaWNoIGNhbiBiZSB1c2VkIGZvciBBU0NJSSBlbmNvZGVkIHRleHQpLlxuICAgKi9cbiAgdGV4dChlbmNvZGluZ0hpbnQ6ICdsZWdhY3knfCdpc28tODg1OScgPSAnbGVnYWN5Jyk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuX2JvZHkgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXMpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ib2R5LnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2JvZHkgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgc3dpdGNoIChlbmNvZGluZ0hpbnQpIHtcbiAgICAgICAgY2FzZSAnbGVnYWN5JzpcbiAgICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBuZXcgVWludDE2QXJyYXkodGhpcy5fYm9keSBhcyBBcnJheUJ1ZmZlcikpO1xuICAgICAgICBjYXNlICdpc28tODg1OSc6XG4gICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgbmV3IFVpbnQ4QXJyYXkodGhpcy5fYm9keSBhcyBBcnJheUJ1ZmZlcikpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2YWx1ZSBmb3IgZW5jb2RpbmdIaW50OiAke2VuY29kaW5nSGludH1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fYm9keSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLl9ib2R5ID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMuX2JvZHksIG51bGwsIDIpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9ib2R5LnRvU3RyaW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBib2R5IGFzIGFuIEFycmF5QnVmZmVyXG4gICAqL1xuICBhcnJheUJ1ZmZlcigpOiBBcnJheUJ1ZmZlciB7XG4gICAgaWYgKHRoaXMuX2JvZHkgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgcmV0dXJuIDxBcnJheUJ1ZmZlcj50aGlzLl9ib2R5O1xuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmdUb0FycmF5QnVmZmVyKHRoaXMudGV4dCgpKTtcbiAgfVxuXG4gIC8qKlxuICAgICogUmV0dXJucyB0aGUgcmVxdWVzdCdzIGJvZHkgYXMgYSBCbG9iLCBhc3N1bWluZyB0aGF0IGJvZHkgZXhpc3RzLlxuICAgICovXG4gIGJsb2IoKTogQmxvYiB7XG4gICAgaWYgKHRoaXMuX2JvZHkgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgICByZXR1cm4gPEJsb2I+dGhpcy5fYm9keTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fYm9keSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICByZXR1cm4gbmV3IEJsb2IoW3RoaXMuX2JvZHldKTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSByZXF1ZXN0IGJvZHkgaXNuXFwndCBlaXRoZXIgYSBibG9iIG9yIGFuIGFycmF5IGJ1ZmZlcicpO1xuICB9XG59XG4iXX0=