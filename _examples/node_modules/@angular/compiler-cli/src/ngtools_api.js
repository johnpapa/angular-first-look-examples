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
        define("@angular/compiler-cli/src/ngtools_api", ["require", "exports", "tslib", "@angular/compiler-cli/src/transformers/compiler_host", "@angular/compiler-cli/src/transformers/entry_points"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_host_1 = require("@angular/compiler-cli/src/transformers/compiler_host");
    var entry_points_1 = require("@angular/compiler-cli/src/transformers/entry_points");
    /**
     * @internal
     * @deprecatd Use ngtools_api2 instead!
     */
    var NgTools_InternalApi_NG_2 = /** @class */ (function () {
        function NgTools_InternalApi_NG_2() {
        }
        /**
         * @internal
         */
        NgTools_InternalApi_NG_2.codeGen = function (options) {
            throw throwNotSupportedError();
        };
        /**
         * @internal
         */
        NgTools_InternalApi_NG_2.listLazyRoutes = function (options) {
            // TODO(tbosch): Also throwNotSupportedError once Angular CLI 1.5.1 ships,
            // as we only needed this to support Angular CLI 1.5.0 rc.*
            var ngProgram = entry_points_1.createProgram({
                rootNames: options.program.getRootFileNames(),
                options: tslib_1.__assign({}, options.angularCompilerOptions, { collectAllErrors: true }),
                host: options.host
            });
            var lazyRoutes = ngProgram.listLazyRoutes(options.entryModule);
            try {
                // reset the referencedFiles that the ng.Program added to the SourceFiles
                // as the host might be caching the source files!
                for (var _a = tslib_1.__values(options.program.getSourceFiles()), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var sourceFile = _b.value;
                    var originalReferences = compiler_host_1.getOriginalReferences(sourceFile);
                    if (originalReferences) {
                        sourceFile.referencedFiles = originalReferences;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var result = {};
            lazyRoutes.forEach(function (lazyRoute) {
                var route = lazyRoute.route;
                var referencedFilePath = lazyRoute.referencedModule.filePath;
                if (result[route] && result[route] != referencedFilePath) {
                    throw new Error("Duplicated path in loadChildren detected: \"" + route + "\" is used in 2 loadChildren, " +
                        ("but they point to different modules \"(" + result[route] + " and ") +
                        ("\"" + referencedFilePath + "\"). Webpack cannot distinguish on context and would fail to ") +
                        'load the proper one.');
                }
                result[route] = referencedFilePath;
            });
            return result;
            var e_1, _c;
        };
        /**
         * @internal
         */
        NgTools_InternalApi_NG_2.extractI18n = function (options) {
            throw throwNotSupportedError();
        };
        return NgTools_InternalApi_NG_2;
    }());
    exports.NgTools_InternalApi_NG_2 = NgTools_InternalApi_NG_2;
    function throwNotSupportedError() {
        throw new Error("Please update @angular/cli. Angular 5+ requires at least Angular CLI 1.5+");
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd0b29sc19hcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndG9vbHNfYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQWtCSCxzRkFBbUU7SUFDbkUsb0ZBQTBEO0lBNkMxRDs7O09BR0c7SUFDSDtRQUFBO1FBc0RBLENBQUM7UUFyREM7O1dBRUc7UUFDSSxnQ0FBTyxHQUFkLFVBQWUsT0FBZ0Q7WUFDN0QsTUFBTSxzQkFBc0IsRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFFRDs7V0FFRztRQUNJLHVDQUFjLEdBQXJCLFVBQXNCLE9BQXVEO1lBRTNFLDBFQUEwRTtZQUMxRSwyREFBMkQ7WUFDM0QsSUFBTSxTQUFTLEdBQUcsNEJBQWEsQ0FBQztnQkFDOUIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzdDLE9BQU8sdUJBQU0sT0FBTyxDQUFDLHNCQUFzQixJQUFFLGdCQUFnQixFQUFFLElBQUksR0FBQztnQkFDcEUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO2FBQ25CLENBQUMsQ0FBQztZQUNILElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDOztnQkFFakUseUVBQXlFO2dCQUN6RSxpREFBaUQ7Z0JBQ2pELEdBQUcsQ0FBQyxDQUFxQixJQUFBLEtBQUEsaUJBQUEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQSxnQkFBQTtvQkFBcEQsSUFBTSxVQUFVLFdBQUE7b0JBQ25CLElBQU0sa0JBQWtCLEdBQUcscUNBQXFCLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQzdELEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQzt3QkFDdkIsVUFBVSxDQUFDLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQztvQkFDbEQsQ0FBQztpQkFDRjs7Ozs7Ozs7O1lBRUQsSUFBTSxNQUFNLEdBQTBDLEVBQUUsQ0FBQztZQUN6RCxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsU0FBUztnQkFDMUIsSUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztnQkFDOUIsSUFBTSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDO2dCQUMvRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQztvQkFDekQsTUFBTSxJQUFJLEtBQUssQ0FDWCxpREFBOEMsS0FBSyxtQ0FBK0I7eUJBQ2xGLDRDQUF5QyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQU8sQ0FBQTt5QkFDN0QsT0FBSSxrQkFBa0Isa0VBQThELENBQUE7d0JBQ3BGLHNCQUFzQixDQUFDLENBQUM7Z0JBQzlCLENBQUM7Z0JBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLGtCQUFrQixDQUFDO1lBQ3JDLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQzs7UUFDaEIsQ0FBQztRQUVEOztXQUVHO1FBQ0ksb0NBQVcsR0FBbEIsVUFBbUIsT0FBb0Q7WUFDckUsTUFBTSxzQkFBc0IsRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFDSCwrQkFBQztJQUFELENBQUMsQUF0REQsSUFzREM7SUF0RFksNERBQXdCO0lBd0RyQztRQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsMkVBQTJFLENBQUMsQ0FBQztJQUMvRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIFRoaXMgaXMgYSBwcml2YXRlIEFQSSBmb3IgdGhlIG5ndG9vbHMgdG9vbGtpdC5cbiAqXG4gKiBUaGlzIEFQSSBzaG91bGQgYmUgc3RhYmxlIGZvciBORyAyLiBJdCBjYW4gYmUgcmVtb3ZlZCBpbiBORyA0Li4uLCBidXQgc2hvdWxkIGJlIHJlcGxhY2VkIGJ5XG4gKiBzb21ldGhpbmcgZWxzZS5cbiAqL1xuXG4vKipcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIENoYW5nZXMgdG8gdGhpcyBmaWxlIG5lZWQgdG8gYmUgYXBwcm92ZWQgYnkgdGhlIEFuZ3VsYXIgQ0xJIHRlYW0uICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtDb21waWxlckhvc3QsIENvbXBpbGVyT3B0aW9ucywgTGF6eVJvdXRlfSBmcm9tICcuL3RyYW5zZm9ybWVycy9hcGknO1xuaW1wb3J0IHtnZXRPcmlnaW5hbFJlZmVyZW5jZXN9IGZyb20gJy4vdHJhbnNmb3JtZXJzL2NvbXBpbGVyX2hvc3QnO1xuaW1wb3J0IHtjcmVhdGVQcm9ncmFtfSBmcm9tICcuL3RyYW5zZm9ybWVycy9lbnRyeV9wb2ludHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE5nVG9vbHNfSW50ZXJuYWxBcGlfTkcyX0NvZGVHZW5fT3B0aW9ucyB7XG4gIGJhc2VQYXRoOiBzdHJpbmc7XG4gIGNvbXBpbGVyT3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zO1xuICBwcm9ncmFtOiB0cy5Qcm9ncmFtO1xuICBob3N0OiB0cy5Db21waWxlckhvc3Q7XG5cbiAgYW5ndWxhckNvbXBpbGVyT3B0aW9uczogQ29tcGlsZXJPcHRpb25zO1xuXG4gIC8vIGkxOG4gb3B0aW9ucy5cbiAgaTE4bkZvcm1hdD86IHN0cmluZztcbiAgaTE4bkZpbGU/OiBzdHJpbmc7XG4gIGxvY2FsZT86IHN0cmluZztcbiAgbWlzc2luZ1RyYW5zbGF0aW9uPzogc3RyaW5nO1xuXG4gIHJlYWRSZXNvdXJjZTogKGZpbGVOYW1lOiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nPjtcblxuICAvLyBFdmVyeSBuZXcgcHJvcGVydHkgdW5kZXIgdGhpcyBsaW5lIHNob3VsZCBiZSBvcHRpb25hbC5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBOZ1Rvb2xzX0ludGVybmFsQXBpX05HMl9MaXN0TGF6eVJvdXRlc19PcHRpb25zIHtcbiAgcHJvZ3JhbTogdHMuUHJvZ3JhbTtcbiAgaG9zdDogdHMuQ29tcGlsZXJIb3N0O1xuICBhbmd1bGFyQ29tcGlsZXJPcHRpb25zOiBDb21waWxlck9wdGlvbnM7XG4gIGVudHJ5TW9kdWxlOiBzdHJpbmc7XG5cbiAgLy8gRXZlcnkgbmV3IHByb3BlcnR5IHVuZGVyIHRoaXMgbGluZSBzaG91bGQgYmUgb3B0aW9uYWwuXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmdUb29sc19JbnRlcm5hbEFwaV9OR18yX0xhenlSb3V0ZU1hcCB7IFtyb3V0ZTogc3RyaW5nXTogc3RyaW5nOyB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmdUb29sc19JbnRlcm5hbEFwaV9ORzJfRXh0cmFjdEkxOG5fT3B0aW9ucyB7XG4gIGJhc2VQYXRoOiBzdHJpbmc7XG4gIGNvbXBpbGVyT3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zO1xuICBwcm9ncmFtOiB0cy5Qcm9ncmFtO1xuICBob3N0OiB0cy5Db21waWxlckhvc3Q7XG4gIGFuZ3VsYXJDb21waWxlck9wdGlvbnM6IENvbXBpbGVyT3B0aW9ucztcbiAgaTE4bkZvcm1hdD86IHN0cmluZztcbiAgcmVhZFJlc291cmNlOiAoZmlsZU5hbWU6IHN0cmluZykgPT4gUHJvbWlzZTxzdHJpbmc+O1xuICAvLyBFdmVyeSBuZXcgcHJvcGVydHkgdW5kZXIgdGhpcyBsaW5lIHNob3VsZCBiZSBvcHRpb25hbC5cbiAgbG9jYWxlPzogc3RyaW5nO1xuICBvdXRGaWxlPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEBpbnRlcm5hbFxuICogQGRlcHJlY2F0ZCBVc2Ugbmd0b29sc19hcGkyIGluc3RlYWQhXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ1Rvb2xzX0ludGVybmFsQXBpX05HXzIge1xuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBzdGF0aWMgY29kZUdlbihvcHRpb25zOiBOZ1Rvb2xzX0ludGVybmFsQXBpX05HMl9Db2RlR2VuX09wdGlvbnMpOiBQcm9taXNlPGFueT4ge1xuICAgIHRocm93IHRocm93Tm90U3VwcG9ydGVkRXJyb3IoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHN0YXRpYyBsaXN0TGF6eVJvdXRlcyhvcHRpb25zOiBOZ1Rvb2xzX0ludGVybmFsQXBpX05HMl9MaXN0TGF6eVJvdXRlc19PcHRpb25zKTpcbiAgICAgIE5nVG9vbHNfSW50ZXJuYWxBcGlfTkdfMl9MYXp5Um91dGVNYXAge1xuICAgIC8vIFRPRE8odGJvc2NoKTogQWxzbyB0aHJvd05vdFN1cHBvcnRlZEVycm9yIG9uY2UgQW5ndWxhciBDTEkgMS41LjEgc2hpcHMsXG4gICAgLy8gYXMgd2Ugb25seSBuZWVkZWQgdGhpcyB0byBzdXBwb3J0IEFuZ3VsYXIgQ0xJIDEuNS4wIHJjLipcbiAgICBjb25zdCBuZ1Byb2dyYW0gPSBjcmVhdGVQcm9ncmFtKHtcbiAgICAgIHJvb3ROYW1lczogb3B0aW9ucy5wcm9ncmFtLmdldFJvb3RGaWxlTmFtZXMoKSxcbiAgICAgIG9wdGlvbnM6IHsuLi5vcHRpb25zLmFuZ3VsYXJDb21waWxlck9wdGlvbnMsIGNvbGxlY3RBbGxFcnJvcnM6IHRydWV9LFxuICAgICAgaG9zdDogb3B0aW9ucy5ob3N0XG4gICAgfSk7XG4gICAgY29uc3QgbGF6eVJvdXRlcyA9IG5nUHJvZ3JhbS5saXN0TGF6eVJvdXRlcyhvcHRpb25zLmVudHJ5TW9kdWxlKTtcblxuICAgIC8vIHJlc2V0IHRoZSByZWZlcmVuY2VkRmlsZXMgdGhhdCB0aGUgbmcuUHJvZ3JhbSBhZGRlZCB0byB0aGUgU291cmNlRmlsZXNcbiAgICAvLyBhcyB0aGUgaG9zdCBtaWdodCBiZSBjYWNoaW5nIHRoZSBzb3VyY2UgZmlsZXMhXG4gICAgZm9yIChjb25zdCBzb3VyY2VGaWxlIG9mIG9wdGlvbnMucHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpKSB7XG4gICAgICBjb25zdCBvcmlnaW5hbFJlZmVyZW5jZXMgPSBnZXRPcmlnaW5hbFJlZmVyZW5jZXMoc291cmNlRmlsZSk7XG4gICAgICBpZiAob3JpZ2luYWxSZWZlcmVuY2VzKSB7XG4gICAgICAgIHNvdXJjZUZpbGUucmVmZXJlbmNlZEZpbGVzID0gb3JpZ2luYWxSZWZlcmVuY2VzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdDogTmdUb29sc19JbnRlcm5hbEFwaV9OR18yX0xhenlSb3V0ZU1hcCA9IHt9O1xuICAgIGxhenlSb3V0ZXMuZm9yRWFjaChsYXp5Um91dGUgPT4ge1xuICAgICAgY29uc3Qgcm91dGUgPSBsYXp5Um91dGUucm91dGU7XG4gICAgICBjb25zdCByZWZlcmVuY2VkRmlsZVBhdGggPSBsYXp5Um91dGUucmVmZXJlbmNlZE1vZHVsZS5maWxlUGF0aDtcbiAgICAgIGlmIChyZXN1bHRbcm91dGVdICYmIHJlc3VsdFtyb3V0ZV0gIT0gcmVmZXJlbmNlZEZpbGVQYXRoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBEdXBsaWNhdGVkIHBhdGggaW4gbG9hZENoaWxkcmVuIGRldGVjdGVkOiBcIiR7cm91dGV9XCIgaXMgdXNlZCBpbiAyIGxvYWRDaGlsZHJlbiwgYCArXG4gICAgICAgICAgICBgYnV0IHRoZXkgcG9pbnQgdG8gZGlmZmVyZW50IG1vZHVsZXMgXCIoJHtyZXN1bHRbcm91dGVdfSBhbmQgYCArXG4gICAgICAgICAgICBgXCIke3JlZmVyZW5jZWRGaWxlUGF0aH1cIikuIFdlYnBhY2sgY2Fubm90IGRpc3Rpbmd1aXNoIG9uIGNvbnRleHQgYW5kIHdvdWxkIGZhaWwgdG8gYCArXG4gICAgICAgICAgICAnbG9hZCB0aGUgcHJvcGVyIG9uZS4nKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdFtyb3V0ZV0gPSByZWZlcmVuY2VkRmlsZVBhdGg7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgc3RhdGljIGV4dHJhY3RJMThuKG9wdGlvbnM6IE5nVG9vbHNfSW50ZXJuYWxBcGlfTkcyX0V4dHJhY3RJMThuX09wdGlvbnMpOiBQcm9taXNlPGFueT4ge1xuICAgIHRocm93IHRocm93Tm90U3VwcG9ydGVkRXJyb3IoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0aHJvd05vdFN1cHBvcnRlZEVycm9yKCkge1xuICB0aHJvdyBuZXcgRXJyb3IoYFBsZWFzZSB1cGRhdGUgQGFuZ3VsYXIvY2xpLiBBbmd1bGFyIDUrIHJlcXVpcmVzIGF0IGxlYXN0IEFuZ3VsYXIgQ0xJIDEuNStgKTtcbn1cbiJdfQ==