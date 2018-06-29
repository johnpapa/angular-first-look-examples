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
        define("@angular/language-service/src/language_service", ["require", "exports", "tslib", "@angular/compiler", "@angular/language-service/src/completions", "@angular/language-service/src/definitions", "@angular/language-service/src/diagnostics", "@angular/language-service/src/hover", "@angular/language-service/src/types"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var completions_1 = require("@angular/language-service/src/completions");
    var definitions_1 = require("@angular/language-service/src/definitions");
    var diagnostics_1 = require("@angular/language-service/src/diagnostics");
    var hover_1 = require("@angular/language-service/src/hover");
    var types_1 = require("@angular/language-service/src/types");
    /**
     * Create an instance of an Angular `LanguageService`.
     *
     * @experimental
     */
    function createLanguageService(host) {
        return new LanguageServiceImpl(host);
    }
    exports.createLanguageService = createLanguageService;
    var LanguageServiceImpl = /** @class */ (function () {
        function LanguageServiceImpl(host) {
            this.host = host;
        }
        Object.defineProperty(LanguageServiceImpl.prototype, "metadataResolver", {
            get: function () { return this.host.resolver; },
            enumerable: true,
            configurable: true
        });
        LanguageServiceImpl.prototype.getTemplateReferences = function () { return this.host.getTemplateReferences(); };
        LanguageServiceImpl.prototype.getDiagnostics = function (fileName) {
            var results = [];
            var templates = this.host.getTemplates(fileName);
            if (templates && templates.length) {
                results.push.apply(results, tslib_1.__spread(diagnostics_1.getTemplateDiagnostics(fileName, this, templates)));
            }
            var declarations = this.host.getDeclarations(fileName);
            if (declarations && declarations.length) {
                var summary = this.host.getAnalyzedModules();
                results.push.apply(results, tslib_1.__spread(diagnostics_1.getDeclarationDiagnostics(declarations, summary)));
            }
            return uniqueBySpan(results);
        };
        LanguageServiceImpl.prototype.getPipesAt = function (fileName, position) {
            var templateInfo = this.getTemplateAstAtPosition(fileName, position);
            if (templateInfo) {
                return templateInfo.pipes;
            }
            return [];
        };
        LanguageServiceImpl.prototype.getCompletionsAt = function (fileName, position) {
            var templateInfo = this.getTemplateAstAtPosition(fileName, position);
            if (templateInfo) {
                return completions_1.getTemplateCompletions(templateInfo);
            }
        };
        LanguageServiceImpl.prototype.getDefinitionAt = function (fileName, position) {
            var templateInfo = this.getTemplateAstAtPosition(fileName, position);
            if (templateInfo) {
                return definitions_1.getDefinition(templateInfo);
            }
        };
        LanguageServiceImpl.prototype.getHoverAt = function (fileName, position) {
            var templateInfo = this.getTemplateAstAtPosition(fileName, position);
            if (templateInfo) {
                return hover_1.getHover(templateInfo);
            }
        };
        LanguageServiceImpl.prototype.getTemplateAstAtPosition = function (fileName, position) {
            var template = this.host.getTemplateAt(fileName, position);
            if (template) {
                var astResult = this.getTemplateAst(template, fileName);
                if (astResult && astResult.htmlAst && astResult.templateAst && astResult.directive &&
                    astResult.directives && astResult.pipes && astResult.expressionParser)
                    return {
                        position: position,
                        fileName: fileName,
                        template: template,
                        htmlAst: astResult.htmlAst,
                        directive: astResult.directive,
                        directives: astResult.directives,
                        pipes: astResult.pipes,
                        templateAst: astResult.templateAst,
                        expressionParser: astResult.expressionParser
                    };
            }
            return undefined;
        };
        LanguageServiceImpl.prototype.getTemplateAst = function (template, contextFile) {
            var _this = this;
            var result = undefined;
            try {
                var resolvedMetadata = this.metadataResolver.getNonNormalizedDirectiveMetadata(template.type);
                var metadata = resolvedMetadata && resolvedMetadata.metadata;
                if (metadata) {
                    var rawHtmlParser = new compiler_1.HtmlParser();
                    var htmlParser = new compiler_1.I18NHtmlParser(rawHtmlParser);
                    var expressionParser = new compiler_1.Parser(new compiler_1.Lexer());
                    var config = new compiler_1.CompilerConfig();
                    var parser = new compiler_1.TemplateParser(config, this.host.resolver.getReflector(), expressionParser, new compiler_1.DomElementSchemaRegistry(), htmlParser, null, []);
                    var htmlResult = htmlParser.parse(template.source, '', true);
                    var analyzedModules = this.host.getAnalyzedModules();
                    var errors = undefined;
                    var ngModule = analyzedModules.ngModuleByPipeOrDirective.get(template.type);
                    if (!ngModule) {
                        // Reported by the the declaration diagnostics.
                        ngModule = findSuitableDefaultModule(analyzedModules);
                    }
                    if (ngModule) {
                        var resolvedDirectives = ngModule.transitiveModule.directives.map(function (d) { return _this.host.resolver.getNonNormalizedDirectiveMetadata(d.reference); });
                        var directives = removeMissing(resolvedDirectives).map(function (d) { return d.metadata.toSummary(); });
                        var pipes = ngModule.transitiveModule.pipes.map(function (p) { return _this.host.resolver.getOrLoadPipeMetadata(p.reference).toSummary(); });
                        var schemas = ngModule.schemas;
                        var parseResult = parser.tryParseHtml(htmlResult, metadata, directives, pipes, schemas);
                        result = {
                            htmlAst: htmlResult.rootNodes,
                            templateAst: parseResult.templateAst,
                            directive: metadata, directives: directives, pipes: pipes,
                            parseErrors: parseResult.errors, expressionParser: expressionParser, errors: errors
                        };
                    }
                }
            }
            catch (e) {
                var span = template.span;
                if (e.fileName == contextFile) {
                    span = template.query.getSpanAt(e.line, e.column) || span;
                }
                result = { errors: [{ kind: types_1.DiagnosticKind.Error, message: e.message, span: span }] };
            }
            return result || {};
        };
        return LanguageServiceImpl;
    }());
    function removeMissing(values) {
        return values.filter(function (e) { return !!e; });
    }
    function uniqueBySpan(elements) {
        if (elements) {
            var result = [];
            var map = new Map();
            try {
                for (var elements_1 = tslib_1.__values(elements), elements_1_1 = elements_1.next(); !elements_1_1.done; elements_1_1 = elements_1.next()) {
                    var element = elements_1_1.value;
                    var span = element.span;
                    var set = map.get(span.start);
                    if (!set) {
                        set = new Set();
                        map.set(span.start, set);
                    }
                    if (!set.has(span.end)) {
                        set.add(span.end);
                        result.push(element);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (elements_1_1 && !elements_1_1.done && (_a = elements_1.return)) _a.call(elements_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        }
        var e_1, _a;
    }
    function findSuitableDefaultModule(modules) {
        var result = undefined;
        var resultSize = 0;
        try {
            for (var _a = tslib_1.__values(modules.ngModules), _b = _a.next(); !_b.done; _b = _a.next()) {
                var module_1 = _b.value;
                var moduleSize = module_1.transitiveModule.directives.length;
                if (moduleSize > resultSize) {
                    result = module_1;
                    resultSize = moduleSize;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return result;
        var e_2, _c;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2Vfc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2xhbmd1YWdlLXNlcnZpY2Uvc3JjL2xhbmd1YWdlX3NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsOENBQStOO0lBRy9OLHlFQUFxRDtJQUNyRCx5RUFBNEM7SUFDNUMseUVBQWdGO0lBQ2hGLDZEQUFpQztJQUNqQyw2REFBbUs7SUFHbks7Ozs7T0FJRztJQUNILCtCQUFzQyxJQUF5QjtRQUM3RCxNQUFNLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRkQsc0RBRUM7SUFFRDtRQUNFLDZCQUFvQixJQUF5QjtZQUF6QixTQUFJLEdBQUosSUFBSSxDQUFxQjtRQUFHLENBQUM7UUFFakQsc0JBQVksaURBQWdCO2lCQUE1QixjQUEwRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOzs7V0FBQTtRQUV0RixtREFBcUIsR0FBckIsY0FBb0MsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFL0UsNENBQWMsR0FBZCxVQUFlLFFBQWdCO1lBQzdCLElBQUksT0FBTyxHQUFnQixFQUFFLENBQUM7WUFDOUIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDakQsRUFBRSxDQUFDLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxPQUFPLENBQUMsSUFBSSxPQUFaLE9BQU8sbUJBQVMsb0NBQXNCLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsR0FBRTtZQUNyRSxDQUFDO1lBRUQsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkQsRUFBRSxDQUFDLENBQUMsWUFBWSxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQy9DLE9BQU8sQ0FBQyxJQUFJLE9BQVosT0FBTyxtQkFBUyx1Q0FBeUIsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUU7WUFDcEUsQ0FBQztZQUVELE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELHdDQUFVLEdBQVYsVUFBVyxRQUFnQixFQUFFLFFBQWdCO1lBQzNDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDckUsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDakIsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFDNUIsQ0FBQztZQUNELE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDWixDQUFDO1FBRUQsOENBQWdCLEdBQWhCLFVBQWlCLFFBQWdCLEVBQUUsUUFBZ0I7WUFDakQsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyRSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixNQUFNLENBQUMsb0NBQXNCLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDOUMsQ0FBQztRQUNILENBQUM7UUFFRCw2Q0FBZSxHQUFmLFVBQWdCLFFBQWdCLEVBQUUsUUFBZ0I7WUFDaEQsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyRSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixNQUFNLENBQUMsMkJBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNyQyxDQUFDO1FBQ0gsQ0FBQztRQUVELHdDQUFVLEdBQVYsVUFBVyxRQUFnQixFQUFFLFFBQWdCO1lBQzNDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDckUsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDakIsTUFBTSxDQUFDLGdCQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEMsQ0FBQztRQUNILENBQUM7UUFFTyxzREFBd0IsR0FBaEMsVUFBaUMsUUFBZ0IsRUFBRSxRQUFnQjtZQUNqRSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDM0QsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDYixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDeEQsRUFBRSxDQUFDLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxPQUFPLElBQUksU0FBUyxDQUFDLFdBQVcsSUFBSSxTQUFTLENBQUMsU0FBUztvQkFDOUUsU0FBUyxDQUFDLFVBQVUsSUFBSSxTQUFTLENBQUMsS0FBSyxJQUFJLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDeEUsTUFBTSxDQUFDO3dCQUNMLFFBQVEsVUFBQTt3QkFDUixRQUFRLFVBQUE7d0JBQ1IsUUFBUSxVQUFBO3dCQUNSLE9BQU8sRUFBRSxTQUFTLENBQUMsT0FBTzt3QkFDMUIsU0FBUyxFQUFFLFNBQVMsQ0FBQyxTQUFTO3dCQUM5QixVQUFVLEVBQUUsU0FBUyxDQUFDLFVBQVU7d0JBQ2hDLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSzt3QkFDdEIsV0FBVyxFQUFFLFNBQVMsQ0FBQyxXQUFXO3dCQUNsQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsZ0JBQWdCO3FCQUM3QyxDQUFDO1lBQ04sQ0FBQztZQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDbkIsQ0FBQztRQUVELDRDQUFjLEdBQWQsVUFBZSxRQUF3QixFQUFFLFdBQW1CO1lBQTVELGlCQThDQztZQTdDQyxJQUFJLE1BQU0sR0FBd0IsU0FBUyxDQUFDO1lBQzVDLElBQUksQ0FBQztnQkFDSCxJQUFNLGdCQUFnQixHQUNsQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUNBQWlDLENBQUMsUUFBUSxDQUFDLElBQVcsQ0FBQyxDQUFDO2dCQUNsRixJQUFNLFFBQVEsR0FBRyxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7Z0JBQy9ELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ2IsSUFBTSxhQUFhLEdBQUcsSUFBSSxxQkFBVSxFQUFFLENBQUM7b0JBQ3ZDLElBQU0sVUFBVSxHQUFHLElBQUkseUJBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDckQsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGlCQUFNLENBQUMsSUFBSSxnQkFBSyxFQUFFLENBQUMsQ0FBQztvQkFDakQsSUFBTSxNQUFNLEdBQUcsSUFBSSx5QkFBYyxFQUFFLENBQUM7b0JBQ3BDLElBQU0sTUFBTSxHQUFHLElBQUkseUJBQWMsQ0FDN0IsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxFQUFFLGdCQUFnQixFQUMzRCxJQUFJLG1DQUF3QixFQUFFLEVBQUUsVUFBVSxFQUFFLElBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDNUQsSUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDL0QsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO29CQUN2RCxJQUFJLE1BQU0sR0FBMkIsU0FBUyxDQUFDO29CQUMvQyxJQUFJLFFBQVEsR0FBRyxlQUFlLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDNUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUNkLCtDQUErQzt3QkFDL0MsUUFBUSxHQUFHLHlCQUF5QixDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUN4RCxDQUFDO29CQUNELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7d0JBQ2IsSUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FDL0QsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQWpFLENBQWlFLENBQUMsQ0FBQzt3QkFDNUUsSUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLGtCQUFrQixDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDO3dCQUN0RixJQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FDN0MsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQWpFLENBQWlFLENBQUMsQ0FBQzt3QkFDNUUsSUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQzt3QkFDakMsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7d0JBQzFGLE1BQU0sR0FBRzs0QkFDUCxPQUFPLEVBQUUsVUFBVSxDQUFDLFNBQVM7NEJBQzdCLFdBQVcsRUFBRSxXQUFXLENBQUMsV0FBVzs0QkFDcEMsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLFlBQUEsRUFBRSxLQUFLLE9BQUE7NEJBQ3RDLFdBQVcsRUFBRSxXQUFXLENBQUMsTUFBTSxFQUFFLGdCQUFnQixrQkFBQSxFQUFFLE1BQU0sUUFBQTt5QkFDMUQsQ0FBQztvQkFDSixDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO2dCQUN6QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLElBQUksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUM7Z0JBQzVELENBQUM7Z0JBQ0QsTUFBTSxHQUFHLEVBQUMsTUFBTSxFQUFFLENBQUMsRUFBQyxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxNQUFBLEVBQUMsQ0FBQyxFQUFDLENBQUM7WUFDOUUsQ0FBQztZQUNELE1BQU0sQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFDSCwwQkFBQztJQUFELENBQUMsQUF4SEQsSUF3SEM7SUFFRCx1QkFBMEIsTUFBZ0M7UUFDeEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsQ0FBQyxFQUFILENBQUcsQ0FBUSxDQUFDO0lBQ3hDLENBQUM7SUFFRCxzQkFHRyxRQUF5QjtRQUMxQixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2IsSUFBTSxNQUFNLEdBQVEsRUFBRSxDQUFDO1lBQ3ZCLElBQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDOztnQkFDM0MsR0FBRyxDQUFDLENBQWtCLElBQUEsYUFBQSxpQkFBQSxRQUFRLENBQUEsa0NBQUE7b0JBQXpCLElBQU0sT0FBTyxxQkFBQTtvQkFDaEIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztvQkFDeEIsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDVCxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzt3QkFDaEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUMzQixDQUFDO29CQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN2QixHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDdkIsQ0FBQztpQkFDRjs7Ozs7Ozs7O1lBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNoQixDQUFDOztJQUNILENBQUM7SUFFRCxtQ0FBbUMsT0FBMEI7UUFDM0QsSUFBSSxNQUFNLEdBQXNDLFNBQVMsQ0FBQztRQUMxRCxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7O1lBQ25CLEdBQUcsQ0FBQyxDQUFpQixJQUFBLEtBQUEsaUJBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQSxnQkFBQTtnQkFBakMsSUFBTSxRQUFNLFdBQUE7Z0JBQ2YsSUFBTSxVQUFVLEdBQUcsUUFBTSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7Z0JBQzdELEVBQUUsQ0FBQyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUM1QixNQUFNLEdBQUcsUUFBTSxDQUFDO29CQUNoQixVQUFVLEdBQUcsVUFBVSxDQUFDO2dCQUMxQixDQUFDO2FBQ0Y7Ozs7Ozs7OztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7O0lBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcGlsZU1ldGFkYXRhUmVzb2x2ZXIsIENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLCBDb21waWxlUGlwZVN1bW1hcnksIENvbXBpbGVyQ29uZmlnLCBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnksIEh0bWxQYXJzZXIsIEkxOE5IdG1sUGFyc2VyLCBMZXhlciwgTmdBbmFseXplZE1vZHVsZXMsIFBhcnNlciwgVGVtcGxhdGVQYXJzZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcblxuaW1wb3J0IHtBc3RSZXN1bHQsIFRlbXBsYXRlSW5mb30gZnJvbSAnLi9jb21tb24nO1xuaW1wb3J0IHtnZXRUZW1wbGF0ZUNvbXBsZXRpb25zfSBmcm9tICcuL2NvbXBsZXRpb25zJztcbmltcG9ydCB7Z2V0RGVmaW5pdGlvbn0gZnJvbSAnLi9kZWZpbml0aW9ucyc7XG5pbXBvcnQge2dldERlY2xhcmF0aW9uRGlhZ25vc3RpY3MsIGdldFRlbXBsYXRlRGlhZ25vc3RpY3N9IGZyb20gJy4vZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtnZXRIb3Zlcn0gZnJvbSAnLi9ob3Zlcic7XG5pbXBvcnQge0NvbXBsZXRpb25zLCBEZWZpbml0aW9uLCBEaWFnbm9zdGljLCBEaWFnbm9zdGljS2luZCwgRGlhZ25vc3RpY3MsIEhvdmVyLCBMYW5ndWFnZVNlcnZpY2UsIExhbmd1YWdlU2VydmljZUhvc3QsIFBpcGVzLCBTcGFuLCBUZW1wbGF0ZVNvdXJjZX0gZnJvbSAnLi90eXBlcyc7XG5cblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgYW4gQW5ndWxhciBgTGFuZ3VhZ2VTZXJ2aWNlYC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMYW5ndWFnZVNlcnZpY2UoaG9zdDogTGFuZ3VhZ2VTZXJ2aWNlSG9zdCk6IExhbmd1YWdlU2VydmljZSB7XG4gIHJldHVybiBuZXcgTGFuZ3VhZ2VTZXJ2aWNlSW1wbChob3N0KTtcbn1cblxuY2xhc3MgTGFuZ3VhZ2VTZXJ2aWNlSW1wbCBpbXBsZW1lbnRzIExhbmd1YWdlU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaG9zdDogTGFuZ3VhZ2VTZXJ2aWNlSG9zdCkge31cblxuICBwcml2YXRlIGdldCBtZXRhZGF0YVJlc29sdmVyKCk6IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyIHsgcmV0dXJuIHRoaXMuaG9zdC5yZXNvbHZlcjsgfVxuXG4gIGdldFRlbXBsYXRlUmVmZXJlbmNlcygpOiBzdHJpbmdbXSB7IHJldHVybiB0aGlzLmhvc3QuZ2V0VGVtcGxhdGVSZWZlcmVuY2VzKCk7IH1cblxuICBnZXREaWFnbm9zdGljcyhmaWxlTmFtZTogc3RyaW5nKTogRGlhZ25vc3RpY3N8dW5kZWZpbmVkIHtcbiAgICBsZXQgcmVzdWx0czogRGlhZ25vc3RpY3MgPSBbXTtcbiAgICBsZXQgdGVtcGxhdGVzID0gdGhpcy5ob3N0LmdldFRlbXBsYXRlcyhmaWxlTmFtZSk7XG4gICAgaWYgKHRlbXBsYXRlcyAmJiB0ZW1wbGF0ZXMubGVuZ3RoKSB7XG4gICAgICByZXN1bHRzLnB1c2goLi4uZ2V0VGVtcGxhdGVEaWFnbm9zdGljcyhmaWxlTmFtZSwgdGhpcywgdGVtcGxhdGVzKSk7XG4gICAgfVxuXG4gICAgbGV0IGRlY2xhcmF0aW9ucyA9IHRoaXMuaG9zdC5nZXREZWNsYXJhdGlvbnMoZmlsZU5hbWUpO1xuICAgIGlmIChkZWNsYXJhdGlvbnMgJiYgZGVjbGFyYXRpb25zLmxlbmd0aCkge1xuICAgICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuaG9zdC5nZXRBbmFseXplZE1vZHVsZXMoKTtcbiAgICAgIHJlc3VsdHMucHVzaCguLi5nZXREZWNsYXJhdGlvbkRpYWdub3N0aWNzKGRlY2xhcmF0aW9ucywgc3VtbWFyeSkpO1xuICAgIH1cblxuICAgIHJldHVybiB1bmlxdWVCeVNwYW4ocmVzdWx0cyk7XG4gIH1cblxuICBnZXRQaXBlc0F0KGZpbGVOYW1lOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIpOiBDb21waWxlUGlwZVN1bW1hcnlbXSB7XG4gICAgbGV0IHRlbXBsYXRlSW5mbyA9IHRoaXMuZ2V0VGVtcGxhdGVBc3RBdFBvc2l0aW9uKGZpbGVOYW1lLCBwb3NpdGlvbik7XG4gICAgaWYgKHRlbXBsYXRlSW5mbykge1xuICAgICAgcmV0dXJuIHRlbXBsYXRlSW5mby5waXBlcztcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgZ2V0Q29tcGxldGlvbnNBdChmaWxlTmFtZTogc3RyaW5nLCBwb3NpdGlvbjogbnVtYmVyKTogQ29tcGxldGlvbnMge1xuICAgIGxldCB0ZW1wbGF0ZUluZm8gPSB0aGlzLmdldFRlbXBsYXRlQXN0QXRQb3NpdGlvbihmaWxlTmFtZSwgcG9zaXRpb24pO1xuICAgIGlmICh0ZW1wbGF0ZUluZm8pIHtcbiAgICAgIHJldHVybiBnZXRUZW1wbGF0ZUNvbXBsZXRpb25zKHRlbXBsYXRlSW5mbyk7XG4gICAgfVxuICB9XG5cbiAgZ2V0RGVmaW5pdGlvbkF0KGZpbGVOYW1lOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIpOiBEZWZpbml0aW9uIHtcbiAgICBsZXQgdGVtcGxhdGVJbmZvID0gdGhpcy5nZXRUZW1wbGF0ZUFzdEF0UG9zaXRpb24oZmlsZU5hbWUsIHBvc2l0aW9uKTtcbiAgICBpZiAodGVtcGxhdGVJbmZvKSB7XG4gICAgICByZXR1cm4gZ2V0RGVmaW5pdGlvbih0ZW1wbGF0ZUluZm8pO1xuICAgIH1cbiAgfVxuXG4gIGdldEhvdmVyQXQoZmlsZU5hbWU6IHN0cmluZywgcG9zaXRpb246IG51bWJlcik6IEhvdmVyfHVuZGVmaW5lZCB7XG4gICAgbGV0IHRlbXBsYXRlSW5mbyA9IHRoaXMuZ2V0VGVtcGxhdGVBc3RBdFBvc2l0aW9uKGZpbGVOYW1lLCBwb3NpdGlvbik7XG4gICAgaWYgKHRlbXBsYXRlSW5mbykge1xuICAgICAgcmV0dXJuIGdldEhvdmVyKHRlbXBsYXRlSW5mbyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRUZW1wbGF0ZUFzdEF0UG9zaXRpb24oZmlsZU5hbWU6IHN0cmluZywgcG9zaXRpb246IG51bWJlcik6IFRlbXBsYXRlSW5mb3x1bmRlZmluZWQge1xuICAgIGxldCB0ZW1wbGF0ZSA9IHRoaXMuaG9zdC5nZXRUZW1wbGF0ZUF0KGZpbGVOYW1lLCBwb3NpdGlvbik7XG4gICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICBsZXQgYXN0UmVzdWx0ID0gdGhpcy5nZXRUZW1wbGF0ZUFzdCh0ZW1wbGF0ZSwgZmlsZU5hbWUpO1xuICAgICAgaWYgKGFzdFJlc3VsdCAmJiBhc3RSZXN1bHQuaHRtbEFzdCAmJiBhc3RSZXN1bHQudGVtcGxhdGVBc3QgJiYgYXN0UmVzdWx0LmRpcmVjdGl2ZSAmJlxuICAgICAgICAgIGFzdFJlc3VsdC5kaXJlY3RpdmVzICYmIGFzdFJlc3VsdC5waXBlcyAmJiBhc3RSZXN1bHQuZXhwcmVzc2lvblBhcnNlcilcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICBmaWxlTmFtZSxcbiAgICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgICBodG1sQXN0OiBhc3RSZXN1bHQuaHRtbEFzdCxcbiAgICAgICAgICBkaXJlY3RpdmU6IGFzdFJlc3VsdC5kaXJlY3RpdmUsXG4gICAgICAgICAgZGlyZWN0aXZlczogYXN0UmVzdWx0LmRpcmVjdGl2ZXMsXG4gICAgICAgICAgcGlwZXM6IGFzdFJlc3VsdC5waXBlcyxcbiAgICAgICAgICB0ZW1wbGF0ZUFzdDogYXN0UmVzdWx0LnRlbXBsYXRlQXN0LFxuICAgICAgICAgIGV4cHJlc3Npb25QYXJzZXI6IGFzdFJlc3VsdC5leHByZXNzaW9uUGFyc2VyXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXRUZW1wbGF0ZUFzdCh0ZW1wbGF0ZTogVGVtcGxhdGVTb3VyY2UsIGNvbnRleHRGaWxlOiBzdHJpbmcpOiBBc3RSZXN1bHQge1xuICAgIGxldCByZXN1bHQ6IEFzdFJlc3VsdHx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc29sdmVkTWV0YWRhdGEgPVxuICAgICAgICAgIHRoaXMubWV0YWRhdGFSZXNvbHZlci5nZXROb25Ob3JtYWxpemVkRGlyZWN0aXZlTWV0YWRhdGEodGVtcGxhdGUudHlwZSBhcyBhbnkpO1xuICAgICAgY29uc3QgbWV0YWRhdGEgPSByZXNvbHZlZE1ldGFkYXRhICYmIHJlc29sdmVkTWV0YWRhdGEubWV0YWRhdGE7XG4gICAgICBpZiAobWV0YWRhdGEpIHtcbiAgICAgICAgY29uc3QgcmF3SHRtbFBhcnNlciA9IG5ldyBIdG1sUGFyc2VyKCk7XG4gICAgICAgIGNvbnN0IGh0bWxQYXJzZXIgPSBuZXcgSTE4Tkh0bWxQYXJzZXIocmF3SHRtbFBhcnNlcik7XG4gICAgICAgIGNvbnN0IGV4cHJlc3Npb25QYXJzZXIgPSBuZXcgUGFyc2VyKG5ldyBMZXhlcigpKTtcbiAgICAgICAgY29uc3QgY29uZmlnID0gbmV3IENvbXBpbGVyQ29uZmlnKCk7XG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBUZW1wbGF0ZVBhcnNlcihcbiAgICAgICAgICAgIGNvbmZpZywgdGhpcy5ob3N0LnJlc29sdmVyLmdldFJlZmxlY3RvcigpLCBleHByZXNzaW9uUGFyc2VyLFxuICAgICAgICAgICAgbmV3IERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSgpLCBodG1sUGFyc2VyLCBudWxsICEsIFtdKTtcbiAgICAgICAgY29uc3QgaHRtbFJlc3VsdCA9IGh0bWxQYXJzZXIucGFyc2UodGVtcGxhdGUuc291cmNlLCAnJywgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IGFuYWx5emVkTW9kdWxlcyA9IHRoaXMuaG9zdC5nZXRBbmFseXplZE1vZHVsZXMoKTtcbiAgICAgICAgbGV0IGVycm9yczogRGlhZ25vc3RpY1tdfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IG5nTW9kdWxlID0gYW5hbHl6ZWRNb2R1bGVzLm5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUuZ2V0KHRlbXBsYXRlLnR5cGUpO1xuICAgICAgICBpZiAoIW5nTW9kdWxlKSB7XG4gICAgICAgICAgLy8gUmVwb3J0ZWQgYnkgdGhlIHRoZSBkZWNsYXJhdGlvbiBkaWFnbm9zdGljcy5cbiAgICAgICAgICBuZ01vZHVsZSA9IGZpbmRTdWl0YWJsZURlZmF1bHRNb2R1bGUoYW5hbHl6ZWRNb2R1bGVzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmdNb2R1bGUpIHtcbiAgICAgICAgICBjb25zdCByZXNvbHZlZERpcmVjdGl2ZXMgPSBuZ01vZHVsZS50cmFuc2l0aXZlTW9kdWxlLmRpcmVjdGl2ZXMubWFwKFxuICAgICAgICAgICAgICBkID0+IHRoaXMuaG9zdC5yZXNvbHZlci5nZXROb25Ob3JtYWxpemVkRGlyZWN0aXZlTWV0YWRhdGEoZC5yZWZlcmVuY2UpKTtcbiAgICAgICAgICBjb25zdCBkaXJlY3RpdmVzID0gcmVtb3ZlTWlzc2luZyhyZXNvbHZlZERpcmVjdGl2ZXMpLm1hcChkID0+IGQubWV0YWRhdGEudG9TdW1tYXJ5KCkpO1xuICAgICAgICAgIGNvbnN0IHBpcGVzID0gbmdNb2R1bGUudHJhbnNpdGl2ZU1vZHVsZS5waXBlcy5tYXAoXG4gICAgICAgICAgICAgIHAgPT4gdGhpcy5ob3N0LnJlc29sdmVyLmdldE9yTG9hZFBpcGVNZXRhZGF0YShwLnJlZmVyZW5jZSkudG9TdW1tYXJ5KCkpO1xuICAgICAgICAgIGNvbnN0IHNjaGVtYXMgPSBuZ01vZHVsZS5zY2hlbWFzO1xuICAgICAgICAgIGNvbnN0IHBhcnNlUmVzdWx0ID0gcGFyc2VyLnRyeVBhcnNlSHRtbChodG1sUmVzdWx0LCBtZXRhZGF0YSwgZGlyZWN0aXZlcywgcGlwZXMsIHNjaGVtYXMpO1xuICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIGh0bWxBc3Q6IGh0bWxSZXN1bHQucm9vdE5vZGVzLFxuICAgICAgICAgICAgdGVtcGxhdGVBc3Q6IHBhcnNlUmVzdWx0LnRlbXBsYXRlQXN0LFxuICAgICAgICAgICAgZGlyZWN0aXZlOiBtZXRhZGF0YSwgZGlyZWN0aXZlcywgcGlwZXMsXG4gICAgICAgICAgICBwYXJzZUVycm9yczogcGFyc2VSZXN1bHQuZXJyb3JzLCBleHByZXNzaW9uUGFyc2VyLCBlcnJvcnNcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbGV0IHNwYW4gPSB0ZW1wbGF0ZS5zcGFuO1xuICAgICAgaWYgKGUuZmlsZU5hbWUgPT0gY29udGV4dEZpbGUpIHtcbiAgICAgICAgc3BhbiA9IHRlbXBsYXRlLnF1ZXJ5LmdldFNwYW5BdChlLmxpbmUsIGUuY29sdW1uKSB8fCBzcGFuO1xuICAgICAgfVxuICAgICAgcmVzdWx0ID0ge2Vycm9yczogW3traW5kOiBEaWFnbm9zdGljS2luZC5FcnJvciwgbWVzc2FnZTogZS5tZXNzYWdlLCBzcGFufV19O1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0IHx8IHt9O1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU1pc3Npbmc8VD4odmFsdWVzOiAoVCB8IG51bGwgfCB1bmRlZmluZWQpW10pOiBUW10ge1xuICByZXR1cm4gdmFsdWVzLmZpbHRlcihlID0+ICEhZSkgYXMgVFtdO1xufVxuXG5mdW5jdGlvbiB1bmlxdWVCeVNwYW4gPCBUIGV4dGVuZHMge1xuICBzcGFuOiBTcGFuO1xufVxuPiAoZWxlbWVudHM6IFRbXSB8IHVuZGVmaW5lZCk6IFRbXXx1bmRlZmluZWQge1xuICBpZiAoZWxlbWVudHMpIHtcbiAgICBjb25zdCByZXN1bHQ6IFRbXSA9IFtdO1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXA8bnVtYmVyLCBTZXQ8bnVtYmVyPj4oKTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgIGxldCBzcGFuID0gZWxlbWVudC5zcGFuO1xuICAgICAgbGV0IHNldCA9IG1hcC5nZXQoc3Bhbi5zdGFydCk7XG4gICAgICBpZiAoIXNldCkge1xuICAgICAgICBzZXQgPSBuZXcgU2V0KCk7XG4gICAgICAgIG1hcC5zZXQoc3Bhbi5zdGFydCwgc2V0KTtcbiAgICAgIH1cbiAgICAgIGlmICghc2V0LmhhcyhzcGFuLmVuZCkpIHtcbiAgICAgICAgc2V0LmFkZChzcGFuLmVuZCk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRTdWl0YWJsZURlZmF1bHRNb2R1bGUobW9kdWxlczogTmdBbmFseXplZE1vZHVsZXMpOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YXx1bmRlZmluZWQge1xuICBsZXQgcmVzdWx0OiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YXx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGxldCByZXN1bHRTaXplID0gMDtcbiAgZm9yIChjb25zdCBtb2R1bGUgb2YgbW9kdWxlcy5uZ01vZHVsZXMpIHtcbiAgICBjb25zdCBtb2R1bGVTaXplID0gbW9kdWxlLnRyYW5zaXRpdmVNb2R1bGUuZGlyZWN0aXZlcy5sZW5ndGg7XG4gICAgaWYgKG1vZHVsZVNpemUgPiByZXN1bHRTaXplKSB7XG4gICAgICByZXN1bHQgPSBtb2R1bGU7XG4gICAgICByZXN1bHRTaXplID0gbW9kdWxlU2l6ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==