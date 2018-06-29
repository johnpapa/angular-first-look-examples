/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { NgModuleRef } from '@angular/core';
import { EmptyError, Observable, from, of } from 'rxjs';
import { catchError, concatAll, first, map, mergeMap } from 'rxjs/operators';
import { LoadedRouterConfig } from './config';
import { PRIMARY_OUTLET, defaultUrlMatcher, navigationCancelingError } from './shared';
import { UrlSegmentGroup, UrlTree } from './url_tree';
import { andObservables, forEach, waitForMap, wrapIntoObservable } from './utils/collection';
var NoMatch = /** @class */ (function () {
    function NoMatch(segmentGroup) {
        this.segmentGroup = segmentGroup || null;
    }
    return NoMatch;
}());
var AbsoluteRedirect = /** @class */ (function () {
    function AbsoluteRedirect(urlTree) {
        this.urlTree = urlTree;
    }
    return AbsoluteRedirect;
}());
function noMatch(segmentGroup) {
    return new Observable(function (obs) { return obs.error(new NoMatch(segmentGroup)); });
}
function absoluteRedirect(newTree) {
    return new Observable(function (obs) { return obs.error(new AbsoluteRedirect(newTree)); });
}
function namedOutletsRedirect(redirectTo) {
    return new Observable(function (obs) { return obs.error(new Error("Only absolute redirects can have named outlets. redirectTo: '" + redirectTo + "'")); });
}
function canLoadFails(route) {
    return new Observable(function (obs) { return obs.error(navigationCancelingError("Cannot load children because the guard of the route \"path: '" + route.path + "'\" returned false")); });
}
/**
 * Returns the `UrlTree` with the redirection applied.
 *
 * Lazy modules are loaded along the way.
 */
export function applyRedirects(moduleInjector, configLoader, urlSerializer, urlTree, config) {
    return new ApplyRedirects(moduleInjector, configLoader, urlSerializer, urlTree, config).apply();
}
var ApplyRedirects = /** @class */ (function () {
    function ApplyRedirects(moduleInjector, configLoader, urlSerializer, urlTree, config) {
        this.configLoader = configLoader;
        this.urlSerializer = urlSerializer;
        this.urlTree = urlTree;
        this.config = config;
        this.allowRedirects = true;
        this.ngModule = moduleInjector.get(NgModuleRef);
    }
    ApplyRedirects.prototype.apply = function () {
        var _this = this;
        var expanded$ = this.expandSegmentGroup(this.ngModule, this.config, this.urlTree.root, PRIMARY_OUTLET);
        var urlTrees$ = expanded$.pipe(map(function (rootSegmentGroup) { return _this.createUrlTree(rootSegmentGroup, _this.urlTree.queryParams, _this.urlTree.fragment); }));
        return urlTrees$.pipe(catchError(function (e) {
            if (e instanceof AbsoluteRedirect) {
                // after an absolute redirect we do not apply any more redirects!
                _this.allowRedirects = false;
                // we need to run matching, so we can fetch all lazy-loaded modules
                return _this.match(e.urlTree);
            }
            if (e instanceof NoMatch) {
                throw _this.noMatchError(e);
            }
            throw e;
        }));
    };
    ApplyRedirects.prototype.match = function (tree) {
        var _this = this;
        var expanded$ = this.expandSegmentGroup(this.ngModule, this.config, tree.root, PRIMARY_OUTLET);
        var mapped$ = expanded$.pipe(map(function (rootSegmentGroup) {
            return _this.createUrlTree(rootSegmentGroup, tree.queryParams, tree.fragment);
        }));
        return mapped$.pipe(catchError(function (e) {
            if (e instanceof NoMatch) {
                throw _this.noMatchError(e);
            }
            throw e;
        }));
    };
    ApplyRedirects.prototype.noMatchError = function (e) {
        return new Error("Cannot match any routes. URL Segment: '" + e.segmentGroup + "'");
    };
    ApplyRedirects.prototype.createUrlTree = function (rootCandidate, queryParams, fragment) {
        var root = rootCandidate.segments.length > 0 ?
            new UrlSegmentGroup([], (_a = {}, _a[PRIMARY_OUTLET] = rootCandidate, _a)) :
            rootCandidate;
        return new UrlTree(root, queryParams, fragment);
        var _a;
    };
    ApplyRedirects.prototype.expandSegmentGroup = function (ngModule, routes, segmentGroup, outlet) {
        if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
            return this.expandChildren(ngModule, routes, segmentGroup)
                .pipe(map(function (children) { return new UrlSegmentGroup([], children); }));
        }
        return this.expandSegment(ngModule, segmentGroup, routes, segmentGroup.segments, outlet, true);
    };
    // Recursively expand segment groups for all the child outlets
    ApplyRedirects.prototype.expandChildren = function (ngModule, routes, segmentGroup) {
        var _this = this;
        return waitForMap(segmentGroup.children, function (childOutlet, child) { return _this.expandSegmentGroup(ngModule, routes, child, childOutlet); });
    };
    ApplyRedirects.prototype.expandSegment = function (ngModule, segmentGroup, routes, segments, outlet, allowRedirects) {
        var _this = this;
        return of.apply(void 0, tslib_1.__spread(routes)).pipe(map(function (r) {
            var expanded$ = _this.expandSegmentAgainstRoute(ngModule, segmentGroup, routes, r, segments, outlet, allowRedirects);
            return expanded$.pipe(catchError(function (e) {
                if (e instanceof NoMatch) {
                    // TODO(i): this return type doesn't match the declared Observable<UrlSegmentGroup> -
                    // talk to Jason
                    return of(null);
                }
                throw e;
            }));
        }), concatAll(), first(function (s) { return !!s; }), catchError(function (e, _) {
            if (e instanceof EmptyError || e.name === 'EmptyError') {
                if (_this.noLeftoversInUrl(segmentGroup, segments, outlet)) {
                    return of(new UrlSegmentGroup([], {}));
                }
                throw new NoMatch(segmentGroup);
            }
            throw e;
        }));
    };
    ApplyRedirects.prototype.noLeftoversInUrl = function (segmentGroup, segments, outlet) {
        return segments.length === 0 && !segmentGroup.children[outlet];
    };
    ApplyRedirects.prototype.expandSegmentAgainstRoute = function (ngModule, segmentGroup, routes, route, paths, outlet, allowRedirects) {
        if (getOutlet(route) !== outlet) {
            return noMatch(segmentGroup);
        }
        if (route.redirectTo === undefined) {
            return this.matchSegmentAgainstRoute(ngModule, segmentGroup, route, paths);
        }
        if (allowRedirects && this.allowRedirects) {
            return this.expandSegmentAgainstRouteUsingRedirect(ngModule, segmentGroup, routes, route, paths, outlet);
        }
        return noMatch(segmentGroup);
    };
    ApplyRedirects.prototype.expandSegmentAgainstRouteUsingRedirect = function (ngModule, segmentGroup, routes, route, segments, outlet) {
        if (route.path === '**') {
            return this.expandWildCardWithParamsAgainstRouteUsingRedirect(ngModule, routes, route, outlet);
        }
        return this.expandRegularSegmentAgainstRouteUsingRedirect(ngModule, segmentGroup, routes, route, segments, outlet);
    };
    ApplyRedirects.prototype.expandWildCardWithParamsAgainstRouteUsingRedirect = function (ngModule, routes, route, outlet) {
        var _this = this;
        var newTree = this.applyRedirectCommands([], route.redirectTo, {});
        if (route.redirectTo.startsWith('/')) {
            return absoluteRedirect(newTree);
        }
        return this.lineralizeSegments(route, newTree).pipe(mergeMap(function (newSegments) {
            var group = new UrlSegmentGroup(newSegments, {});
            return _this.expandSegment(ngModule, group, routes, newSegments, outlet, false);
        }));
    };
    ApplyRedirects.prototype.expandRegularSegmentAgainstRouteUsingRedirect = function (ngModule, segmentGroup, routes, route, segments, outlet) {
        var _this = this;
        var _a = match(segmentGroup, route, segments), matched = _a.matched, consumedSegments = _a.consumedSegments, lastChild = _a.lastChild, positionalParamSegments = _a.positionalParamSegments;
        if (!matched)
            return noMatch(segmentGroup);
        var newTree = this.applyRedirectCommands(consumedSegments, route.redirectTo, positionalParamSegments);
        if (route.redirectTo.startsWith('/')) {
            return absoluteRedirect(newTree);
        }
        return this.lineralizeSegments(route, newTree).pipe(mergeMap(function (newSegments) {
            return _this.expandSegment(ngModule, segmentGroup, routes, newSegments.concat(segments.slice(lastChild)), outlet, false);
        }));
    };
    ApplyRedirects.prototype.matchSegmentAgainstRoute = function (ngModule, rawSegmentGroup, route, segments) {
        var _this = this;
        if (route.path === '**') {
            if (route.loadChildren) {
                return this.configLoader.load(ngModule.injector, route)
                    .pipe(map(function (cfg) {
                    route._loadedConfig = cfg;
                    return new UrlSegmentGroup(segments, {});
                }));
            }
            return of(new UrlSegmentGroup(segments, {}));
        }
        var _a = match(rawSegmentGroup, route, segments), matched = _a.matched, consumedSegments = _a.consumedSegments, lastChild = _a.lastChild;
        if (!matched)
            return noMatch(rawSegmentGroup);
        var rawSlicedSegments = segments.slice(lastChild);
        var childConfig$ = this.getChildConfig(ngModule, route);
        return childConfig$.pipe(mergeMap(function (routerConfig) {
            var childModule = routerConfig.module;
            var childConfig = routerConfig.routes;
            var _a = split(rawSegmentGroup, consumedSegments, rawSlicedSegments, childConfig), segmentGroup = _a.segmentGroup, slicedSegments = _a.slicedSegments;
            if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
                var expanded$_1 = _this.expandChildren(childModule, childConfig, segmentGroup);
                return expanded$_1.pipe(map(function (children) { return new UrlSegmentGroup(consumedSegments, children); }));
            }
            if (childConfig.length === 0 && slicedSegments.length === 0) {
                return of(new UrlSegmentGroup(consumedSegments, {}));
            }
            var expanded$ = _this.expandSegment(childModule, segmentGroup, childConfig, slicedSegments, PRIMARY_OUTLET, true);
            return expanded$.pipe(map(function (cs) {
                return new UrlSegmentGroup(consumedSegments.concat(cs.segments), cs.children);
            }));
        }));
    };
    ApplyRedirects.prototype.getChildConfig = function (ngModule, route) {
        var _this = this;
        if (route.children) {
            // The children belong to the same module
            return of(new LoadedRouterConfig(route.children, ngModule));
        }
        if (route.loadChildren) {
            // lazy children belong to the loaded module
            if (route._loadedConfig !== undefined) {
                return of(route._loadedConfig);
            }
            return runCanLoadGuard(ngModule.injector, route).pipe(mergeMap(function (shouldLoad) {
                if (shouldLoad) {
                    return _this.configLoader.load(ngModule.injector, route)
                        .pipe(map(function (cfg) {
                        route._loadedConfig = cfg;
                        return cfg;
                    }));
                }
                return canLoadFails(route);
            }));
        }
        return of(new LoadedRouterConfig([], ngModule));
    };
    ApplyRedirects.prototype.lineralizeSegments = function (route, urlTree) {
        var res = [];
        var c = urlTree.root;
        while (true) {
            res = res.concat(c.segments);
            if (c.numberOfChildren === 0) {
                return of(res);
            }
            if (c.numberOfChildren > 1 || !c.children[PRIMARY_OUTLET]) {
                return namedOutletsRedirect(route.redirectTo);
            }
            c = c.children[PRIMARY_OUTLET];
        }
    };
    ApplyRedirects.prototype.applyRedirectCommands = function (segments, redirectTo, posParams) {
        return this.applyRedirectCreatreUrlTree(redirectTo, this.urlSerializer.parse(redirectTo), segments, posParams);
    };
    ApplyRedirects.prototype.applyRedirectCreatreUrlTree = function (redirectTo, urlTree, segments, posParams) {
        var newRoot = this.createSegmentGroup(redirectTo, urlTree.root, segments, posParams);
        return new UrlTree(newRoot, this.createQueryParams(urlTree.queryParams, this.urlTree.queryParams), urlTree.fragment);
    };
    ApplyRedirects.prototype.createQueryParams = function (redirectToParams, actualParams) {
        var res = {};
        forEach(redirectToParams, function (v, k) {
            var copySourceValue = typeof v === 'string' && v.startsWith(':');
            if (copySourceValue) {
                var sourceName = v.substring(1);
                res[k] = actualParams[sourceName];
            }
            else {
                res[k] = v;
            }
        });
        return res;
    };
    ApplyRedirects.prototype.createSegmentGroup = function (redirectTo, group, segments, posParams) {
        var _this = this;
        var updatedSegments = this.createSegments(redirectTo, group.segments, segments, posParams);
        var children = {};
        forEach(group.children, function (child, name) {
            children[name] = _this.createSegmentGroup(redirectTo, child, segments, posParams);
        });
        return new UrlSegmentGroup(updatedSegments, children);
    };
    ApplyRedirects.prototype.createSegments = function (redirectTo, redirectToSegments, actualSegments, posParams) {
        var _this = this;
        return redirectToSegments.map(function (s) { return s.path.startsWith(':') ? _this.findPosParam(redirectTo, s, posParams) :
            _this.findOrReturn(s, actualSegments); });
    };
    ApplyRedirects.prototype.findPosParam = function (redirectTo, redirectToUrlSegment, posParams) {
        var pos = posParams[redirectToUrlSegment.path.substring(1)];
        if (!pos)
            throw new Error("Cannot redirect to '" + redirectTo + "'. Cannot find '" + redirectToUrlSegment.path + "'.");
        return pos;
    };
    ApplyRedirects.prototype.findOrReturn = function (redirectToUrlSegment, actualSegments) {
        var idx = 0;
        try {
            for (var actualSegments_1 = tslib_1.__values(actualSegments), actualSegments_1_1 = actualSegments_1.next(); !actualSegments_1_1.done; actualSegments_1_1 = actualSegments_1.next()) {
                var s = actualSegments_1_1.value;
                if (s.path === redirectToUrlSegment.path) {
                    actualSegments.splice(idx);
                    return s;
                }
                idx++;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (actualSegments_1_1 && !actualSegments_1_1.done && (_a = actualSegments_1.return)) _a.call(actualSegments_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return redirectToUrlSegment;
        var e_1, _a;
    };
    return ApplyRedirects;
}());
function runCanLoadGuard(moduleInjector, route) {
    var canLoad = route.canLoad;
    if (!canLoad || canLoad.length === 0)
        return of(true);
    var obs = from(canLoad).pipe(map(function (injectionToken) {
        var guard = moduleInjector.get(injectionToken);
        return wrapIntoObservable(guard.canLoad ? guard.canLoad(route) : guard(route));
    }));
    return andObservables(obs);
}
function match(segmentGroup, route, segments) {
    if (route.path === '') {
        if ((route.pathMatch === 'full') && (segmentGroup.hasChildren() || segments.length > 0)) {
            return { matched: false, consumedSegments: [], lastChild: 0, positionalParamSegments: {} };
        }
        return { matched: true, consumedSegments: [], lastChild: 0, positionalParamSegments: {} };
    }
    var matcher = route.matcher || defaultUrlMatcher;
    var res = matcher(segments, segmentGroup, route);
    if (!res) {
        return {
            matched: false,
            consumedSegments: [],
            lastChild: 0,
            positionalParamSegments: {},
        };
    }
    return {
        matched: true,
        consumedSegments: res.consumed,
        lastChild: res.consumed.length,
        positionalParamSegments: res.posParams,
    };
}
function split(segmentGroup, consumedSegments, slicedSegments, config) {
    if (slicedSegments.length > 0 &&
        containsEmptyPathRedirectsWithNamedOutlets(segmentGroup, slicedSegments, config)) {
        var s = new UrlSegmentGroup(consumedSegments, createChildrenForEmptySegments(config, new UrlSegmentGroup(slicedSegments, segmentGroup.children)));
        return { segmentGroup: mergeTrivialChildren(s), slicedSegments: [] };
    }
    if (slicedSegments.length === 0 &&
        containsEmptyPathRedirects(segmentGroup, slicedSegments, config)) {
        var s = new UrlSegmentGroup(segmentGroup.segments, addEmptySegmentsToChildrenIfNeeded(segmentGroup, slicedSegments, config, segmentGroup.children));
        return { segmentGroup: mergeTrivialChildren(s), slicedSegments: slicedSegments };
    }
    return { segmentGroup: segmentGroup, slicedSegments: slicedSegments };
}
function mergeTrivialChildren(s) {
    if (s.numberOfChildren === 1 && s.children[PRIMARY_OUTLET]) {
        var c = s.children[PRIMARY_OUTLET];
        return new UrlSegmentGroup(s.segments.concat(c.segments), c.children);
    }
    return s;
}
function addEmptySegmentsToChildrenIfNeeded(segmentGroup, slicedSegments, routes, children) {
    var res = {};
    try {
        for (var routes_1 = tslib_1.__values(routes), routes_1_1 = routes_1.next(); !routes_1_1.done; routes_1_1 = routes_1.next()) {
            var r = routes_1_1.value;
            if (isEmptyPathRedirect(segmentGroup, slicedSegments, r) && !children[getOutlet(r)]) {
                res[getOutlet(r)] = new UrlSegmentGroup([], {});
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (routes_1_1 && !routes_1_1.done && (_a = routes_1.return)) _a.call(routes_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return tslib_1.__assign({}, children, res);
    var e_2, _a;
}
function createChildrenForEmptySegments(routes, primarySegmentGroup) {
    var res = {};
    res[PRIMARY_OUTLET] = primarySegmentGroup;
    try {
        for (var routes_2 = tslib_1.__values(routes), routes_2_1 = routes_2.next(); !routes_2_1.done; routes_2_1 = routes_2.next()) {
            var r = routes_2_1.value;
            if (r.path === '' && getOutlet(r) !== PRIMARY_OUTLET) {
                res[getOutlet(r)] = new UrlSegmentGroup([], {});
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (routes_2_1 && !routes_2_1.done && (_a = routes_2.return)) _a.call(routes_2);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return res;
    var e_3, _a;
}
function containsEmptyPathRedirectsWithNamedOutlets(segmentGroup, segments, routes) {
    return routes.some(function (r) { return isEmptyPathRedirect(segmentGroup, segments, r) && getOutlet(r) !== PRIMARY_OUTLET; });
}
function containsEmptyPathRedirects(segmentGroup, segments, routes) {
    return routes.some(function (r) { return isEmptyPathRedirect(segmentGroup, segments, r); });
}
function isEmptyPathRedirect(segmentGroup, segments, r) {
    if ((segmentGroup.hasChildren() || segments.length > 0) && r.pathMatch === 'full') {
        return false;
    }
    return r.path === '' && r.redirectTo !== undefined;
}
function getOutlet(route) {
    return route.outlet || PRIMARY_OUTLET;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbHlfcmVkaXJlY3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9hcHBseV9yZWRpcmVjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBVyxXQUFXLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDcEQsT0FBTyxFQUFDLFVBQVUsRUFBRSxVQUFVLEVBQVksSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNqRSxPQUFPLEVBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTNFLE9BQU8sRUFBQyxrQkFBa0IsRUFBZ0IsTUFBTSxVQUFVLENBQUM7QUFFM0QsT0FBTyxFQUFDLGNBQWMsRUFBVSxpQkFBaUIsRUFBRSx3QkFBd0IsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUM3RixPQUFPLEVBQWEsZUFBZSxFQUFpQixPQUFPLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDL0UsT0FBTyxFQUFDLGNBQWMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLGtCQUFrQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFM0Y7SUFHRSxpQkFBWSxZQUE4QjtRQUFJLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxJQUFJLElBQUksQ0FBQztJQUFDLENBQUM7SUFDM0YsY0FBQztBQUFELENBQUMsQUFKRCxJQUlDO0FBRUQ7SUFDRSwwQkFBbUIsT0FBZ0I7UUFBaEIsWUFBTyxHQUFQLE9BQU8sQ0FBUztJQUFHLENBQUM7SUFDekMsdUJBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQztBQUVELGlCQUFpQixZQUE2QjtJQUM1QyxNQUFNLENBQUMsSUFBSSxVQUFVLENBQ2pCLFVBQUMsR0FBOEIsSUFBSyxPQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFB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Q0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLG1CQUFtQixDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQTlDLENBQThDLENBQUMsQ0FBQztBQUMxRSxDQUFDO0FBRUQsNkJBQ0ksWUFBNkIsRUFBRSxRQUFzQixFQUFFLENBQVE7SUFDakUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDbEYsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUM7QUFDckQsQ0FBQztBQUVELG1CQUFtQixLQUFZO0lBQzdCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLGNBQWMsQ0FBQztBQUN4QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yLCBOZ01vZHVsZVJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0VtcHR5RXJyb3IsIE9ic2VydmFibGUsIE9ic2VydmVyLCBmcm9tLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtjYXRjaEVycm9yLCBjb25jYXRBbGwsIGZpcnN0LCBtYXAsIG1lcmdlTWFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7TG9hZGVkUm91dGVyQ29uZmlnLCBSb3V0ZSwgUm91dGVzfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge1JvdXRlckNvbmZpZ0xvYWRlcn0gZnJvbSAnLi9yb3V0ZXJfY29uZmlnX2xvYWRlcic7XG5pbXBvcnQge1BSSU1BUllfT1VUTEVULCBQYXJhbXMsIGRlZmF1bHRVcmxNYXRjaGVyLCBuYXZpZ2F0aW9uQ2FuY2VsaW5nRXJyb3J9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7VXJsU2VnbWVudCwgVXJsU2VnbWVudEdyb3VwLCBVcmxTZXJpYWxpemVyLCBVcmxUcmVlfSBmcm9tICcuL3VybF90cmVlJztcbmltcG9ydCB7YW5kT2JzZXJ2YWJsZXMsIGZvckVhY2gsIHdhaXRGb3JNYXAsIHdyYXBJbnRvT2JzZXJ2YWJsZX0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uJztcblxuY2xhc3MgTm9NYXRjaCB7XG4gIHB1YmxpYyBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cHxudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHNlZ21lbnRHcm91cD86IFVybFNlZ21lbnRHcm91cCkgeyB0aGlzLnNlZ21lbnRHcm91cCA9IHNlZ21lbnRHcm91cCB8fCBudWxsOyB9XG59XG5cbmNsYXNzIEFic29sdXRlUmVkaXJlY3Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdXJsVHJlZTogVXJsVHJlZSkge31cbn1cblxuZnVuY3Rpb24gbm9NYXRjaChzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCk6IE9ic2VydmFibGU8VXJsU2VnbWVudEdyb3VwPiB7XG4gIHJldHVybiBuZXcgT2JzZXJ2YWJsZTxVcmxTZWdtZW50R3JvdXA+KFxuICAgICAgKG9iczogT2JzZXJ2ZXI8VXJsU2VnbWVudEdyb3VwPikgPT4gb2JzLmVycm9yKG5ldyBOb01hdGNoKHNlZ21lbnRHcm91cCkpKTtcbn1cblxuZnVuY3Rpb24gYWJzb2x1dGVSZWRpcmVjdChuZXdUcmVlOiBVcmxUcmVlKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlPFVybFNlZ21lbnRHcm91cD4oXG4gICAgICAob2JzOiBPYnNlcnZlcjxVcmxTZWdtZW50R3JvdXA+KSA9PiBvYnMuZXJyb3IobmV3IEFic29sdXRlUmVkaXJlY3QobmV3VHJlZSkpKTtcbn1cblxuZnVuY3Rpb24gbmFtZWRPdXRsZXRzUmVkaXJlY3QocmVkaXJlY3RUbzogc3RyaW5nKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlPFVybFNlZ21lbnRHcm91cD4oXG4gICAgICAob2JzOiBPYnNlcnZlcjxVcmxTZWdtZW50R3JvdXA+KSA9PiBvYnMuZXJyb3IobmV3IEVycm9yKFxuICAgICAgICAgIGBPbmx5IGFic29sdXRlIHJlZGlyZWN0cyBjYW4gaGF2ZSBuYW1lZCBvdXRsZXRzLiByZWRpcmVjdFRvOiAnJHtyZWRpcmVjdFRvfSdgKSkpO1xufVxuXG5mdW5jdGlvbiBjYW5Mb2FkRmFpbHMocm91dGU6IFJvdXRlKTogT2JzZXJ2YWJsZTxMb2FkZWRSb3V0ZXJDb25maWc+IHtcbiAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlPExvYWRlZFJvdXRlckNvbmZpZz4oXG4gICAgICAob2JzOiBPYnNlcnZlcjxMb2FkZWRSb3V0ZXJDb25maWc+KSA9PiBvYnMuZXJyb3IobmF2aWdhdGlvbkNhbmNlbGluZ0Vycm9yKFxuICAgICAgICAgIGBDYW5ub3QgbG9hZCBjaGlsZHJlbiBiZWNhdXNlIHRoZSBndWFyZCBvZiB0aGUgcm91dGUgXCJwYXRoOiAnJHtyb3V0ZS5wYXRofSdcIiByZXR1cm5lZCBmYWxzZWApKSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYFVybFRyZWVgIHdpdGggdGhlIHJlZGlyZWN0aW9uIGFwcGxpZWQuXG4gKlxuICogTGF6eSBtb2R1bGVzIGFyZSBsb2FkZWQgYWxvbmcgdGhlIHdheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UmVkaXJlY3RzKFxuICAgIG1vZHVsZUluamVjdG9yOiBJbmplY3RvciwgY29uZmlnTG9hZGVyOiBSb3V0ZXJDb25maWdMb2FkZXIsIHVybFNlcmlhbGl6ZXI6IFVybFNlcmlhbGl6ZXIsXG4gICAgdXJsVHJlZTogVXJsVHJlZSwgY29uZmlnOiBSb3V0ZXMpOiBPYnNlcnZhYmxlPFVybFRyZWU+IHtcbiAgcmV0dXJuIG5ldyBBcHBseVJlZGlyZWN0cyhtb2R1bGVJbmplY3RvciwgY29uZmlnTG9hZGVyLCB1cmxTZXJpYWxpemVyLCB1cmxUcmVlLCBjb25maWcpLmFwcGx5KCk7XG59XG5cbmNsYXNzIEFwcGx5UmVkaXJlY3RzIHtcbiAgcHJpdmF0ZSBhbGxvd1JlZGlyZWN0czogYm9vbGVhbiA9IHRydWU7XG4gIHByaXZhdGUgbmdNb2R1bGU6IE5nTW9kdWxlUmVmPGFueT47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBtb2R1bGVJbmplY3RvcjogSW5qZWN0b3IsIHByaXZhdGUgY29uZmlnTG9hZGVyOiBSb3V0ZXJDb25maWdMb2FkZXIsXG4gICAgICBwcml2YXRlIHVybFNlcmlhbGl6ZXI6IFVybFNlcmlhbGl6ZXIsIHByaXZhdGUgdXJsVHJlZTogVXJsVHJlZSwgcHJpdmF0ZSBjb25maWc6IFJvdXRlcykge1xuICAgIHRoaXMubmdNb2R1bGUgPSBtb2R1bGVJbmplY3Rvci5nZXQoTmdNb2R1bGVSZWYpO1xuICB9XG5cbiAgYXBwbHkoKTogT2JzZXJ2YWJsZTxVcmxUcmVlPiB7XG4gICAgY29uc3QgZXhwYW5kZWQkID1cbiAgICAgICAgdGhpcy5leHBhbmRTZWdtZW50R3JvdXAodGhpcy5uZ01vZHVsZSwgdGhpcy5jb25maWcsIHRoaXMudXJsVHJlZS5yb290LCBQUklNQVJZX09VVExFVCk7XG4gICAgY29uc3QgdXJsVHJlZXMkID0gZXhwYW5kZWQkLnBpcGUoXG4gICAgICAgIG1hcCgocm9vdFNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwKSA9PiB0aGlzLmNyZWF0ZVVybFRyZWUoXG4gICAgICAgICAgICAgICAgcm9vdFNlZ21lbnRHcm91cCwgdGhpcy51cmxUcmVlLnF1ZXJ5UGFyYW1zLCB0aGlzLnVybFRyZWUuZnJhZ21lbnQgISkpKTtcbiAgICByZXR1cm4gdXJsVHJlZXMkLnBpcGUoY2F0Y2hFcnJvcigoZTogYW55KSA9PiB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEFic29sdXRlUmVkaXJlY3QpIHtcbiAgICAgICAgLy8gYWZ0ZXIgYW4gYWJzb2x1dGUgcmVkaXJlY3Qgd2UgZG8gbm90IGFwcGx5IGFueSBtb3JlIHJlZGlyZWN0cyFcbiAgICAgICAgdGhpcy5hbGxvd1JlZGlyZWN0cyA9IGZhbHNlO1xuICAgICAgICAvLyB3ZSBuZWVkIHRvIHJ1biBtYXRjaGluZywgc28gd2UgY2FuIGZldGNoIGFsbCBsYXp5LWxvYWRlZCBtb2R1bGVzXG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoKGUudXJsVHJlZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChlIGluc3RhbmNlb2YgTm9NYXRjaCkge1xuICAgICAgICB0aHJvdyB0aGlzLm5vTWF0Y2hFcnJvcihlKTtcbiAgICAgIH1cblxuICAgICAgdGhyb3cgZTtcbiAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIG1hdGNoKHRyZWU6IFVybFRyZWUpOiBPYnNlcnZhYmxlPFVybFRyZWU+IHtcbiAgICBjb25zdCBleHBhbmRlZCQgPVxuICAgICAgICB0aGlzLmV4cGFuZFNlZ21lbnRHcm91cCh0aGlzLm5nTW9kdWxlLCB0aGlzLmNvbmZpZywgdHJlZS5yb290LCBQUklNQVJZX09VVExFVCk7XG4gICAgY29uc3QgbWFwcGVkJCA9IGV4cGFuZGVkJC5waXBlKFxuICAgICAgICBtYXAoKHJvb3RTZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCkgPT5cbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVVybFRyZWUocm9vdFNlZ21lbnRHcm91cCwgdHJlZS5xdWVyeVBhcmFtcywgdHJlZS5mcmFnbWVudCAhKSkpO1xuICAgIHJldHVybiBtYXBwZWQkLnBpcGUoY2F0Y2hFcnJvcigoZTogYW55KTogT2JzZXJ2YWJsZTxVcmxUcmVlPiA9PiB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIE5vTWF0Y2gpIHtcbiAgICAgICAgdGhyb3cgdGhpcy5ub01hdGNoRXJyb3IoZSk7XG4gICAgICB9XG5cbiAgICAgIHRocm93IGU7XG4gICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBub01hdGNoRXJyb3IoZTogTm9NYXRjaCk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBFcnJvcihgQ2Fubm90IG1hdGNoIGFueSByb3V0ZXMuIFVSTCBTZWdtZW50OiAnJHtlLnNlZ21lbnRHcm91cH0nYCk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVVybFRyZWUocm9vdENhbmRpZGF0ZTogVXJsU2VnbWVudEdyb3VwLCBxdWVyeVBhcmFtczogUGFyYW1zLCBmcmFnbWVudDogc3RyaW5nKTpcbiAgICAgIFVybFRyZWUge1xuICAgIGNvbnN0IHJvb3QgPSByb290Q2FuZGlkYXRlLnNlZ21lbnRzLmxlbmd0aCA+IDAgP1xuICAgICAgICBuZXcgVXJsU2VnbWVudEdyb3VwKFtdLCB7W1BSSU1BUllfT1VUTEVUXTogcm9vdENhbmRpZGF0ZX0pIDpcbiAgICAgICAgcm9vdENhbmRpZGF0ZTtcbiAgICByZXR1cm4gbmV3IFVybFRyZWUocm9vdCwgcXVlcnlQYXJhbXMsIGZyYWdtZW50KTtcbiAgfVxuXG4gIHByaXZhdGUgZXhwYW5kU2VnbWVudEdyb3VwKFxuICAgICAgbmdNb2R1bGU6IE5nTW9kdWxlUmVmPGFueT4sIHJvdXRlczogUm91dGVbXSwgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsXG4gICAgICBvdXRsZXQ6IHN0cmluZyk6IE9ic2VydmFibGU8VXJsU2VnbWVudEdyb3VwPiB7XG4gICAgaWYgKHNlZ21lbnRHcm91cC5zZWdtZW50cy5sZW5ndGggPT09IDAgJiYgc2VnbWVudEdyb3VwLmhhc0NoaWxkcmVuKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4cGFuZENoaWxkcmVuKG5nTW9kdWxlLCByb3V0ZXMsIHNlZ21lbnRHcm91cClcbiAgICAgICAgICAucGlwZShtYXAoKGNoaWxkcmVuOiBhbnkpID0+IG5ldyBVcmxTZWdtZW50R3JvdXAoW10sIGNoaWxkcmVuKSkpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmV4cGFuZFNlZ21lbnQobmdNb2R1bGUsIHNlZ21lbnRHcm91cCwgcm91dGVzLCBzZWdtZW50R3JvdXAuc2VnbWVudHMsIG91dGxldCwgdHJ1ZSk7XG4gIH1cblxuICAvLyBSZWN1cnNpdmVseSBleHBhbmQgc2VnbWVudCBncm91cHMgZm9yIGFsbCB0aGUgY2hpbGQgb3V0bGV0c1xuICBwcml2YXRlIGV4cGFuZENoaWxkcmVuKFxuICAgICAgbmdNb2R1bGU6IE5nTW9kdWxlUmVmPGFueT4sIHJvdXRlczogUm91dGVbXSxcbiAgICAgIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwKTogT2JzZXJ2YWJsZTx7W25hbWU6IHN0cmluZ106IFVybFNlZ21lbnRHcm91cH0+IHtcbiAgICByZXR1cm4gd2FpdEZvck1hcChcbiAgICAgICAgc2VnbWVudEdyb3VwLmNoaWxkcmVuLFxuICAgICAgICAoY2hpbGRPdXRsZXQsIGNoaWxkKSA9PiB0aGlzLmV4cGFuZFNlZ21lbnRHcm91cChuZ01vZHVsZSwgcm91dGVzLCBjaGlsZCwgY2hpbGRPdXRsZXQpKTtcbiAgfVxuXG4gIHByaXZhdGUgZXhwYW5kU2VnbWVudChcbiAgICAgIG5nTW9kdWxlOiBOZ01vZHVsZVJlZjxhbnk+LCBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCwgcm91dGVzOiBSb3V0ZVtdLFxuICAgICAgc2VnbWVudHM6IFVybFNlZ21lbnRbXSwgb3V0bGV0OiBzdHJpbmcsXG4gICAgICBhbGxvd1JlZGlyZWN0czogYm9vbGVhbik6IE9ic2VydmFibGU8VXJsU2VnbWVudEdyb3VwPiB7XG4gICAgcmV0dXJuIG9mICguLi5yb3V0ZXMpLnBpcGUoXG4gICAgICAgIG1hcCgocjogYW55KSA9PiB7XG4gICAgICAgICAgY29uc3QgZXhwYW5kZWQkID0gdGhpcy5leHBhbmRTZWdtZW50QWdhaW5zdFJvdXRlKFxuICAgICAgICAgICAgICBuZ01vZHVsZSwgc2VnbWVudEdyb3VwLCByb3V0ZXMsIHIsIHNlZ21lbnRzLCBvdXRsZXQsIGFsbG93UmVkaXJlY3RzKTtcbiAgICAgICAgICByZXR1cm4gZXhwYW5kZWQkLnBpcGUoY2F0Y2hFcnJvcigoZTogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIE5vTWF0Y2gpIHtcbiAgICAgICAgICAgICAgLy8gVE9ETyhpKTogdGhpcyByZXR1cm4gdHlwZSBkb2Vzbid0IG1hdGNoIHRoZSBkZWNsYXJlZCBPYnNlcnZhYmxlPFVybFNlZ21lbnRHcm91cD4gLVxuICAgICAgICAgICAgICAvLyB0YWxrIHRvIEphc29uXG4gICAgICAgICAgICAgIHJldHVybiBvZiAobnVsbCkgYXMgYW55O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0pLFxuICAgICAgICBjb25jYXRBbGwoKSwgZmlyc3QoKHM6IGFueSkgPT4gISFzKSwgY2F0Y2hFcnJvcigoZTogYW55LCBfOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIEVtcHR5RXJyb3IgfHwgZS5uYW1lID09PSAnRW1wdHlFcnJvcicpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm5vTGVmdG92ZXJzSW5Vcmwoc2VnbWVudEdyb3VwLCBzZWdtZW50cywgb3V0bGV0KSkge1xuICAgICAgICAgICAgICByZXR1cm4gb2YgKG5ldyBVcmxTZWdtZW50R3JvdXAoW10sIHt9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgTm9NYXRjaChzZWdtZW50R3JvdXApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIG5vTGVmdG92ZXJzSW5Vcmwoc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHNlZ21lbnRzOiBVcmxTZWdtZW50W10sIG91dGxldDogc3RyaW5nKTpcbiAgICAgIGJvb2xlYW4ge1xuICAgIHJldHVybiBzZWdtZW50cy5sZW5ndGggPT09IDAgJiYgIXNlZ21lbnRHcm91cC5jaGlsZHJlbltvdXRsZXRdO1xuICB9XG5cbiAgcHJpdmF0ZSBleHBhbmRTZWdtZW50QWdhaW5zdFJvdXRlKFxuICAgICAgbmdNb2R1bGU6IE5nTW9kdWxlUmVmPGFueT4sIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCByb3V0ZXM6IFJvdXRlW10sIHJvdXRlOiBSb3V0ZSxcbiAgICAgIHBhdGhzOiBVcmxTZWdtZW50W10sIG91dGxldDogc3RyaW5nLCBhbGxvd1JlZGlyZWN0czogYm9vbGVhbik6IE9ic2VydmFibGU8VXJsU2VnbWVudEdyb3VwPiB7XG4gICAgaWYgKGdldE91dGxldChyb3V0ZSkgIT09IG91dGxldCkge1xuICAgICAgcmV0dXJuIG5vTWF0Y2goc2VnbWVudEdyb3VwKTtcbiAgICB9XG5cbiAgICBpZiAocm91dGUucmVkaXJlY3RUbyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXRjaFNlZ21lbnRBZ2FpbnN0Um91dGUobmdNb2R1bGUsIHNlZ21lbnRHcm91cCwgcm91dGUsIHBhdGhzKTtcbiAgICB9XG5cbiAgICBpZiAoYWxsb3dSZWRpcmVjdHMgJiYgdGhpcy5hbGxvd1JlZGlyZWN0cykge1xuICAgICAgcmV0dXJuIHRoaXMuZXhwYW5kU2VnbWVudEFnYWluc3RSb3V0ZVVzaW5nUmVkaXJlY3QoXG4gICAgICAgICAgbmdNb2R1bGUsIHNlZ21lbnRHcm91cCwgcm91dGVzLCByb3V0ZSwgcGF0aHMsIG91dGxldCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vTWF0Y2goc2VnbWVudEdyb3VwKTtcbiAgfVxuXG4gIHByaXZhdGUgZXhwYW5kU2VnbWVudEFnYWluc3RSb3V0ZVVzaW5nUmVkaXJlY3QoXG4gICAgICBuZ01vZHVsZTogTmdNb2R1bGVSZWY8YW55Piwgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHJvdXRlczogUm91dGVbXSwgcm91dGU6IFJvdXRlLFxuICAgICAgc2VnbWVudHM6IFVybFNlZ21lbnRbXSwgb3V0bGV0OiBzdHJpbmcpOiBPYnNlcnZhYmxlPFVybFNlZ21lbnRHcm91cD4ge1xuICAgIGlmIChyb3V0ZS5wYXRoID09PSAnKionKSB7XG4gICAgICByZXR1cm4gdGhpcy5leHBhbmRXaWxkQ2FyZFdpdGhQYXJhbXNBZ2FpbnN0Um91dGVVc2luZ1JlZGlyZWN0KFxuICAgICAgICAgIG5nTW9kdWxlLCByb3V0ZXMsIHJvdXRlLCBvdXRsZXQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmV4cGFuZFJlZ3VsYXJTZWdtZW50QWdhaW5zdFJvdXRlVXNpbmdSZWRpcmVjdChcbiAgICAgICAgbmdNb2R1bGUsIHNlZ21lbnRHcm91cCwgcm91dGVzLCByb3V0ZSwgc2VnbWVudHMsIG91dGxldCk7XG4gIH1cblxuICBwcml2YXRlIGV4cGFuZFdpbGRDYXJkV2l0aFBhcmFtc0FnYWluc3RSb3V0ZVVzaW5nUmVkaXJlY3QoXG4gICAgICBuZ01vZHVsZTogTmdNb2R1bGVSZWY8YW55Piwgcm91dGVzOiBSb3V0ZVtdLCByb3V0ZTogUm91dGUsXG4gICAgICBvdXRsZXQ6IHN0cmluZyk6IE9ic2VydmFibGU8VXJsU2VnbWVudEdyb3VwPiB7XG4gICAgY29uc3QgbmV3VHJlZSA9IHRoaXMuYXBwbHlSZWRpcmVjdENvbW1hbmRzKFtdLCByb3V0ZS5yZWRpcmVjdFRvICEsIHt9KTtcbiAgICBpZiAocm91dGUucmVkaXJlY3RUbyAhLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgcmV0dXJuIGFic29sdXRlUmVkaXJlY3QobmV3VHJlZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGluZXJhbGl6ZVNlZ21lbnRzKHJvdXRlLCBuZXdUcmVlKS5waXBlKG1lcmdlTWFwKChuZXdTZWdtZW50czogVXJsU2VnbWVudFtdKSA9PiB7XG4gICAgICBjb25zdCBncm91cCA9IG5ldyBVcmxTZWdtZW50R3JvdXAobmV3U2VnbWVudHMsIHt9KTtcbiAgICAgIHJldHVybiB0aGlzLmV4cGFuZFNlZ21lbnQobmdNb2R1bGUsIGdyb3VwLCByb3V0ZXMsIG5ld1NlZ21lbnRzLCBvdXRsZXQsIGZhbHNlKTtcbiAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIGV4cGFuZFJlZ3VsYXJTZWdtZW50QWdhaW5zdFJvdXRlVXNpbmdSZWRpcmVjdChcbiAgICAgIG5nTW9kdWxlOiBOZ01vZHVsZVJlZjxhbnk+LCBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCwgcm91dGVzOiBSb3V0ZVtdLCByb3V0ZTogUm91dGUsXG4gICAgICBzZWdtZW50czogVXJsU2VnbWVudFtdLCBvdXRsZXQ6IHN0cmluZyk6IE9ic2VydmFibGU8VXJsU2VnbWVudEdyb3VwPiB7XG4gICAgY29uc3Qge21hdGNoZWQsIGNvbnN1bWVkU2VnbWVudHMsIGxhc3RDaGlsZCwgcG9zaXRpb25hbFBhcmFtU2VnbWVudHN9ID1cbiAgICAgICAgbWF0Y2goc2VnbWVudEdyb3VwLCByb3V0ZSwgc2VnbWVudHMpO1xuICAgIGlmICghbWF0Y2hlZCkgcmV0dXJuIG5vTWF0Y2goc2VnbWVudEdyb3VwKTtcblxuICAgIGNvbnN0IG5ld1RyZWUgPSB0aGlzLmFwcGx5UmVkaXJlY3RDb21tYW5kcyhcbiAgICAgICAgY29uc3VtZWRTZWdtZW50cywgcm91dGUucmVkaXJlY3RUbyAhLCA8YW55PnBvc2l0aW9uYWxQYXJhbVNlZ21lbnRzKTtcbiAgICBpZiAocm91dGUucmVkaXJlY3RUbyAhLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgcmV0dXJuIGFic29sdXRlUmVkaXJlY3QobmV3VHJlZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGluZXJhbGl6ZVNlZ21lbnRzKHJvdXRlLCBuZXdUcmVlKS5waXBlKG1lcmdlTWFwKChuZXdTZWdtZW50czogVXJsU2VnbWVudFtdKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5leHBhbmRTZWdtZW50KFxuICAgICAgICAgIG5nTW9kdWxlLCBzZWdtZW50R3JvdXAsIHJvdXRlcywgbmV3U2VnbWVudHMuY29uY2F0KHNlZ21lbnRzLnNsaWNlKGxhc3RDaGlsZCkpLCBvdXRsZXQsXG4gICAgICAgICAgZmFsc2UpO1xuICAgIH0pKTtcbiAgfVxuXG4gIHByaXZhdGUgbWF0Y2hTZWdtZW50QWdhaW5zdFJvdXRlKFxuICAgICAgbmdNb2R1bGU6IE5nTW9kdWxlUmVmPGFueT4sIHJhd1NlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCByb3V0ZTogUm91dGUsXG4gICAgICBzZWdtZW50czogVXJsU2VnbWVudFtdKTogT2JzZXJ2YWJsZTxVcmxTZWdtZW50R3JvdXA+IHtcbiAgICBpZiAocm91dGUucGF0aCA9PT0gJyoqJykge1xuICAgICAgaWYgKHJvdXRlLmxvYWRDaGlsZHJlbikge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWdMb2FkZXIubG9hZChuZ01vZHVsZS5pbmplY3Rvciwgcm91dGUpXG4gICAgICAgICAgICAucGlwZShtYXAoKGNmZzogTG9hZGVkUm91dGVyQ29uZmlnKSA9PiB7XG4gICAgICAgICAgICAgIHJvdXRlLl9sb2FkZWRDb25maWcgPSBjZmc7XG4gICAgICAgICAgICAgIHJldHVybiBuZXcgVXJsU2VnbWVudEdyb3VwKHNlZ21lbnRzLCB7fSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvZiAobmV3IFVybFNlZ21lbnRHcm91cChzZWdtZW50cywge30pKTtcbiAgICB9XG5cbiAgICBjb25zdCB7bWF0Y2hlZCwgY29uc3VtZWRTZWdtZW50cywgbGFzdENoaWxkfSA9IG1hdGNoKHJhd1NlZ21lbnRHcm91cCwgcm91dGUsIHNlZ21lbnRzKTtcbiAgICBpZiAoIW1hdGNoZWQpIHJldHVybiBub01hdGNoKHJhd1NlZ21lbnRHcm91cCk7XG5cbiAgICBjb25zdCByYXdTbGljZWRTZWdtZW50cyA9IHNlZ21lbnRzLnNsaWNlKGxhc3RDaGlsZCk7XG4gICAgY29uc3QgY2hpbGRDb25maWckID0gdGhpcy5nZXRDaGlsZENvbmZpZyhuZ01vZHVsZSwgcm91dGUpO1xuXG4gICAgcmV0dXJuIGNoaWxkQ29uZmlnJC5waXBlKG1lcmdlTWFwKChyb3V0ZXJDb25maWc6IExvYWRlZFJvdXRlckNvbmZpZykgPT4ge1xuICAgICAgY29uc3QgY2hpbGRNb2R1bGUgPSByb3V0ZXJDb25maWcubW9kdWxlO1xuICAgICAgY29uc3QgY2hpbGRDb25maWcgPSByb3V0ZXJDb25maWcucm91dGVzO1xuXG4gICAgICBjb25zdCB7c2VnbWVudEdyb3VwLCBzbGljZWRTZWdtZW50c30gPVxuICAgICAgICAgIHNwbGl0KHJhd1NlZ21lbnRHcm91cCwgY29uc3VtZWRTZWdtZW50cywgcmF3U2xpY2VkU2VnbWVudHMsIGNoaWxkQ29uZmlnKTtcblxuICAgICAgaWYgKHNsaWNlZFNlZ21lbnRzLmxlbmd0aCA9PT0gMCAmJiBzZWdtZW50R3JvdXAuaGFzQ2hpbGRyZW4oKSkge1xuICAgICAgICBjb25zdCBleHBhbmRlZCQgPSB0aGlzLmV4cGFuZENoaWxkcmVuKGNoaWxkTW9kdWxlLCBjaGlsZENvbmZpZywgc2VnbWVudEdyb3VwKTtcbiAgICAgICAgcmV0dXJuIGV4cGFuZGVkJC5waXBlKFxuICAgICAgICAgICAgbWFwKChjaGlsZHJlbjogYW55KSA9PiBuZXcgVXJsU2VnbWVudEdyb3VwKGNvbnN1bWVkU2VnbWVudHMsIGNoaWxkcmVuKSkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY2hpbGRDb25maWcubGVuZ3RoID09PSAwICYmIHNsaWNlZFNlZ21lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gb2YgKG5ldyBVcmxTZWdtZW50R3JvdXAoY29uc3VtZWRTZWdtZW50cywge30pKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXhwYW5kZWQkID0gdGhpcy5leHBhbmRTZWdtZW50KFxuICAgICAgICAgIGNoaWxkTW9kdWxlLCBzZWdtZW50R3JvdXAsIGNoaWxkQ29uZmlnLCBzbGljZWRTZWdtZW50cywgUFJJTUFSWV9PVVRMRVQsIHRydWUpO1xuICAgICAgcmV0dXJuIGV4cGFuZGVkJC5waXBlKFxuICAgICAgICAgIG1hcCgoY3M6IFVybFNlZ21lbnRHcm91cCkgPT5cbiAgICAgICAgICAgICAgICAgIG5ldyBVcmxTZWdtZW50R3JvdXAoY29uc3VtZWRTZWdtZW50cy5jb25jYXQoY3Muc2VnbWVudHMpLCBjcy5jaGlsZHJlbikpKTtcbiAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIGdldENoaWxkQ29uZmlnKG5nTW9kdWxlOiBOZ01vZHVsZVJlZjxhbnk+LCByb3V0ZTogUm91dGUpOiBPYnNlcnZhYmxlPExvYWRlZFJvdXRlckNvbmZpZz4ge1xuICAgIGlmIChyb3V0ZS5jaGlsZHJlbikge1xuICAgICAgLy8gVGhlIGNoaWxkcmVuIGJlbG9uZyB0byB0aGUgc2FtZSBtb2R1bGVcbiAgICAgIHJldHVybiBvZiAobmV3IExvYWRlZFJvdXRlckNvbmZpZyhyb3V0ZS5jaGlsZHJlbiwgbmdNb2R1bGUpKTtcbiAgICB9XG5cbiAgICBpZiAocm91dGUubG9hZENoaWxkcmVuKSB7XG4gICAgICAvLyBsYXp5IGNoaWxkcmVuIGJlbG9uZyB0byB0aGUgbG9hZGVkIG1vZHVsZVxuICAgICAgaWYgKHJvdXRlLl9sb2FkZWRDb25maWcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gb2YgKHJvdXRlLl9sb2FkZWRDb25maWcpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcnVuQ2FuTG9hZEd1YXJkKG5nTW9kdWxlLmluamVjdG9yLCByb3V0ZSkucGlwZShtZXJnZU1hcCgoc2hvdWxkTG9hZDogYm9vbGVhbikgPT4ge1xuICAgICAgICBpZiAoc2hvdWxkTG9hZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmZpZ0xvYWRlci5sb2FkKG5nTW9kdWxlLmluamVjdG9yLCByb3V0ZSlcbiAgICAgICAgICAgICAgLnBpcGUobWFwKChjZmc6IExvYWRlZFJvdXRlckNvbmZpZykgPT4ge1xuICAgICAgICAgICAgICAgIHJvdXRlLl9sb2FkZWRDb25maWcgPSBjZmc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNmZztcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYW5Mb2FkRmFpbHMocm91dGUpO1xuICAgICAgfSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvZiAobmV3IExvYWRlZFJvdXRlckNvbmZpZyhbXSwgbmdNb2R1bGUpKTtcbiAgfVxuXG4gIHByaXZhdGUgbGluZXJhbGl6ZVNlZ21lbnRzKHJvdXRlOiBSb3V0ZSwgdXJsVHJlZTogVXJsVHJlZSk6IE9ic2VydmFibGU8VXJsU2VnbWVudFtdPiB7XG4gICAgbGV0IHJlczogVXJsU2VnbWVudFtdID0gW107XG4gICAgbGV0IGMgPSB1cmxUcmVlLnJvb3Q7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHJlcyA9IHJlcy5jb25jYXQoYy5zZWdtZW50cyk7XG4gICAgICBpZiAoYy5udW1iZXJPZkNoaWxkcmVuID09PSAwKSB7XG4gICAgICAgIHJldHVybiBvZiAocmVzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGMubnVtYmVyT2ZDaGlsZHJlbiA+IDEgfHwgIWMuY2hpbGRyZW5bUFJJTUFSWV9PVVRMRVRdKSB7XG4gICAgICAgIHJldHVybiBuYW1lZE91dGxldHNSZWRpcmVjdChyb3V0ZS5yZWRpcmVjdFRvICEpO1xuICAgICAgfVxuXG4gICAgICBjID0gYy5jaGlsZHJlbltQUklNQVJZX09VVExFVF07XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhcHBseVJlZGlyZWN0Q29tbWFuZHMoXG4gICAgICBzZWdtZW50czogVXJsU2VnbWVudFtdLCByZWRpcmVjdFRvOiBzdHJpbmcsIHBvc1BhcmFtczoge1trOiBzdHJpbmddOiBVcmxTZWdtZW50fSk6IFVybFRyZWUge1xuICAgIHJldHVybiB0aGlzLmFwcGx5UmVkaXJlY3RDcmVhdHJlVXJsVHJlZShcbiAgICAgICAgcmVkaXJlY3RUbywgdGhpcy51cmxTZXJpYWxpemVyLnBhcnNlKHJlZGlyZWN0VG8pLCBzZWdtZW50cywgcG9zUGFyYW1zKTtcbiAgfVxuXG4gIHByaXZhdGUgYXBwbHlSZWRpcmVjdENyZWF0cmVVcmxUcmVlKFxuICAgICAgcmVkaXJlY3RUbzogc3RyaW5nLCB1cmxUcmVlOiBVcmxUcmVlLCBzZWdtZW50czogVXJsU2VnbWVudFtdLFxuICAgICAgcG9zUGFyYW1zOiB7W2s6IHN0cmluZ106IFVybFNlZ21lbnR9KTogVXJsVHJlZSB7XG4gICAgY29uc3QgbmV3Um9vdCA9IHRoaXMuY3JlYXRlU2VnbWVudEdyb3VwKHJlZGlyZWN0VG8sIHVybFRyZWUucm9vdCwgc2VnbWVudHMsIHBvc1BhcmFtcyk7XG4gICAgcmV0dXJuIG5ldyBVcmxUcmVlKFxuICAgICAgICBuZXdSb290LCB0aGlzLmNyZWF0ZVF1ZXJ5UGFyYW1zKHVybFRyZWUucXVlcnlQYXJhbXMsIHRoaXMudXJsVHJlZS5xdWVyeVBhcmFtcyksXG4gICAgICAgIHVybFRyZWUuZnJhZ21lbnQpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVRdWVyeVBhcmFtcyhyZWRpcmVjdFRvUGFyYW1zOiBQYXJhbXMsIGFjdHVhbFBhcmFtczogUGFyYW1zKTogUGFyYW1zIHtcbiAgICBjb25zdCByZXM6IFBhcmFtcyA9IHt9O1xuICAgIGZvckVhY2gocmVkaXJlY3RUb1BhcmFtcywgKHY6IGFueSwgazogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBjb3B5U291cmNlVmFsdWUgPSB0eXBlb2YgdiA9PT0gJ3N0cmluZycgJiYgdi5zdGFydHNXaXRoKCc6Jyk7XG4gICAgICBpZiAoY29weVNvdXJjZVZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZU5hbWUgPSB2LnN1YnN0cmluZygxKTtcbiAgICAgICAgcmVzW2tdID0gYWN0dWFsUGFyYW1zW3NvdXJjZU5hbWVdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzW2tdID0gdjtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVTZWdtZW50R3JvdXAoXG4gICAgICByZWRpcmVjdFRvOiBzdHJpbmcsIGdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHNlZ21lbnRzOiBVcmxTZWdtZW50W10sXG4gICAgICBwb3NQYXJhbXM6IHtbazogc3RyaW5nXTogVXJsU2VnbWVudH0pOiBVcmxTZWdtZW50R3JvdXAge1xuICAgIGNvbnN0IHVwZGF0ZWRTZWdtZW50cyA9IHRoaXMuY3JlYXRlU2VnbWVudHMocmVkaXJlY3RUbywgZ3JvdXAuc2VnbWVudHMsIHNlZ21lbnRzLCBwb3NQYXJhbXMpO1xuXG4gICAgbGV0IGNoaWxkcmVuOiB7W246IHN0cmluZ106IFVybFNlZ21lbnRHcm91cH0gPSB7fTtcbiAgICBmb3JFYWNoKGdyb3VwLmNoaWxkcmVuLCAoY2hpbGQ6IFVybFNlZ21lbnRHcm91cCwgbmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjaGlsZHJlbltuYW1lXSA9IHRoaXMuY3JlYXRlU2VnbWVudEdyb3VwKHJlZGlyZWN0VG8sIGNoaWxkLCBzZWdtZW50cywgcG9zUGFyYW1zKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgVXJsU2VnbWVudEdyb3VwKHVwZGF0ZWRTZWdtZW50cywgY2hpbGRyZW4pO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVTZWdtZW50cyhcbiAgICAgIHJlZGlyZWN0VG86IHN0cmluZywgcmVkaXJlY3RUb1NlZ21lbnRzOiBVcmxTZWdtZW50W10sIGFjdHVhbFNlZ21lbnRzOiBVcmxTZWdtZW50W10sXG4gICAgICBwb3NQYXJhbXM6IHtbazogc3RyaW5nXTogVXJsU2VnbWVudH0pOiBVcmxTZWdtZW50W10ge1xuICAgIHJldHVybiByZWRpcmVjdFRvU2VnbWVudHMubWFwKFxuICAgICAgICBzID0+IHMucGF0aC5zdGFydHNXaXRoKCc6JykgPyB0aGlzLmZpbmRQb3NQYXJhbShyZWRpcmVjdFRvLCBzLCBwb3NQYXJhbXMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5kT3JSZXR1cm4ocywgYWN0dWFsU2VnbWVudHMpKTtcbiAgfVxuXG4gIHByaXZhdGUgZmluZFBvc1BhcmFtKFxuICAgICAgcmVkaXJlY3RUbzogc3RyaW5nLCByZWRpcmVjdFRvVXJsU2VnbWVudDogVXJsU2VnbWVudCxcbiAgICAgIHBvc1BhcmFtczoge1trOiBzdHJpbmddOiBVcmxTZWdtZW50fSk6IFVybFNlZ21lbnQge1xuICAgIGNvbnN0IHBvcyA9IHBvc1BhcmFtc1tyZWRpcmVjdFRvVXJsU2VnbWVudC5wYXRoLnN1YnN0cmluZygxKV07XG4gICAgaWYgKCFwb3MpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYENhbm5vdCByZWRpcmVjdCB0byAnJHtyZWRpcmVjdFRvfScuIENhbm5vdCBmaW5kICcke3JlZGlyZWN0VG9VcmxTZWdtZW50LnBhdGh9Jy5gKTtcbiAgICByZXR1cm4gcG9zO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kT3JSZXR1cm4ocmVkaXJlY3RUb1VybFNlZ21lbnQ6IFVybFNlZ21lbnQsIGFjdHVhbFNlZ21lbnRzOiBVcmxTZWdtZW50W10pOiBVcmxTZWdtZW50IHtcbiAgICBsZXQgaWR4ID0gMDtcbiAgICBmb3IgKGNvbnN0IHMgb2YgYWN0dWFsU2VnbWVudHMpIHtcbiAgICAgIGlmIChzLnBhdGggPT09IHJlZGlyZWN0VG9VcmxTZWdtZW50LnBhdGgpIHtcbiAgICAgICAgYWN0dWFsU2VnbWVudHMuc3BsaWNlKGlkeCk7XG4gICAgICAgIHJldHVybiBzO1xuICAgICAgfVxuICAgICAgaWR4Kys7XG4gICAgfVxuICAgIHJldHVybiByZWRpcmVjdFRvVXJsU2VnbWVudDtcbiAgfVxufVxuXG5mdW5jdGlvbiBydW5DYW5Mb2FkR3VhcmQobW9kdWxlSW5qZWN0b3I6IEluamVjdG9yLCByb3V0ZTogUm91dGUpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgY29uc3QgY2FuTG9hZCA9IHJvdXRlLmNhbkxvYWQ7XG4gIGlmICghY2FuTG9hZCB8fCBjYW5Mb2FkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG9mICh0cnVlKTtcblxuICBjb25zdCBvYnMgPSBmcm9tKGNhbkxvYWQpLnBpcGUobWFwKChpbmplY3Rpb25Ub2tlbjogYW55KSA9PiB7XG4gICAgY29uc3QgZ3VhcmQgPSBtb2R1bGVJbmplY3Rvci5nZXQoaW5qZWN0aW9uVG9rZW4pO1xuICAgIHJldHVybiB3cmFwSW50b09ic2VydmFibGUoZ3VhcmQuY2FuTG9hZCA/IGd1YXJkLmNhbkxvYWQocm91dGUpIDogZ3VhcmQocm91dGUpKTtcbiAgfSkpO1xuXG4gIHJldHVybiBhbmRPYnNlcnZhYmxlcyhvYnMpO1xufVxuXG5mdW5jdGlvbiBtYXRjaChzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCwgcm91dGU6IFJvdXRlLCBzZWdtZW50czogVXJsU2VnbWVudFtdKToge1xuICBtYXRjaGVkOiBib29sZWFuLFxuICBjb25zdW1lZFNlZ21lbnRzOiBVcmxTZWdtZW50W10sXG4gIGxhc3RDaGlsZDogbnVtYmVyLFxuICBwb3NpdGlvbmFsUGFyYW1TZWdtZW50czoge1trOiBzdHJpbmddOiBVcmxTZWdtZW50fVxufSB7XG4gIGlmIChyb3V0ZS5wYXRoID09PSAnJykge1xuICAgIGlmICgocm91dGUucGF0aE1hdGNoID09PSAnZnVsbCcpICYmIChzZWdtZW50R3JvdXAuaGFzQ2hpbGRyZW4oKSB8fCBzZWdtZW50cy5sZW5ndGggPiAwKSkge1xuICAgICAgcmV0dXJuIHttYXRjaGVkOiBmYWxzZSwgY29uc3VtZWRTZWdtZW50czogW10sIGxhc3RDaGlsZDogMCwgcG9zaXRpb25hbFBhcmFtU2VnbWVudHM6IHt9fTtcbiAgICB9XG5cbiAgICByZXR1cm4ge21hdGNoZWQ6IHRydWUsIGNvbnN1bWVkU2VnbWVudHM6IFtdLCBsYXN0Q2hpbGQ6IDAsIHBvc2l0aW9uYWxQYXJhbVNlZ21lbnRzOiB7fX07XG4gIH1cblxuICBjb25zdCBtYXRjaGVyID0gcm91dGUubWF0Y2hlciB8fCBkZWZhdWx0VXJsTWF0Y2hlcjtcbiAgY29uc3QgcmVzID0gbWF0Y2hlcihzZWdtZW50cywgc2VnbWVudEdyb3VwLCByb3V0ZSk7XG5cbiAgaWYgKCFyZXMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hlZDogZmFsc2UsXG4gICAgICBjb25zdW1lZFNlZ21lbnRzOiA8YW55W10+W10sXG4gICAgICBsYXN0Q2hpbGQ6IDAsXG4gICAgICBwb3NpdGlvbmFsUGFyYW1TZWdtZW50czoge30sXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbWF0Y2hlZDogdHJ1ZSxcbiAgICBjb25zdW1lZFNlZ21lbnRzOiByZXMuY29uc3VtZWQgISxcbiAgICBsYXN0Q2hpbGQ6IHJlcy5jb25zdW1lZC5sZW5ndGggISxcbiAgICBwb3NpdGlvbmFsUGFyYW1TZWdtZW50czogcmVzLnBvc1BhcmFtcyAhLFxuICB9O1xufVxuXG5mdW5jdGlvbiBzcGxpdChcbiAgICBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCwgY29uc3VtZWRTZWdtZW50czogVXJsU2VnbWVudFtdLCBzbGljZWRTZWdtZW50czogVXJsU2VnbWVudFtdLFxuICAgIGNvbmZpZzogUm91dGVbXSkge1xuICBpZiAoc2xpY2VkU2VnbWVudHMubGVuZ3RoID4gMCAmJlxuICAgICAgY29udGFpbnNFbXB0eVBhdGhSZWRpcmVjdHNXaXRoTmFtZWRPdXRsZXRzKHNlZ21lbnRHcm91cCwgc2xpY2VkU2VnbWVudHMsIGNvbmZpZykpIHtcbiAgICBjb25zdCBzID0gbmV3IFVybFNlZ21lbnRHcm91cChcbiAgICAgICAgY29uc3VtZWRTZWdtZW50cywgY3JlYXRlQ2hpbGRyZW5Gb3JFbXB0eVNlZ21lbnRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLCBuZXcgVXJsU2VnbWVudEdyb3VwKHNsaWNlZFNlZ21lbnRzLCBzZWdtZW50R3JvdXAuY2hpbGRyZW4pKSk7XG4gICAgcmV0dXJuIHtzZWdtZW50R3JvdXA6IG1lcmdlVHJpdmlhbENoaWxkcmVuKHMpLCBzbGljZWRTZWdtZW50czogW119O1xuICB9XG5cbiAgaWYgKHNsaWNlZFNlZ21lbnRzLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgY29udGFpbnNFbXB0eVBhdGhSZWRpcmVjdHMoc2VnbWVudEdyb3VwLCBzbGljZWRTZWdtZW50cywgY29uZmlnKSkge1xuICAgIGNvbnN0IHMgPSBuZXcgVXJsU2VnbWVudEdyb3VwKFxuICAgICAgICBzZWdtZW50R3JvdXAuc2VnbWVudHMsIGFkZEVtcHR5U2VnbWVudHNUb0NoaWxkcmVuSWZOZWVkZWQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnRHcm91cCwgc2xpY2VkU2VnbWVudHMsIGNvbmZpZywgc2VnbWVudEdyb3VwLmNoaWxkcmVuKSk7XG4gICAgcmV0dXJuIHtzZWdtZW50R3JvdXA6IG1lcmdlVHJpdmlhbENoaWxkcmVuKHMpLCBzbGljZWRTZWdtZW50c307XG4gIH1cblxuICByZXR1cm4ge3NlZ21lbnRHcm91cCwgc2xpY2VkU2VnbWVudHN9O1xufVxuXG5mdW5jdGlvbiBtZXJnZVRyaXZpYWxDaGlsZHJlbihzOiBVcmxTZWdtZW50R3JvdXApOiBVcmxTZWdtZW50R3JvdXAge1xuICBpZiAocy5udW1iZXJPZkNoaWxkcmVuID09PSAxICYmIHMuY2hpbGRyZW5bUFJJTUFSWV9PVVRMRVRdKSB7XG4gICAgY29uc3QgYyA9IHMuY2hpbGRyZW5bUFJJTUFSWV9PVVRMRVRdO1xuICAgIHJldHVybiBuZXcgVXJsU2VnbWVudEdyb3VwKHMuc2VnbWVudHMuY29uY2F0KGMuc2VnbWVudHMpLCBjLmNoaWxkcmVuKTtcbiAgfVxuXG4gIHJldHVybiBzO1xufVxuXG5mdW5jdGlvbiBhZGRFbXB0eVNlZ21lbnRzVG9DaGlsZHJlbklmTmVlZGVkKFxuICAgIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCBzbGljZWRTZWdtZW50czogVXJsU2VnbWVudFtdLCByb3V0ZXM6IFJvdXRlW10sXG4gICAgY2hpbGRyZW46IHtbbmFtZTogc3RyaW5nXTogVXJsU2VnbWVudEdyb3VwfSk6IHtbbmFtZTogc3RyaW5nXTogVXJsU2VnbWVudEdyb3VwfSB7XG4gIGNvbnN0IHJlczoge1tuYW1lOiBzdHJpbmddOiBVcmxTZWdtZW50R3JvdXB9ID0ge307XG4gIGZvciAoY29uc3QgciBvZiByb3V0ZXMpIHtcbiAgICBpZiAoaXNFbXB0eVBhdGhSZWRpcmVjdChzZWdtZW50R3JvdXAsIHNsaWNlZFNlZ21lbnRzLCByKSAmJiAhY2hpbGRyZW5bZ2V0T3V0bGV0KHIpXSkge1xuICAgICAgcmVzW2dldE91dGxldChyKV0gPSBuZXcgVXJsU2VnbWVudEdyb3VwKFtdLCB7fSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB7Li4uY2hpbGRyZW4sIC4uLnJlc307XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNoaWxkcmVuRm9yRW1wdHlTZWdtZW50cyhcbiAgICByb3V0ZXM6IFJvdXRlW10sIHByaW1hcnlTZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCk6IHtbbmFtZTogc3RyaW5nXTogVXJsU2VnbWVudEdyb3VwfSB7XG4gIGNvbnN0IHJlczoge1tuYW1lOiBzdHJpbmddOiBVcmxTZWdtZW50R3JvdXB9ID0ge307XG4gIHJlc1tQUklNQVJZX09VVExFVF0gPSBwcmltYXJ5U2VnbWVudEdyb3VwO1xuICBmb3IgKGNvbnN0IHIgb2Ygcm91dGVzKSB7XG4gICAgaWYgKHIucGF0aCA9PT0gJycgJiYgZ2V0T3V0bGV0KHIpICE9PSBQUklNQVJZX09VVExFVCkge1xuICAgICAgcmVzW2dldE91dGxldChyKV0gPSBuZXcgVXJsU2VnbWVudEdyb3VwKFtdLCB7fSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5zRW1wdHlQYXRoUmVkaXJlY3RzV2l0aE5hbWVkT3V0bGV0cyhcbiAgICBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCwgc2VnbWVudHM6IFVybFNlZ21lbnRbXSwgcm91dGVzOiBSb3V0ZVtdKTogYm9vbGVhbiB7XG4gIHJldHVybiByb3V0ZXMuc29tZShcbiAgICAgIHIgPT4gaXNFbXB0eVBhdGhSZWRpcmVjdChzZWdtZW50R3JvdXAsIHNlZ21lbnRzLCByKSAmJiBnZXRPdXRsZXQocikgIT09IFBSSU1BUllfT1VUTEVUKTtcbn1cblxuZnVuY3Rpb24gY29udGFpbnNFbXB0eVBhdGhSZWRpcmVjdHMoXG4gICAgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHNlZ21lbnRzOiBVcmxTZWdtZW50W10sIHJvdXRlczogUm91dGVbXSk6IGJvb2xlYW4ge1xuICByZXR1cm4gcm91dGVzLnNvbWUociA9PiBpc0VtcHR5UGF0aFJlZGlyZWN0KHNlZ21lbnRHcm91cCwgc2VnbWVudHMsIHIpKTtcbn1cblxuZnVuY3Rpb24gaXNFbXB0eVBhdGhSZWRpcmVjdChcbiAgICBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCwgc2VnbWVudHM6IFVybFNlZ21lbnRbXSwgcjogUm91dGUpOiBib29sZWFuIHtcbiAgaWYgKChzZWdtZW50R3JvdXAuaGFzQ2hpbGRyZW4oKSB8fCBzZWdtZW50cy5sZW5ndGggPiAwKSAmJiByLnBhdGhNYXRjaCA9PT0gJ2Z1bGwnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHIucGF0aCA9PT0gJycgJiYgci5yZWRpcmVjdFRvICE9PSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGdldE91dGxldChyb3V0ZTogUm91dGUpOiBzdHJpbmcge1xuICByZXR1cm4gcm91dGUub3V0bGV0IHx8IFBSSU1BUllfT1VUTEVUO1xufVxuIl19