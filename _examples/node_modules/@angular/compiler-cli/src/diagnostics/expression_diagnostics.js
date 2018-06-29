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
        define("@angular/compiler-cli/src/diagnostics/expression_diagnostics", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler-cli/src/diagnostics/expression_type", "@angular/compiler-cli/src/diagnostics/symbols"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var expression_type_1 = require("@angular/compiler-cli/src/diagnostics/expression_type");
    var symbols_1 = require("@angular/compiler-cli/src/diagnostics/symbols");
    function getTemplateExpressionDiagnostics(info) {
        var visitor = new ExpressionDiagnosticsVisitor(info, function (path, includeEvent) {
            return getExpressionScope(info, path, includeEvent);
        });
        compiler_1.templateVisitAll(visitor, info.templateAst);
        return visitor.diagnostics;
    }
    exports.getTemplateExpressionDiagnostics = getTemplateExpressionDiagnostics;
    function getExpressionDiagnostics(scope, ast, query, context) {
        if (context === void 0) { context = {}; }
        var analyzer = new expression_type_1.AstType(scope, query, context);
        analyzer.getDiagnostics(ast);
        return analyzer.diagnostics;
    }
    exports.getExpressionDiagnostics = getExpressionDiagnostics;
    function getReferences(info) {
        var result = [];
        function processReferences(references) {
            var _loop_1 = function (reference) {
                var type = undefined;
                if (reference.value) {
                    type = info.query.getTypeSymbol(compiler_1.tokenReference(reference.value));
                }
                result.push({
                    name: reference.name,
                    kind: 'reference',
                    type: type || info.query.getBuiltinType(symbols_1.BuiltinType.Any),
                    get definition() { return getDefinitionOf(info, reference); }
                });
            };
            try {
                for (var references_1 = tslib_1.__values(references), references_1_1 = references_1.next(); !references_1_1.done; references_1_1 = references_1.next()) {
                    var reference = references_1_1.value;
                    _loop_1(reference);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (references_1_1 && !references_1_1.done && (_a = references_1.return)) _a.call(references_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var e_1, _a;
        }
        var visitor = new /** @class */ (function (_super) {
            tslib_1.__extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype.visitEmbeddedTemplate = function (ast, context) {
                _super.prototype.visitEmbeddedTemplate.call(this, ast, context);
                processReferences(ast.references);
            };
            class_1.prototype.visitElement = function (ast, context) {
                _super.prototype.visitElement.call(this, ast, context);
                processReferences(ast.references);
            };
            return class_1;
        }(compiler_1.RecursiveTemplateAstVisitor));
        compiler_1.templateVisitAll(visitor, info.templateAst);
        return result;
    }
    function getDefinitionOf(info, ast) {
        if (info.fileName) {
            var templateOffset = info.offset;
            return [{
                    fileName: info.fileName,
                    span: {
                        start: ast.sourceSpan.start.offset + templateOffset,
                        end: ast.sourceSpan.end.offset + templateOffset
                    }
                }];
        }
    }
    function getVarDeclarations(info, path) {
        var result = [];
        var current = path.tail;
        while (current) {
            if (current instanceof compiler_1.EmbeddedTemplateAst) {
                var _loop_2 = function (variable) {
                    var name = variable.name;
                    // Find the first directive with a context.
                    var context = current.directives.map(function (d) { return info.query.getTemplateContext(d.directive.type.reference); })
                        .find(function (c) { return !!c; });
                    // Determine the type of the context field referenced by variable.value.
                    var type = undefined;
                    if (context) {
                        var value = context.get(variable.value);
                        if (value) {
                            type = value.type;
                            var kind = info.query.getTypeKind(type);
                            if (kind === symbols_1.BuiltinType.Any || kind == symbols_1.BuiltinType.Unbound) {
                                // The any type is not very useful here. For special cases, such as ngFor, we can do
                                // better.
                                type = refinedVariableType(type, info, current);
                            }
                        }
                    }
                    if (!type) {
                        type = info.query.getBuiltinType(symbols_1.BuiltinType.Any);
                    }
                    result.push({
                        name: name,
                        kind: 'variable', type: type, get definition() { return getDefinitionOf(info, variable); }
                    });
                };
                try {
                    for (var _a = tslib_1.__values(current.variables), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var variable = _b.value;
                        _loop_2(variable);
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
            current = path.parentOf(current);
        }
        return result;
        var e_2, _c;
    }
    function refinedVariableType(type, info, templateElement) {
        // Special case the ngFor directive
        var ngForDirective = templateElement.directives.find(function (d) {
            var name = compiler_1.identifierName(d.directive.type);
            return name == 'NgFor' || name == 'NgForOf';
        });
        if (ngForDirective) {
            var ngForOfBinding = ngForDirective.inputs.find(function (i) { return i.directiveName == 'ngForOf'; });
            if (ngForOfBinding) {
                var bindingType = new expression_type_1.AstType(info.members, info.query, {}).getType(ngForOfBinding.value);
                if (bindingType) {
                    var result = info.query.getElementType(bindingType);
                    if (result) {
                        return result;
                    }
                }
            }
        }
        // We can't do better, return any
        return info.query.getBuiltinType(symbols_1.BuiltinType.Any);
    }
    function getEventDeclaration(info, includeEvent) {
        var result = [];
        if (includeEvent) {
            // TODO: Determine the type of the event parameter based on the Observable<T> or EventEmitter<T>
            // of the event.
            result = [{ name: '$event', kind: 'variable', type: info.query.getBuiltinType(symbols_1.BuiltinType.Any) }];
        }
        return result;
    }
    function getExpressionScope(info, path, includeEvent) {
        var result = info.members;
        var references = getReferences(info);
        var variables = getVarDeclarations(info, path);
        var events = getEventDeclaration(info, includeEvent);
        if (references.length || variables.length || events.length) {
            var referenceTable = info.query.createSymbolTable(references);
            var variableTable = info.query.createSymbolTable(variables);
            var eventsTable = info.query.createSymbolTable(events);
            result = info.query.mergeSymbolTable([result, referenceTable, variableTable, eventsTable]);
        }
        return result;
    }
    exports.getExpressionScope = getExpressionScope;
    var ExpressionDiagnosticsVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(ExpressionDiagnosticsVisitor, _super);
        function ExpressionDiagnosticsVisitor(info, getExpressionScope) {
            var _this = _super.call(this) || this;
            _this.info = info;
            _this.getExpressionScope = getExpressionScope;
            _this.diagnostics = [];
            _this.path = new compiler_1.AstPath([]);
            return _this;
        }
        ExpressionDiagnosticsVisitor.prototype.visitDirective = function (ast, context) {
            // Override the default child visitor to ignore the host properties of a directive.
            if (ast.inputs && ast.inputs.length) {
                compiler_1.templateVisitAll(this, ast.inputs, context);
            }
        };
        ExpressionDiagnosticsVisitor.prototype.visitBoundText = function (ast) {
            this.push(ast);
            this.diagnoseExpression(ast.value, ast.sourceSpan.start.offset, false);
            this.pop();
        };
        ExpressionDiagnosticsVisitor.prototype.visitDirectiveProperty = function (ast) {
            this.push(ast);
            this.diagnoseExpression(ast.value, this.attributeValueLocation(ast), false);
            this.pop();
        };
        ExpressionDiagnosticsVisitor.prototype.visitElementProperty = function (ast) {
            this.push(ast);
            this.diagnoseExpression(ast.value, this.attributeValueLocation(ast), false);
            this.pop();
        };
        ExpressionDiagnosticsVisitor.prototype.visitEvent = function (ast) {
            this.push(ast);
            this.diagnoseExpression(ast.handler, this.attributeValueLocation(ast), true);
            this.pop();
        };
        ExpressionDiagnosticsVisitor.prototype.visitVariable = function (ast) {
            var directive = this.directiveSummary;
            if (directive && ast.value) {
                var context = this.info.query.getTemplateContext(directive.type.reference);
                if (context && !context.has(ast.value)) {
                    if (ast.value === '$implicit') {
                        this.reportError('The template context does not have an implicit value', spanOf(ast.sourceSpan));
                    }
                    else {
                        this.reportError("The template context does not defined a member called '" + ast.value + "'", spanOf(ast.sourceSpan));
                    }
                }
            }
        };
        ExpressionDiagnosticsVisitor.prototype.visitElement = function (ast, context) {
            this.push(ast);
            _super.prototype.visitElement.call(this, ast, context);
            this.pop();
        };
        ExpressionDiagnosticsVisitor.prototype.visitEmbeddedTemplate = function (ast, context) {
            var previousDirectiveSummary = this.directiveSummary;
            this.push(ast);
            // Find directive that references this template
            this.directiveSummary =
                ast.directives.map(function (d) { return d.directive; }).find(function (d) { return hasTemplateReference(d.type); });
            // Process children
            _super.prototype.visitEmbeddedTemplate.call(this, ast, context);
            this.pop();
            this.directiveSummary = previousDirectiveSummary;
        };
        ExpressionDiagnosticsVisitor.prototype.attributeValueLocation = function (ast) {
            var path = compiler_1.findNode(this.info.htmlAst, ast.sourceSpan.start.offset);
            var last = path.tail;
            if (last instanceof compiler_1.Attribute && last.valueSpan) {
                // Add 1 for the quote.
                return last.valueSpan.start.offset + 1;
            }
            return ast.sourceSpan.start.offset;
        };
        ExpressionDiagnosticsVisitor.prototype.diagnoseExpression = function (ast, offset, includeEvent) {
            var _this = this;
            var scope = this.getExpressionScope(this.path, includeEvent);
            (_a = this.diagnostics).push.apply(_a, tslib_1.__spread(getExpressionDiagnostics(scope, ast, this.info.query, {
                event: includeEvent
            }).map(function (d) { return ({
                span: offsetSpan(d.ast.span, offset + _this.info.offset),
                kind: d.kind,
                message: d.message
            }); })));
            var _a;
        };
        ExpressionDiagnosticsVisitor.prototype.push = function (ast) { this.path.push(ast); };
        ExpressionDiagnosticsVisitor.prototype.pop = function () { this.path.pop(); };
        ExpressionDiagnosticsVisitor.prototype.reportError = function (message, span) {
            if (span) {
                this.diagnostics.push({ span: offsetSpan(span, this.info.offset), kind: expression_type_1.DiagnosticKind.Error, message: message });
            }
        };
        ExpressionDiagnosticsVisitor.prototype.reportWarning = function (message, span) {
            this.diagnostics.push({ span: offsetSpan(span, this.info.offset), kind: expression_type_1.DiagnosticKind.Warning, message: message });
        };
        return ExpressionDiagnosticsVisitor;
    }(compiler_1.RecursiveTemplateAstVisitor));
    function hasTemplateReference(type) {
        if (type.diDeps) {
            try {
                for (var _a = tslib_1.__values(type.diDeps), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var diDep = _b.value;
                    if (diDep.token && diDep.token.identifier &&
                        compiler_1.identifierName(diDep.token.identifier) == 'TemplateRef')
                        return true;
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        return false;
        var e_3, _c;
    }
    function offsetSpan(span, amount) {
        return { start: span.start + amount, end: span.end + amount };
    }
    function spanOf(sourceSpan) {
        return { start: sourceSpan.start.offset, end: sourceSpan.end.offset };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbl9kaWFnbm9zdGljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvZGlhZ25vc3RpY3MvZXhwcmVzc2lvbl9kaWFnbm9zdGljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBaVo7SUFFaloseUZBQXdHO0lBQ3hHLHlFQUE2RztJQWlCN0csMENBQWlELElBQTRCO1FBRTNFLElBQU0sT0FBTyxHQUFHLElBQUksNEJBQTRCLENBQzVDLElBQUksRUFBRSxVQUFDLElBQXFCLEVBQUUsWUFBcUI7WUFDekMsT0FBQSxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQztRQUE1QyxDQUE0QyxDQUFDLENBQUM7UUFDNUQsMkJBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1QyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztJQUM3QixDQUFDO0lBUEQsNEVBT0M7SUFFRCxrQ0FDSSxLQUFrQixFQUFFLEdBQVEsRUFBRSxLQUFrQixFQUNoRCxPQUEwQztRQUExQyx3QkFBQSxFQUFBLFlBQTBDO1FBQzVDLElBQU0sUUFBUSxHQUFHLElBQUkseUJBQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7SUFDOUIsQ0FBQztJQU5ELDREQU1DO0lBRUQsdUJBQXVCLElBQTRCO1FBQ2pELElBQU0sTUFBTSxHQUF3QixFQUFFLENBQUM7UUFFdkMsMkJBQTJCLFVBQTBCO29DQUN4QyxTQUFTO2dCQUNsQixJQUFJLElBQUksR0FBcUIsU0FBUyxDQUFDO2dCQUN2QyxFQUFFLENB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LENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7O2dCQUNoQixHQUFHLENBQUMsQ0FBYyxJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQSxnQkFBQTtvQkFBeEIsSUFBSSxLQUFLLFdBQUE7b0JBQ1osRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVU7d0JBQ3JDLHlCQUFjLENBQUMsS0FBSyxDQUFDLEtBQU8sQ0FBQyxVQUFZLENBQUMsSUFBSSxhQUFhLENBQUM7d0JBQzlELE1BQU0sQ0FBQyxJQUFJLENBQUM7aUJBQ2Y7Ozs7Ozs7OztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDOztJQUNmLENBQUM7SUFFRCxvQkFBb0IsSUFBVSxFQUFFLE1BQWM7UUFDNUMsTUFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sRUFBQyxDQUFDO0lBQzlELENBQUM7SUFFRCxnQkFBZ0IsVUFBMkI7UUFDekMsTUFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBQyxDQUFDO0lBQ3RFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QVNULCBBc3RQYXRoLCBBdHRyaWJ1dGUsIEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QsIEJvdW5kRWxlbWVudFByb3BlcnR5QXN0LCBCb3VuZEV2ZW50QXN0LCBCb3VuZFRleHRBc3QsIENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5LCBDb21waWxlVHlwZU1ldGFkYXRhLCBEaXJlY3RpdmVBc3QsIEVsZW1lbnRBc3QsIEVtYmVkZGVkVGVtcGxhdGVBc3QsIE5vZGUsIFBhcnNlU291cmNlU3BhbiwgUmVjdXJzaXZlVGVtcGxhdGVBc3RWaXNpdG9yLCBSZWZlcmVuY2VBc3QsIFRlbXBsYXRlQXN0LCBUZW1wbGF0ZUFzdFBhdGgsIFZhcmlhYmxlQXN0LCBmaW5kTm9kZSwgaWRlbnRpZmllck5hbWUsIHRlbXBsYXRlVmlzaXRBbGwsIHRva2VuUmVmZXJlbmNlfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5cbmltcG9ydCB7QXN0VHlwZSwgRGlhZ25vc3RpY0tpbmQsIEV4cHJlc3Npb25EaWFnbm9zdGljc0NvbnRleHQsIFR5cGVEaWFnbm9zdGljfSBmcm9tICcuL2V4cHJlc3Npb25fdHlwZSc7XG5pbXBvcnQge0J1aWx0aW5UeXBlLCBEZWZpbml0aW9uLCBTcGFuLCBTeW1ib2wsIFN5bWJvbERlY2xhcmF0aW9uLCBTeW1ib2xRdWVyeSwgU3ltYm9sVGFibGV9IGZyb20gJy4vc3ltYm9scyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlhZ25vc3RpY1RlbXBsYXRlSW5mbyB7XG4gIGZpbGVOYW1lPzogc3RyaW5nO1xuICBvZmZzZXQ6IG51bWJlcjtcbiAgcXVlcnk6IFN5bWJvbFF1ZXJ5O1xuICBtZW1iZXJzOiBTeW1ib2xUYWJsZTtcbiAgaHRtbEFzdDogTm9kZVtdO1xuICB0ZW1wbGF0ZUFzdDogVGVtcGxhdGVBc3RbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFeHByZXNzaW9uRGlhZ25vc3RpYyB7XG4gIG1lc3NhZ2U6IHN0cmluZztcbiAgc3BhbjogU3BhbjtcbiAga2luZDogRGlhZ25vc3RpY0tpbmQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZW1wbGF0ZUV4cHJlc3Npb25EaWFnbm9zdGljcyhpbmZvOiBEaWFnbm9zdGljVGVtcGxhdGVJbmZvKTpcbiAgICBFeHByZXNzaW9uRGlhZ25vc3RpY1tdIHtcbiAgY29uc3QgdmlzaXRvciA9IG5ldyBFeHByZXNzaW9uRGlhZ25vc3RpY3NWaXNpdG9yKFxuICAgICAgaW5mbywgKHBhdGg6IFRlbXBsYXRlQXN0UGF0aCwgaW5jbHVkZUV2ZW50OiBib29sZWFuKSA9PlxuICAgICAgICAgICAgICAgIGdldEV4cHJlc3Npb25TY29wZShpbmZvLCBwYXRoLCBpbmNsdWRlRXZlbnQpKTtcbiAgdGVtcGxhdGVWaXNpdEFsbCh2aXNpdG9yLCBpbmZvLnRlbXBsYXRlQXN0KTtcbiAgcmV0dXJuIHZpc2l0b3IuZGlhZ25vc3RpY3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFeHByZXNzaW9uRGlhZ25vc3RpY3MoXG4gICAgc2NvcGU6IFN5bWJvbFRhYmxlLCBhc3Q6IEFTVCwgcXVlcnk6IFN5bWJvbFF1ZXJ5LFxuICAgIGNvbnRleHQ6IEV4cHJlc3Npb25EaWFnbm9zdGljc0NvbnRleHQgPSB7fSk6IFR5cGVEaWFnbm9zdGljW10ge1xuICBjb25zdCBhbmFseXplciA9IG5ldyBBc3RUeXBlKHNjb3BlLCBxdWVyeSwgY29udGV4dCk7XG4gIGFuYWx5emVyLmdldERpYWdub3N0aWNzKGFzdCk7XG4gIHJldHVybiBhbmFseXplci5kaWFnbm9zdGljcztcbn1cblxuZnVuY3Rpb24gZ2V0UmVmZXJlbmNlcyhpbmZvOiBEaWFnbm9zdGljVGVtcGxhdGVJbmZvKTogU3ltYm9sRGVjbGFyYXRpb25bXSB7XG4gIGNvbnN0IHJlc3VsdDogU3ltYm9sRGVjbGFyYXRpb25bXSA9IFtdO1xuXG4gIGZ1bmN0aW9uIHByb2Nlc3NSZWZlcmVuY2VzKHJlZmVyZW5jZXM6IFJlZmVyZW5jZUFzdFtdKSB7XG4gICAgZm9yIChjb25zdCByZWZlcmVuY2Ugb2YgcmVmZXJlbmNlcykge1xuICAgICAgbGV0IHR5cGU6IFN5bWJvbHx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgICBpZiAocmVmZXJlbmNlLnZhbHVlKSB7XG4gICAgICAgIHR5cGUgPSBpbmZvLnF1ZXJ5LmdldFR5cGVTeW1ib2wodG9rZW5SZWZlcmVuY2UocmVmZXJlbmNlLnZhbHVlKSk7XG4gICAgICB9XG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIG5hbWU6IHJlZmVyZW5jZS5uYW1lLFxuICAgICAgICBraW5kOiAncmVmZXJlbmNlJyxcbiAgICAgICAgdHlwZTogdHlwZSB8fCBpbmZvLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLkFueSksXG4gICAgICAgIGdldCBkZWZpbml0aW9uKCkgeyByZXR1cm4gZ2V0RGVmaW5pdGlvbk9mKGluZm8sIHJlZmVyZW5jZSk7IH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHZpc2l0b3IgPSBuZXcgY2xhc3MgZXh0ZW5kcyBSZWN1cnNpdmVUZW1wbGF0ZUFzdFZpc2l0b3Ige1xuICAgIHZpc2l0RW1iZWRkZWRUZW1wbGF0ZShhc3Q6IEVtYmVkZGVkVGVtcGxhdGVBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgICBzdXBlci52aXNpdEVtYmVkZGVkVGVtcGxhdGUoYXN0LCBjb250ZXh0KTtcbiAgICAgIHByb2Nlc3NSZWZlcmVuY2VzKGFzdC5yZWZlcmVuY2VzKTtcbiAgICB9XG4gICAgdmlzaXRFbGVtZW50KGFzdDogRWxlbWVudEFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICAgIHN1cGVyLnZpc2l0RWxlbWVudChhc3QsIGNvbnRleHQpO1xuICAgICAgcHJvY2Vzc1JlZmVyZW5jZXMoYXN0LnJlZmVyZW5jZXMpO1xuICAgIH1cbiAgfTtcblxuICB0ZW1wbGF0ZVZpc2l0QWxsKHZpc2l0b3IsIGluZm8udGVtcGxhdGVBc3QpO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGdldERlZmluaXRpb25PZihpbmZvOiBEaWFnbm9zdGljVGVtcGxhdGVJbmZvLCBhc3Q6IFRlbXBsYXRlQXN0KTogRGVmaW5pdGlvbnx1bmRlZmluZWQge1xuICBpZiAoaW5mby5maWxlTmFtZSkge1xuICAgIGNvbnN0IHRlbXBsYXRlT2Zmc2V0ID0gaW5mby5vZmZzZXQ7XG4gICAgcmV0dXJuIFt7XG4gICAgICBmaWxlTmFtZTogaW5mby5maWxlTmFtZSxcbiAgICAgIHNwYW46IHtcbiAgICAgICAgc3RhcnQ6IGFzdC5zb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldCArIHRlbXBsYXRlT2Zmc2V0LFxuICAgICAgICBlbmQ6IGFzdC5zb3VyY2VTcGFuLmVuZC5vZmZzZXQgKyB0ZW1wbGF0ZU9mZnNldFxuICAgICAgfVxuICAgIH1dO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFZhckRlY2xhcmF0aW9ucyhcbiAgICBpbmZvOiBEaWFnbm9zdGljVGVtcGxhdGVJbmZvLCBwYXRoOiBUZW1wbGF0ZUFzdFBhdGgpOiBTeW1ib2xEZWNsYXJhdGlvbltdIHtcbiAgY29uc3QgcmVzdWx0OiBTeW1ib2xEZWNsYXJhdGlvbltdID0gW107XG5cbiAgbGV0IGN1cnJlbnQgPSBwYXRoLnRhaWw7XG4gIHdoaWxlIChjdXJyZW50KSB7XG4gICAgaWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBFbWJlZGRlZFRlbXBsYXRlQXN0KSB7XG4gICAgICBmb3IgKGNvbnN0IHZhcmlhYmxlIG9mIGN1cnJlbnQudmFyaWFibGVzKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSB2YXJpYWJsZS5uYW1lO1xuXG4gICAgICAgIC8vIEZpbmQgdGhlIGZpcnN0IGRpcmVjdGl2ZSB3aXRoIGEgY29udGV4dC5cbiAgICAgICAgY29uc3QgY29udGV4dCA9XG4gICAgICAgICAgICBjdXJyZW50LmRpcmVjdGl2ZXMubWFwKGQgPT4gaW5mby5xdWVyeS5nZXRUZW1wbGF0ZUNvbnRleHQoZC5kaXJlY3RpdmUudHlwZS5yZWZlcmVuY2UpKVxuICAgICAgICAgICAgICAgIC5maW5kKGMgPT4gISFjKTtcblxuICAgICAgICAvLyBEZXRlcm1pbmUgdGhlIHR5cGUgb2YgdGhlIGNvbnRleHQgZmllbGQgcmVmZXJlbmNlZCBieSB2YXJpYWJsZS52YWx1ZS5cbiAgICAgICAgbGV0IHR5cGU6IFN5bWJvbHx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBjb250ZXh0LmdldCh2YXJpYWJsZS52YWx1ZSk7XG4gICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0eXBlID0gdmFsdWUudHlwZSAhO1xuICAgICAgICAgICAgbGV0IGtpbmQgPSBpbmZvLnF1ZXJ5LmdldFR5cGVLaW5kKHR5cGUpO1xuICAgICAgICAgICAgaWYgKGtpbmQgPT09IEJ1aWx0aW5UeXBlLkFueSB8fCBraW5kID09IEJ1aWx0aW5UeXBlLlVuYm91bmQpIHtcbiAgICAgICAgICAgICAgLy8gVGhlIGFueSB0eXBlIGlzIG5vdCB2ZXJ5IHVzZWZ1bCBoZXJlLiBGb3Igc3BlY2lhbCBjYXNlcywgc3VjaCBhcyBuZ0Zvciwgd2UgY2FuIGRvXG4gICAgICAgICAgICAgIC8vIGJldHRlci5cbiAgICAgICAgICAgICAgdHlwZSA9IHJlZmluZWRWYXJpYWJsZVR5cGUodHlwZSwgaW5mbywgY3VycmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdHlwZSkge1xuICAgICAgICAgIHR5cGUgPSBpbmZvLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLkFueSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAga2luZDogJ3ZhcmlhYmxlJywgdHlwZSwgZ2V0IGRlZmluaXRpb24oKSB7IHJldHVybiBnZXREZWZpbml0aW9uT2YoaW5mbywgdmFyaWFibGUpOyB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBjdXJyZW50ID0gcGF0aC5wYXJlbnRPZihjdXJyZW50KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHJlZmluZWRWYXJpYWJsZVR5cGUoXG4gICAgdHlwZTogU3ltYm9sLCBpbmZvOiBEaWFnbm9zdGljVGVtcGxhdGVJbmZvLCB0ZW1wbGF0ZUVsZW1lbnQ6IEVtYmVkZGVkVGVtcGxhdGVBc3QpOiBTeW1ib2wge1xuICAvLyBTcGVjaWFsIGNhc2UgdGhlIG5nRm9yIGRpcmVjdGl2ZVxuICBjb25zdCBuZ0ZvckRpcmVjdGl2ZSA9IHRlbXBsYXRlRWxlbWVudC5kaXJlY3RpdmVzLmZpbmQoZCA9PiB7XG4gICAgY29uc3QgbmFtZSA9IGlkZW50aWZpZXJOYW1lKGQuZGlyZWN0aXZlLnR5cGUpO1xuICAgIHJldHVybiBuYW1lID09ICdOZ0ZvcicgfHwgbmFtZSA9PSAnTmdGb3JPZic7XG4gIH0pO1xuICBpZiAobmdGb3JEaXJlY3RpdmUpIHtcbiAgICBjb25zdCBuZ0Zvck9mQmluZGluZyA9IG5nRm9yRGlyZWN0aXZlLmlucHV0cy5maW5kKGkgPT4gaS5kaXJlY3RpdmVOYW1lID09ICduZ0Zvck9mJyk7XG4gICAgaWYgKG5nRm9yT2ZCaW5kaW5nKSB7XG4gICAgICBjb25zdCBiaW5kaW5nVHlwZSA9IG5ldyBBc3RUeXBlKGluZm8ubWVtYmVycywgaW5mby5xdWVyeSwge30pLmdldFR5cGUobmdGb3JPZkJpbmRpbmcudmFsdWUpO1xuICAgICAgaWYgKGJpbmRpbmdUeXBlKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGluZm8ucXVlcnkuZ2V0RWxlbWVudFR5cGUoYmluZGluZ1R5cGUpO1xuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFdlIGNhbid0IGRvIGJldHRlciwgcmV0dXJuIGFueVxuICByZXR1cm4gaW5mby5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5BbnkpO1xufVxuXG5mdW5jdGlvbiBnZXRFdmVudERlY2xhcmF0aW9uKGluZm86IERpYWdub3N0aWNUZW1wbGF0ZUluZm8sIGluY2x1ZGVFdmVudD86IGJvb2xlYW4pIHtcbiAgbGV0IHJlc3VsdDogU3ltYm9sRGVjbGFyYXRpb25bXSA9IFtdO1xuICBpZiAoaW5jbHVkZUV2ZW50KSB7XG4gICAgLy8gVE9ETzogRGV0ZXJtaW5lIHRoZSB0eXBlIG9mIHRoZSBldmVudCBwYXJhbWV0ZXIgYmFzZWQgb24gdGhlIE9ic2VydmFibGU8VD4gb3IgRXZlbnRFbWl0dGVyPFQ+XG4gICAgLy8gb2YgdGhlIGV2ZW50LlxuICAgIHJlc3VsdCA9IFt7bmFtZTogJyRldmVudCcsIGtpbmQ6ICd2YXJpYWJsZScsIHR5cGU6IGluZm8ucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuQW55KX1dO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFeHByZXNzaW9uU2NvcGUoXG4gICAgaW5mbzogRGlhZ25vc3RpY1RlbXBsYXRlSW5mbywgcGF0aDogVGVtcGxhdGVBc3RQYXRoLCBpbmNsdWRlRXZlbnQ6IGJvb2xlYW4pOiBTeW1ib2xUYWJsZSB7XG4gIGxldCByZXN1bHQgPSBpbmZvLm1lbWJlcnM7XG4gIGNvbnN0IHJlZmVyZW5jZXMgPSBnZXRSZWZlcmVuY2VzKGluZm8pO1xuICBjb25zdCB2YXJpYWJsZXMgPSBnZXRWYXJEZWNsYXJhdGlvbnMoaW5mbywgcGF0aCk7XG4gIGNvbnN0IGV2ZW50cyA9IGdldEV2ZW50RGVjbGFyYXRpb24oaW5mbywgaW5jbHVkZUV2ZW50KTtcbiAgaWYgKHJlZmVyZW5jZXMubGVuZ3RoIHx8IHZhcmlhYmxlcy5sZW5ndGggfHwgZXZlbnRzLmxlbmd0aCkge1xuICAgIGNvbnN0IHJlZmVyZW5jZVRhYmxlID0gaW5mby5xdWVyeS5jcmVhdGVTeW1ib2xUYWJsZShyZWZlcmVuY2VzKTtcbiAgICBjb25zdCB2YXJpYWJsZVRhYmxlID0gaW5mby5xdWVyeS5jcmVhdGVTeW1ib2xUYWJsZSh2YXJpYWJsZXMpO1xuICAgIGNvbnN0IGV2ZW50c1RhYmxlID0gaW5mby5xdWVyeS5jcmVhdGVTeW1ib2xUYWJsZShldmVudHMpO1xuICAgIHJlc3VsdCA9IGluZm8ucXVlcnkubWVyZ2VTeW1ib2xUYWJsZShbcmVzdWx0LCByZWZlcmVuY2VUYWJsZSwgdmFyaWFibGVUYWJsZSwgZXZlbnRzVGFibGVdKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5jbGFzcyBFeHByZXNzaW9uRGlhZ25vc3RpY3NWaXNpdG9yIGV4dGVuZHMgUmVjdXJzaXZlVGVtcGxhdGVBc3RWaXNpdG9yIHtcbiAgcHJpdmF0ZSBwYXRoOiBUZW1wbGF0ZUFzdFBhdGg7XG4gIHByaXZhdGUgZGlyZWN0aXZlU3VtbWFyeTogQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnk7XG5cbiAgZGlhZ25vc3RpY3M6IEV4cHJlc3Npb25EaWFnbm9zdGljW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaW5mbzogRGlhZ25vc3RpY1RlbXBsYXRlSW5mbyxcbiAgICAgIHByaXZhdGUgZ2V0RXhwcmVzc2lvblNjb3BlOiAocGF0aDogVGVtcGxhdGVBc3RQYXRoLCBpbmNsdWRlRXZlbnQ6IGJvb2xlYW4pID0+IFN5bWJvbFRhYmxlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnBhdGggPSBuZXcgQXN0UGF0aDxUZW1wbGF0ZUFzdD4oW10pO1xuICB9XG5cbiAgdmlzaXREaXJlY3RpdmUoYXN0OiBEaXJlY3RpdmVBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgLy8gT3ZlcnJpZGUgdGhlIGRlZmF1bHQgY2hpbGQgdmlzaXRvciB0byBpZ25vcmUgdGhlIGhvc3QgcHJvcGVydGllcyBvZiBhIGRpcmVjdGl2ZS5cbiAgICBpZiAoYXN0LmlucHV0cyAmJiBhc3QuaW5wdXRzLmxlbmd0aCkge1xuICAgICAgdGVtcGxhdGVWaXNpdEFsbCh0aGlzLCBhc3QuaW5wdXRzLCBjb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICB2aXNpdEJvdW5kVGV4dChhc3Q6IEJvdW5kVGV4dEFzdCk6IHZvaWQge1xuICAgIHRoaXMucHVzaChhc3QpO1xuICAgIHRoaXMuZGlhZ25vc2VFeHByZXNzaW9uKGFzdC52YWx1ZSwgYXN0LnNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0LCBmYWxzZSk7XG4gICAgdGhpcy5wb3AoKTtcbiAgfVxuXG4gIHZpc2l0RGlyZWN0aXZlUHJvcGVydHkoYXN0OiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0KTogdm9pZCB7XG4gICAgdGhpcy5wdXNoKGFzdCk7XG4gICAgdGhpcy5kaWFnbm9zZUV4cHJlc3Npb24oYXN0LnZhbHVlLCB0aGlzLmF0dHJpYnV0ZVZhbHVlTG9jYXRpb24oYXN0KSwgZmFsc2UpO1xuICAgIHRoaXMucG9wKCk7XG4gIH1cblxuICB2aXNpdEVsZW1lbnRQcm9wZXJ0eShhc3Q6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0KTogdm9pZCB7XG4gICAgdGhpcy5wdXNoKGFzdCk7XG4gICAgdGhpcy5kaWFnbm9zZUV4cHJlc3Npb24oYXN0LnZhbHVlLCB0aGlzLmF0dHJpYnV0ZVZhbHVlTG9jYXRpb24oYXN0KSwgZmFsc2UpO1xuICAgIHRoaXMucG9wKCk7XG4gIH1cblxuICB2aXNpdEV2ZW50KGFzdDogQm91bmRFdmVudEFzdCk6IHZvaWQge1xuICAgIHRoaXMucHVzaChhc3QpO1xuICAgIHRoaXMuZGlhZ25vc2VFeHByZXNzaW9uKGFzdC5oYW5kbGVyLCB0aGlzLmF0dHJpYnV0ZVZhbHVlTG9jYXRpb24oYXN0KSwgdHJ1ZSk7XG4gICAgdGhpcy5wb3AoKTtcbiAgfVxuXG4gIHZpc2l0VmFyaWFibGUoYXN0OiBWYXJpYWJsZUFzdCk6IHZvaWQge1xuICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMuZGlyZWN0aXZlU3VtbWFyeTtcbiAgICBpZiAoZGlyZWN0aXZlICYmIGFzdC52YWx1ZSkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMuaW5mby5xdWVyeS5nZXRUZW1wbGF0ZUNvbnRleHQoZGlyZWN0aXZlLnR5cGUucmVmZXJlbmNlKSAhO1xuICAgICAgaWYgKGNvbnRleHQgJiYgIWNvbnRleHQuaGFzKGFzdC52YWx1ZSkpIHtcbiAgICAgICAgaWYgKGFzdC52YWx1ZSA9PT0gJyRpbXBsaWNpdCcpIHtcbiAgICAgICAgICB0aGlzLnJlcG9ydEVycm9yKFxuICAgICAgICAgICAgICAnVGhlIHRlbXBsYXRlIGNvbnRleHQgZG9lcyBub3QgaGF2ZSBhbiBpbXBsaWNpdCB2YWx1ZScsIHNwYW5PZihhc3Quc291cmNlU3BhbikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIGBUaGUgdGVtcGxhdGUgY29udGV4dCBkb2VzIG5vdCBkZWZpbmVkIGEgbWVtYmVyIGNhbGxlZCAnJHthc3QudmFsdWV9J2AsXG4gICAgICAgICAgICAgIHNwYW5PZihhc3Quc291cmNlU3BhbikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmlzaXRFbGVtZW50KGFzdDogRWxlbWVudEFzdCwgY29udGV4dDogYW55KTogdm9pZCB7XG4gICAgdGhpcy5wdXNoKGFzdCk7XG4gICAgc3VwZXIudmlzaXRFbGVtZW50KGFzdCwgY29udGV4dCk7XG4gICAgdGhpcy5wb3AoKTtcbiAgfVxuXG4gIHZpc2l0RW1iZWRkZWRUZW1wbGF0ZShhc3Q6IEVtYmVkZGVkVGVtcGxhdGVBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgY29uc3QgcHJldmlvdXNEaXJlY3RpdmVTdW1tYXJ5ID0gdGhpcy5kaXJlY3RpdmVTdW1tYXJ5O1xuXG4gICAgdGhpcy5wdXNoKGFzdCk7XG5cbiAgICAvLyBGaW5kIGRpcmVjdGl2ZSB0aGF0IHJlZmVyZW5jZXMgdGhpcyB0ZW1wbGF0ZVxuICAgIHRoaXMuZGlyZWN0aXZlU3VtbWFyeSA9XG4gICAgICAgIGFzdC5kaXJlY3RpdmVzLm1hcChkID0+IGQuZGlyZWN0aXZlKS5maW5kKGQgPT4gaGFzVGVtcGxhdGVSZWZlcmVuY2UoZC50eXBlKSkgITtcblxuICAgIC8vIFByb2Nlc3MgY2hpbGRyZW5cbiAgICBzdXBlci52aXNpdEVtYmVkZGVkVGVtcGxhdGUoYXN0LCBjb250ZXh0KTtcblxuICAgIHRoaXMucG9wKCk7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZVN1bW1hcnkgPSBwcmV2aW91c0RpcmVjdGl2ZVN1bW1hcnk7XG4gIH1cblxuICBwcml2YXRlIGF0dHJpYnV0ZVZhbHVlTG9jYXRpb24oYXN0OiBUZW1wbGF0ZUFzdCkge1xuICAgIGNvbnN0IHBhdGggPSBmaW5kTm9kZSh0aGlzLmluZm8uaHRtbEFzdCwgYXN0LnNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0KTtcbiAgICBjb25zdCBsYXN0ID0gcGF0aC50YWlsO1xuICAgIGlmIChsYXN0IGluc3RhbmNlb2YgQXR0cmlidXRlICYmIGxhc3QudmFsdWVTcGFuKSB7XG4gICAgICAvLyBBZGQgMSBmb3IgdGhlIHF1b3RlLlxuICAgICAgcmV0dXJuIGxhc3QudmFsdWVTcGFuLnN0YXJ0Lm9mZnNldCArIDE7XG4gICAgfVxuICAgIHJldHVybiBhc3Quc291cmNlU3Bhbi5zdGFydC5vZmZzZXQ7XG4gIH1cblxuICBwcml2YXRlIGRpYWdub3NlRXhwcmVzc2lvbihhc3Q6IEFTVCwgb2Zmc2V0OiBudW1iZXIsIGluY2x1ZGVFdmVudDogYm9vbGVhbikge1xuICAgIGNvbnN0IHNjb3BlID0gdGhpcy5nZXRFeHByZXNzaW9uU2NvcGUodGhpcy5wYXRoLCBpbmNsdWRlRXZlbnQpO1xuICAgIHRoaXMuZGlhZ25vc3RpY3MucHVzaCguLi5nZXRFeHByZXNzaW9uRGlhZ25vc3RpY3Moc2NvcGUsIGFzdCwgdGhpcy5pbmZvLnF1ZXJ5LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IGluY2x1ZGVFdmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5tYXAoZCA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGFuOiBvZmZzZXRTcGFuKGQuYXN0LnNwYW4sIG9mZnNldCArIHRoaXMuaW5mby5vZmZzZXQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kOiBkLmtpbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGQubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpKTtcbiAgfVxuXG4gIHByaXZhdGUgcHVzaChhc3Q6IFRlbXBsYXRlQXN0KSB7IHRoaXMucGF0aC5wdXNoKGFzdCk7IH1cblxuICBwcml2YXRlIHBvcCgpIHsgdGhpcy5wYXRoLnBvcCgpOyB9XG5cbiAgcHJpdmF0ZSByZXBvcnRFcnJvcihtZXNzYWdlOiBzdHJpbmcsIHNwYW46IFNwYW58dW5kZWZpbmVkKSB7XG4gICAgaWYgKHNwYW4pIHtcbiAgICAgIHRoaXMuZGlhZ25vc3RpY3MucHVzaChcbiAgICAgICAgICB7c3Bhbjogb2Zmc2V0U3BhbihzcGFuLCB0aGlzLmluZm8ub2Zmc2V0KSwga2luZDogRGlhZ25vc3RpY0tpbmQuRXJyb3IsIG1lc3NhZ2V9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlcG9ydFdhcm5pbmcobWVzc2FnZTogc3RyaW5nLCBzcGFuOiBTcGFuKSB7XG4gICAgdGhpcy5kaWFnbm9zdGljcy5wdXNoKFxuICAgICAgICB7c3Bhbjogb2Zmc2V0U3BhbihzcGFuLCB0aGlzLmluZm8ub2Zmc2V0KSwga2luZDogRGlhZ25vc3RpY0tpbmQuV2FybmluZywgbWVzc2FnZX0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhhc1RlbXBsYXRlUmVmZXJlbmNlKHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEpOiBib29sZWFuIHtcbiAgaWYgKHR5cGUuZGlEZXBzKSB7XG4gICAgZm9yIChsZXQgZGlEZXAgb2YgdHlwZS5kaURlcHMpIHtcbiAgICAgIGlmIChkaURlcC50b2tlbiAmJiBkaURlcC50b2tlbi5pZGVudGlmaWVyICYmXG4gICAgICAgICAgaWRlbnRpZmllck5hbWUoZGlEZXAudG9rZW4gIS5pZGVudGlmaWVyICEpID09ICdUZW1wbGF0ZVJlZicpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG9mZnNldFNwYW4oc3BhbjogU3BhbiwgYW1vdW50OiBudW1iZXIpOiBTcGFuIHtcbiAgcmV0dXJuIHtzdGFydDogc3Bhbi5zdGFydCArIGFtb3VudCwgZW5kOiBzcGFuLmVuZCArIGFtb3VudH07XG59XG5cbmZ1bmN0aW9uIHNwYW5PZihzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBTcGFuIHtcbiAgcmV0dXJuIHtzdGFydDogc291cmNlU3Bhbi5zdGFydC5vZmZzZXQsIGVuZDogc291cmNlU3Bhbi5lbmQub2Zmc2V0fTtcbn0iXX0=