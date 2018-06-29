/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { from, of } from 'rxjs';
import { concatMap, every, first, last, map, mergeMap, reduce } from 'rxjs/operators';
import { ActivationStart, ChildActivationStart } from './events';
import { equalParamsAndUrlSegments, inheritedParamsDataResolve } from './router_state';
import { andObservables, forEach, shallowEqual, wrapIntoObservable } from './utils/collection';
import { nodeChildrenAsMap } from './utils/tree';
var CanActivate = /** @class */ (function () {
    function CanActivate(path) {
        this.path = path;
        this.route = this.path[this.path.length - 1];
    }
    return CanActivate;
}());
var CanDeactivate = /** @class */ (function () {
    function CanDeactivate(component, route) {
        this.component = component;
        this.route = route;
    }
    return CanDeactivate;
}());
/**
 * This class bundles the actions involved in preactivation of a route.
 */
var PreActivation = /** @class */ (function () {
    function PreActivation(future, curr, moduleInjector, forwardEvent) {
        this.future = future;
        this.curr = curr;
        this.moduleInjector = moduleInjector;
        this.forwardEvent = forwardEvent;
        this.canActivateChecks = [];
        this.canDeactivateChecks = [];
    }
    PreActivation.prototype.initialize = function (parentContexts) {
        var futureRoot = this.future._root;
        var currRoot = this.curr ? this.curr._root : null;
        this.setupChildRouteGuards(futureRoot, currRoot, parentContexts, [futureRoot.value]);
    };
    PreActivation.prototype.checkGuards = function () {
        var _this = this;
        if (!this.isDeactivating() && !this.isActivating()) {
            return of(true);
        }
        var canDeactivate$ = this.runCanDeactivateChecks();
        return canDeactivate$.pipe(mergeMap(function (canDeactivate) { return canDeactivate ? _this.runCanActivateChecks() : of(false); }));
    };
    PreActivation.prototype.resolveData = function (paramsInheritanceStrategy) {
        var _this = this;
        if (!this.isActivating())
            return of(null);
        return from(this.canActivateChecks)
            .pipe(concatMap(function (check) { return _this.runResolve(check.route, paramsInheritanceStrategy); }), reduce(function (_, __) { return _; }));
    };
    PreActivation.prototype.isDeactivating = function () { return this.canDeactivateChecks.length !== 0; };
    PreActivation.prototype.isActivating = function () { return this.canActivateChecks.length !== 0; };
    /**
     * Iterates over child routes and calls recursive `setupRouteGuards` to get `this` instance in
     * proper state to run `checkGuards()` method.
     */
    PreActivation.prototype.setupChildRouteGuards = function (futureNode, currNode, contexts, futurePath) {
        var _this = this;
        var prevChildren = nodeChildrenAsMap(currNode);
        // Process the children of the future route
        futureNode.children.forEach(function (c) {
            _this.setupRouteGuards(c, prevChildren[c.value.outlet], contexts, futurePath.concat([c.value]));
            delete prevChildren[c.value.outlet];
        });
        // Process any children left from the current route (not active for the future route)
        forEach(prevChildren, function (v, k) {
            return _this.deactivateRouteAndItsChildren(v, contexts.getContext(k));
        });
    };
    /**
     * Iterates over child routes and calls recursive `setupRouteGuards` to get `this` instance in
     * proper state to run `checkGuards()` method.
     */
    PreActivation.prototype.setupRouteGuards = function (futureNode, currNode, parentContexts, futurePath) {
        var future = futureNode.value;
        var curr = currNode ? currNode.value : null;
        var context = parentContexts ? parentContexts.getContext(futureNode.value.outlet) : null;
        // reusing the node
        if (curr && future.routeConfig === curr.routeConfig) {
            var shouldRunGuardsAndResolvers = this.shouldRunGuardsAndResolvers(curr, future, future.routeConfig.runGuardsAndResolvers);
            if (shouldRunGuardsAndResolvers) {
                this.canActivateChecks.push(new CanActivate(futurePath));
            }
            else {
                // we need to set the data
                future.data = curr.data;
                future._resolvedData = curr._resolvedData;
            }
            // If we have a component, we need to go through an outlet.
            if (future.component) {
                this.setupChildRouteGuards(futureNode, currNode, context ? context.children : null, futurePath);
                // if we have a componentless route, we recurse but keep the same outlet map.
            }
            else {
                this.setupChildRouteGuards(futureNode, currNode, parentContexts, futurePath);
            }
            if (shouldRunGuardsAndResolvers) {
                var outlet = context.outlet;
                this.canDeactivateChecks.push(new CanDeactivate(outlet.component, curr));
            }
        }
        else {
            if (curr) {
                this.deactivateRouteAndItsChildren(currNode, context);
            }
            this.canActivateChecks.push(new CanActivate(futurePath));
            // If we have a component, we need to go through an outlet.
            if (future.component) {
                this.setupChildRouteGuards(futureNode, null, context ? context.children : null, futurePath);
                // if we have a componentless route, we recurse but keep the same outlet map.
            }
            else {
                this.setupChildRouteGuards(futureNode, null, parentContexts, futurePath);
            }
        }
    };
    PreActivation.prototype.shouldRunGuardsAndResolvers = function (curr, future, mode) {
        switch (mode) {
            case 'always':
                return true;
            case 'paramsOrQueryParamsChange':
                return !equalParamsAndUrlSegments(curr, future) ||
                    !shallowEqual(curr.queryParams, future.queryParams);
            case 'paramsChange':
            default:
                return !equalParamsAndUrlSegments(curr, future);
        }
    };
    PreActivation.prototype.deactivateRouteAndItsChildren = function (route, context) {
        var _this = this;
        var children = nodeChildrenAsMap(route);
        var r = route.value;
        forEach(children, function (node, childName) {
            if (!r.component) {
                _this.deactivateRouteAndItsChildren(node, context);
            }
            else if (context) {
                _this.deactivateRouteAndItsChildren(node, context.children.getContext(childName));
            }
            else {
                _this.deactivateRouteAndItsChildren(node, null);
            }
        });
        if (!r.component) {
            this.canDeactivateChecks.push(new CanDeactivate(null, r));
        }
        else if (context && context.outlet && context.outlet.isActivated) {
            this.canDeactivateChecks.push(new CanDeactivate(context.outlet.component, r));
        }
        else {
            this.canDeactivateChecks.push(new CanDeactivate(null, r));
        }
    };
    PreActivation.prototype.runCanDeactivateChecks = function () {
        var _this = this;
        return from(this.canDeactivateChecks)
            .pipe(mergeMap(function (check) { return _this.runCanDeactivate(check.component, check.route); }), every(function (result) { return result === true; }));
    };
    PreActivation.prototype.runCanActivateChecks = function () {
        var _this = this;
        return from(this.canActivateChecks)
            .pipe(concatMap(function (check) { return andObservables(from([
            _this.fireChildActivationStart(check.route.parent),
            _this.fireActivationStart(check.route), _this.runCanActivateChild(check.path),
            _this.runCanActivate(check.route)
        ])); }), every(function (result) { return result === true; }));
        // this.fireChildActivationStart(check.path),
    };
    /**
     * This should fire off `ActivationStart` events for each route being activated at this
     * level.
     * In other words, if you're activating `a` and `b` below, `path` will contain the
     * `ActivatedRouteSnapshot`s for both and we will fire `ActivationStart` for both. Always
     * return
     * `true` so checks continue to run.
     */
    PreActivation.prototype.fireActivationStart = function (snapshot) {
        if (snapshot !== null && this.forwardEvent) {
            this.forwardEvent(new ActivationStart(snapshot));
        }
        return of(true);
    };
    /**
     * This should fire off `ChildActivationStart` events for each route being activated at this
     * level.
     * In other words, if you're activating `a` and `b` below, `path` will contain the
     * `ActivatedRouteSnapshot`s for both and we will fire `ChildActivationStart` for both. Always
     * return
     * `true` so checks continue to run.
     */
    PreActivation.prototype.fireChildActivationStart = function (snapshot) {
        if (snapshot !== null && this.forwardEvent) {
            this.forwardEvent(new ChildActivationStart(snapshot));
        }
        return of(true);
    };
    PreActivation.prototype.runCanActivate = function (future) {
        var _this = this;
        var canActivate = future.routeConfig ? future.routeConfig.canActivate : null;
        if (!canActivate || canActivate.length === 0)
            return of(true);
        var obs = from(canActivate).pipe(map(function (c) {
            var guard = _this.getToken(c, future);
            var observable;
            if (guard.canActivate) {
                observable = wrapIntoObservable(guard.canActivate(future, _this.future));
            }
            else {
                observable = wrapIntoObservable(guard(future, _this.future));
            }
            return observable.pipe(first());
        }));
        return andObservables(obs);
    };
    PreActivation.prototype.runCanActivateChild = function (path) {
        var _this = this;
        var future = path[path.length - 1];
        var canActivateChildGuards = path.slice(0, path.length - 1)
            .reverse()
            .map(function (p) { return _this.extractCanActivateChild(p); })
            .filter(function (_) { return _ !== null; });
        return andObservables(from(canActivateChildGuards).pipe(map(function (d) {
            var obs = from(d.guards).pipe(map(function (c) {
                var guard = _this.getToken(c, d.node);
                var observable;
                if (guard.canActivateChild) {
                    observable = wrapIntoObservable(guard.canActivateChild(future, _this.future));
                }
                else {
                    observable = wrapIntoObservable(guard(future, _this.future));
                }
                return observable.pipe(first());
            }));
            return andObservables(obs);
        })));
    };
    PreActivation.prototype.extractCanActivateChild = function (p) {
        var canActivateChild = p.routeConfig ? p.routeConfig.canActivateChild : null;
        if (!canActivateChild || canActivateChild.length === 0)
            return null;
        return { node: p, guards: canActivateChild };
    };
    PreActivation.prototype.runCanDeactivate = function (component, curr) {
        var _this = this;
        var canDeactivate = curr && curr.routeConfig ? curr.routeConfig.canDeactivate : null;
        if (!canDeactivate || canDeactivate.length === 0)
            return of(true);
        var canDeactivate$ = from(canDeactivate).pipe(mergeMap(function (c) {
            var guard = _this.getToken(c, curr);
            var observable;
            if (guard.canDeactivate) {
                observable =
                    wrapIntoObservable(guard.canDeactivate(component, curr, _this.curr, _this.future));
            }
            else {
                observable = wrapIntoObservable(guard(component, curr, _this.curr, _this.future));
            }
            return observable.pipe(first());
        }));
        return canDeactivate$.pipe(every(function (result) { return result === true; }));
    };
    PreActivation.prototype.runResolve = function (future, paramsInheritanceStrategy) {
        var resolve = future._resolve;
        return this.resolveNode(resolve, future).pipe(map(function (resolvedData) {
            future._resolvedData = resolvedData;
            future.data = tslib_1.__assign({}, future.data, inheritedParamsDataResolve(future, paramsInheritanceStrategy).resolve);
            return null;
        }));
    };
    PreActivation.prototype.resolveNode = function (resolve, future) {
        var _this = this;
        var keys = Object.keys(resolve);
        if (keys.length === 0) {
            return of({});
        }
        if (keys.length === 1) {
            var key_1 = keys[0];
            return this.getResolver(resolve[key_1], future).pipe(map(function (value) {
                return _a = {}, _a[key_1] = value, _a;
                var _a;
            }));
        }
        var data = {};
        var runningResolvers$ = from(keys).pipe(mergeMap(function (key) {
            return _this.getResolver(resolve[key], future).pipe(map(function (value) {
                data[key] = value;
                return value;
            }));
        }));
        return runningResolvers$.pipe(last(), map(function () { return data; }));
    };
    PreActivation.prototype.getResolver = function (injectionToken, future) {
        var resolver = this.getToken(injectionToken, future);
        return resolver.resolve ? wrapIntoObservable(resolver.resolve(future, this.future)) :
            wrapIntoObservable(resolver(future, this.future));
    };
    PreActivation.prototype.getToken = function (token, snapshot) {
        var config = closestLoadedConfig(snapshot);
        var injector = config ? config.module.injector : this.moduleInjector;
        return injector.get(token);
    };
    return PreActivation;
}());
export { PreActivation };
function closestLoadedConfig(snapshot) {
    if (!snapshot)
        return null;
    for (var s = snapshot.parent; s; s = s.parent) {
        var route = s.routeConfig;
        if (route && route._loadedConfig)
            return route._loadedConfig;
    }
    return null;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlX2FjdGl2YXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9yb3V0ZXIvc3JjL3ByZV9hY3RpdmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFHSCxPQUFPLEVBQWEsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMzQyxPQUFPLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFHcEYsT0FBTyxFQUFDLGVBQWUsRUFBRSxvQkFBb0IsRUFBUSxNQUFNLFVBQVUsQ0FBQztBQUV0RSxPQUFPLEVBQThDLHlCQUF5QixFQUFFLDBCQUEwQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEksT0FBTyxFQUFDLGNBQWMsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLGtCQUFrQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDN0YsT0FBTyxFQUFXLGlCQUFpQixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRXpEO0lBRUUscUJBQW1CLElBQThCO1FBQTlCLFNBQUksR0FBSixJQUFJLENBQTBCO1FBQy9DLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ0gsa0JBQUM7QUFBRCxDQUFDLEFBTEQsSUFLQztBQUVEO0lBQ0UsdUJBQW1CLFNBQXNCLEVBQVMsS0FBNkI7UUFBNUQsY0FBUyxHQUFULFNBQVMsQ0FBYTtRQUFTLFVBQUssR0FBTCxLQUFLLENBQXdCO0lBQUcsQ0FBQztJQUNyRixvQkFBQztBQUFELENBQUMsQUFGRCxJQUVDO0FBRUQ7O0dBRUc7QUFDSDtJQUlFLHVCQUNZLE1BQTJCLEVBQVUsSUFBeUIsRUFDOUQsY0FBd0IsRUFBVSxZQUFtQztRQURyRSxXQUFNLEdBQU4sTUFBTSxDQUFxQjtRQUFVLFNBQUksR0FBSixJQUFJLENBQXFCO1FBQzlELG1CQUFjLEdBQWQsY0FBYyxDQUFVO1FBQVUsaUJBQVksR0FBWixZQUFZLENBQXVCO1FBTHpFLHNCQUFpQixHQUFrQixFQUFFLENBQUM7UUFDdEMsd0JBQW1CLEdBQW9CLEVBQUUsQ0FBQztJQUlrQyxDQUFDO0lBRXJGLGtDQUFVLEdBQVYsVUFBVyxjQUFzQztRQUMvQyxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNyQyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3BELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFFRCxtQ0FBVyxHQUFYO1FBQUEsaUJBT0M7UUFOQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLEVBQUUsQ0FBRSxJQUFJLENBQUMsQ0FBQztRQUNuQixDQUFDO1FBQ0QsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDckQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUMvQixVQUFDLGFBQXNCLElBQUssT0FBQSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUUsS0FBSyxDQUFDLEVBQXhELENBQXdELENBQUMsQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUFFRCxtQ0FBVyxHQUFYLFVBQVkseUJBQStDO1FBQTNELGlCQU9DO1FBTkMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFBQyxNQUFNLENBQUMsRUFBRSxDQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO2FBQzlCLElBQUksQ0FDRCxTQUFTLENBQ0wsVUFBQyxLQUFrQixJQUFLLE9BQUEsS0FBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLHlCQUF5QixDQUFDLEVBQXZELENBQXVELENBQUMsRUFDcEYsTUFBTSxDQUFDLFVBQUMsQ0FBTSxFQUFFLEVBQU8sSUFBSyxPQUFBLENBQUMsRUFBRCxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxzQ0FBYyxHQUFkLGNBQTRCLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFM0Usb0NBQVksR0FBWixjQUEwQixNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBR3ZFOzs7T0FHRztJQUNLLDZDQUFxQixHQUE3QixVQUNJLFVBQTRDLEVBQUUsUUFBK0MsRUFDN0YsUUFBcUMsRUFBRSxVQUFvQztRQUYvRSxpQkFnQkM7UUFiQyxJQUFNLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVqRCwyQ0FBMkM7UUFDM0MsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO1lBQzNCLEtBQUksQ0FBQyxnQkFBZ0IsQ0FDakIsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RSxPQUFPLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBRUgscUZBQXFGO1FBQ3JGLE9BQU8sQ0FDSCxZQUFZLEVBQUUsVUFBQyxDQUFtQyxFQUFFLENBQVM7WUFDM0MsT0FBQSxLQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLFFBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBL0QsQ0FBK0QsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFFRDs7O09BR0c7SUFDSyx3Q0FBZ0IsR0FBeEIsVUFDSSxVQUE0QyxFQUFFLFFBQTBDLEVBQ3hGLGNBQTJDLEVBQUUsVUFBb0M7UUFDbkYsSUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUNoQyxJQUFNLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUM5QyxJQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRTNGLG1CQUFtQjtRQUNuQixFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNwRCxJQUFNLDJCQUEyQixHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FDaEUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsV0FBYSxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDOUQsRUFBRSxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDM0QsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLDBCQUEwQjtnQkFDMUIsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUN4QixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDNUMsQ0FBQztZQUVELDJEQUEyRDtZQUMzRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDckIsSUFBSSxDQUFDLHFCQUFxQixDQUN0QixVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUV6RSw2RUFBNkU7WUFDL0UsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMvRSxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxJQUFNLE1BQU0sR0FBRyxPQUFTLENBQUMsTUFBUSxDQUFDO2dCQUNsQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMzRSxDQUFDO1FBQ0gsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDVCxJQUFJLENBQUMsNkJBQTZCLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3hELENBQUM7WUFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDekQsMkRBQTJEO1lBQzNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFFNUYsNkVBQTZFO1lBQy9FLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDM0UsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRU8sbURBQTJCLEdBQW5DLFVBQ0ksSUFBNEIsRUFBRSxNQUE4QixFQUM1RCxJQUFxQztRQUN2QyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2IsS0FBSyxRQUFRO2dCQUNYLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFFZCxLQUFLLDJCQUEyQjtnQkFDOUIsTUFBTSxDQUFDLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztvQkFDM0MsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFMUQsS0FBSyxjQUFjLENBQUM7WUFDcEI7Z0JBQ0UsTUFBTSxDQUFDLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELENBQUM7SUFDSCxDQUFDO0lBRU8scURBQTZCLEdBQXJDLFVBQ0ksS0FBdUMsRUFBRSxPQUEyQjtRQUR4RSxpQkFzQkM7UUFwQkMsSUFBTSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUMsSUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUV0QixPQUFPLENBQUMsUUFBUSxFQUFFLFVBQUMsSUFBc0MsRUFBRSxTQUFpQjtZQUMxRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixLQUFJLENBQUMsNkJBQTZCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3BELENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsS0FBSSxDQUFDLDZCQUE2QixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ25GLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixLQUFJLENBQUMsNkJBQTZCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pELENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNuRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEYsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RCxDQUFDO0lBQ0gsQ0FBQztJQUVPLDhDQUFzQixHQUE5QjtRQUFBLGlCQUtDO1FBSkMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUM7YUFDaEMsSUFBSSxDQUNELFFBQVEsQ0FBQyxVQUFDLEtBQW9CLElBQUssT0FBQSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQW5ELENBQW1ELENBQUMsRUFDdkYsS0FBSyxDQUFDLFVBQUMsTUFBZSxJQUFLLE9BQUEsTUFBTSxLQUFLLElBQUksRUFBZixDQUFlLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFTyw0Q0FBb0IsR0FBNUI7UUFBQSxpQkFVQztRQVRDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO2FBQzlCLElBQUksQ0FDRCxTQUFTLENBQUMsVUFBQyxLQUFrQixJQUFLLE9BQUEsY0FBYyxDQUFDLElBQUksQ0FBQztZQUMxQyxLQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDakQsS0FBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztZQUMzRSxLQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7U0FDakMsQ0FBQyxDQUFDLEVBSnFCLENBSXJCLENBQUMsRUFDZCxLQUFLLENBQUMsVUFBQyxNQUFlLElBQUssT0FBQSxNQUFNLEtBQUssSUFBSSxFQUFmLENBQWUsQ0FBQyxDQUFDLENBQUM7UUFDckQsNkNBQTZDO0lBQy9DLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ssMkNBQW1CLEdBQTNCLFVBQTRCLFFBQXFDO1FBQy9ELEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFDRCxNQUFNLENBQUMsRUFBRSxDQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ssZ0RBQXdCLEdBQWhDLFVBQWlDLFFBQXFDO1FBQ3BFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUNELE1BQU0sQ0FBQyxFQUFFLENBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUVPLHNDQUFjLEdBQXRCLFVBQXVCLE1BQThCO1FBQXJELGlCQWNDO1FBYkMsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMvRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0QsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQyxDQUFNO1lBQzVDLElBQU0sS0FBSyxHQUFHLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZDLElBQUksVUFBK0IsQ0FBQztZQUNwQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsVUFBVSxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEtBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzFFLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixVQUFVLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM5RCxDQUFDO1lBQ0QsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRU8sMkNBQW1CLEdBQTNCLFVBQTRCLElBQThCO1FBQTFELGlCQXFCQztRQXBCQyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVyQyxJQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2FBQ3pCLE9BQU8sRUFBRTthQUNULEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsRUFBL0IsQ0FBK0IsQ0FBQzthQUN6QyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLEtBQUssSUFBSSxFQUFWLENBQVUsQ0FBQyxDQUFDO1FBRTVELE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLENBQU07WUFDakUsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBTTtnQkFDekMsSUFBTSxLQUFLLEdBQUcsS0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLFVBQStCLENBQUM7Z0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEtBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUMvRSxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUM5RCxDQUFDO2dCQUNELE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLCtDQUF1QixHQUEvQixVQUFnQyxDQUF5QjtRQUV2RCxJQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMvRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixJQUFJLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3BFLE1BQU0sQ0FBQyxFQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVPLHdDQUFnQixHQUF4QixVQUF5QixTQUFzQixFQUFFLElBQTRCO1FBQTdFLGlCQWdCQztRQWRDLElBQU0sYUFBYSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3ZGLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBRSxJQUFJLENBQUMsQ0FBQztRQUNuRSxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFDLENBQU07WUFDOUQsSUFBTSxLQUFLLEdBQUcsS0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDckMsSUFBSSxVQUErQixDQUFDO1lBQ3BDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixVQUFVO29CQUNOLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFJLENBQUMsSUFBSSxFQUFFLEtBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3ZGLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixVQUFVLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSSxDQUFDLElBQUksRUFBRSxLQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNsRixDQUFDO1lBQ0QsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQUMsTUFBVyxJQUFLLE9BQUEsTUFBTSxLQUFLLElBQUksRUFBZixDQUFlLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFTyxrQ0FBVSxHQUFsQixVQUNJLE1BQThCLEVBQzlCLHlCQUErQztRQUNqRCxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUMsWUFBaUI7WUFDbEUsTUFBTSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7WUFDcEMsTUFBTSxDQUFDLElBQUksd0JBQU8sTUFBTSxDQUFDLElBQUksRUFDWCwwQkFBMEIsQ0FBQyxNQUFNLEVBQUUseUJBQXlCLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6RixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNOLENBQUM7SUFFTyxtQ0FBVyxHQUFuQixVQUFvQixPQUFvQixFQUFFLE1BQThCO1FBQXhFLGlCQW1CQztRQWxCQyxJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixNQUFNLENBQUMsRUFBRSxDQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pCLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBTSxLQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBVTtnQkFDaEUsTUFBTSxVQUFFLEdBQUMsS0FBRyxJQUFHLEtBQUssS0FBRTs7WUFDeEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNOLENBQUM7UUFDRCxJQUFNLElBQUksR0FBdUIsRUFBRSxDQUFDO1FBQ3BDLElBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBQyxHQUFXO1lBQzdELE1BQU0sQ0FBQyxLQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBVTtnQkFDaEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDbEIsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsY0FBTSxPQUFBLElBQUksRUFBSixDQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFTyxtQ0FBVyxHQUFuQixVQUFvQixjQUFtQixFQUFFLE1BQThCO1FBQ3JFLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNELGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUVPLGdDQUFRLEdBQWhCLFVBQWlCLEtBQVUsRUFBRSxRQUFnQztRQUMzRCxJQUFNLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM3QyxJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQ3ZFLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUF2VEQsSUF1VEM7O0FBR0QsNkJBQTZCLFFBQWdDO0lBQzNELEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUUzQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzlDLElBQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUM7UUFDNUIsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUM7WUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztJQUMvRCxDQUFDO0lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBmcm9tLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtjb25jYXRNYXAsIGV2ZXJ5LCBmaXJzdCwgbGFzdCwgbWFwLCBtZXJnZU1hcCwgcmVkdWNlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7TG9hZGVkUm91dGVyQ29uZmlnLCBSZXNvbHZlRGF0YSwgUnVuR3VhcmRzQW5kUmVzb2x2ZXJzfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge0FjdGl2YXRpb25TdGFydCwgQ2hpbGRBY3RpdmF0aW9uU3RhcnQsIEV2ZW50fSBmcm9tICcuL2V2ZW50cyc7XG5pbXBvcnQge0NoaWxkcmVuT3V0bGV0Q29udGV4dHMsIE91dGxldENvbnRleHR9IGZyb20gJy4vcm91dGVyX291dGxldF9jb250ZXh0JztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgUm91dGVyU3RhdGVTbmFwc2hvdCwgZXF1YWxQYXJhbXNBbmRVcmxTZWdtZW50cywgaW5oZXJpdGVkUGFyYW1zRGF0YVJlc29sdmV9IGZyb20gJy4vcm91dGVyX3N0YXRlJztcbmltcG9ydCB7YW5kT2JzZXJ2YWJsZXMsIGZvckVhY2gsIHNoYWxsb3dFcXVhbCwgd3JhcEludG9PYnNlcnZhYmxlfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtUcmVlTm9kZSwgbm9kZUNoaWxkcmVuQXNNYXB9IGZyb20gJy4vdXRpbHMvdHJlZSc7XG5cbmNsYXNzIENhbkFjdGl2YXRlIHtcbiAgcmVhZG9ubHkgcm91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3Q7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYXRoOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90W10pIHtcbiAgICB0aGlzLnJvdXRlID0gdGhpcy5wYXRoW3RoaXMucGF0aC5sZW5ndGggLSAxXTtcbiAgfVxufVxuXG5jbGFzcyBDYW5EZWFjdGl2YXRlIHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbXBvbmVudDogT2JqZWN0fG51bGwsIHB1YmxpYyByb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCkge31cbn1cblxuLyoqXG4gKiBUaGlzIGNsYXNzIGJ1bmRsZXMgdGhlIGFjdGlvbnMgaW52b2x2ZWQgaW4gcHJlYWN0aXZhdGlvbiBvZiBhIHJvdXRlLlxuICovXG5leHBvcnQgY2xhc3MgUHJlQWN0aXZhdGlvbiB7XG4gIHByaXZhdGUgY2FuQWN0aXZhdGVDaGVja3M6IENhbkFjdGl2YXRlW10gPSBbXTtcbiAgcHJpdmF0ZSBjYW5EZWFjdGl2YXRlQ2hlY2tzOiBDYW5EZWFjdGl2YXRlW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgZnV0dXJlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90LCBwcml2YXRlIGN1cnI6IFJvdXRlclN0YXRlU25hcHNob3QsXG4gICAgICBwcml2YXRlIG1vZHVsZUluamVjdG9yOiBJbmplY3RvciwgcHJpdmF0ZSBmb3J3YXJkRXZlbnQ/OiAoZXZ0OiBFdmVudCkgPT4gdm9pZCkge31cblxuICBpbml0aWFsaXplKHBhcmVudENvbnRleHRzOiBDaGlsZHJlbk91dGxldENvbnRleHRzKTogdm9pZCB7XG4gICAgY29uc3QgZnV0dXJlUm9vdCA9IHRoaXMuZnV0dXJlLl9yb290O1xuICAgIGNvbnN0IGN1cnJSb290ID0gdGhpcy5jdXJyID8gdGhpcy5jdXJyLl9yb290IDogbnVsbDtcbiAgICB0aGlzLnNldHVwQ2hpbGRSb3V0ZUd1YXJkcyhmdXR1cmVSb290LCBjdXJyUm9vdCwgcGFyZW50Q29udGV4dHMsIFtmdXR1cmVSb290LnZhbHVlXSk7XG4gIH1cblxuICBjaGVja0d1YXJkcygpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICBpZiAoIXRoaXMuaXNEZWFjdGl2YXRpbmcoKSAmJiAhdGhpcy5pc0FjdGl2YXRpbmcoKSkge1xuICAgICAgcmV0dXJuIG9mICh0cnVlKTtcbiAgICB9XG4gICAgY29uc3QgY2FuRGVhY3RpdmF0ZSQgPSB0aGlzLnJ1bkNhbkRlYWN0aXZhdGVDaGVja3MoKTtcbiAgICByZXR1cm4gY2FuRGVhY3RpdmF0ZSQucGlwZShtZXJnZU1hcChcbiAgICAgICAgKGNhbkRlYWN0aXZhdGU6IGJvb2xlYW4pID0+IGNhbkRlYWN0aXZhdGUgPyB0aGlzLnJ1bkNhbkFjdGl2YXRlQ2hlY2tzKCkgOiBvZiAoZmFsc2UpKSk7XG4gIH1cblxuICByZXNvbHZlRGF0YShwYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5OiAnZW1wdHlPbmx5J3wnYWx3YXlzJyk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgaWYgKCF0aGlzLmlzQWN0aXZhdGluZygpKSByZXR1cm4gb2YgKG51bGwpO1xuICAgIHJldHVybiBmcm9tKHRoaXMuY2FuQWN0aXZhdGVDaGVja3MpXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgICAgY29uY2F0TWFwKFxuICAgICAgICAgICAgICAgIChjaGVjazogQ2FuQWN0aXZhdGUpID0+IHRoaXMucnVuUmVzb2x2ZShjaGVjay5yb3V0ZSwgcGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSkpLFxuICAgICAgICAgICAgcmVkdWNlKChfOiBhbnksIF9fOiBhbnkpID0+IF8pKTtcbiAgfVxuXG4gIGlzRGVhY3RpdmF0aW5nKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5jYW5EZWFjdGl2YXRlQ2hlY2tzLmxlbmd0aCAhPT0gMDsgfVxuXG4gIGlzQWN0aXZhdGluZygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuY2FuQWN0aXZhdGVDaGVja3MubGVuZ3RoICE9PSAwOyB9XG5cblxuICAvKipcbiAgICogSXRlcmF0ZXMgb3ZlciBjaGlsZCByb3V0ZXMgYW5kIGNhbGxzIHJlY3Vyc2l2ZSBgc2V0dXBSb3V0ZUd1YXJkc2AgdG8gZ2V0IGB0aGlzYCBpbnN0YW5jZSBpblxuICAgKiBwcm9wZXIgc3RhdGUgdG8gcnVuIGBjaGVja0d1YXJkcygpYCBtZXRob2QuXG4gICAqL1xuICBwcml2YXRlIHNldHVwQ2hpbGRSb3V0ZUd1YXJkcyhcbiAgICAgIGZ1dHVyZU5vZGU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+LCBjdXJyTm9kZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD58bnVsbCxcbiAgICAgIGNvbnRleHRzOiBDaGlsZHJlbk91dGxldENvbnRleHRzfG51bGwsIGZ1dHVyZVBhdGg6IEFjdGl2YXRlZFJvdXRlU25hcHNob3RbXSk6IHZvaWQge1xuICAgIGNvbnN0IHByZXZDaGlsZHJlbiA9IG5vZGVDaGlsZHJlbkFzTWFwKGN1cnJOb2RlKTtcblxuICAgIC8vIFByb2Nlc3MgdGhlIGNoaWxkcmVuIG9mIHRoZSBmdXR1cmUgcm91dGVcbiAgICBmdXR1cmVOb2RlLmNoaWxkcmVuLmZvckVhY2goYyA9PiB7XG4gICAgICB0aGlzLnNldHVwUm91dGVHdWFyZHMoXG4gICAgICAgICAgYywgcHJldkNoaWxkcmVuW2MudmFsdWUub3V0bGV0XSwgY29udGV4dHMsIGZ1dHVyZVBhdGguY29uY2F0KFtjLnZhbHVlXSkpO1xuICAgICAgZGVsZXRlIHByZXZDaGlsZHJlbltjLnZhbHVlLm91dGxldF07XG4gICAgfSk7XG5cbiAgICAvLyBQcm9jZXNzIGFueSBjaGlsZHJlbiBsZWZ0IGZyb20gdGhlIGN1cnJlbnQgcm91dGUgKG5vdCBhY3RpdmUgZm9yIHRoZSBmdXR1cmUgcm91dGUpXG4gICAgZm9yRWFjaChcbiAgICAgICAgcHJldkNoaWxkcmVuLCAodjogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4sIGs6IHN0cmluZykgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWFjdGl2YXRlUm91dGVBbmRJdHNDaGlsZHJlbih2LCBjb250ZXh0cyAhLmdldENvbnRleHQoaykpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlcyBvdmVyIGNoaWxkIHJvdXRlcyBhbmQgY2FsbHMgcmVjdXJzaXZlIGBzZXR1cFJvdXRlR3VhcmRzYCB0byBnZXQgYHRoaXNgIGluc3RhbmNlIGluXG4gICAqIHByb3BlciBzdGF0ZSB0byBydW4gYGNoZWNrR3VhcmRzKClgIG1ldGhvZC5cbiAgICovXG4gIHByaXZhdGUgc2V0dXBSb3V0ZUd1YXJkcyhcbiAgICAgIGZ1dHVyZU5vZGU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+LCBjdXJyTm9kZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4sXG4gICAgICBwYXJlbnRDb250ZXh0czogQ2hpbGRyZW5PdXRsZXRDb250ZXh0c3xudWxsLCBmdXR1cmVQYXRoOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90W10pOiB2b2lkIHtcbiAgICBjb25zdCBmdXR1cmUgPSBmdXR1cmVOb2RlLnZhbHVlO1xuICAgIGNvbnN0IGN1cnIgPSBjdXJyTm9kZSA/IGN1cnJOb2RlLnZhbHVlIDogbnVsbDtcbiAgICBjb25zdCBjb250ZXh0ID0gcGFyZW50Q29udGV4dHMgPyBwYXJlbnRDb250ZXh0cy5nZXRDb250ZXh0KGZ1dHVyZU5vZGUudmFsdWUub3V0bGV0KSA6IG51bGw7XG5cbiAgICAvLyByZXVzaW5nIHRoZSBub2RlXG4gICAgaWYgKGN1cnIgJiYgZnV0dXJlLnJvdXRlQ29uZmlnID09PSBjdXJyLnJvdXRlQ29uZmlnKSB7XG4gICAgICBjb25zdCBzaG91bGRSdW5HdWFyZHNBbmRSZXNvbHZlcnMgPSB0aGlzLnNob3VsZFJ1bkd1YXJkc0FuZFJlc29sdmVycyhcbiAgICAgICAgICBjdXJyLCBmdXR1cmUsIGZ1dHVyZS5yb3V0ZUNvbmZpZyAhLnJ1bkd1YXJkc0FuZFJlc29sdmVycyk7XG4gICAgICBpZiAoc2hvdWxkUnVuR3VhcmRzQW5kUmVzb2x2ZXJzKSB7XG4gICAgICAgIHRoaXMuY2FuQWN0aXZhdGVDaGVja3MucHVzaChuZXcgQ2FuQWN0aXZhdGUoZnV0dXJlUGF0aCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gd2UgbmVlZCB0byBzZXQgdGhlIGRhdGFcbiAgICAgICAgZnV0dXJlLmRhdGEgPSBjdXJyLmRhdGE7XG4gICAgICAgIGZ1dHVyZS5fcmVzb2x2ZWREYXRhID0gY3Vyci5fcmVzb2x2ZWREYXRhO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB3ZSBoYXZlIGEgY29tcG9uZW50LCB3ZSBuZWVkIHRvIGdvIHRocm91Z2ggYW4gb3V0bGV0LlxuICAgICAgaWYgKGZ1dHVyZS5jb21wb25lbnQpIHtcbiAgICAgICAgdGhpcy5zZXR1cENoaWxkUm91dGVHdWFyZHMoXG4gICAgICAgICAgICBmdXR1cmVOb2RlLCBjdXJyTm9kZSwgY29udGV4dCA/IGNvbnRleHQuY2hpbGRyZW4gOiBudWxsLCBmdXR1cmVQYXRoKTtcblxuICAgICAgICAvLyBpZiB3ZSBoYXZlIGEgY29tcG9uZW50bGVzcyByb3V0ZSwgd2UgcmVjdXJzZSBidXQga2VlcCB0aGUgc2FtZSBvdXRsZXQgbWFwLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXR1cENoaWxkUm91dGVHdWFyZHMoZnV0dXJlTm9kZSwgY3Vyck5vZGUsIHBhcmVudENvbnRleHRzLCBmdXR1cmVQYXRoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNob3VsZFJ1bkd1YXJkc0FuZFJlc29sdmVycykge1xuICAgICAgICBjb25zdCBvdXRsZXQgPSBjb250ZXh0ICEub3V0bGV0ICE7XG4gICAgICAgIHRoaXMuY2FuRGVhY3RpdmF0ZUNoZWNrcy5wdXNoKG5ldyBDYW5EZWFjdGl2YXRlKG91dGxldC5jb21wb25lbnQsIGN1cnIpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGN1cnIpIHtcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlUm91dGVBbmRJdHNDaGlsZHJlbihjdXJyTm9kZSwgY29udGV4dCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2FuQWN0aXZhdGVDaGVja3MucHVzaChuZXcgQ2FuQWN0aXZhdGUoZnV0dXJlUGF0aCkpO1xuICAgICAgLy8gSWYgd2UgaGF2ZSBhIGNvbXBvbmVudCwgd2UgbmVlZCB0byBnbyB0aHJvdWdoIGFuIG91dGxldC5cbiAgICAgIGlmIChmdXR1cmUuY29tcG9uZW50KSB7XG4gICAgICAgIHRoaXMuc2V0dXBDaGlsZFJvdXRlR3VhcmRzKGZ1dHVyZU5vZGUsIG51bGwsIGNvbnRleHQgPyBjb250ZXh0LmNoaWxkcmVuIDogbnVsbCwgZnV0dXJlUGF0aCk7XG5cbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBhIGNvbXBvbmVudGxlc3Mgcm91dGUsIHdlIHJlY3Vyc2UgYnV0IGtlZXAgdGhlIHNhbWUgb3V0bGV0IG1hcC5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0dXBDaGlsZFJvdXRlR3VhcmRzKGZ1dHVyZU5vZGUsIG51bGwsIHBhcmVudENvbnRleHRzLCBmdXR1cmVQYXRoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNob3VsZFJ1bkd1YXJkc0FuZFJlc29sdmVycyhcbiAgICAgIGN1cnI6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIGZ1dHVyZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbiAgICAgIG1vZGU6IFJ1bkd1YXJkc0FuZFJlc29sdmVyc3x1bmRlZmluZWQpOiBib29sZWFuIHtcbiAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICAgIGNhc2UgJ2Fsd2F5cyc6XG4gICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICBjYXNlICdwYXJhbXNPclF1ZXJ5UGFyYW1zQ2hhbmdlJzpcbiAgICAgICAgcmV0dXJuICFlcXVhbFBhcmFtc0FuZFVybFNlZ21lbnRzKGN1cnIsIGZ1dHVyZSkgfHxcbiAgICAgICAgICAgICFzaGFsbG93RXF1YWwoY3Vyci5xdWVyeVBhcmFtcywgZnV0dXJlLnF1ZXJ5UGFyYW1zKTtcblxuICAgICAgY2FzZSAncGFyYW1zQ2hhbmdlJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAhZXF1YWxQYXJhbXNBbmRVcmxTZWdtZW50cyhjdXJyLCBmdXR1cmUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZGVhY3RpdmF0ZVJvdXRlQW5kSXRzQ2hpbGRyZW4oXG4gICAgICByb3V0ZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4sIGNvbnRleHQ6IE91dGxldENvbnRleHR8bnVsbCk6IHZvaWQge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZUNoaWxkcmVuQXNNYXAocm91dGUpO1xuICAgIGNvbnN0IHIgPSByb3V0ZS52YWx1ZTtcblxuICAgIGZvckVhY2goY2hpbGRyZW4sIChub2RlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PiwgY2hpbGROYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIGlmICghci5jb21wb25lbnQpIHtcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlUm91dGVBbmRJdHNDaGlsZHJlbihub2RlLCBjb250ZXh0KTtcbiAgICAgIH0gZWxzZSBpZiAoY29udGV4dCkge1xuICAgICAgICB0aGlzLmRlYWN0aXZhdGVSb3V0ZUFuZEl0c0NoaWxkcmVuKG5vZGUsIGNvbnRleHQuY2hpbGRyZW4uZ2V0Q29udGV4dChjaGlsZE5hbWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZGVhY3RpdmF0ZVJvdXRlQW5kSXRzQ2hpbGRyZW4obm9kZSwgbnVsbCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoIXIuY29tcG9uZW50KSB7XG4gICAgICB0aGlzLmNhbkRlYWN0aXZhdGVDaGVja3MucHVzaChuZXcgQ2FuRGVhY3RpdmF0ZShudWxsLCByKSk7XG4gICAgfSBlbHNlIGlmIChjb250ZXh0ICYmIGNvbnRleHQub3V0bGV0ICYmIGNvbnRleHQub3V0bGV0LmlzQWN0aXZhdGVkKSB7XG4gICAgICB0aGlzLmNhbkRlYWN0aXZhdGVDaGVja3MucHVzaChuZXcgQ2FuRGVhY3RpdmF0ZShjb250ZXh0Lm91dGxldC5jb21wb25lbnQsIHIpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYW5EZWFjdGl2YXRlQ2hlY2tzLnB1c2gobmV3IENhbkRlYWN0aXZhdGUobnVsbCwgcikpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcnVuQ2FuRGVhY3RpdmF0ZUNoZWNrcygpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gZnJvbSh0aGlzLmNhbkRlYWN0aXZhdGVDaGVja3MpXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgICAgbWVyZ2VNYXAoKGNoZWNrOiBDYW5EZWFjdGl2YXRlKSA9PiB0aGlzLnJ1bkNhbkRlYWN0aXZhdGUoY2hlY2suY29tcG9uZW50LCBjaGVjay5yb3V0ZSkpLFxuICAgICAgICAgICAgZXZlcnkoKHJlc3VsdDogYm9vbGVhbikgPT4gcmVzdWx0ID09PSB0cnVlKSk7XG4gIH1cblxuICBwcml2YXRlIHJ1bkNhbkFjdGl2YXRlQ2hlY2tzKCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBmcm9tKHRoaXMuY2FuQWN0aXZhdGVDaGVja3MpXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgICAgY29uY2F0TWFwKChjaGVjazogQ2FuQWN0aXZhdGUpID0+IGFuZE9ic2VydmFibGVzKGZyb20oW1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5maXJlQ2hpbGRBY3RpdmF0aW9uU3RhcnQoY2hlY2sucm91dGUucGFyZW50KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2YXRpb25TdGFydChjaGVjay5yb3V0ZSksIHRoaXMucnVuQ2FuQWN0aXZhdGVDaGlsZChjaGVjay5wYXRoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucnVuQ2FuQWN0aXZhdGUoY2hlY2sucm91dGUpXG4gICAgICAgICAgICAgICAgICAgICAgXSkpKSxcbiAgICAgICAgICAgIGV2ZXJ5KChyZXN1bHQ6IGJvb2xlYW4pID0+IHJlc3VsdCA9PT0gdHJ1ZSkpO1xuICAgIC8vIHRoaXMuZmlyZUNoaWxkQWN0aXZhdGlvblN0YXJ0KGNoZWNrLnBhdGgpLFxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgc2hvdWxkIGZpcmUgb2ZmIGBBY3RpdmF0aW9uU3RhcnRgIGV2ZW50cyBmb3IgZWFjaCByb3V0ZSBiZWluZyBhY3RpdmF0ZWQgYXQgdGhpc1xuICAgKiBsZXZlbC5cbiAgICogSW4gb3RoZXIgd29yZHMsIGlmIHlvdSdyZSBhY3RpdmF0aW5nIGBhYCBhbmQgYGJgIGJlbG93LCBgcGF0aGAgd2lsbCBjb250YWluIHRoZVxuICAgKiBgQWN0aXZhdGVkUm91dGVTbmFwc2hvdGBzIGZvciBib3RoIGFuZCB3ZSB3aWxsIGZpcmUgYEFjdGl2YXRpb25TdGFydGAgZm9yIGJvdGguIEFsd2F5c1xuICAgKiByZXR1cm5cbiAgICogYHRydWVgIHNvIGNoZWNrcyBjb250aW51ZSB0byBydW4uXG4gICAqL1xuICBwcml2YXRlIGZpcmVBY3RpdmF0aW9uU3RhcnQoc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3R8bnVsbCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIGlmIChzbmFwc2hvdCAhPT0gbnVsbCAmJiB0aGlzLmZvcndhcmRFdmVudCkge1xuICAgICAgdGhpcy5mb3J3YXJkRXZlbnQobmV3IEFjdGl2YXRpb25TdGFydChzbmFwc2hvdCkpO1xuICAgIH1cbiAgICByZXR1cm4gb2YgKHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgc2hvdWxkIGZpcmUgb2ZmIGBDaGlsZEFjdGl2YXRpb25TdGFydGAgZXZlbnRzIGZvciBlYWNoIHJvdXRlIGJlaW5nIGFjdGl2YXRlZCBhdCB0aGlzXG4gICAqIGxldmVsLlxuICAgKiBJbiBvdGhlciB3b3JkcywgaWYgeW91J3JlIGFjdGl2YXRpbmcgYGFgIGFuZCBgYmAgYmVsb3csIGBwYXRoYCB3aWxsIGNvbnRhaW4gdGhlXG4gICAqIGBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90YHMgZm9yIGJvdGggYW5kIHdlIHdpbGwgZmlyZSBgQ2hpbGRBY3RpdmF0aW9uU3RhcnRgIGZvciBib3RoLiBBbHdheXNcbiAgICogcmV0dXJuXG4gICAqIGB0cnVlYCBzbyBjaGVja3MgY29udGludWUgdG8gcnVuLlxuICAgKi9cbiAgcHJpdmF0ZSBmaXJlQ2hpbGRBY3RpdmF0aW9uU3RhcnQoc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3R8bnVsbCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIGlmIChzbmFwc2hvdCAhPT0gbnVsbCAmJiB0aGlzLmZvcndhcmRFdmVudCkge1xuICAgICAgdGhpcy5mb3J3YXJkRXZlbnQobmV3IENoaWxkQWN0aXZhdGlvblN0YXJ0KHNuYXBzaG90KSk7XG4gICAgfVxuICAgIHJldHVybiBvZiAodHJ1ZSk7XG4gIH1cblxuICBwcml2YXRlIHJ1bkNhbkFjdGl2YXRlKGZ1dHVyZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGNhbkFjdGl2YXRlID0gZnV0dXJlLnJvdXRlQ29uZmlnID8gZnV0dXJlLnJvdXRlQ29uZmlnLmNhbkFjdGl2YXRlIDogbnVsbDtcbiAgICBpZiAoIWNhbkFjdGl2YXRlIHx8IGNhbkFjdGl2YXRlLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG9mICh0cnVlKTtcbiAgICBjb25zdCBvYnMgPSBmcm9tKGNhbkFjdGl2YXRlKS5waXBlKG1hcCgoYzogYW55KSA9PiB7XG4gICAgICBjb25zdCBndWFyZCA9IHRoaXMuZ2V0VG9rZW4oYywgZnV0dXJlKTtcbiAgICAgIGxldCBvYnNlcnZhYmxlOiBPYnNlcnZhYmxlPGJvb2xlYW4+O1xuICAgICAgaWYgKGd1YXJkLmNhbkFjdGl2YXRlKSB7XG4gICAgICAgIG9ic2VydmFibGUgPSB3cmFwSW50b09ic2VydmFibGUoZ3VhcmQuY2FuQWN0aXZhdGUoZnV0dXJlLCB0aGlzLmZ1dHVyZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2JzZXJ2YWJsZSA9IHdyYXBJbnRvT2JzZXJ2YWJsZShndWFyZChmdXR1cmUsIHRoaXMuZnV0dXJlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JzZXJ2YWJsZS5waXBlKGZpcnN0KCkpO1xuICAgIH0pKTtcbiAgICByZXR1cm4gYW5kT2JzZXJ2YWJsZXMob2JzKTtcbiAgfVxuXG4gIHByaXZhdGUgcnVuQ2FuQWN0aXZhdGVDaGlsZChwYXRoOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90W10pOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBmdXR1cmUgPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV07XG5cbiAgICBjb25zdCBjYW5BY3RpdmF0ZUNoaWxkR3VhcmRzID0gcGF0aC5zbGljZSgwLCBwYXRoLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmV2ZXJzZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKHAgPT4gdGhpcy5leHRyYWN0Q2FuQWN0aXZhdGVDaGlsZChwKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoXyA9PiBfICE9PSBudWxsKTtcblxuICAgIHJldHVybiBhbmRPYnNlcnZhYmxlcyhmcm9tKGNhbkFjdGl2YXRlQ2hpbGRHdWFyZHMpLnBpcGUobWFwKChkOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IG9icyA9IGZyb20oZC5ndWFyZHMpLnBpcGUobWFwKChjOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgZ3VhcmQgPSB0aGlzLmdldFRva2VuKGMsIGQubm9kZSk7XG4gICAgICAgIGxldCBvYnNlcnZhYmxlOiBPYnNlcnZhYmxlPGJvb2xlYW4+O1xuICAgICAgICBpZiAoZ3VhcmQuY2FuQWN0aXZhdGVDaGlsZCkge1xuICAgICAgICAgIG9ic2VydmFibGUgPSB3cmFwSW50b09ic2VydmFibGUoZ3VhcmQuY2FuQWN0aXZhdGVDaGlsZChmdXR1cmUsIHRoaXMuZnV0dXJlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JzZXJ2YWJsZSA9IHdyYXBJbnRvT2JzZXJ2YWJsZShndWFyZChmdXR1cmUsIHRoaXMuZnV0dXJlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGUucGlwZShmaXJzdCgpKTtcbiAgICAgIH0pKTtcbiAgICAgIHJldHVybiBhbmRPYnNlcnZhYmxlcyhvYnMpO1xuICAgIH0pKSk7XG4gIH1cblxuICBwcml2YXRlIGV4dHJhY3RDYW5BY3RpdmF0ZUNoaWxkKHA6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpOlxuICAgICAge25vZGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIGd1YXJkczogYW55W119fG51bGwge1xuICAgIGNvbnN0IGNhbkFjdGl2YXRlQ2hpbGQgPSBwLnJvdXRlQ29uZmlnID8gcC5yb3V0ZUNvbmZpZy5jYW5BY3RpdmF0ZUNoaWxkIDogbnVsbDtcbiAgICBpZiAoIWNhbkFjdGl2YXRlQ2hpbGQgfHwgY2FuQWN0aXZhdGVDaGlsZC5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgIHJldHVybiB7bm9kZTogcCwgZ3VhcmRzOiBjYW5BY3RpdmF0ZUNoaWxkfTtcbiAgfVxuXG4gIHByaXZhdGUgcnVuQ2FuRGVhY3RpdmF0ZShjb21wb25lbnQ6IE9iamVjdHxudWxsLCBjdXJyOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KTpcbiAgICAgIE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGNhbkRlYWN0aXZhdGUgPSBjdXJyICYmIGN1cnIucm91dGVDb25maWcgPyBjdXJyLnJvdXRlQ29uZmlnLmNhbkRlYWN0aXZhdGUgOiBudWxsO1xuICAgIGlmICghY2FuRGVhY3RpdmF0ZSB8fCBjYW5EZWFjdGl2YXRlLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG9mICh0cnVlKTtcbiAgICBjb25zdCBjYW5EZWFjdGl2YXRlJCA9IGZyb20oY2FuRGVhY3RpdmF0ZSkucGlwZShtZXJnZU1hcCgoYzogYW55KSA9PiB7XG4gICAgICBjb25zdCBndWFyZCA9IHRoaXMuZ2V0VG9rZW4oYywgY3Vycik7XG4gICAgICBsZXQgb2JzZXJ2YWJsZTogT2JzZXJ2YWJsZTxib29sZWFuPjtcbiAgICAgIGlmIChndWFyZC5jYW5EZWFjdGl2YXRlKSB7XG4gICAgICAgIG9ic2VydmFibGUgPVxuICAgICAgICAgICAgd3JhcEludG9PYnNlcnZhYmxlKGd1YXJkLmNhbkRlYWN0aXZhdGUoY29tcG9uZW50LCBjdXJyLCB0aGlzLmN1cnIsIHRoaXMuZnV0dXJlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvYnNlcnZhYmxlID0gd3JhcEludG9PYnNlcnZhYmxlKGd1YXJkKGNvbXBvbmVudCwgY3VyciwgdGhpcy5jdXJyLCB0aGlzLmZ1dHVyZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9ic2VydmFibGUucGlwZShmaXJzdCgpKTtcbiAgICB9KSk7XG4gICAgcmV0dXJuIGNhbkRlYWN0aXZhdGUkLnBpcGUoZXZlcnkoKHJlc3VsdDogYW55KSA9PiByZXN1bHQgPT09IHRydWUpKTtcbiAgfVxuXG4gIHByaXZhdGUgcnVuUmVzb2x2ZShcbiAgICAgIGZ1dHVyZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbiAgICAgIHBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3k6ICdlbXB0eU9ubHknfCdhbHdheXMnKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCByZXNvbHZlID0gZnV0dXJlLl9yZXNvbHZlO1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVOb2RlKHJlc29sdmUsIGZ1dHVyZSkucGlwZShtYXAoKHJlc29sdmVkRGF0YTogYW55KTogYW55ID0+IHtcbiAgICAgIGZ1dHVyZS5fcmVzb2x2ZWREYXRhID0gcmVzb2x2ZWREYXRhO1xuICAgICAgZnV0dXJlLmRhdGEgPSB7Li4uZnV0dXJlLmRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAuLi5pbmhlcml0ZWRQYXJhbXNEYXRhUmVzb2x2ZShmdXR1cmUsIHBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3kpLnJlc29sdmV9O1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlTm9kZShyZXNvbHZlOiBSZXNvbHZlRGF0YSwgZnV0dXJlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMocmVzb2x2ZSk7XG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gb2YgKHt9KTtcbiAgICB9XG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAxKSB7XG4gICAgICBjb25zdCBrZXkgPSBrZXlzWzBdO1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVzb2x2ZXIocmVzb2x2ZVtrZXldLCBmdXR1cmUpLnBpcGUobWFwKCh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiB7W2tleV06IHZhbHVlfTtcbiAgICAgIH0pKTtcbiAgICB9XG4gICAgY29uc3QgZGF0YToge1trOiBzdHJpbmddOiBhbnl9ID0ge307XG4gICAgY29uc3QgcnVubmluZ1Jlc29sdmVycyQgPSBmcm9tKGtleXMpLnBpcGUobWVyZ2VNYXAoKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSZXNvbHZlcihyZXNvbHZlW2tleV0sIGZ1dHVyZSkucGlwZShtYXAoKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgZGF0YVtrZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0pKTtcbiAgICB9KSk7XG4gICAgcmV0dXJuIHJ1bm5pbmdSZXNvbHZlcnMkLnBpcGUobGFzdCgpLCBtYXAoKCkgPT4gZGF0YSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXNvbHZlcihpbmplY3Rpb25Ub2tlbjogYW55LCBmdXR1cmU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IHJlc29sdmVyID0gdGhpcy5nZXRUb2tlbihpbmplY3Rpb25Ub2tlbiwgZnV0dXJlKTtcbiAgICByZXR1cm4gcmVzb2x2ZXIucmVzb2x2ZSA/IHdyYXBJbnRvT2JzZXJ2YWJsZShyZXNvbHZlci5yZXNvbHZlKGZ1dHVyZSwgdGhpcy5mdXR1cmUpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3cmFwSW50b09ic2VydmFibGUocmVzb2x2ZXIoZnV0dXJlLCB0aGlzLmZ1dHVyZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRUb2tlbih0b2tlbjogYW55LCBzbmFwc2hvdDogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCk6IGFueSB7XG4gICAgY29uc3QgY29uZmlnID0gY2xvc2VzdExvYWRlZENvbmZpZyhzbmFwc2hvdCk7XG4gICAgY29uc3QgaW5qZWN0b3IgPSBjb25maWcgPyBjb25maWcubW9kdWxlLmluamVjdG9yIDogdGhpcy5tb2R1bGVJbmplY3RvcjtcbiAgICByZXR1cm4gaW5qZWN0b3IuZ2V0KHRva2VuKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGNsb3Nlc3RMb2FkZWRDb25maWcoc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpOiBMb2FkZWRSb3V0ZXJDb25maWd8bnVsbCB7XG4gIGlmICghc25hcHNob3QpIHJldHVybiBudWxsO1xuXG4gIGZvciAobGV0IHMgPSBzbmFwc2hvdC5wYXJlbnQ7IHM7IHMgPSBzLnBhcmVudCkge1xuICAgIGNvbnN0IHJvdXRlID0gcy5yb3V0ZUNvbmZpZztcbiAgICBpZiAocm91dGUgJiYgcm91dGUuX2xvYWRlZENvbmZpZykgcmV0dXJuIHJvdXRlLl9sb2FkZWRDb25maWc7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cbiJdfQ==