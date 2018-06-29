(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/metadata/bundler", ["require", "exports", "tslib", "path", "typescript", "@angular/compiler-cli/src/metadata/collector", "@angular/compiler-cli/src/metadata/schema"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var path = require("path");
    var ts = require("typescript");
    var collector_1 = require("@angular/compiler-cli/src/metadata/collector");
    var schema_1 = require("@angular/compiler-cli/src/metadata/schema");
    // The character set used to produce private names.
    var PRIVATE_NAME_CHARS = 'abcdefghijklmnopqrstuvwxyz';
    var MetadataBundler = /** @class */ (function () {
        function MetadataBundler(root, importAs, host, privateSymbolPrefix) {
            this.root = root;
            this.importAs = importAs;
            this.host = host;
            this.symbolMap = new Map();
            this.metadataCache = new Map();
            this.exports = new Map();
            this.rootModule = "./" + path.basename(root);
            this.privateSymbolPrefix = (privateSymbolPrefix || '').replace(/\W/g, '_');
        }
        MetadataBundler.prototype.getMetadataBundle = function () {
            // Export the root module. This also collects the transitive closure of all values referenced by
            // the exports.
            var exportedSymbols = this.exportAll(this.rootModule);
            this.canonicalizeSymbols(exportedSymbols);
            // TODO: exports? e.g. a module re-exports a symbol from another bundle
            var metadata = this.getEntries(exportedSymbols);
            var privates = Array.from(this.symbolMap.values())
                .filter(function (s) { return s.referenced && s.isPrivate; })
                .map(function (s) { return ({
                privateName: s.privateName,
                name: s.declaration.name,
                module: s.declaration.module
            }); });
            var origins = Array.from(this.symbolMap.values())
                .filter(function (s) { return s.referenced && !s.reexport; })
                .reduce(function (p, s) {
                p[s.isPrivate ? s.privateName : s.name] = s.declaration.module;
                return p;
            }, {});
            var exports = this.getReExports(exportedSymbols);
            return {
                metadata: {
                    __symbolic: 'module',
                    version: schema_1.METADATA_VERSION,
                    exports: exports.length ? exports : undefined, metadata: metadata, origins: origins,
                    importAs: this.importAs
                },
                privates: privates
            };
        };
        MetadataBundler.resolveModule = function (importName, from) {
            return resolveModule(importName, from);
        };
        MetadataBundler.prototype.getMetadata = function (moduleName) {
            var result = this.metadataCache.get(moduleName);
            if (!result) {
                if (moduleName.startsWith('.')) {
                    var fullModuleName = resolveModule(moduleName, this.root);
                    result = this.host.getMetadataFor(fullModuleName);
                }
                this.metadataCache.set(moduleName, result);
            }
            return result;
        };
        MetadataBundler.prototype.exportAll = function (moduleName) {
            var _this = this;
            var module = this.getMetadata(moduleName);
            var result = this.exports.get(moduleName);
            if (result) {
                return result;
            }
            result = [];
            var exportSymbol = function (exportedSymbol, exportAs) {
                var symbol = _this.symbolOf(moduleName, exportAs);
                result.push(symbol);
                exportedSymbol.reexportedAs = symbol;
                symbol.exports = exportedSymbol;
            };
            // Export all the symbols defined in this module.
            if (module && module.metadata) {
                for (var key in module.metadata) {
                    var data = module.metadata[key];
                    if (schema_1.isMetadataImportedSymbolReferenceExpression(data)) {
                        // This is a re-export of an imported symbol. Record this as a re-export.
                        var exportFrom = resolveModule(data.module, moduleName);
                        this.exportAll(exportFrom);
                        var symbol = this.symbolOf(exportFrom, data.name);
                        exportSymbol(symbol, key);
                    }
                    else {
                        // Record that this symbol is exported by this module.
                        result.push(this.symbolOf(moduleName, key));
                    }
                }
            }
            // Export all the re-exports from this module
            if (module && module.exports) {
                try {
                    for (var _a = tslib_1.__values(module.exports), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var exportDeclaration = _b.value;
                        var exportFrom = resolveModule(exportDeclaration.from, moduleName);
                        // Record all the exports from the module even if we don't use it directly.
                        var exportedSymbols = this.exportAll(exportFrom);
                        if (exportDeclaration.export) {
                            try {
                                // Re-export all the named exports from a module.
                                for (var _c = tslib_1.__values(exportDeclaration.export), _d = _c.next(); !_d.done; _d = _c.next()) {
                                    var exportItem = _d.value;
                                    var name = typeof exportItem == 'string' ? exportItem : exportItem.name;
                                    var exportAs = typeof exportItem == 'string' ? exportItem : exportItem.as;
                                    var symbol = this.symbolOf(exportFrom, name);
                                    if (exportedSymbols && exportedSymbols.length == 1 && exportedSymbols[0].reexport &&
                                        exportedSymbols[0].name == '*') {
                                        // This is a named export from a module we have no metadata about. Record the named
                                        // export as a re-export.
                                        symbol.reexport = true;
                                    }
                                    exportSymbol(this.symbolOf(exportFrom, name), exportAs);
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (_d && !_d.done && (_e = _c.return)) _e.call(_c);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                        }
                        else {
                            // Re-export all the symbols from the module
                            var exportedSymbols_1 = this.exportAll(exportFrom);
                            try {
                                for (var exportedSymbols_2 = tslib_1.__values(exportedSymbols_1), exportedSymbols_2_1 = exportedSymbols_2.next(); !exportedSymbols_2_1.done; exportedSymbols_2_1 = exportedSymbols_2.next()) {
                                    var exportedSymbol = exportedSymbols_2_1.value;
                                    var name = exportedSymbol.name;
                                    exportSymbol(exportedSymbol, name);
                                }
                            }
                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                            finally {
                                try {
                                    if (exportedSymbols_2_1 && !exportedSymbols_2_1.done && (_f = exportedSymbols_2.return)) _f.call(exportedSymbols_2);
                                }
                                finally { if (e_2) throw e_2.error; }
                            }
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_g = _a.return)) _g.call(_a);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
            if (!module) {
                // If no metadata is found for this import then it is considered external to the
                // library and should be recorded as a re-export in the final metadata if it is
                // eventually re-exported.
                var symbol = this.symbolOf(moduleName, '*');
                symbol.reexport = true;
                result.push(symbol);
            }
            this.exports.set(moduleName, result);
            return result;
            var e_3, _g, e_1, _e, e_2, _f;
        };
        /**
         * Fill in the canonicalSymbol which is the symbol that should be imported by factories.
         * The canonical symbol is the one exported by the index file for the bundle or definition
         * symbol for private symbols that are not exported by bundle index.
         */
        MetadataBundler.prototype.canonicalizeSymbols = function (exportedSymbols) {
            var symbols = Array.from(this.symbolMap.values());
            this.exported = new Set(exportedSymbols);
            symbols.forEach(this.canonicalizeSymbol, this);
        };
        MetadataBundler.prototype.canonicalizeSymbol = function (symbol) {
            var rootExport = getRootExport(symbol);
            var declaration = getSymbolDeclaration(symbol);
            var isPrivate = !this.exported.has(rootExport);
            var canonicalSymbol = isPrivate ? declaration : rootExport;
            symbol.isPrivate = isPrivate;
            symbol.declaration = declaration;
            symbol.canonicalSymbol = canonicalSymbol;
            symbol.reexport = declaration.reexport;
        };
        MetadataBundler.prototype.getEntries = function (exportedSymbols) {
            var _this = this;
            var result = {};
            var exportedNames = new Set(exportedSymbols.map(function (s) { return s.name; }));
            var privateName = 0;
            function newPrivateName(prefix) {
                while (true) {
                    var digits = [];
                    var index = privateName++;
                    var base = PRIVATE_NAME_CHARS;
                    while (!digits.length || index > 0) {
                        digits.unshift(base[index % base.length]);
                        index = Math.floor(index / base.length);
                    }
                    var result_1 = "\u0275" + prefix + digits.join('');
                    if (!exportedNames.has(result_1))
                        return result_1;
                }
            }
            exportedSymbols.forEach(function (symbol) { return _this.convertSymbol(symbol); });
            var symbolsMap = new Map();
            Array.from(this.symbolMap.values()).forEach(function (symbol) {
                if (symbol.referenced && !symbol.reexport) {
                    var name = symbol.name;
                    var identifier = symbol.declaration.module + ":" + symbol.declaration.name;
                    if (symbol.isPrivate && !symbol.privateName) {
                        name = newPrivateName(_this.privateSymbolPrefix);
                        symbol.privateName = name;
                    }
                    if (symbolsMap.has(identifier)) {
                        var names = symbolsMap.get(identifier);
                        names.push(name);
                    }
                    else {
                        symbolsMap.set(identifier, [name]);
                    }
                    result[name] = symbol.value;
                }
            });
            // check for duplicated entries
            symbolsMap.forEach(function (names, identifier) {
                if (names.length > 1) {
                    var _a = tslib_1.__read(identifier.split(':'), 2), module_1 = _a[0], declaredName = _a[1];
                    // prefer the export that uses the declared name (if any)
                    var reference_1 = names.indexOf(declaredName);
                    if (reference_1 === -1) {
                        reference_1 = 0;
                    }
                    // keep one entry and replace the others by references
                    names.forEach(function (name, i) {
                        if (i !== reference_1) {
                            result[name] = { __symbolic: 'reference', name: names[reference_1] };
                        }
                    });
                }
            });
            return result;
        };
        MetadataBundler.prototype.getReExports = function (exportedSymbols) {
            var modules = new Map();
            var exportAlls = new Set();
            try {
                for (var exportedSymbols_3 = tslib_1.__values(exportedSymbols), exportedSymbols_3_1 = exportedSymbols_3.next(); !exportedSymbols_3_1.done; exportedSymbols_3_1 = exportedSymbols_3.next()) {
                    var symbol = exportedSymbols_3_1.value;
                    if (symbol.reexport) {
                        // symbol.declaration is guaranteed to be defined during the phase this method is called.
                        var declaration = symbol.declaration;
                        var module_2 = declaration.module;
                        if (declaration.name == '*') {
                            // Reexport all the symbols.
                            exportAlls.add(declaration.module);
                        }
                        else {
                            // Re-export the symbol as the exported name.
                            var entry = modules.get(module_2);
                            if (!entry) {
                                entry = [];
                                modules.set(module_2, entry);
                            }
                            var as = symbol.name;
                            var name = declaration.name;
                            entry.push({ name: name, as: as });
                        }
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (exportedSymbols_3_1 && !exportedSymbols_3_1.done && (_a = exportedSymbols_3.return)) _a.call(exportedSymbols_3);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return tslib_1.__spread(Array.from(exportAlls.values()).map(function (from) { return ({ from: from }); }), Array.from(modules.entries()).map(function (_a) {
                var _b = tslib_1.__read(_a, 2), from = _b[0], exports = _b[1];
                return ({ export: exports, from: from });
            }));
            var e_4, _a;
        };
        MetadataBundler.prototype.convertSymbol = function (symbol) {
            // canonicalSymbol is ensured to be defined before this is called.
            var canonicalSymbol = symbol.canonicalSymbol;
            if (!canonicalSymbol.referenced) {
                canonicalSymbol.referenced = true;
                // declaration is ensured to be definded before this method is called.
                var declaration = canonicalSymbol.declaration;
                var module_3 = this.getMetadata(declaration.module);
                if (module_3) {
                    var value = module_3.metadata[declaration.name];
                    if (value && !declaration.name.startsWith('___')) {
                        canonicalSymbol.value = this.convertEntry(declaration.module, value);
                    }
                }
            }
        };
        MetadataBundler.prototype.convertEntry = function (moduleName, value) {
            if (schema_1.isClassMetadata(value)) {
                return this.convertClass(moduleName, value);
            }
            if (schema_1.isFunctionMetadata(value)) {
                return this.convertFunction(moduleName, value);
            }
            if (schema_1.isInterfaceMetadata(value)) {
                return value;
            }
            return this.convertValue(moduleName, value);
        };
        MetadataBundler.prototype.convertClass = function (moduleName, value) {
            var _this = this;
            return {
                __symbolic: 'class',
                arity: value.arity,
                extends: this.convertExpression(moduleName, value.extends),
                decorators: value.decorators && value.decorators.map(function (d) { return _this.convertExpression(moduleName, d); }),
                members: this.convertMembers(moduleName, value.members),
                statics: value.statics && this.convertStatics(moduleName, value.statics)
            };
        };
        MetadataBundler.prototype.convertMembers = function (moduleName, members) {
            var _this = this;
            var result = {};
            for (var name in members) {
                var value = members[name];
                result[name] = value.map(function (v) { return _this.convertMember(moduleName, v); });
            }
            return result;
        };
        MetadataBundler.prototype.convertMember = function (moduleName, member) {
            var _this = this;
            var result = { __symbolic: member.__symbolic };
            result.decorators =
                member.decorators && member.decorators.map(function (d) { return _this.convertExpression(moduleName, d); });
            if (schema_1.isMethodMetadata(member)) {
                result.parameterDecorators = member.parameterDecorators &&
                    member.parameterDecorators.map(function (d) { return d && d.map(function (p) { return _this.convertExpression(moduleName, p); }); });
                if (schema_1.isConstructorMetadata(member)) {
                    if (member.parameters) {
                        result.parameters =
                            member.parameters.map(function (p) { return _this.convertExpression(moduleName, p); });
                    }
                }
            }
            return result;
        };
        MetadataBundler.prototype.convertStatics = function (moduleName, statics) {
            var result = {};
            for (var key in statics) {
                var value = statics[key];
                result[key] = schema_1.isFunctionMetadata(value) ? this.convertFunction(moduleName, value) : value;
            }
            return result;
        };
        MetadataBundler.prototype.convertFunction = function (moduleName, value) {
            var _this = this;
            return {
                __symbolic: 'function',
                parameters: value.parameters,
                defaults: value.defaults && value.defaults.map(function (v) { return _this.convertValue(moduleName, v); }),
                value: this.convertValue(moduleName, value.value)
            };
        };
        MetadataBundler.prototype.convertValue = function (moduleName, value) {
            var _this = this;
            if (isPrimitive(value)) {
                return value;
            }
            if (schema_1.isMetadataError(value)) {
                return this.convertError(moduleName, value);
            }
            if (schema_1.isMetadataSymbolicExpression(value)) {
                return this.convertExpression(moduleName, value);
            }
            if (Array.isArray(value)) {
                return value.map(function (v) { return _this.convertValue(moduleName, v); });
            }
            // Otherwise it is a metadata object.
            var object = value;
            var result = {};
            for (var key in object) {
                result[key] = this.convertValue(moduleName, object[key]);
            }
            return result;
        };
        MetadataBundler.prototype.convertExpression = function (moduleName, value) {
            if (value) {
                switch (value.__symbolic) {
                    case 'error':
                        return this.convertError(moduleName, value);
                    case 'reference':
                        return this.convertReference(moduleName, value);
                    default:
                        return this.convertExpressionNode(moduleName, value);
                }
            }
            return value;
        };
        MetadataBundler.prototype.convertError = function (module, value) {
            return {
                __symbolic: 'error',
                message: value.message,
                line: value.line,
                character: value.character,
                context: value.context, module: module
            };
        };
        MetadataBundler.prototype.convertReference = function (moduleName, value) {
            var _this = this;
            var createReference = function (symbol) {
                var declaration = symbol.declaration;
                if (declaration.module.startsWith('.')) {
                    // Reference to a symbol defined in the module. Ensure it is converted then return a
                    // references to the final symbol.
                    _this.convertSymbol(symbol);
                    return {
                        __symbolic: 'reference',
                        get name() {
                            // Resolved lazily because private names are assigned late.
                            var canonicalSymbol = symbol.canonicalSymbol;
                            if (canonicalSymbol.isPrivate == null) {
                                throw Error('Invalid state: isPrivate was not initialized');
                            }
                            return canonicalSymbol.isPrivate ? canonicalSymbol.privateName : canonicalSymbol.name;
                        }
                    };
                }
                else {
                    // The symbol was a re-exported symbol from another module. Return a reference to the
                    // original imported symbol.
                    return { __symbolic: 'reference', name: declaration.name, module: declaration.module };
                }
            };
            if (schema_1.isMetadataGlobalReferenceExpression(value)) {
                var metadata = this.getMetadata(moduleName);
                if (metadata && metadata.metadata && metadata.metadata[value.name]) {
                    // Reference to a symbol defined in the module
                    return createReference(this.canonicalSymbolOf(moduleName, value.name));
                }
                // If a reference has arguments, the arguments need to be converted.
                if (value.arguments) {
                    return {
                        __symbolic: 'reference',
                        name: value.name,
                        arguments: value.arguments.map(function (a) { return _this.convertValue(moduleName, a); })
                    };
                }
                // Global references without arguments (such as to Math or JSON) are unmodified.
                return value;
            }
            if (schema_1.isMetadataImportedSymbolReferenceExpression(value)) {
                // References to imported symbols are separated into two, references to bundled modules and
                // references to modules external to the bundle. If the module reference is relative it is
                // assumed to be in the bundle. If it is Global it is assumed to be outside the bundle.
                // References to symbols outside the bundle are left unmodified. References to symbol inside
                // the bundle need to be converted to a bundle import reference reachable from the bundle
                // index.
                if (value.module.startsWith('.')) {
                    // Reference is to a symbol defined inside the module. Convert the reference to a reference
                    // to the canonical symbol.
                    var referencedModule = resolveModule(value.module, moduleName);
                    var referencedName = value.name;
                    return createReference(this.canonicalSymbolOf(referencedModule, referencedName));
                }
                // Value is a reference to a symbol defined outside the module.
                if (value.arguments) {
                    // If a reference has arguments the arguments need to be converted.
                    return {
                        __symbolic: 'reference',
                        name: value.name,
                        module: value.module,
                        arguments: value.arguments.map(function (a) { return _this.convertValue(moduleName, a); })
                    };
                }
                return value;
            }
            if (schema_1.isMetadataModuleReferenceExpression(value)) {
                // Cannot support references to bundled modules as the internal modules of a bundle are erased
                // by the bundler.
                if (value.module.startsWith('.')) {
                    return {
                        __symbolic: 'error',
                        message: 'Unsupported bundled module reference',
                        context: { module: value.module }
                    };
                }
                // References to unbundled modules are unmodified.
                return value;
            }
        };
        MetadataBundler.prototype.convertExpressionNode = function (moduleName, value) {
            var result = { __symbolic: value.__symbolic };
            for (var key in value) {
                result[key] = this.convertValue(moduleName, value[key]);
            }
            return result;
        };
        MetadataBundler.prototype.symbolOf = function (module, name) {
            var symbolKey = module + ":" + name;
            var symbol = this.symbolMap.get(symbolKey);
            if (!symbol) {
                symbol = { module: module, name: name };
                this.symbolMap.set(symbolKey, symbol);
            }
            return symbol;
        };
        MetadataBundler.prototype.canonicalSymbolOf = function (module, name) {
            // Ensure the module has been seen.
            this.exportAll(module);
            var symbol = this.symbolOf(module, name);
            if (!symbol.canonicalSymbol) {
                this.canonicalizeSymbol(symbol);
            }
            return symbol;
        };
        return MetadataBundler;
    }());
    exports.MetadataBundler = MetadataBundler;
    var CompilerHostAdapter = /** @class */ (function () {
        function CompilerHostAdapter(host, cache) {
            this.host = host;
            this.cache = cache;
            this.collector = new collector_1.MetadataCollector();
        }
        CompilerHostAdapter.prototype.getMetadataFor = function (fileName) {
            if (!this.host.fileExists(fileName + '.ts'))
                return undefined;
            var sourceFile = this.host.getSourceFile(fileName + '.ts', ts.ScriptTarget.Latest);
            // If there is a metadata cache, use it to get the metadata for this source file. Otherwise,
            // fall back on the locally created MetadataCollector.
            if (!sourceFile) {
                return undefined;
            }
            else if (this.cache) {
                return this.cache.getMetadata(sourceFile);
            }
            else {
                return this.collector.getMetadata(sourceFile);
            }
        };
        return CompilerHostAdapter;
    }());
    exports.CompilerHostAdapter = CompilerHostAdapter;
    function resolveModule(importName, from) {
        if (importName.startsWith('.') && from) {
            var normalPath = path.normalize(path.join(path.dirname(from), importName));
            if (!normalPath.startsWith('.') && from.startsWith('.')) {
                // path.normalize() preserves leading '../' but not './'. This adds it back.
                normalPath = "." + path.sep + normalPath;
            }
            // Replace windows path delimiters with forward-slashes. Otherwise the paths are not
            // TypeScript compatible when building the bundle.
            return normalPath.replace(/\\/g, '/');
        }
        return importName;
    }
    function isPrimitive(o) {
        return o === null || (typeof o !== 'function' && typeof o !== 'object');
    }
    function getRootExport(symbol) {
        return symbol.reexportedAs ? getRootExport(symbol.reexportedAs) : symbol;
    }
    function getSymbolDeclaration(symbol) {
        return symbol.exports ? getSymbolDeclaration(symbol.exports) : symbol;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbWV0YWRhdGEvYnVuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyQkFBNkI7SUFDN0IsK0JBQWlDO0lBRWpDLDBFQUF3RDtJQUN4RCxvRUFBK21CO0lBSy9tQixtREFBbUQ7SUFDbkQsSUFBTSxrQkFBa0IsR0FBRyw0QkFBNEIsQ0FBQztJQWdFeEQ7UUFRRSx5QkFDWSxJQUFZLEVBQVUsUUFBMEIsRUFBVSxJQUF5QixFQUMzRixtQkFBNEI7WUFEcEIsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUFVLGFBQVEsR0FBUixRQUFRLENBQWtCO1lBQVUsU0FBSSxHQUFKLElBQUksQ0FBcUI7WUFSdkYsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBQ3RDLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7WUFDNUQsWUFBTyxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1lBUTVDLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBRyxDQUFDO1lBQzdDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLG1CQUFtQixJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVELDJDQUFpQixHQUFqQjtZQUNFLGdHQUFnRztZQUNoRyxlQUFlO1lBQ2YsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzFDLHVFQUF1RTtZQUN2RSxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxD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QyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssVUFBVSxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRCx1QkFBdUIsTUFBYztRQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQzNFLENBQUM7SUFFRCw4QkFBOEIsTUFBYztRQUMxQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDeEUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtNZXRhZGF0YUNvbGxlY3Rvcn0gZnJvbSAnLi4vbWV0YWRhdGEvY29sbGVjdG9yJztcbmltcG9ydCB7Q2xhc3NNZXRhZGF0YSwgQ29uc3RydWN0b3JNZXRhZGF0YSwgRnVuY3Rpb25NZXRhZGF0YSwgTUVUQURBVEFfVkVSU0lPTiwgTWVtYmVyTWV0YWRhdGEsIE1ldGFkYXRhRW50cnksIE1ldGFkYXRhRXJyb3IsIE1ldGFkYXRhSW1wb3J0ZWRTeW1ib2xSZWZlcmVuY2VFeHByZXNzaW9uLCBNZXRhZGF0YU1hcCwgTWV0YWRhdGFPYmplY3QsIE1ldGFkYXRhU3ltYm9saWNFeHByZXNzaW9uLCBNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbiwgTWV0YWRhdGFWYWx1ZSwgTWV0aG9kTWV0YWRhdGEsIE1vZHVsZUV4cG9ydE1ldGFkYXRhLCBNb2R1bGVNZXRhZGF0YSwgaXNDbGFzc01ldGFkYXRhLCBpc0NvbnN0cnVjdG9yTWV0YWRhdGEsIGlzRnVuY3Rpb25NZXRhZGF0YSwgaXNJbnRlcmZhY2VNZXRhZGF0YSwgaXNNZXRhZGF0YUVycm9yLCBpc01ldGFkYXRhR2xvYmFsUmVmZXJlbmNlRXhwcmVzc2lvbiwgaXNNZXRhZGF0YUltcG9ydGVkU3ltYm9sUmVmZXJlbmNlRXhwcmVzc2lvbiwgaXNNZXRhZGF0YU1vZHVsZVJlZmVyZW5jZUV4cHJlc3Npb24sIGlzTWV0YWRhdGFTeW1ib2xpY0V4cHJlc3Npb24sIGlzTWV0aG9kTWV0YWRhdGF9IGZyb20gJy4uL21ldGFkYXRhL3NjaGVtYSc7XG5pbXBvcnQge01ldGFkYXRhQ2FjaGV9IGZyb20gJy4uL3RyYW5zZm9ybWVycy9tZXRhZGF0YV9jYWNoZSc7XG5cblxuXG4vLyBUaGUgY2hhcmFjdGVyIHNldCB1c2VkIHRvIHByb2R1Y2UgcHJpdmF0ZSBuYW1lcy5cbmNvbnN0IFBSSVZBVEVfTkFNRV9DSEFSUyA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eic7XG5cbmludGVyZmFjZSBTeW1ib2wge1xuICBtb2R1bGU6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuXG4gIC8vIFByb2R1Y2VkIGJ5IGluZGlyZWN0bHkgYnkgZXhwb3J0QWxsKCkgZm9yIHN5bWJvbHMgcmUtZXhwb3J0IGFub3RoZXIgc3ltYm9sLlxuICBleHBvcnRzPzogU3ltYm9sO1xuXG4gIC8vIFByb2R1Y2VkIGJ5IGluZGlyZWN0bHkgYnkgZXhwb3J0QWxsKCkgZm9yIHN5bWJvbHMgYXJlIHJlLWV4cG9ydGVkIGJ5IGFub3RoZXIgc3ltYm9sLlxuICByZWV4cG9ydGVkQXM/OiBTeW1ib2w7XG5cbiAgLy8gUHJvZHVjZWQgYnkgY2Fub25pY2FsaXplU3ltYm9scygpIGZvciBhbGwgc3ltYm9scy4gQSBzeW1ib2wgaXMgcHJpdmF0ZSBpZiBpdCBpcyBub3RcbiAgLy8gZXhwb3J0ZWQgYnkgdGhlIGluZGV4LlxuICBpc1ByaXZhdGU/OiBib29sZWFuO1xuXG4gIC8vIFByb2R1Y2VkIGJ5IGNhbm9uaWNhbGl6ZVN5bWJvbHMoKSBmb3IgYWxsIHN5bWJvbHMuIFRoaXMgaXMgdGhlIG9uZSBzeW1ib2wgdGhhdFxuICAvLyByZXNwcmVzZW50cyBhbGwgb3RoZXIgc3ltYm9scyBhbmQgaXMgdGhlIG9ubHkgc3ltYm9sIHRoYXQsIGFtb25nIGFsbCB0aGUgcmUtZXhwb3J0ZWRcbiAgLy8gYWxpYXNlcywgd2hvc2UgZmllbGRzIGNhbiBiZSB0cnVzdGVkIHRvIGNvbnRhaW4gdGhlIGNvcnJlY3QgaW5mb3JtYXRpb24uXG4gIC8vIEZvciBwcml2YXRlIHN5bWJvbHMgdGhpcyBpcyB0aGUgZGVjbGFyYXRpb24gc3ltYm9sLiBGb3IgcHVibGljIHN5bWJvbHMgdGhpcyBpcyB0aGVcbiAgLy8gc3ltYm9sIHRoYXQgaXMgZXhwb3J0ZWQuXG4gIGNhbm9uaWNhbFN5bWJvbD86IFN5bWJvbDtcblxuICAvLyBQcm9kdWNlZCBieSBjYW5vbmljYWxpemVTeW1ib2xzKCkgZm9yIGFsbCBzeW1ib2xzLiBUaGlzIHRoZSBzeW1ib2wgdGhhdCBvcmlnaW5hbGx5XG4gIC8vIGRlY2xhcmVkIHRoZSB2YWx1ZSBhbmQgc2hvdWxkIGJlIHVzZWQgdG8gZmV0Y2ggdGhlIHZhbHVlLlxuICBkZWNsYXJhdGlvbj86IFN5bWJvbDtcblxuICAvLyBBIHN5bWJvbCBpcyByZWZlcmVuY2VkIGlmIGl0IGlzIGV4cG9ydGVkIGZyb20gaW5kZXggb3IgcmVmZXJlbmNlZCBieSB0aGUgdmFsdWUgb2ZcbiAgLy8gYSByZWZlcmVuY2VkIHN5bWJvbCdzIHZhbHVlLlxuICByZWZlcmVuY2VkPzogYm9vbGVhbjtcblxuICAvLyBBIHN5bWJvbCBpcyBtYXJrZWQgYXMgYSByZS1leHBvcnQgdGhlIHN5bWJvbCB3YXMgcmV4cG9ydGVkIGZyb20gYSBtb2R1bGUgdGhhdCBpc1xuICAvLyBub3QgcGFydCBvZiB0aGUgZmxhdCBtb2R1bGUgYnVuZGxlLlxuICByZWV4cG9ydD86IGJvb2xlYW47XG5cbiAgLy8gT25seSB2YWxpZCBmb3IgcmVmZXJlbmNlZCBjYW5vbmljYWwgc3ltYm9scy4gUHJvZHVjZXMgYnkgY29udmVydFN5bWJvbHMoKS5cbiAgdmFsdWU/OiBNZXRhZGF0YUVudHJ5O1xuXG4gIC8vIE9ubHkgdmFsaWQgZm9yIHJlZmVyZW5jZWQgcHJpdmF0ZSBzeW1ib2xzLiBJdCBpcyB0aGUgbmFtZSB0byB1c2UgdG8gaW1wb3J0IHRoZSBzeW1ib2wgZnJvbVxuICAvLyB0aGUgYnVuZGxlIGluZGV4LiBQcm9kdWNlIGJ5IGFzc2lnblByaXZhdGVOYW1lcygpO1xuICBwcml2YXRlTmFtZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCdW5kbGVFbnRyaWVzIHsgW25hbWU6IHN0cmluZ106IE1ldGFkYXRhRW50cnk7IH1cblxuZXhwb3J0IGludGVyZmFjZSBCdW5kbGVQcml2YXRlRW50cnkge1xuICBwcml2YXRlTmFtZTogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIG1vZHVsZTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1bmRsZWRNb2R1bGUge1xuICBtZXRhZGF0YTogTW9kdWxlTWV0YWRhdGE7XG4gIHByaXZhdGVzOiBCdW5kbGVQcml2YXRlRW50cnlbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZXRhZGF0YUJ1bmRsZXJIb3N0IHtcbiAgZ2V0TWV0YWRhdGFGb3IobW9kdWxlTmFtZTogc3RyaW5nKTogTW9kdWxlTWV0YWRhdGF8dW5kZWZpbmVkO1xufVxuXG50eXBlIFN0YXRpY3NNZXRhZGF0YSA9IHtcbiAgW25hbWU6IHN0cmluZ106IE1ldGFkYXRhVmFsdWUgfCBGdW5jdGlvbk1ldGFkYXRhO1xufTtcblxuZXhwb3J0IGNsYXNzIE1ldGFkYXRhQnVuZGxlciB7XG4gIHByaXZhdGUgc3ltYm9sTWFwID0gbmV3IE1hcDxzdHJpbmcsIFN5bWJvbD4oKTtcbiAgcHJpdmF0ZSBtZXRhZGF0YUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIE1vZHVsZU1ldGFkYXRhfHVuZGVmaW5lZD4oKTtcbiAgcHJpdmF0ZSBleHBvcnRzID0gbmV3IE1hcDxzdHJpbmcsIFN5bWJvbFtdPigpO1xuICBwcml2YXRlIHJvb3RNb2R1bGU6IHN0cmluZztcbiAgcHJpdmF0ZSBwcml2YXRlU3ltYm9sUHJlZml4OiBzdHJpbmc7XG4gIHByaXZhdGUgZXhwb3J0ZWQ6IFNldDxTeW1ib2w+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByb290OiBzdHJpbmcsIHByaXZhdGUgaW1wb3J0QXM6IHN0cmluZ3x1bmRlZmluZWQsIHByaXZhdGUgaG9zdDogTWV0YWRhdGFCdW5kbGVySG9zdCxcbiAgICAgIHByaXZhdGVTeW1ib2xQcmVmaXg/OiBzdHJpbmcpIHtcbiAgICB0aGlzLnJvb3RNb2R1bGUgPSBgLi8ke3BhdGguYmFzZW5hbWUocm9vdCl9YDtcbiAgICB0aGlzLnByaXZhdGVTeW1ib2xQcmVmaXggPSAocHJpdmF0ZVN5bWJvbFByZWZpeCB8fCAnJykucmVwbGFjZSgvXFxXL2csICdfJyk7XG4gIH1cblxuICBnZXRNZXRhZGF0YUJ1bmRsZSgpOiBCdW5kbGVkTW9kdWxlIHtcbiAgICAvLyBFeHBvcnQgdGhlIHJvb3QgbW9kdWxlLiBUaGlzIGFsc28gY29sbGVjdHMgdGhlIHRyYW5zaXRpdmUgY2xvc3VyZSBvZiBhbGwgdmFsdWVzIHJlZmVyZW5jZWQgYnlcbiAgICAvLyB0aGUgZXhwb3J0cy5cbiAgICBjb25zdCBleHBvcnRlZFN5bWJvbHMgPSB0aGlzLmV4cG9ydEFsbCh0aGlzLnJvb3RNb2R1bGUpO1xuICAgIHRoaXMuY2Fub25pY2FsaXplU3ltYm9scyhleHBvcnRlZFN5bWJvbHMpO1xuICAgIC8vIFRPRE86IGV4cG9ydHM/IGUuZy4gYSBtb2R1bGUgcmUtZXhwb3J0cyBhIHN5bWJvbCBmcm9tIGFub3RoZXIgYnVuZGxlXG4gICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLmdldEVudHJpZXMoZXhwb3J0ZWRTeW1ib2xzKTtcbiAgICBjb25zdCBwcml2YXRlcyA9IEFycmF5LmZyb20odGhpcy5zeW1ib2xNYXAudmFsdWVzKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihzID0+IHMucmVmZXJlbmNlZCAmJiBzLmlzUHJpdmF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKHMgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpdmF0ZU5hbWU6IHMucHJpdmF0ZU5hbWUgISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcy5kZWNsYXJhdGlvbiAhLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZTogcy5kZWNsYXJhdGlvbiAhLm1vZHVsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgIGNvbnN0IG9yaWdpbnMgPSBBcnJheS5mcm9tKHRoaXMuc3ltYm9sTWFwLnZhbHVlcygpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihzID0+IHMucmVmZXJlbmNlZCAmJiAhcy5yZWV4cG9ydClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZWR1Y2U8e1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9PigocCwgcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBwW3MuaXNQcml2YXRlID8gcy5wcml2YXRlTmFtZSAhIDogcy5uYW1lXSA9IHMuZGVjbGFyYXRpb24gIS5tb2R1bGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge30pO1xuICAgIGNvbnN0IGV4cG9ydHMgPSB0aGlzLmdldFJlRXhwb3J0cyhleHBvcnRlZFN5bWJvbHMpO1xuICAgIHJldHVybiB7XG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBfX3N5bWJvbGljOiAnbW9kdWxlJyxcbiAgICAgICAgdmVyc2lvbjogTUVUQURBVEFfVkVSU0lPTixcbiAgICAgICAgZXhwb3J0czogZXhwb3J0cy5sZW5ndGggPyBleHBvcnRzIDogdW5kZWZpbmVkLCBtZXRhZGF0YSwgb3JpZ2lucyxcbiAgICAgICAgaW1wb3J0QXM6IHRoaXMuaW1wb3J0QXMgIVxuICAgICAgfSxcbiAgICAgIHByaXZhdGVzXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyByZXNvbHZlTW9kdWxlKGltcG9ydE5hbWU6IHN0cmluZywgZnJvbTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcmVzb2x2ZU1vZHVsZShpbXBvcnROYW1lLCBmcm9tKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TWV0YWRhdGEobW9kdWxlTmFtZTogc3RyaW5nKTogTW9kdWxlTWV0YWRhdGF8dW5kZWZpbmVkIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5tZXRhZGF0YUNhY2hlLmdldChtb2R1bGVOYW1lKTtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgaWYgKG1vZHVsZU5hbWUuc3RhcnRzV2l0aCgnLicpKSB7XG4gICAgICAgIGNvbnN0IGZ1bGxNb2R1bGVOYW1lID0gcmVzb2x2ZU1vZHVsZShtb2R1bGVOYW1lLCB0aGlzLnJvb3QpO1xuICAgICAgICByZXN1bHQgPSB0aGlzLmhvc3QuZ2V0TWV0YWRhdGFGb3IoZnVsbE1vZHVsZU5hbWUpO1xuICAgICAgfVxuICAgICAgdGhpcy5tZXRhZGF0YUNhY2hlLnNldChtb2R1bGVOYW1lLCByZXN1bHQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBleHBvcnRBbGwobW9kdWxlTmFtZTogc3RyaW5nKTogU3ltYm9sW10ge1xuICAgIGNvbnN0IG1vZHVsZSA9IHRoaXMuZ2V0TWV0YWRhdGEobW9kdWxlTmFtZSk7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuZXhwb3J0cy5nZXQobW9kdWxlTmFtZSk7XG5cbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgY29uc3QgZXhwb3J0U3ltYm9sID0gKGV4cG9ydGVkU3ltYm9sOiBTeW1ib2wsIGV4cG9ydEFzOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuc3ltYm9sT2YobW9kdWxlTmFtZSwgZXhwb3J0QXMpO1xuICAgICAgcmVzdWx0ICEucHVzaChzeW1ib2wpO1xuICAgICAgZXhwb3J0ZWRTeW1ib2wucmVleHBvcnRlZEFzID0gc3ltYm9sO1xuICAgICAgc3ltYm9sLmV4cG9ydHMgPSBleHBvcnRlZFN5bWJvbDtcbiAgICB9O1xuXG4gICAgLy8gRXhwb3J0IGFsbCB0aGUgc3ltYm9scyBkZWZpbmVkIGluIHRoaXMgbW9kdWxlLlxuICAgIGlmIChtb2R1bGUgJiYgbW9kdWxlLm1ldGFkYXRhKSB7XG4gICAgICBmb3IgKGxldCBrZXkgaW4gbW9kdWxlLm1ldGFkYXRhKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBtb2R1bGUubWV0YWRhdGFba2V5XTtcbiAgICAgICAgaWYgKGlzTWV0YWRhdGFJbXBvcnRlZFN5bWJvbFJlZmVyZW5jZUV4cHJlc3Npb24oZGF0YSkpIHtcbiAgICAgICAgICAvLyBUaGlzIGlzIGEgcmUtZXhwb3J0IG9mIGFuIGltcG9ydGVkIHN5bWJvbC4gUmVjb3JkIHRoaXMgYXMgYSByZS1leHBvcnQuXG4gICAgICAgICAgY29uc3QgZXhwb3J0RnJvbSA9IHJlc29sdmVNb2R1bGUoZGF0YS5tb2R1bGUsIG1vZHVsZU5hbWUpO1xuICAgICAgICAgIHRoaXMuZXhwb3J0QWxsKGV4cG9ydEZyb20pO1xuICAgICAgICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuc3ltYm9sT2YoZXhwb3J0RnJvbSwgZGF0YS5uYW1lKTtcbiAgICAgICAgICBleHBvcnRTeW1ib2woc3ltYm9sLCBrZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFJlY29yZCB0aGF0IHRoaXMgc3ltYm9sIGlzIGV4cG9ydGVkIGJ5IHRoaXMgbW9kdWxlLlxuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuc3ltYm9sT2YobW9kdWxlTmFtZSwga2V5KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFeHBvcnQgYWxsIHRoZSByZS1leHBvcnRzIGZyb20gdGhpcyBtb2R1bGVcbiAgICBpZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBmb3IgKGNvbnN0IGV4cG9ydERlY2xhcmF0aW9uIG9mIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIGNvbnN0IGV4cG9ydEZyb20gPSByZXNvbHZlTW9kdWxlKGV4cG9ydERlY2xhcmF0aW9uLmZyb20sIG1vZHVsZU5hbWUpO1xuICAgICAgICAvLyBSZWNvcmQgYWxsIHRoZSBleHBvcnRzIGZyb20gdGhlIG1vZHVsZSBldmVuIGlmIHdlIGRvbid0IHVzZSBpdCBkaXJlY3RseS5cbiAgICAgICAgY29uc3QgZXhwb3J0ZWRTeW1ib2xzID0gdGhpcy5leHBvcnRBbGwoZXhwb3J0RnJvbSk7XG4gICAgICAgIGlmIChleHBvcnREZWNsYXJhdGlvbi5leHBvcnQpIHtcbiAgICAgICAgICAvLyBSZS1leHBvcnQgYWxsIHRoZSBuYW1lZCBleHBvcnRzIGZyb20gYSBtb2R1bGUuXG4gICAgICAgICAgZm9yIChjb25zdCBleHBvcnRJdGVtIG9mIGV4cG9ydERlY2xhcmF0aW9uLmV4cG9ydCkge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHR5cGVvZiBleHBvcnRJdGVtID09ICdzdHJpbmcnID8gZXhwb3J0SXRlbSA6IGV4cG9ydEl0ZW0ubmFtZTtcbiAgICAgICAgICAgIGNvbnN0IGV4cG9ydEFzID0gdHlwZW9mIGV4cG9ydEl0ZW0gPT0gJ3N0cmluZycgPyBleHBvcnRJdGVtIDogZXhwb3J0SXRlbS5hcztcbiAgICAgICAgICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuc3ltYm9sT2YoZXhwb3J0RnJvbSwgbmFtZSk7XG4gICAgICAgICAgICBpZiAoZXhwb3J0ZWRTeW1ib2xzICYmIGV4cG9ydGVkU3ltYm9scy5sZW5ndGggPT0gMSAmJiBleHBvcnRlZFN5bWJvbHNbMF0ucmVleHBvcnQgJiZcbiAgICAgICAgICAgICAgICBleHBvcnRlZFN5bWJvbHNbMF0ubmFtZSA9PSAnKicpIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIG5hbWVkIGV4cG9ydCBmcm9tIGEgbW9kdWxlIHdlIGhhdmUgbm8gbWV0YWRhdGEgYWJvdXQuIFJlY29yZCB0aGUgbmFtZWRcbiAgICAgICAgICAgICAgLy8gZXhwb3J0IGFzIGEgcmUtZXhwb3J0LlxuICAgICAgICAgICAgICBzeW1ib2wucmVleHBvcnQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXhwb3J0U3ltYm9sKHRoaXMuc3ltYm9sT2YoZXhwb3J0RnJvbSwgbmFtZSksIGV4cG9ydEFzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUmUtZXhwb3J0IGFsbCB0aGUgc3ltYm9scyBmcm9tIHRoZSBtb2R1bGVcbiAgICAgICAgICBjb25zdCBleHBvcnRlZFN5bWJvbHMgPSB0aGlzLmV4cG9ydEFsbChleHBvcnRGcm9tKTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGV4cG9ydGVkU3ltYm9sIG9mIGV4cG9ydGVkU3ltYm9scykge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGV4cG9ydGVkU3ltYm9sLm5hbWU7XG4gICAgICAgICAgICBleHBvcnRTeW1ib2woZXhwb3J0ZWRTeW1ib2wsIG5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghbW9kdWxlKSB7XG4gICAgICAvLyBJZiBubyBtZXRhZGF0YSBpcyBmb3VuZCBmb3IgdGhpcyBpbXBvcnQgdGhlbiBpdCBpcyBjb25zaWRlcmVkIGV4dGVybmFsIHRvIHRoZVxuICAgICAgLy8gbGlicmFyeSBhbmQgc2hvdWxkIGJlIHJlY29yZGVkIGFzIGEgcmUtZXhwb3J0IGluIHRoZSBmaW5hbCBtZXRhZGF0YSBpZiBpdCBpc1xuICAgICAgLy8gZXZlbnR1YWxseSByZS1leHBvcnRlZC5cbiAgICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuc3ltYm9sT2YobW9kdWxlTmFtZSwgJyonKTtcbiAgICAgIHN5bWJvbC5yZWV4cG9ydCA9IHRydWU7XG4gICAgICByZXN1bHQucHVzaChzeW1ib2wpO1xuICAgIH1cbiAgICB0aGlzLmV4cG9ydHMuc2V0KG1vZHVsZU5hbWUsIHJlc3VsdCk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbGwgaW4gdGhlIGNhbm9uaWNhbFN5bWJvbCB3aGljaCBpcyB0aGUgc3ltYm9sIHRoYXQgc2hvdWxkIGJlIGltcG9ydGVkIGJ5IGZhY3Rvcmllcy5cbiAgICogVGhlIGNhbm9uaWNhbCBzeW1ib2wgaXMgdGhlIG9uZSBleHBvcnRlZCBieSB0aGUgaW5kZXggZmlsZSBmb3IgdGhlIGJ1bmRsZSBvciBkZWZpbml0aW9uXG4gICAqIHN5bWJvbCBmb3IgcHJpdmF0ZSBzeW1ib2xzIHRoYXQgYXJlIG5vdCBleHBvcnRlZCBieSBidW5kbGUgaW5kZXguXG4gICAqL1xuICBwcml2YXRlIGNhbm9uaWNhbGl6ZVN5bWJvbHMoZXhwb3J0ZWRTeW1ib2xzOiBTeW1ib2xbXSkge1xuICAgIGNvbnN0IHN5bWJvbHMgPSBBcnJheS5mcm9tKHRoaXMuc3ltYm9sTWFwLnZhbHVlcygpKTtcbiAgICB0aGlzLmV4cG9ydGVkID0gbmV3IFNldChleHBvcnRlZFN5bWJvbHMpO1xuICAgIHN5bWJvbHMuZm9yRWFjaCh0aGlzLmNhbm9uaWNhbGl6ZVN5bWJvbCwgdGhpcyk7XG4gIH1cblxuICBwcml2YXRlIGNhbm9uaWNhbGl6ZVN5bWJvbChzeW1ib2w6IFN5bWJvbCkge1xuICAgIGNvbnN0IHJvb3RFeHBvcnQgPSBnZXRSb290RXhwb3J0KHN5bWJvbCk7XG4gICAgY29uc3QgZGVjbGFyYXRpb24gPSBnZXRTeW1ib2xEZWNsYXJhdGlvbihzeW1ib2wpO1xuICAgIGNvbnN0IGlzUHJpdmF0ZSA9ICF0aGlzLmV4cG9ydGVkLmhhcyhyb290RXhwb3J0KTtcbiAgICBjb25zdCBjYW5vbmljYWxTeW1ib2wgPSBpc1ByaXZhdGUgPyBkZWNsYXJhdGlvbiA6IHJvb3RFeHBvcnQ7XG4gICAgc3ltYm9sLmlzUHJpdmF0ZSA9IGlzUHJpdmF0ZTtcbiAgICBzeW1ib2wuZGVjbGFyYXRpb24gPSBkZWNsYXJhdGlvbjtcbiAgICBzeW1ib2wuY2Fub25pY2FsU3ltYm9sID0gY2Fub25pY2FsU3ltYm9sO1xuICAgIHN5bWJvbC5yZWV4cG9ydCA9IGRlY2xhcmF0aW9uLnJlZXhwb3J0O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRFbnRyaWVzKGV4cG9ydGVkU3ltYm9sczogU3ltYm9sW10pOiBCdW5kbGVFbnRyaWVzIHtcbiAgICBjb25zdCByZXN1bHQ6IEJ1bmRsZUVudHJpZXMgPSB7fTtcblxuICAgIGNvbnN0IGV4cG9ydGVkTmFtZXMgPSBuZXcgU2V0KGV4cG9ydGVkU3ltYm9scy5tYXAocyA9PiBzLm5hbWUpKTtcbiAgICBsZXQgcHJpdmF0ZU5hbWUgPSAwO1xuXG4gICAgZnVuY3Rpb24gbmV3UHJpdmF0ZU5hbWUocHJlZml4OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgbGV0IGRpZ2l0czogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgbGV0IGluZGV4ID0gcHJpdmF0ZU5hbWUrKztcbiAgICAgICAgbGV0IGJhc2UgPSBQUklWQVRFX05BTUVfQ0hBUlM7XG4gICAgICAgIHdoaWxlICghZGlnaXRzLmxlbmd0aCB8fCBpbmRleCA+IDApIHtcbiAgICAgICAgICBkaWdpdHMudW5zaGlmdChiYXNlW2luZGV4ICUgYmFzZS5sZW5ndGhdKTtcbiAgICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IoaW5kZXggLyBiYXNlLmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYFxcdTAyNzUke3ByZWZpeH0ke2RpZ2l0cy5qb2luKCcnKX1gO1xuICAgICAgICBpZiAoIWV4cG9ydGVkTmFtZXMuaGFzKHJlc3VsdCkpIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0ZWRTeW1ib2xzLmZvckVhY2goc3ltYm9sID0+IHRoaXMuY29udmVydFN5bWJvbChzeW1ib2wpKTtcblxuICAgIGNvbnN0IHN5bWJvbHNNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gICAgQXJyYXkuZnJvbSh0aGlzLnN5bWJvbE1hcC52YWx1ZXMoKSkuZm9yRWFjaChzeW1ib2wgPT4ge1xuICAgICAgaWYgKHN5bWJvbC5yZWZlcmVuY2VkICYmICFzeW1ib2wucmVleHBvcnQpIHtcbiAgICAgICAgbGV0IG5hbWUgPSBzeW1ib2wubmFtZTtcbiAgICAgICAgY29uc3QgaWRlbnRpZmllciA9IGAke3N5bWJvbC5kZWNsYXJhdGlvbiEubW9kdWxlfToke3N5bWJvbC5kZWNsYXJhdGlvbiAhLm5hbWV9YDtcbiAgICAgICAgaWYgKHN5bWJvbC5pc1ByaXZhdGUgJiYgIXN5bWJvbC5wcml2YXRlTmFtZSkge1xuICAgICAgICAgIG5hbWUgPSBuZXdQcml2YXRlTmFtZSh0aGlzLnByaXZhdGVTeW1ib2xQcmVmaXgpO1xuICAgICAgICAgIHN5bWJvbC5wcml2YXRlTmFtZSA9IG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN5bWJvbHNNYXAuaGFzKGlkZW50aWZpZXIpKSB7XG4gICAgICAgICAgY29uc3QgbmFtZXMgPSBzeW1ib2xzTWFwLmdldChpZGVudGlmaWVyKTtcbiAgICAgICAgICBuYW1lcyAhLnB1c2gobmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3ltYm9sc01hcC5zZXQoaWRlbnRpZmllciwgW25hbWVdKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbbmFtZV0gPSBzeW1ib2wudmFsdWUgITtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGNoZWNrIGZvciBkdXBsaWNhdGVkIGVudHJpZXNcbiAgICBzeW1ib2xzTWFwLmZvckVhY2goKG5hbWVzOiBzdHJpbmdbXSwgaWRlbnRpZmllcjogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAobmFtZXMubGVuZ3RoID4gMSkge1xuICAgICAgICBjb25zdCBbbW9kdWxlLCBkZWNsYXJlZE5hbWVdID0gaWRlbnRpZmllci5zcGxpdCgnOicpO1xuICAgICAgICAvLyBwcmVmZXIgdGhlIGV4cG9ydCB0aGF0IHVzZXMgdGhlIGRlY2xhcmVkIG5hbWUgKGlmIGFueSlcbiAgICAgICAgbGV0IHJlZmVyZW5jZSA9IG5hbWVzLmluZGV4T2YoZGVjbGFyZWROYW1lKTtcbiAgICAgICAgaWYgKHJlZmVyZW5jZSA9PT0gLTEpIHtcbiAgICAgICAgICByZWZlcmVuY2UgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8ga2VlcCBvbmUgZW50cnkgYW5kIHJlcGxhY2UgdGhlIG90aGVycyBieSByZWZlcmVuY2VzXG4gICAgICAgIG5hbWVzLmZvckVhY2goKG5hbWU6IHN0cmluZywgaTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgaWYgKGkgIT09IHJlZmVyZW5jZSkge1xuICAgICAgICAgICAgcmVzdWx0W25hbWVdID0ge19fc3ltYm9saWM6ICdyZWZlcmVuY2UnLCBuYW1lOiBuYW1lc1tyZWZlcmVuY2VdfTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmVFeHBvcnRzKGV4cG9ydGVkU3ltYm9sczogU3ltYm9sW10pOiBNb2R1bGVFeHBvcnRNZXRhZGF0YVtdIHtcbiAgICB0eXBlIEV4cG9ydENsYXVzZSA9IHtuYW1lOiBzdHJpbmcsIGFzOiBzdHJpbmd9W107XG4gICAgY29uc3QgbW9kdWxlcyA9IG5ldyBNYXA8c3RyaW5nLCBFeHBvcnRDbGF1c2U+KCk7XG4gICAgY29uc3QgZXhwb3J0QWxscyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGZvciAoY29uc3Qgc3ltYm9sIG9mIGV4cG9ydGVkU3ltYm9scykge1xuICAgICAgaWYgKHN5bWJvbC5yZWV4cG9ydCkge1xuICAgICAgICAvLyBzeW1ib2wuZGVjbGFyYXRpb24gaXMgZ3VhcmFudGVlZCB0byBiZSBkZWZpbmVkIGR1cmluZyB0aGUgcGhhc2UgdGhpcyBtZXRob2QgaXMgY2FsbGVkLlxuICAgICAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHN5bWJvbC5kZWNsYXJhdGlvbiAhO1xuICAgICAgICBjb25zdCBtb2R1bGUgPSBkZWNsYXJhdGlvbi5tb2R1bGU7XG4gICAgICAgIGlmIChkZWNsYXJhdGlvbiAhLm5hbWUgPT0gJyonKSB7XG4gICAgICAgICAgLy8gUmVleHBvcnQgYWxsIHRoZSBzeW1ib2xzLlxuICAgICAgICAgIGV4cG9ydEFsbHMuYWRkKGRlY2xhcmF0aW9uLm1vZHVsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUmUtZXhwb3J0IHRoZSBzeW1ib2wgYXMgdGhlIGV4cG9ydGVkIG5hbWUuXG4gICAgICAgICAgbGV0IGVudHJ5ID0gbW9kdWxlcy5nZXQobW9kdWxlKTtcbiAgICAgICAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgICAgICBlbnRyeSA9IFtdO1xuICAgICAgICAgICAgbW9kdWxlcy5zZXQobW9kdWxlLCBlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGFzID0gc3ltYm9sLm5hbWU7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IGRlY2xhcmF0aW9uLm5hbWU7XG4gICAgICAgICAgZW50cnkucHVzaCh7bmFtZSwgYXN9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgLi4uQXJyYXkuZnJvbShleHBvcnRBbGxzLnZhbHVlcygpKS5tYXAoZnJvbSA9PiAoe2Zyb219KSksXG4gICAgICAuLi5BcnJheS5mcm9tKG1vZHVsZXMuZW50cmllcygpKS5tYXAoKFtmcm9tLCBleHBvcnRzXSkgPT4gKHtleHBvcnQ6IGV4cG9ydHMsIGZyb219KSlcbiAgICBdO1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0U3ltYm9sKHN5bWJvbDogU3ltYm9sKSB7XG4gICAgLy8gY2Fub25pY2FsU3ltYm9sIGlzIGVuc3VyZWQgdG8gYmUgZGVmaW5lZCBiZWZvcmUgdGhpcyBpcyBjYWxsZWQuXG4gICAgY29uc3QgY2Fub25pY2FsU3ltYm9sID0gc3ltYm9sLmNhbm9uaWNhbFN5bWJvbCAhO1xuXG4gICAgaWYgKCFjYW5vbmljYWxTeW1ib2wucmVmZXJlbmNlZCkge1xuICAgICAgY2Fub25pY2FsU3ltYm9sLnJlZmVyZW5jZWQgPSB0cnVlO1xuICAgICAgLy8gZGVjbGFyYXRpb24gaXMgZW5zdXJlZCB0byBiZSBkZWZpbmRlZCBiZWZvcmUgdGhpcyBtZXRob2QgaXMgY2FsbGVkLlxuICAgICAgY29uc3QgZGVjbGFyYXRpb24gPSBjYW5vbmljYWxTeW1ib2wuZGVjbGFyYXRpb24gITtcbiAgICAgIGNvbnN0IG1vZHVsZSA9IHRoaXMuZ2V0TWV0YWRhdGEoZGVjbGFyYXRpb24ubW9kdWxlKTtcbiAgICAgIGlmIChtb2R1bGUpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBtb2R1bGUubWV0YWRhdGFbZGVjbGFyYXRpb24ubmFtZV07XG4gICAgICAgIGlmICh2YWx1ZSAmJiAhZGVjbGFyYXRpb24ubmFtZS5zdGFydHNXaXRoKCdfX18nKSkge1xuICAgICAgICAgIGNhbm9uaWNhbFN5bWJvbC52YWx1ZSA9IHRoaXMuY29udmVydEVudHJ5KGRlY2xhcmF0aW9uLm1vZHVsZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0RW50cnkobW9kdWxlTmFtZTogc3RyaW5nLCB2YWx1ZTogTWV0YWRhdGFFbnRyeSk6IE1ldGFkYXRhRW50cnkge1xuICAgIGlmIChpc0NsYXNzTWV0YWRhdGEodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb252ZXJ0Q2xhc3MobW9kdWxlTmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgICBpZiAoaXNGdW5jdGlvbk1ldGFkYXRhKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udmVydEZ1bmN0aW9uKG1vZHVsZU5hbWUsIHZhbHVlKTtcbiAgICB9XG4gICAgaWYgKGlzSW50ZXJmYWNlTWV0YWRhdGEodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvbnZlcnRWYWx1ZShtb2R1bGVOYW1lLCB2YWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRDbGFzcyhtb2R1bGVOYW1lOiBzdHJpbmcsIHZhbHVlOiBDbGFzc01ldGFkYXRhKTogQ2xhc3NNZXRhZGF0YSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIF9fc3ltYm9saWM6ICdjbGFzcycsXG4gICAgICBhcml0eTogdmFsdWUuYXJpdHksXG4gICAgICBleHRlbmRzOiB0aGlzLmNvbnZlcnRFeHByZXNzaW9uKG1vZHVsZU5hbWUsIHZhbHVlLmV4dGVuZHMpICEsXG4gICAgICBkZWNvcmF0b3JzOlxuICAgICAgICAgIHZhbHVlLmRlY29yYXRvcnMgJiYgdmFsdWUuZGVjb3JhdG9ycy5tYXAoZCA9PiB0aGlzLmNvbnZlcnRFeHByZXNzaW9uKG1vZHVsZU5hbWUsIGQpICEpLFxuICAgICAgbWVtYmVyczogdGhpcy5jb252ZXJ0TWVtYmVycyhtb2R1bGVOYW1lLCB2YWx1ZS5tZW1iZXJzICEpLFxuICAgICAgc3RhdGljczogdmFsdWUuc3RhdGljcyAmJiB0aGlzLmNvbnZlcnRTdGF0aWNzKG1vZHVsZU5hbWUsIHZhbHVlLnN0YXRpY3MpXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydE1lbWJlcnMobW9kdWxlTmFtZTogc3RyaW5nLCBtZW1iZXJzOiBNZXRhZGF0YU1hcCk6IE1ldGFkYXRhTWFwIHtcbiAgICBjb25zdCByZXN1bHQ6IE1ldGFkYXRhTWFwID0ge307XG4gICAgZm9yIChjb25zdCBuYW1lIGluIG1lbWJlcnMpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gbWVtYmVyc1tuYW1lXTtcbiAgICAgIHJlc3VsdFtuYW1lXSA9IHZhbHVlLm1hcCh2ID0+IHRoaXMuY29udmVydE1lbWJlcihtb2R1bGVOYW1lLCB2KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRNZW1iZXIobW9kdWxlTmFtZTogc3RyaW5nLCBtZW1iZXI6IE1lbWJlck1ldGFkYXRhKSB7XG4gICAgY29uc3QgcmVzdWx0OiBNZW1iZXJNZXRhZGF0YSA9IHtfX3N5bWJvbGljOiBtZW1iZXIuX19zeW1ib2xpY307XG4gICAgcmVzdWx0LmRlY29yYXRvcnMgPVxuICAgICAgICBtZW1iZXIuZGVjb3JhdG9ycyAmJiBtZW1iZXIuZGVjb3JhdG9ycy5tYXAoZCA9PiB0aGlzLmNvbnZlcnRFeHByZXNzaW9uKG1vZHVsZU5hbWUsIGQpICEpO1xuICAgIGlmIChpc01ldGhvZE1ldGFkYXRhKG1lbWJlcikpIHtcbiAgICAgIChyZXN1bHQgYXMgTWV0aG9kTWV0YWRhdGEpLnBhcmFtZXRlckRlY29yYXRvcnMgPSBtZW1iZXIucGFyYW1ldGVyRGVjb3JhdG9ycyAmJlxuICAgICAgICAgIG1lbWJlci5wYXJhbWV0ZXJEZWNvcmF0b3JzLm1hcChcbiAgICAgICAgICAgICAgZCA9PiBkICYmIGQubWFwKHAgPT4gdGhpcy5jb252ZXJ0RXhwcmVzc2lvbihtb2R1bGVOYW1lLCBwKSAhKSk7XG4gICAgICBpZiAoaXNDb25zdHJ1Y3Rvck1ldGFkYXRhKG1lbWJlcikpIHtcbiAgICAgICAgaWYgKG1lbWJlci5wYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgKHJlc3VsdCBhcyBDb25zdHJ1Y3Rvck1ldGFkYXRhKS5wYXJhbWV0ZXJzID1cbiAgICAgICAgICAgICAgbWVtYmVyLnBhcmFtZXRlcnMubWFwKHAgPT4gdGhpcy5jb252ZXJ0RXhwcmVzc2lvbihtb2R1bGVOYW1lLCBwKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydFN0YXRpY3MobW9kdWxlTmFtZTogc3RyaW5nLCBzdGF0aWNzOiBTdGF0aWNzTWV0YWRhdGEpOiBTdGF0aWNzTWV0YWRhdGEge1xuICAgIGxldCByZXN1bHQ6IFN0YXRpY3NNZXRhZGF0YSA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IGluIHN0YXRpY3MpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gc3RhdGljc1trZXldO1xuICAgICAgcmVzdWx0W2tleV0gPSBpc0Z1bmN0aW9uTWV0YWRhdGEodmFsdWUpID8gdGhpcy5jb252ZXJ0RnVuY3Rpb24obW9kdWxlTmFtZSwgdmFsdWUpIDogdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRGdW5jdGlvbihtb2R1bGVOYW1lOiBzdHJpbmcsIHZhbHVlOiBGdW5jdGlvbk1ldGFkYXRhKTogRnVuY3Rpb25NZXRhZGF0YSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIF9fc3ltYm9saWM6ICdmdW5jdGlvbicsXG4gICAgICBwYXJhbWV0ZXJzOiB2YWx1ZS5wYXJhbWV0ZXJzLFxuICAgICAgZGVmYXVsdHM6IHZhbHVlLmRlZmF1bHRzICYmIHZhbHVlLmRlZmF1bHRzLm1hcCh2ID0+IHRoaXMuY29udmVydFZhbHVlKG1vZHVsZU5hbWUsIHYpKSxcbiAgICAgIHZhbHVlOiB0aGlzLmNvbnZlcnRWYWx1ZShtb2R1bGVOYW1lLCB2YWx1ZS52YWx1ZSlcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0VmFsdWUobW9kdWxlTmFtZTogc3RyaW5nLCB2YWx1ZTogTWV0YWRhdGFWYWx1ZSk6IE1ldGFkYXRhVmFsdWUge1xuICAgIGlmIChpc1ByaW1pdGl2ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKGlzTWV0YWRhdGFFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnZlcnRFcnJvcihtb2R1bGVOYW1lLCB2YWx1ZSk7XG4gICAgfVxuICAgIGlmIChpc01ldGFkYXRhU3ltYm9saWNFeHByZXNzaW9uKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udmVydEV4cHJlc3Npb24obW9kdWxlTmFtZSwgdmFsdWUpICE7XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHZhbHVlLm1hcCh2ID0+IHRoaXMuY29udmVydFZhbHVlKG1vZHVsZU5hbWUsIHYpKTtcbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UgaXQgaXMgYSBtZXRhZGF0YSBvYmplY3QuXG4gICAgY29uc3Qgb2JqZWN0ID0gdmFsdWUgYXMgTWV0YWRhdGFPYmplY3Q7XG4gICAgY29uc3QgcmVzdWx0OiBNZXRhZGF0YU9iamVjdCA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IGluIG9iamVjdCkge1xuICAgICAgcmVzdWx0W2tleV0gPSB0aGlzLmNvbnZlcnRWYWx1ZShtb2R1bGVOYW1lLCBvYmplY3Rba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRFeHByZXNzaW9uKFxuICAgICAgbW9kdWxlTmFtZTogc3RyaW5nLCB2YWx1ZTogTWV0YWRhdGFTeW1ib2xpY0V4cHJlc3Npb258TWV0YWRhdGFFcnJvcnxudWxsfFxuICAgICAgdW5kZWZpbmVkKTogTWV0YWRhdGFTeW1ib2xpY0V4cHJlc3Npb258TWV0YWRhdGFFcnJvcnx1bmRlZmluZWR8bnVsbCB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBzd2l0Y2ggKHZhbHVlLl9fc3ltYm9saWMpIHtcbiAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgIHJldHVybiB0aGlzLmNvbnZlcnRFcnJvcihtb2R1bGVOYW1lLCB2YWx1ZSBhcyBNZXRhZGF0YUVycm9yKTtcbiAgICAgICAgY2FzZSAncmVmZXJlbmNlJzpcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb252ZXJ0UmVmZXJlbmNlKG1vZHVsZU5hbWUsIHZhbHVlIGFzIE1ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb252ZXJ0RXhwcmVzc2lvbk5vZGUobW9kdWxlTmFtZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRFcnJvcihtb2R1bGU6IHN0cmluZywgdmFsdWU6IE1ldGFkYXRhRXJyb3IpOiBNZXRhZGF0YUVycm9yIHtcbiAgICByZXR1cm4ge1xuICAgICAgX19zeW1ib2xpYzogJ2Vycm9yJyxcbiAgICAgIG1lc3NhZ2U6IHZhbHVlLm1lc3NhZ2UsXG4gICAgICBsaW5lOiB2YWx1ZS5saW5lLFxuICAgICAgY2hhcmFjdGVyOiB2YWx1ZS5jaGFyYWN0ZXIsXG4gICAgICBjb250ZXh0OiB2YWx1ZS5jb250ZXh0LCBtb2R1bGVcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0UmVmZXJlbmNlKG1vZHVsZU5hbWU6IHN0cmluZywgdmFsdWU6IE1ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uKTpcbiAgICAgIE1ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9ufE1ldGFkYXRhRXJyb3J8dW5kZWZpbmVkIHtcbiAgICBjb25zdCBjcmVhdGVSZWZlcmVuY2UgPSAoc3ltYm9sOiBTeW1ib2wpOiBNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbiA9PiB7XG4gICAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHN5bWJvbC5kZWNsYXJhdGlvbiAhO1xuICAgICAgaWYgKGRlY2xhcmF0aW9uLm1vZHVsZS5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgICAgLy8gUmVmZXJlbmNlIHRvIGEgc3ltYm9sIGRlZmluZWQgaW4gdGhlIG1vZHVsZS4gRW5zdXJlIGl0IGlzIGNvbnZlcnRlZCB0aGVuIHJldHVybiBhXG4gICAgICAgIC8vIHJlZmVyZW5jZXMgdG8gdGhlIGZpbmFsIHN5bWJvbC5cbiAgICAgICAgdGhpcy5jb252ZXJ0U3ltYm9sKHN5bWJvbCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgX19zeW1ib2xpYzogJ3JlZmVyZW5jZScsXG4gICAgICAgICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgICAgICAvLyBSZXNvbHZlZCBsYXppbHkgYmVjYXVzZSBwcml2YXRlIG5hbWVzIGFyZSBhc3NpZ25lZCBsYXRlLlxuICAgICAgICAgICAgY29uc3QgY2Fub25pY2FsU3ltYm9sID0gc3ltYm9sLmNhbm9uaWNhbFN5bWJvbCAhO1xuICAgICAgICAgICAgaWYgKGNhbm9uaWNhbFN5bWJvbC5pc1ByaXZhdGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICB0aHJvdyBFcnJvcignSW52YWxpZCBzdGF0ZTogaXNQcml2YXRlIHdhcyBub3QgaW5pdGlhbGl6ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjYW5vbmljYWxTeW1ib2wuaXNQcml2YXRlID8gY2Fub25pY2FsU3ltYm9sLnByaXZhdGVOYW1lICEgOiBjYW5vbmljYWxTeW1ib2wubmFtZTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGUgc3ltYm9sIHdhcyBhIHJlLWV4cG9ydGVkIHN5bWJvbCBmcm9tIGFub3RoZXIgbW9kdWxlLiBSZXR1cm4gYSByZWZlcmVuY2UgdG8gdGhlXG4gICAgICAgIC8vIG9yaWdpbmFsIGltcG9ydGVkIHN5bWJvbC5cbiAgICAgICAgcmV0dXJuIHtfX3N5bWJvbGljOiAncmVmZXJlbmNlJywgbmFtZTogZGVjbGFyYXRpb24ubmFtZSwgbW9kdWxlOiBkZWNsYXJhdGlvbi5tb2R1bGV9O1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoaXNNZXRhZGF0YUdsb2JhbFJlZmVyZW5jZUV4cHJlc3Npb24odmFsdWUpKSB7XG4gICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMuZ2V0TWV0YWRhdGEobW9kdWxlTmFtZSk7XG4gICAgICBpZiAobWV0YWRhdGEgJiYgbWV0YWRhdGEubWV0YWRhdGEgJiYgbWV0YWRhdGEubWV0YWRhdGFbdmFsdWUubmFtZV0pIHtcbiAgICAgICAgLy8gUmVmZXJlbmNlIHRvIGEgc3ltYm9sIGRlZmluZWQgaW4gdGhlIG1vZHVsZVxuICAgICAgICByZXR1cm4gY3JlYXRlUmVmZXJlbmNlKHRoaXMuY2Fub25pY2FsU3ltYm9sT2YobW9kdWxlTmFtZSwgdmFsdWUubmFtZSkpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBhIHJlZmVyZW5jZSBoYXMgYXJndW1lbnRzLCB0aGUgYXJndW1lbnRzIG5lZWQgdG8gYmUgY29udmVydGVkLlxuICAgICAgaWYgKHZhbHVlLmFyZ3VtZW50cykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIF9fc3ltYm9saWM6ICdyZWZlcmVuY2UnLFxuICAgICAgICAgIG5hbWU6IHZhbHVlLm5hbWUsXG4gICAgICAgICAgYXJndW1lbnRzOiB2YWx1ZS5hcmd1bWVudHMubWFwKGEgPT4gdGhpcy5jb252ZXJ0VmFsdWUobW9kdWxlTmFtZSwgYSkpXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIEdsb2JhbCByZWZlcmVuY2VzIHdpdGhvdXQgYXJndW1lbnRzIChzdWNoIGFzIHRvIE1hdGggb3IgSlNPTikgYXJlIHVubW9kaWZpZWQuXG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKGlzTWV0YWRhdGFJbXBvcnRlZFN5bWJvbFJlZmVyZW5jZUV4cHJlc3Npb24odmFsdWUpKSB7XG4gICAgICAvLyBSZWZlcmVuY2VzIHRvIGltcG9ydGVkIHN5bWJvbHMgYXJlIHNlcGFyYXRlZCBpbnRvIHR3bywgcmVmZXJlbmNlcyB0byBidW5kbGVkIG1vZHVsZXMgYW5kXG4gICAgICAvLyByZWZlcmVuY2VzIHRvIG1vZHVsZXMgZXh0ZXJuYWwgdG8gdGhlIGJ1bmRsZS4gSWYgdGhlIG1vZHVsZSByZWZlcmVuY2UgaXMgcmVsYXRpdmUgaXQgaXNcbiAgICAgIC8vIGFzc3VtZWQgdG8gYmUgaW4gdGhlIGJ1bmRsZS4gSWYgaXQgaXMgR2xvYmFsIGl0IGlzIGFzc3VtZWQgdG8gYmUgb3V0c2lkZSB0aGUgYnVuZGxlLlxuICAgICAgLy8gUmVmZXJlbmNlcyB0byBzeW1ib2xzIG91dHNpZGUgdGhlIGJ1bmRsZSBhcmUgbGVmdCB1bm1vZGlmaWVkLiBSZWZlcmVuY2VzIHRvIHN5bWJvbCBpbnNpZGVcbiAgICAgIC8vIHRoZSBidW5kbGUgbmVlZCB0byBiZSBjb252ZXJ0ZWQgdG8gYSBidW5kbGUgaW1wb3J0IHJlZmVyZW5jZSByZWFjaGFibGUgZnJvbSB0aGUgYnVuZGxlXG4gICAgICAvLyBpbmRleC5cblxuICAgICAgaWYgKHZhbHVlLm1vZHVsZS5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgICAgLy8gUmVmZXJlbmNlIGlzIHRvIGEgc3ltYm9sIGRlZmluZWQgaW5zaWRlIHRoZSBtb2R1bGUuIENvbnZlcnQgdGhlIHJlZmVyZW5jZSB0byBhIHJlZmVyZW5jZVxuICAgICAgICAvLyB0byB0aGUgY2Fub25pY2FsIHN5bWJvbC5cbiAgICAgICAgY29uc3QgcmVmZXJlbmNlZE1vZHVsZSA9IHJlc29sdmVNb2R1bGUodmFsdWUubW9kdWxlLCBtb2R1bGVOYW1lKTtcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlZE5hbWUgPSB2YWx1ZS5uYW1lO1xuICAgICAgICByZXR1cm4gY3JlYXRlUmVmZXJlbmNlKHRoaXMuY2Fub25pY2FsU3ltYm9sT2YocmVmZXJlbmNlZE1vZHVsZSwgcmVmZXJlbmNlZE5hbWUpKTtcbiAgICAgIH1cblxuICAgICAgLy8gVmFsdWUgaXMgYSByZWZlcmVuY2UgdG8gYSBzeW1ib2wgZGVmaW5lZCBvdXRzaWRlIHRoZSBtb2R1bGUuXG4gICAgICBpZiAodmFsdWUuYXJndW1lbnRzKSB7XG4gICAgICAgIC8vIElmIGEgcmVmZXJlbmNlIGhhcyBhcmd1bWVudHMgdGhlIGFyZ3VtZW50cyBuZWVkIHRvIGJlIGNvbnZlcnRlZC5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBfX3N5bWJvbGljOiAncmVmZXJlbmNlJyxcbiAgICAgICAgICBuYW1lOiB2YWx1ZS5uYW1lLFxuICAgICAgICAgIG1vZHVsZTogdmFsdWUubW9kdWxlLFxuICAgICAgICAgIGFyZ3VtZW50czogdmFsdWUuYXJndW1lbnRzLm1hcChhID0+IHRoaXMuY29udmVydFZhbHVlKG1vZHVsZU5hbWUsIGEpKVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIGlmIChpc01ldGFkYXRhTW9kdWxlUmVmZXJlbmNlRXhwcmVzc2lvbih2YWx1ZSkpIHtcbiAgICAgIC8vIENhbm5vdCBzdXBwb3J0IHJlZmVyZW5jZXMgdG8gYnVuZGxlZCBtb2R1bGVzIGFzIHRoZSBpbnRlcm5hbCBtb2R1bGVzIG9mIGEgYnVuZGxlIGFyZSBlcmFzZWRcbiAgICAgIC8vIGJ5IHRoZSBidW5kbGVyLlxuICAgICAgaWYgKHZhbHVlLm1vZHVsZS5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBfX3N5bWJvbGljOiAnZXJyb3InLFxuICAgICAgICAgIG1lc3NhZ2U6ICdVbnN1cHBvcnRlZCBidW5kbGVkIG1vZHVsZSByZWZlcmVuY2UnLFxuICAgICAgICAgIGNvbnRleHQ6IHttb2R1bGU6IHZhbHVlLm1vZHVsZX1cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVmZXJlbmNlcyB0byB1bmJ1bmRsZWQgbW9kdWxlcyBhcmUgdW5tb2RpZmllZC5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRFeHByZXNzaW9uTm9kZShtb2R1bGVOYW1lOiBzdHJpbmcsIHZhbHVlOiBNZXRhZGF0YVN5bWJvbGljRXhwcmVzc2lvbik6XG4gICAgICBNZXRhZGF0YVN5bWJvbGljRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgcmVzdWx0OiBNZXRhZGF0YVN5bWJvbGljRXhwcmVzc2lvbiA9IHsgX19zeW1ib2xpYzogdmFsdWUuX19zeW1ib2xpYyB9IGFzIGFueTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiB2YWx1ZSkge1xuICAgICAgKHJlc3VsdCBhcyBhbnkpW2tleV0gPSB0aGlzLmNvbnZlcnRWYWx1ZShtb2R1bGVOYW1lLCAodmFsdWUgYXMgYW55KVtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgc3ltYm9sT2YobW9kdWxlOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IFN5bWJvbCB7XG4gICAgY29uc3Qgc3ltYm9sS2V5ID0gYCR7bW9kdWxlfToke25hbWV9YDtcbiAgICBsZXQgc3ltYm9sID0gdGhpcy5zeW1ib2xNYXAuZ2V0KHN5bWJvbEtleSk7XG4gICAgaWYgKCFzeW1ib2wpIHtcbiAgICAgIHN5bWJvbCA9IHttb2R1bGUsIG5hbWV9O1xuICAgICAgdGhpcy5zeW1ib2xNYXAuc2V0KHN5bWJvbEtleSwgc3ltYm9sKTtcbiAgICB9XG4gICAgcmV0dXJuIHN5bWJvbDtcbiAgfVxuXG4gIHByaXZhdGUgY2Fub25pY2FsU3ltYm9sT2YobW9kdWxlOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IFN5bWJvbCB7XG4gICAgLy8gRW5zdXJlIHRoZSBtb2R1bGUgaGFzIGJlZW4gc2Vlbi5cbiAgICB0aGlzLmV4cG9ydEFsbChtb2R1bGUpO1xuICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuc3ltYm9sT2YobW9kdWxlLCBuYW1lKTtcbiAgICBpZiAoIXN5bWJvbC5jYW5vbmljYWxTeW1ib2wpIHtcbiAgICAgIHRoaXMuY2Fub25pY2FsaXplU3ltYm9sKHN5bWJvbCk7XG4gICAgfVxuICAgIHJldHVybiBzeW1ib2w7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVySG9zdEFkYXB0ZXIgaW1wbGVtZW50cyBNZXRhZGF0YUJ1bmRsZXJIb3N0IHtcbiAgcHJpdmF0ZSBjb2xsZWN0b3IgPSBuZXcgTWV0YWRhdGFDb2xsZWN0b3IoKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGhvc3Q6IHRzLkNvbXBpbGVySG9zdCwgcHJpdmF0ZSBjYWNoZTogTWV0YWRhdGFDYWNoZXxudWxsKSB7fVxuXG4gIGdldE1ldGFkYXRhRm9yKGZpbGVOYW1lOiBzdHJpbmcpOiBNb2R1bGVNZXRhZGF0YXx1bmRlZmluZWQge1xuICAgIGlmICghdGhpcy5ob3N0LmZpbGVFeGlzdHMoZmlsZU5hbWUgKyAnLnRzJykpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgY29uc3Qgc291cmNlRmlsZSA9IHRoaXMuaG9zdC5nZXRTb3VyY2VGaWxlKGZpbGVOYW1lICsgJy50cycsIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QpO1xuICAgIC8vIElmIHRoZXJlIGlzIGEgbWV0YWRhdGEgY2FjaGUsIHVzZSBpdCB0byBnZXQgdGhlIG1ldGFkYXRhIGZvciB0aGlzIHNvdXJjZSBmaWxlLiBPdGhlcndpc2UsXG4gICAgLy8gZmFsbCBiYWNrIG9uIHRoZSBsb2NhbGx5IGNyZWF0ZWQgTWV0YWRhdGFDb2xsZWN0b3IuXG4gICAgaWYgKCFzb3VyY2VGaWxlKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAodGhpcy5jYWNoZSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0TWV0YWRhdGEoc291cmNlRmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rvci5nZXRNZXRhZGF0YShzb3VyY2VGaWxlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZU1vZHVsZShpbXBvcnROYW1lOiBzdHJpbmcsIGZyb206IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChpbXBvcnROYW1lLnN0YXJ0c1dpdGgoJy4nKSAmJiBmcm9tKSB7XG4gICAgbGV0IG5vcm1hbFBhdGggPSBwYXRoLm5vcm1hbGl6ZShwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKGZyb20pLCBpbXBvcnROYW1lKSk7XG4gICAgaWYgKCFub3JtYWxQYXRoLnN0YXJ0c1dpdGgoJy4nKSAmJiBmcm9tLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgICAgLy8gcGF0aC5ub3JtYWxpemUoKSBwcmVzZXJ2ZXMgbGVhZGluZyAnLi4vJyBidXQgbm90ICcuLycuIFRoaXMgYWRkcyBpdCBiYWNrLlxuICAgICAgbm9ybWFsUGF0aCA9IGAuJHtwYXRoLnNlcH0ke25vcm1hbFBhdGh9YDtcbiAgICB9XG4gICAgLy8gUmVwbGFjZSB3aW5kb3dzIHBhdGggZGVsaW1pdGVycyB3aXRoIGZvcndhcmQtc2xhc2hlcy4gT3RoZXJ3aXNlIHRoZSBwYXRocyBhcmUgbm90XG4gICAgLy8gVHlwZVNjcmlwdCBjb21wYXRpYmxlIHdoZW4gYnVpbGRpbmcgdGhlIGJ1bmRsZS5cbiAgICByZXR1cm4gbm9ybWFsUGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG4gIH1cbiAgcmV0dXJuIGltcG9ydE5hbWU7XG59XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKG86IGFueSk6IG8gaXMgYm9vbGVhbnxzdHJpbmd8bnVtYmVyIHtcbiAgcmV0dXJuIG8gPT09IG51bGwgfHwgKHR5cGVvZiBvICE9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBvICE9PSAnb2JqZWN0Jyk7XG59XG5cbmZ1bmN0aW9uIGdldFJvb3RFeHBvcnQoc3ltYm9sOiBTeW1ib2wpOiBTeW1ib2wge1xuICByZXR1cm4gc3ltYm9sLnJlZXhwb3J0ZWRBcyA/IGdldFJvb3RFeHBvcnQoc3ltYm9sLnJlZXhwb3J0ZWRBcykgOiBzeW1ib2w7XG59XG5cbmZ1bmN0aW9uIGdldFN5bWJvbERlY2xhcmF0aW9uKHN5bWJvbDogU3ltYm9sKTogU3ltYm9sIHtcbiAgcmV0dXJuIHN5bWJvbC5leHBvcnRzID8gZ2V0U3ltYm9sRGVjbGFyYXRpb24oc3ltYm9sLmV4cG9ydHMpIDogc3ltYm9sO1xufVxuIl19