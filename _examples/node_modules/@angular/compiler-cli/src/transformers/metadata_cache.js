/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/transformers/metadata_cache", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    /**
     * Cache, and potentially transform, metadata as it is being collected.
     */
    var MetadataCache = /** @class */ (function () {
        function MetadataCache(collector, strict, transformers) {
            this.collector = collector;
            this.strict = strict;
            this.transformers = transformers;
            this.metadataCache = new Map();
            try {
                for (var transformers_1 = tslib_1.__values(transformers), transformers_1_1 = transformers_1.next(); !transformers_1_1.done; transformers_1_1 = transformers_1.next()) {
                    var transformer = transformers_1_1.value;
                    if (transformer.connect) {
                        transformer.connect(this);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (transformers_1_1 && !transformers_1_1.done && (_a = transformers_1.return)) _a.call(transformers_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var e_1, _a;
        }
        MetadataCache.prototype.getMetadata = function (sourceFile) {
            if (this.metadataCache.has(sourceFile.fileName)) {
                return this.metadataCache.get(sourceFile.fileName);
            }
            var substitute = undefined;
            // Only process transformers on modules that are not declaration files.
            var declarationFile = sourceFile.isDeclarationFile;
            var moduleFile = ts.isExternalModule(sourceFile);
            if (!declarationFile && moduleFile) {
                var _loop_1 = function (transform) {
                    var transformSubstitute = transform.start(sourceFile);
                    if (transformSubstitute) {
                        if (substitute) {
                            var previous_1 = substitute;
                            substitute = function (value, node) {
                                return transformSubstitute(previous_1(value, node), node);
                            };
                        }
                        else {
                            substitute = transformSubstitute;
                        }
                    }
                };
                try {
                    for (var _a = tslib_1.__values(this.transformers), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var transform = _b.value;
                        _loop_1(transform);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            var isTsFile = util_1.TS.test(sourceFile.fileName);
            var result = this.collector.getMetadata(sourceFile, this.strict && isTsFile, substitute);
            this.metadataCache.set(sourceFile.fileName, result);
            return result;
            var e_2, _c;
        };
        return MetadataCache;
    }());
    exports.MetadataCache = MetadataCache;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGFfY2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL3RyYW5zZm9ybWVycy9tZXRhZGF0YV9jYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFLakMsb0VBQTBCO0lBUzFCOztPQUVHO0lBQ0g7UUFHRSx1QkFDWSxTQUE0QixFQUFtQixNQUFlLEVBQzlELFlBQW1DO1lBRG5DLGNBQVMsR0FBVCxTQUFTLENBQW1CO1lBQW1CLFdBQU0sR0FBTixNQUFNLENBQVM7WUFDOUQsaUJBQVksR0FBWixZQUFZLENBQXVCO1lBSnZDLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7O2dCQUtsRSxHQUFHLENBQUMsQ0FBb0IsSUFBQSxpQkFBQSxpQkFBQSxZQUFZLENBQUEsMENBQUE7b0JBQS9CLElBQUksV0FBVyx5QkFBQTtvQkFDbEIsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQ3hCLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzVCLENBQUM7aUJBQ0Y7Ozs7Ozs7Ozs7UUFDSCxDQUFDO1FBRUQsbUNBQVcsR0FBWCxVQUFZLFVBQXlCO1lBQ25DLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckQsQ0FBQztZQUNELElBQUksVUFBVSxHQUE2QixTQUFTLENBQUM7WUFFckQsdUVBQXVFO1lBQ3ZFLElBQU0sZUFBZSxHQUFHLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQztZQUNyRCxJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQzt3Q0FDMUIsU0FBUztvQkFDaEIsSUFBTSxtQkFBbUIsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN4RCxFQUFFLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7d0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7NEJBQ2YsSUFBTSxVQUFRLEdBQW1CLFVBQVUsQ0FBQzs0QkFDNUMsVUFBVSxHQUFHLFVBQUMsS0FBb0IsRUFBRSxJQUFhO2dDQUM3QyxPQUFBLG1CQUFtQixDQUFDLFVBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDOzRCQUFoRCxDQUFnRCxDQUFDO3dCQUN2RCxDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNOLFVBQVUsR0FBRyxtQkFBbUIsQ0FBQzt3QkFDbkMsQ0FBQztvQkFDSCxDQUFDO2dCQUNILENBQUM7O29CQVhELEdBQUcsQ0FBQyxDQUFrQixJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQSxnQkFBQTt3QkFBbEMsSUFBSSxTQUFTLFdBQUE7Z0NBQVQsU0FBUztxQkFXakI7Ozs7Ozs7OztZQUNILENBQUM7WUFFRCxJQUFNLFFBQVEsR0FBRyxTQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5QyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sSUFBSSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDM0YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsTUFBTSxDQUFDOztRQUNoQixDQUFDO1FBQ0gsb0JBQUM7SUFBRCxDQUFDLEFBMUNELElBMENDO0lBMUNZLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtNZXRhZGF0YUNvbGxlY3RvciwgTWV0YWRhdGFWYWx1ZSwgTW9kdWxlTWV0YWRhdGF9IGZyb20gJy4uL21ldGFkYXRhL2luZGV4JztcblxuaW1wb3J0IHtNZXRhZGF0YVByb3ZpZGVyfSBmcm9tICcuL2NvbXBpbGVyX2hvc3QnO1xuaW1wb3J0IHtUU30gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IHR5cGUgVmFsdWVUcmFuc2Zvcm0gPSAodmFsdWU6IE1ldGFkYXRhVmFsdWUsIG5vZGU6IHRzLk5vZGUpID0+IE1ldGFkYXRhVmFsdWU7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0YWRhdGFUcmFuc2Zvcm1lciB7XG4gIGNvbm5lY3Q/KGNhY2hlOiBNZXRhZGF0YUNhY2hlKTogdm9pZDtcbiAgc3RhcnQoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IFZhbHVlVHJhbnNmb3JtfHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBDYWNoZSwgYW5kIHBvdGVudGlhbGx5IHRyYW5zZm9ybSwgbWV0YWRhdGEgYXMgaXQgaXMgYmVpbmcgY29sbGVjdGVkLlxuICovXG5leHBvcnQgY2xhc3MgTWV0YWRhdGFDYWNoZSBpbXBsZW1lbnRzIE1ldGFkYXRhUHJvdmlkZXIge1xuICBwcml2YXRlIG1ldGFkYXRhQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgTW9kdWxlTWV0YWRhdGF8dW5kZWZpbmVkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBjb2xsZWN0b3I6IE1ldGFkYXRhQ29sbGVjdG9yLCBwcml2YXRlIHJlYWRvbmx5IHN0cmljdDogYm9vbGVhbixcbiAgICAgIHByaXZhdGUgdHJhbnNmb3JtZXJzOiBNZXRhZGF0YVRyYW5zZm9ybWVyW10pIHtcbiAgICBmb3IgKGxldCB0cmFuc2Zvcm1lciBvZiB0cmFuc2Zvcm1lcnMpIHtcbiAgICAgIGlmICh0cmFuc2Zvcm1lci5jb25uZWN0KSB7XG4gICAgICAgIHRyYW5zZm9ybWVyLmNvbm5lY3QodGhpcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0TWV0YWRhdGEoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IE1vZHVsZU1ldGFkYXRhfHVuZGVmaW5lZCB7XG4gICAgaWYgKHRoaXMubWV0YWRhdGFDYWNoZS5oYXMoc291cmNlRmlsZS5maWxlTmFtZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLm1ldGFkYXRhQ2FjaGUuZ2V0KHNvdXJjZUZpbGUuZmlsZU5hbWUpO1xuICAgIH1cbiAgICBsZXQgc3Vic3RpdHV0ZTogVmFsdWVUcmFuc2Zvcm18dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gT25seSBwcm9jZXNzIHRyYW5zZm9ybWVycyBvbiBtb2R1bGVzIHRoYXQgYXJlIG5vdCBkZWNsYXJhdGlvbiBmaWxlcy5cbiAgICBjb25zdCBkZWNsYXJhdGlvbkZpbGUgPSBzb3VyY2VGaWxlLmlzRGVjbGFyYXRpb25GaWxlO1xuICAgIGNvbnN0IG1vZHVsZUZpbGUgPSB0cy5pc0V4dGVybmFsTW9kdWxlKHNvdXJjZUZpbGUpO1xuICAgIGlmICghZGVjbGFyYXRpb25GaWxlICYmIG1vZHVsZUZpbGUpIHtcbiAgICAgIGZvciAobGV0IHRyYW5zZm9ybSBvZiB0aGlzLnRyYW5zZm9ybWVycykge1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm1TdWJzdGl0dXRlID0gdHJhbnNmb3JtLnN0YXJ0KHNvdXJjZUZpbGUpO1xuICAgICAgICBpZiAodHJhbnNmb3JtU3Vic3RpdHV0ZSkge1xuICAgICAgICAgIGlmIChzdWJzdGl0dXRlKSB7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91czogVmFsdWVUcmFuc2Zvcm0gPSBzdWJzdGl0dXRlO1xuICAgICAgICAgICAgc3Vic3RpdHV0ZSA9ICh2YWx1ZTogTWV0YWRhdGFWYWx1ZSwgbm9kZTogdHMuTm9kZSkgPT5cbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1TdWJzdGl0dXRlKHByZXZpb3VzKHZhbHVlLCBub2RlKSwgbm9kZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1YnN0aXR1dGUgPSB0cmFuc2Zvcm1TdWJzdGl0dXRlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGlzVHNGaWxlID0gVFMudGVzdChzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmNvbGxlY3Rvci5nZXRNZXRhZGF0YShzb3VyY2VGaWxlLCB0aGlzLnN0cmljdCAmJiBpc1RzRmlsZSwgc3Vic3RpdHV0ZSk7XG4gICAgdGhpcy5tZXRhZGF0YUNhY2hlLnNldChzb3VyY2VGaWxlLmZpbGVOYW1lLCByZXN1bHQpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0iXX0=