/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { defineInjectable } from './defs';
/**
 * Creates a token that can be used in a DI Provider.
 *
 * Use an `InjectionToken` whenever the type you are injecting is not reified (does not have a
 * runtime representation) such as when injecting an interface, callable type, array or
 * parametrized type.
 *
 * `InjectionToken` is parameterized on `T` which is the type of object which will be returned by
 * the `Injector`. This provides additional level of type safety.
 *
 * ```
 * interface MyInterface {...}
 * var myInterface = injector.get(new InjectionToken<MyInterface>('SomeToken'));
 * // myInterface is inferred to be MyInterface.
 * ```
 *
 * When creating an `InjectionToken`, you can optionally specify a factory function which returns
 * (possibly by creating) a default value of the parameterized type `T`. This sets up the
 * `InjectionToken` using this factory as a provider as if it was defined explicitly in the
 * application's root injector. If the factory function, which takes zero arguments, needs to inject
 * dependencies, it can do so using the `inject` function. See below for an example.
 *
 * Additionally, if a `factory` is specified you can also specify the `providedIn` option, which
 * overrides the above behavior and marks the token as belonging to a particular `@NgModule`. As
 * mentioned above, `'root'` is the default value for `providedIn`.
 *
 * @usageNotes
 * ### Basic Example
 *
 * {@example core/di/ts/injector_spec.ts region='InjectionToken'}
 *
 * ### Tree-shakeable Example
 *
 * {@example core/di/ts/injector_spec.ts region='ShakeableInjectionToken'}
 *
 */
var InjectionToken = /** @class */ (function () {
    function InjectionToken(_desc, options) {
        this._desc = _desc;
        /** @internal */
        this.ngMetadataName = 'InjectionToken';
        if (options !== undefined) {
            this.ngInjectableDef = defineInjectable({
                providedIn: options.providedIn || 'root',
                factory: options.factory,
            });
        }
        else {
            this.ngInjectableDef = undefined;
        }
    }
    InjectionToken.prototype.toString = function () { return "InjectionToken " + this._desc; };
    return InjectionToken;
}());
export { InjectionToken };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0aW9uX3Rva2VuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvZGkvaW5qZWN0aW9uX3Rva2VuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBZ0IsZ0JBQWdCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFdkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUNHO0FBQ0g7SUFNRSx3QkFBc0IsS0FBYSxFQUFFLE9BR3BDO1FBSHFCLFVBQUssR0FBTCxLQUFLLENBQVE7UUFMbkMsZ0JBQWdCO1FBQ1AsbUJBQWMsR0FBRyxnQkFBZ0IsQ0FBQztRQVF6QyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsZUFBZSxHQUFHLGdCQUFnQixDQUFDO2dCQUN0QyxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsSUFBSSxNQUFNO2dCQUN4QyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87YUFDekIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7UUFDbkMsQ0FBQztJQUNILENBQUM7SUFFRCxpQ0FBUSxHQUFSLGNBQXFCLE1BQU0sQ0FBQyxvQkFBa0IsSUFBSSxDQUFDLEtBQU8sQ0FBQyxDQUFDLENBQUM7SUFDL0QscUJBQUM7QUFBRCxDQUFDLEFBckJELElBcUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL3R5cGUnO1xuXG5pbXBvcnQge0luamVjdGFibGVEZWYsIGRlZmluZUluamVjdGFibGV9IGZyb20gJy4vZGVmcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgaW4gYSBESSBQcm92aWRlci5cbiAqXG4gKiBVc2UgYW4gYEluamVjdGlvblRva2VuYCB3aGVuZXZlciB0aGUgdHlwZSB5b3UgYXJlIGluamVjdGluZyBpcyBub3QgcmVpZmllZCAoZG9lcyBub3QgaGF2ZSBhXG4gKiBydW50aW1lIHJlcHJlc2VudGF0aW9uKSBzdWNoIGFzIHdoZW4gaW5qZWN0aW5nIGFuIGludGVyZmFjZSwgY2FsbGFibGUgdHlwZSwgYXJyYXkgb3JcbiAqIHBhcmFtZXRyaXplZCB0eXBlLlxuICpcbiAqIGBJbmplY3Rpb25Ub2tlbmAgaXMgcGFyYW1ldGVyaXplZCBvbiBgVGAgd2hpY2ggaXMgdGhlIHR5cGUgb2Ygb2JqZWN0IHdoaWNoIHdpbGwgYmUgcmV0dXJuZWQgYnlcbiAqIHRoZSBgSW5qZWN0b3JgLiBUaGlzIHByb3ZpZGVzIGFkZGl0aW9uYWwgbGV2ZWwgb2YgdHlwZSBzYWZldHkuXG4gKlxuICogYGBgXG4gKiBpbnRlcmZhY2UgTXlJbnRlcmZhY2Ugey4uLn1cbiAqIHZhciBteUludGVyZmFjZSA9IGluamVjdG9yLmdldChuZXcgSW5qZWN0aW9uVG9rZW48TXlJbnRlcmZhY2U+KCdTb21lVG9rZW4nKSk7XG4gKiAvLyBteUludGVyZmFjZSBpcyBpbmZlcnJlZCB0byBiZSBNeUludGVyZmFjZS5cbiAqIGBgYFxuICpcbiAqIFdoZW4gY3JlYXRpbmcgYW4gYEluamVjdGlvblRva2VuYCwgeW91IGNhbiBvcHRpb25hbGx5IHNwZWNpZnkgYSBmYWN0b3J5IGZ1bmN0aW9uIHdoaWNoIHJldHVybnNcbiAqIChwb3NzaWJseSBieSBjcmVhdGluZykgYSBkZWZhdWx0IHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXJpemVkIHR5cGUgYFRgLiBUaGlzIHNldHMgdXAgdGhlXG4gKiBgSW5qZWN0aW9uVG9rZW5gIHVzaW5nIHRoaXMgZmFjdG9yeSBhcyBhIHByb3ZpZGVyIGFzIGlmIGl0IHdhcyBkZWZpbmVkIGV4cGxpY2l0bHkgaW4gdGhlXG4gKiBhcHBsaWNhdGlvbidzIHJvb3QgaW5qZWN0b3IuIElmIHRoZSBmYWN0b3J5IGZ1bmN0aW9uLCB3aGljaCB0YWtlcyB6ZXJvIGFyZ3VtZW50cywgbmVlZHMgdG8gaW5qZWN0XG4gKiBkZXBlbmRlbmNpZXMsIGl0IGNhbiBkbyBzbyB1c2luZyB0aGUgYGluamVjdGAgZnVuY3Rpb24uIFNlZSBiZWxvdyBmb3IgYW4gZXhhbXBsZS5cbiAqXG4gKiBBZGRpdGlvbmFsbHksIGlmIGEgYGZhY3RvcnlgIGlzIHNwZWNpZmllZCB5b3UgY2FuIGFsc28gc3BlY2lmeSB0aGUgYHByb3ZpZGVkSW5gIG9wdGlvbiwgd2hpY2hcbiAqIG92ZXJyaWRlcyB0aGUgYWJvdmUgYmVoYXZpb3IgYW5kIG1hcmtzIHRoZSB0b2tlbiBhcyBiZWxvbmdpbmcgdG8gYSBwYXJ0aWN1bGFyIGBATmdNb2R1bGVgLiBBc1xuICogbWVudGlvbmVkIGFib3ZlLCBgJ3Jvb3QnYCBpcyB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgYHByb3ZpZGVkSW5gLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgQmFzaWMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2RpL3RzL2luamVjdG9yX3NwZWMudHMgcmVnaW9uPSdJbmplY3Rpb25Ub2tlbid9XG4gKlxuICogIyMjIFRyZWUtc2hha2VhYmxlIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9kaS90cy9pbmplY3Rvcl9zcGVjLnRzIHJlZ2lvbj0nU2hha2VhYmxlSW5qZWN0aW9uVG9rZW4nfVxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIEluamVjdGlvblRva2VuPFQ+IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICByZWFkb25seSBuZ01ldGFkYXRhTmFtZSA9ICdJbmplY3Rpb25Ub2tlbic7XG5cbiAgcmVhZG9ubHkgbmdJbmplY3RhYmxlRGVmOiBuZXZlcnx1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIF9kZXNjOiBzdHJpbmcsIG9wdGlvbnM/OiB7XG4gICAgcHJvdmlkZWRJbj86IFR5cGU8YW55PnwgJ3Jvb3QnIHwgbnVsbCxcbiAgICBmYWN0b3J5OiAoKSA9PiBUXG4gIH0pIHtcbiAgICBpZiAob3B0aW9ucyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLm5nSW5qZWN0YWJsZURlZiA9IGRlZmluZUluamVjdGFibGUoe1xuICAgICAgICBwcm92aWRlZEluOiBvcHRpb25zLnByb3ZpZGVkSW4gfHwgJ3Jvb3QnLFxuICAgICAgICBmYWN0b3J5OiBvcHRpb25zLmZhY3RvcnksXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5uZ0luamVjdGFibGVEZWYgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBJbmplY3Rpb25Ub2tlbiAke3RoaXMuX2Rlc2N9YDsgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluamVjdGFibGVEZWZUb2tlbjxUPiBleHRlbmRzIEluamVjdGlvblRva2VuPFQ+IHsgbmdJbmplY3RhYmxlRGVmOiBuZXZlcjsgfVxuIl19