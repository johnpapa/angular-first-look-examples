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
/**
 * @param {?=} rawParams
 * @return {?}
 */
function paramParser(rawParams = '') {
    const /** @type {?} */ map = new Map();
    if (rawParams.length > 0) {
        const /** @type {?} */ params = rawParams.split('&');
        params.forEach((param) => {
            const /** @type {?} */ eqIdx = param.indexOf('=');
            const [key, val] = eqIdx == -1 ? [param, ''] : [param.slice(0, eqIdx), param.slice(eqIdx + 1)];
            const /** @type {?} */ list = map.get(key) || [];
            list.push(val);
            map.set(key, list);
        });
    }
    return map;
}
/**
 * @deprecated see https://angular.io/guide/http
 *
 */
export class QueryEncoder {
    /**
     * @param {?} k
     * @return {?}
     */
    encodeKey(k) { return standardEncoding(k); }
    /**
     * @param {?} v
     * @return {?}
     */
    encodeValue(v) { return standardEncoding(v); }
}
/**
 * @param {?} v
 * @return {?}
 */
function standardEncoding(v) {
    return encodeURIComponent(v)
        .replace(/%40/gi, '@')
        .replace(/%3A/gi, ':')
        .replace(/%24/gi, '$')
        .replace(/%2C/gi, ',')
        .replace(/%3B/gi, ';')
        .replace(/%2B/gi, '+')
        .replace(/%3D/gi, '=')
        .replace(/%3F/gi, '?')
        .replace(/%2F/gi, '/');
}
/**
 * Map-like representation of url search parameters, based on
 * [URLSearchParams](https://url.spec.whatwg.org/#urlsearchparams) in the url living standard,
 * with several extensions for merging URLSearchParams objects:
 *   - setAll()
 *   - appendAll()
 *   - replaceAll()
 *
 * This class accepts an optional second parameter of ${\@link QueryEncoder},
 * which is used to serialize parameters before making a request. By default,
 * `QueryEncoder` encodes keys and values of parameters using `encodeURIComponent`,
 * and then un-encodes certain characters that are allowed to be part of the query
 * according to IETF RFC 3986: https://tools.ietf.org/html/rfc3986.
 *
 * These are the characters that are not encoded: `! $ \' ( ) * + , ; A 9 - . _ ~ ? /`
 *
 * If the set of allowed query characters is not acceptable for a particular backend,
 * `QueryEncoder` can be subclassed and provided as the 2nd argument to URLSearchParams.
 *
 * ```
 * import {URLSearchParams, QueryEncoder} from '\@angular/http';
 * class MyQueryEncoder extends QueryEncoder {
 *   encodeKey(k: string): string {
 *     return myEncodingFunction(k);
 *   }
 *
 *   encodeValue(v: string): string {
 *     return myEncodingFunction(v);
 *   }
 * }
 *
 * let params = new URLSearchParams('', new MyQueryEncoder());
 * ```
 * @deprecated see https://angular.io/guide/http
 */
export class URLSearchParams {
    /**
     * @param {?=} rawParams
     * @param {?=} queryEncoder
     */
    constructor(rawParams = '', queryEncoder = new QueryEncoder()) {
        this.rawParams = rawParams;
        this.queryEncoder = queryEncoder;
        this.paramsMap = paramParser(rawParams);
    }
    /**
     * @return {?}
     */
    clone() {
        const /** @type {?} */ clone = new URLSearchParams('', this.queryEncoder);
        clone.appendAll(this);
        return clone;
    }
    /**
     * @param {?} param
     * @return {?}
     */
    has(param) { return this.paramsMap.has(param); }
    /**
     * @param {?} param
     * @return {?}
     */
    get(param) {
        const /** @type {?} */ storedParam = this.paramsMap.get(param);
        return Array.isArray(storedParam) ? storedParam[0] : null;
    }
    /**
     * @param {?} param
     * @return {?}
     */
    getAll(param) { return this.paramsMap.get(param) || []; }
    /**
     * @param {?} param
     * @param {?} val
     * @return {?}
     */
    set(param, val) {
        if (val === void 0 || val === null) {
            this.delete(param);
            return;
        }
        const /** @type {?} */ list = this.paramsMap.get(param) || [];
        list.length = 0;
        list.push(val);
        this.paramsMap.set(param, list);
    }
    /**
     * @param {?} searchParams
     * @return {?}
     */
    setAll(searchParams) {
        searchParams.paramsMap.forEach((value, param) => {
            const /** @type {?} */ list = this.paramsMap.get(param) || [];
            list.length = 0;
            list.push(value[0]);
            this.paramsMap.set(param, list);
        });
    }
    /**
     * @param {?} param
     * @param {?} val
     * @return {?}
     */
    append(param, val) {
        if (val === void 0 || val === null)
            return;
        const /** @type {?} */ list = this.paramsMap.get(param) || [];
        list.push(val);
        this.paramsMap.set(param, list);
    }
    /**
     * @param {?} searchParams
     * @return {?}
     */
    appendAll(searchParams) {
        searchParams.paramsMap.forEach((value, param) => {
            const /** @type {?} */ list = this.paramsMap.get(param) || [];
            for (let /** @type {?} */ i = 0; i < value.length; ++i) {
                list.push(value[i]);
            }
            this.paramsMap.set(param, list);
        });
    }
    /**
     * @param {?} searchParams
     * @return {?}
     */
    replaceAll(searchParams) {
        searchParams.paramsMap.forEach((value, param) => {
            const /** @type {?} */ list = this.paramsMap.get(param) || [];
            list.length = 0;
            for (let /** @type {?} */ i = 0; i < value.length; ++i) {
                list.push(value[i]);
            }
            this.paramsMap.set(param, list);
        });
    }
    /**
     * @return {?}
     */
    toString() {
        const /** @type {?} */ paramsList = [];
        this.paramsMap.forEach((values, k) => {
            values.forEach(v => paramsList.push(this.queryEncoder.encodeKey(k) + '=' + this.queryEncoder.encodeValue(v)));
        });
        return paramsList.join('&');
    }
    /**
     * @param {?} param
     * @return {?}
     */
    delete(param) { this.paramsMap.delete(param); }
}
function URLSearchParams_tsickle_Closure_declarations() {
    /** @type {?} */
    URLSearchParams.prototype.paramsMap;
    /** @type {?} */
    URLSearchParams.prototype.rawParams;
    /** @type {?} */
    URLSearchParams.prototype.queryEncoder;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsX3NlYXJjaF9wYXJhbXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9odHRwL3NyYy91cmxfc2VhcmNoX3BhcmFtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFRQSxxQkFBcUIsWUFBb0IsRUFBRTtJQUN6Qyx1QkFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7SUFDeEMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLHVCQUFNLE1BQU0sR0FBYSxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFhLEVBQUUsRUFBRTtZQUMvQix1QkFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUNaLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRix1QkFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNmLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3BCLENBQUMsQ0FBQztLQUNKO0lBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQztDQUNaOzs7OztBQUlELE1BQU07Ozs7O0lB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QUFDLENBQUMsRUFBRTtDQUMvRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1QYXJzZXIocmF3UGFyYW1zOiBzdHJpbmcgPSAnJyk6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPiB7XG4gIGNvbnN0IG1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgaWYgKHJhd1BhcmFtcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgcGFyYW1zOiBzdHJpbmdbXSA9IHJhd1BhcmFtcy5zcGxpdCgnJicpO1xuICAgIHBhcmFtcy5mb3JFYWNoKChwYXJhbTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBlcUlkeCA9IHBhcmFtLmluZGV4T2YoJz0nKTtcbiAgICAgIGNvbnN0IFtrZXksIHZhbF06IHN0cmluZ1tdID1cbiAgICAgICAgICBlcUlkeCA9PSAtMSA/IFtwYXJhbSwgJyddIDogW3BhcmFtLnNsaWNlKDAsIGVxSWR4KSwgcGFyYW0uc2xpY2UoZXFJZHggKyAxKV07XG4gICAgICBjb25zdCBsaXN0ID0gbWFwLmdldChrZXkpIHx8IFtdO1xuICAgICAgbGlzdC5wdXNoKHZhbCk7XG4gICAgICBtYXAuc2V0KGtleSwgbGlzdCk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG1hcDtcbn1cbi8qKlxuICogQGRlcHJlY2F0ZWQgc2VlIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9odHRwXG4gKiovXG5leHBvcnQgY2xhc3MgUXVlcnlFbmNvZGVyIHtcbiAgZW5jb2RlS2V5KGs6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBzdGFuZGFyZEVuY29kaW5nKGspOyB9XG5cbiAgZW5jb2RlVmFsdWUodjogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIHN0YW5kYXJkRW5jb2Rpbmcodik7IH1cbn1cblxuZnVuY3Rpb24gc3RhbmRhcmRFbmNvZGluZyh2OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHYpXG4gICAgICAucmVwbGFjZSgvJTQwL2dpLCAnQCcpXG4gICAgICAucmVwbGFjZSgvJTNBL2dpLCAnOicpXG4gICAgICAucmVwbGFjZSgvJTI0L2dpLCAnJCcpXG4gICAgICAucmVwbGFjZSgvJTJDL2dpLCAnLCcpXG4gICAgICAucmVwbGFjZSgvJTNCL2dpLCAnOycpXG4gICAgICAucmVwbGFjZSgvJTJCL2dpLCAnKycpXG4gICAgICAucmVwbGFjZSgvJTNEL2dpLCAnPScpXG4gICAgICAucmVwbGFjZSgvJTNGL2dpLCAnPycpXG4gICAgICAucmVwbGFjZSgvJTJGL2dpLCAnLycpO1xufVxuXG4vKipcbiAqIE1hcC1saWtlIHJlcHJlc2VudGF0aW9uIG9mIHVybCBzZWFyY2ggcGFyYW1ldGVycywgYmFzZWQgb25cbiAqIFtVUkxTZWFyY2hQYXJhbXNdKGh0dHBzOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsc2VhcmNocGFyYW1zKSBpbiB0aGUgdXJsIGxpdmluZyBzdGFuZGFyZCxcbiAqIHdpdGggc2V2ZXJhbCBleHRlbnNpb25zIGZvciBtZXJnaW5nIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RzOlxuICogICAtIHNldEFsbCgpXG4gKiAgIC0gYXBwZW5kQWxsKClcbiAqICAgLSByZXBsYWNlQWxsKClcbiAqXG4gKiBUaGlzIGNsYXNzIGFjY2VwdHMgYW4gb3B0aW9uYWwgc2Vjb25kIHBhcmFtZXRlciBvZiAke0BsaW5rIFF1ZXJ5RW5jb2Rlcn0sXG4gKiB3aGljaCBpcyB1c2VkIHRvIHNlcmlhbGl6ZSBwYXJhbWV0ZXJzIGJlZm9yZSBtYWtpbmcgYSByZXF1ZXN0LiBCeSBkZWZhdWx0LFxuICogYFF1ZXJ5RW5jb2RlcmAgZW5jb2RlcyBrZXlzIGFuZCB2YWx1ZXMgb2YgcGFyYW1ldGVycyB1c2luZyBgZW5jb2RlVVJJQ29tcG9uZW50YCxcbiAqIGFuZCB0aGVuIHVuLWVuY29kZXMgY2VydGFpbiBjaGFyYWN0ZXJzIHRoYXQgYXJlIGFsbG93ZWQgdG8gYmUgcGFydCBvZiB0aGUgcXVlcnlcbiAqIGFjY29yZGluZyB0byBJRVRGIFJGQyAzOTg2OiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4Ni5cbiAqXG4gKiBUaGVzZSBhcmUgdGhlIGNoYXJhY3RlcnMgdGhhdCBhcmUgbm90IGVuY29kZWQ6IGAhICQgXFwnICggKSAqICsgLCA7IEEgOSAtIC4gXyB+ID8gL2BcbiAqXG4gKiBJZiB0aGUgc2V0IG9mIGFsbG93ZWQgcXVlcnkgY2hhcmFjdGVycyBpcyBub3QgYWNjZXB0YWJsZSBmb3IgYSBwYXJ0aWN1bGFyIGJhY2tlbmQsXG4gKiBgUXVlcnlFbmNvZGVyYCBjYW4gYmUgc3ViY2xhc3NlZCBhbmQgcHJvdmlkZWQgYXMgdGhlIDJuZCBhcmd1bWVudCB0byBVUkxTZWFyY2hQYXJhbXMuXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge1VSTFNlYXJjaFBhcmFtcywgUXVlcnlFbmNvZGVyfSBmcm9tICdAYW5ndWxhci9odHRwJztcbiAqIGNsYXNzIE15UXVlcnlFbmNvZGVyIGV4dGVuZHMgUXVlcnlFbmNvZGVyIHtcbiAqICAgZW5jb2RlS2V5KGs6IHN0cmluZyk6IHN0cmluZyB7XG4gKiAgICAgcmV0dXJuIG15RW5jb2RpbmdGdW5jdGlvbihrKTtcbiAqICAgfVxuICpcbiAqICAgZW5jb2RlVmFsdWUodjogc3RyaW5nKTogc3RyaW5nIHtcbiAqICAgICByZXR1cm4gbXlFbmNvZGluZ0Z1bmN0aW9uKHYpO1xuICogICB9XG4gKiB9XG4gKlxuICogbGV0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoJycsIG5ldyBNeVF1ZXJ5RW5jb2RlcigpKTtcbiAqIGBgYFxuICogQGRlcHJlY2F0ZWQgc2VlIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9odHRwXG4gKi9cbmV4cG9ydCBjbGFzcyBVUkxTZWFyY2hQYXJhbXMge1xuICBwYXJhbXNNYXA6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPjtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgcmF3UGFyYW1zOiBzdHJpbmcgPSAnJywgcHJpdmF0ZSBxdWVyeUVuY29kZXI6IFF1ZXJ5RW5jb2RlciA9IG5ldyBRdWVyeUVuY29kZXIoKSkge1xuICAgIHRoaXMucGFyYW1zTWFwID0gcGFyYW1QYXJzZXIocmF3UGFyYW1zKTtcbiAgfVxuXG4gIGNsb25lKCk6IFVSTFNlYXJjaFBhcmFtcyB7XG4gICAgY29uc3QgY2xvbmUgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCcnLCB0aGlzLnF1ZXJ5RW5jb2Rlcik7XG4gICAgY2xvbmUuYXBwZW5kQWxsKHRoaXMpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIGhhcyhwYXJhbTogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnBhcmFtc01hcC5oYXMocGFyYW0pOyB9XG5cbiAgZ2V0KHBhcmFtOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgY29uc3Qgc3RvcmVkUGFyYW0gPSB0aGlzLnBhcmFtc01hcC5nZXQocGFyYW0pO1xuXG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoc3RvcmVkUGFyYW0pID8gc3RvcmVkUGFyYW1bMF0gOiBudWxsO1xuICB9XG5cbiAgZ2V0QWxsKHBhcmFtOiBzdHJpbmcpOiBzdHJpbmdbXSB7IHJldHVybiB0aGlzLnBhcmFtc01hcC5nZXQocGFyYW0pIHx8IFtdOyB9XG5cbiAgc2V0KHBhcmFtOiBzdHJpbmcsIHZhbDogc3RyaW5nKSB7XG4gICAgaWYgKHZhbCA9PT0gdm9pZCAwIHx8IHZhbCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5kZWxldGUocGFyYW0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBsaXN0ID0gdGhpcy5wYXJhbXNNYXAuZ2V0KHBhcmFtKSB8fCBbXTtcbiAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgbGlzdC5wdXNoKHZhbCk7XG4gICAgdGhpcy5wYXJhbXNNYXAuc2V0KHBhcmFtLCBsaXN0KTtcbiAgfVxuXG4gIC8vIEEgbWVyZ2Ugb3BlcmF0aW9uXG4gIC8vIEZvciBlYWNoIG5hbWUtdmFsdWVzIHBhaXIgaW4gYHNlYXJjaFBhcmFtc2AsIHBlcmZvcm0gYHNldChuYW1lLCB2YWx1ZXNbMF0pYFxuICAvL1xuICAvLyBFLmc6IFwiYT1bMSwyLDNdLCBjPVs4XVwiICsgXCJhPVs0LDUsNl0sIGI9WzddXCIgPSBcImE9WzRdLCBjPVs4XSwgYj1bN11cIlxuICAvL1xuICAvLyBUT0RPKEBjYWl0cCk6IGRvY3VtZW50IHRoaXMgYmV0dGVyXG4gIHNldEFsbChzZWFyY2hQYXJhbXM6IFVSTFNlYXJjaFBhcmFtcykge1xuICAgIHNlYXJjaFBhcmFtcy5wYXJhbXNNYXAuZm9yRWFjaCgodmFsdWUsIHBhcmFtKSA9PiB7XG4gICAgICBjb25zdCBsaXN0ID0gdGhpcy5wYXJhbXNNYXAuZ2V0KHBhcmFtKSB8fCBbXTtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGxpc3QucHVzaCh2YWx1ZVswXSk7XG4gICAgICB0aGlzLnBhcmFtc01hcC5zZXQocGFyYW0sIGxpc3QpO1xuICAgIH0pO1xuICB9XG5cbiAgYXBwZW5kKHBhcmFtOiBzdHJpbmcsIHZhbDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHZhbCA9PT0gdm9pZCAwIHx8IHZhbCA9PT0gbnVsbCkgcmV0dXJuO1xuICAgIGNvbnN0IGxpc3QgPSB0aGlzLnBhcmFtc01hcC5nZXQocGFyYW0pIHx8IFtdO1xuICAgIGxpc3QucHVzaCh2YWwpO1xuICAgIHRoaXMucGFyYW1zTWFwLnNldChwYXJhbSwgbGlzdCk7XG4gIH1cblxuICAvLyBBIG1lcmdlIG9wZXJhdGlvblxuICAvLyBGb3IgZWFjaCBuYW1lLXZhbHVlcyBwYWlyIGluIGBzZWFyY2hQYXJhbXNgLCBwZXJmb3JtIGBhcHBlbmQobmFtZSwgdmFsdWUpYFxuICAvLyBmb3IgZWFjaCB2YWx1ZSBpbiBgdmFsdWVzYC5cbiAgLy9cbiAgLy8gRS5nOiBcImE9WzEsMl0sIGM9WzhdXCIgKyBcImE9WzMsNF0sIGI9WzddXCIgPSBcImE9WzEsMiwzLDRdLCBjPVs4XSwgYj1bN11cIlxuICAvL1xuICAvLyBUT0RPKEBjYWl0cCk6IGRvY3VtZW50IHRoaXMgYmV0dGVyXG4gIGFwcGVuZEFsbChzZWFyY2hQYXJhbXM6IFVSTFNlYXJjaFBhcmFtcykge1xuICAgIHNlYXJjaFBhcmFtcy5wYXJhbXNNYXAuZm9yRWFjaCgodmFsdWUsIHBhcmFtKSA9PiB7XG4gICAgICBjb25zdCBsaXN0ID0gdGhpcy5wYXJhbXNNYXAuZ2V0KHBhcmFtKSB8fCBbXTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgbGlzdC5wdXNoKHZhbHVlW2ldKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFyYW1zTWFwLnNldChwYXJhbSwgbGlzdCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8vIEEgbWVyZ2Ugb3BlcmF0aW9uXG4gIC8vIEZvciBlYWNoIG5hbWUtdmFsdWVzIHBhaXIgaW4gYHNlYXJjaFBhcmFtc2AsIHBlcmZvcm0gYGRlbGV0ZShuYW1lKWAsXG4gIC8vIGZvbGxvd2VkIGJ5IGBzZXQobmFtZSwgdmFsdWVzKWBcbiAgLy9cbiAgLy8gRS5nOiBcImE9WzEsMiwzXSwgYz1bOF1cIiArIFwiYT1bNCw1LDZdLCBiPVs3XVwiID0gXCJhPVs0LDUsNl0sIGM9WzhdLCBiPVs3XVwiXG4gIC8vXG4gIC8vIFRPRE8oQGNhaXRwKTogZG9jdW1lbnQgdGhpcyBiZXR0ZXJcbiAgcmVwbGFjZUFsbChzZWFyY2hQYXJhbXM6IFVSTFNlYXJjaFBhcmFtcykge1xuICAgIHNlYXJjaFBhcmFtcy5wYXJhbXNNYXAuZm9yRWFjaCgodmFsdWUsIHBhcmFtKSA9PiB7XG4gICAgICBjb25zdCBsaXN0ID0gdGhpcy5wYXJhbXNNYXAuZ2V0KHBhcmFtKSB8fCBbXTtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgbGlzdC5wdXNoKHZhbHVlW2ldKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFyYW1zTWFwLnNldChwYXJhbSwgbGlzdCk7XG4gICAgfSk7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhcmFtc0xpc3Q6IHN0cmluZ1tdID0gW107XG4gICAgdGhpcy5wYXJhbXNNYXAuZm9yRWFjaCgodmFsdWVzLCBrKSA9PiB7XG4gICAgICB2YWx1ZXMuZm9yRWFjaChcbiAgICAgICAgICB2ID0+IHBhcmFtc0xpc3QucHVzaChcbiAgICAgICAgICAgICAgdGhpcy5xdWVyeUVuY29kZXIuZW5jb2RlS2V5KGspICsgJz0nICsgdGhpcy5xdWVyeUVuY29kZXIuZW5jb2RlVmFsdWUodikpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcGFyYW1zTGlzdC5qb2luKCcmJyk7XG4gIH1cblxuICBkZWxldGUgKHBhcmFtOiBzdHJpbmcpOiB2b2lkIHsgdGhpcy5wYXJhbXNNYXAuZGVsZXRlKHBhcmFtKTsgfVxufVxuIl19