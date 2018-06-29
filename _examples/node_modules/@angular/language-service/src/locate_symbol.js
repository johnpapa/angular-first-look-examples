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
        define("@angular/language-service/src/locate_symbol", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler-cli/src/language_services", "@angular/language-service/src/expressions", "@angular/language-service/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var language_services_1 = require("@angular/compiler-cli/src/language_services");
    var expressions_1 = require("@angular/language-service/src/expressions");
    var utils_1 = require("@angular/language-service/src/utils");
    function locateSymbol(info) {
        if (!info.position)
            return undefined;
        var templatePosition = info.position - info.template.span.start;
        var path = utils_1.findTemplateAstAt(info.templateAst, templatePosition);
        if (path.tail) {
            var symbol_1 = undefined;
            var span_1 = undefined;
            var attributeValueSymbol_1 = function (ast, inEvent) {
                if (inEvent === void 0) { inEvent = false; }
                var attribute = findAttribute(info);
                if (attribute) {
                    if (utils_1.inSpan(templatePosition, utils_1.spanOf(attribute.valueSpan))) {
                        var dinfo = utils_1.diagnosticInfoFromTemplateInfo(info);
                        var scope = language_services_1.getExpressionScope(dinfo, path, inEvent);
                        if (attribute.valueSpan) {
                            var expressionOffset = attribute.valueSpan.start.offset + 1;
                            var result = expressions_1.getExpressionSymbol(scope, ast, templatePosition - expressionOffset, info.template.query);
                            if (result) {
                                symbol_1 = result.symbol;
                                span_1 = utils_1.offsetSpan(result.span, expressionOffset);
                            }
                        }
                        return true;
                    }
                }
                return false;
            };
            path.tail.visit({
                visitNgContent: function (ast) { },
                visitEmbeddedTemplate: function (ast) { },
                visitElement: function (ast) {
                    var component = ast.directives.find(function (d) { return d.directive.isComponent; });
                    if (component) {
                        symbol_1 = info.template.query.getTypeSymbol(component.directive.type.reference);
                        symbol_1 = symbol_1 && new OverrideKindSymbol(symbol_1, 'component');
                        span_1 = utils_1.spanOf(ast);
                    }
                    else {
                        // Find a directive that matches the element name
                        var directive = ast.directives.find(function (d) { return d.directive.selector != null && d.directive.selector.indexOf(ast.name) >= 0; });
                        if (directive) {
                            symbol_1 = info.template.query.getTypeSymbol(directive.directive.type.reference);
                            symbol_1 = symbol_1 && new OverrideKindSymbol(symbol_1, 'directive');
                            span_1 = utils_1.spanOf(ast);
                        }
                    }
                },
                visitReference: function (ast) {
                    symbol_1 = ast.value && info.template.query.getTypeSymbol(compiler_1.tokenReference(ast.value));
                    span_1 = utils_1.spanOf(ast);
                },
                visitVariable: function (ast) { },
                visitEvent: function (ast) {
                    if (!attributeValueSymbol_1(ast.handler, /* inEvent */ true)) {
                        symbol_1 = findOutputBinding(info, path, ast);
                        symbol_1 = symbol_1 && new OverrideKindSymbol(symbol_1, 'event');
                        span_1 = utils_1.spanOf(ast);
                    }
                },
                visitElementProperty: function (ast) { attributeValueSymbol_1(ast.value); },
                visitAttr: function (ast) { },
                visitBoundText: function (ast) {
                    var expressionPosition = templatePosition - ast.sourceSpan.start.offset;
                    if (utils_1.inSpan(expressionPosition, ast.value.span)) {
                        var dinfo = utils_1.diagnosticInfoFromTemplateInfo(info);
                        var scope = language_services_1.getExpressionScope(dinfo, path, /* includeEvent */ false);
                        var result = expressions_1.getExpressionSymbol(scope, ast.value, expressionPosition, info.template.query);
                        if (result) {
                            symbol_1 = result.symbol;
                            span_1 = utils_1.offsetSpan(result.span, ast.sourceSpan.start.offset);
                        }
                    }
                },
                visitText: function (ast) { },
                visitDirective: function (ast) {
                    symbol_1 = info.template.query.getTypeSymbol(ast.directive.type.reference);
                    span_1 = utils_1.spanOf(ast);
                },
                visitDirectiveProperty: function (ast) {
                    if (!attributeValueSymbol_1(ast.value)) {
                        symbol_1 = findInputBinding(info, path, ast);
                        span_1 = utils_1.spanOf(ast);
                    }
                }
            }, null);
            if (symbol_1 && span_1) {
                return { symbol: symbol_1, span: utils_1.offsetSpan(span_1, info.template.span.start) };
            }
        }
    }
    exports.locateSymbol = locateSymbol;
    function findAttribute(info) {
        if (info.position) {
            var templatePosition = info.position - info.template.span.start;
            var path = compiler_1.findNode(info.htmlAst, templatePosition);
            return path.first(compiler_1.Attribute);
        }
    }
    function findInputBinding(info, path, binding) {
        var element = path.first(compiler_1.ElementAst);
        if (element) {
            try {
                for (var _a = tslib_1.__values(element.directives), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var directive = _b.value;
                    var invertedInput = invertMap(directive.directive.inputs);
                    var fieldName = invertedInput[binding.templateName];
                    if (fieldName) {
                        var classSymbol = info.template.query.getTypeSymbol(directive.directive.type.reference);
                        if (classSymbol) {
                            return classSymbol.members().get(fieldName);
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
        }
        var e_1, _c;
    }
    function findOutputBinding(info, path, binding) {
        var element = path.first(compiler_1.ElementAst);
        if (element) {
            try {
                for (var _a = tslib_1.__values(element.directives), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var directive = _b.value;
                    var invertedOutputs = invertMap(directive.directive.outputs);
                    var fieldName = invertedOutputs[binding.name];
                    if (fieldName) {
                        var classSymbol = info.template.query.getTypeSymbol(directive.directive.type.reference);
                        if (classSymbol) {
                            return classSymbol.members().get(fieldName);
                        }
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
        }
        var e_2, _c;
    }
    function invertMap(obj) {
        var result = {};
        try {
            for (var _a = tslib_1.__values(Object.keys(obj)), _b = _a.next(); !_b.done; _b = _a.next()) {
                var name_1 = _b.value;
                var v = obj[name_1];
                result[v] = name_1;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return result;
        var e_3, _c;
    }
    /**
     * Wrap a symbol and change its kind to component.
     */
    var OverrideKindSymbol = /** @class */ (function () {
        function OverrideKindSymbol(sym, kindOverride) {
            this.sym = sym;
            this.kind = kindOverride;
        }
        Object.defineProperty(OverrideKindSymbol.prototype, "name", {
            get: function () { return this.sym.name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OverrideKindSymbol.prototype, "language", {
            get: function () { return this.sym.language; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OverrideKindSymbol.prototype, "type", {
            get: function () { return this.sym.type; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OverrideKindSymbol.prototype, "container", {
            get: function () { return this.sym.container; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OverrideKindSymbol.prototype, "public", {
            get: function () { return this.sym.public; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OverrideKindSymbol.prototype, "callable", {
            get: function () { return this.sym.callable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OverrideKindSymbol.prototype, "nullable", {
            get: function () { return this.sym.nullable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OverrideKindSymbol.prototype, "definition", {
            get: function () { return this.sym.definition; },
            enumerable: true,
            configurable: true
        });
        OverrideKindSymbol.prototype.members = function () { return this.sym.members(); };
        OverrideKindSymbol.prototype.signatures = function () { return this.sym.signatures(); };
        OverrideKindSymbol.prototype.selectSignature = function (types) { return this.sym.selectSignature(types); };
        OverrideKindSymbol.prototype.indexed = function (argument) { return this.sym.indexed(argument); };
        return OverrideKindSymbol;
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRlX3N5bWJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2xhbmd1YWdlLXNlcnZpY2Uvc3JjL2xvY2F0ZV9zeW1ib2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsOENBQStKO0lBQy9KLGlGQUErRTtJQUcvRSx5RUFBa0Q7SUFFbEQsNkRBQXNHO0lBT3RHLHNCQUE2QixJQUFrQjtRQUM3QyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ3JDLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDbEUsSUFBTSxJQUFJLEdBQUcseUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ25FLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxRQUFNLEdBQXFCLFNBQVMsQ0FBQztZQUN6QyxJQUFJLE1BQUksR0FBbUIsU0FBUyxDQUFDO1lBQ3JDLElBQU0sc0JBQW9CLEdBQUcsVUFBQyxHQUFRLEVBQUUsT0FBd0I7Z0JBQXhCLHdCQUFBLEVBQUEsZUFBd0I7Z0JBQzlELElBQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDZCxFQUFFLENBQUMsQ0FBQyxjQUFNLENBQUMsZ0JBQWdCLEVBQUUsY0FBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDMUQsSUFBTSxLQUFLLEdBQUcsc0NBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ25ELElB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LEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFeEMsdUNBQVUsR0FBVixjQUFlLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUU5Qyw0Q0FBZSxHQUFmLFVBQWdCLEtBQWUsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVFLG9DQUFPLEdBQVAsVUFBUSxRQUFnQixJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEUseUJBQUM7SUFBRCxDQUFDLEFBM0JELElBMkJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FTVCwgQXR0cmlidXRlLCBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBCb3VuZEV2ZW50QXN0LCBFbGVtZW50QXN0LCBUZW1wbGF0ZUFzdCwgVGVtcGxhdGVBc3RQYXRoLCBmaW5kTm9kZSwgdG9rZW5SZWZlcmVuY2V9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCB7Z2V0RXhwcmVzc2lvblNjb3BlfSBmcm9tICdAYW5ndWxhci9jb21waWxlci1jbGkvc3JjL2xhbmd1YWdlX3NlcnZpY2VzJztcblxuaW1wb3J0IHtUZW1wbGF0ZUluZm99IGZyb20gJy4vY29tbW9uJztcbmltcG9ydCB7Z2V0RXhwcmVzc2lvblN5bWJvbH0gZnJvbSAnLi9leHByZXNzaW9ucyc7XG5pbXBvcnQge0RlZmluaXRpb24sIExvY2F0aW9uLCBTcGFuLCBTeW1ib2wsIFN5bWJvbFRhYmxlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7ZGlhZ25vc3RpY0luZm9Gcm9tVGVtcGxhdGVJbmZvLCBmaW5kVGVtcGxhdGVBc3RBdCwgaW5TcGFuLCBvZmZzZXRTcGFuLCBzcGFuT2Z9IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN5bWJvbEluZm8ge1xuICBzeW1ib2w6IFN5bWJvbDtcbiAgc3BhbjogU3Bhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvY2F0ZVN5bWJvbChpbmZvOiBUZW1wbGF0ZUluZm8pOiBTeW1ib2xJbmZvfHVuZGVmaW5lZCB7XG4gIGlmICghaW5mby5wb3NpdGlvbikgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgdGVtcGxhdGVQb3NpdGlvbiA9IGluZm8ucG9zaXRpb24gLSBpbmZvLnRlbXBsYXRlLnNwYW4uc3RhcnQ7XG4gIGNvbnN0IHBhdGggPSBmaW5kVGVtcGxhdGVBc3RBdChpbmZvLnRlbXBsYXRlQXN0LCB0ZW1wbGF0ZVBvc2l0aW9uKTtcbiAgaWYgKHBhdGgudGFpbCkge1xuICAgIGxldCBzeW1ib2w6IFN5bWJvbHx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgbGV0IHNwYW46IFNwYW58dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGF0dHJpYnV0ZVZhbHVlU3ltYm9sID0gKGFzdDogQVNULCBpbkV2ZW50OiBib29sZWFuID0gZmFsc2UpOiBib29sZWFuID0+IHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGZpbmRBdHRyaWJ1dGUoaW5mbyk7XG4gICAgICBpZiAoYXR0cmlidXRlKSB7XG4gICAgICAgIGlmIChpblNwYW4odGVtcGxhdGVQb3NpdGlvbiwgc3Bhbk9mKGF0dHJpYnV0ZS52YWx1ZVNwYW4pKSkge1xuICAgICAgICAgIGNvbnN0IGRpbmZvID0gZGlhZ25vc3RpY0luZm9Gcm9tVGVtcGxhdGVJbmZvKGluZm8pO1xuICAgICAgICAgIGNvbnN0IHNjb3BlID0gZ2V0RXhwcmVzc2lvblNjb3BlKGRpbmZvLCBwYXRoLCBpbkV2ZW50KTtcbiAgICAgICAgICBpZiAoYXR0cmlidXRlLnZhbHVlU3Bhbikge1xuICAgICAgICAgICAgY29uc3QgZXhwcmVzc2lvbk9mZnNldCA9IGF0dHJpYnV0ZS52YWx1ZVNwYW4uc3RhcnQub2Zmc2V0ICsgMTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGdldEV4cHJlc3Npb25TeW1ib2woXG4gICAgICAgICAgICAgICAgc2NvcGUsIGFzdCwgdGVtcGxhdGVQb3NpdGlvbiAtIGV4cHJlc3Npb25PZmZzZXQsIGluZm8udGVtcGxhdGUucXVlcnkpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICBzeW1ib2wgPSByZXN1bHQuc3ltYm9sO1xuICAgICAgICAgICAgICBzcGFuID0gb2Zmc2V0U3BhbihyZXN1bHQuc3BhbiwgZXhwcmVzc2lvbk9mZnNldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICBwYXRoLnRhaWwudmlzaXQoXG4gICAgICAgIHtcbiAgICAgICAgICB2aXNpdE5nQ29udGVudChhc3QpIHt9LFxuICAgICAgICAgIHZpc2l0RW1iZWRkZWRUZW1wbGF0ZShhc3QpIHt9LFxuICAgICAgICAgIHZpc2l0RWxlbWVudChhc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGFzdC5kaXJlY3RpdmVzLmZpbmQoZCA9PiBkLmRpcmVjdGl2ZS5pc0NvbXBvbmVudCk7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50KSB7XG4gICAgICAgICAgICAgIHN5bWJvbCA9IGluZm8udGVtcGxhdGUucXVlcnkuZ2V0VHlwZVN5bWJvbChjb21wb25lbnQuZGlyZWN0aXZlLnR5cGUucmVmZXJlbmNlKTtcbiAgICAgICAgICAgICAgc3ltYm9sID0gc3ltYm9sICYmIG5ldyBPdmVycmlkZUtpbmRTeW1ib2woc3ltYm9sLCAnY29tcG9uZW50Jyk7XG4gICAgICAgICAgICAgIHNwYW4gPSBzcGFuT2YoYXN0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIEZpbmQgYSBkaXJlY3RpdmUgdGhhdCBtYXRjaGVzIHRoZSBlbGVtZW50IG5hbWVcbiAgICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gYXN0LmRpcmVjdGl2ZXMuZmluZChcbiAgICAgICAgICAgICAgICAgIGQgPT4gZC5kaXJlY3RpdmUuc2VsZWN0b3IgIT0gbnVsbCAmJiBkLmRpcmVjdGl2ZS5zZWxlY3Rvci5pbmRleE9mKGFzdC5uYW1lKSA+PSAwKTtcbiAgICAgICAgICAgICAgaWYgKGRpcmVjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHN5bWJvbCA9IGluZm8udGVtcGxhdGUucXVlcnkuZ2V0VHlwZVN5bWJvbChkaXJlY3RpdmUuZGlyZWN0aXZlLnR5cGUucmVmZXJlbmNlKTtcbiAgICAgICAgICAgICAgICBzeW1ib2wgPSBzeW1ib2wgJiYgbmV3IE92ZXJyaWRlS2luZFN5bWJvbChzeW1ib2wsICdkaXJlY3RpdmUnKTtcbiAgICAgICAgICAgICAgICBzcGFuID0gc3Bhbk9mKGFzdCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHZpc2l0UmVmZXJlbmNlKGFzdCkge1xuICAgICAgICAgICAgc3ltYm9sID0gYXN0LnZhbHVlICYmIGluZm8udGVtcGxhdGUucXVlcnkuZ2V0VHlwZVN5bWJvbCh0b2tlblJlZmVyZW5jZShhc3QudmFsdWUpKTtcbiAgICAgICAgICAgIHNwYW4gPSBzcGFuT2YoYXN0KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHZpc2l0VmFyaWFibGUoYXN0KSB7fSxcbiAgICAgICAgICB2aXNpdEV2ZW50KGFzdCkge1xuICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVWYWx1ZVN5bWJvbChhc3QuaGFuZGxlciwgLyogaW5FdmVudCAqLyB0cnVlKSkge1xuICAgICAgICAgICAgICBzeW1ib2wgPSBmaW5kT3V0cHV0QmluZGluZyhpbmZvLCBwYXRoLCBhc3QpO1xuICAgICAgICAgICAgICBzeW1ib2wgPSBzeW1ib2wgJiYgbmV3IE92ZXJyaWRlS2luZFN5bWJvbChzeW1ib2wsICdldmVudCcpO1xuICAgICAgICAgICAgICBzcGFuID0gc3Bhbk9mKGFzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB2aXNpdEVsZW1lbnRQcm9wZXJ0eShhc3QpIHsgYXR0cmlidXRlVmFsdWVTeW1ib2woYXN0LnZhbHVlKTsgfSxcbiAgICAgICAgICB2aXNpdEF0dHIoYXN0KSB7fSxcbiAgICAgICAgICB2aXNpdEJvdW5kVGV4dChhc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4cHJlc3Npb25Qb3NpdGlvbiA9IHRlbXBsYXRlUG9zaXRpb24gLSBhc3Quc291cmNlU3Bhbi5zdGFydC5vZmZzZXQ7XG4gICAgICAgICAgICBpZiAoaW5TcGFuKGV4cHJlc3Npb25Qb3NpdGlvbiwgYXN0LnZhbHVlLnNwYW4pKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGRpbmZvID0gZGlhZ25vc3RpY0luZm9Gcm9tVGVtcGxhdGVJbmZvKGluZm8pO1xuICAgICAgICAgICAgICBjb25zdCBzY29wZSA9IGdldEV4cHJlc3Npb25TY29wZShkaW5mbywgcGF0aCwgLyogaW5jbHVkZUV2ZW50ICovIGZhbHNlKTtcbiAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID1cbiAgICAgICAgICAgICAgICAgIGdldEV4cHJlc3Npb25TeW1ib2woc2NvcGUsIGFzdC52YWx1ZSwgZXhwcmVzc2lvblBvc2l0aW9uLCBpbmZvLnRlbXBsYXRlLnF1ZXJ5KTtcbiAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHN5bWJvbCA9IHJlc3VsdC5zeW1ib2w7XG4gICAgICAgICAgICAgICAgc3BhbiA9IG9mZnNldFNwYW4ocmVzdWx0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHZpc2l0VGV4dChhc3QpIHt9LFxuICAgICAgICAgIHZpc2l0RGlyZWN0aXZlKGFzdCkge1xuICAgICAgICAgICAgc3ltYm9sID0gaW5mby50ZW1wbGF0ZS5xdWVyeS5nZXRUeXBlU3ltYm9sKGFzdC5kaXJlY3RpdmUudHlwZS5yZWZlcmVuY2UpO1xuICAgICAgICAgICAgc3BhbiA9IHNwYW5PZihhc3QpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdmlzaXREaXJlY3RpdmVQcm9wZXJ0eShhc3QpIHtcbiAgICAgICAgICAgIGlmICghYXR0cmlidXRlVmFsdWVTeW1ib2woYXN0LnZhbHVlKSkge1xuICAgICAgICAgICAgICBzeW1ib2wgPSBmaW5kSW5wdXRCaW5kaW5nKGluZm8sIHBhdGgsIGFzdCk7XG4gICAgICAgICAgICAgIHNwYW4gPSBzcGFuT2YoYXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG51bGwpO1xuICAgIGlmIChzeW1ib2wgJiYgc3Bhbikge1xuICAgICAgcmV0dXJuIHtzeW1ib2wsIHNwYW46IG9mZnNldFNwYW4oc3BhbiwgaW5mby50ZW1wbGF0ZS5zcGFuLnN0YXJ0KX07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRBdHRyaWJ1dGUoaW5mbzogVGVtcGxhdGVJbmZvKTogQXR0cmlidXRlfHVuZGVmaW5lZCB7XG4gIGlmIChpbmZvLnBvc2l0aW9uKSB7XG4gICAgY29uc3QgdGVtcGxhdGVQb3NpdGlvbiA9IGluZm8ucG9zaXRpb24gLSBpbmZvLnRlbXBsYXRlLnNwYW4uc3RhcnQ7XG4gICAgY29uc3QgcGF0aCA9IGZpbmROb2RlKGluZm8uaHRtbEFzdCwgdGVtcGxhdGVQb3NpdGlvbik7XG4gICAgcmV0dXJuIHBhdGguZmlyc3QoQXR0cmlidXRlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kSW5wdXRCaW5kaW5nKFxuICAgIGluZm86IFRlbXBsYXRlSW5mbywgcGF0aDogVGVtcGxhdGVBc3RQYXRoLCBiaW5kaW5nOiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0KTogU3ltYm9sfFxuICAgIHVuZGVmaW5lZCB7XG4gIGNvbnN0IGVsZW1lbnQgPSBwYXRoLmZpcnN0KEVsZW1lbnRBc3QpO1xuICBpZiAoZWxlbWVudCkge1xuICAgIGZvciAoY29uc3QgZGlyZWN0aXZlIG9mIGVsZW1lbnQuZGlyZWN0aXZlcykge1xuICAgICAgY29uc3QgaW52ZXJ0ZWRJbnB1dCA9IGludmVydE1hcChkaXJlY3RpdmUuZGlyZWN0aXZlLmlucHV0cyk7XG4gICAgICBjb25zdCBmaWVsZE5hbWUgPSBpbnZlcnRlZElucHV0W2JpbmRpbmcudGVtcGxhdGVOYW1lXTtcbiAgICAgIGlmIChmaWVsZE5hbWUpIHtcbiAgICAgICAgY29uc3QgY2xhc3NTeW1ib2wgPSBpbmZvLnRlbXBsYXRlLnF1ZXJ5LmdldFR5cGVTeW1ib2woZGlyZWN0aXZlLmRpcmVjdGl2ZS50eXBlLnJlZmVyZW5jZSk7XG4gICAgICAgIGlmIChjbGFzc1N5bWJvbCkge1xuICAgICAgICAgIHJldHVybiBjbGFzc1N5bWJvbC5tZW1iZXJzKCkuZ2V0KGZpZWxkTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluZE91dHB1dEJpbmRpbmcoXG4gICAgaW5mbzogVGVtcGxhdGVJbmZvLCBwYXRoOiBUZW1wbGF0ZUFzdFBhdGgsIGJpbmRpbmc6IEJvdW5kRXZlbnRBc3QpOiBTeW1ib2x8dW5kZWZpbmVkIHtcbiAgY29uc3QgZWxlbWVudCA9IHBhdGguZmlyc3QoRWxlbWVudEFzdCk7XG4gIGlmIChlbGVtZW50KSB7XG4gICAgZm9yIChjb25zdCBkaXJlY3RpdmUgb2YgZWxlbWVudC5kaXJlY3RpdmVzKSB7XG4gICAgICBjb25zdCBpbnZlcnRlZE91dHB1dHMgPSBpbnZlcnRNYXAoZGlyZWN0aXZlLmRpcmVjdGl2ZS5vdXRwdXRzKTtcbiAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IGludmVydGVkT3V0cHV0c1tiaW5kaW5nLm5hbWVdO1xuICAgICAgaWYgKGZpZWxkTmFtZSkge1xuICAgICAgICBjb25zdCBjbGFzc1N5bWJvbCA9IGluZm8udGVtcGxhdGUucXVlcnkuZ2V0VHlwZVN5bWJvbChkaXJlY3RpdmUuZGlyZWN0aXZlLnR5cGUucmVmZXJlbmNlKTtcbiAgICAgICAgaWYgKGNsYXNzU3ltYm9sKSB7XG4gICAgICAgICAgcmV0dXJuIGNsYXNzU3ltYm9sLm1lbWJlcnMoKS5nZXQoZmllbGROYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpbnZlcnRNYXAob2JqOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30pOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30ge1xuICBjb25zdCByZXN1bHQ6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBmb3IgKGNvbnN0IG5hbWUgb2YgT2JqZWN0LmtleXMob2JqKSkge1xuICAgIGNvbnN0IHYgPSBvYmpbbmFtZV07XG4gICAgcmVzdWx0W3ZdID0gbmFtZTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFdyYXAgYSBzeW1ib2wgYW5kIGNoYW5nZSBpdHMga2luZCB0byBjb21wb25lbnQuXG4gKi9cbmNsYXNzIE92ZXJyaWRlS2luZFN5bWJvbCBpbXBsZW1lbnRzIFN5bWJvbCB7XG4gIHB1YmxpYyByZWFkb25seSBraW5kOiBzdHJpbmc7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc3ltOiBTeW1ib2wsIGtpbmRPdmVycmlkZTogc3RyaW5nKSB7IHRoaXMua2luZCA9IGtpbmRPdmVycmlkZTsgfVxuXG4gIGdldCBuYW1lKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLnN5bS5uYW1lOyB9XG5cbiAgZ2V0IGxhbmd1YWdlKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLnN5bS5sYW5ndWFnZTsgfVxuXG4gIGdldCB0eXBlKCk6IFN5bWJvbHx1bmRlZmluZWQgeyByZXR1cm4gdGhpcy5zeW0udHlwZTsgfVxuXG4gIGdldCBjb250YWluZXIoKTogU3ltYm9sfHVuZGVmaW5lZCB7IHJldHVybiB0aGlzLnN5bS5jb250YWluZXI7IH1cblxuICBnZXQgcHVibGljKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5zeW0ucHVibGljOyB9XG5cbiAgZ2V0IGNhbGxhYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5zeW0uY2FsbGFibGU7IH1cblxuICBnZXQgbnVsbGFibGUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnN5bS5udWxsYWJsZTsgfVxuXG4gIGdldCBkZWZpbml0aW9uKCk6IERlZmluaXRpb24geyByZXR1cm4gdGhpcy5zeW0uZGVmaW5pdGlvbjsgfVxuXG4gIG1lbWJlcnMoKSB7IHJldHVybiB0aGlzLnN5bS5tZW1iZXJzKCk7IH1cblxuICBzaWduYXR1cmVzKCkgeyByZXR1cm4gdGhpcy5zeW0uc2lnbmF0dXJlcygpOyB9XG5cbiAgc2VsZWN0U2lnbmF0dXJlKHR5cGVzOiBTeW1ib2xbXSkgeyByZXR1cm4gdGhpcy5zeW0uc2VsZWN0U2lnbmF0dXJlKHR5cGVzKTsgfVxuXG4gIGluZGV4ZWQoYXJndW1lbnQ6IFN5bWJvbCkgeyByZXR1cm4gdGhpcy5zeW0uaW5kZXhlZChhcmd1bWVudCk7IH1cbn1cbiJdfQ==