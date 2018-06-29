/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var _global = (typeof window === 'undefined' ? global : window);
/**
 * Wraps a test function in an asynchronous test zone. The test will automatically
 * complete when all asynchronous calls within this zone are done. Can be used
 * to wrap an {@link inject} call.
 *
 * Example:
 *
 * ```
 * it('...', async(inject([AClass], (object) => {
 *   object.doSomething.then(() => {
 *     expect(...);
 *   })
 * });
 * ```
 *
 *
 */
export function asyncFallback(fn) {
    // If we're running using the Jasmine test framework, adapt to call the 'done'
    // function when asynchronous activity is finished.
    if (_global.jasmine) {
        // Not using an arrow function to preserve context passed from call site
        return function (done) {
            if (!done) {
                // if we run beforeEach in @angular/core/testing/testing_internal then we get no done
                // fake it here and assume sync.
                done = function () { };
                done.fail = function (e) { throw e; };
            }
            runInTestZone(fn, this, done, function (err) {
                if (typeof err === 'string') {
                    return done.fail(new Error(err));
                }
                else {
                    done.fail(err);
                }
            });
        };
    }
    // Otherwise, return a promise which will resolve when asynchronous activity
    // is finished. This will be correctly consumed by the Mocha framework with
    // it('...', async(myFn)); or can be used in a custom framework.
    // Not using an arrow function to preserve context passed from call site
    return function () {
        var _this = this;
        return new Promise(function (finishCallback, failCallback) {
            runInTestZone(fn, _this, finishCallback, failCallback);
        });
    };
}
function runInTestZone(fn, context, finishCallback, failCallback) {
    var currentZone = Zone.current;
    var AsyncTestZoneSpec = Zone['AsyncTestZoneSpec'];
    if (AsyncTestZoneSpec === undefined) {
        throw new Error('AsyncTestZoneSpec is needed for the async() test helper but could not be found. ' +
            'Please make sure that your environment includes zone.js/dist/async-test.js');
    }
    var ProxyZoneSpec = Zone['ProxyZoneSpec'];
    if (ProxyZoneSpec === undefined) {
        throw new Error('ProxyZoneSpec is needed for the async() test helper but could not be found. ' +
            'Please make sure that your environment includes zone.js/dist/proxy.js');
    }
    var proxyZoneSpec = ProxyZoneSpec.get();
    ProxyZoneSpec.assertPresent();
    // We need to create the AsyncTestZoneSpec outside the ProxyZone.
    // If we do it in ProxyZone then we will get to infinite recursion.
    var proxyZone = Zone.current.getZoneWith('ProxyZoneSpec');
    var previousDelegate = proxyZoneSpec.getDelegate();
    proxyZone.parent.run(function () {
        var testZoneSpec = new AsyncTestZoneSpec(function () {
            // Need to restore the original zone.
            currentZone.run(function () {
                if (proxyZoneSpec.getDelegate() == testZoneSpec) {
                    // Only reset the zone spec if it's sill this one. Otherwise, assume it's OK.
                    proxyZoneSpec.setDelegate(previousDelegate);
                }
                finishCallback();
            });
        }, function (error) {
            // Need to restore the original zone.
            currentZone.run(function () {
                if (proxyZoneSpec.getDelegate() == testZoneSpec) {
                    // Only reset the zone spec if it's sill this one. Otherwise, assume it's OK.
                    proxyZoneSpec.setDelegate(previousDelegate);
                }
                failCallback(error);
            });
        }, 'test');
        proxyZoneSpec.setDelegate(testZoneSpec);
    });
    return Zone.current.runGuarded(fn, context);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfZmFsbGJhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3Rlc3Rpbmcvc3JjL2FzeW5jX2ZhbGxiYWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQVFILElBQU0sT0FBTyxHQUFRLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRXZFOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ0gsTUFBTSx3QkFBd0IsRUFBWTtJQUN4Qyw4RUFBOEU7SUFDOUUsbURBQW1EO0lBQ25ELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLHdFQUF3RTtRQUN4RSxNQUFNLENBQUMsVUFBUyxJQUFTO1lBQ3ZCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDVixxRkFBcUY7Z0JBQ3JGLGdDQUFnQztnQkFDaEMsSUFBSSxHQUFHLGNBQVksQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVMsQ0FBTSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLENBQUM7WUFDRCxhQUFhLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBQyxHQUFRO2dCQUNyQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pCLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQztJQUNKLENBQUM7SUFDRCw0RUFBNEU7SUFDNUUsMkVBQTJFO0lBQzNFLGdFQUFnRTtJQUNoRSx3RUFBd0U7SUFDeEUsTUFBTSxDQUFDO1FBQUEsaUJBSU47UUFIQyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQU8sVUFBQyxjQUFjLEVBQUUsWUFBWTtZQUNwRCxhQUFhLENBQUMsRUFBRSxFQUFFLEtBQUksRUFBRSxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsdUJBQ0ksRUFBWSxFQUFFLE9BQVksRUFBRSxjQUF3QixFQUFFLFlBQXNCO0lBQzlFLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDakMsSUFBTSxpQkFBaUIsR0FBSSxJQUFZLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUM3RCxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sSUFBSSxLQUFLLENBQ1gsa0ZBQWtGO1lBQ2xGLDRFQUE0RSxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUNELElBQU0sYUFBYSxHQUFJLElBQVksQ0FBQyxlQUFlLENBR2xELENBQUM7SUFDRixFQUFFLENBQUMsQ0FBQyxhQUFhLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNoQyxNQUFNLElBQUksS0FBSyxDQUNYLDhFQUE4RTtZQUM5RSx1RUFBdUUsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFDRCxJQUFNLGFBQWEsR0FBRyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDMUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzlCLGlFQUFpRTtJQUNqRSxtRUFBbUU7SUFDbkUsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDNUQsSUFBTSxnQkFBZ0IsR0FBRyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDckQsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDbkIsSUFBTSxZQUFZLEdBQWEsSUFBSSxpQkFBaUIsQ0FDaEQ7WUFDRSxxQ0FBcUM7WUFDckMsV0FBVyxDQUFDLEdBQUcsQ0FBQztnQkFDZCxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQztvQkFDaEQsNkVBQTZFO29CQUM3RSxhQUFhLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQzlDLENBQUM7Z0JBQ0QsY0FBYyxFQUFFLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLEVBQ0QsVUFBQyxLQUFVO1lBQ1QscUNBQXFDO1lBQ3JDLFdBQVcsQ0FBQyxHQUFHLENBQUM7Z0JBQ2QsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQ2hELDZFQUE2RTtvQkFDN0UsYUFBYSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO2dCQUNELFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsRUFDRCxNQUFNLENBQUMsQ0FBQztRQUNaLGFBQWEsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUMsQ0FBQyxDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzlDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogYXN5bmMgaGFzIGJlZW4gbW92ZWQgdG8gem9uZS5qc1xuICogdGhpcyBmaWxlIGlzIGZvciBmYWxsYmFjayBpbiBjYXNlIG9sZCB2ZXJzaW9uIG9mIHpvbmUuanMgaXMgdXNlZFxuICovXG5kZWNsYXJlIHZhciBnbG9iYWw6IGFueTtcblxuY29uc3QgX2dsb2JhbCA9IDxhbnk+KHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93KTtcblxuLyoqXG4gKiBXcmFwcyBhIHRlc3QgZnVuY3Rpb24gaW4gYW4gYXN5bmNocm9ub3VzIHRlc3Qgem9uZS4gVGhlIHRlc3Qgd2lsbCBhdXRvbWF0aWNhbGx5XG4gKiBjb21wbGV0ZSB3aGVuIGFsbCBhc3luY2hyb25vdXMgY2FsbHMgd2l0aGluIHRoaXMgem9uZSBhcmUgZG9uZS4gQ2FuIGJlIHVzZWRcbiAqIHRvIHdyYXAgYW4ge0BsaW5rIGluamVjdH0gY2FsbC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYFxuICogaXQoJy4uLicsIGFzeW5jKGluamVjdChbQUNsYXNzXSwgKG9iamVjdCkgPT4ge1xuICogICBvYmplY3QuZG9Tb21ldGhpbmcudGhlbigoKSA9PiB7XG4gKiAgICAgZXhwZWN0KC4uLik7XG4gKiAgIH0pXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0ZhbGxiYWNrKGZuOiBGdW5jdGlvbik6IChkb25lOiBhbnkpID0+IGFueSB7XG4gIC8vIElmIHdlJ3JlIHJ1bm5pbmcgdXNpbmcgdGhlIEphc21pbmUgdGVzdCBmcmFtZXdvcmssIGFkYXB0IHRvIGNhbGwgdGhlICdkb25lJ1xuICAvLyBmdW5jdGlvbiB3aGVuIGFzeW5jaHJvbm91cyBhY3Rpdml0eSBpcyBmaW5pc2hlZC5cbiAgaWYgKF9nbG9iYWwuamFzbWluZSkge1xuICAgIC8vIE5vdCB1c2luZyBhbiBhcnJvdyBmdW5jdGlvbiB0byBwcmVzZXJ2ZSBjb250ZXh0IHBhc3NlZCBmcm9tIGNhbGwgc2l0ZVxuICAgIHJldHVybiBmdW5jdGlvbihkb25lOiBhbnkpIHtcbiAgICAgIGlmICghZG9uZSkge1xuICAgICAgICAvLyBpZiB3ZSBydW4gYmVmb3JlRWFjaCBpbiBAYW5ndWxhci9jb3JlL3Rlc3RpbmcvdGVzdGluZ19pbnRlcm5hbCB0aGVuIHdlIGdldCBubyBkb25lXG4gICAgICAgIC8vIGZha2UgaXQgaGVyZSBhbmQgYXNzdW1lIHN5bmMuXG4gICAgICAgIGRvbmUgPSBmdW5jdGlvbigpIHt9O1xuICAgICAgICBkb25lLmZhaWwgPSBmdW5jdGlvbihlOiBhbnkpIHsgdGhyb3cgZTsgfTtcbiAgICAgIH1cbiAgICAgIHJ1bkluVGVzdFpvbmUoZm4sIHRoaXMsIGRvbmUsIChlcnI6IGFueSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGVyciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICByZXR1cm4gZG9uZS5mYWlsKG5ldyBFcnJvcig8c3RyaW5nPmVycikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvbmUuZmFpbChlcnIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG4gIC8vIE90aGVyd2lzZSwgcmV0dXJuIGEgcHJvbWlzZSB3aGljaCB3aWxsIHJlc29sdmUgd2hlbiBhc3luY2hyb25vdXMgYWN0aXZpdHlcbiAgLy8gaXMgZmluaXNoZWQuIFRoaXMgd2lsbCBiZSBjb3JyZWN0bHkgY29uc3VtZWQgYnkgdGhlIE1vY2hhIGZyYW1ld29yayB3aXRoXG4gIC8vIGl0KCcuLi4nLCBhc3luYyhteUZuKSk7IG9yIGNhbiBiZSB1c2VkIGluIGEgY3VzdG9tIGZyYW1ld29yay5cbiAgLy8gTm90IHVzaW5nIGFuIGFycm93IGZ1bmN0aW9uIHRvIHByZXNlcnZlIGNvbnRleHQgcGFzc2VkIGZyb20gY2FsbCBzaXRlXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKGZpbmlzaENhbGxiYWNrLCBmYWlsQ2FsbGJhY2spID0+IHtcbiAgICAgIHJ1bkluVGVzdFpvbmUoZm4sIHRoaXMsIGZpbmlzaENhbGxiYWNrLCBmYWlsQ2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBydW5JblRlc3Rab25lKFxuICAgIGZuOiBGdW5jdGlvbiwgY29udGV4dDogYW55LCBmaW5pc2hDYWxsYmFjazogRnVuY3Rpb24sIGZhaWxDYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgY29uc3QgY3VycmVudFpvbmUgPSBab25lLmN1cnJlbnQ7XG4gIGNvbnN0IEFzeW5jVGVzdFpvbmVTcGVjID0gKFpvbmUgYXMgYW55KVsnQXN5bmNUZXN0Wm9uZVNwZWMnXTtcbiAgaWYgKEFzeW5jVGVzdFpvbmVTcGVjID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdBc3luY1Rlc3Rab25lU3BlYyBpcyBuZWVkZWQgZm9yIHRoZSBhc3luYygpIHRlc3QgaGVscGVyIGJ1dCBjb3VsZCBub3QgYmUgZm91bmQuICcgK1xuICAgICAgICAnUGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHlvdXIgZW52aXJvbm1lbnQgaW5jbHVkZXMgem9uZS5qcy9kaXN0L2FzeW5jLXRlc3QuanMnKTtcbiAgfVxuICBjb25zdCBQcm94eVpvbmVTcGVjID0gKFpvbmUgYXMgYW55KVsnUHJveHlab25lU3BlYyddIGFzIHtcbiAgICBnZXQoKToge3NldERlbGVnYXRlKHNwZWM6IFpvbmVTcGVjKTogdm9pZDsgZ2V0RGVsZWdhdGUoKTogWm9uZVNwZWM7fTtcbiAgICBhc3NlcnRQcmVzZW50OiAoKSA9PiB2b2lkO1xuICB9O1xuICBpZiAoUHJveHlab25lU3BlYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnUHJveHlab25lU3BlYyBpcyBuZWVkZWQgZm9yIHRoZSBhc3luYygpIHRlc3QgaGVscGVyIGJ1dCBjb3VsZCBub3QgYmUgZm91bmQuICcgK1xuICAgICAgICAnUGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHlvdXIgZW52aXJvbm1lbnQgaW5jbHVkZXMgem9uZS5qcy9kaXN0L3Byb3h5LmpzJyk7XG4gIH1cbiAgY29uc3QgcHJveHlab25lU3BlYyA9IFByb3h5Wm9uZVNwZWMuZ2V0KCk7XG4gIFByb3h5Wm9uZVNwZWMuYXNzZXJ0UHJlc2VudCgpO1xuICAvLyBXZSBuZWVkIHRvIGNyZWF0ZSB0aGUgQXN5bmNUZXN0Wm9uZVNwZWMgb3V0c2lkZSB0aGUgUHJveHlab25lLlxuICAvLyBJZiB3ZSBkbyBpdCBpbiBQcm94eVpvbmUgdGhlbiB3ZSB3aWxsIGdldCB0byBpbmZpbml0ZSByZWN1cnNpb24uXG4gIGNvbnN0IHByb3h5Wm9uZSA9IFpvbmUuY3VycmVudC5nZXRab25lV2l0aCgnUHJveHlab25lU3BlYycpO1xuICBjb25zdCBwcmV2aW91c0RlbGVnYXRlID0gcHJveHlab25lU3BlYy5nZXREZWxlZ2F0ZSgpO1xuICBwcm94eVpvbmUucGFyZW50LnJ1bigoKSA9PiB7XG4gICAgY29uc3QgdGVzdFpvbmVTcGVjOiBab25lU3BlYyA9IG5ldyBBc3luY1Rlc3Rab25lU3BlYyhcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIC8vIE5lZWQgdG8gcmVzdG9yZSB0aGUgb3JpZ2luYWwgem9uZS5cbiAgICAgICAgICBjdXJyZW50Wm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb3h5Wm9uZVNwZWMuZ2V0RGVsZWdhdGUoKSA9PSB0ZXN0Wm9uZVNwZWMpIHtcbiAgICAgICAgICAgICAgLy8gT25seSByZXNldCB0aGUgem9uZSBzcGVjIGlmIGl0J3Mgc2lsbCB0aGlzIG9uZS4gT3RoZXJ3aXNlLCBhc3N1bWUgaXQncyBPSy5cbiAgICAgICAgICAgICAgcHJveHlab25lU3BlYy5zZXREZWxlZ2F0ZShwcmV2aW91c0RlbGVnYXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmlzaENhbGxiYWNrKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgLy8gTmVlZCB0byByZXN0b3JlIHRoZSBvcmlnaW5hbCB6b25lLlxuICAgICAgICAgIGN1cnJlbnRab25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICBpZiAocHJveHlab25lU3BlYy5nZXREZWxlZ2F0ZSgpID09IHRlc3Rab25lU3BlYykge1xuICAgICAgICAgICAgICAvLyBPbmx5IHJlc2V0IHRoZSB6b25lIHNwZWMgaWYgaXQncyBzaWxsIHRoaXMgb25lLiBPdGhlcndpc2UsIGFzc3VtZSBpdCdzIE9LLlxuICAgICAgICAgICAgICBwcm94eVpvbmVTcGVjLnNldERlbGVnYXRlKHByZXZpb3VzRGVsZWdhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmFpbENhbGxiYWNrKGVycm9yKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgJ3Rlc3QnKTtcbiAgICBwcm94eVpvbmVTcGVjLnNldERlbGVnYXRlKHRlc3Rab25lU3BlYyk7XG4gIH0pO1xuICByZXR1cm4gWm9uZS5jdXJyZW50LnJ1bkd1YXJkZWQoZm4sIGNvbnRleHQpO1xufSJdfQ==