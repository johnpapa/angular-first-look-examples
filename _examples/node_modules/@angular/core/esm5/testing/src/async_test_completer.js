/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Injectable completer that allows signaling completion of an asynchronous test. Used internally.
 */
var AsyncTestCompleter = /** @class */ (function () {
    function AsyncTestCompleter() {
        var _this = this;
        this._promise = new Promise(function (res, rej) {
            _this._resolve = res;
            _this._reject = rej;
        });
    }
    AsyncTestCompleter.prototype.done = function (value) { this._resolve(value); };
    AsyncTestCompleter.prototype.fail = function (error, stackTrace) { this._reject(error); };
    Object.defineProperty(AsyncTestCompleter.prototype, "promise", {
        get: function () { return this._promise; },
        enumerable: true,
        configurable: true
    });
    return AsyncTestCompleter;
}());
export { AsyncTestCompleter };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfdGVzdF9jb21wbGV0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3Rlc3Rpbmcvc3JjL2FzeW5jX3Rlc3RfY29tcGxldGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVIOztHQUVHO0FBQ0g7SUFBQTtRQUFBLGlCQVlDO1FBVFMsYUFBUSxHQUFpQixJQUFJLE9BQU8sQ0FBQyxVQUFDLEdBQUcsRUFBRSxHQUFHO1lBQ3BELEtBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO1lBQ3BCLEtBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDO0lBTUwsQ0FBQztJQUxDLGlDQUFJLEdBQUosVUFBSyxLQUFXLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFM0MsaUNBQUksR0FBSixVQUFLLEtBQVcsRUFBRSxVQUFtQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRS9ELHNCQUFJLHVDQUFPO2FBQVgsY0FBOEIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUN2RCx5QkFBQztBQUFELENBQUMsQUFaRCxJQVlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEluamVjdGFibGUgY29tcGxldGVyIHRoYXQgYWxsb3dzIHNpZ25hbGluZyBjb21wbGV0aW9uIG9mIGFuIGFzeW5jaHJvbm91cyB0ZXN0LiBVc2VkIGludGVybmFsbHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBBc3luY1Rlc3RDb21wbGV0ZXIge1xuICBwcml2YXRlIF9yZXNvbHZlOiAocmVzdWx0OiBhbnkpID0+IHZvaWQ7XG4gIHByaXZhdGUgX3JlamVjdDogKGVycjogYW55KSA9PiB2b2lkO1xuICBwcml2YXRlIF9wcm9taXNlOiBQcm9taXNlPGFueT4gPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICB0aGlzLl9yZXNvbHZlID0gcmVzO1xuICAgIHRoaXMuX3JlamVjdCA9IHJlajtcbiAgfSk7XG4gIGRvbmUodmFsdWU/OiBhbnkpIHsgdGhpcy5fcmVzb2x2ZSh2YWx1ZSk7IH1cblxuICBmYWlsKGVycm9yPzogYW55LCBzdGFja1RyYWNlPzogc3RyaW5nKSB7IHRoaXMuX3JlamVjdChlcnJvcik7IH1cblxuICBnZXQgcHJvbWlzZSgpOiBQcm9taXNlPGFueT4geyByZXR1cm4gdGhpcy5fcHJvbWlzZTsgfVxufVxuIl19