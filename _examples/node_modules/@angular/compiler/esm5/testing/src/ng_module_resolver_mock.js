/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { NgModuleResolver } from '@angular/compiler';
var MockNgModuleResolver = /** @class */ (function (_super) {
    tslib_1.__extends(MockNgModuleResolver, _super);
    function MockNgModuleResolver(reflector) {
        var _this = _super.call(this, reflector) || this;
        _this._ngModules = new Map();
        return _this;
    }
    /**
     * Overrides the {@link NgModule} for a module.
     */
    MockNgModuleResolver.prototype.setNgModule = function (type, metadata) {
        this._ngModules.set(type, metadata);
    };
    /**
     * Returns the {@link NgModule} for a module:
     * - Set the {@link NgModule} to the overridden view when it exists or fallback to the
     * default
     * `NgModuleResolver`, see `setNgModule`.
     */
    MockNgModuleResolver.prototype.resolve = function (type, throwIfNotFound) {
        if (throwIfNotFound === void 0) { throwIfNotFound = true; }
        return this._ngModules.get(type) || _super.prototype.resolve.call(this, type, throwIfNotFound);
    };
    return MockNgModuleResolver;
}(NgModuleResolver));
export { MockNgModuleResolver };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kdWxlX3Jlc29sdmVyX21vY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci90ZXN0aW5nL3NyYy9uZ19tb2R1bGVfcmVzb2x2ZXJfbW9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFtQixnQkFBZ0IsRUFBTyxNQUFNLG1CQUFtQixDQUFDO0FBRTNFO0lBQTBDLGdEQUFnQjtJQUd4RCw4QkFBWSxTQUEyQjtRQUF2QyxZQUEyQyxrQkFBTSxTQUFTLENBQUMsU0FBRztRQUZ0RCxnQkFBVSxHQUFHLElBQUksR0FBRyxFQUE0QixDQUFDOztJQUVJLENBQUM7SUFFOUQ7O09BRUc7SUFDSCwwQ0FBVyxHQUFYLFVBQVksSUFBZSxFQUFFLFFBQXVCO1FBQ2xELElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxzQ0FBTyxHQUFQLFVBQVEsSUFBZSxFQUFFLGVBQXNCO1FBQXRCLGdDQUFBLEVBQUEsc0JBQXNCO1FBQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTSxPQUFPLFlBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBRyxDQUFDO0lBQzdFLENBQUM7SUFDSCwyQkFBQztBQUFELENBQUMsQUFyQkQsQ0FBMEMsZ0JBQWdCLEdBcUJ6RCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21waWxlUmVmbGVjdG9yLCBOZ01vZHVsZVJlc29sdmVyLCBjb3JlfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5cbmV4cG9ydCBjbGFzcyBNb2NrTmdNb2R1bGVSZXNvbHZlciBleHRlbmRzIE5nTW9kdWxlUmVzb2x2ZXIge1xuICBwcml2YXRlIF9uZ01vZHVsZXMgPSBuZXcgTWFwPGNvcmUuVHlwZSwgY29yZS5OZ01vZHVsZT4oKTtcblxuICBjb25zdHJ1Y3RvcihyZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IpIHsgc3VwZXIocmVmbGVjdG9yKTsgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgdGhlIHtAbGluayBOZ01vZHVsZX0gZm9yIGEgbW9kdWxlLlxuICAgKi9cbiAgc2V0TmdNb2R1bGUodHlwZTogY29yZS5UeXBlLCBtZXRhZGF0YTogY29yZS5OZ01vZHVsZSk6IHZvaWQge1xuICAgIHRoaXMuX25nTW9kdWxlcy5zZXQodHlwZSwgbWV0YWRhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHtAbGluayBOZ01vZHVsZX0gZm9yIGEgbW9kdWxlOlxuICAgKiAtIFNldCB0aGUge0BsaW5rIE5nTW9kdWxlfSB0byB0aGUgb3ZlcnJpZGRlbiB2aWV3IHdoZW4gaXQgZXhpc3RzIG9yIGZhbGxiYWNrIHRvIHRoZVxuICAgKiBkZWZhdWx0XG4gICAqIGBOZ01vZHVsZVJlc29sdmVyYCwgc2VlIGBzZXROZ01vZHVsZWAuXG4gICAqL1xuICByZXNvbHZlKHR5cGU6IGNvcmUuVHlwZSwgdGhyb3dJZk5vdEZvdW5kID0gdHJ1ZSk6IGNvcmUuTmdNb2R1bGUge1xuICAgIHJldHVybiB0aGlzLl9uZ01vZHVsZXMuZ2V0KHR5cGUpIHx8IHN1cGVyLnJlc29sdmUodHlwZSwgdGhyb3dJZk5vdEZvdW5kKSAhO1xuICB9XG59XG4iXX0=