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
        define("@angular/language-service/src/utils", ["require", "exports", "tslib", "@angular/compiler", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    function isParseSourceSpan(value) {
        return value && !!value.start;
    }
    exports.isParseSourceSpan = isParseSourceSpan;
    function spanOf(span) {
        if (!span)
            return undefined;
        if (isParseSourceSpan(span)) {
            return { start: span.start.offset, end: span.end.offset };
        }
        else {
            if (span.endSourceSpan) {
                return { start: span.sourceSpan.start.offset, end: span.endSourceSpan.end.offset };
            }
            else if (span.children && span.children.length) {
                return {
                    start: span.sourceSpan.start.offset,
                    end: spanOf(span.children[span.children.length - 1]).end
                };
            }
            return { start: span.sourceSpan.start.offset, end: span.sourceSpan.end.offset };
        }
    }
    exports.spanOf = spanOf;
    function inSpan(position, span, exclusive) {
        return span != null && (exclusive ? position >= span.start && position < span.end :
            position >= span.start && position <= span.end);
    }
    exports.inSpan = inSpan;
    function offsetSpan(span, amount) {
        return { start: span.start + amount, end: span.end + amount };
    }
    exports.offsetSpan = offsetSpan;
    function isNarrower(spanA, spanB) {
        return spanA.start >= spanB.start && spanA.end <= spanB.end;
    }
    exports.isNarrower = isNarrower;
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
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return false;
        var e_1, _c;
    }
    exports.hasTemplateReference = hasTemplateReference;
    function getSelectors(info) {
        var map = new Map();
        var selectors = flatten(info.directives.map(function (directive) {
            var selectors = compiler_1.CssSelector.parse(directive.selector);
            selectors.forEach(function (selector) { return map.set(selector, directive); });
            return selectors;
        }));
        return { selectors: selectors, map: map };
    }
    exports.getSelectors = getSelectors;
    function flatten(a) {
        return (_a = []).concat.apply(_a, tslib_1.__spread(a));
        var _a;
    }
    exports.flatten = flatten;
    function removeSuffix(value, suffix) {
        if (value.endsWith(suffix))
            return value.substring(0, value.length - suffix.length);
        return value;
    }
    exports.removeSuffix = removeSuffix;
    function uniqueByName(elements) {
        if (elements) {
            var result = [];
            var set = new Set();
            try {
                for (var elements_1 = tslib_1.__values(elements), elements_1_1 = elements_1.next(); !elements_1_1.done; elements_1_1 = elements_1.next()) {
                    var element = elements_1_1.value;
                    if (!set.has(element.name)) {
                        set.add(element.name);
                        result.push(element);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (elements_1_1 && !elements_1_1.done && (_a = elements_1.return)) _a.call(elements_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return result;
        }
        var e_2, _a;
    }
    exports.uniqueByName = uniqueByName;
    function isTypescriptVersion(low, high) {
        var version = ts.version;
        if (version.substring(0, low.length) < low)
            return false;
        if (high && (version.substring(0, high.length) > high))
            return false;
        return true;
    }
    exports.isTypescriptVersion = isTypescriptVersion;
    function diagnosticInfoFromTemplateInfo(info) {
        return {
            fileName: info.fileName,
            offset: info.template.span.start,
            query: info.template.query,
            members: info.template.members,
            htmlAst: info.htmlAst,
            templateAst: info.templateAst
        };
    }
    exports.diagnosticInfoFromTemplateInfo = diagnosticInfoFromTemplateInfo;
    function findTemplateAstAt(ast, position, allowWidening) {
        if (allowWidening === void 0) { allowWidening = false; }
        var path = [];
        var visitor = new /** @class */ (function (_super) {
            tslib_1.__extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype.visit = function (ast, context) {
                var span = spanOf(ast);
                if (inSpan(position, span)) {
                    var len = path.length;
                    if (!len || allowWidening || isNarrower(span, spanOf(path[len - 1]))) {
                        path.push(ast);
                    }
                }
                else {
                    // Returning a value here will result in the children being skipped.
                    return true;
                }
            };
            class_1.prototype.visitEmbeddedTemplate = function (ast, context) {
                return this.visitChildren(context, function (visit) {
                    // Ignore reference, variable and providers
                    visit(ast.attrs);
                    visit(ast.directives);
                    visit(ast.children);
                });
            };
            class_1.prototype.visitElement = function (ast, context) {
                return this.visitChildren(context, function (visit) {
                    // Ingnore providers
                    visit(ast.attrs);
                    visit(ast.inputs);
                    visit(ast.outputs);
                    visit(ast.references);
                    visit(ast.directives);
                    visit(ast.children);
                });
            };
            class_1.prototype.visitDirective = function (ast, context) {
                // Ignore the host properties of a directive
                var result = this.visitChildren(context, function (visit) { visit(ast.inputs); });
                // We never care about the diretive itself, just its inputs.
                if (path[path.length - 1] == ast) {
                    path.pop();
                }
                return result;
            };
            return class_1;
        }(compiler_1.RecursiveTemplateAstVisitor));
        compiler_1.templateVisitAll(visitor, ast);
        return new compiler_1.AstPath(path, position);
    }
    exports.findTemplateAstAt = findTemplateAstAt;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9sYW5ndWFnZS1zZXJ2aWNlL3NyYy91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBNlQ7SUFFN1QsK0JBQWlDO0lBV2pDLDJCQUFrQyxLQUFVO1FBQzFDLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDaEMsQ0FBQztJQUZELDhDQUVDO0lBS0QsZ0JBQXVCLElBQW1DO1FBQ3hELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUM1QixFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsTUFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBQyxDQUFDO1FBQzFELENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixNQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUMsQ0FBQztZQUNuRixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLENBQUM7b0JBQ0wsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxD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SUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVFLDREQUE0RDtnQkFDNUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDakMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNiLENBQUM7Z0JBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNoQixDQUFDO1lBQ0gsY0FBQztRQUFELENBQUMsQUE1Q21CLENBQWMsc0NBQTJCLEVBNEM1RCxDQUFDO1FBRUYsMkJBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRS9CLE1BQU0sQ0FBQyxJQUFJLGtCQUFPLENBQWMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFwREQsOENBb0RDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FzdFBhdGgsIENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5LCBDb21waWxlVHlwZU1ldGFkYXRhLCBDc3NTZWxlY3RvciwgRGlyZWN0aXZlQXN0LCBFbGVtZW50QXN0LCBFbWJlZGRlZFRlbXBsYXRlQXN0LCBIdG1sQXN0UGF0aCwgTm9kZSBhcyBIdG1sTm9kZSwgUGFyc2VTb3VyY2VTcGFuLCBSZWN1cnNpdmVUZW1wbGF0ZUFzdFZpc2l0b3IsIFJlY3Vyc2l2ZVZpc2l0b3IsIFRlbXBsYXRlQXN0LCBUZW1wbGF0ZUFzdFBhdGgsIGlkZW50aWZpZXJOYW1lLCB0ZW1wbGF0ZVZpc2l0QWxsLCB2aXNpdEFsbH0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0IHtEaWFnbm9zdGljVGVtcGxhdGVJbmZvfSBmcm9tICdAYW5ndWxhci9jb21waWxlci1jbGkvc3JjL2xhbmd1YWdlX3NlcnZpY2VzJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge1NlbGVjdG9ySW5mbywgVGVtcGxhdGVJbmZvfSBmcm9tICcuL2NvbW1vbic7XG5pbXBvcnQge1NwYW59IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNwYW5Ib2xkZXIge1xuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW47XG4gIGVuZFNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW58bnVsbDtcbiAgY2hpbGRyZW4/OiBTcGFuSG9sZGVyW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BhcnNlU291cmNlU3Bhbih2YWx1ZTogYW55KTogdmFsdWUgaXMgUGFyc2VTb3VyY2VTcGFuIHtcbiAgcmV0dXJuIHZhbHVlICYmICEhdmFsdWUuc3RhcnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGFuT2Yoc3BhbjogU3BhbkhvbGRlcik6IFNwYW47XG5leHBvcnQgZnVuY3Rpb24gc3Bhbk9mKHNwYW46IFBhcnNlU291cmNlU3Bhbik6IFNwYW47XG5leHBvcnQgZnVuY3Rpb24gc3Bhbk9mKHNwYW46IFNwYW5Ib2xkZXIgfCBQYXJzZVNvdXJjZVNwYW4gfCB1bmRlZmluZWQpOiBTcGFufHVuZGVmaW5lZDtcbmV4cG9ydCBmdW5jdGlvbiBzcGFuT2Yoc3Bhbj86IFNwYW5Ib2xkZXIgfCBQYXJzZVNvdXJjZVNwYW4pOiBTcGFufHVuZGVmaW5lZCB7XG4gIGlmICghc3BhbikgcmV0dXJuIHVuZGVmaW5lZDtcbiAgaWYgKGlzUGFyc2VTb3VyY2VTcGFuKHNwYW4pKSB7XG4gICAgcmV0dXJuIHtzdGFydDogc3Bhbi5zdGFydC5vZmZzZXQsIGVuZDogc3Bhbi5lbmQub2Zmc2V0fTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoc3Bhbi5lbmRTb3VyY2VTcGFuKSB7XG4gICAgICByZXR1cm4ge3N0YXJ0OiBzcGFuLnNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0LCBlbmQ6IHNwYW4uZW5kU291cmNlU3Bhbi5lbmQub2Zmc2V0fTtcbiAgICB9IGVsc2UgaWYgKHNwYW4uY2hpbGRyZW4gJiYgc3Bhbi5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0OiBzcGFuLnNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0LFxuICAgICAgICBlbmQ6IHNwYW5PZihzcGFuLmNoaWxkcmVuW3NwYW4uY2hpbGRyZW4ubGVuZ3RoIC0gMV0pICEuZW5kXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge3N0YXJ0OiBzcGFuLnNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0LCBlbmQ6IHNwYW4uc291cmNlU3Bhbi5lbmQub2Zmc2V0fTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5TcGFuKHBvc2l0aW9uOiBudW1iZXIsIHNwYW4/OiBTcGFuLCBleGNsdXNpdmU/OiBib29sZWFuKTogYm9vbGVhbiB7XG4gIHJldHVybiBzcGFuICE9IG51bGwgJiYgKGV4Y2x1c2l2ZSA/IHBvc2l0aW9uID49IHNwYW4uc3RhcnQgJiYgcG9zaXRpb24gPCBzcGFuLmVuZCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uID49IHNwYW4uc3RhcnQgJiYgcG9zaXRpb24gPD0gc3Bhbi5lbmQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb2Zmc2V0U3BhbihzcGFuOiBTcGFuLCBhbW91bnQ6IG51bWJlcik6IFNwYW4ge1xuICByZXR1cm4ge3N0YXJ0OiBzcGFuLnN0YXJ0ICsgYW1vdW50LCBlbmQ6IHNwYW4uZW5kICsgYW1vdW50fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmFycm93ZXIoc3BhbkE6IFNwYW4sIHNwYW5COiBTcGFuKTogYm9vbGVhbiB7XG4gIHJldHVybiBzcGFuQS5zdGFydCA+PSBzcGFuQi5zdGFydCAmJiBzcGFuQS5lbmQgPD0gc3BhbkIuZW5kO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzVGVtcGxhdGVSZWZlcmVuY2UodHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSk6IGJvb2xlYW4ge1xuICBpZiAodHlwZS5kaURlcHMpIHtcbiAgICBmb3IgKGxldCBkaURlcCBvZiB0eXBlLmRpRGVwcykge1xuICAgICAgaWYgKGRpRGVwLnRva2VuICYmIGRpRGVwLnRva2VuLmlkZW50aWZpZXIgJiZcbiAgICAgICAgICBpZGVudGlmaWVyTmFtZShkaURlcC50b2tlbiAhLmlkZW50aWZpZXIgISkgPT0gJ1RlbXBsYXRlUmVmJylcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbGVjdG9ycyhpbmZvOiBUZW1wbGF0ZUluZm8pOiBTZWxlY3RvckluZm8ge1xuICBjb25zdCBtYXAgPSBuZXcgTWFwPENzc1NlbGVjdG9yLCBDb21waWxlRGlyZWN0aXZlU3VtbWFyeT4oKTtcbiAgY29uc3Qgc2VsZWN0b3JzOiBDc3NTZWxlY3RvcltdID0gZmxhdHRlbihpbmZvLmRpcmVjdGl2ZXMubWFwKGRpcmVjdGl2ZSA9PiB7XG4gICAgY29uc3Qgc2VsZWN0b3JzOiBDc3NTZWxlY3RvcltdID0gQ3NzU2VsZWN0b3IucGFyc2UoZGlyZWN0aXZlLnNlbGVjdG9yICEpO1xuICAgIHNlbGVjdG9ycy5mb3JFYWNoKHNlbGVjdG9yID0+IG1hcC5zZXQoc2VsZWN0b3IsIGRpcmVjdGl2ZSkpO1xuICAgIHJldHVybiBzZWxlY3RvcnM7XG4gIH0pKTtcbiAgcmV0dXJuIHtzZWxlY3RvcnMsIG1hcH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbGF0dGVuPFQ+KGE6IFRbXVtdKSB7XG4gIHJldHVybiAoPFRbXT5bXSkuY29uY2F0KC4uLmEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlU3VmZml4KHZhbHVlOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKSB7XG4gIGlmICh2YWx1ZS5lbmRzV2l0aChzdWZmaXgpKSByZXR1cm4gdmFsdWUuc3Vic3RyaW5nKDAsIHZhbHVlLmxlbmd0aCAtIHN1ZmZpeC5sZW5ndGgpO1xuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bmlxdWVCeU5hbWUgPCBUIGV4dGVuZHMge1xuICBuYW1lOiBzdHJpbmc7XG59XG4+IChlbGVtZW50czogVFtdIHwgdW5kZWZpbmVkKTogVFtdfHVuZGVmaW5lZCB7XG4gIGlmIChlbGVtZW50cykge1xuICAgIGNvbnN0IHJlc3VsdDogVFtdID0gW107XG4gICAgY29uc3Qgc2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICBpZiAoIXNldC5oYXMoZWxlbWVudC5uYW1lKSkge1xuICAgICAgICBzZXQuYWRkKGVsZW1lbnQubmFtZSk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1R5cGVzY3JpcHRWZXJzaW9uKGxvdzogc3RyaW5nLCBoaWdoPzogc3RyaW5nKSB7XG4gIGNvbnN0IHZlcnNpb24gPSB0cy52ZXJzaW9uO1xuXG4gIGlmICh2ZXJzaW9uLnN1YnN0cmluZygwLCBsb3cubGVuZ3RoKSA8IGxvdykgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChoaWdoICYmICh2ZXJzaW9uLnN1YnN0cmluZygwLCBoaWdoLmxlbmd0aCkgPiBoaWdoKSkgcmV0dXJuIGZhbHNlO1xuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlhZ25vc3RpY0luZm9Gcm9tVGVtcGxhdGVJbmZvKGluZm86IFRlbXBsYXRlSW5mbyk6IERpYWdub3N0aWNUZW1wbGF0ZUluZm8ge1xuICByZXR1cm4ge1xuICAgIGZpbGVOYW1lOiBpbmZvLmZpbGVOYW1lLFxuICAgIG9mZnNldDogaW5mby50ZW1wbGF0ZS5zcGFuLnN0YXJ0LFxuICAgIHF1ZXJ5OiBpbmZvLnRlbXBsYXRlLnF1ZXJ5LFxuICAgIG1lbWJlcnM6IGluZm8udGVtcGxhdGUubWVtYmVycyxcbiAgICBodG1sQXN0OiBpbmZvLmh0bWxBc3QsXG4gICAgdGVtcGxhdGVBc3Q6IGluZm8udGVtcGxhdGVBc3RcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRUZW1wbGF0ZUFzdEF0KFxuICAgIGFzdDogVGVtcGxhdGVBc3RbXSwgcG9zaXRpb246IG51bWJlciwgYWxsb3dXaWRlbmluZzogYm9vbGVhbiA9IGZhbHNlKTogVGVtcGxhdGVBc3RQYXRoIHtcbiAgY29uc3QgcGF0aDogVGVtcGxhdGVBc3RbXSA9IFtdO1xuICBjb25zdCB2aXNpdG9yID0gbmV3IGNsYXNzIGV4dGVuZHMgUmVjdXJzaXZlVGVtcGxhdGVBc3RWaXNpdG9yIHtcbiAgICB2aXNpdChhc3Q6IFRlbXBsYXRlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgICAgbGV0IHNwYW4gPSBzcGFuT2YoYXN0KTtcbiAgICAgIGlmIChpblNwYW4ocG9zaXRpb24sIHNwYW4pKSB7XG4gICAgICAgIGNvbnN0IGxlbiA9IHBhdGgubGVuZ3RoO1xuICAgICAgICBpZiAoIWxlbiB8fCBhbGxvd1dpZGVuaW5nIHx8IGlzTmFycm93ZXIoc3Bhbiwgc3Bhbk9mKHBhdGhbbGVuIC0gMV0pKSkge1xuICAgICAgICAgIHBhdGgucHVzaChhc3QpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBSZXR1cm5pbmcgYSB2YWx1ZSBoZXJlIHdpbGwgcmVzdWx0IGluIHRoZSBjaGlsZHJlbiBiZWluZyBza2lwcGVkLlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2aXNpdEVtYmVkZGVkVGVtcGxhdGUoYXN0OiBFbWJlZGRlZFRlbXBsYXRlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRDaGlsZHJlbihjb250ZXh0LCB2aXNpdCA9PiB7XG4gICAgICAgIC8vIElnbm9yZSByZWZlcmVuY2UsIHZhcmlhYmxlIGFuZCBwcm92aWRlcnNcbiAgICAgICAgdmlzaXQoYXN0LmF0dHJzKTtcbiAgICAgICAgdmlzaXQoYXN0LmRpcmVjdGl2ZXMpO1xuICAgICAgICB2aXNpdChhc3QuY2hpbGRyZW4pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmlzaXRFbGVtZW50KGFzdDogRWxlbWVudEFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0Q2hpbGRyZW4oY29udGV4dCwgdmlzaXQgPT4ge1xuICAgICAgICAvLyBJbmdub3JlIHByb3ZpZGVyc1xuICAgICAgICB2aXNpdChhc3QuYXR0cnMpO1xuICAgICAgICB2aXNpdChhc3QuaW5wdXRzKTtcbiAgICAgICAgdmlzaXQoYXN0Lm91dHB1dHMpO1xuICAgICAgICB2aXNpdChhc3QucmVmZXJlbmNlcyk7XG4gICAgICAgIHZpc2l0KGFzdC5kaXJlY3RpdmVzKTtcbiAgICAgICAgdmlzaXQoYXN0LmNoaWxkcmVuKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZpc2l0RGlyZWN0aXZlKGFzdDogRGlyZWN0aXZlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgICAgLy8gSWdub3JlIHRoZSBob3N0IHByb3BlcnRpZXMgb2YgYSBkaXJlY3RpdmVcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMudmlzaXRDaGlsZHJlbihjb250ZXh0LCB2aXNpdCA9PiB7IHZpc2l0KGFzdC5pbnB1dHMpOyB9KTtcbiAgICAgIC8vIFdlIG5ldmVyIGNhcmUgYWJvdXQgdGhlIGRpcmV0aXZlIGl0c2VsZiwganVzdCBpdHMgaW5wdXRzLlxuICAgICAgaWYgKHBhdGhbcGF0aC5sZW5ndGggLSAxXSA9PSBhc3QpIHtcbiAgICAgICAgcGF0aC5wb3AoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9O1xuXG4gIHRlbXBsYXRlVmlzaXRBbGwodmlzaXRvciwgYXN0KTtcblxuICByZXR1cm4gbmV3IEFzdFBhdGg8VGVtcGxhdGVBc3Q+KHBhdGgsIHBvc2l0aW9uKTtcbn1cbiJdfQ==