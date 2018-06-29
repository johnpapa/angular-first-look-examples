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
        define("@angular/language-service/src/typescript_host", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler-cli/src/language_services", "@angular/core", "fs", "path", "typescript", "@angular/language-service/src/language_service", "@angular/language-service/src/reflector_host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var language_services_1 = require("@angular/compiler-cli/src/language_services");
    var core_1 = require("@angular/core");
    var fs = require("fs");
    var path = require("path");
    var ts = require("typescript");
    var language_service_1 = require("@angular/language-service/src/language_service");
    var reflector_host_1 = require("@angular/language-service/src/reflector_host");
    /**
     * Create a `LanguageServiceHost`
     */
    function createLanguageServiceFromTypescript(host, service) {
        var ngHost = new TypeScriptServiceHost(host, service);
        var ngServer = language_service_1.createLanguageService(ngHost);
        ngHost.setSite(ngServer);
        return ngServer;
    }
    exports.createLanguageServiceFromTypescript = createLanguageServiceFromTypescript;
    /**
     * The language service never needs the normalized versions of the metadata. To avoid parsing
     * the content and resolving references, return an empty file. This also allows normalizing
     * template that are syntatically incorrect which is required to provide completions in
     * syntactically incorrect templates.
     */
    var DummyHtmlParser = /** @class */ (function (_super) {
        tslib_1.__extends(DummyHtmlParser, _super);
        function DummyHtmlParser() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DummyHtmlParser.prototype.parse = function (source, url, parseExpansionForms, interpolationConfig) {
            if (parseExpansionForms === void 0) { parseExpansionForms = false; }
            if (interpolationConfig === void 0) { interpolationConfig = compiler_1.DEFAULT_INTERPOLATION_CONFIG; }
            return new compiler_1.ParseTreeResult([], []);
        };
        return DummyHtmlParser;
    }(compiler_1.HtmlParser));
    exports.DummyHtmlParser = DummyHtmlParser;
    /**
     * Avoid loading resources in the language servcie by using a dummy loader.
     */
    var DummyResourceLoader = /** @class */ (function (_super) {
        tslib_1.__extends(DummyResourceLoader, _super);
        function DummyResourceLoader() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DummyResourceLoader.prototype.get = function (url) { return Promise.resolve(''); };
        return DummyResourceLoader;
    }(compiler_1.ResourceLoader));
    exports.DummyResourceLoader = DummyResourceLoader;
    /**
     * An implementation of a `LanguageServiceHost` for a TypeScript project.
     *
     * The `TypeScriptServiceHost` implements the Angular `LanguageServiceHost` using
     * the TypeScript language services.
     *
     * @experimental
     */
    var TypeScriptServiceHost = /** @class */ (function () {
        function TypeScriptServiceHost(host, tsService) {
            this.host = host;
            this.tsService = tsService;
            this._staticSymbolCache = new compiler_1.StaticSymbolCache();
            this._typeCache = [];
            this.modulesOutOfDate = true;
            this.fileVersions = new Map();
        }
        TypeScriptServiceHost.prototype.setSite = function (service) { this.service = service; };
        Object.defineProperty(TypeScriptServiceHost.prototype, "resolver", {
            /**
             * Angular LanguageServiceHost implementation
             */
            get: function () {
                var _this = this;
                this.validate();
                var result = this._resolver;
                if (!result) {
                    var moduleResolver = new compiler_1.NgModuleResolver(this.reflector);
                    var directiveResolver = new compiler_1.DirectiveResolver(this.reflector);
                    var pipeResolver = new compiler_1.PipeResolver(this.reflector);
                    var elementSchemaRegistry = new compiler_1.DomElementSchemaRegistry();
                    var resourceLoader = new DummyResourceLoader();
                    var urlResolver = compiler_1.createOfflineCompileUrlResolver();
                    var htmlParser = new DummyHtmlParser();
                    // This tracks the CompileConfig in codegen.ts. Currently these options
                    // are hard-coded.
                    var config = new compiler_1.CompilerConfig({ defaultEncapsulation: core_1.ViewEncapsulation.Emulated, useJit: false });
                    var directiveNormalizer = new compiler_1.DirectiveNormalizer(resourceLoader, urlResolver, htmlParser, config);
                    result = this._resolver = new compiler_1.CompileMetadataResolver(config, htmlParser, moduleResolver, directiveResolver, pipeResolver, new compiler_1.JitSummaryResolver(), elementSchemaRegistry, directiveNormalizer, new core_1.ɵConsole(), this._staticSymbolCache, this.reflector, function (error, type) { return _this.collectError(error, type && type.filePath); });
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        TypeScriptServiceHost.prototype.getTemplateReferences = function () {
            this.ensureTemplateMap();
            return this.templateReferences || [];
        };
        TypeScriptServiceHost.prototype.getTemplateAt = function (fileName, position) {
            var sourceFile = this.getSourceFile(fileName);
            if (sourceFile) {
                this.context = sourceFile.fileName;
                var node = this.findNode(sourceFile, position);
                if (node) {
                    return this.getSourceFromNode(fileName, this.host.getScriptVersion(sourceFile.fileName), node);
                }
            }
            else {
                this.ensureTemplateMap();
                // TODO: Cannocalize the file?
                var componentType = this.fileToComponent.get(fileName);
                if (componentType) {
                    return this.getSourceFromType(fileName, this.host.getScriptVersion(fileName), componentType);
                }
            }
            return undefined;
        };
        TypeScriptServiceHost.prototype.getAnalyzedModules = function () {
            this.updateAnalyzedModules();
            return this.ensureAnalyzedModules();
        };
        TypeScriptServiceHost.prototype.ensureAnalyzedModules = function () {
            var analyzedModules = this.analyzedModules;
            if (!analyzedModules) {
                if (this.host.getScriptFileNames().length === 0) {
                    analyzedModules = {
                        files: [],
                        ngModuleByPipeOrDirective: new Map(),
                        ngModules: [],
                    };
                }
                else {
                    var analyzeHost = { isSourceFile: function (filePath) { return true; } };
                    var programFiles = this.program.getSourceFiles().map(function (sf) { return sf.fileName; });
                    analyzedModules =
                        compiler_1.analyzeNgModules(programFiles, analyzeHost, this.staticSymbolResolver, this.resolver);
                }
                this.analyzedModules = analyzedModules;
            }
            return analyzedModules;
        };
        TypeScriptServiceHost.prototype.getTemplates = function (fileName) {
            var _this = this;
            this.ensureTemplateMap();
            var componentType = this.fileToComponent.get(fileName);
            if (componentType) {
                var templateSource = this.getTemplateAt(fileName, 0);
                if (templateSource) {
                    return [templateSource];
                }
            }
            else {
                var version_1 = this.host.getScriptVersion(fileName);
                var result_1 = [];
                // Find each template string in the file
                var visit_1 = function (child) {
                    var templateSource = _this.getSourceFromNode(fileName, version_1, child);
                    if (templateSource) {
                        result_1.push(templateSource);
                    }
                    else {
                        ts.forEachChild(child, visit_1);
                    }
                };
                var sourceFile = this.getSourceFile(fileName);
                if (sourceFile) {
                    this.context = sourceFile.path || sourceFile.fileName;
                    ts.forEachChild(sourceFile, visit_1);
                }
                return result_1.length ? result_1 : undefined;
            }
        };
        TypeScriptServiceHost.prototype.getDeclarations = function (fileName) {
            var _this = this;
            var result = [];
            var sourceFile = this.getSourceFile(fileName);
            if (sourceFile) {
                var visit_2 = function (child) {
                    var declaration = _this.getDeclarationFromNode(sourceFile, child);
                    if (declaration) {
                        result.push(declaration);
                    }
                    else {
                        ts.forEachChild(child, visit_2);
                    }
                };
                ts.forEachChild(sourceFile, visit_2);
            }
            return result;
        };
        TypeScriptServiceHost.prototype.getSourceFile = function (fileName) {
            return this.tsService.getProgram().getSourceFile(fileName);
        };
        TypeScriptServiceHost.prototype.updateAnalyzedModules = function () {
            this.validate();
            if (this.modulesOutOfDate) {
                this.analyzedModules = null;
                this._reflector = null;
                this.templateReferences = null;
                this.fileToComponent = null;
                this.ensureAnalyzedModules();
                this.modulesOutOfDate = false;
            }
        };
        Object.defineProperty(TypeScriptServiceHost.prototype, "program", {
            get: function () { return this.tsService.getProgram(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeScriptServiceHost.prototype, "checker", {
            get: function () {
                var checker = this._checker;
                if (!checker) {
                    checker = this._checker = this.program.getTypeChecker();
                }
                return checker;
            },
            enumerable: true,
            configurable: true
        });
        TypeScriptServiceHost.prototype.validate = function () {
            var _this = this;
            var program = this.program;
            if (this.lastProgram !== program) {
                // Invalidate file that have changed in the static symbol resolver
                var invalidateFile = function (fileName) {
                    return _this._staticSymbolResolver.invalidateFile(fileName);
                };
                this.clearCaches();
                var seen_1 = new Set();
                try {
                    for (var _a = tslib_1.__values(this.program.getSourceFiles()), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var sourceFile = _b.value;
                        var fileName = sourceFile.fileName;
                        seen_1.add(fileName);
                        var version = this.host.getScriptVersion(fileName);
                        var lastVersion = this.fileVersions.get(fileName);
                        if (version != lastVersion) {
                            this.fileVersions.set(fileName, version);
                            if (this._staticSymbolResolver) {
                                invalidateFile(fileName);
                            }
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
                // Remove file versions that are no longer in the file and invalidate them.
                var missing = Array.from(this.fileVersions.keys()).filter(function (f) { return !seen_1.has(f); });
                missing.forEach(function (f) { return _this.fileVersions.delete(f); });
                if (this._staticSymbolResolver) {
                    missing.forEach(invalidateFile);
                }
                this.lastProgram = program;
            }
            var e_1, _c;
        };
        TypeScriptServiceHost.prototype.clearCaches = function () {
            this._checker = null;
            this._typeCache = [];
            this._resolver = null;
            this.collectedErrors = null;
            this.modulesOutOfDate = true;
        };
        TypeScriptServiceHost.prototype.ensureTemplateMap = function () {
            if (!this.fileToComponent || !this.templateReferences) {
                var fileToComponent = new Map();
                var templateReference = [];
                var ngModuleSummary = this.getAnalyzedModules();
                var urlResolver = compiler_1.createOfflineCompileUrlResolver();
                try {
                    for (var _a = tslib_1.__values(ngModuleSummary.ngModules), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var module_1 = _b.value;
                        try {
                            for (var _c = tslib_1.__values(module_1.declaredDirectives), _d = _c.next(); !_d.done; _d = _c.next()) {
                                var directive = _d.value;
                                var metadata = this.resolver.getNonNormalizedDirectiveMetadata(directive.reference).metadata;
                                if (metadata.isComponent && metadata.template && metadata.template.templateUrl) {
                                    var templateName = urlResolver.resolve(this.reflector.componentModuleUrl(directive.reference), metadata.template.templateUrl);
                                    fileToComponent.set(templateName, directive.reference);
                                    templateReference.push(templateName);
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_e = _c.return)) _e.call(_c);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_f = _a.return)) _f.call(_a);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                this.fileToComponent = fileToComponent;
                this.templateReferences = templateReference;
            }
            var e_3, _f, e_2, _e;
        };
        TypeScriptServiceHost.prototype.getSourceFromDeclaration = function (fileName, version, source, span, type, declaration, node, sourceFile) {
            var queryCache = undefined;
            var t = this;
            if (declaration) {
                return {
                    version: version,
                    source: source,
                    span: span,
                    type: type,
                    get members() {
                        return language_services_1.getClassMembersFromDeclaration(t.program, t.checker, sourceFile, declaration);
                    },
                    get query() {
                        if (!queryCache) {
                            var pipes_1 = t.service.getPipesAt(fileName, node.getStart());
                            queryCache = language_services_1.getSymbolQuery(t.program, t.checker, sourceFile, function () { return language_services_1.getPipesTable(sourceFile, t.program, t.checker, pipes_1); });
                        }
                        return queryCache;
                    }
                };
            }
        };
        TypeScriptServiceHost.prototype.getSourceFromNode = function (fileName, version, node) {
            var result = undefined;
            var t = this;
            switch (node.kind) {
                case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                case ts.SyntaxKind.StringLiteral:
                    var _a = tslib_1.__read(this.getTemplateClassDeclFromNode(node), 2), declaration = _a[0], decorator = _a[1];
                    if (declaration && declaration.name) {
                        var sourceFile = this.getSourceFile(fileName);
                        if (sourceFile) {
                            return this.getSourceFromDeclaration(fileName, version, this.stringOf(node) || '', shrink(spanOf(node)), this.reflector.getStaticSymbol(sourceFile.fileName, declaration.name.text), declaration, node, sourceFile);
                        }
                    }
                    break;
            }
            return result;
        };
        TypeScriptServiceHost.prototype.getSourceFromType = function (fileName, version, type) {
            var result = undefined;
            var declaration = this.getTemplateClassFromStaticSymbol(type);
            if (declaration) {
                var snapshot = this.host.getScriptSnapshot(fileName);
                if (snapshot) {
                    var source = snapshot.getText(0, snapshot.getLength());
                    result = this.getSourceFromDeclaration(fileName, version, source, { start: 0, end: source.length }, type, declaration, declaration, declaration.getSourceFile());
                }
            }
            return result;
        };
        Object.defineProperty(TypeScriptServiceHost.prototype, "reflectorHost", {
            get: function () {
                var _this = this;
                var result = this._reflectorHost;
                if (!result) {
                    if (!this.context) {
                        // Make up a context by finding the first script and using that as the base dir.
                        var scriptFileNames = this.host.getScriptFileNames();
                        if (0 === scriptFileNames.length) {
                            throw new Error('Internal error: no script file names found');
                        }
                        this.context = scriptFileNames[0];
                    }
                    // Use the file context's directory as the base directory.
                    // The host's getCurrentDirectory() is not reliable as it is always "" in
                    // tsserver. We don't need the exact base directory, just one that contains
                    // a source file.
                    var source = this.tsService.getProgram().getSourceFile(this.context);
                    if (!source) {
                        throw new Error('Internal error: no context could be determined');
                    }
                    var tsConfigPath = findTsConfig(source.fileName);
                    var basePath = path.dirname(tsConfigPath || this.context);
                    var options = { basePath: basePath, genDir: basePath };
                    var compilerOptions = this.host.getCompilationSettings();
                    if (compilerOptions && compilerOptions.baseUrl) {
                        options.baseUrl = compilerOptions.baseUrl;
                    }
                    if (compilerOptions && compilerOptions.paths) {
                        options.paths = compilerOptions.paths;
                    }
                    result = this._reflectorHost =
                        new reflector_host_1.ReflectorHost(function () { return _this.tsService.getProgram(); }, this.host, options);
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        TypeScriptServiceHost.prototype.collectError = function (error, filePath) {
            if (filePath) {
                var errorMap = this.collectedErrors;
                if (!errorMap || !this.collectedErrors) {
                    errorMap = this.collectedErrors = new Map();
                }
                var errors = errorMap.get(filePath);
                if (!errors) {
                    errors = [];
                    this.collectedErrors.set(filePath, errors);
                }
                errors.push(error);
            }
        };
        Object.defineProperty(TypeScriptServiceHost.prototype, "staticSymbolResolver", {
            get: function () {
                var _this = this;
                var result = this._staticSymbolResolver;
                if (!result) {
                    this._summaryResolver = new compiler_1.AotSummaryResolver({
                        loadSummary: function (filePath) { return null; },
                        isSourceFile: function (sourceFilePath) { return true; },
                        toSummaryFileName: function (sourceFilePath) { return sourceFilePath; },
                        fromSummaryFileName: function (filePath) { return filePath; },
                    }, this._staticSymbolCache);
                    result = this._staticSymbolResolver = new compiler_1.StaticSymbolResolver(this.reflectorHost, this._staticSymbolCache, this._summaryResolver, function (e, filePath) { return _this.collectError(e, filePath); });
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeScriptServiceHost.prototype, "reflector", {
            get: function () {
                var _this = this;
                var result = this._reflector;
                if (!result) {
                    var ssr = this.staticSymbolResolver;
                    result = this._reflector = new compiler_1.StaticReflector(this._summaryResolver, ssr, [], [], function (e, filePath) { return _this.collectError(e, filePath); });
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        TypeScriptServiceHost.prototype.getTemplateClassFromStaticSymbol = function (type) {
            var source = this.getSourceFile(type.filePath);
            if (source) {
                var declarationNode = ts.forEachChild(source, function (child) {
                    if (child.kind === ts.SyntaxKind.ClassDeclaration) {
                        var classDeclaration = child;
                        if (classDeclaration.name != null && classDeclaration.name.text === type.name) {
                            return classDeclaration;
                        }
                    }
                });
                return declarationNode;
            }
            return undefined;
        };
        /**
         * Given a template string node, see if it is an Angular template string, and if so return the
         * containing class.
         */
        TypeScriptServiceHost.prototype.getTemplateClassDeclFromNode = function (currentToken) {
            // Verify we are in a 'template' property assignment, in an object literal, which is an call
            // arg, in a decorator
            var parentNode = currentToken.parent; // PropertyAssignment
            if (!parentNode) {
                return TypeScriptServiceHost.missingTemplate;
            }
            if (parentNode.kind !== ts.SyntaxKind.PropertyAssignment) {
                return TypeScriptServiceHost.missingTemplate;
            }
            else {
                // TODO: Is this different for a literal, i.e. a quoted property name like "template"?
                if (parentNode.name.text !== 'template') {
                    return TypeScriptServiceHost.missingTemplate;
                }
            }
            parentNode = parentNode.parent; // ObjectLiteralExpression
            if (!parentNode || parentNode.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
                return TypeScriptServiceHost.missingTemplate;
            }
            parentNode = parentNode.parent; // CallExpression
            if (!parentNode || parentNode.kind !== ts.SyntaxKind.CallExpression) {
                return TypeScriptServiceHost.missingTemplate;
            }
            var callTarget = parentNode.expression;
            var decorator = parentNode.parent; // Decorator
            if (!decorator || decorator.kind !== ts.SyntaxKind.Decorator) {
                return TypeScriptServiceHost.missingTemplate;
            }
            var declaration = decorator.parent; // ClassDeclaration
            if (!declaration || declaration.kind !== ts.SyntaxKind.ClassDeclaration) {
                return TypeScriptServiceHost.missingTemplate;
            }
            return [declaration, callTarget];
        };
        TypeScriptServiceHost.prototype.getCollectedErrors = function (defaultSpan, sourceFile) {
            var errors = (this.collectedErrors && this.collectedErrors.get(sourceFile.fileName));
            return (errors && errors.map(function (e) {
                var line = e.line || (e.position && e.position.line);
                var column = e.column || (e.position && e.position.column);
                var span = spanAt(sourceFile, line, column) || defaultSpan;
                if (compiler_1.isFormattedError(e)) {
                    return errorToDiagnosticWithChain(e, span);
                }
                return { message: e.message, span: span };
            })) ||
                [];
        };
        TypeScriptServiceHost.prototype.getDeclarationFromNode = function (sourceFile, node) {
            if (node.kind == ts.SyntaxKind.ClassDeclaration && node.decorators &&
                node.name) {
                try {
                    for (var _a = tslib_1.__values(node.decorators), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var decorator = _b.value;
                        if (decorator.expression && decorator.expression.kind == ts.SyntaxKind.CallExpression) {
                            var classDeclaration = node;
                            if (classDeclaration.name) {
                                var call = decorator.expression;
                                var target = call.expression;
                                var type = this.checker.getTypeAtLocation(target);
                                if (type) {
                                    var staticSymbol = this.reflector.getStaticSymbol(sourceFile.fileName, classDeclaration.name.text);
                                    try {
                                        if (this.resolver.isDirective(staticSymbol)) {
                                            var metadata = this.resolver.getNonNormalizedDirectiveMetadata(staticSymbol).metadata;
                                            var declarationSpan = spanOf(target);
                                            return {
                                                type: staticSymbol,
                                                declarationSpan: declarationSpan,
                                                metadata: metadata,
                                                errors: this.getCollectedErrors(declarationSpan, sourceFile)
                                            };
                                        }
                                    }
                                    catch (e) {
                                        if (e.message) {
                                            this.collectError(e, sourceFile.fileName);
                                            var declarationSpan = spanOf(target);
                                            return {
                                                type: staticSymbol,
                                                declarationSpan: declarationSpan,
                                                errors: this.getCollectedErrors(declarationSpan, sourceFile)
                                            };
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            var e_4, _c;
        };
        TypeScriptServiceHost.prototype.stringOf = function (node) {
            switch (node.kind) {
                case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                    return node.text;
                case ts.SyntaxKind.StringLiteral:
                    return node.text;
            }
        };
        TypeScriptServiceHost.prototype.findNode = function (sourceFile, position) {
            function find(node) {
                if (position >= node.getStart() && position < node.getEnd()) {
                    return ts.forEachChild(node, find) || node;
                }
            }
            return find(sourceFile);
        };
        TypeScriptServiceHost.missingTemplate = [undefined, undefined];
        return TypeScriptServiceHost;
    }());
    exports.TypeScriptServiceHost = TypeScriptServiceHost;
    function findTsConfig(fileName) {
        var dir = path.dirname(fileName);
        while (fs.existsSync(dir)) {
            var candidate = path.join(dir, 'tsconfig.json');
            if (fs.existsSync(candidate))
                return candidate;
            var parentDir = path.dirname(dir);
            if (parentDir === dir)
                break;
            dir = parentDir;
        }
    }
    function spanOf(node) {
        return { start: node.getStart(), end: node.getEnd() };
    }
    function shrink(span, offset) {
        if (offset == null)
            offset = 1;
        return { start: span.start + offset, end: span.end - offset };
    }
    function spanAt(sourceFile, line, column) {
        if (line != null && column != null) {
            var position_1 = ts.getPositionOfLineAndCharacter(sourceFile, line, column);
            var findChild = function findChild(node) {
                if (node.kind > ts.SyntaxKind.LastToken && node.pos <= position_1 && node.end > position_1) {
                    var betterNode = ts.forEachChild(node, findChild);
                    return betterNode || node;
                }
            };
            var node = ts.forEachChild(sourceFile, findChild);
            if (node) {
                return { start: node.getStart(), end: node.getEnd() };
            }
        }
    }
    function chainedMessage(chain, indent) {
        if (indent === void 0) { indent = ''; }
        return indent + chain.message + (chain.next ? chainedMessage(chain.next, indent + '  ') : '');
    }
    var DiagnosticMessageChainImpl = /** @class */ (function () {
        function DiagnosticMessageChainImpl(message, next) {
            this.message = message;
            this.next = next;
        }
        DiagnosticMessageChainImpl.prototype.toString = function () { return chainedMessage(this); };
        return DiagnosticMessageChainImpl;
    }());
    function convertChain(chain) {
        return { message: chain.message, next: chain.next ? convertChain(chain.next) : undefined };
    }
    function errorToDiagnosticWithChain(error, span) {
        return { message: error.chain ? convertChain(error.chain) : error.message, span: span };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdF9ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvbGFuZ3VhZ2Utc2VydmljZS9zcmMvdHlwZXNjcmlwdF9ob3N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUE0Z0I7SUFDNWdCLGlGQUEySTtJQUMzSSxzQ0FBcUU7SUFDckUsdUJBQXlCO0lBQ3pCLDJCQUE2QjtJQUM3QiwrQkFBaUM7SUFFakMsbUZBQXlEO0lBQ3pELCtFQUErQztJQU0vQzs7T0FFRztJQUNILDZDQUNJLElBQTRCLEVBQUUsT0FBMkI7UUFDM0QsSUFBTSxNQUFNLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDeEQsSUFBTSxRQUFRLEdBQUcsd0NBQXFCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6QixNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFORCxrRkFNQztJQUVEOzs7OztPQUtHO0lBQ0g7UUFBcUMsMkNBQVU7UUFBL0M7O1FBTUEsQ0FBQztRQUxDLCtCQUFLLEdBQUwsVUFDSSxNQUFjLEVBQUUsR0FBVyxFQUFFLG1CQUFvQyxFQUNqRSxtQkFBdUU7WUFEMUMsb0NBQUEsRUFBQSwyQkFBb0M7WUFDakUsb0NBQUEsRUFBQSxzQkFBMkMsdUNBQTRCO1lBQ3pFLE1BQU0sQ0FBQyxJQUFJLDBCQUFlLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFDSCxzQkFBQztJQUFELENBQUMsQUFORCxDQUFxQyxxQkFBVSxHQU05QztJQU5ZLDBDQUFlO0lBUTVCOztPQUVHO0lBQ0g7UUFBeUMsK0NBQWM7UUFBdkQ7O1FBRUEsQ0FBQztRQURDLGlDQUFHLEdBQUgsVUFBSSxHQUFXLElBQXFCLE1B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LENBQUM7SUFDbEYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBb3RTdW1tYXJ5UmVzb2x2ZXIsIENvbXBpbGVNZXRhZGF0YVJlc29sdmVyLCBDb21waWxlckNvbmZpZywgREVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRywgRGlyZWN0aXZlTm9ybWFsaXplciwgRGlyZWN0aXZlUmVzb2x2ZXIsIERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgRm9ybWF0dGVkRXJyb3IsIEZvcm1hdHRlZE1lc3NhZ2VDaGFpbiwgSHRtbFBhcnNlciwgSW50ZXJwb2xhdGlvbkNvbmZpZywgSml0U3VtbWFyeVJlc29sdmVyLCBOZ0FuYWx5emVkTW9kdWxlcywgTmdNb2R1bGVSZXNvbHZlciwgUGFyc2VUcmVlUmVzdWx0LCBQaXBlUmVzb2x2ZXIsIFJlc291cmNlTG9hZGVyLCBTdGF0aWNSZWZsZWN0b3IsIFN0YXRpY1N5bWJvbCwgU3RhdGljU3ltYm9sQ2FjaGUsIFN0YXRpY1N5bWJvbFJlc29sdmVyLCBTdW1tYXJ5UmVzb2x2ZXIsIGFuYWx5emVOZ01vZHVsZXMsIGNyZWF0ZU9mZmxpbmVDb21waWxlVXJsUmVzb2x2ZXIsIGlzRm9ybWF0dGVkRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCB7Q29tcGlsZXJPcHRpb25zLCBnZXRDbGFzc01lbWJlcnNGcm9tRGVjbGFyYXRpb24sIGdldFBpcGVzVGFibGUsIGdldFN5bWJvbFF1ZXJ5fSBmcm9tICdAYW5ndWxhci9jb21waWxlci1jbGkvc3JjL2xhbmd1YWdlX3NlcnZpY2VzJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb24sIMm1Q29uc29sZSBhcyBDb25zb2xlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtjcmVhdGVMYW5ndWFnZVNlcnZpY2V9IGZyb20gJy4vbGFuZ3VhZ2Vfc2VydmljZSc7XG5pbXBvcnQge1JlZmxlY3Rvckhvc3R9IGZyb20gJy4vcmVmbGVjdG9yX2hvc3QnO1xuaW1wb3J0IHtCdWlsdGluVHlwZSwgRGVjbGFyYXRpb24sIERlY2xhcmF0aW9uRXJyb3IsIERlY2xhcmF0aW9uS2luZCwgRGVjbGFyYXRpb25zLCBEZWZpbml0aW9uLCBEaWFnbm9zdGljTWVzc2FnZUNoYWluLCBMYW5ndWFnZVNlcnZpY2UsIExhbmd1YWdlU2VydmljZUhvc3QsIFBpcGVJbmZvLCBQaXBlcywgU2lnbmF0dXJlLCBTcGFuLCBTeW1ib2wsIFN5bWJvbERlY2xhcmF0aW9uLCBTeW1ib2xRdWVyeSwgU3ltYm9sVGFibGUsIFRlbXBsYXRlU291cmNlLCBUZW1wbGF0ZVNvdXJjZXN9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHtpc1R5cGVzY3JpcHRWZXJzaW9ufSBmcm9tICcuL3V0aWxzJztcblxuXG5cbi8qKlxuICogQ3JlYXRlIGEgYExhbmd1YWdlU2VydmljZUhvc3RgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMYW5ndWFnZVNlcnZpY2VGcm9tVHlwZXNjcmlwdChcbiAgICBob3N0OiB0cy5MYW5ndWFnZVNlcnZpY2VIb3N0LCBzZXJ2aWNlOiB0cy5MYW5ndWFnZVNlcnZpY2UpOiBMYW5ndWFnZVNlcnZpY2Uge1xuICBjb25zdCBuZ0hvc3QgPSBuZXcgVHlwZVNjcmlwdFNlcnZpY2VIb3N0KGhvc3QsIHNlcnZpY2UpO1xuICBjb25zdCBuZ1NlcnZlciA9IGNyZWF0ZUxhbmd1YWdlU2VydmljZShuZ0hvc3QpO1xuICBuZ0hvc3Quc2V0U2l0ZShuZ1NlcnZlcik7XG4gIHJldHVybiBuZ1NlcnZlcjtcbn1cblxuLyoqXG4gKiBUaGUgbGFuZ3VhZ2Ugc2VydmljZSBuZXZlciBuZWVkcyB0aGUgbm9ybWFsaXplZCB2ZXJzaW9ucyBvZiB0aGUgbWV0YWRhdGEuIFRvIGF2b2lkIHBhcnNpbmdcbiAqIHRoZSBjb250ZW50IGFuZCByZXNvbHZpbmcgcmVmZXJlbmNlcywgcmV0dXJuIGFuIGVtcHR5IGZpbGUuIFRoaXMgYWxzbyBhbGxvd3Mgbm9ybWFsaXppbmdcbiAqIHRlbXBsYXRlIHRoYXQgYXJlIHN5bnRhdGljYWxseSBpbmNvcnJlY3Qgd2hpY2ggaXMgcmVxdWlyZWQgdG8gcHJvdmlkZSBjb21wbGV0aW9ucyBpblxuICogc3ludGFjdGljYWxseSBpbmNvcnJlY3QgdGVtcGxhdGVzLlxuICovXG5leHBvcnQgY2xhc3MgRHVtbXlIdG1sUGFyc2VyIGV4dGVuZHMgSHRtbFBhcnNlciB7XG4gIHBhcnNlKFxuICAgICAgc291cmNlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBwYXJzZUV4cGFuc2lvbkZvcm1zOiBib29sZWFuID0gZmFsc2UsXG4gICAgICBpbnRlcnBvbGF0aW9uQ29uZmlnOiBJbnRlcnBvbGF0aW9uQ29uZmlnID0gREVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRyk6IFBhcnNlVHJlZVJlc3VsdCB7XG4gICAgcmV0dXJuIG5ldyBQYXJzZVRyZWVSZXN1bHQoW10sIFtdKTtcbiAgfVxufVxuXG4vKipcbiAqIEF2b2lkIGxvYWRpbmcgcmVzb3VyY2VzIGluIHRoZSBsYW5ndWFnZSBzZXJ2Y2llIGJ5IHVzaW5nIGEgZHVtbXkgbG9hZGVyLlxuICovXG5leHBvcnQgY2xhc3MgRHVtbXlSZXNvdXJjZUxvYWRlciBleHRlbmRzIFJlc291cmNlTG9hZGVyIHtcbiAgZ2V0KHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgnJyk7IH1cbn1cblxuLyoqXG4gKiBBbiBpbXBsZW1lbnRhdGlvbiBvZiBhIGBMYW5ndWFnZVNlcnZpY2VIb3N0YCBmb3IgYSBUeXBlU2NyaXB0IHByb2plY3QuXG4gKlxuICogVGhlIGBUeXBlU2NyaXB0U2VydmljZUhvc3RgIGltcGxlbWVudHMgdGhlIEFuZ3VsYXIgYExhbmd1YWdlU2VydmljZUhvc3RgIHVzaW5nXG4gKiB0aGUgVHlwZVNjcmlwdCBsYW5ndWFnZSBzZXJ2aWNlcy5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBjbGFzcyBUeXBlU2NyaXB0U2VydmljZUhvc3QgaW1wbGVtZW50cyBMYW5ndWFnZVNlcnZpY2VIb3N0IHtcbiAgcHJpdmF0ZSBfcmVzb2x2ZXI6IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyfG51bGw7XG4gIHByaXZhdGUgX3N0YXRpY1N5bWJvbENhY2hlID0gbmV3IFN0YXRpY1N5bWJvbENhY2hlKCk7XG4gIHByaXZhdGUgX3N1bW1hcnlSZXNvbHZlcjogQW90U3VtbWFyeVJlc29sdmVyO1xuICBwcml2YXRlIF9zdGF0aWNTeW1ib2xSZXNvbHZlcjogU3RhdGljU3ltYm9sUmVzb2x2ZXI7XG4gIHByaXZhdGUgX3JlZmxlY3RvcjogU3RhdGljUmVmbGVjdG9yfG51bGw7XG4gIHByaXZhdGUgX3JlZmxlY3Rvckhvc3Q6IFJlZmxlY3Rvckhvc3Q7XG4gIHByaXZhdGUgX2NoZWNrZXI6IHRzLlR5cGVDaGVja2VyfG51bGw7XG4gIHByaXZhdGUgX3R5cGVDYWNoZTogU3ltYm9sW10gPSBbXTtcbiAgcHJpdmF0ZSBjb250ZXh0OiBzdHJpbmd8dW5kZWZpbmVkO1xuICBwcml2YXRlIGxhc3RQcm9ncmFtOiB0cy5Qcm9ncmFtfHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBtb2R1bGVzT3V0T2ZEYXRlOiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBhbmFseXplZE1vZHVsZXM6IE5nQW5hbHl6ZWRNb2R1bGVzfG51bGw7XG4gIHByaXZhdGUgc2VydmljZTogTGFuZ3VhZ2VTZXJ2aWNlO1xuICBwcml2YXRlIGZpbGVUb0NvbXBvbmVudDogTWFwPHN0cmluZywgU3RhdGljU3ltYm9sPnxudWxsO1xuICBwcml2YXRlIHRlbXBsYXRlUmVmZXJlbmNlczogc3RyaW5nW118bnVsbDtcbiAgcHJpdmF0ZSBjb2xsZWN0ZWRFcnJvcnM6IE1hcDxzdHJpbmcsIGFueVtdPnxudWxsO1xuICBwcml2YXRlIGZpbGVWZXJzaW9ucyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBob3N0OiB0cy5MYW5ndWFnZVNlcnZpY2VIb3N0LCBwcml2YXRlIHRzU2VydmljZTogdHMuTGFuZ3VhZ2VTZXJ2aWNlKSB7fVxuXG4gIHNldFNpdGUoc2VydmljZTogTGFuZ3VhZ2VTZXJ2aWNlKSB7IHRoaXMuc2VydmljZSA9IHNlcnZpY2U7IH1cblxuICAvKipcbiAgICogQW5ndWxhciBMYW5ndWFnZVNlcnZpY2VIb3N0IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBnZXQgcmVzb2x2ZXIoKTogQ29tcGlsZU1ldGFkYXRhUmVzb2x2ZXIge1xuICAgIHRoaXMudmFsaWRhdGUoKTtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5fcmVzb2x2ZXI7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIGNvbnN0IG1vZHVsZVJlc29sdmVyID0gbmV3IE5nTW9kdWxlUmVzb2x2ZXIodGhpcy5yZWZsZWN0b3IpO1xuICAgICAgY29uc3QgZGlyZWN0aXZlUmVzb2x2ZXIgPSBuZXcgRGlyZWN0aXZlUmVzb2x2ZXIodGhpcy5yZWZsZWN0b3IpO1xuICAgICAgY29uc3QgcGlwZVJlc29sdmVyID0gbmV3IFBpcGVSZXNvbHZlcih0aGlzLnJlZmxlY3Rvcik7XG4gICAgICBjb25zdCBlbGVtZW50U2NoZW1hUmVnaXN0cnkgPSBuZXcgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5KCk7XG4gICAgICBjb25zdCByZXNvdXJjZUxvYWRlciA9IG5ldyBEdW1teVJlc291cmNlTG9hZGVyKCk7XG4gICAgICBjb25zdCB1cmxSZXNvbHZlciA9IGNyZWF0ZU9mZmxpbmVDb21waWxlVXJsUmVzb2x2ZXIoKTtcbiAgICAgIGNvbnN0IGh0bWxQYXJzZXIgPSBuZXcgRHVtbXlIdG1sUGFyc2VyKCk7XG4gICAgICAvLyBUaGlzIHRyYWNrcyB0aGUgQ29tcGlsZUNvbmZpZyBpbiBjb2RlZ2VuLnRzLiBDdXJyZW50bHkgdGhlc2Ugb3B0aW9uc1xuICAgICAgLy8gYXJlIGhhcmQtY29kZWQuXG4gICAgICBjb25zdCBjb25maWcgPVxuICAgICAgICAgIG5ldyBDb21waWxlckNvbmZpZyh7ZGVmYXVsdEVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkLCB1c2VKaXQ6IGZhbHNlfSk7XG4gICAgICBjb25zdCBkaXJlY3RpdmVOb3JtYWxpemVyID1cbiAgICAgICAgICBuZXcgRGlyZWN0aXZlTm9ybWFsaXplcihyZXNvdXJjZUxvYWRlciwgdXJsUmVzb2x2ZXIsIGh0bWxQYXJzZXIsIGNvbmZpZyk7XG5cbiAgICAgIHJlc3VsdCA9IHRoaXMuX3Jlc29sdmVyID0gbmV3IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyKFxuICAgICAgICAgIGNvbmZpZywgaHRtbFBhcnNlciwgbW9kdWxlUmVzb2x2ZXIsIGRpcmVjdGl2ZVJlc29sdmVyLCBwaXBlUmVzb2x2ZXIsXG4gICAgICAgICAgbmV3IEppdFN1bW1hcnlSZXNvbHZlcigpLCBlbGVtZW50U2NoZW1hUmVnaXN0cnksIGRpcmVjdGl2ZU5vcm1hbGl6ZXIsIG5ldyBDb25zb2xlKCksXG4gICAgICAgICAgdGhpcy5fc3RhdGljU3ltYm9sQ2FjaGUsIHRoaXMucmVmbGVjdG9yLFxuICAgICAgICAgIChlcnJvciwgdHlwZSkgPT4gdGhpcy5jb2xsZWN0RXJyb3IoZXJyb3IsIHR5cGUgJiYgdHlwZS5maWxlUGF0aCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZ2V0VGVtcGxhdGVSZWZlcmVuY2VzKCk6IHN0cmluZ1tdIHtcbiAgICB0aGlzLmVuc3VyZVRlbXBsYXRlTWFwKCk7XG4gICAgcmV0dXJuIHRoaXMudGVtcGxhdGVSZWZlcmVuY2VzIHx8IFtdO1xuICB9XG5cbiAgZ2V0VGVtcGxhdGVBdChmaWxlTmFtZTogc3RyaW5nLCBwb3NpdGlvbjogbnVtYmVyKTogVGVtcGxhdGVTb3VyY2V8dW5kZWZpbmVkIHtcbiAgICBsZXQgc291cmNlRmlsZSA9IHRoaXMuZ2V0U291cmNlRmlsZShmaWxlTmFtZSk7XG4gICAgaWYgKHNvdXJjZUZpbGUpIHtcbiAgICAgIHRoaXMuY29udGV4dCA9IHNvdXJjZUZpbGUuZmlsZU5hbWU7XG4gICAgICBsZXQgbm9kZSA9IHRoaXMuZmluZE5vZGUoc291cmNlRmlsZSwgcG9zaXRpb24pO1xuICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U291cmNlRnJvbU5vZGUoXG4gICAgICAgICAgICBmaWxlTmFtZSwgdGhpcy5ob3N0LmdldFNjcmlwdFZlcnNpb24oc291cmNlRmlsZS5maWxlTmFtZSksIG5vZGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVuc3VyZVRlbXBsYXRlTWFwKCk7XG4gICAgICAvLyBUT0RPOiBDYW5ub2NhbGl6ZSB0aGUgZmlsZT9cbiAgICAgIGNvbnN0IGNvbXBvbmVudFR5cGUgPSB0aGlzLmZpbGVUb0NvbXBvbmVudCAhLmdldChmaWxlTmFtZSk7XG4gICAgICBpZiAoY29tcG9uZW50VHlwZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTb3VyY2VGcm9tVHlwZShcbiAgICAgICAgICAgIGZpbGVOYW1lLCB0aGlzLmhvc3QuZ2V0U2NyaXB0VmVyc2lvbihmaWxlTmFtZSksIGNvbXBvbmVudFR5cGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgZ2V0QW5hbHl6ZWRNb2R1bGVzKCk6IE5nQW5hbHl6ZWRNb2R1bGVzIHtcbiAgICB0aGlzLnVwZGF0ZUFuYWx5emVkTW9kdWxlcygpO1xuICAgIHJldHVybiB0aGlzLmVuc3VyZUFuYWx5emVkTW9kdWxlcygpO1xuICB9XG5cbiAgcHJpdmF0ZSBlbnN1cmVBbmFseXplZE1vZHVsZXMoKTogTmdBbmFseXplZE1vZHVsZXMge1xuICAgIGxldCBhbmFseXplZE1vZHVsZXMgPSB0aGlzLmFuYWx5emVkTW9kdWxlcztcbiAgICBpZiAoIWFuYWx5emVkTW9kdWxlcykge1xuICAgICAgaWYgKHRoaXMuaG9zdC5nZXRTY3JpcHRGaWxlTmFtZXMoKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgYW5hbHl6ZWRNb2R1bGVzID0ge1xuICAgICAgICAgIGZpbGVzOiBbXSxcbiAgICAgICAgICBuZ01vZHVsZUJ5UGlwZU9yRGlyZWN0aXZlOiBuZXcgTWFwKCksXG4gICAgICAgICAgbmdNb2R1bGVzOiBbXSxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGFuYWx5emVIb3N0ID0ge2lzU291cmNlRmlsZShmaWxlUGF0aDogc3RyaW5nKSB7IHJldHVybiB0cnVlOyB9fTtcbiAgICAgICAgY29uc3QgcHJvZ3JhbUZpbGVzID0gdGhpcy5wcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkubWFwKHNmID0+IHNmLmZpbGVOYW1lKTtcbiAgICAgICAgYW5hbHl6ZWRNb2R1bGVzID1cbiAgICAgICAgICAgIGFuYWx5emVOZ01vZHVsZXMocHJvZ3JhbUZpbGVzLCBhbmFseXplSG9zdCwgdGhpcy5zdGF0aWNTeW1ib2xSZXNvbHZlciwgdGhpcy5yZXNvbHZlcik7XG4gICAgICB9XG4gICAgICB0aGlzLmFuYWx5emVkTW9kdWxlcyA9IGFuYWx5emVkTW9kdWxlcztcbiAgICB9XG4gICAgcmV0dXJuIGFuYWx5emVkTW9kdWxlcztcbiAgfVxuXG4gIGdldFRlbXBsYXRlcyhmaWxlTmFtZTogc3RyaW5nKTogVGVtcGxhdGVTb3VyY2VzIHtcbiAgICB0aGlzLmVuc3VyZVRlbXBsYXRlTWFwKCk7XG4gICAgY29uc3QgY29tcG9uZW50VHlwZSA9IHRoaXMuZmlsZVRvQ29tcG9uZW50ICEuZ2V0KGZpbGVOYW1lKTtcbiAgICBpZiAoY29tcG9uZW50VHlwZSkge1xuICAgICAgY29uc3QgdGVtcGxhdGVTb3VyY2UgPSB0aGlzLmdldFRlbXBsYXRlQXQoZmlsZU5hbWUsIDApO1xuICAgICAgaWYgKHRlbXBsYXRlU291cmNlKSB7XG4gICAgICAgIHJldHVybiBbdGVtcGxhdGVTb3VyY2VdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgdmVyc2lvbiA9IHRoaXMuaG9zdC5nZXRTY3JpcHRWZXJzaW9uKGZpbGVOYW1lKTtcbiAgICAgIGxldCByZXN1bHQ6IFRlbXBsYXRlU291cmNlW10gPSBbXTtcblxuICAgICAgLy8gRmluZCBlYWNoIHRlbXBsYXRlIHN0cmluZyBpbiB0aGUgZmlsZVxuICAgICAgbGV0IHZpc2l0ID0gKGNoaWxkOiB0cy5Ob2RlKSA9PiB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZVNvdXJjZSA9IHRoaXMuZ2V0U291cmNlRnJvbU5vZGUoZmlsZU5hbWUsIHZlcnNpb24sIGNoaWxkKTtcbiAgICAgICAgaWYgKHRlbXBsYXRlU291cmNlKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2godGVtcGxhdGVTb3VyY2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRzLmZvckVhY2hDaGlsZChjaGlsZCwgdmlzaXQpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBsZXQgc291cmNlRmlsZSA9IHRoaXMuZ2V0U291cmNlRmlsZShmaWxlTmFtZSk7XG4gICAgICBpZiAoc291cmNlRmlsZSkge1xuICAgICAgICB0aGlzLmNvbnRleHQgPSAoc291cmNlRmlsZSBhcyBhbnkpLnBhdGggfHwgc291cmNlRmlsZS5maWxlTmFtZTtcbiAgICAgICAgdHMuZm9yRWFjaENoaWxkKHNvdXJjZUZpbGUsIHZpc2l0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGdldERlY2xhcmF0aW9ucyhmaWxlTmFtZTogc3RyaW5nKTogRGVjbGFyYXRpb25zIHtcbiAgICBjb25zdCByZXN1bHQ6IERlY2xhcmF0aW9ucyA9IFtdO1xuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSB0aGlzLmdldFNvdXJjZUZpbGUoZmlsZU5hbWUpO1xuICAgIGlmIChzb3VyY2VGaWxlKSB7XG4gICAgICBsZXQgdmlzaXQgPSAoY2hpbGQ6IHRzLk5vZGUpID0+IHtcbiAgICAgICAgbGV0IGRlY2xhcmF0aW9uID0gdGhpcy5nZXREZWNsYXJhdGlvbkZyb21Ob2RlKHNvdXJjZUZpbGUsIGNoaWxkKTtcbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goZGVjbGFyYXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRzLmZvckVhY2hDaGlsZChjaGlsZCwgdmlzaXQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdHMuZm9yRWFjaENoaWxkKHNvdXJjZUZpbGUsIHZpc2l0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGdldFNvdXJjZUZpbGUoZmlsZU5hbWU6IHN0cmluZyk6IHRzLlNvdXJjZUZpbGV8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy50c1NlcnZpY2UuZ2V0UHJvZ3JhbSgpLmdldFNvdXJjZUZpbGUoZmlsZU5hbWUpO1xuICB9XG5cbiAgdXBkYXRlQW5hbHl6ZWRNb2R1bGVzKCkge1xuICAgIHRoaXMudmFsaWRhdGUoKTtcbiAgICBpZiAodGhpcy5tb2R1bGVzT3V0T2ZEYXRlKSB7XG4gICAgICB0aGlzLmFuYWx5emVkTW9kdWxlcyA9IG51bGw7XG4gICAgICB0aGlzLl9yZWZsZWN0b3IgPSBudWxsO1xuICAgICAgdGhpcy50ZW1wbGF0ZVJlZmVyZW5jZXMgPSBudWxsO1xuICAgICAgdGhpcy5maWxlVG9Db21wb25lbnQgPSBudWxsO1xuICAgICAgdGhpcy5lbnN1cmVBbmFseXplZE1vZHVsZXMoKTtcbiAgICAgIHRoaXMubW9kdWxlc091dE9mRGF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHByb2dyYW0oKSB7IHJldHVybiB0aGlzLnRzU2VydmljZS5nZXRQcm9ncmFtKCk7IH1cblxuICBwcml2YXRlIGdldCBjaGVja2VyKCkge1xuICAgIGxldCBjaGVja2VyID0gdGhpcy5fY2hlY2tlcjtcbiAgICBpZiAoIWNoZWNrZXIpIHtcbiAgICAgIGNoZWNrZXIgPSB0aGlzLl9jaGVja2VyID0gdGhpcy5wcm9ncmFtLmdldFR5cGVDaGVja2VyKCk7XG4gICAgfVxuICAgIHJldHVybiBjaGVja2VyO1xuICB9XG5cbiAgcHJpdmF0ZSB2YWxpZGF0ZSgpIHtcbiAgICBjb25zdCBwcm9ncmFtID0gdGhpcy5wcm9ncmFtO1xuICAgIGlmICh0aGlzLmxhc3RQcm9ncmFtICE9PSBwcm9ncmFtKSB7XG4gICAgICAvLyBJbnZhbGlkYXRlIGZpbGUgdGhhdCBoYXZlIGNoYW5nZWQgaW4gdGhlIHN0YXRpYyBzeW1ib2wgcmVzb2x2ZXJcbiAgICAgIGNvbnN0IGludmFsaWRhdGVGaWxlID0gKGZpbGVOYW1lOiBzdHJpbmcpID0+XG4gICAgICAgICAgdGhpcy5fc3RhdGljU3ltYm9sUmVzb2x2ZXIuaW52YWxpZGF0ZUZpbGUoZmlsZU5hbWUpO1xuICAgICAgdGhpcy5jbGVhckNhY2hlcygpO1xuICAgICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgZm9yIChsZXQgc291cmNlRmlsZSBvZiB0aGlzLnByb2dyYW0uZ2V0U291cmNlRmlsZXMoKSkge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHNvdXJjZUZpbGUuZmlsZU5hbWU7XG4gICAgICAgIHNlZW4uYWRkKGZpbGVOYW1lKTtcbiAgICAgICAgY29uc3QgdmVyc2lvbiA9IHRoaXMuaG9zdC5nZXRTY3JpcHRWZXJzaW9uKGZpbGVOYW1lKTtcbiAgICAgICAgY29uc3QgbGFzdFZlcnNpb24gPSB0aGlzLmZpbGVWZXJzaW9ucy5nZXQoZmlsZU5hbWUpO1xuICAgICAgICBpZiAodmVyc2lvbiAhPSBsYXN0VmVyc2lvbikge1xuICAgICAgICAgIHRoaXMuZmlsZVZlcnNpb25zLnNldChmaWxlTmFtZSwgdmVyc2lvbik7XG4gICAgICAgICAgaWYgKHRoaXMuX3N0YXRpY1N5bWJvbFJlc29sdmVyKSB7XG4gICAgICAgICAgICBpbnZhbGlkYXRlRmlsZShmaWxlTmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZSBmaWxlIHZlcnNpb25zIHRoYXQgYXJlIG5vIGxvbmdlciBpbiB0aGUgZmlsZSBhbmQgaW52YWxpZGF0ZSB0aGVtLlxuICAgICAgY29uc3QgbWlzc2luZyA9IEFycmF5LmZyb20odGhpcy5maWxlVmVyc2lvbnMua2V5cygpKS5maWx0ZXIoZiA9PiAhc2Vlbi5oYXMoZikpO1xuICAgICAgbWlzc2luZy5mb3JFYWNoKGYgPT4gdGhpcy5maWxlVmVyc2lvbnMuZGVsZXRlKGYpKTtcbiAgICAgIGlmICh0aGlzLl9zdGF0aWNTeW1ib2xSZXNvbHZlcikge1xuICAgICAgICBtaXNzaW5nLmZvckVhY2goaW52YWxpZGF0ZUZpbGUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxhc3RQcm9ncmFtID0gcHJvZ3JhbTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNsZWFyQ2FjaGVzKCkge1xuICAgIHRoaXMuX2NoZWNrZXIgPSBudWxsO1xuICAgIHRoaXMuX3R5cGVDYWNoZSA9IFtdO1xuICAgIHRoaXMuX3Jlc29sdmVyID0gbnVsbDtcbiAgICB0aGlzLmNvbGxlY3RlZEVycm9ycyA9IG51bGw7XG4gICAgdGhpcy5tb2R1bGVzT3V0T2ZEYXRlID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgZW5zdXJlVGVtcGxhdGVNYXAoKSB7XG4gICAgaWYgKCF0aGlzLmZpbGVUb0NvbXBvbmVudCB8fCAhdGhpcy50ZW1wbGF0ZVJlZmVyZW5jZXMpIHtcbiAgICAgIGNvbnN0IGZpbGVUb0NvbXBvbmVudCA9IG5ldyBNYXA8c3RyaW5nLCBTdGF0aWNTeW1ib2w+KCk7XG4gICAgICBjb25zdCB0ZW1wbGF0ZVJlZmVyZW5jZTogc3RyaW5nW10gPSBbXTtcbiAgICAgIGNvbnN0IG5nTW9kdWxlU3VtbWFyeSA9IHRoaXMuZ2V0QW5hbHl6ZWRNb2R1bGVzKCk7XG4gICAgICBjb25zdCB1cmxSZXNvbHZlciA9IGNyZWF0ZU9mZmxpbmVDb21waWxlVXJsUmVzb2x2ZXIoKTtcbiAgICAgIGZvciAoY29uc3QgbW9kdWxlIG9mIG5nTW9kdWxlU3VtbWFyeS5uZ01vZHVsZXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBkaXJlY3RpdmUgb2YgbW9kdWxlLmRlY2xhcmVkRGlyZWN0aXZlcykge1xuICAgICAgICAgIGNvbnN0IHttZXRhZGF0YX0gPSB0aGlzLnJlc29sdmVyLmdldE5vbk5vcm1hbGl6ZWREaXJlY3RpdmVNZXRhZGF0YShkaXJlY3RpdmUucmVmZXJlbmNlKSAhO1xuICAgICAgICAgIGlmIChtZXRhZGF0YS5pc0NvbXBvbmVudCAmJiBtZXRhZGF0YS50ZW1wbGF0ZSAmJiBtZXRhZGF0YS50ZW1wbGF0ZS50ZW1wbGF0ZVVybCkge1xuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGVOYW1lID0gdXJsUmVzb2x2ZXIucmVzb2x2ZShcbiAgICAgICAgICAgICAgICB0aGlzLnJlZmxlY3Rvci5jb21wb25lbnRNb2R1bGVVcmwoZGlyZWN0aXZlLnJlZmVyZW5jZSksXG4gICAgICAgICAgICAgICAgbWV0YWRhdGEudGVtcGxhdGUudGVtcGxhdGVVcmwpO1xuICAgICAgICAgICAgZmlsZVRvQ29tcG9uZW50LnNldCh0ZW1wbGF0ZU5hbWUsIGRpcmVjdGl2ZS5yZWZlcmVuY2UpO1xuICAgICAgICAgICAgdGVtcGxhdGVSZWZlcmVuY2UucHVzaCh0ZW1wbGF0ZU5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5maWxlVG9Db21wb25lbnQgPSBmaWxlVG9Db21wb25lbnQ7XG4gICAgICB0aGlzLnRlbXBsYXRlUmVmZXJlbmNlcyA9IHRlbXBsYXRlUmVmZXJlbmNlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0U291cmNlRnJvbURlY2xhcmF0aW9uKFxuICAgICAgZmlsZU5hbWU6IHN0cmluZywgdmVyc2lvbjogc3RyaW5nLCBzb3VyY2U6IHN0cmluZywgc3BhbjogU3BhbiwgdHlwZTogU3RhdGljU3ltYm9sLFxuICAgICAgZGVjbGFyYXRpb246IHRzLkNsYXNzRGVjbGFyYXRpb24sIG5vZGU6IHRzLk5vZGUsIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiBUZW1wbGF0ZVNvdXJjZVxuICAgICAgfHVuZGVmaW5lZCB7XG4gICAgbGV0IHF1ZXJ5Q2FjaGU6IFN5bWJvbFF1ZXJ5fHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCB0ID0gdGhpcztcbiAgICBpZiAoZGVjbGFyYXRpb24pIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZlcnNpb24sXG4gICAgICAgIHNvdXJjZSxcbiAgICAgICAgc3BhbixcbiAgICAgICAgdHlwZSxcbiAgICAgICAgZ2V0IG1lbWJlcnMoKSB7XG4gICAgICAgICAgcmV0dXJuIGdldENsYXNzTWVtYmVyc0Zyb21EZWNsYXJhdGlvbih0LnByb2dyYW0sIHQuY2hlY2tlciwgc291cmNlRmlsZSwgZGVjbGFyYXRpb24pO1xuICAgICAgICB9LFxuICAgICAgICBnZXQgcXVlcnkoKSB7XG4gICAgICAgICAgaWYgKCFxdWVyeUNhY2hlKSB7XG4gICAgICAgICAgICBjb25zdCBwaXBlcyA9IHQuc2VydmljZS5nZXRQaXBlc0F0KGZpbGVOYW1lLCBub2RlLmdldFN0YXJ0KCkpO1xuICAgICAgICAgICAgcXVlcnlDYWNoZSA9IGdldFN5bWJvbFF1ZXJ5KFxuICAgICAgICAgICAgICAgIHQucHJvZ3JhbSwgdC5jaGVja2VyLCBzb3VyY2VGaWxlLFxuICAgICAgICAgICAgICAgICgpID0+IGdldFBpcGVzVGFibGUoc291cmNlRmlsZSwgdC5wcm9ncmFtLCB0LmNoZWNrZXIsIHBpcGVzKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBxdWVyeUNhY2hlO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0U291cmNlRnJvbU5vZGUoZmlsZU5hbWU6IHN0cmluZywgdmVyc2lvbjogc3RyaW5nLCBub2RlOiB0cy5Ob2RlKTogVGVtcGxhdGVTb3VyY2VcbiAgICAgIHx1bmRlZmluZWQge1xuICAgIGxldCByZXN1bHQ6IFRlbXBsYXRlU291cmNlfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCB0ID0gdGhpcztcbiAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk5vU3Vic3RpdHV0aW9uVGVtcGxhdGVMaXRlcmFsOlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgIGxldCBbZGVjbGFyYXRpb24sIGRlY29yYXRvcl0gPSB0aGlzLmdldFRlbXBsYXRlQ2xhc3NEZWNsRnJvbU5vZGUobm9kZSk7XG4gICAgICAgIGlmIChkZWNsYXJhdGlvbiAmJiBkZWNsYXJhdGlvbi5uYW1lKSB7XG4gICAgICAgICAgY29uc3Qgc291cmNlRmlsZSA9IHRoaXMuZ2V0U291cmNlRmlsZShmaWxlTmFtZSk7XG4gICAgICAgICAgaWYgKHNvdXJjZUZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFNvdXJjZUZyb21EZWNsYXJhdGlvbihcbiAgICAgICAgICAgICAgICBmaWxlTmFtZSwgdmVyc2lvbiwgdGhpcy5zdHJpbmdPZihub2RlKSB8fCAnJywgc2hyaW5rKHNwYW5PZihub2RlKSksXG4gICAgICAgICAgICAgICAgdGhpcy5yZWZsZWN0b3IuZ2V0U3RhdGljU3ltYm9sKHNvdXJjZUZpbGUuZmlsZU5hbWUsIGRlY2xhcmF0aW9uLm5hbWUudGV4dCksXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb24sIG5vZGUsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U291cmNlRnJvbVR5cGUoZmlsZU5hbWU6IHN0cmluZywgdmVyc2lvbjogc3RyaW5nLCB0eXBlOiBTdGF0aWNTeW1ib2wpOiBUZW1wbGF0ZVNvdXJjZVxuICAgICAgfHVuZGVmaW5lZCB7XG4gICAgbGV0IHJlc3VsdDogVGVtcGxhdGVTb3VyY2V8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGRlY2xhcmF0aW9uID0gdGhpcy5nZXRUZW1wbGF0ZUNsYXNzRnJvbVN0YXRpY1N5bWJvbCh0eXBlKTtcbiAgICBpZiAoZGVjbGFyYXRpb24pIHtcbiAgICAgIGNvbnN0IHNuYXBzaG90ID0gdGhpcy5ob3N0LmdldFNjcmlwdFNuYXBzaG90KGZpbGVOYW1lKTtcbiAgICAgIGlmIChzbmFwc2hvdCkge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBzbmFwc2hvdC5nZXRUZXh0KDAsIHNuYXBzaG90LmdldExlbmd0aCgpKTtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5nZXRTb3VyY2VGcm9tRGVjbGFyYXRpb24oXG4gICAgICAgICAgICBmaWxlTmFtZSwgdmVyc2lvbiwgc291cmNlLCB7c3RhcnQ6IDAsIGVuZDogc291cmNlLmxlbmd0aH0sIHR5cGUsIGRlY2xhcmF0aW9uLFxuICAgICAgICAgICAgZGVjbGFyYXRpb24sIGRlY2xhcmF0aW9uLmdldFNvdXJjZUZpbGUoKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIGdldCByZWZsZWN0b3JIb3N0KCk6IFJlZmxlY3Rvckhvc3Qge1xuICAgIGxldCByZXN1bHQgPSB0aGlzLl9yZWZsZWN0b3JIb3N0O1xuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICBpZiAoIXRoaXMuY29udGV4dCkge1xuICAgICAgICAvLyBNYWtlIHVwIGEgY29udGV4dCBieSBmaW5kaW5nIHRoZSBmaXJzdCBzY3JpcHQgYW5kIHVzaW5nIHRoYXQgYXMgdGhlIGJhc2UgZGlyLlxuICAgICAgICBjb25zdCBzY3JpcHRGaWxlTmFtZXMgPSB0aGlzLmhvc3QuZ2V0U2NyaXB0RmlsZU5hbWVzKCk7XG4gICAgICAgIGlmICgwID09PSBzY3JpcHRGaWxlTmFtZXMubGVuZ3RoKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnRlcm5hbCBlcnJvcjogbm8gc2NyaXB0IGZpbGUgbmFtZXMgZm91bmQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRleHQgPSBzY3JpcHRGaWxlTmFtZXNbMF07XG4gICAgICB9XG5cbiAgICAgIC8vIFVzZSB0aGUgZmlsZSBjb250ZXh0J3MgZGlyZWN0b3J5IGFzIHRoZSBiYXNlIGRpcmVjdG9yeS5cbiAgICAgIC8vIFRoZSBob3N0J3MgZ2V0Q3VycmVudERpcmVjdG9yeSgpIGlzIG5vdCByZWxpYWJsZSBhcyBpdCBpcyBhbHdheXMgXCJcIiBpblxuICAgICAgLy8gdHNzZXJ2ZXIuIFdlIGRvbid0IG5lZWQgdGhlIGV4YWN0IGJhc2UgZGlyZWN0b3J5LCBqdXN0IG9uZSB0aGF0IGNvbnRhaW5zXG4gICAgICAvLyBhIHNvdXJjZSBmaWxlLlxuICAgICAgY29uc3Qgc291cmNlID0gdGhpcy50c1NlcnZpY2UuZ2V0UHJvZ3JhbSgpLmdldFNvdXJjZUZpbGUodGhpcy5jb250ZXh0KTtcbiAgICAgIGlmICghc291cmNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW50ZXJuYWwgZXJyb3I6IG5vIGNvbnRleHQgY291bGQgYmUgZGV0ZXJtaW5lZCcpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0c0NvbmZpZ1BhdGggPSBmaW5kVHNDb25maWcoc291cmNlLmZpbGVOYW1lKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gcGF0aC5kaXJuYW1lKHRzQ29uZmlnUGF0aCB8fCB0aGlzLmNvbnRleHQpO1xuICAgICAgY29uc3Qgb3B0aW9uczogQ29tcGlsZXJPcHRpb25zID0ge2Jhc2VQYXRoLCBnZW5EaXI6IGJhc2VQYXRofTtcbiAgICAgIGNvbnN0IGNvbXBpbGVyT3B0aW9ucyA9IHRoaXMuaG9zdC5nZXRDb21waWxhdGlvblNldHRpbmdzKCk7XG4gICAgICBpZiAoY29tcGlsZXJPcHRpb25zICYmIGNvbXBpbGVyT3B0aW9ucy5iYXNlVXJsKSB7XG4gICAgICAgIG9wdGlvbnMuYmFzZVVybCA9IGNvbXBpbGVyT3B0aW9ucy5iYXNlVXJsO1xuICAgICAgfVxuICAgICAgaWYgKGNvbXBpbGVyT3B0aW9ucyAmJiBjb21waWxlck9wdGlvbnMucGF0aHMpIHtcbiAgICAgICAgb3B0aW9ucy5wYXRocyA9IGNvbXBpbGVyT3B0aW9ucy5wYXRocztcbiAgICAgIH1cbiAgICAgIHJlc3VsdCA9IHRoaXMuX3JlZmxlY3Rvckhvc3QgPVxuICAgICAgICAgIG5ldyBSZWZsZWN0b3JIb3N0KCgpID0+IHRoaXMudHNTZXJ2aWNlLmdldFByb2dyYW0oKSwgdGhpcy5ob3N0LCBvcHRpb25zKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgY29sbGVjdEVycm9yKGVycm9yOiBhbnksIGZpbGVQYXRoOiBzdHJpbmd8bnVsbCkge1xuICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgbGV0IGVycm9yTWFwID0gdGhpcy5jb2xsZWN0ZWRFcnJvcnM7XG4gICAgICBpZiAoIWVycm9yTWFwIHx8ICF0aGlzLmNvbGxlY3RlZEVycm9ycykge1xuICAgICAgICBlcnJvck1hcCA9IHRoaXMuY29sbGVjdGVkRXJyb3JzID0gbmV3IE1hcCgpO1xuICAgICAgfVxuICAgICAgbGV0IGVycm9ycyA9IGVycm9yTWFwLmdldChmaWxlUGF0aCk7XG4gICAgICBpZiAoIWVycm9ycykge1xuICAgICAgICBlcnJvcnMgPSBbXTtcbiAgICAgICAgdGhpcy5jb2xsZWN0ZWRFcnJvcnMuc2V0KGZpbGVQYXRoLCBlcnJvcnMpO1xuICAgICAgfVxuICAgICAgZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHN0YXRpY1N5bWJvbFJlc29sdmVyKCk6IFN0YXRpY1N5bWJvbFJlc29sdmVyIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5fc3RhdGljU3ltYm9sUmVzb2x2ZXI7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHRoaXMuX3N1bW1hcnlSZXNvbHZlciA9IG5ldyBBb3RTdW1tYXJ5UmVzb2x2ZXIoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbG9hZFN1bW1hcnkoZmlsZVBhdGg6IHN0cmluZykgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgICAgIGlzU291cmNlRmlsZShzb3VyY2VGaWxlUGF0aDogc3RyaW5nKSB7IHJldHVybiB0cnVlOyB9LFxuICAgICAgICAgICAgdG9TdW1tYXJ5RmlsZU5hbWUoc291cmNlRmlsZVBhdGg6IHN0cmluZykgeyByZXR1cm4gc291cmNlRmlsZVBhdGg7IH0sXG4gICAgICAgICAgICBmcm9tU3VtbWFyeUZpbGVOYW1lKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmd7cmV0dXJuIGZpbGVQYXRoO30sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0aGlzLl9zdGF0aWNTeW1ib2xDYWNoZSk7XG4gICAgICByZXN1bHQgPSB0aGlzLl9zdGF0aWNTeW1ib2xSZXNvbHZlciA9IG5ldyBTdGF0aWNTeW1ib2xSZXNvbHZlcihcbiAgICAgICAgICB0aGlzLnJlZmxlY3Rvckhvc3QgYXMgYW55LCB0aGlzLl9zdGF0aWNTeW1ib2xDYWNoZSwgdGhpcy5fc3VtbWFyeVJlc29sdmVyLFxuICAgICAgICAgIChlLCBmaWxlUGF0aCkgPT4gdGhpcy5jb2xsZWN0RXJyb3IoZSwgZmlsZVBhdGggISkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgcmVmbGVjdG9yKCk6IFN0YXRpY1JlZmxlY3RvciB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuX3JlZmxlY3RvcjtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgY29uc3Qgc3NyID0gdGhpcy5zdGF0aWNTeW1ib2xSZXNvbHZlcjtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX3JlZmxlY3RvciA9IG5ldyBTdGF0aWNSZWZsZWN0b3IoXG4gICAgICAgICAgdGhpcy5fc3VtbWFyeVJlc29sdmVyLCBzc3IsIFtdLCBbXSwgKGUsIGZpbGVQYXRoKSA9PiB0aGlzLmNvbGxlY3RFcnJvcihlLCBmaWxlUGF0aCAhKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIGdldFRlbXBsYXRlQ2xhc3NGcm9tU3RhdGljU3ltYm9sKHR5cGU6IFN0YXRpY1N5bWJvbCk6IHRzLkNsYXNzRGVjbGFyYXRpb258dW5kZWZpbmVkIHtcbiAgICBjb25zdCBzb3VyY2UgPSB0aGlzLmdldFNvdXJjZUZpbGUodHlwZS5maWxlUGF0aCk7XG4gICAgaWYgKHNvdXJjZSkge1xuICAgICAgY29uc3QgZGVjbGFyYXRpb25Ob2RlID0gdHMuZm9yRWFjaENoaWxkKHNvdXJjZSwgY2hpbGQgPT4ge1xuICAgICAgICBpZiAoY2hpbGQua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgY29uc3QgY2xhc3NEZWNsYXJhdGlvbiA9IGNoaWxkIGFzIHRzLkNsYXNzRGVjbGFyYXRpb247XG4gICAgICAgICAgaWYgKGNsYXNzRGVjbGFyYXRpb24ubmFtZSAhPSBudWxsICYmIGNsYXNzRGVjbGFyYXRpb24ubmFtZS50ZXh0ID09PSB0eXBlLm5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGFzc0RlY2xhcmF0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGVjbGFyYXRpb25Ob2RlIGFzIHRzLkNsYXNzRGVjbGFyYXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIG1pc3NpbmdUZW1wbGF0ZTogW3RzLkNsYXNzRGVjbGFyYXRpb24gfCB1bmRlZmluZWQsIHRzLkV4cHJlc3Npb258dW5kZWZpbmVkXSA9XG4gICAgICBbdW5kZWZpbmVkLCB1bmRlZmluZWRdO1xuXG4gIC8qKlxuICAgKiBHaXZlbiBhIHRlbXBsYXRlIHN0cmluZyBub2RlLCBzZWUgaWYgaXQgaXMgYW4gQW5ndWxhciB0ZW1wbGF0ZSBzdHJpbmcsIGFuZCBpZiBzbyByZXR1cm4gdGhlXG4gICAqIGNvbnRhaW5pbmcgY2xhc3MuXG4gICAqL1xuICBwcml2YXRlIGdldFRlbXBsYXRlQ2xhc3NEZWNsRnJvbU5vZGUoY3VycmVudFRva2VuOiB0cy5Ob2RlKTpcbiAgICAgIFt0cy5DbGFzc0RlY2xhcmF0aW9uIHwgdW5kZWZpbmVkLCB0cy5FeHByZXNzaW9ufHVuZGVmaW5lZF0ge1xuICAgIC8vIFZlcmlmeSB3ZSBhcmUgaW4gYSAndGVtcGxhdGUnIHByb3BlcnR5IGFzc2lnbm1lbnQsIGluIGFuIG9iamVjdCBsaXRlcmFsLCB3aGljaCBpcyBhbiBjYWxsXG4gICAgLy8gYXJnLCBpbiBhIGRlY29yYXRvclxuICAgIGxldCBwYXJlbnROb2RlID0gY3VycmVudFRva2VuLnBhcmVudDsgIC8vIFByb3BlcnR5QXNzaWdubWVudFxuICAgIGlmICghcGFyZW50Tm9kZSkge1xuICAgICAgcmV0dXJuIFR5cGVTY3JpcHRTZXJ2aWNlSG9zdC5taXNzaW5nVGVtcGxhdGU7XG4gICAgfVxuICAgIGlmIChwYXJlbnROb2RlLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlBc3NpZ25tZW50KSB7XG4gICAgICByZXR1cm4gVHlwZVNjcmlwdFNlcnZpY2VIb3N0Lm1pc3NpbmdUZW1wbGF0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETzogSXMgdGhpcyBkaWZmZXJlbnQgZm9yIGEgbGl0ZXJhbCwgaS5lLiBhIHF1b3RlZCBwcm9wZXJ0eSBuYW1lIGxpa2UgXCJ0ZW1wbGF0ZVwiP1xuICAgICAgaWYgKChwYXJlbnROb2RlIGFzIGFueSkubmFtZS50ZXh0ICE9PSAndGVtcGxhdGUnKSB7XG4gICAgICAgIHJldHVybiBUeXBlU2NyaXB0U2VydmljZUhvc3QubWlzc2luZ1RlbXBsYXRlO1xuICAgICAgfVxuICAgIH1cbiAgICBwYXJlbnROb2RlID0gcGFyZW50Tm9kZS5wYXJlbnQ7ICAvLyBPYmplY3RMaXRlcmFsRXhwcmVzc2lvblxuICAgIGlmICghcGFyZW50Tm9kZSB8fCBwYXJlbnROb2RlLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24pIHtcbiAgICAgIHJldHVybiBUeXBlU2NyaXB0U2VydmljZUhvc3QubWlzc2luZ1RlbXBsYXRlO1xuICAgIH1cblxuICAgIHBhcmVudE5vZGUgPSBwYXJlbnROb2RlLnBhcmVudDsgIC8vIENhbGxFeHByZXNzaW9uXG4gICAgaWYgKCFwYXJlbnROb2RlIHx8IHBhcmVudE5vZGUua2luZCAhPT0gdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbikge1xuICAgICAgcmV0dXJuIFR5cGVTY3JpcHRTZXJ2aWNlSG9zdC5taXNzaW5nVGVtcGxhdGU7XG4gICAgfVxuICAgIGNvbnN0IGNhbGxUYXJnZXQgPSAoPHRzLkNhbGxFeHByZXNzaW9uPnBhcmVudE5vZGUpLmV4cHJlc3Npb247XG5cbiAgICBsZXQgZGVjb3JhdG9yID0gcGFyZW50Tm9kZS5wYXJlbnQ7ICAvLyBEZWNvcmF0b3JcbiAgICBpZiAoIWRlY29yYXRvciB8fCBkZWNvcmF0b3Iua2luZCAhPT0gdHMuU3ludGF4S2luZC5EZWNvcmF0b3IpIHtcbiAgICAgIHJldHVybiBUeXBlU2NyaXB0U2VydmljZUhvc3QubWlzc2luZ1RlbXBsYXRlO1xuICAgIH1cblxuICAgIGxldCBkZWNsYXJhdGlvbiA9IDx0cy5DbGFzc0RlY2xhcmF0aW9uPmRlY29yYXRvci5wYXJlbnQ7ICAvLyBDbGFzc0RlY2xhcmF0aW9uXG4gICAgaWYgKCFkZWNsYXJhdGlvbiB8fCBkZWNsYXJhdGlvbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICAgIHJldHVybiBUeXBlU2NyaXB0U2VydmljZUhvc3QubWlzc2luZ1RlbXBsYXRlO1xuICAgIH1cbiAgICByZXR1cm4gW2RlY2xhcmF0aW9uLCBjYWxsVGFyZ2V0XTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0Q29sbGVjdGVkRXJyb3JzKGRlZmF1bHRTcGFuOiBTcGFuLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogRGVjbGFyYXRpb25FcnJvcltdIHtcbiAgICBjb25zdCBlcnJvcnMgPSAodGhpcy5jb2xsZWN0ZWRFcnJvcnMgJiYgdGhpcy5jb2xsZWN0ZWRFcnJvcnMuZ2V0KHNvdXJjZUZpbGUuZmlsZU5hbWUpKTtcbiAgICByZXR1cm4gKGVycm9ycyAmJiBlcnJvcnMubWFwKChlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICBjb25zdCBsaW5lID0gZS5saW5lIHx8IChlLnBvc2l0aW9uICYmIGUucG9zaXRpb24ubGluZSk7XG4gICAgICAgICAgICAgY29uc3QgY29sdW1uID0gZS5jb2x1bW4gfHwgKGUucG9zaXRpb24gJiYgZS5wb3NpdGlvbi5jb2x1bW4pO1xuICAgICAgICAgICAgIGNvbnN0IHNwYW4gPSBzcGFuQXQoc291cmNlRmlsZSwgbGluZSwgY29sdW1uKSB8fCBkZWZhdWx0U3BhbjtcbiAgICAgICAgICAgICBpZiAoaXNGb3JtYXR0ZWRFcnJvcihlKSkge1xuICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yVG9EaWFnbm9zdGljV2l0aENoYWluKGUsIHNwYW4pO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICByZXR1cm4ge21lc3NhZ2U6IGUubWVzc2FnZSwgc3Bhbn07XG4gICAgICAgICAgIH0pKSB8fFxuICAgICAgICBbXTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RGVjbGFyYXRpb25Gcm9tTm9kZShzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBub2RlOiB0cy5Ob2RlKTogRGVjbGFyYXRpb258dW5kZWZpbmVkIHtcbiAgICBpZiAobm9kZS5raW5kID09IHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbiAmJiBub2RlLmRlY29yYXRvcnMgJiZcbiAgICAgICAgKG5vZGUgYXMgdHMuQ2xhc3NEZWNsYXJhdGlvbikubmFtZSkge1xuICAgICAgZm9yIChjb25zdCBkZWNvcmF0b3Igb2Ygbm9kZS5kZWNvcmF0b3JzKSB7XG4gICAgICAgIGlmIChkZWNvcmF0b3IuZXhwcmVzc2lvbiAmJiBkZWNvcmF0b3IuZXhwcmVzc2lvbi5raW5kID09IHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb24pIHtcbiAgICAgICAgICBjb25zdCBjbGFzc0RlY2xhcmF0aW9uID0gbm9kZSBhcyB0cy5DbGFzc0RlY2xhcmF0aW9uO1xuICAgICAgICAgIGlmIChjbGFzc0RlY2xhcmF0aW9uLm5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGwgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbiBhcyB0cy5DYWxsRXhwcmVzc2lvbjtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGNhbGwuZXhwcmVzc2lvbjtcbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLmNoZWNrZXIuZ2V0VHlwZUF0TG9jYXRpb24odGFyZ2V0KTtcbiAgICAgICAgICAgIGlmICh0eXBlKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHN0YXRpY1N5bWJvbCA9XG4gICAgICAgICAgICAgICAgICB0aGlzLnJlZmxlY3Rvci5nZXRTdGF0aWNTeW1ib2woc291cmNlRmlsZS5maWxlTmFtZSwgY2xhc3NEZWNsYXJhdGlvbi5uYW1lLnRleHQpO1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlc29sdmVyLmlzRGlyZWN0aXZlKHN0YXRpY1N5bWJvbCBhcyBhbnkpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCB7bWV0YWRhdGF9ID1cbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29sdmVyLmdldE5vbk5vcm1hbGl6ZWREaXJlY3RpdmVNZXRhZGF0YShzdGF0aWNTeW1ib2wgYXMgYW55KSAhO1xuICAgICAgICAgICAgICAgICAgY29uc3QgZGVjbGFyYXRpb25TcGFuID0gc3Bhbk9mKHRhcmdldCk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBzdGF0aWNTeW1ib2wsXG4gICAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uU3BhbixcbiAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yczogdGhpcy5nZXRDb2xsZWN0ZWRFcnJvcnMoZGVjbGFyYXRpb25TcGFuLCBzb3VyY2VGaWxlKVxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZS5tZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RFcnJvcihlLCBzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGRlY2xhcmF0aW9uU3BhbiA9IHNwYW5PZih0YXJnZXQpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogc3RhdGljU3ltYm9sLFxuICAgICAgICAgICAgICAgICAgICBkZWNsYXJhdGlvblNwYW4sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yczogdGhpcy5nZXRDb2xsZWN0ZWRFcnJvcnMoZGVjbGFyYXRpb25TcGFuLCBzb3VyY2VGaWxlKVxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHN0cmluZ09mKG5vZGU6IHRzLk5vZGUpOiBzdHJpbmd8dW5kZWZpbmVkIHtcbiAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk5vU3Vic3RpdHV0aW9uVGVtcGxhdGVMaXRlcmFsOlxuICAgICAgICByZXR1cm4gKDx0cy5MaXRlcmFsRXhwcmVzc2lvbj5ub2RlKS50ZXh0O1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgIHJldHVybiAoPHRzLlN0cmluZ0xpdGVyYWw+bm9kZSkudGV4dDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGZpbmROb2RlKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHBvc2l0aW9uOiBudW1iZXIpOiB0cy5Ob2RlfHVuZGVmaW5lZCB7XG4gICAgZnVuY3Rpb24gZmluZChub2RlOiB0cy5Ob2RlKTogdHMuTm9kZXx1bmRlZmluZWQge1xuICAgICAgaWYgKHBvc2l0aW9uID49IG5vZGUuZ2V0U3RhcnQoKSAmJiBwb3NpdGlvbiA8IG5vZGUuZ2V0RW5kKCkpIHtcbiAgICAgICAgcmV0dXJuIHRzLmZvckVhY2hDaGlsZChub2RlLCBmaW5kKSB8fCBub2RlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmaW5kKHNvdXJjZUZpbGUpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gZmluZFRzQ29uZmlnKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmd8dW5kZWZpbmVkIHtcbiAgbGV0IGRpciA9IHBhdGguZGlybmFtZShmaWxlTmFtZSk7XG4gIHdoaWxlIChmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICBjb25zdCBjYW5kaWRhdGUgPSBwYXRoLmpvaW4oZGlyLCAndHNjb25maWcuanNvbicpO1xuICAgIGlmIChmcy5leGlzdHNTeW5jKGNhbmRpZGF0ZSkpIHJldHVybiBjYW5kaWRhdGU7XG4gICAgY29uc3QgcGFyZW50RGlyID0gcGF0aC5kaXJuYW1lKGRpcik7XG4gICAgaWYgKHBhcmVudERpciA9PT0gZGlyKSBicmVhaztcbiAgICBkaXIgPSBwYXJlbnREaXI7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3Bhbk9mKG5vZGU6IHRzLk5vZGUpOiBTcGFuIHtcbiAgcmV0dXJuIHtzdGFydDogbm9kZS5nZXRTdGFydCgpLCBlbmQ6IG5vZGUuZ2V0RW5kKCl9O1xufVxuXG5mdW5jdGlvbiBzaHJpbmsoc3BhbjogU3Bhbiwgb2Zmc2V0PzogbnVtYmVyKSB7XG4gIGlmIChvZmZzZXQgPT0gbnVsbCkgb2Zmc2V0ID0gMTtcbiAgcmV0dXJuIHtzdGFydDogc3Bhbi5zdGFydCArIG9mZnNldCwgZW5kOiBzcGFuLmVuZCAtIG9mZnNldH07XG59XG5cbmZ1bmN0aW9uIHNwYW5BdChzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBsaW5lOiBudW1iZXIsIGNvbHVtbjogbnVtYmVyKTogU3Bhbnx1bmRlZmluZWQge1xuICBpZiAobGluZSAhPSBudWxsICYmIGNvbHVtbiAhPSBudWxsKSB7XG4gICAgY29uc3QgcG9zaXRpb24gPSB0cy5nZXRQb3NpdGlvbk9mTGluZUFuZENoYXJhY3Rlcihzb3VyY2VGaWxlLCBsaW5lLCBjb2x1bW4pO1xuICAgIGNvbnN0IGZpbmRDaGlsZCA9IGZ1bmN0aW9uIGZpbmRDaGlsZChub2RlOiB0cy5Ob2RlKTogdHMuTm9kZSB8IHVuZGVmaW5lZCB7XG4gICAgICBpZiAobm9kZS5raW5kID4gdHMuU3ludGF4S2luZC5MYXN0VG9rZW4gJiYgbm9kZS5wb3MgPD0gcG9zaXRpb24gJiYgbm9kZS5lbmQgPiBwb3NpdGlvbikge1xuICAgICAgICBjb25zdCBiZXR0ZXJOb2RlID0gdHMuZm9yRWFjaENoaWxkKG5vZGUsIGZpbmRDaGlsZCk7XG4gICAgICAgIHJldHVybiBiZXR0ZXJOb2RlIHx8IG5vZGU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG5vZGUgPSB0cy5mb3JFYWNoQ2hpbGQoc291cmNlRmlsZSwgZmluZENoaWxkKTtcbiAgICBpZiAobm9kZSkge1xuICAgICAgcmV0dXJuIHtzdGFydDogbm9kZS5nZXRTdGFydCgpLCBlbmQ6IG5vZGUuZ2V0RW5kKCl9O1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjaGFpbmVkTWVzc2FnZShjaGFpbjogRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiwgaW5kZW50ID0gJycpOiBzdHJpbmcge1xuICByZXR1cm4gaW5kZW50ICsgY2hhaW4ubWVzc2FnZSArIChjaGFpbi5uZXh0ID8gY2hhaW5lZE1lc3NhZ2UoY2hhaW4ubmV4dCwgaW5kZW50ICsgJyAgJykgOiAnJyk7XG59XG5cbmNsYXNzIERpYWdub3N0aWNNZXNzYWdlQ2hhaW5JbXBsIGltcGxlbWVudHMgRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBtZXNzYWdlOiBzdHJpbmcsIHB1YmxpYyBuZXh0PzogRGlhZ25vc3RpY01lc3NhZ2VDaGFpbikge31cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGNoYWluZWRNZXNzYWdlKHRoaXMpOyB9XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRDaGFpbihjaGFpbjogRm9ybWF0dGVkTWVzc2FnZUNoYWluKTogRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiB7XG4gIHJldHVybiB7bWVzc2FnZTogY2hhaW4ubWVzc2FnZSwgbmV4dDogY2hhaW4ubmV4dCA/IGNvbnZlcnRDaGFpbihjaGFpbi5uZXh0KSA6IHVuZGVmaW5lZH07XG59XG5cbmZ1bmN0aW9uIGVycm9yVG9EaWFnbm9zdGljV2l0aENoYWluKGVycm9yOiBGb3JtYXR0ZWRFcnJvciwgc3BhbjogU3Bhbik6IERlY2xhcmF0aW9uRXJyb3Ige1xuICByZXR1cm4ge21lc3NhZ2U6IGVycm9yLmNoYWluID8gY29udmVydENoYWluKGVycm9yLmNoYWluKSA6IGVycm9yLm1lc3NhZ2UsIHNwYW59O1xufVxuIl19