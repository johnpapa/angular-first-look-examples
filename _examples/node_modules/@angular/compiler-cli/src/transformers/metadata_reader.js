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
        define("@angular/compiler-cli/src/transformers/metadata_reader", ["require", "exports", "tslib", "@angular/compiler-cli/src/metadata/index", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var metadata_1 = require("@angular/compiler-cli/src/metadata/index");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    function createMetadataReaderCache() {
        var data = new Map();
        return { data: data };
    }
    exports.createMetadataReaderCache = createMetadataReaderCache;
    function readMetadata(filePath, host, cache) {
        var metadatas = cache && cache.data.get(filePath);
        if (metadatas) {
            return metadatas;
        }
        if (host.fileExists(filePath)) {
            // If the file doesn't exists then we cannot return metadata for the file.
            // This will occur if the user referenced a declared module for which no file
            // exists for the module (i.e. jQuery or angularjs).
            if (util_1.DTS.test(filePath)) {
                metadatas = readMetadataFile(host, filePath);
                if (!metadatas) {
                    // If there is a .d.ts file but no metadata file we need to produce a
                    // metadata from the .d.ts file as metadata files capture reexports
                    // (starting with v3).
                    metadatas = [upgradeMetadataWithDtsData(host, { '__symbolic': 'module', 'version': 1, 'metadata': {} }, filePath)];
                }
            }
            else {
                var metadata = host.getSourceFileMetadata(filePath);
                metadatas = metadata ? [metadata] : [];
            }
        }
        if (cache && (!host.cacheMetadata || host.cacheMetadata(filePath))) {
            cache.data.set(filePath, metadatas);
        }
        return metadatas;
    }
    exports.readMetadata = readMetadata;
    function readMetadataFile(host, dtsFilePath) {
        var metadataPath = dtsFilePath.replace(util_1.DTS, '.metadata.json');
        if (!host.fileExists(metadataPath)) {
            return undefined;
        }
        try {
            var metadataOrMetadatas = JSON.parse(host.readFile(metadataPath));
            var metadatas = metadataOrMetadatas ?
                (Array.isArray(metadataOrMetadatas) ? metadataOrMetadatas : [metadataOrMetadatas]) :
                [];
            if (metadatas.length) {
                var maxMetadata = metadatas.reduce(function (p, c) { return p.version > c.version ? p : c; });
                if (maxMetadata.version < metadata_1.METADATA_VERSION) {
                    metadatas.push(upgradeMetadataWithDtsData(host, maxMetadata, dtsFilePath));
                }
            }
            return metadatas;
        }
        catch (e) {
            console.error("Failed to read JSON file " + metadataPath);
            throw e;
        }
    }
    function upgradeMetadataWithDtsData(host, oldMetadata, dtsFilePath) {
        // patch v1 to v3 by adding exports and the `extends` clause.
        // patch v3 to v4 by adding `interface` symbols for TypeAlias
        var newMetadata = {
            '__symbolic': 'module',
            'version': metadata_1.METADATA_VERSION,
            'metadata': tslib_1.__assign({}, oldMetadata.metadata),
        };
        if (oldMetadata.exports) {
            newMetadata.exports = oldMetadata.exports;
        }
        if (oldMetadata.importAs) {
            newMetadata.importAs = oldMetadata.importAs;
        }
        if (oldMetadata.origins) {
            newMetadata.origins = oldMetadata.origins;
        }
        var dtsMetadata = host.getSourceFileMetadata(dtsFilePath);
        if (dtsMetadata) {
            for (var prop in dtsMetadata.metadata) {
                if (!newMetadata.metadata[prop]) {
                    newMetadata.metadata[prop] = dtsMetadata.metadata[prop];
                }
            }
            if (dtsMetadata['importAs'])
                newMetadata['importAs'] = dtsMetadata['importAs'];
            // Only copy exports from exports from metadata prior to version 3.
            // Starting with version 3 the collector began collecting exports and
            // this should be redundant. Also, with bundler will rewrite the exports
            // which will hoist the exports from modules referenced indirectly causing
            // the imports to be different than the .d.ts files and using the .d.ts file
            // exports would cause the StaticSymbolResolver to redirect symbols to the
            // incorrect location.
            if ((!oldMetadata.version || oldMetadata.version < 3) && dtsMetadata.exports) {
                newMetadata.exports = dtsMetadata.exports;
            }
        }
        return newMetadata;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGFfcmVhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy90cmFuc2Zvcm1lcnMvbWV0YWRhdGFfcmVhZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUlILHFFQUE2RDtJQUU3RCxvRUFBMkI7SUFnQjNCO1FBQ0UsSUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQXNDLENBQUM7UUFDM0QsTUFBTSxDQUFDLEVBQUMsSUFBSSxNQUFBLEVBQUMsQ0FBQztJQUNoQixDQUFDO0lBSEQsOERBR0M7SUFFRCxzQkFDSSxRQUFnQixFQUFFLElBQXdCLEVBQUUsS0FBMkI7UUFFekUsSUFBSSxTQUFTLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDZCxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QiwwRUFBMEU7WUFDMUUsNkVBQTZFO1lBQzdFLG9EQUFvRDtZQUNwRCxFQUFFLENBQUMsQ0FBQyxVQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsU0FBUyxHQUFHLGdCQUFnQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDN0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNmLHFFQUFxRTtvQkFDckUsbUVBQW1FO29CQUNuRSxzQkFBc0I7b0JBQ3RCLFNBQVMsR0FBRyxDQUFDLDBCQUEwQixDQUNuQyxJQUFJLEVBQUUsRUFBQyxZQUFZLEVBQUUs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QUMsT0FBTyxDQUFDO1lBQzVDLENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUNyQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtNRVRBREFUQV9WRVJTSU9OLCBNb2R1bGVNZXRhZGF0YX0gZnJvbSAnLi4vbWV0YWRhdGEnO1xuXG5pbXBvcnQge0RUU30gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBNZXRhZGF0YVJlYWRlckhvc3Qge1xuICBnZXRTb3VyY2VGaWxlTWV0YWRhdGEoZmlsZVBhdGg6IHN0cmluZyk6IE1vZHVsZU1ldGFkYXRhfHVuZGVmaW5lZDtcbiAgY2FjaGVNZXRhZGF0YT8oZmlsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW47XG4gIGZpbGVFeGlzdHMoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW47XG4gIHJlYWRGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0YWRhdGFSZWFkZXJDYWNoZSB7XG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGRhdGE6IE1hcDxzdHJpbmcsIE1vZHVsZU1ldGFkYXRhW118dW5kZWZpbmVkPjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1ldGFkYXRhUmVhZGVyQ2FjaGUoKTogTWV0YWRhdGFSZWFkZXJDYWNoZSB7XG4gIGNvbnN0IGRhdGEgPSBuZXcgTWFwPHN0cmluZywgTW9kdWxlTWV0YWRhdGFbXXx1bmRlZmluZWQ+KCk7XG4gIHJldHVybiB7ZGF0YX07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkTWV0YWRhdGEoXG4gICAgZmlsZVBhdGg6IHN0cmluZywgaG9zdDogTWV0YWRhdGFSZWFkZXJIb3N0LCBjYWNoZT86IE1ldGFkYXRhUmVhZGVyQ2FjaGUpOiBNb2R1bGVNZXRhZGF0YVtdfFxuICAgIHVuZGVmaW5lZCB7XG4gIGxldCBtZXRhZGF0YXMgPSBjYWNoZSAmJiBjYWNoZS5kYXRhLmdldChmaWxlUGF0aCk7XG4gIGlmIChtZXRhZGF0YXMpIHtcbiAgICByZXR1cm4gbWV0YWRhdGFzO1xuICB9XG4gIGlmIChob3N0LmZpbGVFeGlzdHMoZmlsZVBhdGgpKSB7XG4gICAgLy8gSWYgdGhlIGZpbGUgZG9lc24ndCBleGlzdHMgdGhlbiB3ZSBjYW5ub3QgcmV0dXJuIG1ldGFkYXRhIGZvciB0aGUgZmlsZS5cbiAgICAvLyBUaGlzIHdpbGwgb2NjdXIgaWYgdGhlIHVzZXIgcmVmZXJlbmNlZCBhIGRlY2xhcmVkIG1vZHVsZSBmb3Igd2hpY2ggbm8gZmlsZVxuICAgIC8vIGV4aXN0cyBmb3IgdGhlIG1vZHVsZSAoaS5lLiBqUXVlcnkgb3IgYW5ndWxhcmpzKS5cbiAgICBpZiAoRFRTLnRlc3QoZmlsZVBhdGgpKSB7XG4gICAgICBtZXRhZGF0YXMgPSByZWFkTWV0YWRhdGFGaWxlKGhvc3QsIGZpbGVQYXRoKTtcbiAgICAgIGlmICghbWV0YWRhdGFzKSB7XG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgLmQudHMgZmlsZSBidXQgbm8gbWV0YWRhdGEgZmlsZSB3ZSBuZWVkIHRvIHByb2R1Y2UgYVxuICAgICAgICAvLyBtZXRhZGF0YSBmcm9tIHRoZSAuZC50cyBmaWxlIGFzIG1ldGFkYXRhIGZpbGVzIGNhcHR1cmUgcmVleHBvcnRzXG4gICAgICAgIC8vIChzdGFydGluZyB3aXRoIHYzKS5cbiAgICAgICAgbWV0YWRhdGFzID0gW3VwZ3JhZGVNZXRhZGF0YVdpdGhEdHNEYXRhKFxuICAgICAgICAgICAgaG9zdCwgeydfX3N5bWJvbGljJzogJ21vZHVsZScsICd2ZXJzaW9uJzogMSwgJ21ldGFkYXRhJzoge319LCBmaWxlUGF0aCldO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBtZXRhZGF0YSA9IGhvc3QuZ2V0U291cmNlRmlsZU1ldGFkYXRhKGZpbGVQYXRoKTtcbiAgICAgIG1ldGFkYXRhcyA9IG1ldGFkYXRhID8gW21ldGFkYXRhXSA6IFtdO1xuICAgIH1cbiAgfVxuICBpZiAoY2FjaGUgJiYgKCFob3N0LmNhY2hlTWV0YWRhdGEgfHwgaG9zdC5jYWNoZU1ldGFkYXRhKGZpbGVQYXRoKSkpIHtcbiAgICBjYWNoZS5kYXRhLnNldChmaWxlUGF0aCwgbWV0YWRhdGFzKTtcbiAgfVxuICByZXR1cm4gbWV0YWRhdGFzO1xufVxuXG5cbmZ1bmN0aW9uIHJlYWRNZXRhZGF0YUZpbGUoaG9zdDogTWV0YWRhdGFSZWFkZXJIb3N0LCBkdHNGaWxlUGF0aDogc3RyaW5nKTogTW9kdWxlTWV0YWRhdGFbXXxcbiAgICB1bmRlZmluZWQge1xuICBjb25zdCBtZXRhZGF0YVBhdGggPSBkdHNGaWxlUGF0aC5yZXBsYWNlKERUUywgJy5tZXRhZGF0YS5qc29uJyk7XG4gIGlmICghaG9zdC5maWxlRXhpc3RzKG1ldGFkYXRhUGF0aCkpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHRyeSB7XG4gICAgY29uc3QgbWV0YWRhdGFPck1ldGFkYXRhcyA9IEpTT04ucGFyc2UoaG9zdC5yZWFkRmlsZShtZXRhZGF0YVBhdGgpKTtcbiAgICBjb25zdCBtZXRhZGF0YXM6IE1vZHVsZU1ldGFkYXRhW10gPSBtZXRhZGF0YU9yTWV0YWRhdGFzID9cbiAgICAgICAgKEFycmF5LmlzQXJyYXkobWV0YWRhdGFPck1ldGFkYXRhcykgPyBtZXRhZGF0YU9yTWV0YWRhdGFzIDogW21ldGFkYXRhT3JNZXRhZGF0YXNdKSA6XG4gICAgICAgIFtdO1xuICAgIGlmIChtZXRhZGF0YXMubGVuZ3RoKSB7XG4gICAgICBsZXQgbWF4TWV0YWRhdGEgPSBtZXRhZGF0YXMucmVkdWNlKChwLCBjKSA9PiBwLnZlcnNpb24gPiBjLnZlcnNpb24gPyBwIDogYyk7XG4gICAgICBpZiAobWF4TWV0YWRhdGEudmVyc2lvbiA8IE1FVEFEQVRBX1ZFUlNJT04pIHtcbiAgICAgICAgbWV0YWRhdGFzLnB1c2godXBncmFkZU1ldGFkYXRhV2l0aER0c0RhdGEoaG9zdCwgbWF4TWV0YWRhdGEsIGR0c0ZpbGVQYXRoKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZXRhZGF0YXM7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gcmVhZCBKU09OIGZpbGUgJHttZXRhZGF0YVBhdGh9YCk7XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG5mdW5jdGlvbiB1cGdyYWRlTWV0YWRhdGFXaXRoRHRzRGF0YShcbiAgICBob3N0OiBNZXRhZGF0YVJlYWRlckhvc3QsIG9sZE1ldGFkYXRhOiBNb2R1bGVNZXRhZGF0YSwgZHRzRmlsZVBhdGg6IHN0cmluZyk6IE1vZHVsZU1ldGFkYXRhIHtcbiAgLy8gcGF0Y2ggdjEgdG8gdjMgYnkgYWRkaW5nIGV4cG9ydHMgYW5kIHRoZSBgZXh0ZW5kc2AgY2xhdXNlLlxuICAvLyBwYXRjaCB2MyB0byB2NCBieSBhZGRpbmcgYGludGVyZmFjZWAgc3ltYm9scyBmb3IgVHlwZUFsaWFzXG4gIGxldCBuZXdNZXRhZGF0YTogTW9kdWxlTWV0YWRhdGEgPSB7XG4gICAgJ19fc3ltYm9saWMnOiAnbW9kdWxlJyxcbiAgICAndmVyc2lvbic6IE1FVEFEQVRBX1ZFUlNJT04sXG4gICAgJ21ldGFkYXRhJzogey4uLm9sZE1ldGFkYXRhLm1ldGFkYXRhfSxcbiAgfTtcbiAgaWYgKG9sZE1ldGFkYXRhLmV4cG9ydHMpIHtcbiAgICBuZXdNZXRhZGF0YS5leHBvcnRzID0gb2xkTWV0YWRhdGEuZXhwb3J0cztcbiAgfVxuICBpZiAob2xkTWV0YWRhdGEuaW1wb3J0QXMpIHtcbiAgICBuZXdNZXRhZGF0YS5pbXBvcnRBcyA9IG9sZE1ldGFkYXRhLmltcG9ydEFzO1xuICB9XG4gIGlmIChvbGRNZXRhZGF0YS5vcmlnaW5zKSB7XG4gICAgbmV3TWV0YWRhdGEub3JpZ2lucyA9IG9sZE1ldGFkYXRhLm9yaWdpbnM7XG4gIH1cbiAgY29uc3QgZHRzTWV0YWRhdGEgPSBob3N0LmdldFNvdXJjZUZpbGVNZXRhZGF0YShkdHNGaWxlUGF0aCk7XG4gIGlmIChkdHNNZXRhZGF0YSkge1xuICAgIGZvciAobGV0IHByb3AgaW4gZHRzTWV0YWRhdGEubWV0YWRhdGEpIHtcbiAgICAgIGlmICghbmV3TWV0YWRhdGEubWV0YWRhdGFbcHJvcF0pIHtcbiAgICAgICAgbmV3TWV0YWRhdGEubWV0YWRhdGFbcHJvcF0gPSBkdHNNZXRhZGF0YS5tZXRhZGF0YVtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGR0c01ldGFkYXRhWydpbXBvcnRBcyddKSBuZXdNZXRhZGF0YVsnaW1wb3J0QXMnXSA9IGR0c01ldGFkYXRhWydpbXBvcnRBcyddO1xuXG4gICAgLy8gT25seSBjb3B5IGV4cG9ydHMgZnJvbSBleHBvcnRzIGZyb20gbWV0YWRhdGEgcHJpb3IgdG8gdmVyc2lvbiAzLlxuICAgIC8vIFN0YXJ0aW5nIHdpdGggdmVyc2lvbiAzIHRoZSBjb2xsZWN0b3IgYmVnYW4gY29sbGVjdGluZyBleHBvcnRzIGFuZFxuICAgIC8vIHRoaXMgc2hvdWxkIGJlIHJlZHVuZGFudC4gQWxzbywgd2l0aCBidW5kbGVyIHdpbGwgcmV3cml0ZSB0aGUgZXhwb3J0c1xuICAgIC8vIHdoaWNoIHdpbGwgaG9pc3QgdGhlIGV4cG9ydHMgZnJvbSBtb2R1bGVzIHJlZmVyZW5jZWQgaW5kaXJlY3RseSBjYXVzaW5nXG4gICAgLy8gdGhlIGltcG9ydHMgdG8gYmUgZGlmZmVyZW50IHRoYW4gdGhlIC5kLnRzIGZpbGVzIGFuZCB1c2luZyB0aGUgLmQudHMgZmlsZVxuICAgIC8vIGV4cG9ydHMgd291bGQgY2F1c2UgdGhlIFN0YXRpY1N5bWJvbFJlc29sdmVyIHRvIHJlZGlyZWN0IHN5bWJvbHMgdG8gdGhlXG4gICAgLy8gaW5jb3JyZWN0IGxvY2F0aW9uLlxuICAgIGlmICgoIW9sZE1ldGFkYXRhLnZlcnNpb24gfHwgb2xkTWV0YWRhdGEudmVyc2lvbiA8IDMpICYmIGR0c01ldGFkYXRhLmV4cG9ydHMpIHtcbiAgICAgIG5ld01ldGFkYXRhLmV4cG9ydHMgPSBkdHNNZXRhZGF0YS5leHBvcnRzO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbmV3TWV0YWRhdGE7XG59XG4iXX0=