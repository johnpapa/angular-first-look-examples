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
        define("@angular/language-service/src/diagnostics", ["require", "exports", "tslib", "@angular/compiler-cli/src/language_services", "@angular/language-service/src/types", "@angular/language-service/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var language_services_1 = require("@angular/compiler-cli/src/language_services");
    var types_1 = require("@angular/language-service/src/types");
    var utils_1 = require("@angular/language-service/src/utils");
    function getTemplateDiagnostics(fileName, astProvider, templates) {
        var results = [];
        var _loop_1 = function (template) {
            var ast = astProvider.getTemplateAst(template, fileName);
            if (ast) {
                if (ast.parseErrors && ast.parseErrors.length) {
                    results.push.apply(results, tslib_1.__spread(ast.parseErrors.map(function (e) { return ({
                        kind: types_1.DiagnosticKind.Error,
                        span: utils_1.offsetSpan(utils_1.spanOf(e.span), template.span.start),
                        message: e.msg
                    }); })));
                }
                else if (ast.templateAst && ast.htmlAst) {
                    var info = {
                        templateAst: ast.templateAst,
                        htmlAst: ast.htmlAst,
                        offset: template.span.start,
                        query: template.query,
                        members: template.members
                    };
                    var expressionDiagnostics = language_services_1.getTemplateExpressionDiagnostics(info);
                    results.push.apply(results, tslib_1.__spread(expressionDiagnostics));
                }
                if (ast.errors) {
                    results.push.apply(results, tslib_1.__spread(ast.errors.map(function (e) { return ({ kind: e.kind, span: e.span || template.span, message: e.message }); })));
                }
            }
        };
        try {
            for (var templates_1 = tslib_1.__values(templates), templates_1_1 = templates_1.next(); !templates_1_1.done; templates_1_1 = templates_1.next()) {
                var template = templates_1_1.value;
                _loop_1(template);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (templates_1_1 && !templates_1_1.done && (_a = templates_1.return)) _a.call(templates_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return results;
        var e_1, _a;
    }
    exports.getTemplateDiagnostics = getTemplateDiagnostics;
    function getDeclarationDiagnostics(declarations, modules) {
        var results = [];
        var directives = undefined;
        var _loop_2 = function (declaration) {
            var report = function (message, span) {
                results.push({
                    kind: types_1.DiagnosticKind.Error,
                    span: span || declaration.declarationSpan, message: message
                });
            };
            try {
                for (var _a = tslib_1.__values(declaration.errors), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var error = _b.value;
                    report(error.message, error.span);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_2) throw e_2.error; }
            }
            if (declaration.metadata) {
                if (declaration.metadata.isComponent) {
                    if (!modules.ngModuleByPipeOrDirective.has(declaration.type)) {
                        report("Component '" + declaration.type.name + "' is not included in a module and will not be available inside a template. Consider adding it to a NgModule declaration");
                    }
                    var _d = declaration.metadata.template, template = _d.template, templateUrl = _d.templateUrl;
                    if (template === null && !templateUrl) {
                        report("Component '" + declaration.type.name + "' must have a template or templateUrl");
                    }
                    else if (template && templateUrl) {
                        report("Component '" + declaration.type.name + "' must not have both template and templateUrl");
                    }
                }
                else {
                    if (!directives) {
                        directives = new Set();
                        modules.ngModules.forEach(function (module) {
                            module.declaredDirectives.forEach(function (directive) { directives.add(directive.reference); });
                        });
                    }
                    if (!directives.has(declaration.type)) {
                        report("Directive '" + declaration.type.name + "' is not included in a module and will not be available inside a template. Consider adding it to a NgModule declaration");
                    }
                }
            }
            var e_2, _c;
        };
        try {
            for (var declarations_1 = tslib_1.__values(declarations), declarations_1_1 = declarations_1.next(); !declarations_1_1.done; declarations_1_1 = declarations_1.next()) {
                var declaration = declarations_1_1.value;
                _loop_2(declaration);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (declarations_1_1 && !declarations_1_1.done && (_a = declarations_1.return)) _a.call(declarations_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return results;
        var e_3, _a;
    }
    exports.getDeclarationDiagnostics = getDeclarationDiagnostics;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9sYW5ndWFnZS1zZXJ2aWNlL3NyYy9kaWFnbm9zdGljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFHSCxpRkFBcUg7SUFHckgsNkRBQTRIO0lBQzVILDZEQUEyQztJQU0zQyxnQ0FDSSxRQUFnQixFQUFFLFdBQXdCLEVBQUUsU0FBMkI7UUFDekUsSUFBTSxPQUFPLEdBQWdCLEVBQUUsQ0FBQztnQ0FDckIsUUFBUTtZQUNqQixJQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMzRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNSLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUM5QyxPQUFPLENBQUMsSUFBSSxPQUFaLE9BQU8sbUJBQVMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQy9CLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQzt3QkFDSixJQUFJLEVBQUUsc0JBQWMsQ0FBQyxLQUFLO3dCQUMxQixJQUFJLEVBQUUsa0JBQVUsQ0FBQyxjQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO3dCQUNyRCxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUc7cUJBQ2YsQ0FBQyxFQUpHLENBSUgsQ0FBQyxHQUFFO2dCQUNYLENBQUM7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQzFDLElBQU0sSUFBSSxHQUEyQjt3QkFDbkMsV0FBVyxF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LENBQUMsQ0FBQztvQkFDMUYsQ0FBQztnQkFDSCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzt3QkFDaEIsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7d0JBQ3ZCLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTTs0QkFDOUIsTUFBTSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FDN0IsVUFBQSxTQUFTLElBQU0sVUFBWSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDL0QsQ0FBQyxDQUFDLENBQUM7b0JBQ0wsQ0FBQztvQkFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDdEMsTUFBTSxDQUNGLGdCQUFjLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSw0SEFBeUgsQ0FBQyxDQUFDO29CQUNwSyxDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDOzs7O1lBcENILEdBQUcsQ0FBQyxDQUFzQixJQUFBLGlCQUFBLGlCQUFBLFlBQVksQ0FBQSwwQ0FBQTtnQkFBakMsSUFBTSxXQUFXLHlCQUFBO3dCQUFYLFdBQVc7YUFxQ3JCOzs7Ozs7Ozs7UUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDOztJQUNqQixDQUFDO0lBN0NELDhEQTZDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ0FuYWx5emVkTW9kdWxlcywgU3RhdGljU3ltYm9sfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQge0RpYWdub3N0aWNUZW1wbGF0ZUluZm8sIGdldFRlbXBsYXRlRXhwcmVzc2lvbkRpYWdub3N0aWNzfSBmcm9tICdAYW5ndWxhci9jb21waWxlci1jbGkvc3JjL2xhbmd1YWdlX3NlcnZpY2VzJztcblxuaW1wb3J0IHtBc3RSZXN1bHR9IGZyb20gJy4vY29tbW9uJztcbmltcG9ydCB7RGVjbGFyYXRpb25zLCBEaWFnbm9zdGljLCBEaWFnbm9zdGljS2luZCwgRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiwgRGlhZ25vc3RpY3MsIFNwYW4sIFRlbXBsYXRlU291cmNlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7b2Zmc2V0U3Bhbiwgc3Bhbk9mfSBmcm9tICcuL3V0aWxzJztcblxuZXhwb3J0IGludGVyZmFjZSBBc3RQcm92aWRlciB7XG4gIGdldFRlbXBsYXRlQXN0KHRlbXBsYXRlOiBUZW1wbGF0ZVNvdXJjZSwgZmlsZU5hbWU6IHN0cmluZyk6IEFzdFJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRlbXBsYXRlRGlhZ25vc3RpY3MoXG4gICAgZmlsZU5hbWU6IHN0cmluZywgYXN0UHJvdmlkZXI6IEFzdFByb3ZpZGVyLCB0ZW1wbGF0ZXM6IFRlbXBsYXRlU291cmNlW10pOiBEaWFnbm9zdGljcyB7XG4gIGNvbnN0IHJlc3VsdHM6IERpYWdub3N0aWNzID0gW107XG4gIGZvciAoY29uc3QgdGVtcGxhdGUgb2YgdGVtcGxhdGVzKSB7XG4gICAgY29uc3QgYXN0ID0gYXN0UHJvdmlkZXIuZ2V0VGVtcGxhdGVBc3QodGVtcGxhdGUsIGZpbGVOYW1lKTtcbiAgICBpZiAoYXN0KSB7XG4gICAgICBpZiAoYXN0LnBhcnNlRXJyb3JzICYmIGFzdC5wYXJzZUVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKC4uLmFzdC5wYXJzZUVycm9ycy5tYXA8RGlhZ25vc3RpYz4oXG4gICAgICAgICAgICBlID0+ICh7XG4gICAgICAgICAgICAgIGtpbmQ6IERpYWdub3N0aWNLaW5kLkVycm9yLFxuICAgICAgICAgICAgICBzcGFuOiBvZmZzZXRTcGFuKHNwYW5PZihlLnNwYW4pLCB0ZW1wbGF0ZS5zcGFuLnN0YXJ0KSxcbiAgICAgICAgICAgICAgbWVzc2FnZTogZS5tc2dcbiAgICAgICAgICAgIH0pKSk7XG4gICAgICB9IGVsc2UgaWYgKGFzdC50ZW1wbGF0ZUFzdCAmJiBhc3QuaHRtbEFzdCkge1xuICAgICAgICBjb25zdCBpbmZvOiBEaWFnbm9zdGljVGVtcGxhdGVJbmZvID0ge1xuICAgICAgICAgIHRlbXBsYXRlQXN0OiBhc3QudGVtcGxhdGVBc3QsXG4gICAgICAgICAgaHRtbEFzdDogYXN0Lmh0bWxBc3QsXG4gICAgICAgICAgb2Zmc2V0OiB0ZW1wbGF0ZS5zcGFuLnN0YXJ0LFxuICAgICAgICAgIHF1ZXJ5OiB0ZW1wbGF0ZS5xdWVyeSxcbiAgICAgICAgICBtZW1iZXJzOiB0ZW1wbGF0ZS5tZW1iZXJzXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGV4cHJlc3Npb25EaWFnbm9zdGljcyA9IGdldFRlbXBsYXRlRXhwcmVzc2lvbkRpYWdub3N0aWNzKGluZm8pO1xuICAgICAgICByZXN1bHRzLnB1c2goLi4uZXhwcmVzc2lvbkRpYWdub3N0aWNzKTtcbiAgICAgIH1cbiAgICAgIGlmIChhc3QuZXJyb3JzKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCguLi5hc3QuZXJyb3JzLm1hcDxEaWFnbm9zdGljPihcbiAgICAgICAgICAgIGUgPT4gKHtraW5kOiBlLmtpbmQsIHNwYW46IGUuc3BhbiB8fCB0ZW1wbGF0ZS5zcGFuLCBtZXNzYWdlOiBlLm1lc3NhZ2V9KSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0cztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERlY2xhcmF0aW9uRGlhZ25vc3RpY3MoXG4gICAgZGVjbGFyYXRpb25zOiBEZWNsYXJhdGlvbnMsIG1vZHVsZXM6IE5nQW5hbHl6ZWRNb2R1bGVzKTogRGlhZ25vc3RpY3Mge1xuICBjb25zdCByZXN1bHRzOiBEaWFnbm9zdGljcyA9IFtdO1xuXG4gIGxldCBkaXJlY3RpdmVzOiBTZXQ8U3RhdGljU3ltYm9sPnx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGZvciAoY29uc3QgZGVjbGFyYXRpb24gb2YgZGVjbGFyYXRpb25zKSB7XG4gICAgY29uc3QgcmVwb3J0ID0gKG1lc3NhZ2U6IHN0cmluZyB8IERpYWdub3N0aWNNZXNzYWdlQ2hhaW4sIHNwYW4/OiBTcGFuKSA9PiB7XG4gICAgICByZXN1bHRzLnB1c2goPERpYWdub3N0aWM+e1xuICAgICAgICBraW5kOiBEaWFnbm9zdGljS2luZC5FcnJvcixcbiAgICAgICAgc3Bhbjogc3BhbiB8fCBkZWNsYXJhdGlvbi5kZWNsYXJhdGlvblNwYW4sIG1lc3NhZ2VcbiAgICAgIH0pO1xuICAgIH07XG4gICAgZm9yIChjb25zdCBlcnJvciBvZiBkZWNsYXJhdGlvbi5lcnJvcnMpIHtcbiAgICAgIHJlcG9ydChlcnJvci5tZXNzYWdlLCBlcnJvci5zcGFuKTtcbiAgICB9XG4gICAgaWYgKGRlY2xhcmF0aW9uLm1ldGFkYXRhKSB7XG4gICAgICBpZiAoZGVjbGFyYXRpb24ubWV0YWRhdGEuaXNDb21wb25lbnQpIHtcbiAgICAgICAgaWYgKCFtb2R1bGVzLm5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUuaGFzKGRlY2xhcmF0aW9uLnR5cGUpKSB7XG4gICAgICAgICAgcmVwb3J0KFxuICAgICAgICAgICAgICBgQ29tcG9uZW50ICcke2RlY2xhcmF0aW9uLnR5cGUubmFtZX0nIGlzIG5vdCBpbmNsdWRlZCBpbiBhIG1vZHVsZSBhbmQgd2lsbCBub3QgYmUgYXZhaWxhYmxlIGluc2lkZSBhIHRlbXBsYXRlLiBDb25zaWRlciBhZGRpbmcgaXQgdG8gYSBOZ01vZHVsZSBkZWNsYXJhdGlvbmApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHt0ZW1wbGF0ZSwgdGVtcGxhdGVVcmx9ID0gZGVjbGFyYXRpb24ubWV0YWRhdGEudGVtcGxhdGUgITtcbiAgICAgICAgaWYgKHRlbXBsYXRlID09PSBudWxsICYmICF0ZW1wbGF0ZVVybCkge1xuICAgICAgICAgIHJlcG9ydChgQ29tcG9uZW50ICcke2RlY2xhcmF0aW9uLnR5cGUubmFtZX0nIG11c3QgaGF2ZSBhIHRlbXBsYXRlIG9yIHRlbXBsYXRlVXJsYCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGVtcGxhdGUgJiYgdGVtcGxhdGVVcmwpIHtcbiAgICAgICAgICByZXBvcnQoXG4gICAgICAgICAgICAgIGBDb21wb25lbnQgJyR7ZGVjbGFyYXRpb24udHlwZS5uYW1lfScgbXVzdCBub3QgaGF2ZSBib3RoIHRlbXBsYXRlIGFuZCB0ZW1wbGF0ZVVybGApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIWRpcmVjdGl2ZXMpIHtcbiAgICAgICAgICBkaXJlY3RpdmVzID0gbmV3IFNldCgpO1xuICAgICAgICAgIG1vZHVsZXMubmdNb2R1bGVzLmZvckVhY2gobW9kdWxlID0+IHtcbiAgICAgICAgICAgIG1vZHVsZS5kZWNsYXJlZERpcmVjdGl2ZXMuZm9yRWFjaChcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmUgPT4geyBkaXJlY3RpdmVzICEuYWRkKGRpcmVjdGl2ZS5yZWZlcmVuY2UpOyB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRpcmVjdGl2ZXMuaGFzKGRlY2xhcmF0aW9uLnR5cGUpKSB7XG4gICAgICAgICAgcmVwb3J0KFxuICAgICAgICAgICAgICBgRGlyZWN0aXZlICcke2RlY2xhcmF0aW9uLnR5cGUubmFtZX0nIGlzIG5vdCBpbmNsdWRlZCBpbiBhIG1vZHVsZSBhbmQgd2lsbCBub3QgYmUgYXZhaWxhYmxlIGluc2lkZSBhIHRlbXBsYXRlLiBDb25zaWRlciBhZGRpbmcgaXQgdG8gYSBOZ01vZHVsZSBkZWNsYXJhdGlvbmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG4iXX0=