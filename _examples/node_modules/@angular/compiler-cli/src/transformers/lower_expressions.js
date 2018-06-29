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
        define("@angular/compiler-cli/src/transformers/lower_expressions", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/metadata/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var index_1 = require("@angular/compiler-cli/src/metadata/index");
    function toMap(items, select) {
        return new Map(items.map(function (i) { return [select(i), i]; }));
    }
    // We will never lower expressions in a nested lexical scope so avoid entering them.
    // This also avoids a bug in TypeScript 2.3 where the lexical scopes get out of sync
    // when using visitEachChild.
    function isLexicalScope(node) {
        switch (node.kind) {
            case ts.SyntaxKind.ArrowFunction:
            case ts.SyntaxKind.FunctionExpression:
            case ts.SyntaxKind.FunctionDeclaration:
            case ts.SyntaxKind.ClassExpression:
            case ts.SyntaxKind.ClassDeclaration:
            case ts.SyntaxKind.FunctionType:
            case ts.SyntaxKind.TypeLiteral:
            case ts.SyntaxKind.ArrayType:
                return true;
        }
        return false;
    }
    function transformSourceFile(sourceFile, requests, context) {
        var inserts = [];
        // Calculate the range of interesting locations. The transform will only visit nodes in this
        // range to improve the performance on large files.
        var locations = Array.from(requests.keys());
        var min = Math.min.apply(Math, tslib_1.__spread(locations));
        var max = Math.max.apply(Math, tslib_1.__spread(locations));
        // Visit nodes matching the request and synthetic nodes added by tsickle
        function shouldVisit(pos, end) {
            return (pos <= max && end >= min) || pos == -1;
        }
        function visitSourceFile(sourceFile) {
            function topLevelStatement(node) {
                var declarations = [];
                function visitNode(node) {
                    // Get the original node before tsickle
                    var _a = ts.getOriginalNode(node), pos = _a.pos, end = _a.end, kind = _a.kind, originalParent = _a.parent;
                    var nodeRequest = requests.get(pos);
                    if (nodeRequest && nodeRequest.kind == kind && nodeRequest.end == end) {
                        // This node is requested to be rewritten as a reference to the exported name.
                        if (originalParent && originalParent.kind === ts.SyntaxKind.VariableDeclaration) {
                            // As the value represents the whole initializer of a variable declaration,
                            // just refer to that variable. This e.g. helps to preserve closure comments
                            // at the right place.
                            var varParent = originalParent;
                            if (varParent.name.kind === ts.SyntaxKind.Identifier) {
                                var varName = varParent.name.text;
                                var exportName_1 = nodeRequest.name;
                                declarations.push({
                                    name: exportName_1,
                                    node: ts.createIdentifier(varName),
                                    order: 1 /* AfterStmt */
                                });
                                return node;
                            }
                        }
                        // Record that the node needs to be moved to an exported variable with the given name
                        var exportName = nodeRequest.name;
                        declarations.push({ name: exportName, node: node, order: 0 /* BeforeStmt */ });
                        return ts.createIdentifier(exportName);
                    }
                    var result = node;
                    if (shouldVisit(pos, end) && !isLexicalScope(node)) {
                        result = ts.visitEachChild(node, visitNode, context);
                    }
                    return result;
                }
                // Get the original node before tsickle
                var _a = ts.getOriginalNode(node), pos = _a.pos, end = _a.end;
                var resultStmt;
                if (shouldVisit(pos, end)) {
                    resultStmt = ts.visitEachChild(node, visitNode, context);
                }
                else {
                    resultStmt = node;
                }
                if (declarations.length) {
                    inserts.push({ relativeTo: resultStmt, declarations: declarations });
                }
                return resultStmt;
            }
            var newStatements = sourceFile.statements.map(topLevelStatement);
            if (inserts.length) {
                // Insert the declarations relative to the rewritten statement that references them.
                var insertMap_1 = toMap(inserts, function (i) { return i.relativeTo; });
                var tmpStatements_1 = [];
                newStatements.forEach(function (statement) {
                    var insert = insertMap_1.get(statement);
                    if (insert) {
                        var before = insert.declarations.filter(function (d) { return d.order === 0 /* BeforeStmt */; });
                        if (before.length) {
                            tmpStatements_1.push(createVariableStatementForDeclarations(before));
                        }
                        tmpStatements_1.push(statement);
                        var after = insert.declarations.filter(function (d) { return d.order === 1 /* AfterStmt */; });
                        if (after.length) {
                            tmpStatements_1.push(createVariableStatementForDeclarations(after));
                        }
                    }
                    else {
                        tmpStatements_1.push(statement);
                    }
                });
                // Insert an exports clause to export the declarations
                tmpStatements_1.push(ts.createExportDeclaration(
                /* decorators */ undefined, 
                /* modifiers */ undefined, ts.createNamedExports(inserts
                    .reduce(function (accumulator, insert) { return tslib_1.__spread(accumulator, insert.declarations); }, [])
                    .map(function (declaration) { return ts.createExportSpecifier(
                /* propertyName */ undefined, declaration.name); }))));
                newStatements = tmpStatements_1;
            }
            // Note: We cannot use ts.updateSourcefile here as
            // it does not work well with decorators.
            // See https://github.com/Microsoft/TypeScript/issues/17384
            var newSf = ts.getMutableClone(sourceFile);
            if (!(sourceFile.flags & ts.NodeFlags.Synthesized)) {
                newSf.flags &= ~ts.NodeFlags.Synthesized;
            }
            newSf.statements = ts.setTextRange(ts.createNodeArray(newStatements), sourceFile.statements);
            return newSf;
        }
        return visitSourceFile(sourceFile);
    }
    function createVariableStatementForDeclarations(declarations) {
        var varDecls = declarations.map(function (i) { return ts.createVariableDeclaration(i.name, /* type */ undefined, i.node); });
        return ts.createVariableStatement(
        /* modifiers */ undefined, ts.createVariableDeclarationList(varDecls, ts.NodeFlags.Const));
    }
    function getExpressionLoweringTransformFactory(requestsMap, program) {
        // Return the factory
        return function (context) { return function (sourceFile) {
            // We need to use the original SourceFile for reading metadata, and not the transformed one.
            var originalFile = program.getSourceFile(sourceFile.fileName);
            if (originalFile) {
                var requests = requestsMap.getRequests(originalFile);
                if (requests && requests.size) {
                    return transformSourceFile(sourceFile, requests, context);
                }
            }
            return sourceFile;
        }; };
    }
    exports.getExpressionLoweringTransformFactory = getExpressionLoweringTransformFactory;
    function isEligibleForLowering(node) {
        if (node) {
            switch (node.kind) {
                case ts.SyntaxKind.SourceFile:
                case ts.SyntaxKind.Decorator:
                    // Lower expressions that are local to the module scope or
                    // in a decorator.
                    return true;
                case ts.SyntaxKind.ClassDeclaration:
                case ts.SyntaxKind.InterfaceDeclaration:
                case ts.SyntaxKind.EnumDeclaration:
                case ts.SyntaxKind.FunctionDeclaration:
                    // Don't lower expressions in a declaration.
                    return false;
                case ts.SyntaxKind.VariableDeclaration:
                    // Avoid lowering expressions already in an exported variable declaration
                    return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) == 0;
            }
            return isEligibleForLowering(node.parent);
        }
        return true;
    }
    function isPrimitive(value) {
        return Object(value) !== value;
    }
    function isRewritten(value) {
        return index_1.isMetadataGlobalReferenceExpression(value) && compiler_1.isLoweredSymbol(value.name);
    }
    function isLiteralFieldNamed(node, names) {
        if (node.parent && node.parent.kind == ts.SyntaxKind.PropertyAssignment) {
            var property = node.parent;
            if (property.parent && property.parent.kind == ts.SyntaxKind.ObjectLiteralExpression &&
                property.name && property.name.kind == ts.SyntaxKind.Identifier) {
                var propertyName = property.name;
                return names.has(propertyName.text);
            }
        }
        return false;
    }
    var LowerMetadataTransform = /** @class */ (function () {
        function LowerMetadataTransform(lowerableFieldNames) {
            this.requests = new Map();
            this.lowerableFieldNames = new Set(lowerableFieldNames);
        }
        // RequestMap
        LowerMetadataTransform.prototype.getRequests = function (sourceFile) {
            var result = this.requests.get(sourceFile.fileName);
            if (!result) {
                // Force the metadata for this source file to be collected which
                // will recursively call start() populating the request map;
                this.cache.getMetadata(sourceFile);
                // If we still don't have the requested metadata, the file is not a module
                // or is a declaration file so return an empty map.
                result = this.requests.get(sourceFile.fileName) || new Map();
            }
            return result;
        };
        // MetadataTransformer
        LowerMetadataTransform.prototype.connect = function (cache) { this.cache = cache; };
        LowerMetadataTransform.prototype.start = function (sourceFile) {
            var _this = this;
            var identNumber = 0;
            var freshIdent = function () { return compiler_1.createLoweredSymbol(identNumber++); };
            var requests = new Map();
            this.requests.set(sourceFile.fileName, requests);
            var replaceNode = function (node) {
                var name = freshIdent();
                requests.set(node.pos, { name: name, kind: node.kind, location: node.pos, end: node.end });
                return { __symbolic: 'reference', name: name };
            };
            var isExportedSymbol = (function () {
                var exportTable;
                return function (node) {
                    if (node.kind == ts.SyntaxKind.Identifier) {
                        var ident = node;
                        if (!exportTable) {
                            exportTable = createExportTableFor(sourceFile);
                        }
                        return exportTable.has(ident.text);
                    }
                    return false;
                };
            })();
            var isExportedPropertyAccess = function (node) {
                if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
                    var pae = node;
                    if (isExportedSymbol(pae.expression)) {
                        return true;
                    }
                }
                return false;
            };
            var hasLowerableParentCache = new Map();
            var shouldBeLowered = function (node) {
                if (node === undefined) {
                    return false;
                }
                var lowerable = false;
                if ((node.kind === ts.SyntaxKind.ArrowFunction ||
                    node.kind === ts.SyntaxKind.FunctionExpression) &&
                    isEligibleForLowering(node)) {
                    lowerable = true;
                }
                else if (isLiteralFieldNamed(node, _this.lowerableFieldNames) && isEligibleForLowering(node) &&
                    !isExportedSymbol(node) && !isExportedPropertyAccess(node)) {
                    lowerable = true;
                }
                return lowerable;
            };
            var hasLowerableParent = function (node) {
                if (node === undefined) {
                    return false;
                }
                if (!hasLowerableParentCache.has(node)) {
                    hasLowerableParentCache.set(node, shouldBeLowered(node.parent) || hasLowerableParent(node.parent));
                }
                return hasLowerableParentCache.get(node);
            };
            var isLowerable = function (node) {
                if (node === undefined) {
                    return false;
                }
                return shouldBeLowered(node) && !hasLowerableParent(node);
            };
            return function (value, node) {
                if (!isPrimitive(value) && !isRewritten(value) && isLowerable(node)) {
                    return replaceNode(node);
                }
                return value;
            };
        };
        return LowerMetadataTransform;
    }());
    exports.LowerMetadataTransform = LowerMetadataTransform;
    function createExportTableFor(sourceFile) {
        var exportTable = new Set();
        // Lazily collect all the exports from the source file
        ts.forEachChild(sourceFile, function scan(node) {
            switch (node.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                case ts.SyntaxKind.FunctionDeclaration:
                case ts.SyntaxKind.InterfaceDeclaration:
                    if ((ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) != 0) {
                        var classDeclaration = node;
                        var name = classDeclaration.name;
                        if (name)
                            exportTable.add(name.text);
                    }
                    break;
                case ts.SyntaxKind.VariableStatement:
                    var variableStatement = node;
                    try {
                        for (var _a = tslib_1.__values(variableStatement.declarationList.declarations), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var declaration = _b.value;
                            scan(declaration);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    break;
                case ts.SyntaxKind.VariableDeclaration:
                    var variableDeclaration = node;
                    if ((ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) != 0 &&
                        variableDeclaration.name.kind == ts.SyntaxKind.Identifier) {
                        var name = variableDeclaration.name;
                        exportTable.add(name.text);
                    }
                    break;
                case ts.SyntaxKind.ExportDeclaration:
                    var exportDeclaration = node;
                    var moduleSpecifier = exportDeclaration.moduleSpecifier, exportClause = exportDeclaration.exportClause;
                    if (!moduleSpecifier && exportClause) {
                        exportClause.elements.forEach(function (spec) { exportTable.add(spec.name.text); });
                    }
            }
            var e_1, _c;
        });
        return exportTable;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG93ZXJfZXhwcmVzc2lvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL3RyYW5zZm9ybWVycy9sb3dlcl9leHByZXNzaW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBdUU7SUFDdkUsK0JBQWlDO0lBRWpDLGtFQUEwSTtJQXlCMUksZUFBcUIsS0FBVSxFQUFFLE1BQXNCO1FBQ3JELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFTLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQWQsQ0FBYyxDQUFDLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQsb0ZBQW9GO0lBQ3BGLG9GQUFvRjtJQUNwRiw2QkFBNkI7SUFDN0Isd0JBQXdCLElBQWE7UUFDbkMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbEIsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQztZQUNqQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUM7WUFDdEMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDO1lBQ3ZDLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUM7WUFDbkMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1lBQ3BDLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUM7WUFDaEMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQztZQUMvQixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUztnQkFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsTUFB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QztnQkFDUixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsbUJBQW1CO29CQUNwQyxJQUFNLG1CQUFtQixHQUFHLElBQThCLENBQUM7b0JBQzNELEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQzt3QkFDbEUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7d0JBQzlELElBQU0sSUFBSSxHQUFHLG1CQUFtQixDQUFDLElBQXFCLENBQUM7d0JBQ3ZELFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM3QixDQUFDO29CQUNELEtBQUssQ0FBQztnQkFDUixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsaUJBQWlCO29CQUNsQyxJQUFNLGlCQUFpQixHQUFHLElBQTRCLENBQUM7b0JBQ2hELElBQUEsbURBQWUsRUFBRSw2Q0FBWSxDQUFzQjtvQkFDMUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQzt3QkFDckMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQU0sV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlFLENBQUM7WUFDTCxDQUFDOztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUNyQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NyZWF0ZUxvd2VyZWRTeW1ib2wsIGlzTG93ZXJlZFN5bWJvbH0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Q29sbGVjdG9yT3B0aW9ucywgTWV0YWRhdGFDb2xsZWN0b3IsIE1ldGFkYXRhVmFsdWUsIE1vZHVsZU1ldGFkYXRhLCBpc01ldGFkYXRhR2xvYmFsUmVmZXJlbmNlRXhwcmVzc2lvbn0gZnJvbSAnLi4vbWV0YWRhdGEvaW5kZXgnO1xuaW1wb3J0IHtNZXRhZGF0YUNhY2hlLCBNZXRhZGF0YVRyYW5zZm9ybWVyLCBWYWx1ZVRyYW5zZm9ybX0gZnJvbSAnLi9tZXRhZGF0YV9jYWNoZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG93ZXJpbmdSZXF1ZXN0IHtcbiAga2luZDogdHMuU3ludGF4S2luZDtcbiAgbG9jYXRpb246IG51bWJlcjtcbiAgZW5kOiBudW1iZXI7XG4gIG5hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgUmVxdWVzdExvY2F0aW9uTWFwID0gTWFwPG51bWJlciwgTG93ZXJpbmdSZXF1ZXN0PjtcblxuY29uc3QgZW51bSBEZWNsYXJhdGlvbk9yZGVyIHsgQmVmb3JlU3RtdCwgQWZ0ZXJTdG10IH1cblxuaW50ZXJmYWNlIERlY2xhcmF0aW9uIHtcbiAgbmFtZTogc3RyaW5nO1xuICBub2RlOiB0cy5Ob2RlO1xuICBvcmRlcjogRGVjbGFyYXRpb25PcmRlcjtcbn1cblxuaW50ZXJmYWNlIERlY2xhcmF0aW9uSW5zZXJ0IHtcbiAgZGVjbGFyYXRpb25zOiBEZWNsYXJhdGlvbltdO1xuICByZWxhdGl2ZVRvOiB0cy5Ob2RlO1xufVxuXG5mdW5jdGlvbiB0b01hcDxULCBLPihpdGVtczogVFtdLCBzZWxlY3Q6IChpdGVtOiBUKSA9PiBLKTogTWFwPEssIFQ+IHtcbiAgcmV0dXJuIG5ldyBNYXAoaXRlbXMubWFwPFtLLCBUXT4oaSA9PiBbc2VsZWN0KGkpLCBpXSkpO1xufVxuXG4vLyBXZSB3aWxsIG5ldmVyIGxvd2VyIGV4cHJlc3Npb25zIGluIGEgbmVzdGVkIGxleGljYWwgc2NvcGUgc28gYXZvaWQgZW50ZXJpbmcgdGhlbS5cbi8vIFRoaXMgYWxzbyBhdm9pZHMgYSBidWcgaW4gVHlwZVNjcmlwdCAyLjMgd2hlcmUgdGhlIGxleGljYWwgc2NvcGVzIGdldCBvdXQgb2Ygc3luY1xuLy8gd2hlbiB1c2luZyB2aXNpdEVhY2hDaGlsZC5cbmZ1bmN0aW9uIGlzTGV4aWNhbFNjb3BlKG5vZGU6IHRzLk5vZGUpOiBib29sZWFuIHtcbiAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXJyb3dGdW5jdGlvbjpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuRnVuY3Rpb25FeHByZXNzaW9uOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5GdW5jdGlvbkRlY2xhcmF0aW9uOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbGFzc0V4cHJlc3Npb246XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb246XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uVHlwZTpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHlwZUxpdGVyYWw6XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLkFycmF5VHlwZTpcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtU291cmNlRmlsZShcbiAgICBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCByZXF1ZXN0czogUmVxdWVzdExvY2F0aW9uTWFwLFxuICAgIGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6IHRzLlNvdXJjZUZpbGUge1xuICBjb25zdCBpbnNlcnRzOiBEZWNsYXJhdGlvbkluc2VydFtdID0gW107XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSByYW5nZSBvZiBpbnRlcmVzdGluZyBsb2NhdGlvbnMuIFRoZSB0cmFuc2Zvcm0gd2lsbCBvbmx5IHZpc2l0IG5vZGVzIGluIHRoaXNcbiAgLy8gcmFuZ2UgdG8gaW1wcm92ZSB0aGUgcGVyZm9ybWFuY2Ugb24gbGFyZ2UgZmlsZXMuXG4gIGNvbnN0IGxvY2F0aW9ucyA9IEFycmF5LmZyb20ocmVxdWVzdHMua2V5cygpKTtcbiAgY29uc3QgbWluID0gTWF0aC5taW4oLi4ubG9jYXRpb25zKTtcbiAgY29uc3QgbWF4ID0gTWF0aC5tYXgoLi4ubG9jYXRpb25zKTtcblxuICAvLyBWaXNpdCBub2RlcyBtYXRjaGluZyB0aGUgcmVxdWVzdCBhbmQgc3ludGhldGljIG5vZGVzIGFkZGVkIGJ5IHRzaWNrbGVcbiAgZnVuY3Rpb24gc2hvdWxkVmlzaXQocG9zOiBudW1iZXIsIGVuZDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChwb3MgPD0gbWF4ICYmIGVuZCA+PSBtaW4pIHx8IHBvcyA9PSAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZpc2l0U291cmNlRmlsZShzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogdHMuU291cmNlRmlsZSB7XG4gICAgZnVuY3Rpb24gdG9wTGV2ZWxTdGF0ZW1lbnQobm9kZTogdHMuU3RhdGVtZW50KTogdHMuU3RhdGVtZW50IHtcbiAgICAgIGNvbnN0IGRlY2xhcmF0aW9uczogRGVjbGFyYXRpb25bXSA9IFtdO1xuXG4gICAgICBmdW5jdGlvbiB2aXNpdE5vZGUobm9kZTogdHMuTm9kZSk6IHRzLk5vZGUge1xuICAgICAgICAvLyBHZXQgdGhlIG9yaWdpbmFsIG5vZGUgYmVmb3JlIHRzaWNrbGVcbiAgICAgICAgY29uc3Qge3BvcywgZW5kLCBraW5kLCBwYXJlbnQ6IG9yaWdpbmFsUGFyZW50fSA9IHRzLmdldE9yaWdpbmFsTm9kZShub2RlKTtcbiAgICAgICAgY29uc3Qgbm9kZVJlcXVlc3QgPSByZXF1ZXN0cy5nZXQocG9zKTtcbiAgICAgICAgaWYgKG5vZGVSZXF1ZXN0ICYmIG5vZGVSZXF1ZXN0LmtpbmQgPT0ga2luZCAmJiBub2RlUmVxdWVzdC5lbmQgPT0gZW5kKSB7XG4gICAgICAgICAgLy8gVGhpcyBub2RlIGlzIHJlcXVlc3RlZCB0byBiZSByZXdyaXR0ZW4gYXMgYSByZWZlcmVuY2UgdG8gdGhlIGV4cG9ydGVkIG5hbWUuXG4gICAgICAgICAgaWYgKG9yaWdpbmFsUGFyZW50ICYmIG9yaWdpbmFsUGFyZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgLy8gQXMgdGhlIHZhbHVlIHJlcHJlc2VudHMgdGhlIHdob2xlIGluaXRpYWxpemVyIG9mIGEgdmFyaWFibGUgZGVjbGFyYXRpb24sXG4gICAgICAgICAgICAvLyBqdXN0IHJlZmVyIHRvIHRoYXQgdmFyaWFibGUuIFRoaXMgZS5nLiBoZWxwcyB0byBwcmVzZXJ2ZSBjbG9zdXJlIGNvbW1lbnRzXG4gICAgICAgICAgICAvLyBhdCB0aGUgcmlnaHQgcGxhY2UuXG4gICAgICAgICAgICBjb25zdCB2YXJQYXJlbnQgPSBvcmlnaW5hbFBhcmVudCBhcyB0cy5WYXJpYWJsZURlY2xhcmF0aW9uO1xuICAgICAgICAgICAgaWYgKHZhclBhcmVudC5uYW1lLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgICAgICAgICBjb25zdCB2YXJOYW1lID0gdmFyUGFyZW50Lm5hbWUudGV4dDtcbiAgICAgICAgICAgICAgY29uc3QgZXhwb3J0TmFtZSA9IG5vZGVSZXF1ZXN0Lm5hbWU7XG4gICAgICAgICAgICAgIGRlY2xhcmF0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBleHBvcnROYW1lLFxuICAgICAgICAgICAgICAgIG5vZGU6IHRzLmNyZWF0ZUlkZW50aWZpZXIodmFyTmFtZSksXG4gICAgICAgICAgICAgICAgb3JkZXI6IERlY2xhcmF0aW9uT3JkZXIuQWZ0ZXJTdG10XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUmVjb3JkIHRoYXQgdGhlIG5vZGUgbmVlZHMgdG8gYmUgbW92ZWQgdG8gYW4gZXhwb3J0ZWQgdmFyaWFibGUgd2l0aCB0aGUgZ2l2ZW4gbmFtZVxuICAgICAgICAgIGNvbnN0IGV4cG9ydE5hbWUgPSBub2RlUmVxdWVzdC5uYW1lO1xuICAgICAgICAgIGRlY2xhcmF0aW9ucy5wdXNoKHtuYW1lOiBleHBvcnROYW1lLCBub2RlLCBvcmRlcjogRGVjbGFyYXRpb25PcmRlci5CZWZvcmVTdG10fSk7XG4gICAgICAgICAgcmV0dXJuIHRzLmNyZWF0ZUlkZW50aWZpZXIoZXhwb3J0TmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlc3VsdCA9IG5vZGU7XG4gICAgICAgIGlmIChzaG91bGRWaXNpdChwb3MsIGVuZCkgJiYgIWlzTGV4aWNhbFNjb3BlKG5vZGUpKSB7XG4gICAgICAgICAgcmVzdWx0ID0gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXROb2RlLCBjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuXG4gICAgICAvLyBHZXQgdGhlIG9yaWdpbmFsIG5vZGUgYmVmb3JlIHRzaWNrbGVcbiAgICAgIGNvbnN0IHtwb3MsIGVuZH0gPSB0cy5nZXRPcmlnaW5hbE5vZGUobm9kZSk7XG4gICAgICBsZXQgcmVzdWx0U3RtdDogdHMuU3RhdGVtZW50O1xuICAgICAgaWYgKHNob3VsZFZpc2l0KHBvcywgZW5kKSkge1xuICAgICAgICByZXN1bHRTdG10ID0gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXROb2RlLCBjb250ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFN0bXQgPSBub2RlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGVjbGFyYXRpb25zLmxlbmd0aCkge1xuICAgICAgICBpbnNlcnRzLnB1c2goe3JlbGF0aXZlVG86IHJlc3VsdFN0bXQsIGRlY2xhcmF0aW9uc30pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdFN0bXQ7XG4gICAgfVxuXG4gICAgbGV0IG5ld1N0YXRlbWVudHMgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHMubWFwKHRvcExldmVsU3RhdGVtZW50KTtcblxuICAgIGlmIChpbnNlcnRzLmxlbmd0aCkge1xuICAgICAgLy8gSW5zZXJ0IHRoZSBkZWNsYXJhdGlvbnMgcmVsYXRpdmUgdG8gdGhlIHJld3JpdHRlbiBzdGF0ZW1lbnQgdGhhdCByZWZlcmVuY2VzIHRoZW0uXG4gICAgICBjb25zdCBpbnNlcnRNYXAgPSB0b01hcChpbnNlcnRzLCBpID0+IGkucmVsYXRpdmVUbyk7XG4gICAgICBjb25zdCB0bXBTdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXSA9IFtdO1xuICAgICAgbmV3U3RhdGVtZW50cy5mb3JFYWNoKHN0YXRlbWVudCA9PiB7XG4gICAgICAgIGNvbnN0IGluc2VydCA9IGluc2VydE1hcC5nZXQoc3RhdGVtZW50KTtcbiAgICAgICAgaWYgKGluc2VydCkge1xuICAgICAgICAgIGNvbnN0IGJlZm9yZSA9IGluc2VydC5kZWNsYXJhdGlvbnMuZmlsdGVyKGQgPT4gZC5vcmRlciA9PT0gRGVjbGFyYXRpb25PcmRlci5CZWZvcmVTdG10KTtcbiAgICAgICAgICBpZiAoYmVmb3JlLmxlbmd0aCkge1xuICAgICAgICAgICAgdG1wU3RhdGVtZW50cy5wdXNoKGNyZWF0ZVZhcmlhYmxlU3RhdGVtZW50Rm9yRGVjbGFyYXRpb25zKGJlZm9yZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0bXBTdGF0ZW1lbnRzLnB1c2goc3RhdGVtZW50KTtcbiAgICAgICAgICBjb25zdCBhZnRlciA9IGluc2VydC5kZWNsYXJhdGlvbnMuZmlsdGVyKGQgPT4gZC5vcmRlciA9PT0gRGVjbGFyYXRpb25PcmRlci5BZnRlclN0bXQpO1xuICAgICAgICAgIGlmIChhZnRlci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRtcFN0YXRlbWVudHMucHVzaChjcmVhdGVWYXJpYWJsZVN0YXRlbWVudEZvckRlY2xhcmF0aW9ucyhhZnRlcikpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0bXBTdGF0ZW1lbnRzLnB1c2goc3RhdGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEluc2VydCBhbiBleHBvcnRzIGNsYXVzZSB0byBleHBvcnQgdGhlIGRlY2xhcmF0aW9uc1xuICAgICAgdG1wU3RhdGVtZW50cy5wdXNoKHRzLmNyZWF0ZUV4cG9ydERlY2xhcmF0aW9uKFxuICAgICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgdHMuY3JlYXRlTmFtZWRFeHBvcnRzKFxuICAgICAgICAgICAgICBpbnNlcnRzXG4gICAgICAgICAgICAgICAgICAucmVkdWNlKFxuICAgICAgICAgICAgICAgICAgICAgIChhY2N1bXVsYXRvciwgaW5zZXJ0KSA9PiBbLi4uYWNjdW11bGF0b3IsIC4uLmluc2VydC5kZWNsYXJhdGlvbnNdLFxuICAgICAgICAgICAgICAgICAgICAgIFtdIGFzIERlY2xhcmF0aW9uW10pXG4gICAgICAgICAgICAgICAgICAubWFwKFxuICAgICAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uID0+IHRzLmNyZWF0ZUV4cG9ydFNwZWNpZmllcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLyogcHJvcGVydHlOYW1lICovIHVuZGVmaW5lZCwgZGVjbGFyYXRpb24ubmFtZSkpKSkpO1xuXG4gICAgICBuZXdTdGF0ZW1lbnRzID0gdG1wU3RhdGVtZW50cztcbiAgICB9XG4gICAgLy8gTm90ZTogV2UgY2Fubm90IHVzZSB0cy51cGRhdGVTb3VyY2VmaWxlIGhlcmUgYXNcbiAgICAvLyBpdCBkb2VzIG5vdCB3b3JrIHdlbGwgd2l0aCBkZWNvcmF0b3JzLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE3Mzg0XG4gICAgY29uc3QgbmV3U2YgPSB0cy5nZXRNdXRhYmxlQ2xvbmUoc291cmNlRmlsZSk7XG4gICAgaWYgKCEoc291cmNlRmlsZS5mbGFncyAmIHRzLk5vZGVGbGFncy5TeW50aGVzaXplZCkpIHtcbiAgICAgIG5ld1NmLmZsYWdzICY9IH50cy5Ob2RlRmxhZ3MuU3ludGhlc2l6ZWQ7XG4gICAgfVxuICAgIG5ld1NmLnN0YXRlbWVudHMgPSB0cy5zZXRUZXh0UmFuZ2UodHMuY3JlYXRlTm9kZUFycmF5KG5ld1N0YXRlbWVudHMpLCBzb3VyY2VGaWxlLnN0YXRlbWVudHMpO1xuICAgIHJldHVybiBuZXdTZjtcbiAgfVxuXG4gIHJldHVybiB2aXNpdFNvdXJjZUZpbGUoc291cmNlRmlsZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVZhcmlhYmxlU3RhdGVtZW50Rm9yRGVjbGFyYXRpb25zKGRlY2xhcmF0aW9uczogRGVjbGFyYXRpb25bXSk6IHRzLlZhcmlhYmxlU3RhdGVtZW50IHtcbiAgY29uc3QgdmFyRGVjbHMgPSBkZWNsYXJhdGlvbnMubWFwKFxuICAgICAgaSA9PiB0cy5jcmVhdGVWYXJpYWJsZURlY2xhcmF0aW9uKGkubmFtZSwgLyogdHlwZSAqLyB1bmRlZmluZWQsIGkubm9kZSBhcyB0cy5FeHByZXNzaW9uKSk7XG4gIHJldHVybiB0cy5jcmVhdGVWYXJpYWJsZVN0YXRlbWVudChcbiAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsIHRzLmNyZWF0ZVZhcmlhYmxlRGVjbGFyYXRpb25MaXN0KHZhckRlY2xzLCB0cy5Ob2RlRmxhZ3MuQ29uc3QpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEV4cHJlc3Npb25Mb3dlcmluZ1RyYW5zZm9ybUZhY3RvcnkoXG4gICAgcmVxdWVzdHNNYXA6IFJlcXVlc3RzTWFwLCBwcm9ncmFtOiB0cy5Qcm9ncmFtKTogKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCkgPT5cbiAgICAoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkgPT4gdHMuU291cmNlRmlsZSB7XG4gIC8vIFJldHVybiB0aGUgZmFjdG9yeVxuICByZXR1cm4gKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCkgPT4gKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiB0cy5Tb3VyY2VGaWxlID0+IHtcbiAgICAvLyBXZSBuZWVkIHRvIHVzZSB0aGUgb3JpZ2luYWwgU291cmNlRmlsZSBmb3IgcmVhZGluZyBtZXRhZGF0YSwgYW5kIG5vdCB0aGUgdHJhbnNmb3JtZWQgb25lLlxuICAgIGNvbnN0IG9yaWdpbmFsRmlsZSA9IHByb2dyYW0uZ2V0U291cmNlRmlsZShzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgICBpZiAob3JpZ2luYWxGaWxlKSB7XG4gICAgICBjb25zdCByZXF1ZXN0cyA9IHJlcXVlc3RzTWFwLmdldFJlcXVlc3RzKG9yaWdpbmFsRmlsZSk7XG4gICAgICBpZiAocmVxdWVzdHMgJiYgcmVxdWVzdHMuc2l6ZSkge1xuICAgICAgICByZXR1cm4gdHJhbnNmb3JtU291cmNlRmlsZShzb3VyY2VGaWxlLCByZXF1ZXN0cywgY29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2VGaWxlO1xuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVlc3RzTWFwIHsgZ2V0UmVxdWVzdHMoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IFJlcXVlc3RMb2NhdGlvbk1hcDsgfVxuXG5pbnRlcmZhY2UgTWV0YWRhdGFBbmRMb3dlcmluZ1JlcXVlc3RzIHtcbiAgbWV0YWRhdGE6IE1vZHVsZU1ldGFkYXRhfHVuZGVmaW5lZDtcbiAgcmVxdWVzdHM6IFJlcXVlc3RMb2NhdGlvbk1hcDtcbn1cblxuZnVuY3Rpb24gaXNFbGlnaWJsZUZvckxvd2VyaW5nKG5vZGU6IHRzLk5vZGUgfCB1bmRlZmluZWQpOiBib29sZWFuIHtcbiAgaWYgKG5vZGUpIHtcbiAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlNvdXJjZUZpbGU6XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRGVjb3JhdG9yOlxuICAgICAgICAvLyBMb3dlciBleHByZXNzaW9ucyB0aGF0IGFyZSBsb2NhbCB0byB0aGUgbW9kdWxlIHNjb3BlIG9yXG4gICAgICAgIC8vIGluIGEgZGVjb3JhdG9yLlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uOlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkludGVyZmFjZURlY2xhcmF0aW9uOlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkVudW1EZWNsYXJhdGlvbjpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5GdW5jdGlvbkRlY2xhcmF0aW9uOlxuICAgICAgICAvLyBEb24ndCBsb3dlciBleHByZXNzaW9ucyBpbiBhIGRlY2xhcmF0aW9uLlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvbjpcbiAgICAgICAgLy8gQXZvaWQgbG93ZXJpbmcgZXhwcmVzc2lvbnMgYWxyZWFkeSBpbiBhbiBleHBvcnRlZCB2YXJpYWJsZSBkZWNsYXJhdGlvblxuICAgICAgICByZXR1cm4gKHRzLmdldENvbWJpbmVkTW9kaWZpZXJGbGFncyhub2RlKSAmIHRzLk1vZGlmaWVyRmxhZ3MuRXhwb3J0KSA9PSAwO1xuICAgIH1cbiAgICByZXR1cm4gaXNFbGlnaWJsZUZvckxvd2VyaW5nKG5vZGUucGFyZW50KTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gaXNQcmltaXRpdmUodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gT2JqZWN0KHZhbHVlKSAhPT0gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGlzUmV3cml0dGVuKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzTWV0YWRhdGFHbG9iYWxSZWZlcmVuY2VFeHByZXNzaW9uKHZhbHVlKSAmJiBpc0xvd2VyZWRTeW1ib2wodmFsdWUubmFtZSk7XG59XG5cbmZ1bmN0aW9uIGlzTGl0ZXJhbEZpZWxkTmFtZWQobm9kZTogdHMuTm9kZSwgbmFtZXM6IFNldDxzdHJpbmc+KTogYm9vbGVhbiB7XG4gIGlmIChub2RlLnBhcmVudCAmJiBub2RlLnBhcmVudC5raW5kID09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlBc3NpZ25tZW50KSB7XG4gICAgY29uc3QgcHJvcGVydHkgPSBub2RlLnBhcmVudCBhcyB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQ7XG4gICAgaWYgKHByb3BlcnR5LnBhcmVudCAmJiBwcm9wZXJ0eS5wYXJlbnQua2luZCA9PSB0cy5TeW50YXhLaW5kLk9iamVjdExpdGVyYWxFeHByZXNzaW9uICYmXG4gICAgICAgIHByb3BlcnR5Lm5hbWUgJiYgcHJvcGVydHkubmFtZS5raW5kID09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgY29uc3QgcHJvcGVydHlOYW1lID0gcHJvcGVydHkubmFtZSBhcyB0cy5JZGVudGlmaWVyO1xuICAgICAgcmV0dXJuIG5hbWVzLmhhcyhwcm9wZXJ0eU5hbWUudGV4dCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGNsYXNzIExvd2VyTWV0YWRhdGFUcmFuc2Zvcm0gaW1wbGVtZW50cyBSZXF1ZXN0c01hcCwgTWV0YWRhdGFUcmFuc2Zvcm1lciB7XG4gIHByaXZhdGUgY2FjaGU6IE1ldGFkYXRhQ2FjaGU7XG4gIHByaXZhdGUgcmVxdWVzdHMgPSBuZXcgTWFwPHN0cmluZywgUmVxdWVzdExvY2F0aW9uTWFwPigpO1xuICBwcml2YXRlIGxvd2VyYWJsZUZpZWxkTmFtZXM6IFNldDxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKGxvd2VyYWJsZUZpZWxkTmFtZXM6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5sb3dlcmFibGVGaWVsZE5hbWVzID0gbmV3IFNldDxzdHJpbmc+KGxvd2VyYWJsZUZpZWxkTmFtZXMpO1xuICB9XG5cbiAgLy8gUmVxdWVzdE1hcFxuICBnZXRSZXF1ZXN0cyhzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogUmVxdWVzdExvY2F0aW9uTWFwIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5yZXF1ZXN0cy5nZXQoc291cmNlRmlsZS5maWxlTmFtZSk7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIC8vIEZvcmNlIHRoZSBtZXRhZGF0YSBmb3IgdGhpcyBzb3VyY2UgZmlsZSB0byBiZSBjb2xsZWN0ZWQgd2hpY2hcbiAgICAgIC8vIHdpbGwgcmVjdXJzaXZlbHkgY2FsbCBzdGFydCgpIHBvcHVsYXRpbmcgdGhlIHJlcXVlc3QgbWFwO1xuICAgICAgdGhpcy5jYWNoZS5nZXRNZXRhZGF0YShzb3VyY2VGaWxlKTtcblxuICAgICAgLy8gSWYgd2Ugc3RpbGwgZG9uJ3QgaGF2ZSB0aGUgcmVxdWVzdGVkIG1ldGFkYXRhLCB0aGUgZmlsZSBpcyBub3QgYSBtb2R1bGVcbiAgICAgIC8vIG9yIGlzIGEgZGVjbGFyYXRpb24gZmlsZSBzbyByZXR1cm4gYW4gZW1wdHkgbWFwLlxuICAgICAgcmVzdWx0ID0gdGhpcy5yZXF1ZXN0cy5nZXQoc291cmNlRmlsZS5maWxlTmFtZSkgfHwgbmV3IE1hcDxudW1iZXIsIExvd2VyaW5nUmVxdWVzdD4oKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIE1ldGFkYXRhVHJhbnNmb3JtZXJcbiAgY29ubmVjdChjYWNoZTogTWV0YWRhdGFDYWNoZSk6IHZvaWQgeyB0aGlzLmNhY2hlID0gY2FjaGU7IH1cblxuICBzdGFydChzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogVmFsdWVUcmFuc2Zvcm18dW5kZWZpbmVkIHtcbiAgICBsZXQgaWRlbnROdW1iZXIgPSAwO1xuICAgIGNvbnN0IGZyZXNoSWRlbnQgPSAoKSA9PiBjcmVhdGVMb3dlcmVkU3ltYm9sKGlkZW50TnVtYmVyKyspO1xuICAgIGNvbnN0IHJlcXVlc3RzID0gbmV3IE1hcDxudW1iZXIsIExvd2VyaW5nUmVxdWVzdD4oKTtcbiAgICB0aGlzLnJlcXVlc3RzLnNldChzb3VyY2VGaWxlLmZpbGVOYW1lLCByZXF1ZXN0cyk7XG5cbiAgICBjb25zdCByZXBsYWNlTm9kZSA9IChub2RlOiB0cy5Ob2RlKSA9PiB7XG4gICAgICBjb25zdCBuYW1lID0gZnJlc2hJZGVudCgpO1xuICAgICAgcmVxdWVzdHMuc2V0KG5vZGUucG9zLCB7bmFtZSwga2luZDogbm9kZS5raW5kLCBsb2NhdGlvbjogbm9kZS5wb3MsIGVuZDogbm9kZS5lbmR9KTtcbiAgICAgIHJldHVybiB7X19zeW1ib2xpYzogJ3JlZmVyZW5jZScsIG5hbWV9O1xuICAgIH07XG5cbiAgICBjb25zdCBpc0V4cG9ydGVkU3ltYm9sID0gKCgpID0+IHtcbiAgICAgIGxldCBleHBvcnRUYWJsZTogU2V0PHN0cmluZz47XG4gICAgICByZXR1cm4gKG5vZGU6IHRzLk5vZGUpID0+IHtcbiAgICAgICAgaWYgKG5vZGUua2luZCA9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICAgICAgICBjb25zdCBpZGVudCA9IG5vZGUgYXMgdHMuSWRlbnRpZmllcjtcblxuICAgICAgICAgIGlmICghZXhwb3J0VGFibGUpIHtcbiAgICAgICAgICAgIGV4cG9ydFRhYmxlID0gY3JlYXRlRXhwb3J0VGFibGVGb3Ioc291cmNlRmlsZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBleHBvcnRUYWJsZS5oYXMoaWRlbnQudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcbiAgICB9KSgpO1xuXG4gICAgY29uc3QgaXNFeHBvcnRlZFByb3BlcnR5QWNjZXNzID0gKG5vZGU6IHRzLk5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKSB7XG4gICAgICAgIGNvbnN0IHBhZSA9IG5vZGUgYXMgdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uO1xuICAgICAgICBpZiAoaXNFeHBvcnRlZFN5bWJvbChwYWUuZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBjb25zdCBoYXNMb3dlcmFibGVQYXJlbnRDYWNoZSA9IG5ldyBNYXA8dHMuTm9kZSwgYm9vbGVhbj4oKTtcblxuICAgIGNvbnN0IHNob3VsZEJlTG93ZXJlZCA9IChub2RlOiB0cy5Ob2RlIHwgdW5kZWZpbmVkKTogYm9vbGVhbiA9PiB7XG4gICAgICBpZiAobm9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGxldCBsb3dlcmFibGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgIGlmICgobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkFycm93RnVuY3Rpb24gfHxcbiAgICAgICAgICAgbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRXhwcmVzc2lvbikgJiZcbiAgICAgICAgICBpc0VsaWdpYmxlRm9yTG93ZXJpbmcobm9kZSkpIHtcbiAgICAgICAgbG93ZXJhYmxlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgaXNMaXRlcmFsRmllbGROYW1lZChub2RlLCB0aGlzLmxvd2VyYWJsZUZpZWxkTmFtZXMpICYmIGlzRWxpZ2libGVGb3JMb3dlcmluZyhub2RlKSAmJlxuICAgICAgICAgICFpc0V4cG9ydGVkU3ltYm9sKG5vZGUpICYmICFpc0V4cG9ydGVkUHJvcGVydHlBY2Nlc3Mobm9kZSkpIHtcbiAgICAgICAgbG93ZXJhYmxlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsb3dlcmFibGU7XG4gICAgfTtcblxuICAgIGNvbnN0IGhhc0xvd2VyYWJsZVBhcmVudCA9IChub2RlOiB0cy5Ob2RlIHwgdW5kZWZpbmVkKTogYm9vbGVhbiA9PiB7XG4gICAgICBpZiAobm9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghaGFzTG93ZXJhYmxlUGFyZW50Q2FjaGUuaGFzKG5vZGUpKSB7XG4gICAgICAgIGhhc0xvd2VyYWJsZVBhcmVudENhY2hlLnNldChcbiAgICAgICAgICAgIG5vZGUsIHNob3VsZEJlTG93ZXJlZChub2RlLnBhcmVudCkgfHwgaGFzTG93ZXJhYmxlUGFyZW50KG5vZGUucGFyZW50KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFzTG93ZXJhYmxlUGFyZW50Q2FjaGUuZ2V0KG5vZGUpICE7XG4gICAgfTtcblxuICAgIGNvbnN0IGlzTG93ZXJhYmxlID0gKG5vZGU6IHRzLk5vZGUgfCB1bmRlZmluZWQpOiBib29sZWFuID0+IHtcbiAgICAgIGlmIChub2RlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNob3VsZEJlTG93ZXJlZChub2RlKSAmJiAhaGFzTG93ZXJhYmxlUGFyZW50KG5vZGUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gKHZhbHVlOiBNZXRhZGF0YVZhbHVlLCBub2RlOiB0cy5Ob2RlKTogTWV0YWRhdGFWYWx1ZSA9PiB7XG4gICAgICBpZiAoIWlzUHJpbWl0aXZlKHZhbHVlKSAmJiAhaXNSZXdyaXR0ZW4odmFsdWUpICYmIGlzTG93ZXJhYmxlKG5vZGUpKSB7XG4gICAgICAgIHJldHVybiByZXBsYWNlTm9kZShub2RlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUV4cG9ydFRhYmxlRm9yKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiBTZXQ8c3RyaW5nPiB7XG4gIGNvbnN0IGV4cG9ydFRhYmxlID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIC8vIExhemlseSBjb2xsZWN0IGFsbCB0aGUgZXhwb3J0cyBmcm9tIHRoZSBzb3VyY2UgZmlsZVxuICB0cy5mb3JFYWNoQ2hpbGQoc291cmNlRmlsZSwgZnVuY3Rpb24gc2Nhbihub2RlKSB7XG4gICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uOlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb246XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW50ZXJmYWNlRGVjbGFyYXRpb246XG4gICAgICAgIGlmICgodHMuZ2V0Q29tYmluZWRNb2RpZmllckZsYWdzKG5vZGUpICYgdHMuTW9kaWZpZXJGbGFncy5FeHBvcnQpICE9IDApIHtcbiAgICAgICAgICBjb25zdCBjbGFzc0RlY2xhcmF0aW9uID1cbiAgICAgICAgICAgICAgbm9kZSBhcyh0cy5DbGFzc0RlY2xhcmF0aW9uIHwgdHMuRnVuY3Rpb25EZWNsYXJhdGlvbiB8IHRzLkludGVyZmFjZURlY2xhcmF0aW9uKTtcbiAgICAgICAgICBjb25zdCBuYW1lID0gY2xhc3NEZWNsYXJhdGlvbi5uYW1lO1xuICAgICAgICAgIGlmIChuYW1lKSBleHBvcnRUYWJsZS5hZGQobmFtZS50ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudDpcbiAgICAgICAgY29uc3QgdmFyaWFibGVTdGF0ZW1lbnQgPSBub2RlIGFzIHRzLlZhcmlhYmxlU3RhdGVtZW50O1xuICAgICAgICBmb3IgKGNvbnN0IGRlY2xhcmF0aW9uIG9mIHZhcmlhYmxlU3RhdGVtZW50LmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMpIHtcbiAgICAgICAgICBzY2FuKGRlY2xhcmF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5WYXJpYWJsZURlY2xhcmF0aW9uOlxuICAgICAgICBjb25zdCB2YXJpYWJsZURlY2xhcmF0aW9uID0gbm9kZSBhcyB0cy5WYXJpYWJsZURlY2xhcmF0aW9uO1xuICAgICAgICBpZiAoKHRzLmdldENvbWJpbmVkTW9kaWZpZXJGbGFncyhub2RlKSAmIHRzLk1vZGlmaWVyRmxhZ3MuRXhwb3J0KSAhPSAwICYmXG4gICAgICAgICAgICB2YXJpYWJsZURlY2xhcmF0aW9uLm5hbWUua2luZCA9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gdmFyaWFibGVEZWNsYXJhdGlvbi5uYW1lIGFzIHRzLklkZW50aWZpZXI7XG4gICAgICAgICAgZXhwb3J0VGFibGUuYWRkKG5hbWUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhwb3J0RGVjbGFyYXRpb246XG4gICAgICAgIGNvbnN0IGV4cG9ydERlY2xhcmF0aW9uID0gbm9kZSBhcyB0cy5FeHBvcnREZWNsYXJhdGlvbjtcbiAgICAgICAgY29uc3Qge21vZHVsZVNwZWNpZmllciwgZXhwb3J0Q2xhdXNlfSA9IGV4cG9ydERlY2xhcmF0aW9uO1xuICAgICAgICBpZiAoIW1vZHVsZVNwZWNpZmllciAmJiBleHBvcnRDbGF1c2UpIHtcbiAgICAgICAgICBleHBvcnRDbGF1c2UuZWxlbWVudHMuZm9yRWFjaChzcGVjID0+IHsgZXhwb3J0VGFibGUuYWRkKHNwZWMubmFtZS50ZXh0KTsgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZXhwb3J0VGFibGU7XG59XG4iXX0=