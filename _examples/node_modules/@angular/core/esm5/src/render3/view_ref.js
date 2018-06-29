/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { checkNoChanges, detectChanges, markViewDirty } from './instructions';
import { notImplemented } from './util';
var ViewRef = /** @class */ (function () {
    function ViewRef(_view, context) {
        this._view = _view;
        this.context = context;
    }
    /** @internal */
    ViewRef.prototype._setComponentContext = function (view, context) {
        this._view = view;
        this.context = context;
    };
    ViewRef.prototype.destroy = function () { notImplemented(); };
    ViewRef.prototype.onDestroy = function (callback) { notImplemented(); };
    /**
     * Marks a view and all of its ancestors dirty.
     *
     * It also triggers change detection by calling `scheduleTick` internally, which coalesces
     * multiple `markForCheck` calls to into one change detection run.
     *
     * This can be used to ensure an {@link ChangeDetectionStrategy#OnPush OnPush} component is
     * checked when it needs to be re-rendered but the two normal triggers haven't marked it
     * dirty (i.e. inputs haven't changed and events haven't fired in the view).
     *
     * <!-- TODO: Add a link to a chapter on OnPush components -->
     *
     * @usageNotes
     * ### Example
     *
     * ```typescript
     * @Component({
     *   selector: 'my-app',
     *   template: `Number of ticks: {{numberOfTicks}}`
     *   changeDetection: ChangeDetectionStrategy.OnPush,
     * })
     * class AppComponent {
     *   numberOfTicks = 0;
     *
     *   constructor(private ref: ChangeDetectorRef) {
     *     setInterval(() => {
     *       this.numberOfTicks++;
     *       // the following is required, otherwise the view will not be updated
     *       this.ref.markForCheck();
     *     }, 1000);
     *   }
     * }
     * ```
     */
    ViewRef.prototype.markForCheck = function () { markViewDirty(this._view); };
    /**
     * Detaches the view from the change detection tree.
     *
     * Detached views will not be checked during change detection runs until they are
     * re-attached, even if they are dirty. `detach` can be used in combination with
     * {@link ChangeDetectorRef#detectChanges detectChanges} to implement local change
     * detection checks.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
     *
     * @usageNotes
     * ### Example
     *
     * The following example defines a component with a large list of readonly data.
     * Imagine the data changes constantly, many times per second. For performance reasons,
     * we want to check and update the list every five seconds. We can do that by detaching
     * the component's change detector and doing a local check every five seconds.
     *
     * ```typescript
     * class DataProvider {
     *   // in a real application the returned data will be different every time
     *   get data() {
     *     return [1,2,3,4,5];
     *   }
     * }
     *
     * @Component({
     *   selector: 'giant-list',
     *   template: `
     *     <li *ngFor="let d of dataProvider.data">Data {{d}}</li>
     *   `,
     * })
     * class GiantList {
     *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {
     *     ref.detach();
     *     setInterval(() => {
     *       this.ref.detectChanges();
     *     }, 5000);
     *   }
     * }
     *
     * @Component({
     *   selector: 'app',
     *   providers: [DataProvider],
     *   template: `
     *     <giant-list><giant-list>
     *   `,
     * })
     * class App {
     * }
     * ```
     */
    ViewRef.prototype.detach = function () { this._view.flags &= ~8 /* Attached */; };
    /**
     * Re-attaches a view to the change detection tree.
     *
     * This can be used to re-attach views that were previously detached from the tree
     * using {@link ChangeDetectorRef#detach detach}. Views are attached to the tree by default.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     *
     * @usageNotes
     * ### Example
     *
     * The following example creates a component displaying `live` data. The component will detach
     * its change detector from the main change detector tree when the component's live property
     * is set to false.
     *
     * ```typescript
     * class DataProvider {
     *   data = 1;
     *
     *   constructor() {
     *     setInterval(() => {
     *       this.data = this.data * 2;
     *     }, 500);
     *   }
     * }
     *
     * @Component({
     *   selector: 'live-data',
     *   inputs: ['live'],
     *   template: 'Data: {{dataProvider.data}}'
     * })
     * class LiveData {
     *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {}
     *
     *   set live(value) {
     *     if (value) {
     *       this.ref.reattach();
     *     } else {
     *       this.ref.detach();
     *     }
     *   }
     * }
     *
     * @Component({
     *   selector: 'my-app',
     *   providers: [DataProvider],
     *   template: `
     *     Live Update: <input type="checkbox" [(ngModel)]="live">
     *     <live-data [live]="live"><live-data>
     *   `,
     * })
     * class AppComponent {
     *   live = true;
     * }
     * ```
     */
    ViewRef.prototype.reattach = function () { this._view.flags |= 8 /* Attached */; };
    /**
     * Checks the view and its children.
     *
     * This can also be used in combination with {@link ChangeDetectorRef#detach detach} to implement
     * local change detection checks.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
     *
     * @usageNotes
     * ### Example
     *
     * The following example defines a component with a large list of readonly data.
     * Imagine, the data changes constantly, many times per second. For performance reasons,
     * we want to check and update the list every five seconds.
     *
     * We can do that by detaching the component's change detector and doing a local change detection
     * check every five seconds.
     *
     * See {@link ChangeDetectorRef#detach detach} for more information.
     */
    ViewRef.prototype.detectChanges = function () { detectChanges(this.context); };
    /**
     * Checks the change detector and its children, and throws if any changes are detected.
     *
     * This is used in development mode to verify that running change detection doesn't
     * introduce other changes.
     */
    ViewRef.prototype.checkNoChanges = function () { checkNoChanges(this.context); };
    return ViewRef;
}());
export { ViewRef };
var EmbeddedViewRef = /** @class */ (function (_super) {
    tslib_1.__extends(EmbeddedViewRef, _super);
    function EmbeddedViewRef(viewNode, template, context) {
        var _this = _super.call(this, viewNode.data, context) || this;
        _this._lViewNode = viewNode;
        return _this;
    }
    return EmbeddedViewRef;
}(ViewRef));
export { EmbeddedViewRef };
/**
 * Creates a ViewRef bundled with destroy functionality.
 *
 * @param context The context for this view
 * @returns The ViewRef
 */
export function createViewRef(view, context) {
    // TODO: add detectChanges back in when implementing ChangeDetectorRef.detectChanges
    return addDestroyable(new ViewRef(view, context));
}
/**
 * Decorates an object with destroy logic (implementing the DestroyRef interface)
 * and returns the enhanced object.
 *
 * @param obj The object to decorate
 * @returns The object with destroy logic
 */
export function addDestroyable(obj) {
    var destroyFn = null;
    obj.destroyed = false;
    obj.destroy = function () {
        destroyFn && destroyFn.forEach(function (fn) { return fn(); });
        this.destroyed = true;
    };
    obj.onDestroy = function (fn) { return (destroyFn || (destroyFn = [])).push(fn); };
    return obj;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL3ZpZXdfcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFJSCxPQUFPLEVBQUMsY0FBYyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUk1RSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRXRDO0lBSUUsaUJBQW9CLEtBQVksRUFBRSxPQUFlO1FBQTdCLFVBQUssR0FBTCxLQUFLLENBQU87UUFBdUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFTLENBQUM7SUFBQyxDQUFDO0lBRWxGLGdCQUFnQjtJQUNoQixzQ0FBb0IsR0FBcEIsVUFBcUIsSUFBVyxFQUFFLE9BQVU7UUFDMUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDekIsQ0FBQztJQUVELHlCQUFPLEdBQVAsY0FBa0IsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXJDLDJCQUFTLEdBQVQsVUFBVSxRQUFrQixJQUFJLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVuRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BaUNHO0lBQ0gsOEJBQVksR0FBWixjQUF1QixhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVuRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQW9ERztJQUNILHdCQUFNLEdBQU4sY0FBaUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksaUJBQW9CLENBQUMsQ0FBQyxDQUFDO0lBRTVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BdURHO0lBQ0gsMEJBQVEsR0FBUixjQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssb0JBQXVCLENBQUMsQ0FBQyxDQUFDO0lBRTdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQW9CRztJQUNILCtCQUFhLEdBQWIsY0FBd0IsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFdEQ7Ozs7O09BS0c7SUFDSCxnQ0FBYyxHQUFkLGNBQXlCLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFELGNBQUM7QUFBRCxDQUFDLEFBbk1ELElBbU1DOztBQUdEO0lBQXdDLDJDQUFVO0lBTWhELHlCQUFZLFFBQW1CLEVBQUUsUUFBOEIsRUFBRSxPQUFVO1FBQTNFLFlBQ0Usa0JBQU0sUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsU0FFOUI7UUFEQyxLQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQzs7SUFDN0IsQ0FBQztJQUNILHNCQUFDO0FBQUQsQ0FBQyxBQVZELENBQXdDLE9BQU8sR0FVOUM7O0FBRUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLHdCQUEyQixJQUFrQixFQUFFLE9BQVU7SUFDN0Qsb0ZBQW9GO0lBQ3BGLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQVlEOzs7Ozs7R0FNRztBQUNILE1BQU0seUJBQStCLEdBQVE7SUFDM0MsSUFBSSxTQUFTLEdBQW9CLElBQUksQ0FBQztJQUN0QyxHQUFHLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN0QixHQUFHLENBQUMsT0FBTyxHQUFHO1FBQ1osU0FBUyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFFLElBQUssT0FBQSxFQUFFLEVBQUUsRUFBSixDQUFJLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUN4QixDQUFDLENBQUM7SUFDRixHQUFHLENBQUMsU0FBUyxHQUFHLFVBQUMsRUFBWSxJQUFLLE9BQUEsQ0FBQyxTQUFTLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQXhDLENBQXdDLENBQUM7SUFDM0UsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUNiLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RW1iZWRkZWRWaWV3UmVmIGFzIHZpZXdFbmdpbmVfRW1iZWRkZWRWaWV3UmVmfSBmcm9tICcuLi9saW5rZXIvdmlld19yZWYnO1xuXG5pbXBvcnQge2NoZWNrTm9DaGFuZ2VzLCBkZXRlY3RDaGFuZ2VzLCBtYXJrVmlld0RpcnR5fSBmcm9tICcuL2luc3RydWN0aW9ucyc7XG5pbXBvcnQge0NvbXBvbmVudFRlbXBsYXRlfSBmcm9tICcuL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge0xWaWV3Tm9kZX0gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtMVmlldywgTFZpZXdGbGFnc30gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtub3RJbXBsZW1lbnRlZH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGNsYXNzIFZpZXdSZWY8VD4gaW1wbGVtZW50cyB2aWV3RW5naW5lX0VtYmVkZGVkVmlld1JlZjxUPiB7XG4gIGNvbnRleHQ6IFQ7XG4gIHJvb3ROb2RlczogYW55W107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlldzogTFZpZXcsIGNvbnRleHQ6IFR8bnVsbCwgKSB7IHRoaXMuY29udGV4dCA9IGNvbnRleHQgITsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3NldENvbXBvbmVudENvbnRleHQodmlldzogTFZpZXcsIGNvbnRleHQ6IFQpIHtcbiAgICB0aGlzLl92aWV3ID0gdmlldztcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHsgbm90SW1wbGVtZW50ZWQoKTsgfVxuICBkZXN0cm95ZWQ6IGJvb2xlYW47XG4gIG9uRGVzdHJveShjYWxsYmFjazogRnVuY3Rpb24pIHsgbm90SW1wbGVtZW50ZWQoKTsgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyBhIHZpZXcgYW5kIGFsbCBvZiBpdHMgYW5jZXN0b3JzIGRpcnR5LlxuICAgKlxuICAgKiBJdCBhbHNvIHRyaWdnZXJzIGNoYW5nZSBkZXRlY3Rpb24gYnkgY2FsbGluZyBgc2NoZWR1bGVUaWNrYCBpbnRlcm5hbGx5LCB3aGljaCBjb2FsZXNjZXNcbiAgICogbXVsdGlwbGUgYG1hcmtGb3JDaGVja2AgY2FsbHMgdG8gaW50byBvbmUgY2hhbmdlIGRldGVjdGlvbiBydW4uXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIHVzZWQgdG8gZW5zdXJlIGFuIHtAbGluayBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSNPblB1c2ggT25QdXNofSBjb21wb25lbnQgaXNcbiAgICogY2hlY2tlZCB3aGVuIGl0IG5lZWRzIHRvIGJlIHJlLXJlbmRlcmVkIGJ1dCB0aGUgdHdvIG5vcm1hbCB0cmlnZ2VycyBoYXZlbid0IG1hcmtlZCBpdFxuICAgKiBkaXJ0eSAoaS5lLiBpbnB1dHMgaGF2ZW4ndCBjaGFuZ2VkIGFuZCBldmVudHMgaGF2ZW4ndCBmaXJlZCBpbiB0aGUgdmlldykuXG4gICAqXG4gICAqIDwhLS0gVE9ETzogQWRkIGEgbGluayB0byBhIGNoYXB0ZXIgb24gT25QdXNoIGNvbXBvbmVudHMgLS0+XG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdteS1hcHAnLFxuICAgKiAgIHRlbXBsYXRlOiBgTnVtYmVyIG9mIHRpY2tzOiB7e251bWJlck9mVGlja3N9fWBcbiAgICogICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgICogfSlcbiAgICogY2xhc3MgQXBwQ29tcG9uZW50IHtcbiAgICogICBudW1iZXJPZlRpY2tzID0gMDtcbiAgICpcbiAgICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcbiAgICogICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICogICAgICAgdGhpcy5udW1iZXJPZlRpY2tzKys7XG4gICAqICAgICAgIC8vIHRoZSBmb2xsb3dpbmcgaXMgcmVxdWlyZWQsIG90aGVyd2lzZSB0aGUgdmlldyB3aWxsIG5vdCBiZSB1cGRhdGVkXG4gICAqICAgICAgIHRoaXMucmVmLm1hcmtGb3JDaGVjaygpO1xuICAgKiAgICAgfSwgMTAwMCk7XG4gICAqICAgfVxuICAgKiB9XG4gICAqIGBgYFxuICAgKi9cbiAgbWFya0ZvckNoZWNrKCk6IHZvaWQgeyBtYXJrVmlld0RpcnR5KHRoaXMuX3ZpZXcpOyB9XG5cbiAgLyoqXG4gICAqIERldGFjaGVzIHRoZSB2aWV3IGZyb20gdGhlIGNoYW5nZSBkZXRlY3Rpb24gdHJlZS5cbiAgICpcbiAgICogRGV0YWNoZWQgdmlld3Mgd2lsbCBub3QgYmUgY2hlY2tlZCBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbiBydW5zIHVudGlsIHRoZXkgYXJlXG4gICAqIHJlLWF0dGFjaGVkLCBldmVuIGlmIHRoZXkgYXJlIGRpcnR5LiBgZGV0YWNoYCBjYW4gYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoXG4gICAqIHtAbGluayBDaGFuZ2VEZXRlY3RvclJlZiNkZXRlY3RDaGFuZ2VzIGRldGVjdENoYW5nZXN9IHRvIGltcGxlbWVudCBsb2NhbCBjaGFuZ2VcbiAgICogZGV0ZWN0aW9uIGNoZWNrcy5cbiAgICpcbiAgICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIHRvIGEgY2hhcHRlciBvbiBkZXRhY2gvcmVhdHRhY2gvbG9jYWwgZGlnZXN0IC0tPlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpdmUgZGVtbyBvbmNlIHJlZi5kZXRlY3RDaGFuZ2VzIGlzIG1lcmdlZCBpbnRvIG1hc3RlciAtLT5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlZmluZXMgYSBjb21wb25lbnQgd2l0aCBhIGxhcmdlIGxpc3Qgb2YgcmVhZG9ubHkgZGF0YS5cbiAgICogSW1hZ2luZSB0aGUgZGF0YSBjaGFuZ2VzIGNvbnN0YW50bHksIG1hbnkgdGltZXMgcGVyIHNlY29uZC4gRm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMsXG4gICAqIHdlIHdhbnQgdG8gY2hlY2sgYW5kIHVwZGF0ZSB0aGUgbGlzdCBldmVyeSBmaXZlIHNlY29uZHMuIFdlIGNhbiBkbyB0aGF0IGJ5IGRldGFjaGluZ1xuICAgKiB0aGUgY29tcG9uZW50J3MgY2hhbmdlIGRldGVjdG9yIGFuZCBkb2luZyBhIGxvY2FsIGNoZWNrIGV2ZXJ5IGZpdmUgc2Vjb25kcy5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBEYXRhUHJvdmlkZXIge1xuICAgKiAgIC8vIGluIGEgcmVhbCBhcHBsaWNhdGlvbiB0aGUgcmV0dXJuZWQgZGF0YSB3aWxsIGJlIGRpZmZlcmVudCBldmVyeSB0aW1lXG4gICAqICAgZ2V0IGRhdGEoKSB7XG4gICAqICAgICByZXR1cm4gWzEsMiwzLDQsNV07XG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnZ2lhbnQtbGlzdCcsXG4gICAqICAgdGVtcGxhdGU6IGBcbiAgICogICAgIDxsaSAqbmdGb3I9XCJsZXQgZCBvZiBkYXRhUHJvdmlkZXIuZGF0YVwiPkRhdGEge3tkfX08L2xpPlxuICAgKiAgIGAsXG4gICAqIH0pXG4gICAqIGNsYXNzIEdpYW50TGlzdCB7XG4gICAqICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWY6IENoYW5nZURldGVjdG9yUmVmLCBwcml2YXRlIGRhdGFQcm92aWRlcjogRGF0YVByb3ZpZGVyKSB7XG4gICAqICAgICByZWYuZGV0YWNoKCk7XG4gICAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAqICAgICAgIHRoaXMucmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICogICAgIH0sIDUwMDApO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2FwcCcsXG4gICAqICAgcHJvdmlkZXJzOiBbRGF0YVByb3ZpZGVyXSxcbiAgICogICB0ZW1wbGF0ZTogYFxuICAgKiAgICAgPGdpYW50LWxpc3Q+PGdpYW50LWxpc3Q+XG4gICAqICAgYCxcbiAgICogfSlcbiAgICogY2xhc3MgQXBwIHtcbiAgICogfVxuICAgKiBgYGBcbiAgICovXG4gIGRldGFjaCgpOiB2b2lkIHsgdGhpcy5fdmlldy5mbGFncyAmPSB+TFZpZXdGbGFncy5BdHRhY2hlZDsgfVxuXG4gIC8qKlxuICAgKiBSZS1hdHRhY2hlcyBhIHZpZXcgdG8gdGhlIGNoYW5nZSBkZXRlY3Rpb24gdHJlZS5cbiAgICpcbiAgICogVGhpcyBjYW4gYmUgdXNlZCB0byByZS1hdHRhY2ggdmlld3MgdGhhdCB3ZXJlIHByZXZpb3VzbHkgZGV0YWNoZWQgZnJvbSB0aGUgdHJlZVxuICAgKiB1c2luZyB7QGxpbmsgQ2hhbmdlRGV0ZWN0b3JSZWYjZGV0YWNoIGRldGFjaH0uIFZpZXdzIGFyZSBhdHRhY2hlZCB0byB0aGUgdHJlZSBieSBkZWZhdWx0LlxuICAgKlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpbmsgdG8gYSBjaGFwdGVyIG9uIGRldGFjaC9yZWF0dGFjaC9sb2NhbCBkaWdlc3QgLS0+XG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgY29tcG9uZW50IGRpc3BsYXlpbmcgYGxpdmVgIGRhdGEuIFRoZSBjb21wb25lbnQgd2lsbCBkZXRhY2hcbiAgICogaXRzIGNoYW5nZSBkZXRlY3RvciBmcm9tIHRoZSBtYWluIGNoYW5nZSBkZXRlY3RvciB0cmVlIHdoZW4gdGhlIGNvbXBvbmVudCdzIGxpdmUgcHJvcGVydHlcbiAgICogaXMgc2V0IHRvIGZhbHNlLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIERhdGFQcm92aWRlciB7XG4gICAqICAgZGF0YSA9IDE7XG4gICAqXG4gICAqICAgY29uc3RydWN0b3IoKSB7XG4gICAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAqICAgICAgIHRoaXMuZGF0YSA9IHRoaXMuZGF0YSAqIDI7XG4gICAqICAgICB9LCA1MDApO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2xpdmUtZGF0YScsXG4gICAqICAgaW5wdXRzOiBbJ2xpdmUnXSxcbiAgICogICB0ZW1wbGF0ZTogJ0RhdGE6IHt7ZGF0YVByb3ZpZGVyLmRhdGF9fSdcbiAgICogfSlcbiAgICogY2xhc3MgTGl2ZURhdGEge1xuICAgKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVmOiBDaGFuZ2VEZXRlY3RvclJlZiwgcHJpdmF0ZSBkYXRhUHJvdmlkZXI6IERhdGFQcm92aWRlcikge31cbiAgICpcbiAgICogICBzZXQgbGl2ZSh2YWx1ZSkge1xuICAgKiAgICAgaWYgKHZhbHVlKSB7XG4gICAqICAgICAgIHRoaXMucmVmLnJlYXR0YWNoKCk7XG4gICAqICAgICB9IGVsc2Uge1xuICAgKiAgICAgICB0aGlzLnJlZi5kZXRhY2goKTtcbiAgICogICAgIH1cbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdteS1hcHAnLFxuICAgKiAgIHByb3ZpZGVyczogW0RhdGFQcm92aWRlcl0sXG4gICAqICAgdGVtcGxhdGU6IGBcbiAgICogICAgIExpdmUgVXBkYXRlOiA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgWyhuZ01vZGVsKV09XCJsaXZlXCI+XG4gICAqICAgICA8bGl2ZS1kYXRhIFtsaXZlXT1cImxpdmVcIj48bGl2ZS1kYXRhPlxuICAgKiAgIGAsXG4gICAqIH0pXG4gICAqIGNsYXNzIEFwcENvbXBvbmVudCB7XG4gICAqICAgbGl2ZSA9IHRydWU7XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICByZWF0dGFjaCgpOiB2b2lkIHsgdGhpcy5fdmlldy5mbGFncyB8PSBMVmlld0ZsYWdzLkF0dGFjaGVkOyB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGUgdmlldyBhbmQgaXRzIGNoaWxkcmVuLlxuICAgKlxuICAgKiBUaGlzIGNhbiBhbHNvIGJlIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCB7QGxpbmsgQ2hhbmdlRGV0ZWN0b3JSZWYjZGV0YWNoIGRldGFjaH0gdG8gaW1wbGVtZW50XG4gICAqIGxvY2FsIGNoYW5nZSBkZXRlY3Rpb24gY2hlY2tzLlxuICAgKlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpbmsgdG8gYSBjaGFwdGVyIG9uIGRldGFjaC9yZWF0dGFjaC9sb2NhbCBkaWdlc3QgLS0+XG4gICAqIDwhLS0gVE9ETzogQWRkIGEgbGl2ZSBkZW1vIG9uY2UgcmVmLmRldGVjdENoYW5nZXMgaXMgbWVyZ2VkIGludG8gbWFzdGVyIC0tPlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGVmaW5lcyBhIGNvbXBvbmVudCB3aXRoIGEgbGFyZ2UgbGlzdCBvZiByZWFkb25seSBkYXRhLlxuICAgKiBJbWFnaW5lLCB0aGUgZGF0YSBjaGFuZ2VzIGNvbnN0YW50bHksIG1hbnkgdGltZXMgcGVyIHNlY29uZC4gRm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMsXG4gICAqIHdlIHdhbnQgdG8gY2hlY2sgYW5kIHVwZGF0ZSB0aGUgbGlzdCBldmVyeSBmaXZlIHNlY29uZHMuXG4gICAqXG4gICAqIFdlIGNhbiBkbyB0aGF0IGJ5IGRldGFjaGluZyB0aGUgY29tcG9uZW50J3MgY2hhbmdlIGRldGVjdG9yIGFuZCBkb2luZyBhIGxvY2FsIGNoYW5nZSBkZXRlY3Rpb25cbiAgICogY2hlY2sgZXZlcnkgZml2ZSBzZWNvbmRzLlxuICAgKlxuICAgKiBTZWUge0BsaW5rIENoYW5nZURldGVjdG9yUmVmI2RldGFjaCBkZXRhY2h9IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgZGV0ZWN0Q2hhbmdlcygpOiB2b2lkIHsgZGV0ZWN0Q2hhbmdlcyh0aGlzLmNvbnRleHQpOyB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGUgY2hhbmdlIGRldGVjdG9yIGFuZCBpdHMgY2hpbGRyZW4sIGFuZCB0aHJvd3MgaWYgYW55IGNoYW5nZXMgYXJlIGRldGVjdGVkLlxuICAgKlxuICAgKiBUaGlzIGlzIHVzZWQgaW4gZGV2ZWxvcG1lbnQgbW9kZSB0byB2ZXJpZnkgdGhhdCBydW5uaW5nIGNoYW5nZSBkZXRlY3Rpb24gZG9lc24ndFxuICAgKiBpbnRyb2R1Y2Ugb3RoZXIgY2hhbmdlcy5cbiAgICovXG4gIGNoZWNrTm9DaGFuZ2VzKCk6IHZvaWQgeyBjaGVja05vQ2hhbmdlcyh0aGlzLmNvbnRleHQpOyB9XG59XG5cblxuZXhwb3J0IGNsYXNzIEVtYmVkZGVkVmlld1JlZjxUPiBleHRlbmRzIFZpZXdSZWY8VD4ge1xuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfbFZpZXdOb2RlOiBMVmlld05vZGU7XG5cbiAgY29uc3RydWN0b3Iodmlld05vZGU6IExWaWV3Tm9kZSwgdGVtcGxhdGU6IENvbXBvbmVudFRlbXBsYXRlPFQ+LCBjb250ZXh0OiBUKSB7XG4gICAgc3VwZXIodmlld05vZGUuZGF0YSwgY29udGV4dCk7XG4gICAgdGhpcy5fbFZpZXdOb2RlID0gdmlld05vZGU7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgVmlld1JlZiBidW5kbGVkIHdpdGggZGVzdHJveSBmdW5jdGlvbmFsaXR5LlxuICpcbiAqIEBwYXJhbSBjb250ZXh0IFRoZSBjb250ZXh0IGZvciB0aGlzIHZpZXdcbiAqIEByZXR1cm5zIFRoZSBWaWV3UmVmXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVWaWV3UmVmPFQ+KHZpZXc6IExWaWV3IHwgbnVsbCwgY29udGV4dDogVCk6IFZpZXdSZWY8VD4ge1xuICAvLyBUT0RPOiBhZGQgZGV0ZWN0Q2hhbmdlcyBiYWNrIGluIHdoZW4gaW1wbGVtZW50aW5nIENoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXNcbiAgcmV0dXJuIGFkZERlc3Ryb3lhYmxlKG5ldyBWaWV3UmVmKHZpZXcgISwgY29udGV4dCkpO1xufVxuXG4vKiogSW50ZXJmYWNlIGZvciBkZXN0cm95IGxvZ2ljLiBJbXBsZW1lbnRlZCBieSBhZGREZXN0cm95YWJsZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVzdHJveVJlZjxUPiB7XG4gIC8qKiBXaGV0aGVyIG9yIG5vdCB0aGlzIG9iamVjdCBoYXMgYmVlbiBkZXN0cm95ZWQgKi9cbiAgZGVzdHJveWVkOiBib29sZWFuO1xuICAvKiogRGVzdHJveSB0aGUgaW5zdGFuY2UgYW5kIGNhbGwgYWxsIG9uRGVzdHJveSBjYWxsYmFja3MuICovXG4gIGRlc3Ryb3koKTogdm9pZDtcbiAgLyoqIFJlZ2lzdGVyIGNhbGxiYWNrcyB0aGF0IHNob3VsZCBiZSBjYWxsZWQgb25EZXN0cm95ICovXG4gIG9uRGVzdHJveShjYjogRnVuY3Rpb24pOiB2b2lkO1xufVxuXG4vKipcbiAqIERlY29yYXRlcyBhbiBvYmplY3Qgd2l0aCBkZXN0cm95IGxvZ2ljIChpbXBsZW1lbnRpbmcgdGhlIERlc3Ryb3lSZWYgaW50ZXJmYWNlKVxuICogYW5kIHJldHVybnMgdGhlIGVuaGFuY2VkIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgdG8gZGVjb3JhdGVcbiAqIEByZXR1cm5zIFRoZSBvYmplY3Qgd2l0aCBkZXN0cm95IGxvZ2ljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGREZXN0cm95YWJsZTxULCBDPihvYmo6IGFueSk6IFQmRGVzdHJveVJlZjxDPiB7XG4gIGxldCBkZXN0cm95Rm46IEZ1bmN0aW9uW118bnVsbCA9IG51bGw7XG4gIG9iai5kZXN0cm95ZWQgPSBmYWxzZTtcbiAgb2JqLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBkZXN0cm95Rm4gJiYgZGVzdHJveUZuLmZvckVhY2goKGZuKSA9PiBmbigpKTtcbiAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XG4gIH07XG4gIG9iai5vbkRlc3Ryb3kgPSAoZm46IEZ1bmN0aW9uKSA9PiAoZGVzdHJveUZuIHx8IChkZXN0cm95Rm4gPSBbXSkpLnB1c2goZm4pO1xuICByZXR1cm4gb2JqO1xufVxuIl19