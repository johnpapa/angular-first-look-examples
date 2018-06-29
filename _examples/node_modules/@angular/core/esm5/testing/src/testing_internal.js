/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { ɵisPromise as isPromise } from '@angular/core';
import { global } from '@angular/core/src/util';
import { AsyncTestCompleter } from './async_test_completer';
import { getTestBed } from './test_bed';
export { AsyncTestCompleter } from './async_test_completer';
export { inject } from './test_bed';
export * from './logger';
export * from './ng_zone_mock';
export var proxy = function (t) { return t; };
var _global = (typeof window === 'undefined' ? global : window);
export var afterEach = _global.afterEach;
export var expect = _global.expect;
var jsmBeforeEach = _global.beforeEach;
var jsmDescribe = _global.describe;
var jsmDDescribe = _global.fdescribe;
var jsmXDescribe = _global.xdescribe;
var jsmIt = _global.it;
var jsmIIt = _global.fit;
var jsmXIt = _global.xit;
var runnerStack = [];
jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;
var globalTimeOut = jasmine.DEFAULT_TIMEOUT_INTERVAL;
var testBed = getTestBed();
/**
 * Mechanism to run `beforeEach()` functions of Angular tests.
 *
 * Note: Jasmine own `beforeEach` is used by this library to handle DI providers.
 */
var BeforeEachRunner = /** @class */ (function () {
    function BeforeEachRunner(_parent) {
        this._parent = _parent;
        this._fns = [];
    }
    BeforeEachRunner.prototype.beforeEach = function (fn) { this._fns.push(fn); };
    BeforeEachRunner.prototype.run = function () {
        if (this._parent)
            this._parent.run();
        this._fns.forEach(function (fn) { fn(); });
    };
    return BeforeEachRunner;
}());
// Reset the test providers before each test
jsmBeforeEach(function () { testBed.resetTestingModule(); });
function _describe(jsmFn) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var parentRunner = runnerStack.length === 0 ? null : runnerStack[runnerStack.length - 1];
    var runner = new BeforeEachRunner(parentRunner);
    runnerStack.push(runner);
    var suite = jsmFn.apply(void 0, tslib_1.__spread(args));
    runnerStack.pop();
    return suite;
}
export function describe() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _describe.apply(void 0, tslib_1.__spread([jsmDescribe], args));
}
export function ddescribe() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _describe.apply(void 0, tslib_1.__spread([jsmDDescribe], args));
}
export function xdescribe() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _describe.apply(void 0, tslib_1.__spread([jsmXDescribe], args));
}
export function beforeEach(fn) {
    if (runnerStack.length > 0) {
        // Inside a describe block, beforeEach() uses a BeforeEachRunner
        runnerStack[runnerStack.length - 1].beforeEach(fn);
    }
    else {
        // Top level beforeEach() are delegated to jasmine
        jsmBeforeEach(fn);
    }
}
/**
 * Allows overriding default providers defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * Example:
 *
 *   beforeEachProviders(() => [
 *     {provide: Compiler, useClass: MockCompiler},
 *     {provide: SomeToken, useValue: myValue},
 *   ]);
 */
export function beforeEachProviders(fn) {
    jsmBeforeEach(function () {
        var providers = fn();
        if (!providers)
            return;
        testBed.configureTestingModule({ providers: providers });
    });
}
function _it(jsmFn, name, testFn, testTimeOut) {
    if (runnerStack.length == 0) {
        // This left here intentionally, as we should never get here, and it aids debugging.
        debugger;
        throw new Error('Empty Stack!');
    }
    var runner = runnerStack[runnerStack.length - 1];
    var timeOut = Math.max(globalTimeOut, testTimeOut);
    jsmFn(name, function (done) {
        var completerProvider = {
            provide: AsyncTestCompleter,
            useFactory: function () {
                // Mark the test as async when an AsyncTestCompleter is injected in an it()
                return new AsyncTestCompleter();
            }
        };
        testBed.configureTestingModule({ providers: [completerProvider] });
        runner.run();
        if (testFn.length == 0) {
            var retVal = testFn();
            if (isPromise(retVal)) {
                // Asynchronous test function that returns a Promise - wait for completion.
                retVal.then(done, done.fail);
            }
            else {
                // Synchronous test function - complete immediately.
                done();
            }
        }
        else {
            // Asynchronous test function that takes in 'done' parameter.
            testFn(done);
        }
    }, timeOut);
}
export function it(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIt, name, fn, timeOut);
}
export function xit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmXIt, name, fn, timeOut);
}
export function iit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIIt, name, fn, timeOut);
}
var SpyObject = /** @class */ (function () {
    function SpyObject(type) {
        if (type) {
            for (var prop in type.prototype) {
                var m = null;
                try {
                    m = type.prototype[prop];
                }
                catch (e) {
                    // As we are creating spys for abstract classes,
                    // these classes might have getters that throw when they are accessed.
                    // As we are only auto creating spys for methods, this
                    // should not matter.
                }
                if (typeof m === 'function') {
                    this.spy(prop);
                }
            }
        }
    }
    SpyObject.prototype.spy = function (name) {
        if (!this[name]) {
            this[name] = jasmine.createSpy(name);
        }
        return this[name];
    };
    SpyObject.prototype.prop = function (name, value) { this[name] = value; };
    SpyObject.stub = function (object, config, overrides) {
        if (object === void 0) { object = null; }
        if (config === void 0) { config = null; }
        if (overrides === void 0) { overrides = null; }
        if (!(object instanceof SpyObject)) {
            overrides = config;
            config = object;
            object = new SpyObject();
        }
        var m = tslib_1.__assign({}, config, overrides);
        Object.keys(m).forEach(function (key) { object.spy(key).and.returnValue(m[key]); });
        return object;
    };
    return SpyObject;
}());
export { SpyObject };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ19pbnRlcm5hbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvdGVzdGluZy9zcmMvdGVzdGluZ19pbnRlcm5hbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFVBQVUsSUFBSSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdEQsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRTlDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzFELE9BQU8sRUFBQyxVQUFVLEVBQVMsTUFBTSxZQUFZLENBQUM7QUFFOUMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDMUQsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUVsQyxjQUFjLFVBQVUsQ0FBQztBQUN6QixjQUFjLGdCQUFnQixDQUFDO0FBRS9CLE1BQU0sQ0FBQyxJQUFNLEtBQUssR0FBbUIsVUFBQyxDQUFNLElBQUssT0FBQSxDQUFDLEVBQUQsQ0FBQyxDQUFDO0FBRW5ELElBQU0sT0FBTyxHQUFRLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRXZFLE1BQU0sQ0FBQyxJQUFNLFNBQVMsR0FBYSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQ3JELE1BQU0sQ0FBQyxJQUFNLE1BQU0sR0FBc0MsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUV4RSxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO0FBQ3pDLElBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFDckMsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUN2QyxJ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Q0FBQztZQUNuQyxTQUFTLEdBQUcsTUFBTSxDQUFDO1lBQ25CLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDaEIsTUFBTSxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVELElBQU0sQ0FBQyx3QkFBTyxNQUFNLEVBQUssU0FBUyxDQUFDLENBQUM7UUFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLElBQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUUsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBQ0gsZ0JBQUM7QUFBRCxDQUFDLEFBeENELElBd0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge8m1aXNQcm9taXNlIGFzIGlzUHJvbWlzZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2dsb2JhbH0gZnJvbSAnQGFuZ3VsYXIvY29yZS9zcmMvdXRpbCc7XG5cbmltcG9ydCB7QXN5bmNUZXN0Q29tcGxldGVyfSBmcm9tICcuL2FzeW5jX3Rlc3RfY29tcGxldGVyJztcbmltcG9ydCB7Z2V0VGVzdEJlZCwgaW5qZWN0fSBmcm9tICcuL3Rlc3RfYmVkJztcblxuZXhwb3J0IHtBc3luY1Rlc3RDb21wbGV0ZXJ9IGZyb20gJy4vYXN5bmNfdGVzdF9jb21wbGV0ZXInO1xuZXhwb3J0IHtpbmplY3R9IGZyb20gJy4vdGVzdF9iZWQnO1xuXG5leHBvcnQgKiBmcm9tICcuL2xvZ2dlcic7XG5leHBvcnQgKiBmcm9tICcuL25nX3pvbmVfbW9jayc7XG5cbmV4cG9ydCBjb25zdCBwcm94eTogQ2xhc3NEZWNvcmF0b3IgPSAodDogYW55KSA9PiB0O1xuXG5jb25zdCBfZ2xvYmFsID0gPGFueT4odHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3cpO1xuXG5leHBvcnQgY29uc3QgYWZ0ZXJFYWNoOiBGdW5jdGlvbiA9IF9nbG9iYWwuYWZ0ZXJFYWNoO1xuZXhwb3J0IGNvbnN0IGV4cGVjdDogKGFjdHVhbDogYW55KSA9PiBqYXNtaW5lLk1hdGNoZXJzID0gX2dsb2JhbC5leHBlY3Q7XG5cbmNvbnN0IGpzbUJlZm9yZUVhY2ggPSBfZ2xvYmFsLmJlZm9yZUVhY2g7XG5jb25zdCBqc21EZXNjcmliZSA9IF9nbG9iYWwuZGVzY3JpYmU7XG5jb25zdCBqc21ERGVzY3JpYmUgPSBfZ2xvYmFsLmZkZXNjcmliZTtcbmNvbnN0IGpzbVhEZXNjcmliZSA9IF9nbG9iYWwueGRlc2NyaWJlO1xuY29uc3QganNtSXQgPSBfZ2xvYmFsLml0O1xuY29uc3QganNtSUl0ID0gX2dsb2JhbC5maXQ7XG5jb25zdCBqc21YSXQgPSBfZ2xvYmFsLnhpdDtcblxuY29uc3QgcnVubmVyU3RhY2s6IEJlZm9yZUVhY2hSdW5uZXJbXSA9IFtdO1xuamFzbWluZS5ERUZBVUxUX1RJTUVPVVRfSU5URVJWQUwgPSAzMDAwO1xuY29uc3QgZ2xvYmFsVGltZU91dCA9IGphc21pbmUuREVGQVVMVF9USU1FT1VUX0lOVEVSVkFMO1xuXG5jb25zdCB0ZXN0QmVkID0gZ2V0VGVzdEJlZCgpO1xuXG4vKipcbiAqIE1lY2hhbmlzbSB0byBydW4gYGJlZm9yZUVhY2goKWAgZnVuY3Rpb25zIG9mIEFuZ3VsYXIgdGVzdHMuXG4gKlxuICogTm90ZTogSmFzbWluZSBvd24gYGJlZm9yZUVhY2hgIGlzIHVzZWQgYnkgdGhpcyBsaWJyYXJ5IHRvIGhhbmRsZSBESSBwcm92aWRlcnMuXG4gKi9cbmNsYXNzIEJlZm9yZUVhY2hSdW5uZXIge1xuICBwcml2YXRlIF9mbnM6IEFycmF5PEZ1bmN0aW9uPiA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3BhcmVudDogQmVmb3JlRWFjaFJ1bm5lcikge31cblxuICBiZWZvcmVFYWNoKGZuOiBGdW5jdGlvbik6IHZvaWQgeyB0aGlzLl9mbnMucHVzaChmbik7IH1cblxuICBydW4oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BhcmVudCkgdGhpcy5fcGFyZW50LnJ1bigpO1xuICAgIHRoaXMuX2Zucy5mb3JFYWNoKChmbikgPT4geyBmbigpOyB9KTtcbiAgfVxufVxuXG4vLyBSZXNldCB0aGUgdGVzdCBwcm92aWRlcnMgYmVmb3JlIGVhY2ggdGVzdFxuanNtQmVmb3JlRWFjaCgoKSA9PiB7IHRlc3RCZWQucmVzZXRUZXN0aW5nTW9kdWxlKCk7IH0pO1xuXG5mdW5jdGlvbiBfZGVzY3JpYmUoanNtRm46IEZ1bmN0aW9uLCAuLi5hcmdzOiBhbnlbXSkge1xuICBjb25zdCBwYXJlbnRSdW5uZXIgPSBydW5uZXJTdGFjay5sZW5ndGggPT09IDAgPyBudWxsIDogcnVubmVyU3RhY2tbcnVubmVyU3RhY2subGVuZ3RoIC0gMV07XG4gIGNvbnN0IHJ1bm5lciA9IG5ldyBCZWZvcmVFYWNoUnVubmVyKHBhcmVudFJ1bm5lciAhKTtcbiAgcnVubmVyU3RhY2sucHVzaChydW5uZXIpO1xuICBjb25zdCBzdWl0ZSA9IGpzbUZuKC4uLmFyZ3MpO1xuICBydW5uZXJTdGFjay5wb3AoKTtcbiAgcmV0dXJuIHN1aXRlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzY3JpYmUoLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgcmV0dXJuIF9kZXNjcmliZShqc21EZXNjcmliZSwgLi4uYXJncyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZGVzY3JpYmUoLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgcmV0dXJuIF9kZXNjcmliZShqc21ERGVzY3JpYmUsIC4uLmFyZ3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24geGRlc2NyaWJlKC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gIHJldHVybiBfZGVzY3JpYmUoanNtWERlc2NyaWJlLCAuLi5hcmdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZUVhY2goZm46IEZ1bmN0aW9uKTogdm9pZCB7XG4gIGlmIChydW5uZXJTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgLy8gSW5zaWRlIGEgZGVzY3JpYmUgYmxvY2ssIGJlZm9yZUVhY2goKSB1c2VzIGEgQmVmb3JlRWFjaFJ1bm5lclxuICAgIHJ1bm5lclN0YWNrW3J1bm5lclN0YWNrLmxlbmd0aCAtIDFdLmJlZm9yZUVhY2goZm4pO1xuICB9IGVsc2Uge1xuICAgIC8vIFRvcCBsZXZlbCBiZWZvcmVFYWNoKCkgYXJlIGRlbGVnYXRlZCB0byBqYXNtaW5lXG4gICAganNtQmVmb3JlRWFjaChmbik7XG4gIH1cbn1cblxuLyoqXG4gKiBBbGxvd3Mgb3ZlcnJpZGluZyBkZWZhdWx0IHByb3ZpZGVycyBkZWZpbmVkIGluIHRlc3RfaW5qZWN0b3IuanMuXG4gKlxuICogVGhlIGdpdmVuIGZ1bmN0aW9uIG11c3QgcmV0dXJuIGEgbGlzdCBvZiBESSBwcm92aWRlcnMuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgIGJlZm9yZUVhY2hQcm92aWRlcnMoKCkgPT4gW1xuICogICAgIHtwcm92aWRlOiBDb21waWxlciwgdXNlQ2xhc3M6IE1vY2tDb21waWxlcn0sXG4gKiAgICAge3Byb3ZpZGU6IFNvbWVUb2tlbiwgdXNlVmFsdWU6IG15VmFsdWV9LFxuICogICBdKTtcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZUVhY2hQcm92aWRlcnMoZm46IEZ1bmN0aW9uKTogdm9pZCB7XG4gIGpzbUJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGNvbnN0IHByb3ZpZGVycyA9IGZuKCk7XG4gICAgaWYgKCFwcm92aWRlcnMpIHJldHVybjtcbiAgICB0ZXN0QmVkLmNvbmZpZ3VyZVRlc3RpbmdNb2R1bGUoe3Byb3ZpZGVyczogcHJvdmlkZXJzfSk7XG4gIH0pO1xufVxuXG5cbmZ1bmN0aW9uIF9pdChqc21GbjogRnVuY3Rpb24sIG5hbWU6IHN0cmluZywgdGVzdEZuOiBGdW5jdGlvbiwgdGVzdFRpbWVPdXQ6IG51bWJlcik6IHZvaWQge1xuICBpZiAocnVubmVyU3RhY2subGVuZ3RoID09IDApIHtcbiAgICAvLyBUaGlzIGxlZnQgaGVyZSBpbnRlbnRpb25hbGx5LCBhcyB3ZSBzaG91bGQgbmV2ZXIgZ2V0IGhlcmUsIGFuZCBpdCBhaWRzIGRlYnVnZ2luZy5cbiAgICBkZWJ1Z2dlcjtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0VtcHR5IFN0YWNrIScpO1xuICB9XG4gIGNvbnN0IHJ1bm5lciA9IHJ1bm5lclN0YWNrW3J1bm5lclN0YWNrLmxlbmd0aCAtIDFdO1xuICBjb25zdCB0aW1lT3V0ID0gTWF0aC5tYXgoZ2xvYmFsVGltZU91dCwgdGVzdFRpbWVPdXQpO1xuXG4gIGpzbUZuKG5hbWUsIChkb25lOiBhbnkpID0+IHtcbiAgICBjb25zdCBjb21wbGV0ZXJQcm92aWRlciA9IHtcbiAgICAgIHByb3ZpZGU6IEFzeW5jVGVzdENvbXBsZXRlcixcbiAgICAgIHVzZUZhY3Rvcnk6ICgpID0+IHtcbiAgICAgICAgLy8gTWFyayB0aGUgdGVzdCBhcyBhc3luYyB3aGVuIGFuIEFzeW5jVGVzdENvbXBsZXRlciBpcyBpbmplY3RlZCBpbiBhbiBpdCgpXG4gICAgICAgIHJldHVybiBuZXcgQXN5bmNUZXN0Q29tcGxldGVyKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICB0ZXN0QmVkLmNvbmZpZ3VyZVRlc3RpbmdNb2R1bGUoe3Byb3ZpZGVyczogW2NvbXBsZXRlclByb3ZpZGVyXX0pO1xuICAgIHJ1bm5lci5ydW4oKTtcblxuICAgIGlmICh0ZXN0Rm4ubGVuZ3RoID09IDApIHtcbiAgICAgIGNvbnN0IHJldFZhbCA9IHRlc3RGbigpO1xuICAgICAgaWYgKGlzUHJvbWlzZShyZXRWYWwpKSB7XG4gICAgICAgIC8vIEFzeW5jaHJvbm91cyB0ZXN0IGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFByb21pc2UgLSB3YWl0IGZvciBjb21wbGV0aW9uLlxuICAgICAgICAoPFByb21pc2U8YW55Pj5yZXRWYWwpLnRoZW4oZG9uZSwgZG9uZS5mYWlsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFN5bmNocm9ub3VzIHRlc3QgZnVuY3Rpb24gLSBjb21wbGV0ZSBpbW1lZGlhdGVseS5cbiAgICAgICAgZG9uZSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBc3luY2hyb25vdXMgdGVzdCBmdW5jdGlvbiB0aGF0IHRha2VzIGluICdkb25lJyBwYXJhbWV0ZXIuXG4gICAgICB0ZXN0Rm4oZG9uZSk7XG4gICAgfVxuICB9LCB0aW1lT3V0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGl0KG5hbWU6IGFueSwgZm46IGFueSwgdGltZU91dDogYW55ID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB4aXQobmFtZTogYW55LCBmbjogYW55LCB0aW1lT3V0OiBhbnkgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtWEl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpaXQobmFtZTogYW55LCBmbjogYW55LCB0aW1lT3V0OiBhbnkgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtSUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbmV4cG9ydCBjbGFzcyBTcHlPYmplY3Qge1xuICBjb25zdHJ1Y3Rvcih0eXBlPzogYW55KSB7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIGZvciAoY29uc3QgcHJvcCBpbiB0eXBlLnByb3RvdHlwZSkge1xuICAgICAgICBsZXQgbTogYW55ID0gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBtID0gdHlwZS5wcm90b3R5cGVbcHJvcF07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvLyBBcyB3ZSBhcmUgY3JlYXRpbmcgc3B5cyBmb3IgYWJzdHJhY3QgY2xhc3NlcyxcbiAgICAgICAgICAvLyB0aGVzZSBjbGFzc2VzIG1pZ2h0IGhhdmUgZ2V0dGVycyB0aGF0IHRocm93IHdoZW4gdGhleSBhcmUgYWNjZXNzZWQuXG4gICAgICAgICAgLy8gQXMgd2UgYXJlIG9ubHkgYXV0byBjcmVhdGluZyBzcHlzIGZvciBtZXRob2RzLCB0aGlzXG4gICAgICAgICAgLy8gc2hvdWxkIG5vdCBtYXR0ZXIuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBtID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5zcHkocHJvcCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzcHkobmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKCEodGhpcyBhcyBhbnkpW25hbWVdKSB7XG4gICAgICAodGhpcyBhcyBhbnkpW25hbWVdID0gamFzbWluZS5jcmVhdGVTcHkobmFtZSk7XG4gICAgfVxuICAgIHJldHVybiAodGhpcyBhcyBhbnkpW25hbWVdO1xuICB9XG5cbiAgcHJvcChuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHsgKHRoaXMgYXMgYW55KVtuYW1lXSA9IHZhbHVlOyB9XG5cbiAgc3RhdGljIHN0dWIob2JqZWN0OiBhbnkgPSBudWxsLCBjb25maWc6IGFueSA9IG51bGwsIG92ZXJyaWRlczogYW55ID0gbnVsbCkge1xuICAgIGlmICghKG9iamVjdCBpbnN0YW5jZW9mIFNweU9iamVjdCkpIHtcbiAgICAgIG92ZXJyaWRlcyA9IGNvbmZpZztcbiAgICAgIGNvbmZpZyA9IG9iamVjdDtcbiAgICAgIG9iamVjdCA9IG5ldyBTcHlPYmplY3QoKTtcbiAgICB9XG5cbiAgICBjb25zdCBtID0gey4uLmNvbmZpZywgLi4ub3ZlcnJpZGVzfTtcbiAgICBPYmplY3Qua2V5cyhtKS5mb3JFYWNoKGtleSA9PiB7IG9iamVjdC5zcHkoa2V5KS5hbmQucmV0dXJuVmFsdWUobVtrZXldKTsgfSk7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxufVxuIl19