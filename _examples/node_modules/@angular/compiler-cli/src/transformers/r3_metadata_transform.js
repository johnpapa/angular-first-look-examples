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
        define("@angular/compiler-cli/src/transformers/r3_metadata_transform", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/metadata/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var index_1 = require("@angular/compiler-cli/src/metadata/index");
    var PartialModuleMetadataTransformer = /** @class */ (function () {
        function PartialModuleMetadataTransformer(modules) {
            this.moduleMap = new Map(modules.map(function (m) { return [m.fileName, m]; }));
        }
        PartialModuleMetadataTransformer.prototype.start = function (sourceFile) {
            var partialModule = this.moduleMap.get(sourceFile.fileName);
            if (partialModule) {
                var classMap_1 = new Map(partialModule.statements.filter(isClassStmt).map(function (s) { return [s.name, s]; }));
                if (classMap_1.size > 0) {
                    return function (value, node) {
                        // For class metadata that is going to be transformed to have a static method ensure the
                        // metadata contains a static declaration the new static method.
                        if (index_1.isClassMetadata(value) && node.kind === ts.SyntaxKind.ClassDeclaration) {
                            var classDeclaration = node;
                            if (classDeclaration.name) {
                                var partialClass = classMap_1.get(classDeclaration.name.text);
                                if (partialClass) {
                                    try {
                                        for (var _a = tslib_1.__values(partialClass.fields), _b = _a.next(); !_b.done; _b = _a.next()) {
                                            var field = _b.value;
                                            if (field.name && field.modifiers &&
                                                field.modifiers.some(function (modifier) { return modifier === compiler_1.StmtModifier.Static; })) {
                                                value.statics = tslib_1.__assign({}, (value.statics || {}), (_c = {}, _c[field.name] = {}, _c));
                                            }
                                        }
                                    }
                                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                                    finally {
                                        try {
                                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                                        }
                                        finally { if (e_1) throw e_1.error; }
                                    }
                                }
                            }
                        }
                        return value;
                        var e_1, _d, _c;
                    };
                }
            }
        };
        return PartialModuleMetadataTransformer;
    }());
    exports.PartialModuleMetadataTransformer = PartialModuleMetadataTransformer;
    function isClassStmt(v) {
        return v instanceof compiler_1.ClassStmt;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfbWV0YWRhdGFfdHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy90cmFuc2Zvcm1lcnMvcjNfbWV0YWRhdGFfdHJhbnNmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUFvRjtJQUNwRiwrQkFBaUM7SUFFakMsa0VBQW9HO0lBSXBHO1FBR0UsMENBQVksT0FBd0I7WUFDbEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUEwQixVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBZixDQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7UUFFRCxnREFBSyxHQUFMLFVBQU0sVUFBeUI7WUFDN0IsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlELEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLElBQU0sVUFBUSxHQUFHLElBQUksR0FBRyxDQUNwQixhQUFhLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQXNCLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFYLENBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQzdGLEVBQUUsQ0FBQyxDQUFDLFVBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdEIsTUFBTSxDQUFDLFVBQUMsS0FBb0IsRUFBRSxJQUFhO3dCQUN6Qyx3RkFBd0Y7d0JBQ3hGLGdFQUFnRTt3QkFDaEUsRUFBRSxDQUFDLENBQUMsdUJBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDOzRCQUMzRSxJQUFNLGdCQUFnQixHQUFHLElBQTJCLENBQUM7NEJBQ3JELEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0NBQzFCLElBQU0sWUFBWSxHQUFHLFVBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dDQUM5RCxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDOzt3Q0FDakIsR0FBRyxDQUFDLENBQWdCLElBQUEsS0FBQSxpQkFBQSxZQUFZLENBQUMsTUFBTSxDQUFBLGdCQUFBOzRDQUFsQyxJQUFNLEtBQUssV0FBQTs0Q0FDZCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxTQUFTO2dEQUM3QixLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFBLFFBQVEsSUFBSSxPQUFBLFFBQVEsS0FBSyx1QkFBWSxDQUFDLE1BQU0sRUFBaEMsQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztnREFDdkUsS0FBSyxDQUFDLE9BQU8sd0JBQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxlQUFHLEtBQUssQ0FBQyxJQUFJLElBQUcsRUFBRSxNQUFDLENBQUM7NENBQy9ELENBQUM7eUNBQ0Y7Ozs7Ozs7OztnQ0FDSCxDQUFDOzRCQUNILENBQUM7d0JBQ0gsQ0FBQzt3QkFDRCxNQUFNLENBQUMsS0FBSyxDQUFDOztvQkFDZixDQUFDLENBQUM7Z0JBQ0osQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQ0gsdUNBQUM7SUFBRCxDQUFDLEFBbkNELElBbUNDO0lBbkNZLDRFQUFnQztJQXFDN0MscUJBQXFCLENBQVk7UUFDL0IsTUFBTSxDQUFDLENBQUMsWUFBWSxvQkFBUyxDQUFDO0lBQ2hDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2xhc3NTdG10LCBQYXJ0aWFsTW9kdWxlLCBTdGF0ZW1lbnQsIFN0bXRNb2RpZmllcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7TWV0YWRhdGFDb2xsZWN0b3IsIE1ldGFkYXRhVmFsdWUsIE1vZHVsZU1ldGFkYXRhLCBpc0NsYXNzTWV0YWRhdGF9IGZyb20gJy4uL21ldGFkYXRhL2luZGV4JztcblxuaW1wb3J0IHtNZXRhZGF0YVRyYW5zZm9ybWVyLCBWYWx1ZVRyYW5zZm9ybX0gZnJvbSAnLi9tZXRhZGF0YV9jYWNoZSc7XG5cbmV4cG9ydCBjbGFzcyBQYXJ0aWFsTW9kdWxlTWV0YWRhdGFUcmFuc2Zvcm1lciBpbXBsZW1lbnRzIE1ldGFkYXRhVHJhbnNmb3JtZXIge1xuICBwcml2YXRlIG1vZHVsZU1hcDogTWFwPHN0cmluZywgUGFydGlhbE1vZHVsZT47XG5cbiAgY29uc3RydWN0b3IobW9kdWxlczogUGFydGlhbE1vZHVsZVtdKSB7XG4gICAgdGhpcy5tb2R1bGVNYXAgPSBuZXcgTWFwKG1vZHVsZXMubWFwPFtzdHJpbmcsIFBhcnRpYWxNb2R1bGVdPihtID0+IFttLmZpbGVOYW1lLCBtXSkpO1xuICB9XG5cbiAgc3RhcnQoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IFZhbHVlVHJhbnNmb3JtfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgcGFydGlhbE1vZHVsZSA9IHRoaXMubW9kdWxlTWFwLmdldChzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgICBpZiAocGFydGlhbE1vZHVsZSkge1xuICAgICAgY29uc3QgY2xhc3NNYXAgPSBuZXcgTWFwPHN0cmluZywgQ2xhc3NTdG10PihcbiAgICAgICAgICBwYXJ0aWFsTW9kdWxlLnN0YXRlbWVudHMuZmlsdGVyKGlzQ2xhc3NTdG10KS5tYXA8W3N0cmluZywgQ2xhc3NTdG10XT4ocyA9PiBbcy5uYW1lLCBzXSkpO1xuICAgICAgaWYgKGNsYXNzTWFwLnNpemUgPiAwKSB7XG4gICAgICAgIHJldHVybiAodmFsdWU6IE1ldGFkYXRhVmFsdWUsIG5vZGU6IHRzLk5vZGUpOiBNZXRhZGF0YVZhbHVlID0+IHtcbiAgICAgICAgICAvLyBGb3IgY2xhc3MgbWV0YWRhdGEgdGhhdCBpcyBnb2luZyB0byBiZSB0cmFuc2Zvcm1lZCB0byBoYXZlIGEgc3RhdGljIG1ldGhvZCBlbnN1cmUgdGhlXG4gICAgICAgICAgLy8gbWV0YWRhdGEgY29udGFpbnMgYSBzdGF0aWMgZGVjbGFyYXRpb24gdGhlIG5ldyBzdGF0aWMgbWV0aG9kLlxuICAgICAgICAgIGlmIChpc0NsYXNzTWV0YWRhdGEodmFsdWUpICYmIG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICBjb25zdCBjbGFzc0RlY2xhcmF0aW9uID0gbm9kZSBhcyB0cy5DbGFzc0RlY2xhcmF0aW9uO1xuICAgICAgICAgICAgaWYgKGNsYXNzRGVjbGFyYXRpb24ubmFtZSkge1xuICAgICAgICAgICAgICBjb25zdCBwYXJ0aWFsQ2xhc3MgPSBjbGFzc01hcC5nZXQoY2xhc3NEZWNsYXJhdGlvbi5uYW1lLnRleHQpO1xuICAgICAgICAgICAgICBpZiAocGFydGlhbENsYXNzKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBwYXJ0aWFsQ2xhc3MuZmllbGRzKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoZmllbGQubmFtZSAmJiBmaWVsZC5tb2RpZmllcnMgJiZcbiAgICAgICAgICAgICAgICAgICAgICBmaWVsZC5tb2RpZmllcnMuc29tZShtb2RpZmllciA9PiBtb2RpZmllciA9PT0gU3RtdE1vZGlmaWVyLlN0YXRpYykpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUuc3RhdGljcyA9IHsuLi4odmFsdWUuc3RhdGljcyB8fCB7fSksIFtmaWVsZC5uYW1lXToge319O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzQ2xhc3NTdG10KHY6IFN0YXRlbWVudCk6IHYgaXMgQ2xhc3NTdG10IHtcbiAgcmV0dXJuIHYgaW5zdGFuY2VvZiBDbGFzc1N0bXQ7XG59XG4iXX0=