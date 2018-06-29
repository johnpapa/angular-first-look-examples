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
import { Observable, of } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot, inheritedParamsDataResolve } from './router_state';
import { PRIMARY_OUTLET, defaultUrlMatcher } from './shared';
import { UrlSegmentGroup, mapChildrenIntoArray } from './url_tree';
import { forEach, last } from './utils/collection';
import { TreeNode } from './utils/tree';
class NoMatch {
}
/**
 * @param {?} rootComponentType
 * @param {?} config
 * @param {?} urlTree
 * @param {?} url
 * @param {?=} paramsInheritanceStrategy
 * @return {?}
 */
export function recognize(rootComponentType, config, urlTree, url, paramsInheritanceStrategy = 'emptyOnly') {
    return new Recognizer(rootComponentType, config, urlTree, url, paramsInheritanceStrategy)
        .recognize();
}
class Recognizer {
    /**
     * @param {?} rootComponentType
     * @param {?} config
     * @param {?} urlTree
     * @param {?} url
     * @param {?} paramsInheritanceStrategy
     */
    constructor(rootComponentType, config, urlTree, url, paramsInheritanceStrategy) {
        this.rootComponentType = rootComponentType;
        this.config = config;
        this.urlTree = urlTree;
        this.url = url;
        this.paramsInheritanceStrategy = paramsInheritanceStrategy;
    }
    /**
     * @return {?}
     */
    recognize() {
        try {
            const /** @type {?} */ rootSegmentGroup = split(this.urlTree.root, [], [], this.config).segmentGroup;
            const /** @type {?} */ children = this.processSegmentGroup(this.config, rootSegmentGroup, PRIMARY_OUTLET);
            const /** @type {?} */ root = new ActivatedRouteSnapshot([], Object.freeze({}), Object.freeze(Object.assign({}, this.urlTree.queryParams)), /** @type {?} */ ((this.urlTree.fragment)), {}, PRIMARY_OUTLET, this.rootComponentType, null, this.urlTree.root, -1, {});
            const /** @type {?} */ rootNode = new TreeNode(root, children);
            const /** @type {?} */ routeState = new RouterStateSnapshot(this.url, rootNode);
            this.inheritParamsAndData(routeState._root);
            return of(routeState);
        }
        catch (/** @type {?} */ e) {
            return new Observable((obs) => obs.error(e));
        }
    }
    /**
     * @param {?} routeNode
     * @return {?}
     */
    inheritParamsAndData(routeNode) {
        const /** @type {?} */ route = routeNode.value;
        const /** @type {?} */ i = inheritedParamsDataResolve(route, this.paramsInheritanceStrategy);
        route.params = Object.freeze(i.params);
        route.data = Object.freeze(i.data);
        routeNode.children.forEach(n => this.inheritParamsAndData(n));
    }
    /**
     * @param {?} config
     * @param {?} segmentGroup
     * @param {?} outlet
     * @return {?}
     */
    processSegmentGroup(config, segmentGroup, outlet) {
        if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
            return this.processChildren(config, segmentGroup);
        }
        return this.processSegment(config, segmentGroup, segmentGroup.segments, outlet);
    }
    /**
     * @param {?} config
     * @param {?} segmentGroup
     * @return {?}
     */
    processChildren(config, segmentGroup) {
        const /** @type {?} */ children = mapChildrenIntoArray(segmentGroup, (child, childOutlet) => this.processSegmentGroup(config, child, childOutlet));
        checkOutletNameUniqueness(children);
        sortActivatedRouteSnapshots(children);
        return children;
    }
    /**
     * @param {?} config
     * @param {?} segmentGroup
     * @param {?} segments
     * @param {?} outlet
     * @return {?}
     */
    processSegment(config, segmentGroup, segments, outlet) {
        for (const /** @type {?} */ r of config) {
            try {
                return this.processSegmentAgainstRoute(r, segmentGroup, segments, outlet);
            }
            catch (/** @type {?} */ e) {
                if (!(e instanceof NoMatch))
                    throw e;
            }
        }
        if (this.noLeftoversInUrl(segmentGroup, segments, outlet)) {
            return [];
        }
        throw new NoMatch();
    }
    /**
     * @param {?} segmentGroup
     * @param {?} segments
     * @param {?} outlet
     * @return {?}
     */
    noLeftoversInUrl(segmentGroup, segments, outlet) {
        return segments.length === 0 && !segmentGroup.children[outlet];
    }
    /**
     * @param {?} route
     * @param {?} rawSegment
     * @param {?} segments
     * @param {?} outlet
     * @return {?}
     */
    processSegmentAgainstRoute(route, rawSegment, segments, outlet) {
        if (route.redirectTo)
            throw new NoMatch();
        if ((route.outlet || PRIMARY_OUTLET) !== outlet)
            throw new NoMatch();
        let /** @type {?} */ snapshot;
        let /** @type {?} */ consumedSegments = [];
        let /** @type {?} */ rawSlicedSegments = [];
        if (route.path === '**') {
            const /** @type {?} */ params = segments.length > 0 ? /** @type {?} */ ((last(segments))).parameters : {};
            snapshot = new ActivatedRouteSnapshot(segments, params, Object.freeze(Object.assign({}, this.urlTree.queryParams)), /** @type {?} */ ((this.urlTree.fragment)), getData(route), outlet, /** @type {?} */ ((route.component)), route, getSourceSegmentGroup(rawSegment), getPathIndexShift(rawSegment) + segments.length, getResolve(route));
        }
        else {
            const /** @type {?} */ result = match(rawSegment, route, segments);
            consumedSegments = result.consumedSegments;
            rawSlicedSegments = segments.slice(result.lastChild);
            snapshot = new ActivatedRouteSnapshot(consumedSegments, result.parameters, Object.freeze(Object.assign({}, this.urlTree.queryParams)), /** @type {?} */ ((this.urlTree.fragment)), getData(route), outlet, /** @type {?} */ ((route.component)), route, getSourceSegmentGroup(rawSegment), getPathIndexShift(rawSegment) + consumedSegments.length, getResolve(route));
        }
        const /** @type {?} */ childConfig = getChildConfig(route);
        const { segmentGroup, slicedSegments } = split(rawSegment, consumedSegments, rawSlicedSegments, childConfig);
        if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
            const /** @type {?} */ children = this.processChildren(childConfig, segmentGroup);
            return [new TreeNode(snapshot, children)];
        }
        if (childConfig.length === 0 && slicedSegments.length === 0) {
            return [new TreeNode(snapshot, [])];
        }
        const /** @type {?} */ children = this.processSegment(childConfig, segmentGroup, slicedSegments, PRIMARY_OUTLET);
        return [new TreeNode(snapshot, children)];
    }
}
function Recognizer_tsickle_Closure_declarations() {
    /** @type {?} */
    Recognizer.prototype.rootComponentType;
    /** @type {?} */
    Recognizer.prototype.config;
    /** @type {?} */
    Recognizer.prototype.urlTree;
    /** @type {?} */
    Recognizer.prototype.url;
    /** @type {?} */
    Recognizer.prototype.paramsInheritanceStrategy;
}
/**
 * @param {?} nodes
 * @return {?}
 */
function sortActivatedRouteSnapshots(nodes) {
    nodes.sort((a, b) => {
        if (a.value.outlet === PRIMARY_OUTLET)
            return -1;
        if (b.value.outlet === PRIMARY_OUTLET)
            return 1;
        return a.value.outlet.localeCompare(b.value.outlet);
    });
}
/**
 * @param {?} route
 * @return {?}
 */
function getChildConfig(route) {
    if (route.children) {
        return route.children;
    }
    if (route.loadChildren) {
        return /** @type {?} */ ((route._loadedConfig)).routes;
    }
    return [];
}
/**
 * @record
 */
function MatchResult() { }
function MatchResult_tsickle_Closure_declarations() {
    /** @type {?} */
    MatchResult.prototype.consumedSegments;
    /** @type {?} */
    MatchResult.prototype.lastChild;
    /** @type {?} */
    MatchResult.prototype.parameters;
}
/**
 * @param {?} segmentGroup
 * @param {?} route
 * @param {?} segments
 * @return {?}
 */
function match(segmentGroup, route, segments) {
    if (route.path === '') {
        if (route.pathMatch === 'full' && (segmentGroup.hasChildren() || segments.length > 0)) {
            throw new NoMatch();
        }
        return { consumedSegments: [], lastChild: 0, parameters: {} };
    }
    const /** @type {?} */ matcher = route.matcher || defaultUrlMatcher;
    const /** @type {?} */ res = matcher(segments, segmentGroup, route);
    if (!res)
        throw new NoMatch();
    const /** @type {?} */ posParams = {};
    forEach(/** @type {?} */ ((res.posParams)), (v, k) => { posParams[k] = v.path; });
    const /** @type {?} */ parameters = res.consumed.length > 0 ? Object.assign({}, posParams, res.consumed[res.consumed.length - 1].parameters) :
        posParams;
    return { consumedSegments: res.consumed, lastChild: res.consumed.length, parameters };
}
/**
 * @param {?} nodes
 * @return {?}
 */
function checkOutletNameUniqueness(nodes) {
    const /** @type {?} */ names = {};
    nodes.forEach(n => {
        const /** @type {?} */ routeWithSameOutletName = names[n.value.outlet];
        if (routeWithSameOutletName) {
            const /** @type {?} */ p = routeWithSameOutletName.url.map(s => s.toString()).join('/');
            const /** @type {?} */ c = n.value.url.map(s => s.toString()).join('/');
            throw new Error(`Two segments cannot have the same outlet name: '${p}' and '${c}'.`);
        }
        names[n.value.outlet] = n.value;
    });
}
/**
 * @param {?} segmentGroup
 * @return {?}
 */
function getSourceSegmentGroup(segmentGroup) {
    let /** @type {?} */ s = segmentGroup;
    while (s._sourceSegment) {
        s = s._sourceSegment;
    }
    return s;
}
/**
 * @param {?} segmentGroup
 * @return {?}
 */
function getPathIndexShift(segmentGroup) {
    let /** @type {?} */ s = segmentGroup;
    let /** @type {?} */ res = (s._segmentIndexShift ? s._segmentIndexShift : 0);
    while (s._sourceSegment) {
        s = s._sourceSegment;
        res += (s._segmentIndexShift ? s._segmentIndexShift : 0);
    }
    return res - 1;
}
/**
 * @param {?} segmentGroup
 * @param {?} consumedSegments
 * @param {?} slicedSegments
 * @param {?} config
 * @return {?}
 */
function split(segmentGroup, consumedSegments, slicedSegments, config) {
    if (slicedSegments.length > 0 &&
        containsEmptyPathMatchesWithNamedOutlets(segmentGroup, slicedSegments, config)) {
        const /** @type {?} */ s = new UrlSegmentGroup(consumedSegments, createChildrenForEmptyPaths(segmentGroup, consumedSegments, config, new UrlSegmentGroup(slicedSegments, segmentGroup.children)));
        s._sourceSegment = segmentGroup;
        s._segmentIndexShift = consumedSegments.length;
        return { segmentGroup: s, slicedSegments: [] };
    }
    if (slicedSegments.length === 0 &&
        containsEmptyPathMatches(segmentGroup, slicedSegments, config)) {
        const /** @type {?} */ s = new UrlSegmentGroup(segmentGroup.segments, addEmptyPathsToChildrenIfNeeded(segmentGroup, slicedSegments, config, segmentGroup.children));
        s._sourceSegment = segmentGroup;
        s._segmentIndexShift = consumedSegments.length;
        return { segmentGroup: s, slicedSegments };
    }
    const /** @type {?} */ s = new UrlSegmentGroup(segmentGroup.segments, segmentGroup.children);
    s._sourceSegment = segmentGroup;
    s._segmentIndexShift = consumedSegments.length;
    return { segmentGroup: s, slicedSegments };
}
/**
 * @param {?} segmentGroup
 * @param {?} slicedSegments
 * @param {?} routes
 * @param {?} children
 * @return {?}
 */
function addEmptyPathsToChildrenIfNeeded(segmentGroup, slicedSegments, routes, children) {
    const /** @type {?} */ res = {};
    for (const /** @type {?} */ r of routes) {
        if (emptyPathMatch(segmentGroup, slicedSegments, r) && !children[getOutlet(r)]) {
            const /** @type {?} */ s = new UrlSegmentGroup([], {});
            s._sourceSegment = segmentGroup;
            s._segmentIndexShift = segmentGroup.segments.length;
            res[getOutlet(r)] = s;
        }
    }
    return Object.assign({}, children, res);
}
/**
 * @param {?} segmentGroup
 * @param {?} consumedSegments
 * @param {?} routes
 * @param {?} primarySegment
 * @return {?}
 */
function createChildrenForEmptyPaths(segmentGroup, consumedSegments, routes, primarySegment) {
    const /** @type {?} */ res = {};
    res[PRIMARY_OUTLET] = primarySegment;
    primarySegment._sourceSegment = segmentGroup;
    primarySegment._segmentIndexShift = consumedSegments.length;
    for (const /** @type {?} */ r of routes) {
        if (r.path === '' && getOutlet(r) !== PRIMARY_OUTLET) {
            const /** @type {?} */ s = new UrlSegmentGroup([], {});
            s._sourceSegment = segmentGroup;
            s._segmentIndexShift = consumedSegments.length;
            res[getOutlet(r)] = s;
        }
    }
    return res;
}
/**
 * @param {?} segmentGroup
 * @param {?} slicedSegments
 * @param {?} routes
 * @return {?}
 */
function containsEmptyPathMatchesWithNamedOutlets(segmentGroup, slicedSegments, routes) {
    return routes.some(r => emptyPathMatch(segmentGroup, slicedSegments, r) && getOutlet(r) !== PRIMARY_OUTLET);
}
/**
 * @param {?} segmentGroup
 * @param {?} slicedSegments
 * @param {?} routes
 * @return {?}
 */
function containsEmptyPathMatches(segmentGroup, slicedSegments, routes) {
    return routes.some(r => emptyPathMatch(segmentGroup, slicedSegments, r));
}
/**
 * @param {?} segmentGroup
 * @param {?} slicedSegments
 * @param {?} r
 * @return {?}
 */
function emptyPathMatch(segmentGroup, slicedSegments, r) {
    if ((segmentGroup.hasChildren() || slicedSegments.length > 0) && r.pathMatch === 'full') {
        return false;
    }
    return r.path === '' && r.redirectTo === undefined;
}
/**
 * @param {?} route
 * @return {?}
 */
function getOutlet(route) {
    return route.outlet || PRIMARY_OUTLET;
}
/**
 * @param {?} route
 * @return {?}
 */
function getData(route) {
    return route.data || {};
}
/**
 * @param {?} route
 * @return {?}
 */
function getResolve(route) {
    return route.resolve || {};
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb2duaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9yZWNvZ25pemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFTQSxPQUFPLEVBQUMsVUFBVSxFQUFZLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUcvQyxPQUFPLEVBQUMsc0JBQXNCLEVBQTZCLG1CQUFtQixFQUFFLDBCQUEwQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEksT0FBTyxFQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUMzRCxPQUFPLEVBQWEsZUFBZSxFQUFXLG9CQUFvQixFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3RGLE9BQU8sRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUV0QztDQUFnQjs7Ozs7Ozs7O0FBRWhCLE1BQU0sb0JBQ0YsaUJBQWtDLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsR0FBVyxFQUNqRiw0QkFDSSxXQUFXO0lBQ2pCLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSx5QkFBeUIsQ0FBQztTQUNwRixTQUFTLEVBQUUsQ0FBQztDQUNsQjtBQUVEOzs7Ozs7OztJQUNFLFlBQ1ksbUJBQTJDLE1BQWMsRUFBVSxPQUFnQixFQUNuRixLQUFxQix5QkFBb0Q7UUFEekUsc0JBQWlCLEdBQWpCLGlCQUFpQjtRQUEwQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUNuRixRQUFHLEdBQUgsR0FBRztRQUFrQiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO0tBQUk7Ozs7SUFFekYsU0FBUztRQUNQLElBQUksQ0FB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QUFjLENBQUMsWUFBWSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzFFOzs7Ozs7O0FBRUQsd0JBQ0ksWUFBNkIsRUFBRSxjQUE0QixFQUFFLENBQVE7SUFDdkUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLElBQUksY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDeEYsTUFBTSxDQUFDLEtBQUssQ0FBQztLQUNkO0lBRUQsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDO0NBQ3BEOzs7OztBQUVELG1CQUFtQixLQUFZO0lBQzdCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLGNBQWMsQ0FBQztDQUN2Qzs7Ozs7QUFFRCxpQkFBaUIsS0FBWTtJQUMzQixNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7Q0FDekI7Ozs7O0FBRUQsb0JBQW9CLEtBQVk7SUFDOUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO0NBQzVCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1R5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlciwgb2YgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtEYXRhLCBSZXNvbHZlRGF0YSwgUm91dGUsIFJvdXRlc30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBQYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5LCBSb3V0ZXJTdGF0ZVNuYXBzaG90LCBpbmhlcml0ZWRQYXJhbXNEYXRhUmVzb2x2ZX0gZnJvbSAnLi9yb3V0ZXJfc3RhdGUnO1xuaW1wb3J0IHtQUklNQVJZX09VVExFVCwgZGVmYXVsdFVybE1hdGNoZXJ9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7VXJsU2VnbWVudCwgVXJsU2VnbWVudEdyb3VwLCBVcmxUcmVlLCBtYXBDaGlsZHJlbkludG9BcnJheX0gZnJvbSAnLi91cmxfdHJlZSc7XG5pbXBvcnQge2ZvckVhY2gsIGxhc3R9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbic7XG5pbXBvcnQge1RyZWVOb2RlfSBmcm9tICcuL3V0aWxzL3RyZWUnO1xuXG5jbGFzcyBOb01hdGNoIHt9XG5cbmV4cG9ydCBmdW5jdGlvbiByZWNvZ25pemUoXG4gICAgcm9vdENvbXBvbmVudFR5cGU6IFR5cGU8YW55PnwgbnVsbCwgY29uZmlnOiBSb3V0ZXMsIHVybFRyZWU6IFVybFRyZWUsIHVybDogc3RyaW5nLFxuICAgIHBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3k6IFBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3kgPVxuICAgICAgICAnZW1wdHlPbmx5Jyk6IE9ic2VydmFibGU8Um91dGVyU3RhdGVTbmFwc2hvdD4ge1xuICByZXR1cm4gbmV3IFJlY29nbml6ZXIocm9vdENvbXBvbmVudFR5cGUsIGNvbmZpZywgdXJsVHJlZSwgdXJsLCBwYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5KVxuICAgICAgLnJlY29nbml6ZSgpO1xufVxuXG5jbGFzcyBSZWNvZ25pemVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHJvb3RDb21wb25lbnRUeXBlOiBUeXBlPGFueT58bnVsbCwgcHJpdmF0ZSBjb25maWc6IFJvdXRlcywgcHJpdmF0ZSB1cmxUcmVlOiBVcmxUcmVlLFxuICAgICAgcHJpdmF0ZSB1cmw6IHN0cmluZywgcHJpdmF0ZSBwYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5OiBQYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5KSB7fVxuXG4gIHJlY29nbml6ZSgpOiBPYnNlcnZhYmxlPFJvdXRlclN0YXRlU25hcHNob3Q+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgcm9vdFNlZ21lbnRHcm91cCA9IHNwbGl0KHRoaXMudXJsVHJlZS5yb290LCBbXSwgW10sIHRoaXMuY29uZmlnKS5zZWdtZW50R3JvdXA7XG5cbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5wcm9jZXNzU2VnbWVudEdyb3VwKHRoaXMuY29uZmlnLCByb290U2VnbWVudEdyb3VwLCBQUklNQVJZX09VVExFVCk7XG5cbiAgICAgIGNvbnN0IHJvb3QgPSBuZXcgQWN0aXZhdGVkUm91dGVTbmFwc2hvdChcbiAgICAgICAgICBbXSwgT2JqZWN0LmZyZWV6ZSh7fSksIE9iamVjdC5mcmVlemUoey4uLnRoaXMudXJsVHJlZS5xdWVyeVBhcmFtc30pLFxuICAgICAgICAgIHRoaXMudXJsVHJlZS5mcmFnbWVudCAhLCB7fSwgUFJJTUFSWV9PVVRMRVQsIHRoaXMucm9vdENvbXBvbmVudFR5cGUsIG51bGwsXG4gICAgICAgICAgdGhpcy51cmxUcmVlLnJvb3QsIC0xLCB7fSk7XG5cbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gbmV3IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+KHJvb3QsIGNoaWxkcmVuKTtcbiAgICAgIGNvbnN0IHJvdXRlU3RhdGUgPSBuZXcgUm91dGVyU3RhdGVTbmFwc2hvdCh0aGlzLnVybCwgcm9vdE5vZGUpO1xuICAgICAgdGhpcy5pbmhlcml0UGFyYW1zQW5kRGF0YShyb3V0ZVN0YXRlLl9yb290KTtcbiAgICAgIHJldHVybiBvZiAocm91dGVTdGF0ZSk7XG5cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8Um91dGVyU3RhdGVTbmFwc2hvdD4oXG4gICAgICAgICAgKG9iczogT2JzZXJ2ZXI8Um91dGVyU3RhdGVTbmFwc2hvdD4pID0+IG9icy5lcnJvcihlKSk7XG4gICAgfVxuICB9XG5cbiAgaW5oZXJpdFBhcmFtc0FuZERhdGEocm91dGVOb2RlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90Pik6IHZvaWQge1xuICAgIGNvbnN0IHJvdXRlID0gcm91dGVOb2RlLnZhbHVlO1xuXG4gICAgY29uc3QgaSA9IGluaGVyaXRlZFBhcmFtc0RhdGFSZXNvbHZlKHJvdXRlLCB0aGlzLnBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3kpO1xuICAgIHJvdXRlLnBhcmFtcyA9IE9iamVjdC5mcmVlemUoaS5wYXJhbXMpO1xuICAgIHJvdXRlLmRhdGEgPSBPYmplY3QuZnJlZXplKGkuZGF0YSk7XG5cbiAgICByb3V0ZU5vZGUuY2hpbGRyZW4uZm9yRWFjaChuID0+IHRoaXMuaW5oZXJpdFBhcmFtc0FuZERhdGEobikpO1xuICB9XG5cbiAgcHJvY2Vzc1NlZ21lbnRHcm91cChjb25maWc6IFJvdXRlW10sIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCBvdXRsZXQ6IHN0cmluZyk6XG4gICAgICBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PltdIHtcbiAgICBpZiAoc2VnbWVudEdyb3VwLnNlZ21lbnRzLmxlbmd0aCA9PT0gMCAmJiBzZWdtZW50R3JvdXAuaGFzQ2hpbGRyZW4oKSkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0NoaWxkcmVuKGNvbmZpZywgc2VnbWVudEdyb3VwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wcm9jZXNzU2VnbWVudChjb25maWcsIHNlZ21lbnRHcm91cCwgc2VnbWVudEdyb3VwLnNlZ21lbnRzLCBvdXRsZXQpO1xuICB9XG5cbiAgcHJvY2Vzc0NoaWxkcmVuKGNvbmZpZzogUm91dGVbXSwgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXApOlxuICAgICAgVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD5bXSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBtYXBDaGlsZHJlbkludG9BcnJheShcbiAgICAgICAgc2VnbWVudEdyb3VwLCAoY2hpbGQsIGNoaWxkT3V0bGV0KSA9PiB0aGlzLnByb2Nlc3NTZWdtZW50R3JvdXAoY29uZmlnLCBjaGlsZCwgY2hpbGRPdXRsZXQpKTtcbiAgICBjaGVja091dGxldE5hbWVVbmlxdWVuZXNzKGNoaWxkcmVuKTtcbiAgICBzb3J0QWN0aXZhdGVkUm91dGVTbmFwc2hvdHMoY2hpbGRyZW4pO1xuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfVxuXG4gIHByb2Nlc3NTZWdtZW50KFxuICAgICAgY29uZmlnOiBSb3V0ZVtdLCBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCwgc2VnbWVudHM6IFVybFNlZ21lbnRbXSxcbiAgICAgIG91dGxldDogc3RyaW5nKTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD5bXSB7XG4gICAgZm9yIChjb25zdCByIG9mIGNvbmZpZykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc1NlZ21lbnRBZ2FpbnN0Um91dGUociwgc2VnbWVudEdyb3VwLCBzZWdtZW50cywgb3V0bGV0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIE5vTWF0Y2gpKSB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5ub0xlZnRvdmVyc0luVXJsKHNlZ21lbnRHcm91cCwgc2VnbWVudHMsIG91dGxldCkpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgTm9NYXRjaCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBub0xlZnRvdmVyc0luVXJsKHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCBzZWdtZW50czogVXJsU2VnbWVudFtdLCBvdXRsZXQ6IHN0cmluZyk6XG4gICAgICBib29sZWFuIHtcbiAgICByZXR1cm4gc2VnbWVudHMubGVuZ3RoID09PSAwICYmICFzZWdtZW50R3JvdXAuY2hpbGRyZW5bb3V0bGV0XTtcbiAgfVxuXG4gIHByb2Nlc3NTZWdtZW50QWdhaW5zdFJvdXRlKFxuICAgICAgcm91dGU6IFJvdXRlLCByYXdTZWdtZW50OiBVcmxTZWdtZW50R3JvdXAsIHNlZ21lbnRzOiBVcmxTZWdtZW50W10sXG4gICAgICBvdXRsZXQ6IHN0cmluZyk6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+W10ge1xuICAgIGlmIChyb3V0ZS5yZWRpcmVjdFRvKSB0aHJvdyBuZXcgTm9NYXRjaCgpO1xuXG4gICAgaWYgKChyb3V0ZS5vdXRsZXQgfHwgUFJJTUFSWV9PVVRMRVQpICE9PSBvdXRsZXQpIHRocm93IG5ldyBOb01hdGNoKCk7XG5cbiAgICBsZXQgc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3Q7XG4gICAgbGV0IGNvbnN1bWVkU2VnbWVudHM6IFVybFNlZ21lbnRbXSA9IFtdO1xuICAgIGxldCByYXdTbGljZWRTZWdtZW50czogVXJsU2VnbWVudFtdID0gW107XG5cbiAgICBpZiAocm91dGUucGF0aCA9PT0gJyoqJykge1xuICAgICAgY29uc3QgcGFyYW1zID0gc2VnbWVudHMubGVuZ3RoID4gMCA/IGxhc3Qoc2VnbWVudHMpICEucGFyYW1ldGVycyA6IHt9O1xuICAgICAgc25hcHNob3QgPSBuZXcgQWN0aXZhdGVkUm91dGVTbmFwc2hvdChcbiAgICAgICAgICBzZWdtZW50cywgcGFyYW1zLCBPYmplY3QuZnJlZXplKHsuLi50aGlzLnVybFRyZWUucXVlcnlQYXJhbXN9KSwgdGhpcy51cmxUcmVlLmZyYWdtZW50ICEsXG4gICAgICAgICAgZ2V0RGF0YShyb3V0ZSksIG91dGxldCwgcm91dGUuY29tcG9uZW50ICEsIHJvdXRlLCBnZXRTb3VyY2VTZWdtZW50R3JvdXAocmF3U2VnbWVudCksXG4gICAgICAgICAgZ2V0UGF0aEluZGV4U2hpZnQocmF3U2VnbWVudCkgKyBzZWdtZW50cy5sZW5ndGgsIGdldFJlc29sdmUocm91dGUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcmVzdWx0OiBNYXRjaFJlc3VsdCA9IG1hdGNoKHJhd1NlZ21lbnQsIHJvdXRlLCBzZWdtZW50cyk7XG4gICAgICBjb25zdW1lZFNlZ21lbnRzID0gcmVzdWx0LmNvbnN1bWVkU2VnbWVudHM7XG4gICAgICByYXdTbGljZWRTZWdtZW50cyA9IHNlZ21lbnRzLnNsaWNlKHJlc3VsdC5sYXN0Q2hpbGQpO1xuXG4gICAgICBzbmFwc2hvdCA9IG5ldyBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KFxuICAgICAgICAgIGNvbnN1bWVkU2VnbWVudHMsIHJlc3VsdC5wYXJhbWV0ZXJzLCBPYmplY3QuZnJlZXplKHsuLi50aGlzLnVybFRyZWUucXVlcnlQYXJhbXN9KSxcbiAgICAgICAgICB0aGlzLnVybFRyZWUuZnJhZ21lbnQgISwgZ2V0RGF0YShyb3V0ZSksIG91dGxldCwgcm91dGUuY29tcG9uZW50ICEsIHJvdXRlLFxuICAgICAgICAgIGdldFNvdXJjZVNlZ21lbnRHcm91cChyYXdTZWdtZW50KSxcbiAgICAgICAgICBnZXRQYXRoSW5kZXhTaGlmdChyYXdTZWdtZW50KSArIGNvbnN1bWVkU2VnbWVudHMubGVuZ3RoLCBnZXRSZXNvbHZlKHJvdXRlKSk7XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRDb25maWc6IFJvdXRlW10gPSBnZXRDaGlsZENvbmZpZyhyb3V0ZSk7XG5cbiAgICBjb25zdCB7c2VnbWVudEdyb3VwLCBzbGljZWRTZWdtZW50c30gPVxuICAgICAgICBzcGxpdChyYXdTZWdtZW50LCBjb25zdW1lZFNlZ21lbnRzLCByYXdTbGljZWRTZWdtZW50cywgY2hpbGRDb25maWcpO1xuXG4gICAgaWYgKHNsaWNlZFNlZ21lbnRzLmxlbmd0aCA9PT0gMCAmJiBzZWdtZW50R3JvdXAuaGFzQ2hpbGRyZW4oKSkge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnByb2Nlc3NDaGlsZHJlbihjaGlsZENvbmZpZywgc2VnbWVudEdyb3VwKTtcbiAgICAgIHJldHVybiBbbmV3IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+KHNuYXBzaG90LCBjaGlsZHJlbildO1xuICAgIH1cblxuICAgIGlmIChjaGlsZENvbmZpZy5sZW5ndGggPT09IDAgJiYgc2xpY2VkU2VnbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gW25ldyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PihzbmFwc2hvdCwgW10pXTtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMucHJvY2Vzc1NlZ21lbnQoY2hpbGRDb25maWcsIHNlZ21lbnRHcm91cCwgc2xpY2VkU2VnbWVudHMsIFBSSU1BUllfT1VUTEVUKTtcbiAgICByZXR1cm4gW25ldyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PihzbmFwc2hvdCwgY2hpbGRyZW4pXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzb3J0QWN0aXZhdGVkUm91dGVTbmFwc2hvdHMobm9kZXM6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+W10pOiB2b2lkIHtcbiAgbm9kZXMuc29ydCgoYSwgYikgPT4ge1xuICAgIGlmIChhLnZhbHVlLm91dGxldCA9PT0gUFJJTUFSWV9PVVRMRVQpIHJldHVybiAtMTtcbiAgICBpZiAoYi52YWx1ZS5vdXRsZXQgPT09IFBSSU1BUllfT1VUTEVUKSByZXR1cm4gMTtcbiAgICByZXR1cm4gYS52YWx1ZS5vdXRsZXQubG9jYWxlQ29tcGFyZShiLnZhbHVlLm91dGxldCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRDaGlsZENvbmZpZyhyb3V0ZTogUm91dGUpOiBSb3V0ZVtdIHtcbiAgaWYgKHJvdXRlLmNoaWxkcmVuKSB7XG4gICAgcmV0dXJuIHJvdXRlLmNoaWxkcmVuO1xuICB9XG5cbiAgaWYgKHJvdXRlLmxvYWRDaGlsZHJlbikge1xuICAgIHJldHVybiByb3V0ZS5fbG9hZGVkQ29uZmlnICEucm91dGVzO1xuICB9XG5cbiAgcmV0dXJuIFtdO1xufVxuXG5pbnRlcmZhY2UgTWF0Y2hSZXN1bHQge1xuICBjb25zdW1lZFNlZ21lbnRzOiBVcmxTZWdtZW50W107XG4gIGxhc3RDaGlsZDogbnVtYmVyO1xuICBwYXJhbWV0ZXJzOiBhbnk7XG59XG5cbmZ1bmN0aW9uIG1hdGNoKHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCByb3V0ZTogUm91dGUsIHNlZ21lbnRzOiBVcmxTZWdtZW50W10pOiBNYXRjaFJlc3VsdCB7XG4gIGlmIChyb3V0ZS5wYXRoID09PSAnJykge1xuICAgIGlmIChyb3V0ZS5wYXRoTWF0Y2ggPT09ICdmdWxsJyAmJiAoc2VnbWVudEdyb3VwLmhhc0NoaWxkcmVuKCkgfHwgc2VnbWVudHMubGVuZ3RoID4gMCkpIHtcbiAgICAgIHRocm93IG5ldyBOb01hdGNoKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtjb25zdW1lZFNlZ21lbnRzOiBbXSwgbGFzdENoaWxkOiAwLCBwYXJhbWV0ZXJzOiB7fX07XG4gIH1cblxuICBjb25zdCBtYXRjaGVyID0gcm91dGUubWF0Y2hlciB8fCBkZWZhdWx0VXJsTWF0Y2hlcjtcbiAgY29uc3QgcmVzID0gbWF0Y2hlcihzZWdtZW50cywgc2VnbWVudEdyb3VwLCByb3V0ZSk7XG4gIGlmICghcmVzKSB0aHJvdyBuZXcgTm9NYXRjaCgpO1xuXG4gIGNvbnN0IHBvc1BhcmFtczoge1tuOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIGZvckVhY2gocmVzLnBvc1BhcmFtcyAhLCAodjogVXJsU2VnbWVudCwgazogc3RyaW5nKSA9PiB7IHBvc1BhcmFtc1trXSA9IHYucGF0aDsgfSk7XG4gIGNvbnN0IHBhcmFtZXRlcnMgPSByZXMuY29uc3VtZWQubGVuZ3RoID4gMCA/XG4gICAgICB7Li4ucG9zUGFyYW1zLCAuLi5yZXMuY29uc3VtZWRbcmVzLmNvbnN1bWVkLmxlbmd0aCAtIDFdLnBhcmFtZXRlcnN9IDpcbiAgICAgIHBvc1BhcmFtcztcblxuICByZXR1cm4ge2NvbnN1bWVkU2VnbWVudHM6IHJlcy5jb25zdW1lZCwgbGFzdENoaWxkOiByZXMuY29uc3VtZWQubGVuZ3RoLCBwYXJhbWV0ZXJzfTtcbn1cblxuZnVuY3Rpb24gY2hlY2tPdXRsZXROYW1lVW5pcXVlbmVzcyhub2RlczogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD5bXSk6IHZvaWQge1xuICBjb25zdCBuYW1lczoge1trOiBzdHJpbmddOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90fSA9IHt9O1xuICBub2Rlcy5mb3JFYWNoKG4gPT4ge1xuICAgIGNvbnN0IHJvdXRlV2l0aFNhbWVPdXRsZXROYW1lID0gbmFtZXNbbi52YWx1ZS5vdXRsZXRdO1xuICAgIGlmIChyb3V0ZVdpdGhTYW1lT3V0bGV0TmFtZSkge1xuICAgICAgY29uc3QgcCA9IHJvdXRlV2l0aFNhbWVPdXRsZXROYW1lLnVybC5tYXAocyA9PiBzLnRvU3RyaW5nKCkpLmpvaW4oJy8nKTtcbiAgICAgIGNvbnN0IGMgPSBuLnZhbHVlLnVybC5tYXAocyA9PiBzLnRvU3RyaW5nKCkpLmpvaW4oJy8nKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVHdvIHNlZ21lbnRzIGNhbm5vdCBoYXZlIHRoZSBzYW1lIG91dGxldCBuYW1lOiAnJHtwfScgYW5kICcke2N9Jy5gKTtcbiAgICB9XG4gICAgbmFtZXNbbi52YWx1ZS5vdXRsZXRdID0gbi52YWx1ZTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNvdXJjZVNlZ21lbnRHcm91cChzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCk6IFVybFNlZ21lbnRHcm91cCB7XG4gIGxldCBzID0gc2VnbWVudEdyb3VwO1xuICB3aGlsZSAocy5fc291cmNlU2VnbWVudCkge1xuICAgIHMgPSBzLl9zb3VyY2VTZWdtZW50O1xuICB9XG4gIHJldHVybiBzO1xufVxuXG5mdW5jdGlvbiBnZXRQYXRoSW5kZXhTaGlmdChzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCk6IG51bWJlciB7XG4gIGxldCBzID0gc2VnbWVudEdyb3VwO1xuICBsZXQgcmVzID0gKHMuX3NlZ21lbnRJbmRleFNoaWZ0ID8gcy5fc2VnbWVudEluZGV4U2hpZnQgOiAwKTtcbiAgd2hpbGUgKHMuX3NvdXJjZVNlZ21lbnQpIHtcbiAgICBzID0gcy5fc291cmNlU2VnbWVudDtcbiAgICByZXMgKz0gKHMuX3NlZ21lbnRJbmRleFNoaWZ0ID8gcy5fc2VnbWVudEluZGV4U2hpZnQgOiAwKTtcbiAgfVxuICByZXR1cm4gcmVzIC0gMTtcbn1cblxuZnVuY3Rpb24gc3BsaXQoXG4gICAgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIGNvbnN1bWVkU2VnbWVudHM6IFVybFNlZ21lbnRbXSwgc2xpY2VkU2VnbWVudHM6IFVybFNlZ21lbnRbXSxcbiAgICBjb25maWc6IFJvdXRlW10pIHtcbiAgaWYgKHNsaWNlZFNlZ21lbnRzLmxlbmd0aCA+IDAgJiZcbiAgICAgIGNvbnRhaW5zRW1wdHlQYXRoTWF0Y2hlc1dpdGhOYW1lZE91dGxldHMoc2VnbWVudEdyb3VwLCBzbGljZWRTZWdtZW50cywgY29uZmlnKSkge1xuICAgIGNvbnN0IHMgPSBuZXcgVXJsU2VnbWVudEdyb3VwKFxuICAgICAgICBjb25zdW1lZFNlZ21lbnRzLCBjcmVhdGVDaGlsZHJlbkZvckVtcHR5UGF0aHMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWdtZW50R3JvdXAsIGNvbnN1bWVkU2VnbWVudHMsIGNvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBVcmxTZWdtZW50R3JvdXAoc2xpY2VkU2VnbWVudHMsIHNlZ21lbnRHcm91cC5jaGlsZHJlbikpKTtcbiAgICBzLl9zb3VyY2VTZWdtZW50ID0gc2VnbWVudEdyb3VwO1xuICAgIHMuX3NlZ21lbnRJbmRleFNoaWZ0ID0gY29uc3VtZWRTZWdtZW50cy5sZW5ndGg7XG4gICAgcmV0dXJuIHtzZWdtZW50R3JvdXA6IHMsIHNsaWNlZFNlZ21lbnRzOiBbXX07XG4gIH1cblxuICBpZiAoc2xpY2VkU2VnbWVudHMubGVuZ3RoID09PSAwICYmXG4gICAgICBjb250YWluc0VtcHR5UGF0aE1hdGNoZXMoc2VnbWVudEdyb3VwLCBzbGljZWRTZWdtZW50cywgY29uZmlnKSkge1xuICAgIGNvbnN0IHMgPSBuZXcgVXJsU2VnbWVudEdyb3VwKFxuICAgICAgICBzZWdtZW50R3JvdXAuc2VnbWVudHMsIGFkZEVtcHR5UGF0aHNUb0NoaWxkcmVuSWZOZWVkZWQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnRHcm91cCwgc2xpY2VkU2VnbWVudHMsIGNvbmZpZywgc2VnbWVudEdyb3VwLmNoaWxkcmVuKSk7XG4gICAgcy5fc291cmNlU2VnbWVudCA9IHNlZ21lbnRHcm91cDtcbiAgICBzLl9zZWdtZW50SW5kZXhTaGlmdCA9IGNvbnN1bWVkU2VnbWVudHMubGVuZ3RoO1xuICAgIHJldHVybiB7c2VnbWVudEdyb3VwOiBzLCBzbGljZWRTZWdtZW50c307XG4gIH1cblxuICBjb25zdCBzID0gbmV3IFVybFNlZ21lbnRHcm91cChzZWdtZW50R3JvdXAuc2VnbWVudHMsIHNlZ21lbnRHcm91cC5jaGlsZHJlbik7XG4gIHMuX3NvdXJjZVNlZ21lbnQgPSBzZWdtZW50R3JvdXA7XG4gIHMuX3NlZ21lbnRJbmRleFNoaWZ0ID0gY29uc3VtZWRTZWdtZW50cy5sZW5ndGg7XG4gIHJldHVybiB7c2VnbWVudEdyb3VwOiBzLCBzbGljZWRTZWdtZW50c307XG59XG5cbmZ1bmN0aW9uIGFkZEVtcHR5UGF0aHNUb0NoaWxkcmVuSWZOZWVkZWQoXG4gICAgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHNsaWNlZFNlZ21lbnRzOiBVcmxTZWdtZW50W10sIHJvdXRlczogUm91dGVbXSxcbiAgICBjaGlsZHJlbjoge1tuYW1lOiBzdHJpbmddOiBVcmxTZWdtZW50R3JvdXB9KToge1tuYW1lOiBzdHJpbmddOiBVcmxTZWdtZW50R3JvdXB9IHtcbiAgY29uc3QgcmVzOiB7W25hbWU6IHN0cmluZ106IFVybFNlZ21lbnRHcm91cH0gPSB7fTtcbiAgZm9yIChjb25zdCByIG9mIHJvdXRlcykge1xuICAgIGlmIChlbXB0eVBhdGhNYXRjaChzZWdtZW50R3JvdXAsIHNsaWNlZFNlZ21lbnRzLCByKSAmJiAhY2hpbGRyZW5bZ2V0T3V0bGV0KHIpXSkge1xuICAgICAgY29uc3QgcyA9IG5ldyBVcmxTZWdtZW50R3JvdXAoW10sIHt9KTtcbiAgICAgIHMuX3NvdXJjZVNlZ21lbnQgPSBzZWdtZW50R3JvdXA7XG4gICAgICBzLl9zZWdtZW50SW5kZXhTaGlmdCA9IHNlZ21lbnRHcm91cC5zZWdtZW50cy5sZW5ndGg7XG4gICAgICByZXNbZ2V0T3V0bGV0KHIpXSA9IHM7XG4gICAgfVxuICB9XG4gIHJldHVybiB7Li4uY2hpbGRyZW4sIC4uLnJlc307XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNoaWxkcmVuRm9yRW1wdHlQYXRocyhcbiAgICBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCwgY29uc3VtZWRTZWdtZW50czogVXJsU2VnbWVudFtdLCByb3V0ZXM6IFJvdXRlW10sXG4gICAgcHJpbWFyeVNlZ21lbnQ6IFVybFNlZ21lbnRHcm91cCk6IHtbbmFtZTogc3RyaW5nXTogVXJsU2VnbWVudEdyb3VwfSB7XG4gIGNvbnN0IHJlczoge1tuYW1lOiBzdHJpbmddOiBVcmxTZWdtZW50R3JvdXB9ID0ge307XG4gIHJlc1tQUklNQVJZX09VVExFVF0gPSBwcmltYXJ5U2VnbWVudDtcbiAgcHJpbWFyeVNlZ21lbnQuX3NvdXJjZVNlZ21lbnQgPSBzZWdtZW50R3JvdXA7XG4gIHByaW1hcnlTZWdtZW50Ll9zZWdtZW50SW5kZXhTaGlmdCA9IGNvbnN1bWVkU2VnbWVudHMubGVuZ3RoO1xuXG4gIGZvciAoY29uc3QgciBvZiByb3V0ZXMpIHtcbiAgICBpZiAoci5wYXRoID09PSAnJyAmJiBnZXRPdXRsZXQocikgIT09IFBSSU1BUllfT1VUTEVUKSB7XG4gICAgICBjb25zdCBzID0gbmV3IFVybFNlZ21lbnRHcm91cChbXSwge30pO1xuICAgICAgcy5fc291cmNlU2VnbWVudCA9IHNlZ21lbnRHcm91cDtcbiAgICAgIHMuX3NlZ21lbnRJbmRleFNoaWZ0ID0gY29uc3VtZWRTZWdtZW50cy5sZW5ndGg7XG4gICAgICByZXNbZ2V0T3V0bGV0KHIpXSA9IHM7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5zRW1wdHlQYXRoTWF0Y2hlc1dpdGhOYW1lZE91dGxldHMoXG4gICAgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHNsaWNlZFNlZ21lbnRzOiBVcmxTZWdtZW50W10sIHJvdXRlczogUm91dGVbXSk6IGJvb2xlYW4ge1xuICByZXR1cm4gcm91dGVzLnNvbWUoXG4gICAgICByID0+IGVtcHR5UGF0aE1hdGNoKHNlZ21lbnRHcm91cCwgc2xpY2VkU2VnbWVudHMsIHIpICYmIGdldE91dGxldChyKSAhPT0gUFJJTUFSWV9PVVRMRVQpO1xufVxuXG5mdW5jdGlvbiBjb250YWluc0VtcHR5UGF0aE1hdGNoZXMoXG4gICAgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHNsaWNlZFNlZ21lbnRzOiBVcmxTZWdtZW50W10sIHJvdXRlczogUm91dGVbXSk6IGJvb2xlYW4ge1xuICByZXR1cm4gcm91dGVzLnNvbWUociA9PiBlbXB0eVBhdGhNYXRjaChzZWdtZW50R3JvdXAsIHNsaWNlZFNlZ21lbnRzLCByKSk7XG59XG5cbmZ1bmN0aW9uIGVtcHR5UGF0aE1hdGNoKFxuICAgIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCBzbGljZWRTZWdtZW50czogVXJsU2VnbWVudFtdLCByOiBSb3V0ZSk6IGJvb2xlYW4ge1xuICBpZiAoKHNlZ21lbnRHcm91cC5oYXNDaGlsZHJlbigpIHx8IHNsaWNlZFNlZ21lbnRzLmxlbmd0aCA+IDApICYmIHIucGF0aE1hdGNoID09PSAnZnVsbCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gci5wYXRoID09PSAnJyAmJiByLnJlZGlyZWN0VG8gPT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZ2V0T3V0bGV0KHJvdXRlOiBSb3V0ZSk6IHN0cmluZyB7XG4gIHJldHVybiByb3V0ZS5vdXRsZXQgfHwgUFJJTUFSWV9PVVRMRVQ7XG59XG5cbmZ1bmN0aW9uIGdldERhdGEocm91dGU6IFJvdXRlKTogRGF0YSB7XG4gIHJldHVybiByb3V0ZS5kYXRhIHx8IHt9O1xufVxuXG5mdW5jdGlvbiBnZXRSZXNvbHZlKHJvdXRlOiBSb3V0ZSk6IFJlc29sdmVEYXRhIHtcbiAgcmV0dXJuIHJvdXRlLnJlc29sdmUgfHwge307XG59XG4iXX0=