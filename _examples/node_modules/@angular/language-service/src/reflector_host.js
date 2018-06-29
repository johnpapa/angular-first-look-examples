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
        define("@angular/language-service/src/reflector_host", ["require", "exports", "@angular/compiler-cli/src/language_services", "path", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var language_services_1 = require("@angular/compiler-cli/src/language_services");
    var path = require("path");
    var ts = require("typescript");
    var ReflectorModuleModuleResolutionHost = /** @class */ (function () {
        function ReflectorModuleModuleResolutionHost(host, getProgram) {
            var _this = this;
            this.host = host;
            this.getProgram = getProgram;
            // Note: verboseInvalidExpressions is important so that
            // the collector will collect errors instead of throwing
            this.metadataCollector = new language_services_1.MetadataCollector({ verboseInvalidExpression: true });
            if (host.directoryExists)
                this.directoryExists = function (directoryName) { return _this.host.directoryExists(directoryName); };
        }
        ReflectorModuleModuleResolutionHost.prototype.fileExists = function (fileName) { return !!this.host.getScriptSnapshot(fileName); };
        ReflectorModuleModuleResolutionHost.prototype.readFile = function (fileName) {
            var snapshot = this.host.getScriptSnapshot(fileName);
            if (snapshot) {
                return snapshot.getText(0, snapshot.getLength());
            }
            // Typescript readFile() declaration should be `readFile(fileName: string): string | undefined
            return undefined;
        };
        ReflectorModuleModuleResolutionHost.prototype.getSourceFileMetadata = function (fileName) {
            var sf = this.getProgram().getSourceFile(fileName);
            return sf ? this.metadataCollector.getMetadata(sf) : undefined;
        };
        ReflectorModuleModuleResolutionHost.prototype.cacheMetadata = function (fileName) {
            // Don't cache the metadata for .ts files as they might change in the editor!
            return fileName.endsWith('.d.ts');
        };
        return ReflectorModuleModuleResolutionHost;
    }());
    var ReflectorHost = /** @class */ (function () {
        function ReflectorHost(getProgram, serviceHost, options) {
            this.options = options;
            this.metadataReaderCache = language_services_1.createMetadataReaderCache();
            this.hostAdapter = new ReflectorModuleModuleResolutionHost(serviceHost, getProgram);
            this.moduleResolutionCache =
                ts.createModuleResolutionCache(serviceHost.getCurrentDirectory(), function (s) { return s; });
        }
        ReflectorHost.prototype.getMetadataFor = function (modulePath) {
            return language_services_1.readMetadata(modulePath, this.hostAdapter, this.metadataReaderCache);
        };
        ReflectorHost.prototype.moduleNameToFileName = function (moduleName, containingFile) {
            if (!containingFile) {
                if (moduleName.indexOf('.') === 0) {
                    throw new Error('Resolution of relative paths requires a containing file.');
                }
                // Any containing file gives the same result for absolute imports
                containingFile = path.join(this.options.basePath, 'index.ts').replace(/\\/g, '/');
            }
            var resolved = ts.resolveModuleName(moduleName, containingFile, this.options, this.hostAdapter)
                .resolvedModule;
            return resolved ? resolved.resolvedFileName : null;
        };
        ReflectorHost.prototype.getOutputName = function (filePath) { return filePath; };
        return ReflectorHost;
    }());
    exports.ReflectorHost = ReflectorHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmbGVjdG9yX2hvc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9sYW5ndWFnZS1zZXJ2aWNlL3NyYy9yZWZsZWN0b3JfaG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUdILGlGQUFpTDtJQUNqTCwyQkFBNkI7SUFDN0IsK0JBQWlDO0lBRWpDO1FBS0UsNkNBQW9CLElBQTRCLEVBQVUsVUFBNEI7WUFBdEYsaUJBR0M7WUFIbUIsU0FBSSxHQUFKLElBQUksQ0FBd0I7WUFBVSxlQUFVLEdBQVYsVUFBVSxDQUFrQjtZQUp0Rix1REFBdUQ7WUFDdkQsd0RBQXdEO1lBQ2hELHNCQUFpQixHQUFHLElBQUkscUNBQWlCLENBQUMsRUFBQyx3QkFBd0IsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBR2xGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxlQUFlLEdBQUcsVUFBQSxhQUFhLElBQUksT0FBQSxLQUFJLENBQUMsSUFBSSxDQUFDLGVBQWlCLENBQUMsYUFBYSxDQUFDLEVBQTFDLENBQTBDLENBQUM7UUFDdkYsQ0FBQztRQUVELHdEQUFVLEdBQVYsVUFBVyxRQUFnQixJQUFhLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFekYsc0RBQVEsR0FBUixVQUFTLFFBQWdCO1lBQ3ZCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckQsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDYixNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDbkQsQ0FBQztZQUVELDhGQUE4RjtZQUM5RixNQUFNLENBQUMsU0FBVyxDQUFDO1FBQ3JCLENBQUM7UUFJRCxtRUFBcUIsR0FBckIsVUFBc0IsUUFBZ0I7WUFDcEMsSUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDakUsQ0FBQztRQUVELDJEQUFhLEdBQWIsVUFBYyxRQUFnQjtZQUM1Qiw2RUFBNkU7WUFDN0UsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUNILDBDQUFDO0lBQUQsQ0FBQyxBQWpDRCxJQWlDQztJQUVEO1FBS0UsdUJBQ0ksVUFBNEIsRUFBRSxXQUFtQyxFQUN6RCxPQUF3QjtZQUF4QixZQUFPLEdBQVAsT0FBTyxDQUFpQjtZQUo1Qix3QkFBbUIsR0FBRyw2Q0FBeUIsRUFBRSxDQUFDO1lBS3hELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxtQ0FBbUMsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDcEYsSUFBSSxDQUFDLHFCQUFxQjtnQkFDdEIsRUFBRSxDQUFDLDJCQUEyQixDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxFQUFELENBQUMsQ0FBQyxDQUFDO1FBQ2xGLENBQUM7UUFFRCxzQ0FBYyxHQUFkLFVBQWUsVUFBa0I7WUFDL0IsTUFBTSxDQUFDLGdDQUFZLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVELDRDQUFvQixHQUFwQixVQUFxQixVQUFrQixFQUFFLGNBQXVCO1lBQzlELEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7Z0JBQzlFLENBQUM7Z0JBQ0QsaUVBQWlFO2dCQUNqRSxjQUFjLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3RGLENBQUM7WUFDRCxJQUFNLFFBQVEsR0FDVixFQUFFLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLGNBQWdCLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDO2lCQUM3RSxjQUFjLENBQUM7WUFDeEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDckQsQ0FBQztRQUVELHFDQUFhLEdBQWIsVUFBYyxRQUFnQixJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3RELG9CQUFDO0lBQUQsQ0FBQyxBQWhDRCxJQWdDQztJQWhDWSxzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdGF0aWNTeW1ib2xSZXNvbHZlckhvc3R9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCB7Q29tcGlsZXJPcHRpb25zLCBNZXRhZGF0YUNvbGxlY3RvciwgTWV0YWRhdGFSZWFkZXJDYWNoZSwgTWV0YWRhdGFSZWFkZXJIb3N0LCBjcmVhdGVNZXRhZGF0YVJlYWRlckNhY2hlLCByZWFkTWV0YWRhdGF9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyLWNsaS9zcmMvbGFuZ3VhZ2Vfc2VydmljZXMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5jbGFzcyBSZWZsZWN0b3JNb2R1bGVNb2R1bGVSZXNvbHV0aW9uSG9zdCBpbXBsZW1lbnRzIHRzLk1vZHVsZVJlc29sdXRpb25Ib3N0LCBNZXRhZGF0YVJlYWRlckhvc3Qge1xuICAvLyBOb3RlOiB2ZXJib3NlSW52YWxpZEV4cHJlc3Npb25zIGlzIGltcG9ydGFudCBzbyB0aGF0XG4gIC8vIHRoZSBjb2xsZWN0b3Igd2lsbCBjb2xsZWN0IGVycm9ycyBpbnN0ZWFkIG9mIHRocm93aW5nXG4gIHByaXZhdGUgbWV0YWRhdGFDb2xsZWN0b3IgPSBuZXcgTWV0YWRhdGFDb2xsZWN0b3Ioe3ZlcmJvc2VJbnZhbGlkRXhwcmVzc2lvbjogdHJ1ZX0pO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaG9zdDogdHMuTGFuZ3VhZ2VTZXJ2aWNlSG9zdCwgcHJpdmF0ZSBnZXRQcm9ncmFtOiAoKSA9PiB0cy5Qcm9ncmFtKSB7XG4gICAgaWYgKGhvc3QuZGlyZWN0b3J5RXhpc3RzKVxuICAgICAgdGhpcy5kaXJlY3RvcnlFeGlzdHMgPSBkaXJlY3RvcnlOYW1lID0+IHRoaXMuaG9zdC5kaXJlY3RvcnlFeGlzdHMgIShkaXJlY3RvcnlOYW1lKTtcbiAgfVxuXG4gIGZpbGVFeGlzdHMoZmlsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gISF0aGlzLmhvc3QuZ2V0U2NyaXB0U25hcHNob3QoZmlsZU5hbWUpOyB9XG5cbiAgcmVhZEZpbGUoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IHNuYXBzaG90ID0gdGhpcy5ob3N0LmdldFNjcmlwdFNuYXBzaG90KGZpbGVOYW1lKTtcbiAgICBpZiAoc25hcHNob3QpIHtcbiAgICAgIHJldHVybiBzbmFwc2hvdC5nZXRUZXh0KDAsIHNuYXBzaG90LmdldExlbmd0aCgpKTtcbiAgICB9XG5cbiAgICAvLyBUeXBlc2NyaXB0IHJlYWRGaWxlKCkgZGVjbGFyYXRpb24gc2hvdWxkIGJlIGByZWFkRmlsZShmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gICAgcmV0dXJuIHVuZGVmaW5lZCAhO1xuICB9XG5cbiAgZGlyZWN0b3J5RXhpc3RzOiAoZGlyZWN0b3J5TmFtZTogc3RyaW5nKSA9PiBib29sZWFuO1xuXG4gIGdldFNvdXJjZUZpbGVNZXRhZGF0YShmaWxlTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3Qgc2YgPSB0aGlzLmdldFByb2dyYW0oKS5nZXRTb3VyY2VGaWxlKGZpbGVOYW1lKTtcbiAgICByZXR1cm4gc2YgPyB0aGlzLm1ldGFkYXRhQ29sbGVjdG9yLmdldE1ldGFkYXRhKHNmKSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGNhY2hlTWV0YWRhdGEoZmlsZU5hbWU6IHN0cmluZykge1xuICAgIC8vIERvbid0IGNhY2hlIHRoZSBtZXRhZGF0YSBmb3IgLnRzIGZpbGVzIGFzIHRoZXkgbWlnaHQgY2hhbmdlIGluIHRoZSBlZGl0b3IhXG4gICAgcmV0dXJuIGZpbGVOYW1lLmVuZHNXaXRoKCcuZC50cycpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWZsZWN0b3JIb3N0IGltcGxlbWVudHMgU3RhdGljU3ltYm9sUmVzb2x2ZXJIb3N0IHtcbiAgcHJpdmF0ZSBtb2R1bGVSZXNvbHV0aW9uQ2FjaGU6IHRzLk1vZHVsZVJlc29sdXRpb25DYWNoZTtcbiAgcHJpdmF0ZSBob3N0QWRhcHRlcjogUmVmbGVjdG9yTW9kdWxlTW9kdWxlUmVzb2x1dGlvbkhvc3Q7XG4gIHByaXZhdGUgbWV0YWRhdGFSZWFkZXJDYWNoZSA9IGNyZWF0ZU1ldGFkYXRhUmVhZGVyQ2FjaGUoKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIGdldFByb2dyYW06ICgpID0+IHRzLlByb2dyYW0sIHNlcnZpY2VIb3N0OiB0cy5MYW5ndWFnZVNlcnZpY2VIb3N0LFxuICAgICAgcHJpdmF0ZSBvcHRpb25zOiBDb21waWxlck9wdGlvbnMpIHtcbiAgICB0aGlzLmhvc3RBZGFwdGVyID0gbmV3IFJlZmxlY3Rvck1vZHVsZU1vZHVsZVJlc29sdXRpb25Ib3N0KHNlcnZpY2VIb3N0LCBnZXRQcm9ncmFtKTtcbiAgICB0aGlzLm1vZHVsZVJlc29sdXRpb25DYWNoZSA9XG4gICAgICAgIHRzLmNyZWF0ZU1vZHVsZVJlc29sdXRpb25DYWNoZShzZXJ2aWNlSG9zdC5nZXRDdXJyZW50RGlyZWN0b3J5KCksIChzKSA9PiBzKTtcbiAgfVxuXG4gIGdldE1ldGFkYXRhRm9yKG1vZHVsZVBhdGg6IHN0cmluZyk6IHtba2V5OiBzdHJpbmddOiBhbnl9W118dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gcmVhZE1ldGFkYXRhKG1vZHVsZVBhdGgsIHRoaXMuaG9zdEFkYXB0ZXIsIHRoaXMubWV0YWRhdGFSZWFkZXJDYWNoZSk7XG4gIH1cblxuICBtb2R1bGVOYW1lVG9GaWxlTmFtZShtb2R1bGVOYW1lOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlPzogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIGlmICghY29udGFpbmluZ0ZpbGUpIHtcbiAgICAgIGlmIChtb2R1bGVOYW1lLmluZGV4T2YoJy4nKSA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc29sdXRpb24gb2YgcmVsYXRpdmUgcGF0aHMgcmVxdWlyZXMgYSBjb250YWluaW5nIGZpbGUuJyk7XG4gICAgICB9XG4gICAgICAvLyBBbnkgY29udGFpbmluZyBmaWxlIGdpdmVzIHRoZSBzYW1lIHJlc3VsdCBmb3IgYWJzb2x1dGUgaW1wb3J0c1xuICAgICAgY29udGFpbmluZ0ZpbGUgPSBwYXRoLmpvaW4odGhpcy5vcHRpb25zLmJhc2VQYXRoICEsICdpbmRleC50cycpLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICB9XG4gICAgY29uc3QgcmVzb2x2ZWQgPVxuICAgICAgICB0cy5yZXNvbHZlTW9kdWxlTmFtZShtb2R1bGVOYW1lLCBjb250YWluaW5nRmlsZSAhLCB0aGlzLm9wdGlvbnMsIHRoaXMuaG9zdEFkYXB0ZXIpXG4gICAgICAgICAgICAucmVzb2x2ZWRNb2R1bGU7XG4gICAgcmV0dXJuIHJlc29sdmVkID8gcmVzb2x2ZWQucmVzb2x2ZWRGaWxlTmFtZSA6IG51bGw7XG4gIH1cblxuICBnZXRPdXRwdXROYW1lKGZpbGVQYXRoOiBzdHJpbmcpIHsgcmV0dXJuIGZpbGVQYXRoOyB9XG59XG4iXX0=