/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { ResponseType } from './enums';
import { Headers } from './headers';
/**
 * Creates a response options object to be optionally provided when instantiating a
 * {@link Response}.
 *
 * This class is based on the `ResponseInit` description in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#responseinit).
 *
 * All values are null by default. Typical defaults can be found in the
 * {@link BaseResponseOptions} class, which sub-classes `ResponseOptions`.
 *
 * This class may be used in tests to build {@link Response Responses} for
 * mock responses (see {@link MockBackend}).
 *
 * ### Example
 *
 * ```typescript
 * import {ResponseOptions, Response} from '@angular/http';
 *
 * var options = new ResponseOptions({
 *   body: '{"name":"Jeff"}'
 * });
 * var res = new Response(options);
 *
 * console.log('res.json():', res.json()); // Object {name: "Jeff"}
 * ```
 *
 * @deprecated see https://angular.io/guide/http
 */
var ResponseOptions = /** @class */ (function () {
    function ResponseOptions(opts) {
        if (opts === void 0) { opts = {}; }
        var body = opts.body, status = opts.status, headers = opts.headers, statusText = opts.statusText, type = opts.type, url = opts.url;
        this.body = body != null ? body : null;
        this.status = status != null ? status : null;
        this.headers = headers != null ? headers : null;
        this.statusText = statusText != null ? statusText : null;
        this.type = type != null ? type : null;
        this.url = url != null ? url : null;
    }
    /**
     * Creates a copy of the `ResponseOptions` instance, using the optional input as values to
     * override
     * existing values. This method will not change the values of the instance on which it is being
     * called.
     *
     * This may be useful when sharing a base `ResponseOptions` object inside tests,
     * where certain properties may change from test to test.
     *
     * ### Example
     *
     * ```typescript
     * import {ResponseOptions, Response} from '@angular/http';
     *
     * var options = new ResponseOptions({
     *   body: {name: 'Jeff'}
     * });
     * var res = new Response(options.merge({
     *   url: 'https://google.com'
     * }));
     * console.log('options.url:', options.url); // null
     * console.log('res.json():', res.json()); // Object {name: "Jeff"}
     * console.log('res.url:', res.url); // https://google.com
     * ```
     */
    ResponseOptions.prototype.merge = function (options) {
        return new ResponseOptions({
            body: options && options.body != null ? options.body : this.body,
            status: options && options.status != null ? options.status : this.status,
            headers: options && options.headers != null ? options.headers : this.headers,
            statusText: options && options.statusText != null ? options.statusText : this.statusText,
            type: options && options.type != null ? options.type : this.type,
            url: options && options.url != null ? options.url : this.url,
        });
    };
    return ResponseOptions;
}());
export { ResponseOptions };
/**
 * Subclass of {@link ResponseOptions}, with default values.
 *
 * Default values:
 *  * status: 200
 *  * headers: empty {@link Headers} object
 *
 * This class could be extended and bound to the {@link ResponseOptions} class
 * when configuring an {@link Injector}, in order to override the default options
 * used by {@link Http} to create {@link Response Responses}.
 *
 * ### Example
 *
 * ```typescript
 * import {provide} from '@angular/core';
 * import {bootstrap} from '@angular/platform-browser/browser';
 * import {HTTP_PROVIDERS, Headers, Http, BaseResponseOptions, ResponseOptions} from
 * '@angular/http';
 * import {App} from './myapp';
 *
 * class MyOptions extends BaseResponseOptions {
 *   headers:Headers = new Headers({network: 'github'});
 * }
 *
 * bootstrap(App, [HTTP_PROVIDERS, {provide: ResponseOptions, useClass: MyOptions}]);
 * ```
 *
 * The options could also be extended when manually creating a {@link Response}
 * object.
 *
 * ### Example
 *
 * ```
 * import {BaseResponseOptions, Response} from '@angular/http';
 *
 * var options = new BaseResponseOptions();
 * var res = new Response(options.merge({
 *   body: 'Angular',
 *   headers: new Headers({framework: 'angular'})
 * }));
 * console.log('res.headers.get("framework"):', res.headers.get('framework')); // angular
 * console.log('res.text():', res.text()); // Angular;
 * ```
 *
 * @deprecated see https://angular.io/guide/http
 */
var BaseResponseOptions = /** @class */ (function (_super) {
    tslib_1.__extends(BaseResponseOptions, _super);
    function BaseResponseOptions() {
        return _super.call(this, { status: 200, statusText: 'Ok', type: ResponseType.Default, headers: new Headers() }) || this;
    }
    BaseResponseOptions.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    BaseResponseOptions.ctorParameters = function () { return []; };
    return BaseResponseOptions;
}(ResponseOptions));
export { BaseResponseOptions };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZV9yZXNwb25zZV9vcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvaHR0cC9zcmMvYmFzZV9yZXNwb25zZV9vcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXpDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDckMsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUlsQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMkJHO0FBQ0g7SUF3QkUseUJBQVksSUFBOEI7UUFBOUIscUJBQUEsRUFBQSxTQUE4QjtRQUNqQyxJQUFBLGdCQUFJLEVBQUUsb0JBQU0sRUFBRSxzQkFBTyxFQUFFLDRCQUFVLEVBQUUsZ0JBQUksRUFBRSxjQUFHLENBQVM7UUFDNUQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN2QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzdDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDaEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN6RCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDdEMsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F3Qkc7SUFDSCwrQkFBSyxHQUFMLFVBQU0sT0FBNkI7UUFDakMsTUFBTSxDQUFDLElBQUksZUFBZSxDQUFDO1lBQ3pCLElBQUksRUFBRSxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJO1lBQ2hFLE1BQU0sRUFBRSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNO1lBQ3hFLE9BQU8sRUFBRSxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQzVFLFVBQVUsRUFBRSxPQUFPLElBQUksT0FBTyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVO1lBQ3hGLElBQUksRUFBRSxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJO1lBQ2hFLEdBQUcsRUFBRSxPQUFPLElBQUksT0FBTyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHO1NBQzdELENBQUMsQ0FBQztJQUNMLENBQUM7SUFDSCxzQkFBQztBQUFELENBQUMsQUFyRUQsSUFxRUM7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTZDRztBQUNIO0lBQ3lDLCtDQUFlO0lBQ3REO2VBQ0Usa0JBQU0sRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksT0FBTyxFQUFFLEVBQUMsQ0FBQztJQUM1RixDQUFDOztnQkFKRixVQUFVOzs7O0lBS1gsMEJBQUM7Q0FBQSxBQUxELENBQ3lDLGVBQWUsR0FJdkQ7U0FKWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UmVzcG9uc2VUeXBlfSBmcm9tICcuL2VudW1zJztcbmltcG9ydCB7SGVhZGVyc30gZnJvbSAnLi9oZWFkZXJzJztcbmltcG9ydCB7UmVzcG9uc2VPcHRpb25zQXJnc30gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuXG4vKipcbiAqIENyZWF0ZXMgYSByZXNwb25zZSBvcHRpb25zIG9iamVjdCB0byBiZSBvcHRpb25hbGx5IHByb3ZpZGVkIHdoZW4gaW5zdGFudGlhdGluZyBhXG4gKiB7QGxpbmsgUmVzcG9uc2V9LlxuICpcbiAqIFRoaXMgY2xhc3MgaXMgYmFzZWQgb24gdGhlIGBSZXNwb25zZUluaXRgIGRlc2NyaXB0aW9uIGluIHRoZSBbRmV0Y2hcbiAqIFNwZWNdKGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNyZXNwb25zZWluaXQpLlxuICpcbiAqIEFsbCB2YWx1ZXMgYXJlIG51bGwgYnkgZGVmYXVsdC4gVHlwaWNhbCBkZWZhdWx0cyBjYW4gYmUgZm91bmQgaW4gdGhlXG4gKiB7QGxpbmsgQmFzZVJlc3BvbnNlT3B0aW9uc30gY2xhc3MsIHdoaWNoIHN1Yi1jbGFzc2VzIGBSZXNwb25zZU9wdGlvbnNgLlxuICpcbiAqIFRoaXMgY2xhc3MgbWF5IGJlIHVzZWQgaW4gdGVzdHMgdG8gYnVpbGQge0BsaW5rIFJlc3BvbnNlIFJlc3BvbnNlc30gZm9yXG4gKiBtb2NrIHJlc3BvbnNlcyAoc2VlIHtAbGluayBNb2NrQmFja2VuZH0pLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtSZXNwb25zZU9wdGlvbnMsIFJlc3BvbnNlfSBmcm9tICdAYW5ndWxhci9odHRwJztcbiAqXG4gKiB2YXIgb3B0aW9ucyA9IG5ldyBSZXNwb25zZU9wdGlvbnMoe1xuICogICBib2R5OiAne1wibmFtZVwiOlwiSmVmZlwifSdcbiAqIH0pO1xuICogdmFyIHJlcyA9IG5ldyBSZXNwb25zZShvcHRpb25zKTtcbiAqXG4gKiBjb25zb2xlLmxvZygncmVzLmpzb24oKTonLCByZXMuanNvbigpKTsgLy8gT2JqZWN0IHtuYW1lOiBcIkplZmZcIn1cbiAqIGBgYFxuICpcbiAqIEBkZXByZWNhdGVkIHNlZSBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaHR0cFxuICovXG5leHBvcnQgY2xhc3MgUmVzcG9uc2VPcHRpb25zIHtcbiAgLy8gVE9ETzogRm9ybURhdGEgfCBCbG9iXG4gIC8qKlxuICAgKiBTdHJpbmcsIE9iamVjdCwgQXJyYXlCdWZmZXIgb3IgQmxvYiByZXByZXNlbnRpbmcgdGhlIGJvZHkgb2YgdGhlIHtAbGluayBSZXNwb25zZX0uXG4gICAqL1xuICBib2R5OiBzdHJpbmd8T2JqZWN0fEFycmF5QnVmZmVyfEJsb2J8bnVsbDtcbiAgLyoqXG4gICAqIEh0dHAge0BsaW5rIGh0dHA6Ly93d3cudzMub3JnL1Byb3RvY29scy9yZmMyNjE2L3JmYzI2MTYtc2VjMTAuaHRtbCBzdGF0dXMgY29kZX1cbiAgICogYXNzb2NpYXRlZCB3aXRoIHRoZSByZXNwb25zZS5cbiAgICovXG4gIHN0YXR1czogbnVtYmVyfG51bGw7XG4gIC8qKlxuICAgKiBSZXNwb25zZSB7QGxpbmsgSGVhZGVycyBoZWFkZXJzfVxuICAgKi9cbiAgaGVhZGVyczogSGVhZGVyc3xudWxsO1xuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBzdGF0dXNUZXh0OiBzdHJpbmd8bnVsbDtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgdHlwZTogUmVzcG9uc2VUeXBlfG51bGw7XG4gIHVybDogc3RyaW5nfG51bGw7XG4gIGNvbnN0cnVjdG9yKG9wdHM6IFJlc3BvbnNlT3B0aW9uc0FyZ3MgPSB7fSkge1xuICAgIGNvbnN0IHtib2R5LCBzdGF0dXMsIGhlYWRlcnMsIHN0YXR1c1RleHQsIHR5cGUsIHVybH0gPSBvcHRzO1xuICAgIHRoaXMuYm9keSA9IGJvZHkgIT0gbnVsbCA/IGJvZHkgOiBudWxsO1xuICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzICE9IG51bGwgPyBzdGF0dXMgOiBudWxsO1xuICAgIHRoaXMuaGVhZGVycyA9IGhlYWRlcnMgIT0gbnVsbCA/IGhlYWRlcnMgOiBudWxsO1xuICAgIHRoaXMuc3RhdHVzVGV4dCA9IHN0YXR1c1RleHQgIT0gbnVsbCA/IHN0YXR1c1RleHQgOiBudWxsO1xuICAgIHRoaXMudHlwZSA9IHR5cGUgIT0gbnVsbCA/IHR5cGUgOiBudWxsO1xuICAgIHRoaXMudXJsID0gdXJsICE9IG51bGwgPyB1cmwgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoZSBgUmVzcG9uc2VPcHRpb25zYCBpbnN0YW5jZSwgdXNpbmcgdGhlIG9wdGlvbmFsIGlucHV0IGFzIHZhbHVlcyB0b1xuICAgKiBvdmVycmlkZVxuICAgKiBleGlzdGluZyB2YWx1ZXMuIFRoaXMgbWV0aG9kIHdpbGwgbm90IGNoYW5nZSB0aGUgdmFsdWVzIG9mIHRoZSBpbnN0YW5jZSBvbiB3aGljaCBpdCBpcyBiZWluZ1xuICAgKiBjYWxsZWQuXG4gICAqXG4gICAqIFRoaXMgbWF5IGJlIHVzZWZ1bCB3aGVuIHNoYXJpbmcgYSBiYXNlIGBSZXNwb25zZU9wdGlvbnNgIG9iamVjdCBpbnNpZGUgdGVzdHMsXG4gICAqIHdoZXJlIGNlcnRhaW4gcHJvcGVydGllcyBtYXkgY2hhbmdlIGZyb20gdGVzdCB0byB0ZXN0LlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGltcG9ydCB7UmVzcG9uc2VPcHRpb25zLCBSZXNwb25zZX0gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG4gICAqXG4gICAqIHZhciBvcHRpb25zID0gbmV3IFJlc3BvbnNlT3B0aW9ucyh7XG4gICAqICAgYm9keToge25hbWU6ICdKZWZmJ31cbiAgICogfSk7XG4gICAqIHZhciByZXMgPSBuZXcgUmVzcG9uc2Uob3B0aW9ucy5tZXJnZSh7XG4gICAqICAgdXJsOiAnaHR0cHM6Ly9nb29nbGUuY29tJ1xuICAgKiB9KSk7XG4gICAqIGNvbnNvbGUubG9nKCdvcHRpb25zLnVybDonLCBvcHRpb25zLnVybCk7IC8vIG51bGxcbiAgICogY29uc29sZS5sb2coJ3Jlcy5qc29uKCk6JywgcmVzLmpzb24oKSk7IC8vIE9iamVjdCB7bmFtZTogXCJKZWZmXCJ9XG4gICAqIGNvbnNvbGUubG9nKCdyZXMudXJsOicsIHJlcy51cmwpOyAvLyBodHRwczovL2dvb2dsZS5jb21cbiAgICogYGBgXG4gICAqL1xuICBtZXJnZShvcHRpb25zPzogUmVzcG9uc2VPcHRpb25zQXJncyk6IFJlc3BvbnNlT3B0aW9ucyB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZU9wdGlvbnMoe1xuICAgICAgYm9keTogb3B0aW9ucyAmJiBvcHRpb25zLmJvZHkgIT0gbnVsbCA/IG9wdGlvbnMuYm9keSA6IHRoaXMuYm9keSxcbiAgICAgIHN0YXR1czogb3B0aW9ucyAmJiBvcHRpb25zLnN0YXR1cyAhPSBudWxsID8gb3B0aW9ucy5zdGF0dXMgOiB0aGlzLnN0YXR1cyxcbiAgICAgIGhlYWRlcnM6IG9wdGlvbnMgJiYgb3B0aW9ucy5oZWFkZXJzICE9IG51bGwgPyBvcHRpb25zLmhlYWRlcnMgOiB0aGlzLmhlYWRlcnMsXG4gICAgICBzdGF0dXNUZXh0OiBvcHRpb25zICYmIG9wdGlvbnMuc3RhdHVzVGV4dCAhPSBudWxsID8gb3B0aW9ucy5zdGF0dXNUZXh0IDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgdHlwZTogb3B0aW9ucyAmJiBvcHRpb25zLnR5cGUgIT0gbnVsbCA/IG9wdGlvbnMudHlwZSA6IHRoaXMudHlwZSxcbiAgICAgIHVybDogb3B0aW9ucyAmJiBvcHRpb25zLnVybCAhPSBudWxsID8gb3B0aW9ucy51cmwgOiB0aGlzLnVybCxcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFN1YmNsYXNzIG9mIHtAbGluayBSZXNwb25zZU9wdGlvbnN9LCB3aXRoIGRlZmF1bHQgdmFsdWVzLlxuICpcbiAqIERlZmF1bHQgdmFsdWVzOlxuICogICogc3RhdHVzOiAyMDBcbiAqICAqIGhlYWRlcnM6IGVtcHR5IHtAbGluayBIZWFkZXJzfSBvYmplY3RcbiAqXG4gKiBUaGlzIGNsYXNzIGNvdWxkIGJlIGV4dGVuZGVkIGFuZCBib3VuZCB0byB0aGUge0BsaW5rIFJlc3BvbnNlT3B0aW9uc30gY2xhc3NcbiAqIHdoZW4gY29uZmlndXJpbmcgYW4ge0BsaW5rIEluamVjdG9yfSwgaW4gb3JkZXIgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9uc1xuICogdXNlZCBieSB7QGxpbmsgSHR0cH0gdG8gY3JlYXRlIHtAbGluayBSZXNwb25zZSBSZXNwb25zZXN9LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtwcm92aWRlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqIGltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyL2Jyb3dzZXInO1xuICogaW1wb3J0IHtIVFRQX1BST1ZJREVSUywgSGVhZGVycywgSHR0cCwgQmFzZVJlc3BvbnNlT3B0aW9ucywgUmVzcG9uc2VPcHRpb25zfSBmcm9tXG4gKiAnQGFuZ3VsYXIvaHR0cCc7XG4gKiBpbXBvcnQge0FwcH0gZnJvbSAnLi9teWFwcCc7XG4gKlxuICogY2xhc3MgTXlPcHRpb25zIGV4dGVuZHMgQmFzZVJlc3BvbnNlT3B0aW9ucyB7XG4gKiAgIGhlYWRlcnM6SGVhZGVycyA9IG5ldyBIZWFkZXJzKHtuZXR3b3JrOiAnZ2l0aHViJ30pO1xuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHAsIFtIVFRQX1BST1ZJREVSUywge3Byb3ZpZGU6IFJlc3BvbnNlT3B0aW9ucywgdXNlQ2xhc3M6IE15T3B0aW9uc31dKTtcbiAqIGBgYFxuICpcbiAqIFRoZSBvcHRpb25zIGNvdWxkIGFsc28gYmUgZXh0ZW5kZWQgd2hlbiBtYW51YWxseSBjcmVhdGluZyBhIHtAbGluayBSZXNwb25zZX1cbiAqIG9iamVjdC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtCYXNlUmVzcG9uc2VPcHRpb25zLCBSZXNwb25zZX0gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG4gKlxuICogdmFyIG9wdGlvbnMgPSBuZXcgQmFzZVJlc3BvbnNlT3B0aW9ucygpO1xuICogdmFyIHJlcyA9IG5ldyBSZXNwb25zZShvcHRpb25zLm1lcmdlKHtcbiAqICAgYm9keTogJ0FuZ3VsYXInLFxuICogICBoZWFkZXJzOiBuZXcgSGVhZGVycyh7ZnJhbWV3b3JrOiAnYW5ndWxhcid9KVxuICogfSkpO1xuICogY29uc29sZS5sb2coJ3Jlcy5oZWFkZXJzLmdldChcImZyYW1ld29ya1wiKTonLCByZXMuaGVhZGVycy5nZXQoJ2ZyYW1ld29yaycpKTsgLy8gYW5ndWxhclxuICogY29uc29sZS5sb2coJ3Jlcy50ZXh0KCk6JywgcmVzLnRleHQoKSk7IC8vIEFuZ3VsYXI7XG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBzZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2h0dHBcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJhc2VSZXNwb25zZU9wdGlvbnMgZXh0ZW5kcyBSZXNwb25zZU9wdGlvbnMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7c3RhdHVzOiAyMDAsIHN0YXR1c1RleHQ6ICdPaycsIHR5cGU6IFJlc3BvbnNlVHlwZS5EZWZhdWx0LCBoZWFkZXJzOiBuZXcgSGVhZGVycygpfSk7XG4gIH1cbn1cbiJdfQ==