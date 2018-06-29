/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Observable, merge } from 'rxjs';
import { share } from 'rxjs/operators';
import { ErrorHandler } from '../src/error_handler';
import { scheduleMicroTask, stringify } from '../src/util';
import { isPromise } from '../src/util/lang';
import { ApplicationInitStatus } from './application_init';
import { APP_BOOTSTRAP_LISTENER, PLATFORM_INITIALIZER } from './application_tokens';
import { Console } from './console';
import { Injectable, InjectionToken, Injector } from './di';
import { CompilerFactory } from './linker/compiler';
import { ComponentFactory } from './linker/component_factory';
import { ComponentFactoryBoundToModule, ComponentFactoryResolver } from './linker/component_factory_resolver';
import { NgModuleRef } from './linker/ng_module_factory';
import { wtfCreateScope, wtfLeave } from './profile/profile';
import { Testability, TestabilityRegistry } from './testability/testability';
import { NgZone, NoopNgZone } from './zone/ng_zone';
var _devMode = true;
var _runModeLocked = false;
var _platform;
export var ALLOW_MULTIPLE_PLATFORMS = new InjectionToken('AllowMultipleToken');
/**
 * Disable Angular's development mode, which turns off assertions and other
 * checks within the framework.
 *
 * One important assertion this disables verifies that a change detection pass
 * does not result in additional changes to any bindings (also known as
 * unidirectional data flow).
 *
 *
 */
export function enableProdMode() {
    if (_runModeLocked) {
        throw new Error('Cannot enable prod mode after platform setup.');
    }
    _devMode = false;
}
/**
 * Returns whether Angular is in development mode. After called once,
 * the value is locked and won't change any more.
 *
 * By default, this is true, unless a user calls `enableProdMode` before calling this.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function isDevMode() {
    _runModeLocked = true;
    return _devMode;
}
/**
 * A token for third-party components that can register themselves with NgProbe.
 *
 * @experimental
 */
var NgProbeToken = /** @class */ (function () {
    function NgProbeToken(name, token) {
        this.name = name;
        this.token = token;
    }
    return NgProbeToken;
}());
export { NgProbeToken };
/**
 * Creates a platform.
 * Platforms have to be eagerly created via this function.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function createPlatform(injector) {
    if (_platform && !_platform.destroyed &&
        !_platform.injector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
        throw new Error('There can be only one platform. Destroy the previous one to create a new one.');
    }
    _platform = injector.get(PlatformRef);
    var inits = injector.get(PLATFORM_INITIALIZER, null);
    if (inits)
        inits.forEach(function (init) { return init(); });
    return _platform;
}
/**
 * Creates a factory for a platform
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function createPlatformFactory(parentPlatformFactory, name, providers) {
    if (providers === void 0) { providers = []; }
    var desc = "Platform: " + name;
    var marker = new InjectionToken(desc);
    return function (extraProviders) {
        if (extraProviders === void 0) { extraProviders = []; }
        var platform = getPlatform();
        if (!platform || platform.injector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
            if (parentPlatformFactory) {
                parentPlatformFactory(providers.concat(extraProviders).concat({ provide: marker, useValue: true }));
            }
            else {
                var injectedProviders = providers.concat(extraProviders).concat({ provide: marker, useValue: true });
                createPlatform(Injector.create({ providers: injectedProviders, name: desc }));
            }
        }
        return assertPlatform(marker);
    };
}
/**
 * Checks that there currently is a platform which contains the given token as a provider.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function assertPlatform(requiredToken) {
    var platform = getPlatform();
    if (!platform) {
        throw new Error('No platform exists!');
    }
    if (!platform.injector.get(requiredToken, null)) {
        throw new Error('A platform with a different configuration has been created. Please destroy it first.');
    }
    return platform;
}
/**
 * Destroy the existing platform.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function destroyPlatform() {
    if (_platform && !_platform.destroyed) {
        _platform.destroy();
    }
}
/**
 * Returns the current platform.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function getPlatform() {
    return _platform && !_platform.destroyed ? _platform : null;
}
/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when a platform is created via a platform factory
 * (e.g. {@link platformBrowser}), or explicitly by calling the {@link createPlatform} function.
 */
var PlatformRef = /** @class */ (function () {
    /** @internal */
    function PlatformRef(_injector) {
        this._injector = _injector;
        this._modules = [];
        this._destroyListeners = [];
        this._destroyed = false;
    }
    /**
     * Creates an instance of an `@NgModule` for the given platform
     * for offline compilation.
     *
     * @usageNotes
     * ### Simple Example
     *
     * ```typescript
     * my_module.ts:
     *
     * @NgModule({
     *   imports: [BrowserModule]
     * })
     * class MyModule {}
     *
     * main.ts:
     * import {MyModuleNgFactory} from './my_module.ngfactory';
     * import {platformBrowser} from '@angular/platform-browser';
     *
     * let moduleRef = platformBrowser().bootstrapModuleFactory(MyModuleNgFactory);
     * ```
     *
     * @experimental APIs related to application bootstrap are currently under review.
     */
    PlatformRef.prototype.bootstrapModuleFactory = function (moduleFactory, options) {
        var _this = this;
        // Note: We need to create the NgZone _before_ we instantiate the module,
        // as instantiating the module creates some providers eagerly.
        // So we create a mini parent injector that just contains the new NgZone and
        // pass that as parent to the NgModuleFactory.
        var ngZoneOption = options ? options.ngZone : undefined;
        var ngZone = getNgZone(ngZoneOption);
        var providers = [{ provide: NgZone, useValue: ngZone }];
        // Attention: Don't use ApplicationRef.run here,
        // as we want to be sure that all possible constructor calls are inside `ngZone.run`!
        return ngZone.run(function () {
            var ngZoneInjector = Injector.create({ providers: providers, parent: _this.injector, name: moduleFactory.moduleType.name });
            var moduleRef = moduleFactory.create(ngZoneInjector);
            var exceptionHandler = moduleRef.injector.get(ErrorHandler, null);
            if (!exceptionHandler) {
                throw new Error('No ErrorHandler. Is platform module (BrowserModule) included?');
            }
            moduleRef.onDestroy(function () { return remove(_this._modules, moduleRef); });
            ngZone.runOutsideAngular(function () { return ngZone.onError.subscribe({ next: function (error) { exceptionHandler.handleError(error); } }); });
            return _callAndReportToErrorHandler(exceptionHandler, ngZone, function () {
                var initStatus = moduleRef.injector.get(ApplicationInitStatus);
                initStatus.runInitializers();
                return initStatus.donePromise.then(function () {
                    _this._moduleDoBootstrap(moduleRef);
                    return moduleRef;
                });
            });
        });
    };
    /**
     * Creates an instance of an `@NgModule` for a given platform using the given runtime compiler.
     *
     * @usageNotes
     * ### Simple Example
     *
     * ```typescript
     * @NgModule({
     *   imports: [BrowserModule]
     * })
     * class MyModule {}
     *
     * let moduleRef = platformBrowser().bootstrapModule(MyModule);
     * ```
     *
     */
    PlatformRef.prototype.bootstrapModule = function (moduleType, compilerOptions) {
        var _this = this;
        if (compilerOptions === void 0) { compilerOptions = []; }
        var compilerFactory = this.injector.get(CompilerFactory);
        var options = optionsReducer({}, compilerOptions);
        var compiler = compilerFactory.createCompiler([options]);
        return compiler.compileModuleAsync(moduleType)
            .then(function (moduleFactory) { return _this.bootstrapModuleFactory(moduleFactory, options); });
    };
    PlatformRef.prototype._moduleDoBootstrap = function (moduleRef) {
        var appRef = moduleRef.injector.get(ApplicationRef);
        if (moduleRef._bootstrapComponents.length > 0) {
            moduleRef._bootstrapComponents.forEach(function (f) { return appRef.bootstrap(f); });
        }
        else if (moduleRef.instance.ngDoBootstrap) {
            moduleRef.instance.ngDoBootstrap(appRef);
        }
        else {
            throw new Error("The module " + stringify(moduleRef.instance.constructor) + " was bootstrapped, but it does not declare \"@NgModule.bootstrap\" components nor a \"ngDoBootstrap\" method. " +
                "Please define one of these.");
        }
        this._modules.push(moduleRef);
    };
    /**
     * Register a listener to be called when the platform is disposed.
     */
    PlatformRef.prototype.onDestroy = function (callback) { this._destroyListeners.push(callback); };
    Object.defineProperty(PlatformRef.prototype, "injector", {
        /**
         * Retrieve the platform {@link Injector}, which is the parent injector for
         * every Angular application on the page and provides singleton providers.
         */
        get: function () { return this._injector; },
        enumerable: true,
        configurable: true
    });
    /**
     * Destroy the Angular platform and all Angular applications on the page.
     */
    PlatformRef.prototype.destroy = function () {
        if (this._destroyed) {
            throw new Error('The platform has already been destroyed!');
        }
        this._modules.slice().forEach(function (module) { return module.destroy(); });
        this._destroyListeners.forEach(function (listener) { return listener(); });
        this._destroyed = true;
    };
    Object.defineProperty(PlatformRef.prototype, "destroyed", {
        get: function () { return this._destroyed; },
        enumerable: true,
        configurable: true
    });
    PlatformRef.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    PlatformRef.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return PlatformRef;
}());
export { PlatformRef };
function getNgZone(ngZoneOption) {
    var ngZone;
    if (ngZoneOption === 'noop') {
        ngZone = new NoopNgZone();
    }
    else {
        ngZone = (ngZoneOption === 'zone.js' ? undefined : ngZoneOption) ||
            new NgZone({ enableLongStackTrace: isDevMode() });
    }
    return ngZone;
}
function _callAndReportToErrorHandler(errorHandler, ngZone, callback) {
    try {
        var result = callback();
        if (isPromise(result)) {
            return result.catch(function (e) {
                ngZone.runOutsideAngular(function () { return errorHandler.handleError(e); });
                // rethrow as the exception handler might not do it
                throw e;
            });
        }
        return result;
    }
    catch (e) {
        ngZone.runOutsideAngular(function () { return errorHandler.handleError(e); });
        // rethrow as the exception handler might not do it
        throw e;
    }
}
function optionsReducer(dst, objs) {
    if (Array.isArray(objs)) {
        dst = objs.reduce(optionsReducer, dst);
    }
    else {
        dst = tslib_1.__assign({}, dst, objs);
    }
    return dst;
}
/**
 * A reference to an Angular application running on a page.
 */
var ApplicationRef = /** @class */ (function () {
    /** @internal */
    function ApplicationRef(_zone, _console, _injector, _exceptionHandler, _componentFactoryResolver, _initStatus) {
        var _this = this;
        this._zone = _zone;
        this._console = _console;
        this._injector = _injector;
        this._exceptionHandler = _exceptionHandler;
        this._componentFactoryResolver = _componentFactoryResolver;
        this._initStatus = _initStatus;
        this._bootstrapListeners = [];
        this._views = [];
        this._runningTick = false;
        this._enforceNoNewChanges = false;
        this._stable = true;
        /**
         * Get a list of component types registered to this application.
         * This list is populated even before the component is created.
         */
        this.componentTypes = [];
        /**
         * Get a list of components registered to this application.
         */
        this.components = [];
        this._enforceNoNewChanges = isDevMode();
        this._zone.onMicrotaskEmpty.subscribe({ next: function () { _this._zone.run(function () { _this.tick(); }); } });
        var isCurrentlyStable = new Observable(function (observer) {
            _this._stable = _this._zone.isStable && !_this._zone.hasPendingMacrotasks &&
                !_this._zone.hasPendingMicrotasks;
            _this._zone.runOutsideAngular(function () {
                observer.next(_this._stable);
                observer.complete();
            });
        });
        var isStable = new Observable(function (observer) {
            // Create the subscription to onStable outside the Angular Zone so that
            // the callback is run outside the Angular Zone.
            var stableSub;
            _this._zone.runOutsideAngular(function () {
                stableSub = _this._zone.onStable.subscribe(function () {
                    NgZone.assertNotInAngularZone();
                    // Check whether there are no pending macro/micro tasks in the next tick
                    // to allow for NgZone to update the state.
                    scheduleMicroTask(function () {
                        if (!_this._stable && !_this._zone.hasPendingMacrotasks &&
                            !_this._zone.hasPendingMicrotasks) {
                            _this._stable = true;
                            observer.next(true);
                        }
                    });
                });
            });
            var unstableSub = _this._zone.onUnstable.subscribe(function () {
                NgZone.assertInAngularZone();
                if (_this._stable) {
                    _this._stable = false;
                    _this._zone.runOutsideAngular(function () { observer.next(false); });
                }
            });
            return function () {
                stableSub.unsubscribe();
                unstableSub.unsubscribe();
            };
        });
        this.isStable =
            merge(isCurrentlyStable, isStable.pipe(share()));
    }
    /**
     * Bootstrap a new component at the root level of the application.
     *
     * @usageNotes
     * ### Bootstrap process
     *
     * When bootstrapping a new root component into an application, Angular mounts the
     * specified application component onto DOM elements identified by the componentType's
     * selector and kicks off automatic change detection to finish initializing the component.
     *
     * Optionally, a component can be mounted onto a DOM element that does not match the
     * componentType's selector.
     *
     * ### Example
     * {@example core/ts/platform/platform.ts region='longform'}
     */
    ApplicationRef.prototype.bootstrap = function (componentOrFactory, rootSelectorOrNode) {
        var _this = this;
        if (!this._initStatus.done) {
            throw new Error('Cannot bootstrap as there are still asynchronous initializers running. Bootstrap components in the `ngDoBootstrap` method of the root module.');
        }
        var componentFactory;
        if (componentOrFactory instanceof ComponentFactory) {
            componentFactory = componentOrFactory;
        }
        else {
            componentFactory =
                this._componentFactoryResolver.resolveComponentFactory(componentOrFactory);
        }
        this.componentTypes.push(componentFactory.componentType);
        // Create a factory associated with the current module if it's not bound to some other
        var ngModule = componentFactory instanceof ComponentFactoryBoundToModule ?
            null :
            this._injector.get(NgModuleRef);
        var selectorOrNode = rootSelectorOrNode || componentFactory.selector;
        var compRef = componentFactory.create(Injector.NULL, [], selectorOrNode, ngModule);
        compRef.onDestroy(function () { _this._unloadComponent(compRef); });
        var testability = compRef.injector.get(Testability, null);
        if (testability) {
            compRef.injector.get(TestabilityRegistry)
                .registerApplication(compRef.location.nativeElement, testability);
        }
        this._loadComponent(compRef);
        if (isDevMode()) {
            this._console.log("Angular is running in the development mode. Call enableProdMode() to enable the production mode.");
        }
        return compRef;
    };
    /**
     * Invoke this method to explicitly process change detection and its side-effects.
     *
     * In development mode, `tick()` also performs a second change detection cycle to ensure that no
     * further changes are detected. If additional changes are picked up during this second cycle,
     * bindings in the app have side-effects that cannot be resolved in a single change detection
     * pass.
     * In this case, Angular throws an error, since an Angular application can only have one change
     * detection pass during which all change detection must complete.
     */
    ApplicationRef.prototype.tick = function () {
        var _this = this;
        if (this._runningTick) {
            throw new Error('ApplicationRef.tick is called recursively');
        }
        var scope = ApplicationRef._tickScope();
        try {
            this._runningTick = true;
            this._views.forEach(function (view) { return view.detectChanges(); });
            if (this._enforceNoNewChanges) {
                this._views.forEach(function (view) { return view.checkNoChanges(); });
            }
        }
        catch (e) {
            // Attention: Don't rethrow as it could cancel subscriptions to Observables!
            this._zone.runOutsideAngular(function () { return _this._exceptionHandler.handleError(e); });
        }
        finally {
            this._runningTick = false;
            wtfLeave(scope);
        }
    };
    /**
     * Attaches a view so that it will be dirty checked.
     * The view will be automatically detached when it is destroyed.
     * This will throw if the view is already attached to a ViewContainer.
     */
    ApplicationRef.prototype.attachView = function (viewRef) {
        var view = viewRef;
        this._views.push(view);
        view.attachToAppRef(this);
    };
    /**
     * Detaches a view from dirty checking again.
     */
    ApplicationRef.prototype.detachView = function (viewRef) {
        var view = viewRef;
        remove(this._views, view);
        view.detachFromAppRef();
    };
    ApplicationRef.prototype._loadComponent = function (componentRef) {
        this.attachView(componentRef.hostView);
        this.tick();
        this.components.push(componentRef);
        // Get the listeners lazily to prevent DI cycles.
        var listeners = this._injector.get(APP_BOOTSTRAP_LISTENER, []).concat(this._bootstrapListeners);
        listeners.forEach(function (listener) { return listener(componentRef); });
    };
    ApplicationRef.prototype._unloadComponent = function (componentRef) {
        this.detachView(componentRef.hostView);
        remove(this.components, componentRef);
    };
    /** @internal */
    ApplicationRef.prototype.ngOnDestroy = function () {
        // TODO(alxhub): Dispose of the NgZone.
        this._views.slice().forEach(function (view) { return view.destroy(); });
    };
    Object.defineProperty(ApplicationRef.prototype, "viewCount", {
        /**
         * Returns the number of attached views.
         */
        get: function () { return this._views.length; },
        enumerable: true,
        configurable: true
    });
    /** @internal */
    ApplicationRef._tickScope = wtfCreateScope('ApplicationRef#tick()');
    ApplicationRef.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    ApplicationRef.ctorParameters = function () { return [
        { type: NgZone },
        { type: Console },
        { type: Injector },
        { type: ErrorHandler },
        { type: ComponentFactoryResolver },
        { type: ApplicationInitStatus }
    ]; };
    return ApplicationRef;
}());
export { ApplicationRef };
function remove(list, el) {
    var index = list.indexOf(el);
    if (index > -1) {
        list.splice(index, 1);
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25fcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvYXBwbGljYXRpb25fcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUEwQixLQUFLLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDL0QsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXJDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsU0FBUyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3pELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUUzQyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUN6RCxPQUFPLEVBQUMsc0JBQXNCLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ2xDLE9BQU8sRUFBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBaUIsTUFBTSxNQUFNLENBQUM7QUFDMUUsT0FBTyxFQUFDLGVBQWUsRUFBa0IsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQWUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRSxPQUFPLEVBQUMsNkJBQTZCLEVBQUUsd0JBQXdCLEVBQUMsTUFBTSxxQ0FBcUMsQ0FBQztBQUM1RyxPQUFPLEVBQXVDLFdBQVcsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBRTdGLE9BQU8sRUFBYSxjQUFjLEVBQUUsUUFBUSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDdkUsT0FBTyxFQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLDJC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TnZELHFCQUFxQjs7SUEraUI3QixxQkFBQztDQUFBLEFBck5ELElBcU5DO1NBcE5ZLGNBQWM7QUFzTjNCLGdCQUFtQixJQUFTLEVBQUUsRUFBSztJQUNqQyxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQy9CLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN4QixDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlciwgU3Vic2NyaXB0aW9uLCBtZXJnZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3NoYXJlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7RXJyb3JIYW5kbGVyfSBmcm9tICcuLi9zcmMvZXJyb3JfaGFuZGxlcic7XG5pbXBvcnQge3NjaGVkdWxlTWljcm9UYXNrLCBzdHJpbmdpZnl9IGZyb20gJy4uL3NyYy91dGlsJztcbmltcG9ydCB7aXNQcm9taXNlfSBmcm9tICcuLi9zcmMvdXRpbC9sYW5nJztcblxuaW1wb3J0IHtBcHBsaWNhdGlvbkluaXRTdGF0dXN9IGZyb20gJy4vYXBwbGljYXRpb25faW5pdCc7XG5pbXBvcnQge0FQUF9CT09UU1RSQVBfTElTVEVORVIsIFBMQVRGT1JNX0lOSVRJQUxJWkVSfSBmcm9tICcuL2FwcGxpY2F0aW9uX3Rva2Vucyc7XG5pbXBvcnQge0NvbnNvbGV9IGZyb20gJy4vY29uc29sZSc7XG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdGlvblRva2VuLCBJbmplY3RvciwgU3RhdGljUHJvdmlkZXJ9IGZyb20gJy4vZGknO1xuaW1wb3J0IHtDb21waWxlckZhY3RvcnksIENvbXBpbGVyT3B0aW9uc30gZnJvbSAnLi9saW5rZXIvY29tcGlsZXInO1xuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5LCBDb21wb25lbnRSZWZ9IGZyb20gJy4vbGlua2VyL2NvbXBvbmVudF9mYWN0b3J5JztcbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeUJvdW5kVG9Nb2R1bGUsIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcn0gZnJvbSAnLi9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnlfcmVzb2x2ZXInO1xuaW1wb3J0IHtJbnRlcm5hbE5nTW9kdWxlUmVmLCBOZ01vZHVsZUZhY3RvcnksIE5nTW9kdWxlUmVmfSBmcm9tICcuL2xpbmtlci9uZ19tb2R1bGVfZmFjdG9yeSc7XG5pbXBvcnQge0ludGVybmFsVmlld1JlZiwgVmlld1JlZn0gZnJvbSAnLi9saW5rZXIvdmlld19yZWYnO1xuaW1wb3J0IHtXdGZTY29wZUZuLCB3dGZDcmVhdGVTY29wZSwgd3RmTGVhdmV9IGZyb20gJy4vcHJvZmlsZS9wcm9maWxlJztcbmltcG9ydCB7VGVzdGFiaWxpdHksIFRlc3RhYmlsaXR5UmVnaXN0cnl9IGZyb20gJy4vdGVzdGFiaWxpdHkvdGVzdGFiaWxpdHknO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuL3R5cGUnO1xuaW1wb3J0IHtOZ1pvbmUsIE5vb3BOZ1pvbmV9IGZyb20gJy4vem9uZS9uZ196b25lJztcblxubGV0IF9kZXZNb2RlOiBib29sZWFuID0gdHJ1ZTtcbmxldCBfcnVuTW9kZUxvY2tlZDogYm9vbGVhbiA9IGZhbHNlO1xubGV0IF9wbGF0Zm9ybTogUGxhdGZvcm1SZWY7XG5cbmV4cG9ydCBjb25zdCBBTExPV19NVUxUSVBMRV9QTEFURk9STVMgPSBuZXcgSW5qZWN0aW9uVG9rZW48Ym9vbGVhbj4oJ0FsbG93TXVsdGlwbGVUb2tlbicpO1xuXG4vKipcbiAqIERpc2FibGUgQW5ndWxhcidzIGRldmVsb3BtZW50IG1vZGUsIHdoaWNoIHR1cm5zIG9mZiBhc3NlcnRpb25zIGFuZCBvdGhlclxuICogY2hlY2tzIHdpdGhpbiB0aGUgZnJhbWV3b3JrLlxuICpcbiAqIE9uZSBpbXBvcnRhbnQgYXNzZXJ0aW9uIHRoaXMgZGlzYWJsZXMgdmVyaWZpZXMgdGhhdCBhIGNoYW5nZSBkZXRlY3Rpb24gcGFzc1xuICogZG9lcyBub3QgcmVzdWx0IGluIGFkZGl0aW9uYWwgY2hhbmdlcyB0byBhbnkgYmluZGluZ3MgKGFsc28ga25vd24gYXNcbiAqIHVuaWRpcmVjdGlvbmFsIGRhdGEgZmxvdykuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuYWJsZVByb2RNb2RlKCk6IHZvaWQge1xuICBpZiAoX3J1bk1vZGVMb2NrZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBlbmFibGUgcHJvZCBtb2RlIGFmdGVyIHBsYXRmb3JtIHNldHVwLicpO1xuICB9XG4gIF9kZXZNb2RlID0gZmFsc2U7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIEFuZ3VsYXIgaXMgaW4gZGV2ZWxvcG1lbnQgbW9kZS4gQWZ0ZXIgY2FsbGVkIG9uY2UsXG4gKiB0aGUgdmFsdWUgaXMgbG9ja2VkIGFuZCB3b24ndCBjaGFuZ2UgYW55IG1vcmUuXG4gKlxuICogQnkgZGVmYXVsdCwgdGhpcyBpcyB0cnVlLCB1bmxlc3MgYSB1c2VyIGNhbGxzIGBlbmFibGVQcm9kTW9kZWAgYmVmb3JlIGNhbGxpbmcgdGhpcy5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFQSXMgcmVsYXRlZCB0byBhcHBsaWNhdGlvbiBib290c3RyYXAgYXJlIGN1cnJlbnRseSB1bmRlciByZXZpZXcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Rldk1vZGUoKTogYm9vbGVhbiB7XG4gIF9ydW5Nb2RlTG9ja2VkID0gdHJ1ZTtcbiAgcmV0dXJuIF9kZXZNb2RlO1xufVxuXG4vKipcbiAqIEEgdG9rZW4gZm9yIHRoaXJkLXBhcnR5IGNvbXBvbmVudHMgdGhhdCBjYW4gcmVnaXN0ZXIgdGhlbXNlbHZlcyB3aXRoIE5nUHJvYmUuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgY2xhc3MgTmdQcm9iZVRva2VuIHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHRva2VuOiBhbnkpIHt9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHBsYXRmb3JtLlxuICogUGxhdGZvcm1zIGhhdmUgdG8gYmUgZWFnZXJseSBjcmVhdGVkIHZpYSB0aGlzIGZ1bmN0aW9uLlxuICpcbiAqIEBleHBlcmltZW50YWwgQVBJcyByZWxhdGVkIHRvIGFwcGxpY2F0aW9uIGJvb3RzdHJhcCBhcmUgY3VycmVudGx5IHVuZGVyIHJldmlldy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBsYXRmb3JtKGluamVjdG9yOiBJbmplY3Rvcik6IFBsYXRmb3JtUmVmIHtcbiAgaWYgKF9wbGF0Zm9ybSAmJiAhX3BsYXRmb3JtLmRlc3Ryb3llZCAmJlxuICAgICAgIV9wbGF0Zm9ybS5pbmplY3Rvci5nZXQoQUxMT1dfTVVMVElQTEVfUExBVEZPUk1TLCBmYWxzZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdUaGVyZSBjYW4gYmUgb25seSBvbmUgcGxhdGZvcm0uIERlc3Ryb3kgdGhlIHByZXZpb3VzIG9uZSB0byBjcmVhdGUgYSBuZXcgb25lLicpO1xuICB9XG4gIF9wbGF0Zm9ybSA9IGluamVjdG9yLmdldChQbGF0Zm9ybVJlZik7XG4gIGNvbnN0IGluaXRzID0gaW5qZWN0b3IuZ2V0KFBMQVRGT1JNX0lOSVRJQUxJWkVSLCBudWxsKTtcbiAgaWYgKGluaXRzKSBpbml0cy5mb3JFYWNoKChpbml0OiBhbnkpID0+IGluaXQoKSk7XG4gIHJldHVybiBfcGxhdGZvcm07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZhY3RvcnkgZm9yIGEgcGxhdGZvcm1cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFQSXMgcmVsYXRlZCB0byBhcHBsaWNhdGlvbiBib290c3RyYXAgYXJlIGN1cnJlbnRseSB1bmRlciByZXZpZXcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQbGF0Zm9ybUZhY3RvcnkoXG4gICAgcGFyZW50UGxhdGZvcm1GYWN0b3J5OiAoKGV4dHJhUHJvdmlkZXJzPzogU3RhdGljUHJvdmlkZXJbXSkgPT4gUGxhdGZvcm1SZWYpIHwgbnVsbCxcbiAgICBuYW1lOiBzdHJpbmcsIHByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFtdKTogKGV4dHJhUHJvdmlkZXJzPzogU3RhdGljUHJvdmlkZXJbXSkgPT5cbiAgICBQbGF0Zm9ybVJlZiB7XG4gIGNvbnN0IGRlc2MgPSBgUGxhdGZvcm06ICR7bmFtZX1gO1xuICBjb25zdCBtYXJrZXIgPSBuZXcgSW5qZWN0aW9uVG9rZW4oZGVzYyk7XG4gIHJldHVybiAoZXh0cmFQcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10gPSBbXSkgPT4ge1xuICAgIGxldCBwbGF0Zm9ybSA9IGdldFBsYXRmb3JtKCk7XG4gICAgaWYgKCFwbGF0Zm9ybSB8fCBwbGF0Zm9ybS5pbmplY3Rvci5nZXQoQUxMT1dfTVVMVElQTEVfUExBVEZPUk1TLCBmYWxzZSkpIHtcbiAgICAgIGlmIChwYXJlbnRQbGF0Zm9ybUZhY3RvcnkpIHtcbiAgICAgICAgcGFyZW50UGxhdGZvcm1GYWN0b3J5KFxuICAgICAgICAgICAgcHJvdmlkZXJzLmNvbmNhdChleHRyYVByb3ZpZGVycykuY29uY2F0KHtwcm92aWRlOiBtYXJrZXIsIHVzZVZhbHVlOiB0cnVlfSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgaW5qZWN0ZWRQcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10gPVxuICAgICAgICAgICAgcHJvdmlkZXJzLmNvbmNhdChleHRyYVByb3ZpZGVycykuY29uY2F0KHtwcm92aWRlOiBtYXJrZXIsIHVzZVZhbHVlOiB0cnVlfSk7XG4gICAgICAgIGNyZWF0ZVBsYXRmb3JtKEluamVjdG9yLmNyZWF0ZSh7cHJvdmlkZXJzOiBpbmplY3RlZFByb3ZpZGVycywgbmFtZTogZGVzY30pKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFzc2VydFBsYXRmb3JtKG1hcmtlcik7XG4gIH07XG59XG5cbi8qKlxuICogQ2hlY2tzIHRoYXQgdGhlcmUgY3VycmVudGx5IGlzIGEgcGxhdGZvcm0gd2hpY2ggY29udGFpbnMgdGhlIGdpdmVuIHRva2VuIGFzIGEgcHJvdmlkZXIuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBUElzIHJlbGF0ZWQgdG8gYXBwbGljYXRpb24gYm9vdHN0cmFwIGFyZSBjdXJyZW50bHkgdW5kZXIgcmV2aWV3LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0UGxhdGZvcm0ocmVxdWlyZWRUb2tlbjogYW55KTogUGxhdGZvcm1SZWYge1xuICBjb25zdCBwbGF0Zm9ybSA9IGdldFBsYXRmb3JtKCk7XG5cbiAgaWYgKCFwbGF0Zm9ybSkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm8gcGxhdGZvcm0gZXhpc3RzIScpO1xuICB9XG5cbiAgaWYgKCFwbGF0Zm9ybS5pbmplY3Rvci5nZXQocmVxdWlyZWRUb2tlbiwgbnVsbCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdBIHBsYXRmb3JtIHdpdGggYSBkaWZmZXJlbnQgY29uZmlndXJhdGlvbiBoYXMgYmVlbiBjcmVhdGVkLiBQbGVhc2UgZGVzdHJveSBpdCBmaXJzdC4nKTtcbiAgfVxuXG4gIHJldHVybiBwbGF0Zm9ybTtcbn1cblxuLyoqXG4gKiBEZXN0cm95IHRoZSBleGlzdGluZyBwbGF0Zm9ybS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFQSXMgcmVsYXRlZCB0byBhcHBsaWNhdGlvbiBib290c3RyYXAgYXJlIGN1cnJlbnRseSB1bmRlciByZXZpZXcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXN0cm95UGxhdGZvcm0oKTogdm9pZCB7XG4gIGlmIChfcGxhdGZvcm0gJiYgIV9wbGF0Zm9ybS5kZXN0cm95ZWQpIHtcbiAgICBfcGxhdGZvcm0uZGVzdHJveSgpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudCBwbGF0Zm9ybS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFQSXMgcmVsYXRlZCB0byBhcHBsaWNhdGlvbiBib290c3RyYXAgYXJlIGN1cnJlbnRseSB1bmRlciByZXZpZXcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQbGF0Zm9ybSgpOiBQbGF0Zm9ybVJlZnxudWxsIHtcbiAgcmV0dXJuIF9wbGF0Zm9ybSAmJiAhX3BsYXRmb3JtLmRlc3Ryb3llZCA/IF9wbGF0Zm9ybSA6IG51bGw7XG59XG5cbi8qKlxuICogUHJvdmlkZXMgYWRkaXRpb25hbCBvcHRpb25zIHRvIHRoZSBib290c3RyYXBpbmcgcHJvY2Vzcy5cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJvb3RzdHJhcE9wdGlvbnMge1xuICAvKipcbiAgICogT3B0aW9uYWxseSBzcGVjaWZ5IHdoaWNoIGBOZ1pvbmVgIHNob3VsZCBiZSB1c2VkLlxuICAgKlxuICAgKiAtIFByb3ZpZGUgeW91ciBvd24gYE5nWm9uZWAgaW5zdGFuY2UuXG4gICAqIC0gYHpvbmUuanNgIC0gVXNlIGRlZmF1bHQgYE5nWm9uZWAgd2hpY2ggcmVxdWlyZXMgYFpvbmUuanNgLlxuICAgKiAtIGBub29wYCAtIFVzZSBgTm9vcE5nWm9uZWAgd2hpY2ggZG9lcyBub3RoaW5nLlxuICAgKi9cbiAgbmdab25lPzogTmdab25lfCd6b25lLmpzJ3wnbm9vcCc7XG59XG5cbi8qKlxuICogVGhlIEFuZ3VsYXIgcGxhdGZvcm0gaXMgdGhlIGVudHJ5IHBvaW50IGZvciBBbmd1bGFyIG9uIGEgd2ViIHBhZ2UuIEVhY2ggcGFnZVxuICogaGFzIGV4YWN0bHkgb25lIHBsYXRmb3JtLCBhbmQgc2VydmljZXMgKHN1Y2ggYXMgcmVmbGVjdGlvbikgd2hpY2ggYXJlIGNvbW1vblxuICogdG8gZXZlcnkgQW5ndWxhciBhcHBsaWNhdGlvbiBydW5uaW5nIG9uIHRoZSBwYWdlIGFyZSBib3VuZCBpbiBpdHMgc2NvcGUuXG4gKlxuICogQSBwYWdlJ3MgcGxhdGZvcm0gaXMgaW5pdGlhbGl6ZWQgaW1wbGljaXRseSB3aGVuIGEgcGxhdGZvcm0gaXMgY3JlYXRlZCB2aWEgYSBwbGF0Zm9ybSBmYWN0b3J5XG4gKiAoZS5nLiB7QGxpbmsgcGxhdGZvcm1Ccm93c2VyfSksIG9yIGV4cGxpY2l0bHkgYnkgY2FsbGluZyB0aGUge0BsaW5rIGNyZWF0ZVBsYXRmb3JtfSBmdW5jdGlvbi5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBsYXRmb3JtUmVmIHtcbiAgcHJpdmF0ZSBfbW9kdWxlczogTmdNb2R1bGVSZWY8YW55PltdID0gW107XG4gIHByaXZhdGUgX2Rlc3Ryb3lMaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfZGVzdHJveWVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IpIHt9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgYW4gYEBOZ01vZHVsZWAgZm9yIHRoZSBnaXZlbiBwbGF0Zm9ybVxuICAgKiBmb3Igb2ZmbGluZSBjb21waWxhdGlvbi5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIFNpbXBsZSBFeGFtcGxlXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogbXlfbW9kdWxlLnRzOlxuICAgKlxuICAgKiBATmdNb2R1bGUoe1xuICAgKiAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlXVxuICAgKiB9KVxuICAgKiBjbGFzcyBNeU1vZHVsZSB7fVxuICAgKlxuICAgKiBtYWluLnRzOlxuICAgKiBpbXBvcnQge015TW9kdWxlTmdGYWN0b3J5fSBmcm9tICcuL215X21vZHVsZS5uZ2ZhY3RvcnknO1xuICAgKiBpbXBvcnQge3BsYXRmb3JtQnJvd3Nlcn0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG4gICAqXG4gICAqIGxldCBtb2R1bGVSZWYgPSBwbGF0Zm9ybUJyb3dzZXIoKS5ib290c3RyYXBNb2R1bGVGYWN0b3J5KE15TW9kdWxlTmdGYWN0b3J5KTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBleHBlcmltZW50YWwgQVBJcyByZWxhdGVkIHRvIGFwcGxpY2F0aW9uIGJvb3RzdHJhcCBhcmUgY3VycmVudGx5IHVuZGVyIHJldmlldy5cbiAgICovXG4gIGJvb3RzdHJhcE1vZHVsZUZhY3Rvcnk8TT4obW9kdWxlRmFjdG9yeTogTmdNb2R1bGVGYWN0b3J5PE0+LCBvcHRpb25zPzogQm9vdHN0cmFwT3B0aW9ucyk6XG4gICAgICBQcm9taXNlPE5nTW9kdWxlUmVmPE0+PiB7XG4gICAgLy8gTm90ZTogV2UgbmVlZCB0byBjcmVhdGUgdGhlIE5nWm9uZSBfYmVmb3JlXyB3ZSBpbnN0YW50aWF0ZSB0aGUgbW9kdWxlLFxuICAgIC8vIGFzIGluc3RhbnRpYXRpbmcgdGhlIG1vZHVsZSBjcmVhdGVzIHNvbWUgcHJvdmlkZXJzIGVhZ2VybHkuXG4gICAgLy8gU28gd2UgY3JlYXRlIGEgbWluaSBwYXJlbnQgaW5qZWN0b3IgdGhhdCBqdXN0IGNvbnRhaW5zIHRoZSBuZXcgTmdab25lIGFuZFxuICAgIC8vIHBhc3MgdGhhdCBhcyBwYXJlbnQgdG8gdGhlIE5nTW9kdWxlRmFjdG9yeS5cbiAgICBjb25zdCBuZ1pvbmVPcHRpb24gPSBvcHRpb25zID8gb3B0aW9ucy5uZ1pvbmUgOiB1bmRlZmluZWQ7XG4gICAgY29uc3Qgbmdab25lID0gZ2V0Tmdab25lKG5nWm9uZU9wdGlvbik7XG4gICAgY29uc3QgcHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdID0gW3twcm92aWRlOiBOZ1pvbmUsIHVzZVZhbHVlOiBuZ1pvbmV9XTtcbiAgICAvLyBBdHRlbnRpb246IERvbid0IHVzZSBBcHBsaWNhdGlvblJlZi5ydW4gaGVyZSxcbiAgICAvLyBhcyB3ZSB3YW50IHRvIGJlIHN1cmUgdGhhdCBhbGwgcG9zc2libGUgY29uc3RydWN0b3IgY2FsbHMgYXJlIGluc2lkZSBgbmdab25lLnJ1bmAhXG4gICAgcmV0dXJuIG5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgY29uc3Qgbmdab25lSW5qZWN0b3IgPSBJbmplY3Rvci5jcmVhdGUoXG4gICAgICAgICAge3Byb3ZpZGVyczogcHJvdmlkZXJzLCBwYXJlbnQ6IHRoaXMuaW5qZWN0b3IsIG5hbWU6IG1vZHVsZUZhY3RvcnkubW9kdWxlVHlwZS5uYW1lfSk7XG4gICAgICBjb25zdCBtb2R1bGVSZWYgPSA8SW50ZXJuYWxOZ01vZHVsZVJlZjxNPj5tb2R1bGVGYWN0b3J5LmNyZWF0ZShuZ1pvbmVJbmplY3Rvcik7XG4gICAgICBjb25zdCBleGNlcHRpb25IYW5kbGVyOiBFcnJvckhhbmRsZXIgPSBtb2R1bGVSZWYuaW5qZWN0b3IuZ2V0KEVycm9ySGFuZGxlciwgbnVsbCk7XG4gICAgICBpZiAoIWV4Y2VwdGlvbkhhbmRsZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBFcnJvckhhbmRsZXIuIElzIHBsYXRmb3JtIG1vZHVsZSAoQnJvd3Nlck1vZHVsZSkgaW5jbHVkZWQ/Jyk7XG4gICAgICB9XG4gICAgICBtb2R1bGVSZWYub25EZXN0cm95KCgpID0+IHJlbW92ZSh0aGlzLl9tb2R1bGVzLCBtb2R1bGVSZWYpKTtcbiAgICAgIG5nWm9uZSAhLnJ1bk91dHNpZGVBbmd1bGFyKFxuICAgICAgICAgICgpID0+IG5nWm9uZSAhLm9uRXJyb3Iuc3Vic2NyaWJlKFxuICAgICAgICAgICAgICB7bmV4dDogKGVycm9yOiBhbnkpID0+IHsgZXhjZXB0aW9uSGFuZGxlci5oYW5kbGVFcnJvcihlcnJvcik7IH19KSk7XG4gICAgICByZXR1cm4gX2NhbGxBbmRSZXBvcnRUb0Vycm9ySGFuZGxlcihleGNlcHRpb25IYW5kbGVyLCBuZ1pvbmUgISwgKCkgPT4ge1xuICAgICAgICBjb25zdCBpbml0U3RhdHVzOiBBcHBsaWNhdGlvbkluaXRTdGF0dXMgPSBtb2R1bGVSZWYuaW5qZWN0b3IuZ2V0KEFwcGxpY2F0aW9uSW5pdFN0YXR1cyk7XG4gICAgICAgIGluaXRTdGF0dXMucnVuSW5pdGlhbGl6ZXJzKCk7XG4gICAgICAgIHJldHVybiBpbml0U3RhdHVzLmRvbmVQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX21vZHVsZURvQm9vdHN0cmFwKG1vZHVsZVJlZik7XG4gICAgICAgICAgcmV0dXJuIG1vZHVsZVJlZjtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGFuIGBATmdNb2R1bGVgIGZvciBhIGdpdmVuIHBsYXRmb3JtIHVzaW5nIHRoZSBnaXZlbiBydW50aW1lIGNvbXBpbGVyLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgU2ltcGxlIEV4YW1wbGVcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBATmdNb2R1bGUoe1xuICAgKiAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlXVxuICAgKiB9KVxuICAgKiBjbGFzcyBNeU1vZHVsZSB7fVxuICAgKlxuICAgKiBsZXQgbW9kdWxlUmVmID0gcGxhdGZvcm1Ccm93c2VyKCkuYm9vdHN0cmFwTW9kdWxlKE15TW9kdWxlKTtcbiAgICogYGBgXG4gICAqXG4gICAqL1xuICBib290c3RyYXBNb2R1bGU8TT4oXG4gICAgICBtb2R1bGVUeXBlOiBUeXBlPE0+LCBjb21waWxlck9wdGlvbnM6IChDb21waWxlck9wdGlvbnMmQm9vdHN0cmFwT3B0aW9ucyl8XG4gICAgICBBcnJheTxDb21waWxlck9wdGlvbnMmQm9vdHN0cmFwT3B0aW9ucz4gPSBbXSk6IFByb21pc2U8TmdNb2R1bGVSZWY8TT4+IHtcbiAgICBjb25zdCBjb21waWxlckZhY3Rvcnk6IENvbXBpbGVyRmFjdG9yeSA9IHRoaXMuaW5qZWN0b3IuZ2V0KENvbXBpbGVyRmFjdG9yeSk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbnNSZWR1Y2VyKHt9LCBjb21waWxlck9wdGlvbnMpO1xuICAgIGNvbnN0IGNvbXBpbGVyID0gY29tcGlsZXJGYWN0b3J5LmNyZWF0ZUNvbXBpbGVyKFtvcHRpb25zXSk7XG5cbiAgICByZXR1cm4gY29tcGlsZXIuY29tcGlsZU1vZHVsZUFzeW5jKG1vZHVsZVR5cGUpXG4gICAgICAgIC50aGVuKChtb2R1bGVGYWN0b3J5KSA9PiB0aGlzLmJvb3RzdHJhcE1vZHVsZUZhY3RvcnkobW9kdWxlRmFjdG9yeSwgb3B0aW9ucykpO1xuICB9XG5cbiAgcHJpdmF0ZSBfbW9kdWxlRG9Cb290c3RyYXAobW9kdWxlUmVmOiBJbnRlcm5hbE5nTW9kdWxlUmVmPGFueT4pOiB2b2lkIHtcbiAgICBjb25zdCBhcHBSZWYgPSBtb2R1bGVSZWYuaW5qZWN0b3IuZ2V0KEFwcGxpY2F0aW9uUmVmKSBhcyBBcHBsaWNhdGlvblJlZjtcbiAgICBpZiAobW9kdWxlUmVmLl9ib290c3RyYXBDb21wb25lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIG1vZHVsZVJlZi5fYm9vdHN0cmFwQ29tcG9uZW50cy5mb3JFYWNoKGYgPT4gYXBwUmVmLmJvb3RzdHJhcChmKSk7XG4gICAgfSBlbHNlIGlmIChtb2R1bGVSZWYuaW5zdGFuY2UubmdEb0Jvb3RzdHJhcCkge1xuICAgICAgbW9kdWxlUmVmLmluc3RhbmNlLm5nRG9Cb290c3RyYXAoYXBwUmVmKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBUaGUgbW9kdWxlICR7c3RyaW5naWZ5KG1vZHVsZVJlZi5pbnN0YW5jZS5jb25zdHJ1Y3Rvcil9IHdhcyBib290c3RyYXBwZWQsIGJ1dCBpdCBkb2VzIG5vdCBkZWNsYXJlIFwiQE5nTW9kdWxlLmJvb3RzdHJhcFwiIGNvbXBvbmVudHMgbm9yIGEgXCJuZ0RvQm9vdHN0cmFwXCIgbWV0aG9kLiBgICtcbiAgICAgICAgICBgUGxlYXNlIGRlZmluZSBvbmUgb2YgdGhlc2UuYCk7XG4gICAgfVxuICAgIHRoaXMuX21vZHVsZXMucHVzaChtb2R1bGVSZWYpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgbGlzdGVuZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHBsYXRmb3JtIGlzIGRpc3Bvc2VkLlxuICAgKi9cbiAgb25EZXN0cm95KGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX2Rlc3Ryb3lMaXN0ZW5lcnMucHVzaChjYWxsYmFjayk7IH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIHBsYXRmb3JtIHtAbGluayBJbmplY3Rvcn0sIHdoaWNoIGlzIHRoZSBwYXJlbnQgaW5qZWN0b3IgZm9yXG4gICAqIGV2ZXJ5IEFuZ3VsYXIgYXBwbGljYXRpb24gb24gdGhlIHBhZ2UgYW5kIHByb3ZpZGVzIHNpbmdsZXRvbiBwcm92aWRlcnMuXG4gICAqL1xuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5faW5qZWN0b3I7IH1cblxuICAvKipcbiAgICogRGVzdHJveSB0aGUgQW5ndWxhciBwbGF0Zm9ybSBhbmQgYWxsIEFuZ3VsYXIgYXBwbGljYXRpb25zIG9uIHRoZSBwYWdlLlxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBwbGF0Zm9ybSBoYXMgYWxyZWFkeSBiZWVuIGRlc3Ryb3llZCEnKTtcbiAgICB9XG4gICAgdGhpcy5fbW9kdWxlcy5zbGljZSgpLmZvckVhY2gobW9kdWxlID0+IG1vZHVsZS5kZXN0cm95KCkpO1xuICAgIHRoaXMuX2Rlc3Ryb3lMaXN0ZW5lcnMuZm9yRWFjaChsaXN0ZW5lciA9PiBsaXN0ZW5lcigpKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICB9XG5cbiAgZ2V0IGRlc3Ryb3llZCgpIHsgcmV0dXJuIHRoaXMuX2Rlc3Ryb3llZDsgfVxufVxuXG5mdW5jdGlvbiBnZXROZ1pvbmUobmdab25lT3B0aW9uPzogTmdab25lIHwgJ3pvbmUuanMnIHwgJ25vb3AnKTogTmdab25lIHtcbiAgbGV0IG5nWm9uZTogTmdab25lO1xuXG4gIGlmIChuZ1pvbmVPcHRpb24gPT09ICdub29wJykge1xuICAgIG5nWm9uZSA9IG5ldyBOb29wTmdab25lKCk7XG4gIH0gZWxzZSB7XG4gICAgbmdab25lID0gKG5nWm9uZU9wdGlvbiA9PT0gJ3pvbmUuanMnID8gdW5kZWZpbmVkIDogbmdab25lT3B0aW9uKSB8fFxuICAgICAgICBuZXcgTmdab25lKHtlbmFibGVMb25nU3RhY2tUcmFjZTogaXNEZXZNb2RlKCl9KTtcbiAgfVxuICByZXR1cm4gbmdab25lO1xufVxuXG5mdW5jdGlvbiBfY2FsbEFuZFJlcG9ydFRvRXJyb3JIYW5kbGVyKFxuICAgIGVycm9ySGFuZGxlcjogRXJyb3JIYW5kbGVyLCBuZ1pvbmU6IE5nWm9uZSwgY2FsbGJhY2s6ICgpID0+IGFueSk6IGFueSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gY2FsbGJhY2soKTtcbiAgICBpZiAoaXNQcm9taXNlKHJlc3VsdCkpIHtcbiAgICAgIHJldHVybiByZXN1bHQuY2F0Y2goKGU6IGFueSkgPT4ge1xuICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gZXJyb3JIYW5kbGVyLmhhbmRsZUVycm9yKGUpKTtcbiAgICAgICAgLy8gcmV0aHJvdyBhcyB0aGUgZXhjZXB0aW9uIGhhbmRsZXIgbWlnaHQgbm90IGRvIGl0XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIChlKSB7XG4gICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IGVycm9ySGFuZGxlci5oYW5kbGVFcnJvcihlKSk7XG4gICAgLy8gcmV0aHJvdyBhcyB0aGUgZXhjZXB0aW9uIGhhbmRsZXIgbWlnaHQgbm90IGRvIGl0XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBvcHRpb25zUmVkdWNlcjxUIGV4dGVuZHMgT2JqZWN0Pihkc3Q6IGFueSwgb2JqczogVCB8IFRbXSk6IFQge1xuICBpZiAoQXJyYXkuaXNBcnJheShvYmpzKSkge1xuICAgIGRzdCA9IG9ianMucmVkdWNlKG9wdGlvbnNSZWR1Y2VyLCBkc3QpO1xuICB9IGVsc2Uge1xuICAgIGRzdCA9IHsuLi5kc3QsIC4uLihvYmpzIGFzIGFueSl9O1xuICB9XG4gIHJldHVybiBkc3Q7XG59XG5cbi8qKlxuICogQSByZWZlcmVuY2UgdG8gYW4gQW5ndWxhciBhcHBsaWNhdGlvbiBydW5uaW5nIG9uIGEgcGFnZS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uUmVmIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX3RpY2tTY29wZTogV3RmU2NvcGVGbiA9IHd0ZkNyZWF0ZVNjb3BlKCdBcHBsaWNhdGlvblJlZiN0aWNrKCknKTtcbiAgcHJpdmF0ZSBfYm9vdHN0cmFwTGlzdGVuZXJzOiAoKGNvbXBSZWY6IENvbXBvbmVudFJlZjxhbnk+KSA9PiB2b2lkKVtdID0gW107XG4gIHByaXZhdGUgX3ZpZXdzOiBJbnRlcm5hbFZpZXdSZWZbXSA9IFtdO1xuICBwcml2YXRlIF9ydW5uaW5nVGljazogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9lbmZvcmNlTm9OZXdDaGFuZ2VzOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX3N0YWJsZSA9IHRydWU7XG5cbiAgLyoqXG4gICAqIEdldCBhIGxpc3Qgb2YgY29tcG9uZW50IHR5cGVzIHJlZ2lzdGVyZWQgdG8gdGhpcyBhcHBsaWNhdGlvbi5cbiAgICogVGhpcyBsaXN0IGlzIHBvcHVsYXRlZCBldmVuIGJlZm9yZSB0aGUgY29tcG9uZW50IGlzIGNyZWF0ZWQuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgY29tcG9uZW50VHlwZXM6IFR5cGU8YW55PltdID0gW107XG5cbiAgLyoqXG4gICAqIEdldCBhIGxpc3Qgb2YgY29tcG9uZW50cyByZWdpc3RlcmVkIHRvIHRoaXMgYXBwbGljYXRpb24uXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgY29tcG9uZW50czogQ29tcG9uZW50UmVmPGFueT5bXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIE9ic2VydmFibGUgdGhhdCBpbmRpY2F0ZXMgd2hlbiB0aGUgYXBwbGljYXRpb24gaXMgc3RhYmxlIG9yIHVuc3RhYmxlLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGlzU3RhYmxlOiBPYnNlcnZhYmxlPGJvb2xlYW4+O1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF96b25lOiBOZ1pvbmUsIHByaXZhdGUgX2NvbnNvbGU6IENvbnNvbGUsIHByaXZhdGUgX2luamVjdG9yOiBJbmplY3RvcixcbiAgICAgIHByaXZhdGUgX2V4Y2VwdGlvbkhhbmRsZXI6IEVycm9ySGFuZGxlcixcbiAgICAgIHByaXZhdGUgX2NvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgICAgcHJpdmF0ZSBfaW5pdFN0YXR1czogQXBwbGljYXRpb25Jbml0U3RhdHVzKSB7XG4gICAgdGhpcy5fZW5mb3JjZU5vTmV3Q2hhbmdlcyA9IGlzRGV2TW9kZSgpO1xuXG4gICAgdGhpcy5fem9uZS5vbk1pY3JvdGFza0VtcHR5LnN1YnNjcmliZShcbiAgICAgICAge25leHQ6ICgpID0+IHsgdGhpcy5fem9uZS5ydW4oKCkgPT4geyB0aGlzLnRpY2soKTsgfSk7IH19KTtcblxuICAgIGNvbnN0IGlzQ3VycmVudGx5U3RhYmxlID0gbmV3IE9ic2VydmFibGU8Ym9vbGVhbj4oKG9ic2VydmVyOiBPYnNlcnZlcjxib29sZWFuPikgPT4ge1xuICAgICAgdGhpcy5fc3RhYmxlID0gdGhpcy5fem9uZS5pc1N0YWJsZSAmJiAhdGhpcy5fem9uZS5oYXNQZW5kaW5nTWFjcm90YXNrcyAmJlxuICAgICAgICAgICF0aGlzLl96b25lLmhhc1BlbmRpbmdNaWNyb3Rhc2tzO1xuICAgICAgdGhpcy5fem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgIG9ic2VydmVyLm5leHQodGhpcy5fc3RhYmxlKTtcbiAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY29uc3QgaXNTdGFibGUgPSBuZXcgT2JzZXJ2YWJsZTxib29sZWFuPigob2JzZXJ2ZXI6IE9ic2VydmVyPGJvb2xlYW4+KSA9PiB7XG4gICAgICAvLyBDcmVhdGUgdGhlIHN1YnNjcmlwdGlvbiB0byBvblN0YWJsZSBvdXRzaWRlIHRoZSBBbmd1bGFyIFpvbmUgc28gdGhhdFxuICAgICAgLy8gdGhlIGNhbGxiYWNrIGlzIHJ1biBvdXRzaWRlIHRoZSBBbmd1bGFyIFpvbmUuXG4gICAgICBsZXQgc3RhYmxlU3ViOiBTdWJzY3JpcHRpb247XG4gICAgICB0aGlzLl96b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgc3RhYmxlU3ViID0gdGhpcy5fem9uZS5vblN0YWJsZS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIE5nWm9uZS5hc3NlcnROb3RJbkFuZ3VsYXJab25lKCk7XG5cbiAgICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZXJlIGFyZSBubyBwZW5kaW5nIG1hY3JvL21pY3JvIHRhc2tzIGluIHRoZSBuZXh0IHRpY2tcbiAgICAgICAgICAvLyB0byBhbGxvdyBmb3IgTmdab25lIHRvIHVwZGF0ZSB0aGUgc3RhdGUuXG4gICAgICAgICAgc2NoZWR1bGVNaWNyb1Rhc2soKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9zdGFibGUgJiYgIXRoaXMuX3pvbmUuaGFzUGVuZGluZ01hY3JvdGFza3MgJiZcbiAgICAgICAgICAgICAgICAhdGhpcy5fem9uZS5oYXNQZW5kaW5nTWljcm90YXNrcykge1xuICAgICAgICAgICAgICB0aGlzLl9zdGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCB1bnN0YWJsZVN1YjogU3Vic2NyaXB0aW9uID0gdGhpcy5fem9uZS5vblVuc3RhYmxlLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIE5nWm9uZS5hc3NlcnRJbkFuZ3VsYXJab25lKCk7XG4gICAgICAgIGlmICh0aGlzLl9zdGFibGUpIHtcbiAgICAgICAgICB0aGlzLl9zdGFibGUgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLl96b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHsgb2JzZXJ2ZXIubmV4dChmYWxzZSk7IH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgc3RhYmxlU3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIHVuc3RhYmxlU3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgKHRoaXMgYXN7aXNTdGFibGU6IE9ic2VydmFibGU8Ym9vbGVhbj59KS5pc1N0YWJsZSA9XG4gICAgICAgIG1lcmdlKGlzQ3VycmVudGx5U3RhYmxlLCBpc1N0YWJsZS5waXBlKHNoYXJlKCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCb290c3RyYXAgYSBuZXcgY29tcG9uZW50IGF0IHRoZSByb290IGxldmVsIG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEJvb3RzdHJhcCBwcm9jZXNzXG4gICAqXG4gICAqIFdoZW4gYm9vdHN0cmFwcGluZyBhIG5ldyByb290IGNvbXBvbmVudCBpbnRvIGFuIGFwcGxpY2F0aW9uLCBBbmd1bGFyIG1vdW50cyB0aGVcbiAgICogc3BlY2lmaWVkIGFwcGxpY2F0aW9uIGNvbXBvbmVudCBvbnRvIERPTSBlbGVtZW50cyBpZGVudGlmaWVkIGJ5IHRoZSBjb21wb25lbnRUeXBlJ3NcbiAgICogc2VsZWN0b3IgYW5kIGtpY2tzIG9mZiBhdXRvbWF0aWMgY2hhbmdlIGRldGVjdGlvbiB0byBmaW5pc2ggaW5pdGlhbGl6aW5nIHRoZSBjb21wb25lbnQuXG4gICAqXG4gICAqIE9wdGlvbmFsbHksIGEgY29tcG9uZW50IGNhbiBiZSBtb3VudGVkIG9udG8gYSBET00gZWxlbWVudCB0aGF0IGRvZXMgbm90IG1hdGNoIHRoZVxuICAgKiBjb21wb25lbnRUeXBlJ3Mgc2VsZWN0b3IuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqIHtAZXhhbXBsZSBjb3JlL3RzL3BsYXRmb3JtL3BsYXRmb3JtLnRzIHJlZ2lvbj0nbG9uZ2Zvcm0nfVxuICAgKi9cbiAgYm9vdHN0cmFwPEM+KGNvbXBvbmVudE9yRmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxDPnxUeXBlPEM+LCByb290U2VsZWN0b3JPck5vZGU/OiBzdHJpbmd8YW55KTpcbiAgICAgIENvbXBvbmVudFJlZjxDPiB7XG4gICAgaWYgKCF0aGlzLl9pbml0U3RhdHVzLmRvbmUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnQ2Fubm90IGJvb3RzdHJhcCBhcyB0aGVyZSBhcmUgc3RpbGwgYXN5bmNocm9ub3VzIGluaXRpYWxpemVycyBydW5uaW5nLiBCb290c3RyYXAgY29tcG9uZW50cyBpbiB0aGUgYG5nRG9Cb290c3RyYXBgIG1ldGhvZCBvZiB0aGUgcm9vdCBtb2R1bGUuJyk7XG4gICAgfVxuICAgIGxldCBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PEM+O1xuICAgIGlmIChjb21wb25lbnRPckZhY3RvcnkgaW5zdGFuY2VvZiBDb21wb25lbnRGYWN0b3J5KSB7XG4gICAgICBjb21wb25lbnRGYWN0b3J5ID0gY29tcG9uZW50T3JGYWN0b3J5O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb21wb25lbnRGYWN0b3J5ID1cbiAgICAgICAgICB0aGlzLl9jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoY29tcG9uZW50T3JGYWN0b3J5KSAhO1xuICAgIH1cbiAgICB0aGlzLmNvbXBvbmVudFR5cGVzLnB1c2goY29tcG9uZW50RmFjdG9yeS5jb21wb25lbnRUeXBlKTtcblxuICAgIC8vIENyZWF0ZSBhIGZhY3RvcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBjdXJyZW50IG1vZHVsZSBpZiBpdCdzIG5vdCBib3VuZCB0byBzb21lIG90aGVyXG4gICAgY29uc3QgbmdNb2R1bGUgPSBjb21wb25lbnRGYWN0b3J5IGluc3RhbmNlb2YgQ29tcG9uZW50RmFjdG9yeUJvdW5kVG9Nb2R1bGUgP1xuICAgICAgICBudWxsIDpcbiAgICAgICAgdGhpcy5faW5qZWN0b3IuZ2V0KE5nTW9kdWxlUmVmKTtcbiAgICBjb25zdCBzZWxlY3Rvck9yTm9kZSA9IHJvb3RTZWxlY3Rvck9yTm9kZSB8fCBjb21wb25lbnRGYWN0b3J5LnNlbGVjdG9yO1xuICAgIGNvbnN0IGNvbXBSZWYgPSBjb21wb25lbnRGYWN0b3J5LmNyZWF0ZShJbmplY3Rvci5OVUxMLCBbXSwgc2VsZWN0b3JPck5vZGUsIG5nTW9kdWxlKTtcblxuICAgIGNvbXBSZWYub25EZXN0cm95KCgpID0+IHsgdGhpcy5fdW5sb2FkQ29tcG9uZW50KGNvbXBSZWYpOyB9KTtcbiAgICBjb25zdCB0ZXN0YWJpbGl0eSA9IGNvbXBSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5LCBudWxsKTtcbiAgICBpZiAodGVzdGFiaWxpdHkpIHtcbiAgICAgIGNvbXBSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5UmVnaXN0cnkpXG4gICAgICAgICAgLnJlZ2lzdGVyQXBwbGljYXRpb24oY29tcFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50LCB0ZXN0YWJpbGl0eSk7XG4gICAgfVxuXG4gICAgdGhpcy5fbG9hZENvbXBvbmVudChjb21wUmVmKTtcbiAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgIHRoaXMuX2NvbnNvbGUubG9nKFxuICAgICAgICAgIGBBbmd1bGFyIGlzIHJ1bm5pbmcgaW4gdGhlIGRldmVsb3BtZW50IG1vZGUuIENhbGwgZW5hYmxlUHJvZE1vZGUoKSB0byBlbmFibGUgdGhlIHByb2R1Y3Rpb24gbW9kZS5gKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBSZWY7XG4gIH1cblxuICAvKipcbiAgICogSW52b2tlIHRoaXMgbWV0aG9kIHRvIGV4cGxpY2l0bHkgcHJvY2VzcyBjaGFuZ2UgZGV0ZWN0aW9uIGFuZCBpdHMgc2lkZS1lZmZlY3RzLlxuICAgKlxuICAgKiBJbiBkZXZlbG9wbWVudCBtb2RlLCBgdGljaygpYCBhbHNvIHBlcmZvcm1zIGEgc2Vjb25kIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUgdG8gZW5zdXJlIHRoYXQgbm9cbiAgICogZnVydGhlciBjaGFuZ2VzIGFyZSBkZXRlY3RlZC4gSWYgYWRkaXRpb25hbCBjaGFuZ2VzIGFyZSBwaWNrZWQgdXAgZHVyaW5nIHRoaXMgc2Vjb25kIGN5Y2xlLFxuICAgKiBiaW5kaW5ncyBpbiB0aGUgYXBwIGhhdmUgc2lkZS1lZmZlY3RzIHRoYXQgY2Fubm90IGJlIHJlc29sdmVkIGluIGEgc2luZ2xlIGNoYW5nZSBkZXRlY3Rpb25cbiAgICogcGFzcy5cbiAgICogSW4gdGhpcyBjYXNlLCBBbmd1bGFyIHRocm93cyBhbiBlcnJvciwgc2luY2UgYW4gQW5ndWxhciBhcHBsaWNhdGlvbiBjYW4gb25seSBoYXZlIG9uZSBjaGFuZ2VcbiAgICogZGV0ZWN0aW9uIHBhc3MgZHVyaW5nIHdoaWNoIGFsbCBjaGFuZ2UgZGV0ZWN0aW9uIG11c3QgY29tcGxldGUuXG4gICAqL1xuICB0aWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9ydW5uaW5nVGljaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBcHBsaWNhdGlvblJlZi50aWNrIGlzIGNhbGxlZCByZWN1cnNpdmVseScpO1xuICAgIH1cblxuICAgIGNvbnN0IHNjb3BlID0gQXBwbGljYXRpb25SZWYuX3RpY2tTY29wZSgpO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9ydW5uaW5nVGljayA9IHRydWU7XG4gICAgICB0aGlzLl92aWV3cy5mb3JFYWNoKCh2aWV3KSA9PiB2aWV3LmRldGVjdENoYW5nZXMoKSk7XG4gICAgICBpZiAodGhpcy5fZW5mb3JjZU5vTmV3Q2hhbmdlcykge1xuICAgICAgICB0aGlzLl92aWV3cy5mb3JFYWNoKCh2aWV3KSA9PiB2aWV3LmNoZWNrTm9DaGFuZ2VzKCkpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIEF0dGVudGlvbjogRG9uJ3QgcmV0aHJvdyBhcyBpdCBjb3VsZCBjYW5jZWwgc3Vic2NyaXB0aW9ucyB0byBPYnNlcnZhYmxlcyFcbiAgICAgIHRoaXMuX3pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gdGhpcy5fZXhjZXB0aW9uSGFuZGxlci5oYW5kbGVFcnJvcihlKSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuX3J1bm5pbmdUaWNrID0gZmFsc2U7XG4gICAgICB3dGZMZWF2ZShzY29wZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIGEgdmlldyBzbyB0aGF0IGl0IHdpbGwgYmUgZGlydHkgY2hlY2tlZC5cbiAgICogVGhlIHZpZXcgd2lsbCBiZSBhdXRvbWF0aWNhbGx5IGRldGFjaGVkIHdoZW4gaXQgaXMgZGVzdHJveWVkLlxuICAgKiBUaGlzIHdpbGwgdGhyb3cgaWYgdGhlIHZpZXcgaXMgYWxyZWFkeSBhdHRhY2hlZCB0byBhIFZpZXdDb250YWluZXIuXG4gICAqL1xuICBhdHRhY2hWaWV3KHZpZXdSZWY6IFZpZXdSZWYpOiB2b2lkIHtcbiAgICBjb25zdCB2aWV3ID0gKHZpZXdSZWYgYXMgSW50ZXJuYWxWaWV3UmVmKTtcbiAgICB0aGlzLl92aWV3cy5wdXNoKHZpZXcpO1xuICAgIHZpZXcuYXR0YWNoVG9BcHBSZWYodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogRGV0YWNoZXMgYSB2aWV3IGZyb20gZGlydHkgY2hlY2tpbmcgYWdhaW4uXG4gICAqL1xuICBkZXRhY2hWaWV3KHZpZXdSZWY6IFZpZXdSZWYpOiB2b2lkIHtcbiAgICBjb25zdCB2aWV3ID0gKHZpZXdSZWYgYXMgSW50ZXJuYWxWaWV3UmVmKTtcbiAgICByZW1vdmUodGhpcy5fdmlld3MsIHZpZXcpO1xuICAgIHZpZXcuZGV0YWNoRnJvbUFwcFJlZigpO1xuICB9XG5cbiAgcHJpdmF0ZSBfbG9hZENvbXBvbmVudChjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5hdHRhY2hWaWV3KGNvbXBvbmVudFJlZi5ob3N0Vmlldyk7XG4gICAgdGhpcy50aWNrKCk7XG4gICAgdGhpcy5jb21wb25lbnRzLnB1c2goY29tcG9uZW50UmVmKTtcbiAgICAvLyBHZXQgdGhlIGxpc3RlbmVycyBsYXppbHkgdG8gcHJldmVudCBESSBjeWNsZXMuXG4gICAgY29uc3QgbGlzdGVuZXJzID1cbiAgICAgICAgdGhpcy5faW5qZWN0b3IuZ2V0KEFQUF9CT09UU1RSQVBfTElTVEVORVIsIFtdKS5jb25jYXQodGhpcy5fYm9vdHN0cmFwTGlzdGVuZXJzKTtcbiAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IGxpc3RlbmVyKGNvbXBvbmVudFJlZikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdW5sb2FkQ29tcG9uZW50KGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPGFueT4pOiB2b2lkIHtcbiAgICB0aGlzLmRldGFjaFZpZXcoY29tcG9uZW50UmVmLmhvc3RWaWV3KTtcbiAgICByZW1vdmUodGhpcy5jb21wb25lbnRzLCBjb21wb25lbnRSZWYpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICAvLyBUT0RPKGFseGh1Yik6IERpc3Bvc2Ugb2YgdGhlIE5nWm9uZS5cbiAgICB0aGlzLl92aWV3cy5zbGljZSgpLmZvckVhY2goKHZpZXcpID0+IHZpZXcuZGVzdHJveSgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgYXR0YWNoZWQgdmlld3MuXG4gICAqL1xuICBnZXQgdmlld0NvdW50KCkgeyByZXR1cm4gdGhpcy5fdmlld3MubGVuZ3RoOyB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZTxUPihsaXN0OiBUW10sIGVsOiBUKTogdm9pZCB7XG4gIGNvbnN0IGluZGV4ID0gbGlzdC5pbmRleE9mKGVsKTtcbiAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICBsaXN0LnNwbGljZShpbmRleCwgMSk7XG4gIH1cbn1cbiJdfQ==