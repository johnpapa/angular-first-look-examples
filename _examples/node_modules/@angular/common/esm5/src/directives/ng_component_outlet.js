/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentFactoryResolver, Directive, Injector, Input, NgModuleFactory, NgModuleRef, Type, ViewContainerRef } from '@angular/core';
/**
 * Instantiates a single {@link Component} type and inserts its Host View into current View.
 * `NgComponentOutlet` provides a declarative approach for dynamic component creation.
 *
 * `NgComponentOutlet` requires a component type, if a falsy value is set the view will clear and
 * any existing component will get destroyed.
 *
 * ### Fine tune control
 *
 * You can control the component creation process by using the following optional attributes:
 *
 * * `ngComponentOutletInjector`: Optional custom {@link Injector} that will be used as parent for
 * the Component. Defaults to the injector of the current view container.
 *
 * * `ngComponentOutletContent`: Optional list of projectable nodes to insert into the content
 * section of the component, if exists.
 *
 * * `ngComponentOutletNgModuleFactory`: Optional module factory to allow dynamically loading other
 * module, then load a component from that module.
 *
 * ### Syntax
 *
 * Simple
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression"></ng-container>
 * ```
 *
 * Customized injector/content
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   injector: injectorExpression;
 *                                   content: contentNodesExpression;">
 * </ng-container>
 * ```
 *
 * Customized ngModuleFactory
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   ngModuleFactory: moduleFactory;">
 * </ng-container>
 * ```
 * ## Example
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='SimpleExample'}
 *
 * A more complete example with additional options:
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='CompleteExample'}

 * A more complete example with ngModuleFactory:
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='NgModuleFactoryExample'}
 *
 * @experimental
 */
var NgComponentOutlet = /** @class */ (function () {
    function NgComponentOutlet(_viewContainerRef) {
        this._viewContainerRef = _viewContainerRef;
        this._componentRef = null;
        this._moduleRef = null;
    }
    NgComponentOutlet.prototype.ngOnChanges = function (changes) {
        this._viewContainerRef.clear();
        this._componentRef = null;
        if (this.ngComponentOutlet) {
            var elInjector = this.ngComponentOutletInjector || this._viewContainerRef.parentInjector;
            if (changes['ngComponentOutletNgModuleFactory']) {
                if (this._moduleRef)
                    this._moduleRef.destroy();
                if (this.ngComponentOutletNgModuleFactory) {
                    var parentModule = elInjector.get(NgModuleRef);
                    this._moduleRef = this.ngComponentOutletNgModuleFactory.create(parentModule.injector);
                }
                else {
                    this._moduleRef = null;
                }
            }
            var componentFactoryResolver = this._moduleRef ? this._moduleRef.componentFactoryResolver :
                elInjector.get(ComponentFactoryResolver);
            var componentFactory = componentFactoryResolver.resolveComponentFactory(this.ngComponentOutlet);
            this._componentRef = this._viewContainerRef.createComponent(componentFactory, this._viewContainerRef.length, elInjector, this.ngComponentOutletContent);
        }
    };
    NgComponentOutlet.prototype.ngOnDestroy = function () {
        if (this._moduleRef)
            this._moduleRef.destroy();
    };
    NgComponentOutlet.decorators = [
        { type: Directive, args: [{ selector: '[ngComponentOutlet]' },] }
    ];
    /** @nocollapse */
    NgComponentOutlet.ctorParameters = function () { return [
        { type: ViewContainerRef }
    ]; };
    NgComponentOutlet.propDecorators = {
        ngComponentOutlet: [{ type: Input }],
        ngComponentOutletInjector: [{ type: Input }],
        ngComponentOutletContent: [{ type: Input }],
        ngComponentOutletNgModuleFactory: [{ type: Input }]
    };
    return NgComponentOutlet;
}());
export { NgComponentOutlet };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29tcG9uZW50X291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19jb21wb25lbnRfb3V0bGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyx3QkFBd0IsRUFBZ0IsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBdUQsSUFBSSxFQUFFLGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRzVNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzREc7QUFDSDtJQVVFLDJCQUFvQixpQkFBbUM7UUFBbkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUgvQyxrQkFBYSxHQUEyQixJQUFJLENBQUM7UUFDN0MsZUFBVSxHQUEwQixJQUFJLENBQUM7SUFFUyxDQUFDO0lBRTNELHVDQUFXLEdBQVgsVUFBWSxPQUFzQjtRQUNoQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFFMUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUMzQixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMseUJBQXlCLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQztZQUUzRixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7b0JBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFFL0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztvQkFDMUMsSUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDakQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDeEYsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztnQkFDekIsQ0FBQztZQUNILENBQUM7WUFFRCxJQUFNLHdCQUF3QixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUMsQ0FBQztnQkFDMUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBRTVGLElBQU0sZ0JBQWdCLEdBQ2xCLHdCQUF3QixDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRTdFLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FDdkQsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQzNELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7SUFDSCxDQUFDO0lBRUQsdUNBQVcsR0FBWDtRQUNFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7WUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2pELENBQUM7O2dCQTVDRixTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUscUJBQXFCLEVBQUM7Ozs7Z0JBMUR5SCxnQkFBZ0I7OztvQ0E0RGxMLEtBQUs7NENBQ0wsS0FBSzsyQ0FDTCxLQUFLO21EQUNMLEtBQUs7O0lBd0NSLHdCQUFDO0NBQUEsQUE3Q0QsSUE2Q0M7U0E1Q1ksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgQ29tcG9uZW50UmVmLCBEaXJlY3RpdmUsIEluamVjdG9yLCBJbnB1dCwgTmdNb2R1bGVGYWN0b3J5LCBOZ01vZHVsZVJlZiwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIFNpbXBsZUNoYW5nZXMsIFN0YXRpY1Byb3ZpZGVyLCBUeXBlLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuXG4vKipcbiAqIEluc3RhbnRpYXRlcyBhIHNpbmdsZSB7QGxpbmsgQ29tcG9uZW50fSB0eXBlIGFuZCBpbnNlcnRzIGl0cyBIb3N0IFZpZXcgaW50byBjdXJyZW50IFZpZXcuXG4gKiBgTmdDb21wb25lbnRPdXRsZXRgIHByb3ZpZGVzIGEgZGVjbGFyYXRpdmUgYXBwcm9hY2ggZm9yIGR5bmFtaWMgY29tcG9uZW50IGNyZWF0aW9uLlxuICpcbiAqIGBOZ0NvbXBvbmVudE91dGxldGAgcmVxdWlyZXMgYSBjb21wb25lbnQgdHlwZSwgaWYgYSBmYWxzeSB2YWx1ZSBpcyBzZXQgdGhlIHZpZXcgd2lsbCBjbGVhciBhbmRcbiAqIGFueSBleGlzdGluZyBjb21wb25lbnQgd2lsbCBnZXQgZGVzdHJveWVkLlxuICpcbiAqICMjIyBGaW5lIHR1bmUgY29udHJvbFxuICpcbiAqIFlvdSBjYW4gY29udHJvbCB0aGUgY29tcG9uZW50IGNyZWF0aW9uIHByb2Nlc3MgYnkgdXNpbmcgdGhlIGZvbGxvd2luZyBvcHRpb25hbCBhdHRyaWJ1dGVzOlxuICpcbiAqICogYG5nQ29tcG9uZW50T3V0bGV0SW5qZWN0b3JgOiBPcHRpb25hbCBjdXN0b20ge0BsaW5rIEluamVjdG9yfSB0aGF0IHdpbGwgYmUgdXNlZCBhcyBwYXJlbnQgZm9yXG4gKiB0aGUgQ29tcG9uZW50LiBEZWZhdWx0cyB0byB0aGUgaW5qZWN0b3Igb2YgdGhlIGN1cnJlbnQgdmlldyBjb250YWluZXIuXG4gKlxuICogKiBgbmdDb21wb25lbnRPdXRsZXRDb250ZW50YDogT3B0aW9uYWwgbGlzdCBvZiBwcm9qZWN0YWJsZSBub2RlcyB0byBpbnNlcnQgaW50byB0aGUgY29udGVudFxuICogc2VjdGlvbiBvZiB0aGUgY29tcG9uZW50LCBpZiBleGlzdHMuXG4gKlxuICogKiBgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZUZhY3RvcnlgOiBPcHRpb25hbCBtb2R1bGUgZmFjdG9yeSB0byBhbGxvdyBkeW5hbWljYWxseSBsb2FkaW5nIG90aGVyXG4gKiBtb2R1bGUsIHRoZW4gbG9hZCBhIGNvbXBvbmVudCBmcm9tIHRoYXQgbW9kdWxlLlxuICpcbiAqICMjIyBTeW50YXhcbiAqXG4gKiBTaW1wbGVcbiAqIGBgYFxuICogPG5nLWNvbnRhaW5lciAqbmdDb21wb25lbnRPdXRsZXQ9XCJjb21wb25lbnRUeXBlRXhwcmVzc2lvblwiPjwvbmctY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogQ3VzdG9taXplZCBpbmplY3Rvci9jb250ZW50XG4gKiBgYGBcbiAqIDxuZy1jb250YWluZXIgKm5nQ29tcG9uZW50T3V0bGV0PVwiY29tcG9uZW50VHlwZUV4cHJlc3Npb247XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0b3I6IGluamVjdG9yRXhwcmVzc2lvbjtcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50Tm9kZXNFeHByZXNzaW9uO1wiPlxuICogPC9uZy1jb250YWluZXI+XG4gKiBgYGBcbiAqXG4gKiBDdXN0b21pemVkIG5nTW9kdWxlRmFjdG9yeVxuICogYGBgXG4gKiA8bmctY29udGFpbmVyICpuZ0NvbXBvbmVudE91dGxldD1cImNvbXBvbmVudFR5cGVFeHByZXNzaW9uO1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nTW9kdWxlRmFjdG9yeTogbW9kdWxlRmFjdG9yeTtcIj5cbiAqIDwvbmctY29udGFpbmVyPlxuICogYGBgXG4gKiAjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9uZ0NvbXBvbmVudE91dGxldC90cy9tb2R1bGUudHMgcmVnaW9uPSdTaW1wbGVFeGFtcGxlJ31cbiAqXG4gKiBBIG1vcmUgY29tcGxldGUgZXhhbXBsZSB3aXRoIGFkZGl0aW9uYWwgb3B0aW9uczpcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL25nQ29tcG9uZW50T3V0bGV0L3RzL21vZHVsZS50cyByZWdpb249J0NvbXBsZXRlRXhhbXBsZSd9XG5cbiAqIEEgbW9yZSBjb21wbGV0ZSBleGFtcGxlIHdpdGggbmdNb2R1bGVGYWN0b3J5OlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbmdDb21wb25lbnRPdXRsZXQvdHMvbW9kdWxlLnRzIHJlZ2lvbj0nTmdNb2R1bGVGYWN0b3J5RXhhbXBsZSd9XG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ0NvbXBvbmVudE91dGxldF0nfSlcbmV4cG9ydCBjbGFzcyBOZ0NvbXBvbmVudE91dGxldCBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXQ6IFR5cGU8YW55PjtcbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXRJbmplY3RvcjogSW5qZWN0b3I7XG4gIEBJbnB1dCgpIG5nQ29tcG9uZW50T3V0bGV0Q29udGVudDogYW55W11bXTtcbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZUZhY3Rvcnk6IE5nTW9kdWxlRmFjdG9yeTxhbnk+O1xuXG4gIHByaXZhdGUgX2NvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPGFueT58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX21vZHVsZVJlZjogTmdNb2R1bGVSZWY8YW55PnxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7fVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNsZWFyKCk7XG4gICAgdGhpcy5fY29tcG9uZW50UmVmID0gbnVsbDtcblxuICAgIGlmICh0aGlzLm5nQ29tcG9uZW50T3V0bGV0KSB7XG4gICAgICBjb25zdCBlbEluamVjdG9yID0gdGhpcy5uZ0NvbXBvbmVudE91dGxldEluamVjdG9yIHx8IHRoaXMuX3ZpZXdDb250YWluZXJSZWYucGFyZW50SW5qZWN0b3I7XG5cbiAgICAgIGlmIChjaGFuZ2VzWyduZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlRmFjdG9yeSddKSB7XG4gICAgICAgIGlmICh0aGlzLl9tb2R1bGVSZWYpIHRoaXMuX21vZHVsZVJlZi5kZXN0cm95KCk7XG5cbiAgICAgICAgaWYgKHRoaXMubmdDb21wb25lbnRPdXRsZXROZ01vZHVsZUZhY3RvcnkpIHtcbiAgICAgICAgICBjb25zdCBwYXJlbnRNb2R1bGUgPSBlbEluamVjdG9yLmdldChOZ01vZHVsZVJlZik7XG4gICAgICAgICAgdGhpcy5fbW9kdWxlUmVmID0gdGhpcy5uZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlRmFjdG9yeS5jcmVhdGUocGFyZW50TW9kdWxlLmluamVjdG9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9tb2R1bGVSZWYgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlciA9IHRoaXMuX21vZHVsZVJlZiA/IHRoaXMuX21vZHVsZVJlZi5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxJbmplY3Rvci5nZXQoQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKTtcblxuICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeSA9XG4gICAgICAgICAgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KHRoaXMubmdDb21wb25lbnRPdXRsZXQpO1xuXG4gICAgICB0aGlzLl9jb21wb25lbnRSZWYgPSB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudChcbiAgICAgICAgICBjb21wb25lbnRGYWN0b3J5LCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCwgZWxJbmplY3RvcixcbiAgICAgICAgICB0aGlzLm5nQ29tcG9uZW50T3V0bGV0Q29udGVudCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuX21vZHVsZVJlZikgdGhpcy5fbW9kdWxlUmVmLmRlc3Ryb3koKTtcbiAgfVxufVxuIl19