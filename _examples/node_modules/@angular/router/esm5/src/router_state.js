/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PRIMARY_OUTLET, convertToParamMap } from './shared';
import { UrlSegment, equalSegments } from './url_tree';
import { shallowEqual, shallowEqualArrays } from './utils/collection';
import { Tree, TreeNode } from './utils/tree';
/**
 * @description
 *
 * Represents the state of the router.
 *
 * RouterState is a tree of activated routes. Every node in this tree knows about the "consumed" URL
 * segments, the extracted parameters, and the resolved data.
 *
 * ### Example
 *
 * ```
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const state: RouterState = router.routerState;
 *     const root: ActivatedRoute = state.root;
 *     const child = root.firstChild;
 *     const id: Observable<string> = child.params.map(p => p.id);
 *     //...
 *   }
 * }
 * ```
 *
 * See `ActivatedRoute` for more information.
 *
 *
 */
var RouterState = /** @class */ (function (_super) {
    tslib_1.__extends(RouterState, _super);
    /** @internal */
    function RouterState(root, 
    /** The current snapshot of the router state */
    snapshot) {
        var _this = _super.call(this, root) || this;
        _this.snapshot = snapshot;
        setRouterState(_this, root);
        return _this;
    }
    RouterState.prototype.toString = function () { return this.snapshot.toString(); };
    return RouterState;
}(Tree));
export { RouterState };
export function createEmptyState(urlTree, rootComponent) {
    var snapshot = createEmptyStateSnapshot(urlTree, rootComponent);
    var emptyUrl = new BehaviorSubject([new UrlSegment('', {})]);
    var emptyParams = new BehaviorSubject({});
    var emptyData = new BehaviorSubject({});
    var emptyQueryParams = new BehaviorSubject({});
    var fragment = new BehaviorSubject('');
    var activated = new ActivatedRoute(emptyUrl, emptyParams, emptyQueryParams, fragment, emptyData, PRIMARY_OUTLET, rootComponent, snapshot.root);
    activated.snapshot = snapshot.root;
    return new RouterState(new TreeNode(activated, []), snapshot);
}
export function createEmptyStateSnapshot(urlTree, rootComponent) {
    var emptyParams = {};
    var emptyData = {};
    var emptyQueryParams = {};
    var fragment = '';
    var activated = new ActivatedRouteSnapshot([], emptyParams, emptyQueryParams, fragment, emptyData, PRIMARY_OUTLET, rootComponent, null, urlTree.root, -1, {});
    return new RouterStateSnapshot('', new TreeNode(activated, []));
}
/**
 * @description
 *
 * Contains the information about a route associated with a component loaded in an
 * outlet.  An `ActivatedRoute` can also be used to traverse the router state tree.
 *
 * ```
 * @Component({...})
 * class MyComponent {
 *   constructor(route: ActivatedRoute) {
 *     const id: Observable<string> = route.params.map(p => p.id);
 *     const url: Observable<string> = route.url.map(segments => segments.join(''));
 *     // route.data includes both `data` and `resolve`
 *     const user = route.data.map(d => d.user);
 *   }
 * }
 * ```
 *
 *
 */
var ActivatedRoute = /** @class */ (function () {
    /** @internal */
    function ActivatedRoute(
    /** An observable of the URL segments matched by this route */
    url, 
    /** An observable of the matrix parameters scoped to this route */
    params, 
    /** An observable of the query parameters shared by all the routes */
    queryParams, 
    /** An observable of the URL fragment shared by all the routes */
    fragment, 
    /** An observable of the static and resolved data of this route. */
    data, 
    /** The outlet name of the route. It's a constant */
    outlet, 
    /** The component of the route. It's a constant */
    // TODO(vsavkin): remove |string
    component, futureSnapshot) {
        this.url = url;
        this.params = params;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.data = data;
        this.outlet = outlet;
        this.component = component;
        this._futureSnapshot = futureSnapshot;
    }
    Object.defineProperty(ActivatedRoute.prototype, "routeConfig", {
        /** The configuration used to match this route */
        get: function () { return this._futureSnapshot.routeConfig; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivatedRoute.prototype, "root", {
        /** The root of the router state */
        get: function () { return this._routerState.root; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivatedRoute.prototype, "parent", {
        /** The parent of this route in the router state tree */
        get: function () { return this._routerState.parent(this); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivatedRoute.prototype, "firstChild", {
        /** The first child of this route in the router state tree */
        get: function () { return this._routerState.firstChild(this); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivatedRoute.prototype, "children", {
        /** The children of this route in the router state tree */
        get: function () { return this._routerState.children(this); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivatedRoute.prototype, "pathFromRoot", {
        /** The path from the root of the router state tree to this route */
        get: function () { return this._routerState.pathFromRoot(this); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivatedRoute.prototype, "paramMap", {
        get: function () {
            if (!this._paramMap) {
                this._paramMap = this.params.pipe(map(function (p) { return convertToParamMap(p); }));
            }
            return this._paramMap;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivatedRoute.prototype, "queryParamMap", {
        get: function () {
            if (!this._queryParamMap) {
                this._queryParamMap =
                    this.queryParams.pipe(map(function (p) { return convertToParamMap(p); }));
            }
            return this._queryParamMap;
        },
        enumerable: true,
        configurable: true
    });
    ActivatedRoute.prototype.toString = function () {
        return this.snapshot ? this.snapshot.toString() : "Future(" + this._futureSnapshot + ")";
    };
    return ActivatedRoute;
}());
export { ActivatedRoute };
/**
 * Returns the inherited params, data, and resolve for a given route.
 * By default, this only inherits values up to the nearest path-less or component-less route.
 * @internal
 */
export function inheritedParamsDataResolve(route, paramsInheritanceStrategy) {
    if (paramsInheritanceStrategy === void 0) { paramsInheritanceStrategy = 'emptyOnly'; }
    var pathFromRoot = route.pathFromRoot;
    var inheritingStartingFrom = 0;
    if (paramsInheritanceStrategy !== 'always') {
        inheritingStartingFrom = pathFromRoot.length - 1;
        while (inheritingStartingFrom >= 1) {
            var current = pathFromRoot[inheritingStartingFrom];
            var parent_1 = pathFromRoot[inheritingStartingFrom - 1];
            // current route is an empty path => inherits its parent's params and data
            if (current.routeConfig && current.routeConfig.path === '') {
                inheritingStartingFrom--;
                // parent is componentless => current route should inherit its params and data
            }
            else if (!parent_1.component) {
                inheritingStartingFrom--;
            }
            else {
                break;
            }
        }
    }
    return flattenInherited(pathFromRoot.slice(inheritingStartingFrom));
}
/** @internal */
function flattenInherited(pathFromRoot) {
    return pathFromRoot.reduce(function (res, curr) {
        var params = tslib_1.__assign({}, res.params, curr.params);
        var data = tslib_1.__assign({}, res.data, curr.data);
        var resolve = tslib_1.__assign({}, res.resolve, curr._resolvedData);
        return { params: params, data: data, resolve: resolve };
    }, { params: {}, data: {}, resolve: {} });
}
/**
 * @description
 *
 * Contains the information about a route associated with a component loaded in an
 * outlet at a particular moment in time. ActivatedRouteSnapshot can also be used to
 * traverse the router state tree.
 *
 * ```
 * @Component({templateUrl:'./my-component.html'})
 * class MyComponent {
 *   constructor(route: ActivatedRoute) {
 *     const id: string = route.snapshot.params.id;
 *     const url: string = route.snapshot.url.join('');
 *     const user = route.snapshot.data.user;
 *   }
 * }
 * ```
 *
 *
 */
var ActivatedRouteSnapshot = /** @class */ (function () {
    /** @internal */
    function ActivatedRouteSnapshot(
    /** The URL segments matched by this route */
    url, 
    /** The matrix parameters scoped to this route */
    params, 
    /** The query parameters shared by all the routes */
    queryParams, 
    /** The URL fragment shared by all the routes */
    fragment, 
    /** The static and resolved data of this route */
    data, 
    /** The outlet name of the route */
    outlet, 
    /** The component of the route */
    component, routeConfig, urlSegment, lastPathIndex, resolve) {
        this.url = url;
        this.params = params;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.data = data;
        this.outlet = outlet;
        this.component = component;
        this.routeConfig = routeConfig;
        this._urlSegment = urlSegment;
        this._lastPathIndex = lastPathIndex;
        this._resolve = resolve;
    }
    Object.defineProperty(ActivatedRouteSnapshot.prototype, "root", {
        /** The root of the router state */
        get: function () { return this._routerState.root; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivatedRouteSnapshot.prototype, "parent", {
        /** The parent of this route in the router state tree */
        get: function () { return this._routerState.parent(this); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivatedRouteSnapshot.prototype, "firstChild", {
        /** The first child of this route in the router state tree */
        get: function () { return this._routerState.firstChild(this); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivatedRouteSnapshot.prototype, "children", {
        /** The children of this route in the router state tree */
        get: function () { return this._routerState.children(this); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivatedRouteSnapshot.prototype, "pathFromRoot", {
        /** The path from the root of the router state tree to this route */
        get: function () { return this._routerState.pathFromRoot(this); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivatedRouteSnapshot.prototype, "paramMap", {
        get: function () {
            if (!this._paramMap) {
                this._paramMap = convertToParamMap(this.params);
            }
            return this._paramMap;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivatedRouteSnapshot.prototype, "queryParamMap", {
        get: function () {
            if (!this._queryParamMap) {
                this._queryParamMap = convertToParamMap(this.queryParams);
            }
            return this._queryParamMap;
        },
        enumerable: true,
        configurable: true
    });
    ActivatedRouteSnapshot.prototype.toString = function () {
        var url = this.url.map(function (segment) { return segment.toString(); }).join('/');
        var matched = this.routeConfig ? this.routeConfig.path : '';
        return "Route(url:'" + url + "', path:'" + matched + "')";
    };
    return ActivatedRouteSnapshot;
}());
export { ActivatedRouteSnapshot };
/**
 * @description
 *
 * Represents the state of the router at a moment in time.
 *
 * This is a tree of activated route snapshots. Every node in this tree knows about
 * the "consumed" URL segments, the extracted parameters, and the resolved data.
 *
 * ### Example
 *
 * ```
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const state: RouterState = router.routerState;
 *     const snapshot: RouterStateSnapshot = state.snapshot;
 *     const root: ActivatedRouteSnapshot = snapshot.root;
 *     const child = root.firstChild;
 *     const id: Observable<string> = child.params.map(p => p.id);
 *     //...
 *   }
 * }
 * ```
 *
 *
 */
var RouterStateSnapshot = /** @class */ (function (_super) {
    tslib_1.__extends(RouterStateSnapshot, _super);
    /** @internal */
    function RouterStateSnapshot(
    /** The url from which this snapshot was created */
    url, root) {
        var _this = _super.call(this, root) || this;
        _this.url = url;
        setRouterState(_this, root);
        return _this;
    }
    RouterStateSnapshot.prototype.toString = function () { return serializeNode(this._root); };
    return RouterStateSnapshot;
}(Tree));
export { RouterStateSnapshot };
function setRouterState(state, node) {
    node.value._routerState = state;
    node.children.forEach(function (c) { return setRouterState(state, c); });
}
function serializeNode(node) {
    var c = node.children.length > 0 ? " { " + node.children.map(serializeNode).join(', ') + " } " : '';
    return "" + node.value + c;
}
/**
 * The expectation is that the activate route is created with the right set of parameters.
 * So we push new values into the observables only when they are not the initial values.
 * And we detect that by checking if the snapshot field is set.
 */
export function advanceActivatedRoute(route) {
    if (route.snapshot) {
        var currentSnapshot = route.snapshot;
        var nextSnapshot = route._futureSnapshot;
        route.snapshot = nextSnapshot;
        if (!shallowEqual(currentSnapshot.queryParams, nextSnapshot.queryParams)) {
            route.queryParams.next(nextSnapshot.queryParams);
        }
        if (currentSnapshot.fragment !== nextSnapshot.fragment) {
            route.fragment.next(nextSnapshot.fragment);
        }
        if (!shallowEqual(currentSnapshot.params, nextSnapshot.params)) {
            route.params.next(nextSnapshot.params);
        }
        if (!shallowEqualArrays(currentSnapshot.url, nextSnapshot.url)) {
            route.url.next(nextSnapshot.url);
        }
        if (!shallowEqual(currentSnapshot.data, nextSnapshot.data)) {
            route.data.next(nextSnapshot.data);
        }
    }
    else {
        route.snapshot = route._futureSnapshot;
        // this is for resolved data
        route.data.next(route._futureSnapshot.data);
    }
}
export function equalParamsAndUrlSegments(a, b) {
    var equalUrlParams = shallowEqual(a.params, b.params) && equalSegments(a.url, b.url);
    var parentsMismatch = !a.parent !== !b.parent;
    return equalUrlParams && !parentsMismatch &&
        (!a.parent || equalParamsAndUrlSegments(a.parent, b.parent));
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX3N0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9yb3V0ZXJfc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUdILE9BQU8sRUFBQyxlQUFlLEVBQWEsTUFBTSxNQUFNLENBQUM7QUFDakQsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR25DLE9BQU8sRUFBQyxjQUFjLEVBQW9CLGlCQUFpQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzdFLE9BQU8sRUFBQyxVQUFVLEVBQTRCLGFBQWEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUMvRSxPQUFPLEVBQUMsWUFBWSxFQUFFLGtCQUFrQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDcEUsT0FBTyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFJNUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMEJHO0FBQ0g7SUFBaUMsdUNBQW9CO0lBQ25ELGdCQUFnQjtJQUNoQixxQkFDSSxJQUE4QjtJQUM5QiwrQ0FBK0M7SUFDeEMsUUFBNkI7UUFIeEMsWUFJRSxrQkFBTSxJQUFJLENBQUMsU0FFWjtRQUhVLGNBQVEsR0FBUixRQUFRLENBQXFCO1FBRXRDLGNBQWMsQ0FBYyxLQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7O0lBQzFDLENBQUM7SUFFRCw4QkFBUSxHQUFSLGNBQXFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6RCxrQkFBQztBQUFELENBQUMsQUFYRCxDQUFpQyxJQUFJLEdBV3BDOztBQUVELE1BQU0sMkJBQTJCLE9BQWdCLEVBQUUsYUFBOEI7SUFDL0UsSUFBTSxRQUFRLEdBQUcsd0JBQXdCLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ2xFLElBQU0sUUFBUSxHQUFHLElBQUksZUFBZSxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCxJQUFNLFdBQVcsR0FBRyxJQUFJLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1QyxJQUFNLFNBQVMsR0FBRyxJQUFJLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMxQyxJQUFNLGdCQUFnQixHQUFHLElBQUksZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELElBQU0sUUFBUSxHQUFHLElBQUksZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLElBQU0sU0FBUyxHQUFHLElBQUksY0FBYyxDQUNoQyxRQUFRLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFDM0YsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25CLFNBQVMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztJQUNuQyxNQUFNLENBQUMsSUFBSSxXQUFXLENBQUMsSUFBSSxRQUFRLENBQWlCLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNoRixDQUFDO0FBRUQsTUFBTSxtQ0FDRixPQUFnQixFQUFFLGFBQThCO0lBQ2xELElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUN2QixJQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDckIsSUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDNUIsSUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLElBQU0sU0FBUyxHQUFHLElBQUksc0JBQXNCLENBQ3hDLEVBQUUsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLElBQUksRUFDM0YsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMxQixNQUFNLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsSUFBSSxRQUFRLENBQXlCLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFGLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNIO0lBWUUsZ0JBQWdCO0lBQ2hCO0lBQ0ksOERBQThEO0lBQ3ZELEdBQTZCO0lBQ3BDLGtFQUFrRTtJQUMzRCxNQUEwQjtJQUNqQyxxRUFBcUU7SUFDOUQsV0FBK0I7SUFDdEMsaUVBQWlFO0lBQzFELFFBQTRCO0lBQ25DLG1FQUFtRTtJQUM1RCxJQUFzQjtJQUM3QixvREFBb0Q7SUFDN0MsTUFBYztJQUNyQixrREFBa0Q7SUFDbEQsZ0NBQWdDO0lBQ3pCLFNBQWdDLEVBQUUsY0FBc0M7UUFieEUsUUFBRyxHQUFILEdBQUcsQ0FBMEI7UUFFN0IsV0FBTSxHQUFOLE1BQU0sQ0FBb0I7UUFFMUIsZ0JBQVcsR0FBWCxXQUFXLENBQW9CO1FBRS9CLGFBQVEsR0FBUixRQUFRLENBQW9CO1FBRTVCLFNBQUksR0FBSixJQUFJLENBQWtCO1FBRXRCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFHZCxjQUFTLEdBQVQsU0FBUyxDQUF1QjtRQUN6QyxJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztJQUN4QyxDQUFDO0lBR0Qsc0JBQUksdUNBQVc7UUFEZixpREFBaUQ7YUFDakQsY0FBZ0MsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFHMUUsc0JBQUksZ0NBQUk7UUFEUixtQ0FBbUM7YUFDbkMsY0FBNkIsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFHN0Qsc0JBQUksa0NBQU07UUFEVix3REFBd0Q7YUFDeEQsY0FBb0MsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFHNUUsc0JBQUksc0NBQVU7UUFEZCw2REFBNkQ7YUFDN0QsY0FBd0MsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFHcEYsc0JBQUksb0NBQVE7UUFEWiwwREFBMEQ7YUFDMUQsY0FBbUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFHN0Usc0JBQUksd0NBQVk7UUFEaEIsb0VBQW9FO2FBQ3BFLGNBQXVDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRXJGLHNCQUFJLG9DQUFRO2FBQVo7WUFDRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLENBQVMsSUFBZSxPQUFBLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFwQixDQUFvQixDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDeEIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSx5Q0FBYTthQUFqQjtZQUNFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxjQUFjO29CQUNmLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLENBQVMsSUFBZSxPQUFBLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFwQixDQUFvQixDQUFDLENBQUMsQ0FBQztZQUNoRixDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDN0IsQ0FBQzs7O09BQUE7SUFFRCxpQ0FBUSxHQUFSO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVUsSUFBSSxDQUFDLGVBQWUsTUFBRyxDQUFDO0lBQ3RGLENBQUM7SUFDSCxxQkFBQztBQUFELENBQUMsQUFwRUQsSUFvRUM7O0FBV0Q7Ozs7R0FJRztBQUNILE1BQU0scUNBQ0YsS0FBNkIsRUFDN0IseUJBQWtFO0lBQWxFLDBDQUFBLEVBQUEsdUNBQWtFO0lBQ3BFLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7SUFFeEMsSUFBSSxzQkFBc0IsR0FBRyxDQUFDLENBQUM7SUFDL0IsRUFBRSxDQUFDLENBQUMseUJBQXlCLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMzQyxzQkFBc0IsR0FBRyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUVqRCxPQUFPLHNCQUFzQixJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ25DLElBQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ3JELElBQU0sUUFBTSxHQUFHLFlBQVksQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN4RCwwRUFBMEU7WUFDMUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMzRCxzQkFBc0IsRUFBRSxDQUFDO2dCQUV6Qiw4RUFBOEU7WUFDaEYsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixzQkFBc0IsRUFBRSxDQUFDO1lBRTNCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixLQUFLLENBQUM7WUFDUixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7QUFDdEUsQ0FBQztBQUVELGdCQUFnQjtBQUNoQiwwQkFBMEIsWUFBc0M7SUFDOUQsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsVUFBQyxHQUFHLEVBQUUsSUFBSTtRQUNuQyxJQUFNLE1BQU0sd0JBQU8sR0FBRyxDQUFDLE1BQU0sRUFBSyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0MsSUFBTSxJQUFJLHdCQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pDLElBQU0sT0FBTyx3QkFBTyxHQUFHLENBQUMsT0FBTyxFQUFLLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN4RCxNQUFNLENBQUMsRUFBQyxNQUFNLFFBQUEsRUFBRSxJQUFJLE1BQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0lBQ2pDLENBQUMsRUFBTyxFQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSDtJQWtCRSxnQkFBZ0I7SUFDaEI7SUFDSSw2Q0FBNkM7SUFDdEMsR0FBaUI7SUFDeEIsaURBQWlEO0lBQzFDLE1BQWM7SUFDckIsb0RBQW9EO0lBQzdDLFdBQW1CO0lBQzFCLGdEQUFnRDtJQUN6QyxRQUFnQjtJQUN2QixpREFBaUQ7SUFDMUMsSUFBVTtJQUNqQixtQ0FBbUM7SUFDNUIsTUFBYztJQUNyQixpQ0FBaUM7SUFDMUIsU0FBZ0MsRUFBRSxXQUF1QixFQUFFLFVBQTJCLEVBQzdGLGFBQXFCLEVBQUUsT0FBb0I7UUFicEMsUUFBRyxHQUFILEdBQUcsQ0FBYztRQUVqQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBRWQsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFFbkIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUVoQixTQUFJLEdBQUosSUFBSSxDQUFNO1FBRVYsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUVkLGNBQVMsR0FBVCxTQUFTLENBQXVCO1FBRXpDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQzlCLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0lBQzFCLENBQUM7SUFHRCxzQkFBSSx3Q0FBSTtRQURSLG1DQUFtQzthQUNuQyxjQUFxQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUdyRSxzQkFBSSwwQ0FBTTtRQURWLHdEQUF3RDthQUN4RCxjQUE0QyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUdwRixzQkFBSSw4Q0FBVTtRQURkLDZEQUE2RDthQUM3RCxjQUFnRCxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUc1RixzQkFBSSw0Q0FBUTtRQURaLDBEQUEwRDthQUMxRCxjQUEyQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUdyRixzQkFBSSxnREFBWTtRQURoQixvRUFBb0U7YUFDcEUsY0FBK0MsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFN0Ysc0JBQUksNENBQVE7YUFBWjtZQUNFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xELENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN4QixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLGlEQUFhO2FBQWpCO1lBQ0UsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDekIsSUFBSSxDQUFDLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDNUQsQ0FBQztZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzdCLENBQUM7OztPQUFBO0lBRUQseUNBQVEsR0FBUjtRQUNFLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFsQixDQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xFLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDOUQsTUFBTSxDQUFDLGdCQUFjLEdBQUcsaUJBQVksT0FBTyxPQUFJLENBQUM7SUFDbEQsQ0FBQztJQUNILDZCQUFDO0FBQUQsQ0FBQyxBQTNFRCxJQTJFQzs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUNIO0lBQXlDLCtDQUE0QjtJQUNuRSxnQkFBZ0I7SUFDaEI7SUFDSSxtREFBbUQ7SUFDNUMsR0FBVyxFQUFFLElBQXNDO1FBRjlELFlBR0Usa0JBQU0sSUFBSSxDQUFDLFNBRVo7UUFIVSxTQUFHLEdBQUgsR0FBRyxDQUFRO1FBRXBCLGNBQWMsQ0FBc0IsS0FBSSxFQUFFLElBQUksQ0FBQyxDQUFDOztJQUNsRCxDQUFDO0lBRUQsc0NBQVEsR0FBUixjQUFxQixNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsMEJBQUM7QUFBRCxDQUFDLEFBVkQsQ0FBeUMsSUFBSSxHQVU1Qzs7QUFFRCx3QkFBdUQsS0FBUSxFQUFFLElBQWlCO0lBQ2hGLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztJQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQXhCLENBQXdCLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBRUQsdUJBQXVCLElBQXNDO0lBQzNELElBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ2pHLE1BQU0sQ0FBQyxLQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBRyxDQUFDO0FBQzdCLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsTUFBTSxnQ0FBZ0MsS0FBcUI7SUFDekQsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDbkIsSUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUN2QyxJQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDO1FBQzNDLEtBQUssQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO1FBQzlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRSxLQUFLLENBQUMsV0FBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxRQUFRLEtBQUssWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDakQsS0FBSyxDQUFDLFFBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekQsS0FBSyxDQUFDLE1BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RCxLQUFLLENBQUMsR0FBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRCxLQUFLLENBQUMsSUFBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsQ0FBQztJQUNILENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLEtBQUssQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQztRQUV2Qyw0QkFBNEI7UUFDdEIsS0FBSyxDQUFDLElBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyRCxDQUFDO0FBQ0gsQ0FBQztBQUdELE1BQU0sb0NBQ0YsQ0FBeUIsRUFBRSxDQUF5QjtJQUN0RCxJQUFNLGNBQWMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZGLElBQU0sZUFBZSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFFaEQsTUFBTSxDQUFDLGNBQWMsSUFBSSxDQUFDLGVBQWU7UUFDckMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUkseUJBQXlCLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBUSxDQUFDLENBQUMsQ0FBQztBQUNyRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1R5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHttYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtEYXRhLCBSZXNvbHZlRGF0YSwgUm91dGV9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7UFJJTUFSWV9PVVRMRVQsIFBhcmFtTWFwLCBQYXJhbXMsIGNvbnZlcnRUb1BhcmFtTWFwfSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQge1VybFNlZ21lbnQsIFVybFNlZ21lbnRHcm91cCwgVXJsVHJlZSwgZXF1YWxTZWdtZW50c30gZnJvbSAnLi91cmxfdHJlZSc7XG5pbXBvcnQge3NoYWxsb3dFcXVhbCwgc2hhbGxvd0VxdWFsQXJyYXlzfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtUcmVlLCBUcmVlTm9kZX0gZnJvbSAnLi91dGlscy90cmVlJztcblxuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogUmVwcmVzZW50cyB0aGUgc3RhdGUgb2YgdGhlIHJvdXRlci5cbiAqXG4gKiBSb3V0ZXJTdGF0ZSBpcyBhIHRyZWUgb2YgYWN0aXZhdGVkIHJvdXRlcy4gRXZlcnkgbm9kZSBpbiB0aGlzIHRyZWUga25vd3MgYWJvdXQgdGhlIFwiY29uc3VtZWRcIiBVUkxcbiAqIHNlZ21lbnRzLCB0aGUgZXh0cmFjdGVkIHBhcmFtZXRlcnMsIGFuZCB0aGUgcmVzb2x2ZWQgZGF0YS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7dGVtcGxhdGVVcmw6J3RlbXBsYXRlLmh0bWwnfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgY29uc3RydWN0b3Iocm91dGVyOiBSb3V0ZXIpIHtcbiAqICAgICBjb25zdCBzdGF0ZTogUm91dGVyU3RhdGUgPSByb3V0ZXIucm91dGVyU3RhdGU7XG4gKiAgICAgY29uc3Qgcm9vdDogQWN0aXZhdGVkUm91dGUgPSBzdGF0ZS5yb290O1xuICogICAgIGNvbnN0IGNoaWxkID0gcm9vdC5maXJzdENoaWxkO1xuICogICAgIGNvbnN0IGlkOiBPYnNlcnZhYmxlPHN0cmluZz4gPSBjaGlsZC5wYXJhbXMubWFwKHAgPT4gcC5pZCk7XG4gKiAgICAgLy8uLi5cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogU2VlIGBBY3RpdmF0ZWRSb3V0ZWAgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlclN0YXRlIGV4dGVuZHMgVHJlZTxBY3RpdmF0ZWRSb3V0ZT4ge1xuICAvKiogQGludGVybmFsICovXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcm9vdDogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGU+LFxuICAgICAgLyoqIFRoZSBjdXJyZW50IHNuYXBzaG90IG9mIHRoZSByb3V0ZXIgc3RhdGUgKi9cbiAgICAgIHB1YmxpYyBzbmFwc2hvdDogUm91dGVyU3RhdGVTbmFwc2hvdCkge1xuICAgIHN1cGVyKHJvb3QpO1xuICAgIHNldFJvdXRlclN0YXRlKDxSb3V0ZXJTdGF0ZT50aGlzLCByb290KTtcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLnNuYXBzaG90LnRvU3RyaW5nKCk7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVtcHR5U3RhdGUodXJsVHJlZTogVXJsVHJlZSwgcm9vdENvbXBvbmVudDogVHlwZTxhbnk+fCBudWxsKTogUm91dGVyU3RhdGUge1xuICBjb25zdCBzbmFwc2hvdCA9IGNyZWF0ZUVtcHR5U3RhdGVTbmFwc2hvdCh1cmxUcmVlLCByb290Q29tcG9uZW50KTtcbiAgY29uc3QgZW1wdHlVcmwgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KFtuZXcgVXJsU2VnbWVudCgnJywge30pXSk7XG4gIGNvbnN0IGVtcHR5UGFyYW1zID0gbmV3IEJlaGF2aW9yU3ViamVjdCh7fSk7XG4gIGNvbnN0IGVtcHR5RGF0YSA9IG5ldyBCZWhhdmlvclN1YmplY3Qoe30pO1xuICBjb25zdCBlbXB0eVF1ZXJ5UGFyYW1zID0gbmV3IEJlaGF2aW9yU3ViamVjdCh7fSk7XG4gIGNvbnN0IGZyYWdtZW50ID0gbmV3IEJlaGF2aW9yU3ViamVjdCgnJyk7XG4gIGNvbnN0IGFjdGl2YXRlZCA9IG5ldyBBY3RpdmF0ZWRSb3V0ZShcbiAgICAgIGVtcHR5VXJsLCBlbXB0eVBhcmFtcywgZW1wdHlRdWVyeVBhcmFtcywgZnJhZ21lbnQsIGVtcHR5RGF0YSwgUFJJTUFSWV9PVVRMRVQsIHJvb3RDb21wb25lbnQsXG4gICAgICBzbmFwc2hvdC5yb290KTtcbiAgYWN0aXZhdGVkLnNuYXBzaG90ID0gc25hcHNob3Qucm9vdDtcbiAgcmV0dXJuIG5ldyBSb3V0ZXJTdGF0ZShuZXcgVHJlZU5vZGU8QWN0aXZhdGVkUm91dGU+KGFjdGl2YXRlZCwgW10pLCBzbmFwc2hvdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbXB0eVN0YXRlU25hcHNob3QoXG4gICAgdXJsVHJlZTogVXJsVHJlZSwgcm9vdENvbXBvbmVudDogVHlwZTxhbnk+fCBudWxsKTogUm91dGVyU3RhdGVTbmFwc2hvdCB7XG4gIGNvbnN0IGVtcHR5UGFyYW1zID0ge307XG4gIGNvbnN0IGVtcHR5RGF0YSA9IHt9O1xuICBjb25zdCBlbXB0eVF1ZXJ5UGFyYW1zID0ge307XG4gIGNvbnN0IGZyYWdtZW50ID0gJyc7XG4gIGNvbnN0IGFjdGl2YXRlZCA9IG5ldyBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KFxuICAgICAgW10sIGVtcHR5UGFyYW1zLCBlbXB0eVF1ZXJ5UGFyYW1zLCBmcmFnbWVudCwgZW1wdHlEYXRhLCBQUklNQVJZX09VVExFVCwgcm9vdENvbXBvbmVudCwgbnVsbCxcbiAgICAgIHVybFRyZWUucm9vdCwgLTEsIHt9KTtcbiAgcmV0dXJuIG5ldyBSb3V0ZXJTdGF0ZVNuYXBzaG90KCcnLCBuZXcgVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4oYWN0aXZhdGVkLCBbXSkpO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENvbnRhaW5zIHRoZSBpbmZvcm1hdGlvbiBhYm91dCBhIHJvdXRlIGFzc29jaWF0ZWQgd2l0aCBhIGNvbXBvbmVudCBsb2FkZWQgaW4gYW5cbiAqIG91dGxldC4gIEFuIGBBY3RpdmF0ZWRSb3V0ZWAgY2FuIGFsc28gYmUgdXNlZCB0byB0cmF2ZXJzZSB0aGUgcm91dGVyIHN0YXRlIHRyZWUuXG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBjb25zdHJ1Y3Rvcihyb3V0ZTogQWN0aXZhdGVkUm91dGUpIHtcbiAqICAgICBjb25zdCBpZDogT2JzZXJ2YWJsZTxzdHJpbmc+ID0gcm91dGUucGFyYW1zLm1hcChwID0+IHAuaWQpO1xuICogICAgIGNvbnN0IHVybDogT2JzZXJ2YWJsZTxzdHJpbmc+ID0gcm91dGUudXJsLm1hcChzZWdtZW50cyA9PiBzZWdtZW50cy5qb2luKCcnKSk7XG4gKiAgICAgLy8gcm91dGUuZGF0YSBpbmNsdWRlcyBib3RoIGBkYXRhYCBhbmQgYHJlc29sdmVgXG4gKiAgICAgY29uc3QgdXNlciA9IHJvdXRlLmRhdGEubWFwKGQgPT4gZC51c2VyKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIEFjdGl2YXRlZFJvdXRlIHtcbiAgLyoqIFRoZSBjdXJyZW50IHNuYXBzaG90IG9mIHRoaXMgcm91dGUgKi9cbiAgc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3Q7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Z1dHVyZVNuYXBzaG90OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90O1xuICAvKiogQGludGVybmFsICovXG4gIF9yb3V0ZXJTdGF0ZTogUm91dGVyU3RhdGU7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcmFtTWFwOiBPYnNlcnZhYmxlPFBhcmFtTWFwPjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcXVlcnlQYXJhbU1hcDogT2JzZXJ2YWJsZTxQYXJhbU1hcD47XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBBbiBvYnNlcnZhYmxlIG9mIHRoZSBVUkwgc2VnbWVudHMgbWF0Y2hlZCBieSB0aGlzIHJvdXRlICovXG4gICAgICBwdWJsaWMgdXJsOiBPYnNlcnZhYmxlPFVybFNlZ21lbnRbXT4sXG4gICAgICAvKiogQW4gb2JzZXJ2YWJsZSBvZiB0aGUgbWF0cml4IHBhcmFtZXRlcnMgc2NvcGVkIHRvIHRoaXMgcm91dGUgKi9cbiAgICAgIHB1YmxpYyBwYXJhbXM6IE9ic2VydmFibGU8UGFyYW1zPixcbiAgICAgIC8qKiBBbiBvYnNlcnZhYmxlIG9mIHRoZSBxdWVyeSBwYXJhbWV0ZXJzIHNoYXJlZCBieSBhbGwgdGhlIHJvdXRlcyAqL1xuICAgICAgcHVibGljIHF1ZXJ5UGFyYW1zOiBPYnNlcnZhYmxlPFBhcmFtcz4sXG4gICAgICAvKiogQW4gb2JzZXJ2YWJsZSBvZiB0aGUgVVJMIGZyYWdtZW50IHNoYXJlZCBieSBhbGwgdGhlIHJvdXRlcyAqL1xuICAgICAgcHVibGljIGZyYWdtZW50OiBPYnNlcnZhYmxlPHN0cmluZz4sXG4gICAgICAvKiogQW4gb2JzZXJ2YWJsZSBvZiB0aGUgc3RhdGljIGFuZCByZXNvbHZlZCBkYXRhIG9mIHRoaXMgcm91dGUuICovXG4gICAgICBwdWJsaWMgZGF0YTogT2JzZXJ2YWJsZTxEYXRhPixcbiAgICAgIC8qKiBUaGUgb3V0bGV0IG5hbWUgb2YgdGhlIHJvdXRlLiBJdCdzIGEgY29uc3RhbnQgKi9cbiAgICAgIHB1YmxpYyBvdXRsZXQ6IHN0cmluZyxcbiAgICAgIC8qKiBUaGUgY29tcG9uZW50IG9mIHRoZSByb3V0ZS4gSXQncyBhIGNvbnN0YW50ICovXG4gICAgICAvLyBUT0RPKHZzYXZraW4pOiByZW1vdmUgfHN0cmluZ1xuICAgICAgcHVibGljIGNvbXBvbmVudDogVHlwZTxhbnk+fHN0cmluZ3xudWxsLCBmdXR1cmVTbmFwc2hvdDogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCkge1xuICAgIHRoaXMuX2Z1dHVyZVNuYXBzaG90ID0gZnV0dXJlU25hcHNob3Q7XG4gIH1cblxuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gdXNlZCB0byBtYXRjaCB0aGlzIHJvdXRlICovXG4gIGdldCByb3V0ZUNvbmZpZygpOiBSb3V0ZXxudWxsIHsgcmV0dXJuIHRoaXMuX2Z1dHVyZVNuYXBzaG90LnJvdXRlQ29uZmlnOyB9XG5cbiAgLyoqIFRoZSByb290IG9mIHRoZSByb3V0ZXIgc3RhdGUgKi9cbiAgZ2V0IHJvb3QoKTogQWN0aXZhdGVkUm91dGUgeyByZXR1cm4gdGhpcy5fcm91dGVyU3RhdGUucm9vdDsgfVxuXG4gIC8qKiBUaGUgcGFyZW50IG9mIHRoaXMgcm91dGUgaW4gdGhlIHJvdXRlciBzdGF0ZSB0cmVlICovXG4gIGdldCBwYXJlbnQoKTogQWN0aXZhdGVkUm91dGV8bnVsbCB7IHJldHVybiB0aGlzLl9yb3V0ZXJTdGF0ZS5wYXJlbnQodGhpcyk7IH1cblxuICAvKiogVGhlIGZpcnN0IGNoaWxkIG9mIHRoaXMgcm91dGUgaW4gdGhlIHJvdXRlciBzdGF0ZSB0cmVlICovXG4gIGdldCBmaXJzdENoaWxkKCk6IEFjdGl2YXRlZFJvdXRlfG51bGwgeyByZXR1cm4gdGhpcy5fcm91dGVyU3RhdGUuZmlyc3RDaGlsZCh0aGlzKTsgfVxuXG4gIC8qKiBUaGUgY2hpbGRyZW4gb2YgdGhpcyByb3V0ZSBpbiB0aGUgcm91dGVyIHN0YXRlIHRyZWUgKi9cbiAgZ2V0IGNoaWxkcmVuKCk6IEFjdGl2YXRlZFJvdXRlW10geyByZXR1cm4gdGhpcy5fcm91dGVyU3RhdGUuY2hpbGRyZW4odGhpcyk7IH1cblxuICAvKiogVGhlIHBhdGggZnJvbSB0aGUgcm9vdCBvZiB0aGUgcm91dGVyIHN0YXRlIHRyZWUgdG8gdGhpcyByb3V0ZSAqL1xuICBnZXQgcGF0aEZyb21Sb290KCk6IEFjdGl2YXRlZFJvdXRlW10geyByZXR1cm4gdGhpcy5fcm91dGVyU3RhdGUucGF0aEZyb21Sb290KHRoaXMpOyB9XG5cbiAgZ2V0IHBhcmFtTWFwKCk6IE9ic2VydmFibGU8UGFyYW1NYXA+IHtcbiAgICBpZiAoIXRoaXMuX3BhcmFtTWFwKSB7XG4gICAgICB0aGlzLl9wYXJhbU1hcCA9IHRoaXMucGFyYW1zLnBpcGUobWFwKChwOiBQYXJhbXMpOiBQYXJhbU1hcCA9PiBjb252ZXJ0VG9QYXJhbU1hcChwKSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcGFyYW1NYXA7XG4gIH1cblxuICBnZXQgcXVlcnlQYXJhbU1hcCgpOiBPYnNlcnZhYmxlPFBhcmFtTWFwPiB7XG4gICAgaWYgKCF0aGlzLl9xdWVyeVBhcmFtTWFwKSB7XG4gICAgICB0aGlzLl9xdWVyeVBhcmFtTWFwID1cbiAgICAgICAgICB0aGlzLnF1ZXJ5UGFyYW1zLnBpcGUobWFwKChwOiBQYXJhbXMpOiBQYXJhbU1hcCA9PiBjb252ZXJ0VG9QYXJhbU1hcChwKSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcXVlcnlQYXJhbU1hcDtcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc25hcHNob3QgPyB0aGlzLnNuYXBzaG90LnRvU3RyaW5nKCkgOiBgRnV0dXJlKCR7dGhpcy5fZnV0dXJlU25hcHNob3R9KWA7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgUGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSA9ICdlbXB0eU9ubHknIHwgJ2Fsd2F5cyc7XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCB0eXBlIEluaGVyaXRlZCA9IHtcbiAgcGFyYW1zOiBQYXJhbXMsXG4gIGRhdGE6IERhdGEsXG4gIHJlc29sdmU6IERhdGEsXG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGluaGVyaXRlZCBwYXJhbXMsIGRhdGEsIGFuZCByZXNvbHZlIGZvciBhIGdpdmVuIHJvdXRlLlxuICogQnkgZGVmYXVsdCwgdGhpcyBvbmx5IGluaGVyaXRzIHZhbHVlcyB1cCB0byB0aGUgbmVhcmVzdCBwYXRoLWxlc3Mgb3IgY29tcG9uZW50LWxlc3Mgcm91dGUuXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluaGVyaXRlZFBhcmFtc0RhdGFSZXNvbHZlKFxuICAgIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LFxuICAgIHBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3k6IFBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3kgPSAnZW1wdHlPbmx5Jyk6IEluaGVyaXRlZCB7XG4gIGNvbnN0IHBhdGhGcm9tUm9vdCA9IHJvdXRlLnBhdGhGcm9tUm9vdDtcblxuICBsZXQgaW5oZXJpdGluZ1N0YXJ0aW5nRnJvbSA9IDA7XG4gIGlmIChwYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5ICE9PSAnYWx3YXlzJykge1xuICAgIGluaGVyaXRpbmdTdGFydGluZ0Zyb20gPSBwYXRoRnJvbVJvb3QubGVuZ3RoIC0gMTtcblxuICAgIHdoaWxlIChpbmhlcml0aW5nU3RhcnRpbmdGcm9tID49IDEpIHtcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBwYXRoRnJvbVJvb3RbaW5oZXJpdGluZ1N0YXJ0aW5nRnJvbV07XG4gICAgICBjb25zdCBwYXJlbnQgPSBwYXRoRnJvbVJvb3RbaW5oZXJpdGluZ1N0YXJ0aW5nRnJvbSAtIDFdO1xuICAgICAgLy8gY3VycmVudCByb3V0ZSBpcyBhbiBlbXB0eSBwYXRoID0+IGluaGVyaXRzIGl0cyBwYXJlbnQncyBwYXJhbXMgYW5kIGRhdGFcbiAgICAgIGlmIChjdXJyZW50LnJvdXRlQ29uZmlnICYmIGN1cnJlbnQucm91dGVDb25maWcucGF0aCA9PT0gJycpIHtcbiAgICAgICAgaW5oZXJpdGluZ1N0YXJ0aW5nRnJvbS0tO1xuXG4gICAgICAgIC8vIHBhcmVudCBpcyBjb21wb25lbnRsZXNzID0+IGN1cnJlbnQgcm91dGUgc2hvdWxkIGluaGVyaXQgaXRzIHBhcmFtcyBhbmQgZGF0YVxuICAgICAgfSBlbHNlIGlmICghcGFyZW50LmNvbXBvbmVudCkge1xuICAgICAgICBpbmhlcml0aW5nU3RhcnRpbmdGcm9tLS07XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmbGF0dGVuSW5oZXJpdGVkKHBhdGhGcm9tUm9vdC5zbGljZShpbmhlcml0aW5nU3RhcnRpbmdGcm9tKSk7XG59XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmZ1bmN0aW9uIGZsYXR0ZW5Jbmhlcml0ZWQocGF0aEZyb21Sb290OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90W10pOiBJbmhlcml0ZWQge1xuICByZXR1cm4gcGF0aEZyb21Sb290LnJlZHVjZSgocmVzLCBjdXJyKSA9PiB7XG4gICAgY29uc3QgcGFyYW1zID0gey4uLnJlcy5wYXJhbXMsIC4uLmN1cnIucGFyYW1zfTtcbiAgICBjb25zdCBkYXRhID0gey4uLnJlcy5kYXRhLCAuLi5jdXJyLmRhdGF9O1xuICAgIGNvbnN0IHJlc29sdmUgPSB7Li4ucmVzLnJlc29sdmUsIC4uLmN1cnIuX3Jlc29sdmVkRGF0YX07XG4gICAgcmV0dXJuIHtwYXJhbXMsIGRhdGEsIHJlc29sdmV9O1xuICB9LCA8YW55PntwYXJhbXM6IHt9LCBkYXRhOiB7fSwgcmVzb2x2ZToge319KTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBDb250YWlucyB0aGUgaW5mb3JtYXRpb24gYWJvdXQgYSByb3V0ZSBhc3NvY2lhdGVkIHdpdGggYSBjb21wb25lbnQgbG9hZGVkIGluIGFuXG4gKiBvdXRsZXQgYXQgYSBwYXJ0aWN1bGFyIG1vbWVudCBpbiB0aW1lLiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90IGNhbiBhbHNvIGJlIHVzZWQgdG9cbiAqIHRyYXZlcnNlIHRoZSByb3V0ZXIgc3RhdGUgdHJlZS5cbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe3RlbXBsYXRlVXJsOicuL215LWNvbXBvbmVudC5odG1sJ30pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSkge1xuICogICAgIGNvbnN0IGlkOiBzdHJpbmcgPSByb3V0ZS5zbmFwc2hvdC5wYXJhbXMuaWQ7XG4gKiAgICAgY29uc3QgdXJsOiBzdHJpbmcgPSByb3V0ZS5zbmFwc2hvdC51cmwuam9pbignJyk7XG4gKiAgICAgY29uc3QgdXNlciA9IHJvdXRlLnNuYXBzaG90LmRhdGEudXNlcjtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIEFjdGl2YXRlZFJvdXRlU25hcHNob3Qge1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gdXNlZCB0byBtYXRjaCB0aGlzIHJvdXRlICoqL1xuICBwdWJsaWMgcmVhZG9ubHkgcm91dGVDb25maWc6IFJvdXRlfG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKiovXG4gIF91cmxTZWdtZW50OiBVcmxTZWdtZW50R3JvdXA7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2xhc3RQYXRoSW5kZXg6IG51bWJlcjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVzb2x2ZTogUmVzb2x2ZURhdGE7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Jlc29sdmVkRGF0YTogRGF0YTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcm91dGVyU3RhdGU6IFJvdXRlclN0YXRlU25hcHNob3Q7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcmFtTWFwOiBQYXJhbU1hcDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcXVlcnlQYXJhbU1hcDogUGFyYW1NYXA7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBUaGUgVVJMIHNlZ21lbnRzIG1hdGNoZWQgYnkgdGhpcyByb3V0ZSAqL1xuICAgICAgcHVibGljIHVybDogVXJsU2VnbWVudFtdLFxuICAgICAgLyoqIFRoZSBtYXRyaXggcGFyYW1ldGVycyBzY29wZWQgdG8gdGhpcyByb3V0ZSAqL1xuICAgICAgcHVibGljIHBhcmFtczogUGFyYW1zLFxuICAgICAgLyoqIFRoZSBxdWVyeSBwYXJhbWV0ZXJzIHNoYXJlZCBieSBhbGwgdGhlIHJvdXRlcyAqL1xuICAgICAgcHVibGljIHF1ZXJ5UGFyYW1zOiBQYXJhbXMsXG4gICAgICAvKiogVGhlIFVSTCBmcmFnbWVudCBzaGFyZWQgYnkgYWxsIHRoZSByb3V0ZXMgKi9cbiAgICAgIHB1YmxpYyBmcmFnbWVudDogc3RyaW5nLFxuICAgICAgLyoqIFRoZSBzdGF0aWMgYW5kIHJlc29sdmVkIGRhdGEgb2YgdGhpcyByb3V0ZSAqL1xuICAgICAgcHVibGljIGRhdGE6IERhdGEsXG4gICAgICAvKiogVGhlIG91dGxldCBuYW1lIG9mIHRoZSByb3V0ZSAqL1xuICAgICAgcHVibGljIG91dGxldDogc3RyaW5nLFxuICAgICAgLyoqIFRoZSBjb21wb25lbnQgb2YgdGhlIHJvdXRlICovXG4gICAgICBwdWJsaWMgY29tcG9uZW50OiBUeXBlPGFueT58c3RyaW5nfG51bGwsIHJvdXRlQ29uZmlnOiBSb3V0ZXxudWxsLCB1cmxTZWdtZW50OiBVcmxTZWdtZW50R3JvdXAsXG4gICAgICBsYXN0UGF0aEluZGV4OiBudW1iZXIsIHJlc29sdmU6IFJlc29sdmVEYXRhKSB7XG4gICAgdGhpcy5yb3V0ZUNvbmZpZyA9IHJvdXRlQ29uZmlnO1xuICAgIHRoaXMuX3VybFNlZ21lbnQgPSB1cmxTZWdtZW50O1xuICAgIHRoaXMuX2xhc3RQYXRoSW5kZXggPSBsYXN0UGF0aEluZGV4O1xuICAgIHRoaXMuX3Jlc29sdmUgPSByZXNvbHZlO1xuICB9XG5cbiAgLyoqIFRoZSByb290IG9mIHRoZSByb3V0ZXIgc3RhdGUgKi9cbiAgZ2V0IHJvb3QoKTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCB7IHJldHVybiB0aGlzLl9yb3V0ZXJTdGF0ZS5yb290OyB9XG5cbiAgLyoqIFRoZSBwYXJlbnQgb2YgdGhpcyByb3V0ZSBpbiB0aGUgcm91dGVyIHN0YXRlIHRyZWUgKi9cbiAgZ2V0IHBhcmVudCgpOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90fG51bGwgeyByZXR1cm4gdGhpcy5fcm91dGVyU3RhdGUucGFyZW50KHRoaXMpOyB9XG5cbiAgLyoqIFRoZSBmaXJzdCBjaGlsZCBvZiB0aGlzIHJvdXRlIGluIHRoZSByb3V0ZXIgc3RhdGUgdHJlZSAqL1xuICBnZXQgZmlyc3RDaGlsZCgpOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90fG51bGwgeyByZXR1cm4gdGhpcy5fcm91dGVyU3RhdGUuZmlyc3RDaGlsZCh0aGlzKTsgfVxuXG4gIC8qKiBUaGUgY2hpbGRyZW4gb2YgdGhpcyByb3V0ZSBpbiB0aGUgcm91dGVyIHN0YXRlIHRyZWUgKi9cbiAgZ2V0IGNoaWxkcmVuKCk6IEFjdGl2YXRlZFJvdXRlU25hcHNob3RbXSB7IHJldHVybiB0aGlzLl9yb3V0ZXJTdGF0ZS5jaGlsZHJlbih0aGlzKTsgfVxuXG4gIC8qKiBUaGUgcGF0aCBmcm9tIHRoZSByb290IG9mIHRoZSByb3V0ZXIgc3RhdGUgdHJlZSB0byB0aGlzIHJvdXRlICovXG4gIGdldCBwYXRoRnJvbVJvb3QoKTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdFtdIHsgcmV0dXJuIHRoaXMuX3JvdXRlclN0YXRlLnBhdGhGcm9tUm9vdCh0aGlzKTsgfVxuXG4gIGdldCBwYXJhbU1hcCgpOiBQYXJhbU1hcCB7XG4gICAgaWYgKCF0aGlzLl9wYXJhbU1hcCkge1xuICAgICAgdGhpcy5fcGFyYW1NYXAgPSBjb252ZXJ0VG9QYXJhbU1hcCh0aGlzLnBhcmFtcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9wYXJhbU1hcDtcbiAgfVxuXG4gIGdldCBxdWVyeVBhcmFtTWFwKCk6IFBhcmFtTWFwIHtcbiAgICBpZiAoIXRoaXMuX3F1ZXJ5UGFyYW1NYXApIHtcbiAgICAgIHRoaXMuX3F1ZXJ5UGFyYW1NYXAgPSBjb252ZXJ0VG9QYXJhbU1hcCh0aGlzLnF1ZXJ5UGFyYW1zKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3F1ZXJ5UGFyYW1NYXA7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHVybCA9IHRoaXMudXJsLm1hcChzZWdtZW50ID0+IHNlZ21lbnQudG9TdHJpbmcoKSkuam9pbignLycpO1xuICAgIGNvbnN0IG1hdGNoZWQgPSB0aGlzLnJvdXRlQ29uZmlnID8gdGhpcy5yb3V0ZUNvbmZpZy5wYXRoIDogJyc7XG4gICAgcmV0dXJuIGBSb3V0ZSh1cmw6JyR7dXJsfScsIHBhdGg6JyR7bWF0Y2hlZH0nKWA7XG4gIH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBSZXByZXNlbnRzIHRoZSBzdGF0ZSBvZiB0aGUgcm91dGVyIGF0IGEgbW9tZW50IGluIHRpbWUuXG4gKlxuICogVGhpcyBpcyBhIHRyZWUgb2YgYWN0aXZhdGVkIHJvdXRlIHNuYXBzaG90cy4gRXZlcnkgbm9kZSBpbiB0aGlzIHRyZWUga25vd3MgYWJvdXRcbiAqIHRoZSBcImNvbnN1bWVkXCIgVVJMIHNlZ21lbnRzLCB0aGUgZXh0cmFjdGVkIHBhcmFtZXRlcnMsIGFuZCB0aGUgcmVzb2x2ZWQgZGF0YS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7dGVtcGxhdGVVcmw6J3RlbXBsYXRlLmh0bWwnfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgY29uc3RydWN0b3Iocm91dGVyOiBSb3V0ZXIpIHtcbiAqICAgICBjb25zdCBzdGF0ZTogUm91dGVyU3RhdGUgPSByb3V0ZXIucm91dGVyU3RhdGU7XG4gKiAgICAgY29uc3Qgc25hcHNob3Q6IFJvdXRlclN0YXRlU25hcHNob3QgPSBzdGF0ZS5zbmFwc2hvdDtcbiAqICAgICBjb25zdCByb290OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90ID0gc25hcHNob3Qucm9vdDtcbiAqICAgICBjb25zdCBjaGlsZCA9IHJvb3QuZmlyc3RDaGlsZDtcbiAqICAgICBjb25zdCBpZDogT2JzZXJ2YWJsZTxzdHJpbmc+ID0gY2hpbGQucGFyYW1zLm1hcChwID0+IHAuaWQpO1xuICogICAgIC8vLi4uXG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZXJTdGF0ZVNuYXBzaG90IGV4dGVuZHMgVHJlZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogVGhlIHVybCBmcm9tIHdoaWNoIHRoaXMgc25hcHNob3Qgd2FzIGNyZWF0ZWQgKi9cbiAgICAgIHB1YmxpYyB1cmw6IHN0cmluZywgcm9vdDogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4pIHtcbiAgICBzdXBlcihyb290KTtcbiAgICBzZXRSb3V0ZXJTdGF0ZSg8Um91dGVyU3RhdGVTbmFwc2hvdD50aGlzLCByb290KTtcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBzZXJpYWxpemVOb2RlKHRoaXMuX3Jvb3QpOyB9XG59XG5cbmZ1bmN0aW9uIHNldFJvdXRlclN0YXRlPFUsIFQgZXh0ZW5kc3tfcm91dGVyU3RhdGU6IFV9PihzdGF0ZTogVSwgbm9kZTogVHJlZU5vZGU8VD4pOiB2b2lkIHtcbiAgbm9kZS52YWx1ZS5fcm91dGVyU3RhdGUgPSBzdGF0ZTtcbiAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKGMgPT4gc2V0Um91dGVyU3RhdGUoc3RhdGUsIGMpKTtcbn1cblxuZnVuY3Rpb24gc2VyaWFsaXplTm9kZShub2RlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90Pik6IHN0cmluZyB7XG4gIGNvbnN0IGMgPSBub2RlLmNoaWxkcmVuLmxlbmd0aCA+IDAgPyBgIHsgJHtub2RlLmNoaWxkcmVuLm1hcChzZXJpYWxpemVOb2RlKS5qb2luKCcsICcpfSB9IGAgOiAnJztcbiAgcmV0dXJuIGAke25vZGUudmFsdWV9JHtjfWA7XG59XG5cbi8qKlxuICogVGhlIGV4cGVjdGF0aW9uIGlzIHRoYXQgdGhlIGFjdGl2YXRlIHJvdXRlIGlzIGNyZWF0ZWQgd2l0aCB0aGUgcmlnaHQgc2V0IG9mIHBhcmFtZXRlcnMuXG4gKiBTbyB3ZSBwdXNoIG5ldyB2YWx1ZXMgaW50byB0aGUgb2JzZXJ2YWJsZXMgb25seSB3aGVuIHRoZXkgYXJlIG5vdCB0aGUgaW5pdGlhbCB2YWx1ZXMuXG4gKiBBbmQgd2UgZGV0ZWN0IHRoYXQgYnkgY2hlY2tpbmcgaWYgdGhlIHNuYXBzaG90IGZpZWxkIGlzIHNldC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkdmFuY2VBY3RpdmF0ZWRSb3V0ZShyb3V0ZTogQWN0aXZhdGVkUm91dGUpOiB2b2lkIHtcbiAgaWYgKHJvdXRlLnNuYXBzaG90KSB7XG4gICAgY29uc3QgY3VycmVudFNuYXBzaG90ID0gcm91dGUuc25hcHNob3Q7XG4gICAgY29uc3QgbmV4dFNuYXBzaG90ID0gcm91dGUuX2Z1dHVyZVNuYXBzaG90O1xuICAgIHJvdXRlLnNuYXBzaG90ID0gbmV4dFNuYXBzaG90O1xuICAgIGlmICghc2hhbGxvd0VxdWFsKGN1cnJlbnRTbmFwc2hvdC5xdWVyeVBhcmFtcywgbmV4dFNuYXBzaG90LnF1ZXJ5UGFyYW1zKSkge1xuICAgICAgKDxhbnk+cm91dGUucXVlcnlQYXJhbXMpLm5leHQobmV4dFNuYXBzaG90LnF1ZXJ5UGFyYW1zKTtcbiAgICB9XG4gICAgaWYgKGN1cnJlbnRTbmFwc2hvdC5mcmFnbWVudCAhPT0gbmV4dFNuYXBzaG90LmZyYWdtZW50KSB7XG4gICAgICAoPGFueT5yb3V0ZS5mcmFnbWVudCkubmV4dChuZXh0U25hcHNob3QuZnJhZ21lbnQpO1xuICAgIH1cbiAgICBpZiAoIXNoYWxsb3dFcXVhbChjdXJyZW50U25hcHNob3QucGFyYW1zLCBuZXh0U25hcHNob3QucGFyYW1zKSkge1xuICAgICAgKDxhbnk+cm91dGUucGFyYW1zKS5uZXh0KG5leHRTbmFwc2hvdC5wYXJhbXMpO1xuICAgIH1cbiAgICBpZiAoIXNoYWxsb3dFcXVhbEFycmF5cyhjdXJyZW50U25hcHNob3QudXJsLCBuZXh0U25hcHNob3QudXJsKSkge1xuICAgICAgKDxhbnk+cm91dGUudXJsKS5uZXh0KG5leHRTbmFwc2hvdC51cmwpO1xuICAgIH1cbiAgICBpZiAoIXNoYWxsb3dFcXVhbChjdXJyZW50U25hcHNob3QuZGF0YSwgbmV4dFNuYXBzaG90LmRhdGEpKSB7XG4gICAgICAoPGFueT5yb3V0ZS5kYXRhKS5uZXh0KG5leHRTbmFwc2hvdC5kYXRhKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcm91dGUuc25hcHNob3QgPSByb3V0ZS5fZnV0dXJlU25hcHNob3Q7XG5cbiAgICAvLyB0aGlzIGlzIGZvciByZXNvbHZlZCBkYXRhXG4gICAgKDxhbnk+cm91dGUuZGF0YSkubmV4dChyb3V0ZS5fZnV0dXJlU25hcHNob3QuZGF0YSk7XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxQYXJhbXNBbmRVcmxTZWdtZW50cyhcbiAgICBhOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBiOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KTogYm9vbGVhbiB7XG4gIGNvbnN0IGVxdWFsVXJsUGFyYW1zID0gc2hhbGxvd0VxdWFsKGEucGFyYW1zLCBiLnBhcmFtcykgJiYgZXF1YWxTZWdtZW50cyhhLnVybCwgYi51cmwpO1xuICBjb25zdCBwYXJlbnRzTWlzbWF0Y2ggPSAhYS5wYXJlbnQgIT09ICFiLnBhcmVudDtcblxuICByZXR1cm4gZXF1YWxVcmxQYXJhbXMgJiYgIXBhcmVudHNNaXNtYXRjaCAmJlxuICAgICAgKCFhLnBhcmVudCB8fCBlcXVhbFBhcmFtc0FuZFVybFNlZ21lbnRzKGEucGFyZW50LCBiLnBhcmVudCAhKSk7XG59XG4iXX0=