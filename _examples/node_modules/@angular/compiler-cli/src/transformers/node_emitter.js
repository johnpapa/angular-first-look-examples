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
        define("@angular/compiler-cli/src/transformers/node_emitter", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    var METHOD_THIS_NAME = 'this';
    var CATCH_ERROR_NAME = 'error';
    var CATCH_STACK_NAME = 'stack';
    var _VALID_IDENTIFIER_RE = /^[$A-Z_][0-9A-Z_$]*$/i;
    var TypeScriptNodeEmitter = /** @class */ (function () {
        function TypeScriptNodeEmitter() {
        }
        TypeScriptNodeEmitter.prototype.updateSourceFile = function (sourceFile, stmts, preamble) {
            var converter = new _NodeEmitterVisitor();
            // [].concat flattens the result so that each `visit...` method can also return an array of
            // stmts.
            var statements = [].concat.apply([], tslib_1.__spread(stmts.map(function (stmt) { return stmt.visitStatement(converter, null); }).filter(function (stmt) { return stmt != null; })));
            var preambleStmts = [];
            if (preamble) {
                var commentStmt = this.createCommentStatement(sourceFile, preamble);
                preambleStmts.push(commentStmt);
            }
            var sourceStatements = tslib_1.__spread(preambleStmts, converter.getReexports(), converter.getImports(), statements);
            converter.updateSourceMap(sourceStatements);
            var newSourceFile = ts.updateSourceFileNode(sourceFile, sourceStatements);
            return [newSourceFile, converter.getNodeMap()];
        };
        /** Creates a not emitted statement containing the given comment. */
        TypeScriptNodeEmitter.prototype.createCommentStatement = function (sourceFile, comment) {
            if (comment.startsWith('/*') && comment.endsWith('*/')) {
                comment = comment.substr(2, comment.length - 4);
            }
            var commentStmt = ts.createNotEmittedStatement(sourceFile);
            ts.setSyntheticLeadingComments(commentStmt, [{ kind: ts.SyntaxKind.MultiLineCommentTrivia, text: comment, pos: -1, end: -1 }]);
            ts.setEmitFlags(commentStmt, ts.EmitFlags.CustomPrologue);
            return commentStmt;
        };
        return TypeScriptNodeEmitter;
    }());
    exports.TypeScriptNodeEmitter = TypeScriptNodeEmitter;
    /**
     * Update the given source file to include the changes specified in module.
     *
     * The module parameter is treated as a partial module meaning that the statements are added to
     * the module instead of replacing the module. Also, any classes are treated as partial classes
     * and the included members are added to the class with the same name instead of a new class
     * being created.
     */
    function updateSourceFile(sourceFile, module, context) {
        var converter = new _NodeEmitterVisitor();
        converter.loadExportedVariableIdentifiers(sourceFile);
        var prefixStatements = module.statements.filter(function (statement) { return !(statement instanceof compiler_1.ClassStmt); });
        var classes = module.statements.filter(function (statement) { return statement instanceof compiler_1.ClassStmt; });
        var classMap = new Map(classes.map(function (classStatement) { return [classStatement.name, classStatement]; }));
        var classNames = new Set(classes.map(function (classStatement) { return classStatement.name; }));
        var prefix = prefixStatements.map(function (statement) { return statement.visitStatement(converter, sourceFile); });
        // Add static methods to all the classes referenced in module.
        var newStatements = sourceFile.statements.map(function (node) {
            if (node.kind == ts.SyntaxKind.ClassDeclaration) {
                var classDeclaration = node;
                var name = classDeclaration.name;
                if (name) {
                    var classStatement = classMap.get(name.text);
                    if (classStatement) {
                        classNames.delete(name.text);
                        var classMemberHolder = converter.visitDeclareClassStmt(classStatement);
                        var newMethods = classMemberHolder.members.filter(function (member) { return member.kind !== ts.SyntaxKind.Constructor; });
                        var newMembers = tslib_1.__spread(classDeclaration.members, newMethods);
                        return ts.updateClassDeclaration(classDeclaration, 
                        /* decorators */ classDeclaration.decorators, 
                        /* modifiers */ classDeclaration.modifiers, 
                        /* name */ classDeclaration.name, 
                        /* typeParameters */ classDeclaration.typeParameters, 
                        /* heritageClauses */ classDeclaration.heritageClauses || [], 
                        /* members */ newMembers);
                    }
                }
            }
            return node;
        });
        // Validate that all the classes have been generated
        classNames.size == 0 ||
            util_1.error((classNames.size == 1 ? 'Class' : 'Classes') + " \"" + Array.from(classNames.keys()).join(', ') + "\" not generated");
        // Add imports to the module required by the new methods
        var imports = converter.getImports();
        if (imports && imports.length) {
            // Find where the new imports should go
            var index = firstAfter(newStatements, function (statement) { return statement.kind === ts.SyntaxKind.ImportDeclaration ||
                statement.kind === ts.SyntaxKind.ImportEqualsDeclaration; });
            newStatements = tslib_1.__spread(newStatements.slice(0, index), imports, prefix, newStatements.slice(index));
        }
        else {
            newStatements = tslib_1.__spread(prefix, newStatements);
        }
        converter.updateSourceMap(newStatements);
        var newSourceFile = ts.updateSourceFileNode(sourceFile, newStatements);
        return [newSourceFile, converter.getNodeMap()];
    }
    exports.updateSourceFile = updateSourceFile;
    // Return the index after the first value in `a` that doesn't match the predicate after a value that
    // does or 0 if no values match.
    function firstAfter(a, predicate) {
        var index = 0;
        var len = a.length;
        for (; index < len; index++) {
            var value = a[index];
            if (predicate(value))
                break;
        }
        if (index >= len)
            return 0;
        for (; index < len; index++) {
            var value = a[index];
            if (!predicate(value))
                break;
        }
        return index;
    }
    function escapeLiteral(value) {
        return value.replace(/(\"|\\)/g, '\\$1').replace(/(\n)|(\r)/g, function (v, n, r) {
            return n ? '\\n' : '\\r';
        });
    }
    function createLiteral(value) {
        if (value === null) {
            return ts.createNull();
        }
        else if (value === undefined) {
            return ts.createIdentifier('undefined');
        }
        else {
            var result = ts.createLiteral(value);
            if (ts.isStringLiteral(result) && result.text.indexOf('\\') >= 0) {
                // Hack to avoid problems cause indirectly by:
                //    https://github.com/Microsoft/TypeScript/issues/20192
                // This avoids the string escaping normally performed for a string relying on that
                // TypeScript just emits the text raw for a numeric literal.
                result.kind = ts.SyntaxKind.NumericLiteral;
                result.text = "\"" + escapeLiteral(result.text) + "\"";
            }
            return result;
        }
    }
    function isExportTypeStatement(statement) {
        return !!statement.modifiers &&
            statement.modifiers.some(function (mod) { return mod.kind === ts.SyntaxKind.ExportKeyword; });
    }
    /**
     * Visits an output ast and produces the corresponding TypeScript synthetic nodes.
     */
    var _NodeEmitterVisitor = /** @class */ (function () {
        function _NodeEmitterVisitor() {
            this._nodeMap = new Map();
            this._importsWithPrefixes = new Map();
            this._reexports = new Map();
            this._templateSources = new Map();
            this._exportedVariableIdentifiers = new Map();
        }
        /**
         * Process the source file and collect exported identifiers that refer to variables.
         *
         * Only variables are collected because exported classes still exist in the module scope in
         * CommonJS, whereas variables have their declarations moved onto the `exports` object, and all
         * references are updated accordingly.
         */
        _NodeEmitterVisitor.prototype.loadExportedVariableIdentifiers = function (sourceFile) {
            var _this = this;
            sourceFile.statements.forEach(function (statement) {
                if (ts.isVariableStatement(statement) && isExportTypeStatement(statement)) {
                    statement.declarationList.declarations.forEach(function (declaration) {
                        if (ts.isIdentifier(declaration.name)) {
                            _this._exportedVariableIdentifiers.set(declaration.name.text, declaration.name);
                        }
                    });
                }
            });
        };
        _NodeEmitterVisitor.prototype.getReexports = function () {
            return Array.from(this._reexports.entries())
                .map(function (_a) {
                var _b = tslib_1.__read(_a, 2), exportedFilePath = _b[0], reexports = _b[1];
                return ts.createExportDeclaration(
                /* decorators */ undefined, 
                /* modifiers */ undefined, ts.createNamedExports(reexports.map(function (_a) {
                    var name = _a.name, as = _a.as;
                    return ts.createExportSpecifier(name, as);
                })), 
                /* moduleSpecifier */ createLiteral(exportedFilePath));
            });
        };
        _NodeEmitterVisitor.prototype.getImports = function () {
            return Array.from(this._importsWithPrefixes.entries())
                .map(function (_a) {
                var _b = tslib_1.__read(_a, 2), namespace = _b[0], prefix = _b[1];
                return ts.createImportDeclaration(
                /* decorators */ undefined, 
                /* modifiers */ undefined, 
                /* importClause */ ts.createImportClause(
                /* name */ undefined, ts.createNamespaceImport(ts.createIdentifier(prefix))), 
                /* moduleSpecifier */ createLiteral(namespace));
            });
        };
        _NodeEmitterVisitor.prototype.getNodeMap = function () { return this._nodeMap; };
        _NodeEmitterVisitor.prototype.updateSourceMap = function (statements) {
            var _this = this;
            var lastRangeStartNode = undefined;
            var lastRangeEndNode = undefined;
            var lastRange = undefined;
            var recordLastSourceRange = function () {
                if (lastRange && lastRangeStartNode && lastRangeEndNode) {
                    if (lastRangeStartNode == lastRangeEndNode) {
                        ts.setSourceMapRange(lastRangeEndNode, lastRange);
                    }
                    else {
                        ts.setSourceMapRange(lastRangeStartNode, lastRange);
                        // Only emit the pos for the first node emitted in the range.
                        ts.setEmitFlags(lastRangeStartNode, ts.EmitFlags.NoTrailingSourceMap);
                        ts.setSourceMapRange(lastRangeEndNode, lastRange);
                        // Only emit emit end for the last node emitted in the range.
                        ts.setEmitFlags(lastRangeEndNode, ts.EmitFlags.NoLeadingSourceMap);
                    }
                }
            };
            var visitNode = function (tsNode) {
                var ngNode = _this._nodeMap.get(tsNode);
                if (ngNode) {
                    var range = _this.sourceRangeOf(ngNode);
                    if (range) {
                        if (!lastRange || range.source != lastRange.source || range.pos != lastRange.pos ||
                            range.end != lastRange.end) {
                            recordLastSourceRange();
                            lastRangeStartNode = tsNode;
                            lastRange = range;
                        }
                        lastRangeEndNode = tsNode;
                    }
                }
                ts.forEachChild(tsNode, visitNode);
            };
            statements.forEach(visitNode);
            recordLastSourceRange();
        };
        _NodeEmitterVisitor.prototype.record = function (ngNode, tsNode) {
            if (tsNode && !this._nodeMap.has(tsNode)) {
                this._nodeMap.set(tsNode, ngNode);
            }
            return tsNode;
        };
        _NodeEmitterVisitor.prototype.sourceRangeOf = function (node) {
            if (node.sourceSpan) {
                var span = node.sourceSpan;
                if (span.start.file == span.end.file) {
                    var file = span.start.file;
                    if (file.url) {
                        var source = this._templateSources.get(file);
                        if (!source) {
                            source = ts.createSourceMapSource(file.url, file.content, function (pos) { return pos; });
                            this._templateSources.set(file, source);
                        }
                        return { pos: span.start.offset, end: span.end.offset, source: source };
                    }
                }
            }
            return null;
        };
        _NodeEmitterVisitor.prototype.getModifiers = function (stmt) {
            var modifiers = [];
            if (stmt.hasModifier(compiler_1.StmtModifier.Exported)) {
                modifiers.push(ts.createToken(ts.SyntaxKind.ExportKeyword));
            }
            return modifiers;
        };
        // StatementVisitor
        _NodeEmitterVisitor.prototype.visitDeclareVarStmt = function (stmt) {
            if (stmt.hasModifier(compiler_1.StmtModifier.Exported) && stmt.value instanceof compiler_1.ExternalExpr &&
                !stmt.type) {
                // check for a reexport
                var _a = stmt.value.value, name = _a.name, moduleName = _a.moduleName;
                if (moduleName) {
                    var reexports = this._reexports.get(moduleName);
                    if (!reexports) {
                        reexports = [];
                        this._reexports.set(moduleName, reexports);
                    }
                    reexports.push({ name: name, as: stmt.name });
                    return null;
                }
            }
            var varDeclList = ts.createVariableDeclarationList([ts.createVariableDeclaration(ts.createIdentifier(stmt.name), 
                /* type */ undefined, (stmt.value && stmt.value.visitExpression(this, null)) || undefined)]);
            if (stmt.hasModifier(compiler_1.StmtModifier.Exported)) {
                // Note: We need to add an explicit variable and export declaration so that
                // the variable can be referred in the same file as well.
                var tsVarStmt = this.record(stmt, ts.createVariableStatement(/* modifiers */ [], varDeclList));
                var exportStmt = this.record(stmt, ts.createExportDeclaration(
                /*decorators*/ undefined, /*modifiers*/ undefined, ts.createNamedExports([ts.createExportSpecifier(stmt.name, stmt.name)])));
                return [tsVarStmt, exportStmt];
            }
            return this.record(stmt, ts.createVariableStatement(this.getModifiers(stmt), varDeclList));
        };
        _NodeEmitterVisitor.prototype.visitDeclareFunctionStmt = function (stmt) {
            return this.record(stmt, ts.createFunctionDeclaration(
            /* decorators */ undefined, this.getModifiers(stmt), 
            /* asteriskToken */ undefined, stmt.name, /* typeParameters */ undefined, stmt.params.map(function (p) { return ts.createParameter(
            /* decorators */ undefined, /* modifiers */ undefined, 
            /* dotDotDotToken */ undefined, p.name); }), 
            /* type */ undefined, this._visitStatements(stmt.statements)));
        };
        _NodeEmitterVisitor.prototype.visitExpressionStmt = function (stmt) {
            return this.record(stmt, ts.createStatement(stmt.expr.visitExpression(this, null)));
        };
        _NodeEmitterVisitor.prototype.visitReturnStmt = function (stmt) {
            return this.record(stmt, ts.createReturn(stmt.value ? stmt.value.visitExpression(this, null) : undefined));
        };
        _NodeEmitterVisitor.prototype.visitDeclareClassStmt = function (stmt) {
            var _this = this;
            var modifiers = this.getModifiers(stmt);
            var fields = stmt.fields.map(function (field) { return ts.createProperty(
            /* decorators */ undefined, /* modifiers */ translateModifiers(field.modifiers), field.name, 
            /* questionToken */ undefined, 
            /* type */ undefined, field.initializer == null ? ts.createNull() :
                field.initializer.visitExpression(_this, null)); });
            var getters = stmt.getters.map(function (getter) { return ts.createGetAccessor(
            /* decorators */ undefined, /* modifiers */ undefined, getter.name, /* parameters */ [], 
            /* type */ undefined, _this._visitStatements(getter.body)); });
            var constructor = (stmt.constructorMethod && [ts.createConstructor(
                /* decorators */ undefined, 
                /* modifiers */ undefined, 
                /* parameters */ stmt.constructorMethod.params.map(function (p) { return ts.createParameter(
                /* decorators */ undefined, 
                /* modifiers */ undefined, 
                /* dotDotDotToken */ undefined, p.name); }), this._visitStatements(stmt.constructorMethod.body))]) ||
                [];
            // TODO {chuckj}: Determine what should be done for a method with a null name.
            var methods = stmt.methods.filter(function (method) { return method.name; })
                .map(function (method) { return ts.createMethod(
            /* decorators */ undefined, 
            /* modifiers */ translateModifiers(method.modifiers), 
            /* astriskToken */ undefined, method.name /* guarded by filter */, 
            /* questionToken */ undefined, /* typeParameters */ undefined, method.params.map(function (p) { return ts.createParameter(
            /* decorators */ undefined, /* modifiers */ undefined, 
            /* dotDotDotToken */ undefined, p.name); }), 
            /* type */ undefined, _this._visitStatements(method.body)); });
            return this.record(stmt, ts.createClassDeclaration(
            /* decorators */ undefined, modifiers, stmt.name, /* typeParameters*/ undefined, stmt.parent && [ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [stmt.parent.visitExpression(this, null)])] ||
                [], tslib_1.__spread(fields, getters, constructor, methods)));
        };
        _NodeEmitterVisitor.prototype.visitIfStmt = function (stmt) {
            return this.record(stmt, ts.createIf(stmt.condition.visitExpression(this, null), this._visitStatements(stmt.trueCase), stmt.falseCase && stmt.falseCase.length && this._visitStatements(stmt.falseCase) ||
                undefined));
        };
        _NodeEmitterVisitor.prototype.visitTryCatchStmt = function (stmt) {
            return this.record(stmt, ts.createTry(this._visitStatements(stmt.bodyStmts), ts.createCatchClause(CATCH_ERROR_NAME, this._visitStatementsPrefix([ts.createVariableStatement(
                /* modifiers */ undefined, [ts.createVariableDeclaration(CATCH_STACK_NAME, /* type */ undefined, ts.createPropertyAccess(ts.createIdentifier(CATCH_ERROR_NAME), ts.createIdentifier(CATCH_STACK_NAME)))])], stmt.catchStmts)), 
            /* finallyBlock */ undefined));
        };
        _NodeEmitterVisitor.prototype.visitThrowStmt = function (stmt) {
            return this.record(stmt, ts.createThrow(stmt.error.visitExpression(this, null)));
        };
        _NodeEmitterVisitor.prototype.visitCommentStmt = function (stmt, sourceFile) {
            var text = stmt.multiline ? " " + stmt.comment + " " : " " + stmt.comment;
            return this.createCommentStmt(text, stmt.multiline, sourceFile);
        };
        _NodeEmitterVisitor.prototype.visitJSDocCommentStmt = function (stmt, sourceFile) {
            return this.createCommentStmt(stmt.toString(), true, sourceFile);
        };
        _NodeEmitterVisitor.prototype.createCommentStmt = function (text, multiline, sourceFile) {
            var commentStmt = ts.createNotEmittedStatement(sourceFile);
            var kind = multiline ? ts.SyntaxKind.MultiLineCommentTrivia : ts.SyntaxKind.SingleLineCommentTrivia;
            ts.setSyntheticLeadingComments(commentStmt, [{ kind: kind, text: text, pos: -1, end: -1 }]);
            return commentStmt;
        };
        // ExpressionVisitor
        _NodeEmitterVisitor.prototype.visitReadVarExpr = function (expr) {
            switch (expr.builtin) {
                case compiler_1.BuiltinVar.This:
                    return this.record(expr, ts.createIdentifier(METHOD_THIS_NAME));
                case compiler_1.BuiltinVar.CatchError:
                    return this.record(expr, ts.createIdentifier(CATCH_ERROR_NAME));
                case compiler_1.BuiltinVar.CatchStack:
                    return this.record(expr, ts.createIdentifier(CATCH_STACK_NAME));
                case compiler_1.BuiltinVar.Super:
                    return this.record(expr, ts.createSuper());
            }
            if (expr.name) {
                return this.record(expr, ts.createIdentifier(expr.name));
            }
            throw Error("Unexpected ReadVarExpr form");
        };
        _NodeEmitterVisitor.prototype.visitWriteVarExpr = function (expr) {
            return this.record(expr, ts.createAssignment(ts.createIdentifier(expr.name), expr.value.visitExpression(this, null)));
        };
        _NodeEmitterVisitor.prototype.visitWriteKeyExpr = function (expr) {
            return this.record(expr, ts.createAssignment(ts.createElementAccess(expr.receiver.visitExpression(this, null), expr.index.visitExpression(this, null)), expr.value.visitExpression(this, null)));
        };
        _NodeEmitterVisitor.prototype.visitWritePropExpr = function (expr) {
            return this.record(expr, ts.createAssignment(ts.createPropertyAccess(expr.receiver.visitExpression(this, null), expr.name), expr.value.visitExpression(this, null)));
        };
        _NodeEmitterVisitor.prototype.visitInvokeMethodExpr = function (expr) {
            var _this = this;
            var methodName = getMethodName(expr);
            return this.record(expr, ts.createCall(ts.createPropertyAccess(expr.receiver.visitExpression(this, null), methodName), 
            /* typeArguments */ undefined, expr.args.map(function (arg) { return arg.visitExpression(_this, null); })));
        };
        _NodeEmitterVisitor.prototype.visitInvokeFunctionExpr = function (expr) {
            var _this = this;
            return this.record(expr, ts.createCall(expr.fn.visitExpression(this, null), /* typeArguments */ undefined, expr.args.map(function (arg) { return arg.visitExpression(_this, null); })));
        };
        _NodeEmitterVisitor.prototype.visitInstantiateExpr = function (expr) {
            var _this = this;
            return this.record(expr, ts.createNew(expr.classExpr.visitExpression(this, null), /* typeArguments */ undefined, expr.args.map(function (arg) { return arg.visitExpression(_this, null); })));
        };
        _NodeEmitterVisitor.prototype.visitLiteralExpr = function (expr) { return this.record(expr, createLiteral(expr.value)); };
        _NodeEmitterVisitor.prototype.visitExternalExpr = function (expr) {
            return this.record(expr, this._visitIdentifier(expr.value));
        };
        _NodeEmitterVisitor.prototype.visitConditionalExpr = function (expr) {
            // TODO {chuckj}: Review use of ! on falseCase. Should it be non-nullable?
            return this.record(expr, ts.createParen(ts.createConditional(expr.condition.visitExpression(this, null), expr.trueCase.visitExpression(this, null), expr.falseCase.visitExpression(this, null))));
        };
        _NodeEmitterVisitor.prototype.visitNotExpr = function (expr) {
            return this.record(expr, ts.createPrefix(ts.SyntaxKind.ExclamationToken, expr.condition.visitExpression(this, null)));
        };
        _NodeEmitterVisitor.prototype.visitAssertNotNullExpr = function (expr) {
            return expr.condition.visitExpression(this, null);
        };
        _NodeEmitterVisitor.prototype.visitCastExpr = function (expr) {
            return expr.value.visitExpression(this, null);
        };
        _NodeEmitterVisitor.prototype.visitFunctionExpr = function (expr) {
            return this.record(expr, ts.createFunctionExpression(
            /* modifiers */ undefined, /* astriskToken */ undefined, 
            /* name */ expr.name || undefined, 
            /* typeParameters */ undefined, expr.params.map(function (p) { return ts.createParameter(
            /* decorators */ undefined, /* modifiers */ undefined, 
            /* dotDotDotToken */ undefined, p.name); }), 
            /* type */ undefined, this._visitStatements(expr.statements)));
        };
        _NodeEmitterVisitor.prototype.visitBinaryOperatorExpr = function (expr) {
            var binaryOperator;
            switch (expr.operator) {
                case compiler_1.BinaryOperator.And:
                    binaryOperator = ts.SyntaxKind.AmpersandAmpersandToken;
                    break;
                case compiler_1.BinaryOperator.BitwiseAnd:
                    binaryOperator = ts.SyntaxKind.AmpersandToken;
                    break;
                case compiler_1.BinaryOperator.Bigger:
                    binaryOperator = ts.SyntaxKind.GreaterThanToken;
                    break;
                case compiler_1.BinaryOperator.BiggerEquals:
                    binaryOperator = ts.SyntaxKind.GreaterThanEqualsToken;
                    break;
                case compiler_1.BinaryOperator.Divide:
                    binaryOperator = ts.SyntaxKind.SlashToken;
                    break;
                case compiler_1.BinaryOperator.Equals:
                    binaryOperator = ts.SyntaxKind.EqualsEqualsToken;
                    break;
                case compiler_1.BinaryOperator.Identical:
                    binaryOperator = ts.SyntaxKind.EqualsEqualsEqualsToken;
                    break;
                case compiler_1.BinaryOperator.Lower:
                    binaryOperator = ts.SyntaxKind.LessThanToken;
                    break;
                case compiler_1.BinaryOperator.LowerEquals:
                    binaryOperator = ts.SyntaxKind.LessThanEqualsToken;
                    break;
                case compiler_1.BinaryOperator.Minus:
                    binaryOperator = ts.SyntaxKind.MinusToken;
                    break;
                case compiler_1.BinaryOperator.Modulo:
                    binaryOperator = ts.SyntaxKind.PercentToken;
                    break;
                case compiler_1.BinaryOperator.Multiply:
                    binaryOperator = ts.SyntaxKind.AsteriskToken;
                    break;
                case compiler_1.BinaryOperator.NotEquals:
                    binaryOperator = ts.SyntaxKind.ExclamationEqualsToken;
                    break;
                case compiler_1.BinaryOperator.NotIdentical:
                    binaryOperator = ts.SyntaxKind.ExclamationEqualsEqualsToken;
                    break;
                case compiler_1.BinaryOperator.Or:
                    binaryOperator = ts.SyntaxKind.BarBarToken;
                    break;
                case compiler_1.BinaryOperator.Plus:
                    binaryOperator = ts.SyntaxKind.PlusToken;
                    break;
                default:
                    throw new Error("Unknown operator: " + expr.operator);
            }
            var binary = ts.createBinary(expr.lhs.visitExpression(this, null), binaryOperator, expr.rhs.visitExpression(this, null));
            return this.record(expr, expr.parens ? ts.createParen(binary) : binary);
        };
        _NodeEmitterVisitor.prototype.visitReadPropExpr = function (expr) {
            return this.record(expr, ts.createPropertyAccess(expr.receiver.visitExpression(this, null), expr.name));
        };
        _NodeEmitterVisitor.prototype.visitReadKeyExpr = function (expr) {
            return this.record(expr, ts.createElementAccess(expr.receiver.visitExpression(this, null), expr.index.visitExpression(this, null)));
        };
        _NodeEmitterVisitor.prototype.visitLiteralArrayExpr = function (expr) {
            var _this = this;
            return this.record(expr, ts.createArrayLiteral(expr.entries.map(function (entry) { return entry.visitExpression(_this, null); })));
        };
        _NodeEmitterVisitor.prototype.visitLiteralMapExpr = function (expr) {
            var _this = this;
            return this.record(expr, ts.createObjectLiteral(expr.entries.map(function (entry) { return ts.createPropertyAssignment(entry.quoted || !_VALID_IDENTIFIER_RE.test(entry.key) ?
                ts.createLiteral(entry.key) :
                entry.key, entry.value.visitExpression(_this, null)); })));
        };
        _NodeEmitterVisitor.prototype.visitCommaExpr = function (expr) {
            var _this = this;
            return this.record(expr, expr.parts.map(function (e) { return e.visitExpression(_this, null); })
                .reduce(function (left, right) {
                return left ? ts.createBinary(left, ts.SyntaxKind.CommaToken, right) : right;
            }, null));
        };
        _NodeEmitterVisitor.prototype._visitStatements = function (statements) {
            return this._visitStatementsPrefix([], statements);
        };
        _NodeEmitterVisitor.prototype._visitStatementsPrefix = function (prefix, statements) {
            var _this = this;
            return ts.createBlock(tslib_1.__spread(prefix, statements.map(function (stmt) { return stmt.visitStatement(_this, null); }).filter(function (f) { return f != null; })));
        };
        _NodeEmitterVisitor.prototype._visitIdentifier = function (value) {
            // name can only be null during JIT which never executes this code.
            var moduleName = value.moduleName, name = value.name;
            var prefixIdent = null;
            if (moduleName) {
                var prefix = this._importsWithPrefixes.get(moduleName);
                if (prefix == null) {
                    prefix = "i" + this._importsWithPrefixes.size;
                    this._importsWithPrefixes.set(moduleName, prefix);
                }
                prefixIdent = ts.createIdentifier(prefix);
            }
            if (prefixIdent) {
                return ts.createPropertyAccess(prefixIdent, name);
            }
            else {
                var id = ts.createIdentifier(name);
                if (this._exportedVariableIdentifiers.has(name)) {
                    // In order for this new identifier node to be properly rewritten in CommonJS output,
                    // it must have its original node set to a parsed instance of the same identifier.
                    ts.setOriginalNode(id, this._exportedVariableIdentifiers.get(name));
                }
                return id;
            }
        };
        return _NodeEmitterVisitor;
    }());
    function getMethodName(methodRef) {
        if (methodRef.name) {
            return methodRef.name;
        }
        else {
            switch (methodRef.builtin) {
                case compiler_1.BuiltinMethod.Bind:
                    return 'bind';
                case compiler_1.BuiltinMethod.ConcatArray:
                    return 'concat';
                case compiler_1.BuiltinMethod.SubscribeObservable:
                    return 'subscribe';
            }
        }
        throw new Error('Unexpected method reference form');
    }
    function modifierFromModifier(modifier) {
        switch (modifier) {
            case compiler_1.StmtModifier.Exported:
                return ts.createToken(ts.SyntaxKind.ExportKeyword);
            case compiler_1.StmtModifier.Final:
                return ts.createToken(ts.SyntaxKind.ConstKeyword);
            case compiler_1.StmtModifier.Private:
                return ts.createToken(ts.SyntaxKind.PrivateKeyword);
            case compiler_1.StmtModifier.Static:
                return ts.createToken(ts.SyntaxKind.StaticKeyword);
        }
        return util_1.error("unknown statement modifier");
    }
    function translateModifiers(modifiers) {
        return modifiers == null ? undefined : modifiers.map(modifierFromModifier);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9lbWl0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy90cmFuc2Zvcm1lcnMvbm9kZV9lbWl0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUEyb0I7SUFDM29CLCtCQUFpQztJQUNqQyxvRUFBNkI7SUFJN0IsSUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUM7SUFDaEMsSUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7SUFDakMsSUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7SUFDakMsSUFBTSxvQkFBb0IsR0FBRyx1QkFBdUIsQ0FBQztJQUVyRDtRQUFBO1FBZ0NBLENBQUM7UUEvQkMsZ0RBQWdCLEdBQWhCLFVBQWlCLFVBQXlCLEVBQUUsS0FBa0IsRUFBRSxRQUFpQjtZQUUvRSxJQUFNLFNBQVMsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7WUFDNUMsMkZBQTJGO1lBQzNGLFNBQVM7WUFDVCxJQUFNLFVBQVUsR0FBVSxFQUFFLENBQUMsTUFBTSxPQUFULEVBQUUsbUJBQ3JCLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBcEMsQ0FBb0MsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksSUFBSSxJQUFJLEVBQVosQ0FBWSxDQUFDLEVBQUMsQ0FBQztZQUM3RixJQUFNLGFBQWEsR0FBbUIsRUFBRSxDQUFDO1lBQ3pDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDdEUsYUFBYSxDQUFDLElBQUksQ0FB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QVMsQ0FBQyxDQUFDLENBQUMsU0FBVyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQy9FLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXNzZXJ0Tm90TnVsbCwgQmluYXJ5T3BlcmF0b3IsIEJpbmFyeU9wZXJhdG9yRXhwciwgQnVpbHRpbk1ldGhvZCwgQnVpbHRpblZhciwgQ2FzdEV4cHIsIENsYXNzU3RtdCwgQ29tbWFFeHByLCBDb21tZW50U3RtdCwgQ29uZGl0aW9uYWxFeHByLCBEZWNsYXJlRnVuY3Rpb25TdG10LCBEZWNsYXJlVmFyU3RtdCwgRXhwcmVzc2lvblN0YXRlbWVudCwgRXhwcmVzc2lvblZpc2l0b3IsIEV4dGVybmFsRXhwciwgRXh0ZXJuYWxSZWZlcmVuY2UsIEZ1bmN0aW9uRXhwciwgSWZTdG10LCBJbnN0YW50aWF0ZUV4cHIsIEludm9rZUZ1bmN0aW9uRXhwciwgSW52b2tlTWV0aG9kRXhwciwgSlNEb2NDb21tZW50U3RtdCwgTGl0ZXJhbEFycmF5RXhwciwgTGl0ZXJhbEV4cHIsIExpdGVyYWxNYXBFeHByLCBOb3RFeHByLCBQYXJzZVNvdXJjZUZpbGUsIFBhcnNlU291cmNlU3BhbiwgUGFydGlhbE1vZHVsZSwgUmVhZEtleUV4cHIsIFJlYWRQcm9wRXhwciwgUmVhZFZhckV4cHIsIFJldHVyblN0YXRlbWVudCwgU3RhdGVtZW50LCBTdGF0ZW1lbnRWaXNpdG9yLCBTdG10TW9kaWZpZXIsIFRocm93U3RtdCwgVHJ5Q2F0Y2hTdG10LCBXcml0ZUtleUV4cHIsIFdyaXRlUHJvcEV4cHIsIFdyaXRlVmFyRXhwcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge2Vycm9yfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE5vZGUgeyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbDsgfVxuXG5jb25zdCBNRVRIT0RfVEhJU19OQU1FID0gJ3RoaXMnO1xuY29uc3QgQ0FUQ0hfRVJST1JfTkFNRSA9ICdlcnJvcic7XG5jb25zdCBDQVRDSF9TVEFDS19OQU1FID0gJ3N0YWNrJztcbmNvbnN0IF9WQUxJRF9JREVOVElGSUVSX1JFID0gL15bJEEtWl9dWzAtOUEtWl8kXSokL2k7XG5cbmV4cG9ydCBjbGFzcyBUeXBlU2NyaXB0Tm9kZUVtaXR0ZXIge1xuICB1cGRhdGVTb3VyY2VGaWxlKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHN0bXRzOiBTdGF0ZW1lbnRbXSwgcHJlYW1ibGU/OiBzdHJpbmcpOlxuICAgICAgW3RzLlNvdXJjZUZpbGUsIE1hcDx0cy5Ob2RlLCBOb2RlPl0ge1xuICAgIGNvbnN0IGNvbnZlcnRlciA9IG5ldyBfTm9kZUVtaXR0ZXJWaXNpdG9yKCk7XG4gICAgLy8gW10uY29uY2F0IGZsYXR0ZW5zIHRoZSByZXN1bHQgc28gdGhhdCBlYWNoIGB2aXNpdC4uLmAgbWV0aG9kIGNhbiBhbHNvIHJldHVybiBhbiBhcnJheSBvZlxuICAgIC8vIHN0bXRzLlxuICAgIGNvbnN0IHN0YXRlbWVudHM6IGFueVtdID0gW10uY29uY2F0KFxuICAgICAgICAuLi5zdG10cy5tYXAoc3RtdCA9PiBzdG10LnZpc2l0U3RhdGVtZW50KGNvbnZlcnRlciwgbnVsbCkpLmZpbHRlcihzdG10ID0+IHN0bXQgIT0gbnVsbCkpO1xuICAgIGNvbnN0IHByZWFtYmxlU3RtdHM6IHRzLlN0YXRlbWVudFtdID0gW107XG4gICAgaWYgKHByZWFtYmxlKSB7XG4gICAgICBjb25zdCBjb21tZW50U3RtdCA9IHRoaXMuY3JlYXRlQ29tbWVudFN0YXRlbWVudChzb3VyY2VGaWxlLCBwcmVhbWJsZSk7XG4gICAgICBwcmVhbWJsZVN0bXRzLnB1c2goY29tbWVudFN0bXQpO1xuICAgIH1cbiAgICBjb25zdCBzb3VyY2VTdGF0ZW1lbnRzID1cbiAgICAgICAgWy4uLnByZWFtYmxlU3RtdHMsIC4uLmNvbnZlcnRlci5nZXRSZWV4cG9ydHMoKSwgLi4uY29udmVydGVyLmdldEltcG9ydHMoKSwgLi4uc3RhdGVtZW50c107XG4gICAgY29udmVydGVyLnVwZGF0ZVNvdXJjZU1hcChzb3VyY2VTdGF0ZW1lbnRzKTtcbiAgICBjb25zdCBuZXdTb3VyY2VGaWxlID0gdHMudXBkYXRlU291cmNlRmlsZU5vZGUoc291cmNlRmlsZSwgc291cmNlU3RhdGVtZW50cyk7XG4gICAgcmV0dXJuIFtuZXdTb3VyY2VGaWxlLCBjb252ZXJ0ZXIuZ2V0Tm9kZU1hcCgpXTtcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIGEgbm90IGVtaXR0ZWQgc3RhdGVtZW50IGNvbnRhaW5pbmcgdGhlIGdpdmVuIGNvbW1lbnQuICovXG4gIGNyZWF0ZUNvbW1lbnRTdGF0ZW1lbnQoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgY29tbWVudDogc3RyaW5nKTogdHMuU3RhdGVtZW50IHtcbiAgICBpZiAoY29tbWVudC5zdGFydHNXaXRoKCcvKicpICYmIGNvbW1lbnQuZW5kc1dpdGgoJyovJykpIHtcbiAgICAgIGNvbW1lbnQgPSBjb21tZW50LnN1YnN0cigyLCBjb21tZW50Lmxlbmd0aCAtIDQpO1xuICAgIH1cbiAgICBjb25zdCBjb21tZW50U3RtdCA9IHRzLmNyZWF0ZU5vdEVtaXR0ZWRTdGF0ZW1lbnQoc291cmNlRmlsZSk7XG4gICAgdHMuc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKFxuICAgICAgICBjb21tZW50U3RtdCxcbiAgICAgICAgW3traW5kOiB0cy5TeW50YXhLaW5kLk11bHRpTGluZUNvbW1lbnRUcml2aWEsIHRleHQ6IGNvbW1lbnQsIHBvczogLTEsIGVuZDogLTF9XSk7XG4gICAgdHMuc2V0RW1pdEZsYWdzKGNvbW1lbnRTdG10LCB0cy5FbWl0RmxhZ3MuQ3VzdG9tUHJvbG9ndWUpO1xuICAgIHJldHVybiBjb21tZW50U3RtdDtcbiAgfVxufVxuXG4vKipcbiAqIFVwZGF0ZSB0aGUgZ2l2ZW4gc291cmNlIGZpbGUgdG8gaW5jbHVkZSB0aGUgY2hhbmdlcyBzcGVjaWZpZWQgaW4gbW9kdWxlLlxuICpcbiAqIFRoZSBtb2R1bGUgcGFyYW1ldGVyIGlzIHRyZWF0ZWQgYXMgYSBwYXJ0aWFsIG1vZHVsZSBtZWFuaW5nIHRoYXQgdGhlIHN0YXRlbWVudHMgYXJlIGFkZGVkIHRvXG4gKiB0aGUgbW9kdWxlIGluc3RlYWQgb2YgcmVwbGFjaW5nIHRoZSBtb2R1bGUuIEFsc28sIGFueSBjbGFzc2VzIGFyZSB0cmVhdGVkIGFzIHBhcnRpYWwgY2xhc3Nlc1xuICogYW5kIHRoZSBpbmNsdWRlZCBtZW1iZXJzIGFyZSBhZGRlZCB0byB0aGUgY2xhc3Mgd2l0aCB0aGUgc2FtZSBuYW1lIGluc3RlYWQgb2YgYSBuZXcgY2xhc3NcbiAqIGJlaW5nIGNyZWF0ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTb3VyY2VGaWxlKFxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIG1vZHVsZTogUGFydGlhbE1vZHVsZSxcbiAgICBjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpOiBbdHMuU291cmNlRmlsZSwgTWFwPHRzLk5vZGUsIE5vZGU+XSB7XG4gIGNvbnN0IGNvbnZlcnRlciA9IG5ldyBfTm9kZUVtaXR0ZXJWaXNpdG9yKCk7XG4gIGNvbnZlcnRlci5sb2FkRXhwb3J0ZWRWYXJpYWJsZUlkZW50aWZpZXJzKHNvdXJjZUZpbGUpO1xuXG4gIGNvbnN0IHByZWZpeFN0YXRlbWVudHMgPSBtb2R1bGUuc3RhdGVtZW50cy5maWx0ZXIoc3RhdGVtZW50ID0+ICEoc3RhdGVtZW50IGluc3RhbmNlb2YgQ2xhc3NTdG10KSk7XG4gIGNvbnN0IGNsYXNzZXMgPVxuICAgICAgbW9kdWxlLnN0YXRlbWVudHMuZmlsdGVyKHN0YXRlbWVudCA9PiBzdGF0ZW1lbnQgaW5zdGFuY2VvZiBDbGFzc1N0bXQpIGFzIENsYXNzU3RtdFtdO1xuICBjb25zdCBjbGFzc01hcCA9IG5ldyBNYXAoXG4gICAgICBjbGFzc2VzLm1hcDxbc3RyaW5nLCBDbGFzc1N0bXRdPihjbGFzc1N0YXRlbWVudCA9PiBbY2xhc3NTdGF0ZW1lbnQubmFtZSwgY2xhc3NTdGF0ZW1lbnRdKSk7XG4gIGNvbnN0IGNsYXNzTmFtZXMgPSBuZXcgU2V0KGNsYXNzZXMubWFwKGNsYXNzU3RhdGVtZW50ID0+IGNsYXNzU3RhdGVtZW50Lm5hbWUpKTtcblxuICBjb25zdCBwcmVmaXg6IHRzLlN0YXRlbWVudFtdID1cbiAgICAgIHByZWZpeFN0YXRlbWVudHMubWFwKHN0YXRlbWVudCA9PiBzdGF0ZW1lbnQudmlzaXRTdGF0ZW1lbnQoY29udmVydGVyLCBzb3VyY2VGaWxlKSk7XG5cbiAgLy8gQWRkIHN0YXRpYyBtZXRob2RzIHRvIGFsbCB0aGUgY2xhc3NlcyByZWZlcmVuY2VkIGluIG1vZHVsZS5cbiAgbGV0IG5ld1N0YXRlbWVudHMgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHMubWFwKG5vZGUgPT4ge1xuICAgIGlmIChub2RlLmtpbmQgPT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICBjb25zdCBjbGFzc0RlY2xhcmF0aW9uID0gbm9kZSBhcyB0cy5DbGFzc0RlY2xhcmF0aW9uO1xuICAgICAgY29uc3QgbmFtZSA9IGNsYXNzRGVjbGFyYXRpb24ubmFtZTtcbiAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgIGNvbnN0IGNsYXNzU3RhdGVtZW50ID0gY2xhc3NNYXAuZ2V0KG5hbWUudGV4dCk7XG4gICAgICAgIGlmIChjbGFzc1N0YXRlbWVudCkge1xuICAgICAgICAgIGNsYXNzTmFtZXMuZGVsZXRlKG5hbWUudGV4dCk7XG4gICAgICAgICAgY29uc3QgY2xhc3NNZW1iZXJIb2xkZXIgPVxuICAgICAgICAgICAgICBjb252ZXJ0ZXIudmlzaXREZWNsYXJlQ2xhc3NTdG10KGNsYXNzU3RhdGVtZW50KSBhcyB0cy5DbGFzc0RlY2xhcmF0aW9uO1xuICAgICAgICAgIGNvbnN0IG5ld01ldGhvZHMgPVxuICAgICAgICAgICAgICBjbGFzc01lbWJlckhvbGRlci5tZW1iZXJzLmZpbHRlcihtZW1iZXIgPT4gbWVtYmVyLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQ29uc3RydWN0b3IpO1xuICAgICAgICAgIGNvbnN0IG5ld01lbWJlcnMgPSBbLi4uY2xhc3NEZWNsYXJhdGlvbi5tZW1iZXJzLCAuLi5uZXdNZXRob2RzXTtcblxuICAgICAgICAgIHJldHVybiB0cy51cGRhdGVDbGFzc0RlY2xhcmF0aW9uKFxuICAgICAgICAgICAgICBjbGFzc0RlY2xhcmF0aW9uLFxuICAgICAgICAgICAgICAvKiBkZWNvcmF0b3JzICovIGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9ycyxcbiAgICAgICAgICAgICAgLyogbW9kaWZpZXJzICovIGNsYXNzRGVjbGFyYXRpb24ubW9kaWZpZXJzLFxuICAgICAgICAgICAgICAvKiBuYW1lICovIGNsYXNzRGVjbGFyYXRpb24ubmFtZSxcbiAgICAgICAgICAgICAgLyogdHlwZVBhcmFtZXRlcnMgKi8gY2xhc3NEZWNsYXJhdGlvbi50eXBlUGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgLyogaGVyaXRhZ2VDbGF1c2VzICovIGNsYXNzRGVjbGFyYXRpb24uaGVyaXRhZ2VDbGF1c2VzIHx8IFtdLFxuICAgICAgICAgICAgICAvKiBtZW1iZXJzICovIG5ld01lbWJlcnMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xuICB9KTtcblxuICAvLyBWYWxpZGF0ZSB0aGF0IGFsbCB0aGUgY2xhc3NlcyBoYXZlIGJlZW4gZ2VuZXJhdGVkXG4gIGNsYXNzTmFtZXMuc2l6ZSA9PSAwIHx8XG4gICAgICBlcnJvcihcbiAgICAgICAgICBgJHtjbGFzc05hbWVzLnNpemUgPT0gMSA/ICdDbGFzcycgOiAnQ2xhc3Nlcyd9IFwiJHtBcnJheS5mcm9tKGNsYXNzTmFtZXMua2V5cygpKS5qb2luKCcsICcpfVwiIG5vdCBnZW5lcmF0ZWRgKTtcblxuICAvLyBBZGQgaW1wb3J0cyB0byB0aGUgbW9kdWxlIHJlcXVpcmVkIGJ5IHRoZSBuZXcgbWV0aG9kc1xuICBjb25zdCBpbXBvcnRzID0gY29udmVydGVyLmdldEltcG9ydHMoKTtcbiAgaWYgKGltcG9ydHMgJiYgaW1wb3J0cy5sZW5ndGgpIHtcbiAgICAvLyBGaW5kIHdoZXJlIHRoZSBuZXcgaW1wb3J0cyBzaG91bGQgZ29cbiAgICBjb25zdCBpbmRleCA9IGZpcnN0QWZ0ZXIoXG4gICAgICAgIG5ld1N0YXRlbWVudHMsIHN0YXRlbWVudCA9PiBzdGF0ZW1lbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbXBvcnREZWNsYXJhdGlvbiB8fFxuICAgICAgICAgICAgc3RhdGVtZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSW1wb3J0RXF1YWxzRGVjbGFyYXRpb24pO1xuICAgIG5ld1N0YXRlbWVudHMgPVxuICAgICAgICBbLi4ubmV3U3RhdGVtZW50cy5zbGljZSgwLCBpbmRleCksIC4uLmltcG9ydHMsIC4uLnByZWZpeCwgLi4ubmV3U3RhdGVtZW50cy5zbGljZShpbmRleCldO1xuICB9IGVsc2Uge1xuICAgIG5ld1N0YXRlbWVudHMgPSBbLi4ucHJlZml4LCAuLi5uZXdTdGF0ZW1lbnRzXTtcbiAgfVxuXG4gIGNvbnZlcnRlci51cGRhdGVTb3VyY2VNYXAobmV3U3RhdGVtZW50cyk7XG4gIGNvbnN0IG5ld1NvdXJjZUZpbGUgPSB0cy51cGRhdGVTb3VyY2VGaWxlTm9kZShzb3VyY2VGaWxlLCBuZXdTdGF0ZW1lbnRzKTtcblxuICByZXR1cm4gW25ld1NvdXJjZUZpbGUsIGNvbnZlcnRlci5nZXROb2RlTWFwKCldO1xufVxuXG4vLyBSZXR1cm4gdGhlIGluZGV4IGFmdGVyIHRoZSBmaXJzdCB2YWx1ZSBpbiBgYWAgdGhhdCBkb2Vzbid0IG1hdGNoIHRoZSBwcmVkaWNhdGUgYWZ0ZXIgYSB2YWx1ZSB0aGF0XG4vLyBkb2VzIG9yIDAgaWYgbm8gdmFsdWVzIG1hdGNoLlxuZnVuY3Rpb24gZmlyc3RBZnRlcjxUPihhOiBUW10sIHByZWRpY2F0ZTogKHZhbHVlOiBUKSA9PiBib29sZWFuKSB7XG4gIGxldCBpbmRleCA9IDA7XG4gIGNvbnN0IGxlbiA9IGEubGVuZ3RoO1xuICBmb3IgKDsgaW5kZXggPCBsZW47IGluZGV4KyspIHtcbiAgICBjb25zdCB2YWx1ZSA9IGFbaW5kZXhdO1xuICAgIGlmIChwcmVkaWNhdGUodmFsdWUpKSBicmVhaztcbiAgfVxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gMDtcbiAgZm9yICg7IGluZGV4IDwgbGVuOyBpbmRleCsrKSB7XG4gICAgY29uc3QgdmFsdWUgPSBhW2luZGV4XTtcbiAgICBpZiAoIXByZWRpY2F0ZSh2YWx1ZSkpIGJyZWFrO1xuICB9XG4gIHJldHVybiBpbmRleDtcbn1cblxuLy8gQSByZWNvcmRlZCBub2RlIGlzIGEgc3VidHlwZSBvZiB0aGUgbm9kZSB0aGF0IGlzIG1hcmtlZCBhcyBiZWluZyByZWNvcmRlZC4gVGhpcyBpcyB1c2VkXG4vLyB0byBlbnN1cmUgdGhhdCBOb2RlRW1pdHRlclZpc2l0b3IucmVjb3JkIGhhcyBiZWVuIGNhbGxlZCBvbiBhbGwgbm9kZXMgcmV0dXJuZWQgYnkgdGhlXG4vLyBOb2RlRW1pdHRlclZpc2l0b3JcbnR5cGUgUmVjb3JkZWROb2RlPFQgZXh0ZW5kcyB0cy5Ob2RlID0gdHMuTm9kZT4gPSAoVCAmIHsgX19yZWNvcmRlZDogYW55OyB9KSB8IG51bGw7XG5cbmZ1bmN0aW9uIGVzY2FwZUxpdGVyYWwodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB2YWx1ZS5yZXBsYWNlKC8oXFxcInxcXFxcKS9nLCAnXFxcXCQxJykucmVwbGFjZSgvKFxcbil8KFxccikvZywgZnVuY3Rpb24odiwgbiwgcikge1xuICAgIHJldHVybiBuID8gJ1xcXFxuJyA6ICdcXFxccic7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVMaXRlcmFsKHZhbHVlOiBhbnkpIHtcbiAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRzLmNyZWF0ZU51bGwoKTtcbiAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ3VuZGVmaW5lZCcpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRzLmNyZWF0ZUxpdGVyYWwodmFsdWUpO1xuICAgIGlmICh0cy5pc1N0cmluZ0xpdGVyYWwocmVzdWx0KSAmJiByZXN1bHQudGV4dC5pbmRleE9mKCdcXFxcJykgPj0gMCkge1xuICAgICAgLy8gSGFjayB0byBhdm9pZCBwcm9ibGVtcyBjYXVzZSBpbmRpcmVjdGx5IGJ5OlxuICAgICAgLy8gICAgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8yMDE5MlxuICAgICAgLy8gVGhpcyBhdm9pZHMgdGhlIHN0cmluZyBlc2NhcGluZyBub3JtYWxseSBwZXJmb3JtZWQgZm9yIGEgc3RyaW5nIHJlbHlpbmcgb24gdGhhdFxuICAgICAgLy8gVHlwZVNjcmlwdCBqdXN0IGVtaXRzIHRoZSB0ZXh0IHJhdyBmb3IgYSBudW1lcmljIGxpdGVyYWwuXG4gICAgICAocmVzdWx0IGFzIGFueSkua2luZCA9IHRzLlN5bnRheEtpbmQuTnVtZXJpY0xpdGVyYWw7XG4gICAgICByZXN1bHQudGV4dCA9IGBcIiR7ZXNjYXBlTGl0ZXJhbChyZXN1bHQudGV4dCl9XCJgO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzRXhwb3J0VHlwZVN0YXRlbWVudChzdGF0ZW1lbnQ6IHRzLlN0YXRlbWVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gISFzdGF0ZW1lbnQubW9kaWZpZXJzICYmXG4gICAgICBzdGF0ZW1lbnQubW9kaWZpZXJzLnNvbWUobW9kID0+IG1vZC5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cG9ydEtleXdvcmQpO1xufVxuXG4vKipcbiAqIFZpc2l0cyBhbiBvdXRwdXQgYXN0IGFuZCBwcm9kdWNlcyB0aGUgY29ycmVzcG9uZGluZyBUeXBlU2NyaXB0IHN5bnRoZXRpYyBub2Rlcy5cbiAqL1xuY2xhc3MgX05vZGVFbWl0dGVyVmlzaXRvciBpbXBsZW1lbnRzIFN0YXRlbWVudFZpc2l0b3IsIEV4cHJlc3Npb25WaXNpdG9yIHtcbiAgcHJpdmF0ZSBfbm9kZU1hcCA9IG5ldyBNYXA8dHMuTm9kZSwgTm9kZT4oKTtcbiAgcHJpdmF0ZSBfaW1wb3J0c1dpdGhQcmVmaXhlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIHByaXZhdGUgX3JlZXhwb3J0cyA9IG5ldyBNYXA8c3RyaW5nLCB7bmFtZTogc3RyaW5nLCBhczogc3RyaW5nfVtdPigpO1xuICBwcml2YXRlIF90ZW1wbGF0ZVNvdXJjZXMgPSBuZXcgTWFwPFBhcnNlU291cmNlRmlsZSwgdHMuU291cmNlTWFwU291cmNlPigpO1xuICBwcml2YXRlIF9leHBvcnRlZFZhcmlhYmxlSWRlbnRpZmllcnMgPSBuZXcgTWFwPHN0cmluZywgdHMuSWRlbnRpZmllcj4oKTtcblxuICAvKipcbiAgICogUHJvY2VzcyB0aGUgc291cmNlIGZpbGUgYW5kIGNvbGxlY3QgZXhwb3J0ZWQgaWRlbnRpZmllcnMgdGhhdCByZWZlciB0byB2YXJpYWJsZXMuXG4gICAqXG4gICAqIE9ubHkgdmFyaWFibGVzIGFyZSBjb2xsZWN0ZWQgYmVjYXVzZSBleHBvcnRlZCBjbGFzc2VzIHN0aWxsIGV4aXN0IGluIHRoZSBtb2R1bGUgc2NvcGUgaW5cbiAgICogQ29tbW9uSlMsIHdoZXJlYXMgdmFyaWFibGVzIGhhdmUgdGhlaXIgZGVjbGFyYXRpb25zIG1vdmVkIG9udG8gdGhlIGBleHBvcnRzYCBvYmplY3QsIGFuZCBhbGxcbiAgICogcmVmZXJlbmNlcyBhcmUgdXBkYXRlZCBhY2NvcmRpbmdseS5cbiAgICovXG4gIGxvYWRFeHBvcnRlZFZhcmlhYmxlSWRlbnRpZmllcnMoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIHNvdXJjZUZpbGUuc3RhdGVtZW50cy5mb3JFYWNoKHN0YXRlbWVudCA9PiB7XG4gICAgICBpZiAodHMuaXNWYXJpYWJsZVN0YXRlbWVudChzdGF0ZW1lbnQpICYmIGlzRXhwb3J0VHlwZVN0YXRlbWVudChzdGF0ZW1lbnQpKSB7XG4gICAgICAgIHN0YXRlbWVudC5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zLmZvckVhY2goZGVjbGFyYXRpb24gPT4ge1xuICAgICAgICAgIGlmICh0cy5pc0lkZW50aWZpZXIoZGVjbGFyYXRpb24ubmFtZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX2V4cG9ydGVkVmFyaWFibGVJZGVudGlmaWVycy5zZXQoZGVjbGFyYXRpb24ubmFtZS50ZXh0LCBkZWNsYXJhdGlvbi5uYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0UmVleHBvcnRzKCk6IHRzLlN0YXRlbWVudFtdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9yZWV4cG9ydHMuZW50cmllcygpKVxuICAgICAgICAubWFwKFxuICAgICAgICAgICAgKFtleHBvcnRlZEZpbGVQYXRoLCByZWV4cG9ydHNdKSA9PiB0cy5jcmVhdGVFeHBvcnREZWNsYXJhdGlvbihcbiAgICAgICAgICAgICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAvKiBtb2RpZmllcnMgKi8gdW5kZWZpbmVkLCB0cy5jcmVhdGVOYW1lZEV4cG9ydHMocmVleHBvcnRzLm1hcChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHtuYW1lLCBhc30pID0+IHRzLmNyZWF0ZUV4cG9ydFNwZWNpZmllcihuYW1lLCBhcykpKSxcbiAgICAgICAgICAgICAgICAvKiBtb2R1bGVTcGVjaWZpZXIgKi8gY3JlYXRlTGl0ZXJhbChleHBvcnRlZEZpbGVQYXRoKSkpO1xuICB9XG5cbiAgZ2V0SW1wb3J0cygpOiB0cy5TdGF0ZW1lbnRbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5faW1wb3J0c1dpdGhQcmVmaXhlcy5lbnRyaWVzKCkpXG4gICAgICAgIC5tYXAoXG4gICAgICAgICAgICAoW25hbWVzcGFjZSwgcHJlZml4XSkgPT4gdHMuY3JlYXRlSW1wb3J0RGVjbGFyYXRpb24oXG4gICAgICAgICAgICAgICAgLyogZGVjb3JhdG9ycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgLyogbW9kaWZpZXJzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAvKiBpbXBvcnRDbGF1c2UgKi8gdHMuY3JlYXRlSW1wb3J0Q2xhdXNlKFxuICAgICAgICAgICAgICAgICAgICAvKiBuYW1lICovPHRzLklkZW50aWZpZXI+KHVuZGVmaW5lZCBhcyBhbnkpLFxuICAgICAgICAgICAgICAgICAgICB0cy5jcmVhdGVOYW1lc3BhY2VJbXBvcnQodHMuY3JlYXRlSWRlbnRpZmllcihwcmVmaXgpKSksXG4gICAgICAgICAgICAgICAgLyogbW9kdWxlU3BlY2lmaWVyICovIGNyZWF0ZUxpdGVyYWwobmFtZXNwYWNlKSkpO1xuICB9XG5cbiAgZ2V0Tm9kZU1hcCgpIHsgcmV0dXJuIHRoaXMuX25vZGVNYXA7IH1cblxuICB1cGRhdGVTb3VyY2VNYXAoc3RhdGVtZW50czogdHMuU3RhdGVtZW50W10pIHtcbiAgICBsZXQgbGFzdFJhbmdlU3RhcnROb2RlOiB0cy5Ob2RlfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBsZXQgbGFzdFJhbmdlRW5kTm9kZTogdHMuTm9kZXx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgbGV0IGxhc3RSYW5nZTogdHMuU291cmNlTWFwUmFuZ2V8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gICAgY29uc3QgcmVjb3JkTGFzdFNvdXJjZVJhbmdlID0gKCkgPT4ge1xuICAgICAgaWYgKGxhc3RSYW5nZSAmJiBsYXN0UmFuZ2VTdGFydE5vZGUgJiYgbGFzdFJhbmdlRW5kTm9kZSkge1xuICAgICAgICBpZiAobGFzdFJhbmdlU3RhcnROb2RlID09IGxhc3RSYW5nZUVuZE5vZGUpIHtcbiAgICAgICAgICB0cy5zZXRTb3VyY2VNYXBSYW5nZShsYXN0UmFuZ2VFbmROb2RlLCBsYXN0UmFuZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRzLnNldFNvdXJjZU1hcFJhbmdlKGxhc3RSYW5nZVN0YXJ0Tm9kZSwgbGFzdFJhbmdlKTtcbiAgICAgICAgICAvLyBPbmx5IGVtaXQgdGhlIHBvcyBmb3IgdGhlIGZpcnN0IG5vZGUgZW1pdHRlZCBpbiB0aGUgcmFuZ2UuXG4gICAgICAgICAgdHMuc2V0RW1pdEZsYWdzKGxhc3RSYW5nZVN0YXJ0Tm9kZSwgdHMuRW1pdEZsYWdzLk5vVHJhaWxpbmdTb3VyY2VNYXApO1xuICAgICAgICAgIHRzLnNldFNvdXJjZU1hcFJhbmdlKGxhc3RSYW5nZUVuZE5vZGUsIGxhc3RSYW5nZSk7XG4gICAgICAgICAgLy8gT25seSBlbWl0IGVtaXQgZW5kIGZvciB0aGUgbGFzdCBub2RlIGVtaXR0ZWQgaW4gdGhlIHJhbmdlLlxuICAgICAgICAgIHRzLnNldEVtaXRGbGFncyhsYXN0UmFuZ2VFbmROb2RlLCB0cy5FbWl0RmxhZ3MuTm9MZWFkaW5nU291cmNlTWFwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCB2aXNpdE5vZGUgPSAodHNOb2RlOiB0cy5Ob2RlKSA9PiB7XG4gICAgICBjb25zdCBuZ05vZGUgPSB0aGlzLl9ub2RlTWFwLmdldCh0c05vZGUpO1xuICAgICAgaWYgKG5nTm9kZSkge1xuICAgICAgICBjb25zdCByYW5nZSA9IHRoaXMuc291cmNlUmFuZ2VPZihuZ05vZGUpO1xuICAgICAgICBpZiAocmFuZ2UpIHtcbiAgICAgICAgICBpZiAoIWxhc3RSYW5nZSB8fCByYW5nZS5zb3VyY2UgIT0gbGFzdFJhbmdlLnNvdXJjZSB8fCByYW5nZS5wb3MgIT0gbGFzdFJhbmdlLnBvcyB8fFxuICAgICAgICAgICAgICByYW5nZS5lbmQgIT0gbGFzdFJhbmdlLmVuZCkge1xuICAgICAgICAgICAgcmVjb3JkTGFzdFNvdXJjZVJhbmdlKCk7XG4gICAgICAgICAgICBsYXN0UmFuZ2VTdGFydE5vZGUgPSB0c05vZGU7XG4gICAgICAgICAgICBsYXN0UmFuZ2UgPSByYW5nZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGFzdFJhbmdlRW5kTm9kZSA9IHRzTm9kZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdHMuZm9yRWFjaENoaWxkKHRzTm9kZSwgdmlzaXROb2RlKTtcbiAgICB9O1xuICAgIHN0YXRlbWVudHMuZm9yRWFjaCh2aXNpdE5vZGUpO1xuICAgIHJlY29yZExhc3RTb3VyY2VSYW5nZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSByZWNvcmQ8VCBleHRlbmRzIHRzLk5vZGU+KG5nTm9kZTogTm9kZSwgdHNOb2RlOiBUfG51bGwpOiBSZWNvcmRlZE5vZGU8VD4ge1xuICAgIGlmICh0c05vZGUgJiYgIXRoaXMuX25vZGVNYXAuaGFzKHRzTm9kZSkpIHtcbiAgICAgIHRoaXMuX25vZGVNYXAuc2V0KHRzTm9kZSwgbmdOb2RlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRzTm9kZSBhcyBSZWNvcmRlZE5vZGU8VD47XG4gIH1cblxuICBwcml2YXRlIHNvdXJjZVJhbmdlT2Yobm9kZTogTm9kZSk6IHRzLlNvdXJjZU1hcFJhbmdlfG51bGwge1xuICAgIGlmIChub2RlLnNvdXJjZVNwYW4pIHtcbiAgICAgIGNvbnN0IHNwYW4gPSBub2RlLnNvdXJjZVNwYW47XG4gICAgICBpZiAoc3Bhbi5zdGFydC5maWxlID09IHNwYW4uZW5kLmZpbGUpIHtcbiAgICAgICAgY29uc3QgZmlsZSA9IHNwYW4uc3RhcnQuZmlsZTtcbiAgICAgICAgaWYgKGZpbGUudXJsKSB7XG4gICAgICAgICAgbGV0IHNvdXJjZSA9IHRoaXMuX3RlbXBsYXRlU291cmNlcy5nZXQoZmlsZSk7XG4gICAgICAgICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgICAgIHNvdXJjZSA9IHRzLmNyZWF0ZVNvdXJjZU1hcFNvdXJjZShmaWxlLnVybCwgZmlsZS5jb250ZW50LCBwb3MgPT4gcG9zKTtcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlU291cmNlcy5zZXQoZmlsZSwgc291cmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHtwb3M6IHNwYW4uc3RhcnQub2Zmc2V0LCBlbmQ6IHNwYW4uZW5kLm9mZnNldCwgc291cmNlfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TW9kaWZpZXJzKHN0bXQ6IFN0YXRlbWVudCkge1xuICAgIGxldCBtb2RpZmllcnM6IHRzLk1vZGlmaWVyW10gPSBbXTtcbiAgICBpZiAoc3RtdC5oYXNNb2RpZmllcihTdG10TW9kaWZpZXIuRXhwb3J0ZWQpKSB7XG4gICAgICBtb2RpZmllcnMucHVzaCh0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLkV4cG9ydEtleXdvcmQpKTtcbiAgICB9XG4gICAgcmV0dXJuIG1vZGlmaWVycztcbiAgfVxuXG4gIC8vIFN0YXRlbWVudFZpc2l0b3JcbiAgdmlzaXREZWNsYXJlVmFyU3RtdChzdG10OiBEZWNsYXJlVmFyU3RtdCkge1xuICAgIGlmIChzdG10Lmhhc01vZGlmaWVyKFN0bXRNb2RpZmllci5FeHBvcnRlZCkgJiYgc3RtdC52YWx1ZSBpbnN0YW5jZW9mIEV4dGVybmFsRXhwciAmJlxuICAgICAgICAhc3RtdC50eXBlKSB7XG4gICAgICAvLyBjaGVjayBmb3IgYSByZWV4cG9ydFxuICAgICAgY29uc3Qge25hbWUsIG1vZHVsZU5hbWV9ID0gc3RtdC52YWx1ZS52YWx1ZTtcbiAgICAgIGlmIChtb2R1bGVOYW1lKSB7XG4gICAgICAgIGxldCByZWV4cG9ydHMgPSB0aGlzLl9yZWV4cG9ydHMuZ2V0KG1vZHVsZU5hbWUpO1xuICAgICAgICBpZiAoIXJlZXhwb3J0cykge1xuICAgICAgICAgIHJlZXhwb3J0cyA9IFtdO1xuICAgICAgICAgIHRoaXMuX3JlZXhwb3J0cy5zZXQobW9kdWxlTmFtZSwgcmVleHBvcnRzKTtcbiAgICAgICAgfVxuICAgICAgICByZWV4cG9ydHMucHVzaCh7bmFtZTogbmFtZSAhLCBhczogc3RtdC5uYW1lfSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHZhckRlY2xMaXN0ID0gdHMuY3JlYXRlVmFyaWFibGVEZWNsYXJhdGlvbkxpc3QoW3RzLmNyZWF0ZVZhcmlhYmxlRGVjbGFyYXRpb24oXG4gICAgICAgIHRzLmNyZWF0ZUlkZW50aWZpZXIoc3RtdC5uYW1lKSxcbiAgICAgICAgLyogdHlwZSAqLyB1bmRlZmluZWQsXG4gICAgICAgIChzdG10LnZhbHVlICYmIHN0bXQudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpKSB8fCB1bmRlZmluZWQpXSk7XG5cbiAgICBpZiAoc3RtdC5oYXNNb2RpZmllcihTdG10TW9kaWZpZXIuRXhwb3J0ZWQpKSB7XG4gICAgICAvLyBOb3RlOiBXZSBuZWVkIHRvIGFkZCBhbiBleHBsaWNpdCB2YXJpYWJsZSBhbmQgZXhwb3J0IGRlY2xhcmF0aW9uIHNvIHRoYXRcbiAgICAgIC8vIHRoZSB2YXJpYWJsZSBjYW4gYmUgcmVmZXJyZWQgaW4gdGhlIHNhbWUgZmlsZSBhcyB3ZWxsLlxuICAgICAgY29uc3QgdHNWYXJTdG10ID1cbiAgICAgICAgICB0aGlzLnJlY29yZChzdG10LCB0cy5jcmVhdGVWYXJpYWJsZVN0YXRlbWVudCgvKiBtb2RpZmllcnMgKi9bXSwgdmFyRGVjbExpc3QpKTtcbiAgICAgIGNvbnN0IGV4cG9ydFN0bXQgPSB0aGlzLnJlY29yZChcbiAgICAgICAgICBzdG10LCB0cy5jcmVhdGVFeHBvcnREZWNsYXJhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgLypkZWNvcmF0b3JzKi8gdW5kZWZpbmVkLCAvKm1vZGlmaWVycyovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgdHMuY3JlYXRlTmFtZWRFeHBvcnRzKFt0cy5jcmVhdGVFeHBvcnRTcGVjaWZpZXIoc3RtdC5uYW1lLCBzdG10Lm5hbWUpXSkpKTtcbiAgICAgIHJldHVybiBbdHNWYXJTdG10LCBleHBvcnRTdG10XTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVjb3JkKHN0bXQsIHRzLmNyZWF0ZVZhcmlhYmxlU3RhdGVtZW50KHRoaXMuZ2V0TW9kaWZpZXJzKHN0bXQpLCB2YXJEZWNsTGlzdCkpO1xuICB9XG5cbiAgdmlzaXREZWNsYXJlRnVuY3Rpb25TdG10KHN0bXQ6IERlY2xhcmVGdW5jdGlvblN0bXQpIHtcbiAgICByZXR1cm4gdGhpcy5yZWNvcmQoXG4gICAgICAgIHN0bXQsIHRzLmNyZWF0ZUZ1bmN0aW9uRGVjbGFyYXRpb24oXG4gICAgICAgICAgICAgICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCwgdGhpcy5nZXRNb2RpZmllcnMoc3RtdCksXG4gICAgICAgICAgICAgICAgICAvKiBhc3Rlcmlza1Rva2VuICovIHVuZGVmaW5lZCwgc3RtdC5uYW1lLCAvKiB0eXBlUGFyYW1ldGVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICBzdG10LnBhcmFtcy5tYXAoXG4gICAgICAgICAgICAgICAgICAgICAgcCA9PiB0cy5jcmVhdGVQYXJhbWV0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLCAvKiBtb2RpZmllcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBkb3REb3REb3RUb2tlbiAqLyB1bmRlZmluZWQsIHAubmFtZSkpLFxuICAgICAgICAgICAgICAgICAgLyogdHlwZSAqLyB1bmRlZmluZWQsIHRoaXMuX3Zpc2l0U3RhdGVtZW50cyhzdG10LnN0YXRlbWVudHMpKSk7XG4gIH1cblxuICB2aXNpdEV4cHJlc3Npb25TdG10KHN0bXQ6IEV4cHJlc3Npb25TdGF0ZW1lbnQpIHtcbiAgICByZXR1cm4gdGhpcy5yZWNvcmQoc3RtdCwgdHMuY3JlYXRlU3RhdGVtZW50KHN0bXQuZXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpKTtcbiAgfVxuXG4gIHZpc2l0UmV0dXJuU3RtdChzdG10OiBSZXR1cm5TdGF0ZW1lbnQpIHtcbiAgICByZXR1cm4gdGhpcy5yZWNvcmQoXG4gICAgICAgIHN0bXQsIHRzLmNyZWF0ZVJldHVybihzdG10LnZhbHVlID8gc3RtdC52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkgOiB1bmRlZmluZWQpKTtcbiAgfVxuXG4gIHZpc2l0RGVjbGFyZUNsYXNzU3RtdChzdG10OiBDbGFzc1N0bXQpIHtcbiAgICBjb25zdCBtb2RpZmllcnMgPSB0aGlzLmdldE1vZGlmaWVycyhzdG10KTtcbiAgICBjb25zdCBmaWVsZHMgPSBzdG10LmZpZWxkcy5tYXAoXG4gICAgICAgIGZpZWxkID0+IHRzLmNyZWF0ZVByb3BlcnR5KFxuICAgICAgICAgICAgLyogZGVjb3JhdG9ycyAqLyB1bmRlZmluZWQsIC8qIG1vZGlmaWVycyAqLyB0cmFuc2xhdGVNb2RpZmllcnMoZmllbGQubW9kaWZpZXJzKSxcbiAgICAgICAgICAgIGZpZWxkLm5hbWUsXG4gICAgICAgICAgICAvKiBxdWVzdGlvblRva2VuICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8qIHR5cGUgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgZmllbGQuaW5pdGlhbGl6ZXIgPT0gbnVsbCA/IHRzLmNyZWF0ZU51bGwoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQuaW5pdGlhbGl6ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpKSk7XG4gICAgY29uc3QgZ2V0dGVycyA9IHN0bXQuZ2V0dGVycy5tYXAoXG4gICAgICAgIGdldHRlciA9PiB0cy5jcmVhdGVHZXRBY2Nlc3NvcihcbiAgICAgICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLCAvKiBtb2RpZmllcnMgKi8gdW5kZWZpbmVkLCBnZXR0ZXIubmFtZSwgLyogcGFyYW1ldGVycyAqL1tdLFxuICAgICAgICAgICAgLyogdHlwZSAqLyB1bmRlZmluZWQsIHRoaXMuX3Zpc2l0U3RhdGVtZW50cyhnZXR0ZXIuYm9keSkpKTtcblxuICAgIGNvbnN0IGNvbnN0cnVjdG9yID1cbiAgICAgICAgKHN0bXQuY29uc3RydWN0b3JNZXRob2QgJiYgW3RzLmNyZWF0ZUNvbnN0cnVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogZGVjb3JhdG9ycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBtb2RpZmllcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogcGFyYW1ldGVycyAqLyBzdG10LmNvbnN0cnVjdG9yTWV0aG9kLnBhcmFtcy5tYXAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcCA9PiB0cy5jcmVhdGVQYXJhbWV0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBtb2RpZmllcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBkb3REb3REb3RUb2tlbiAqLyB1bmRlZmluZWQsIHAubmFtZSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmlzaXRTdGF0ZW1lbnRzKHN0bXQuY29uc3RydWN0b3JNZXRob2QuYm9keSkpXSkgfHxcbiAgICAgICAgW107XG5cbiAgICAvLyBUT0RPIHtjaHVja2p9OiBEZXRlcm1pbmUgd2hhdCBzaG91bGQgYmUgZG9uZSBmb3IgYSBtZXRob2Qgd2l0aCBhIG51bGwgbmFtZS5cbiAgICBjb25zdCBtZXRob2RzID0gc3RtdC5tZXRob2RzLmZpbHRlcihtZXRob2QgPT4gbWV0aG9kLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZCA9PiB0cy5jcmVhdGVNZXRob2QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBtb2RpZmllcnMgKi8gdHJhbnNsYXRlTW9kaWZpZXJzKG1ldGhvZC5tb2RpZmllcnMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBhc3RyaXNrVG9rZW4gKi8gdW5kZWZpbmVkLCBtZXRob2QubmFtZSAhLyogZ3VhcmRlZCBieSBmaWx0ZXIgKi8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIHF1ZXN0aW9uVG9rZW4gKi8gdW5kZWZpbmVkLCAvKiB0eXBlUGFyYW1ldGVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZC5wYXJhbXMubWFwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcCA9PiB0cy5jcmVhdGVQYXJhbWV0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogZGVjb3JhdG9ycyAqLyB1bmRlZmluZWQsIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogZG90RG90RG90VG9rZW4gKi8gdW5kZWZpbmVkLCBwLm5hbWUpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogdHlwZSAqLyB1bmRlZmluZWQsIHRoaXMuX3Zpc2l0U3RhdGVtZW50cyhtZXRob2QuYm9keSkpKTtcbiAgICByZXR1cm4gdGhpcy5yZWNvcmQoXG4gICAgICAgIHN0bXQsIHRzLmNyZWF0ZUNsYXNzRGVjbGFyYXRpb24oXG4gICAgICAgICAgICAgICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCwgbW9kaWZpZXJzLCBzdG10Lm5hbWUsIC8qIHR5cGVQYXJhbWV0ZXJzKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgc3RtdC5wYXJlbnQgJiYgW3RzLmNyZWF0ZUhlcml0YWdlQ2xhdXNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRzLlN5bnRheEtpbmQuRXh0ZW5kc0tleXdvcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3N0bXQucGFyZW50LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKV0pXSB8fFxuICAgICAgICAgICAgICAgICAgICAgIFtdLFxuICAgICAgICAgICAgICAgICAgWy4uLmZpZWxkcywgLi4uZ2V0dGVycywgLi4uY29uc3RydWN0b3IsIC4uLm1ldGhvZHNdKSk7XG4gIH1cblxuICB2aXNpdElmU3RtdChzdG10OiBJZlN0bXQpIHtcbiAgICByZXR1cm4gdGhpcy5yZWNvcmQoXG4gICAgICAgIHN0bXQsXG4gICAgICAgIHRzLmNyZWF0ZUlmKFxuICAgICAgICAgICAgc3RtdC5jb25kaXRpb24udmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpLCB0aGlzLl92aXNpdFN0YXRlbWVudHMoc3RtdC50cnVlQ2FzZSksXG4gICAgICAgICAgICBzdG10LmZhbHNlQ2FzZSAmJiBzdG10LmZhbHNlQ2FzZS5sZW5ndGggJiYgdGhpcy5fdmlzaXRTdGF0ZW1lbnRzKHN0bXQuZmFsc2VDYXNlKSB8fFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCkpO1xuICB9XG5cbiAgdmlzaXRUcnlDYXRjaFN0bXQoc3RtdDogVHJ5Q2F0Y2hTdG10KTogUmVjb3JkZWROb2RlPHRzLlRyeVN0YXRlbWVudD4ge1xuICAgIHJldHVybiB0aGlzLnJlY29yZChcbiAgICAgICAgc3RtdCwgdHMuY3JlYXRlVHJ5KFxuICAgICAgICAgICAgICAgICAgdGhpcy5fdmlzaXRTdGF0ZW1lbnRzKHN0bXQuYm9keVN0bXRzKSxcbiAgICAgICAgICAgICAgICAgIHRzLmNyZWF0ZUNhdGNoQ2xhdXNlKFxuICAgICAgICAgICAgICAgICAgICAgIENBVENIX0VSUk9SX05BTUUsIHRoaXMuX3Zpc2l0U3RhdGVtZW50c1ByZWZpeChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3RzLmNyZWF0ZVZhcmlhYmxlU3RhdGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogbW9kaWZpZXJzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFt0cy5jcmVhdGVWYXJpYWJsZURlY2xhcmF0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENBVENIX1NUQUNLX05BTUUsIC8qIHR5cGUgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cy5jcmVhdGVJZGVudGlmaWVyKENBVENIX0VSUk9SX05BTUUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cy5jcmVhdGVJZGVudGlmaWVyKENBVENIX1NUQUNLX05BTUUpKSldKV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0bXQuY2F0Y2hTdG10cykpLFxuICAgICAgICAgICAgICAgICAgLyogZmluYWxseUJsb2NrICovIHVuZGVmaW5lZCkpO1xuICB9XG5cbiAgdmlzaXRUaHJvd1N0bXQoc3RtdDogVGhyb3dTdG10KSB7XG4gICAgcmV0dXJuIHRoaXMucmVjb3JkKHN0bXQsIHRzLmNyZWF0ZVRocm93KHN0bXQuZXJyb3IudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpKSk7XG4gIH1cblxuICB2aXNpdENvbW1lbnRTdG10KHN0bXQ6IENvbW1lbnRTdG10LCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKSB7XG4gICAgY29uc3QgdGV4dCA9IHN0bXQubXVsdGlsaW5lID8gYCAke3N0bXQuY29tbWVudH0gYCA6IGAgJHtzdG10LmNvbW1lbnR9YDtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVDb21tZW50U3RtdCh0ZXh0LCBzdG10Lm11bHRpbGluZSwgc291cmNlRmlsZSk7XG4gIH1cblxuICB2aXNpdEpTRG9jQ29tbWVudFN0bXQoc3RtdDogSlNEb2NDb21tZW50U3RtdCwgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkge1xuICAgIHJldHVybiB0aGlzLmNyZWF0ZUNvbW1lbnRTdG10KHN0bXQudG9TdHJpbmcoKSwgdHJ1ZSwgc291cmNlRmlsZSk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUNvbW1lbnRTdG10KHRleHQ6IHN0cmluZywgbXVsdGlsaW5lOiBib29sZWFuLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTpcbiAgICAgIHRzLk5vdEVtaXR0ZWRTdGF0ZW1lbnQge1xuICAgIGNvbnN0IGNvbW1lbnRTdG10ID0gdHMuY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudChzb3VyY2VGaWxlKTtcbiAgICBjb25zdCBraW5kID1cbiAgICAgICAgbXVsdGlsaW5lID8gdHMuU3ludGF4S2luZC5NdWx0aUxpbmVDb21tZW50VHJpdmlhIDogdHMuU3ludGF4S2luZC5TaW5nbGVMaW5lQ29tbWVudFRyaXZpYTtcbiAgICB0cy5zZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMoY29tbWVudFN0bXQsIFt7a2luZCwgdGV4dCwgcG9zOiAtMSwgZW5kOiAtMX1dKTtcbiAgICByZXR1cm4gY29tbWVudFN0bXQ7XG4gIH1cblxuICAvLyBFeHByZXNzaW9uVmlzaXRvclxuICB2aXNpdFJlYWRWYXJFeHByKGV4cHI6IFJlYWRWYXJFeHByKSB7XG4gICAgc3dpdGNoIChleHByLmJ1aWx0aW4pIHtcbiAgICAgIGNhc2UgQnVpbHRpblZhci5UaGlzOlxuICAgICAgICByZXR1cm4gdGhpcy5yZWNvcmQoZXhwciwgdHMuY3JlYXRlSWRlbnRpZmllcihNRVRIT0RfVEhJU19OQU1FKSk7XG4gICAgICBjYXNlIEJ1aWx0aW5WYXIuQ2F0Y2hFcnJvcjpcbiAgICAgICAgcmV0dXJuIHRoaXMucmVjb3JkKGV4cHIsIHRzLmNyZWF0ZUlkZW50aWZpZXIoQ0FUQ0hfRVJST1JfTkFNRSkpO1xuICAgICAgY2FzZSBCdWlsdGluVmFyLkNhdGNoU3RhY2s6XG4gICAgICAgIHJldHVybiB0aGlzLnJlY29yZChleHByLCB0cy5jcmVhdGVJZGVudGlmaWVyKENBVENIX1NUQUNLX05BTUUpKTtcbiAgICAgIGNhc2UgQnVpbHRpblZhci5TdXBlcjpcbiAgICAgICAgcmV0dXJuIHRoaXMucmVjb3JkKGV4cHIsIHRzLmNyZWF0ZVN1cGVyKCkpO1xuICAgIH1cbiAgICBpZiAoZXhwci5uYW1lKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWNvcmQoZXhwciwgdHMuY3JlYXRlSWRlbnRpZmllcihleHByLm5hbWUpKTtcbiAgICB9XG4gICAgdGhyb3cgRXJyb3IoYFVuZXhwZWN0ZWQgUmVhZFZhckV4cHIgZm9ybWApO1xuICB9XG5cbiAgdmlzaXRXcml0ZVZhckV4cHIoZXhwcjogV3JpdGVWYXJFeHByKTogUmVjb3JkZWROb2RlPHRzLkJpbmFyeUV4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gdGhpcy5yZWNvcmQoXG4gICAgICAgIGV4cHIsIHRzLmNyZWF0ZUFzc2lnbm1lbnQoXG4gICAgICAgICAgICAgICAgICB0cy5jcmVhdGVJZGVudGlmaWVyKGV4cHIubmFtZSksIGV4cHIudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpKSk7XG4gIH1cblxuICB2aXNpdFdyaXRlS2V5RXhwcihleHByOiBXcml0ZUtleUV4cHIpOiBSZWNvcmRlZE5vZGU8dHMuQmluYXJ5RXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiB0aGlzLnJlY29yZChcbiAgICAgICAgZXhwcixcbiAgICAgICAgdHMuY3JlYXRlQXNzaWdubWVudChcbiAgICAgICAgICAgIHRzLmNyZWF0ZUVsZW1lbnRBY2Nlc3MoXG4gICAgICAgICAgICAgICAgZXhwci5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCksIGV4cHIuaW5kZXgudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpKSxcbiAgICAgICAgICAgIGV4cHIudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpKSk7XG4gIH1cblxuICB2aXNpdFdyaXRlUHJvcEV4cHIoZXhwcjogV3JpdGVQcm9wRXhwcik6IFJlY29yZGVkTm9kZTx0cy5CaW5hcnlFeHByZXNzaW9uPiB7XG4gICAgcmV0dXJuIHRoaXMucmVjb3JkKFxuICAgICAgICBleHByLCB0cy5jcmVhdGVBc3NpZ25tZW50KFxuICAgICAgICAgICAgICAgICAgdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MoZXhwci5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCksIGV4cHIubmFtZSksXG4gICAgICAgICAgICAgICAgICBleHByLnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSkpO1xuICB9XG5cbiAgdmlzaXRJbnZva2VNZXRob2RFeHByKGV4cHI6IEludm9rZU1ldGhvZEV4cHIpOiBSZWNvcmRlZE5vZGU8dHMuQ2FsbEV4cHJlc3Npb24+IHtcbiAgICBjb25zdCBtZXRob2ROYW1lID0gZ2V0TWV0aG9kTmFtZShleHByKTtcbiAgICByZXR1cm4gdGhpcy5yZWNvcmQoXG4gICAgICAgIGV4cHIsXG4gICAgICAgIHRzLmNyZWF0ZUNhbGwoXG4gICAgICAgICAgICB0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhleHByLnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSwgbWV0aG9kTmFtZSksXG4gICAgICAgICAgICAvKiB0eXBlQXJndW1lbnRzICovIHVuZGVmaW5lZCwgZXhwci5hcmdzLm1hcChhcmcgPT4gYXJnLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSkpKTtcbiAgfVxuXG4gIHZpc2l0SW52b2tlRnVuY3Rpb25FeHByKGV4cHI6IEludm9rZUZ1bmN0aW9uRXhwcik6IFJlY29yZGVkTm9kZTx0cy5DYWxsRXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiB0aGlzLnJlY29yZChcbiAgICAgICAgZXhwciwgdHMuY3JlYXRlQ2FsbChcbiAgICAgICAgICAgICAgICAgIGV4cHIuZm4udmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpLCAvKiB0eXBlQXJndW1lbnRzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgIGV4cHIuYXJncy5tYXAoYXJnID0+IGFyZy52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpKSk7XG4gIH1cblxuICB2aXNpdEluc3RhbnRpYXRlRXhwcihleHByOiBJbnN0YW50aWF0ZUV4cHIpOiBSZWNvcmRlZE5vZGU8dHMuTmV3RXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiB0aGlzLnJlY29yZChcbiAgICAgICAgZXhwciwgdHMuY3JlYXRlTmV3KFxuICAgICAgICAgICAgICAgICAgZXhwci5jbGFzc0V4cHIudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpLCAvKiB0eXBlQXJndW1lbnRzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgIGV4cHIuYXJncy5tYXAoYXJnID0+IGFyZy52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpKSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxFeHByKGV4cHI6IExpdGVyYWxFeHByKSB7IHJldHVybiB0aGlzLnJlY29yZChleHByLCBjcmVhdGVMaXRlcmFsKGV4cHIudmFsdWUpKTsgfVxuXG4gIHZpc2l0RXh0ZXJuYWxFeHByKGV4cHI6IEV4dGVybmFsRXhwcikge1xuICAgIHJldHVybiB0aGlzLnJlY29yZChleHByLCB0aGlzLl92aXNpdElkZW50aWZpZXIoZXhwci52YWx1ZSkpO1xuICB9XG5cbiAgdmlzaXRDb25kaXRpb25hbEV4cHIoZXhwcjogQ29uZGl0aW9uYWxFeHByKTogUmVjb3JkZWROb2RlPHRzLlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uPiB7XG4gICAgLy8gVE9ETyB7Y2h1Y2tqfTogUmV2aWV3IHVzZSBvZiAhIG9uIGZhbHNlQ2FzZS4gU2hvdWxkIGl0IGJlIG5vbi1udWxsYWJsZT9cbiAgICByZXR1cm4gdGhpcy5yZWNvcmQoXG4gICAgICAgIGV4cHIsXG4gICAgICAgIHRzLmNyZWF0ZVBhcmVuKHRzLmNyZWF0ZUNvbmRpdGlvbmFsKFxuICAgICAgICAgICAgZXhwci5jb25kaXRpb24udmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpLCBleHByLnRydWVDYXNlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSxcbiAgICAgICAgICAgIGV4cHIuZmFsc2VDYXNlICEudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpKSkpO1xuICB9XG5cbiAgdmlzaXROb3RFeHByKGV4cHI6IE5vdEV4cHIpOiBSZWNvcmRlZE5vZGU8dHMuUHJlZml4VW5hcnlFeHByZXNzaW9uPiB7XG4gICAgcmV0dXJuIHRoaXMucmVjb3JkKFxuICAgICAgICBleHByLCB0cy5jcmVhdGVQcmVmaXgoXG4gICAgICAgICAgICAgICAgICB0cy5TeW50YXhLaW5kLkV4Y2xhbWF0aW9uVG9rZW4sIGV4cHIuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSkpO1xuICB9XG5cbiAgdmlzaXRBc3NlcnROb3ROdWxsRXhwcihleHByOiBBc3NlcnROb3ROdWxsKTogUmVjb3JkZWROb2RlPHRzLkV4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gZXhwci5jb25kaXRpb24udmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpO1xuICB9XG5cbiAgdmlzaXRDYXN0RXhwcihleHByOiBDYXN0RXhwcik6IFJlY29yZGVkTm9kZTx0cy5FeHByZXNzaW9uPiB7XG4gICAgcmV0dXJuIGV4cHIudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpO1xuICB9XG5cbiAgdmlzaXRGdW5jdGlvbkV4cHIoZXhwcjogRnVuY3Rpb25FeHByKSB7XG4gICAgcmV0dXJuIHRoaXMucmVjb3JkKFxuICAgICAgICBleHByLCB0cy5jcmVhdGVGdW5jdGlvbkV4cHJlc3Npb24oXG4gICAgICAgICAgICAgICAgICAvKiBtb2RpZmllcnMgKi8gdW5kZWZpbmVkLCAvKiBhc3RyaXNrVG9rZW4gKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgLyogbmFtZSAqLyBleHByLm5hbWUgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgLyogdHlwZVBhcmFtZXRlcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgZXhwci5wYXJhbXMubWFwKFxuICAgICAgICAgICAgICAgICAgICAgIHAgPT4gdHMuY3JlYXRlUGFyYW1ldGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCwgLyogbW9kaWZpZXJzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLyogZG90RG90RG90VG9rZW4gKi8gdW5kZWZpbmVkLCBwLm5hbWUpKSxcbiAgICAgICAgICAgICAgICAgIC8qIHR5cGUgKi8gdW5kZWZpbmVkLCB0aGlzLl92aXNpdFN0YXRlbWVudHMoZXhwci5zdGF0ZW1lbnRzKSkpO1xuICB9XG5cbiAgdmlzaXRCaW5hcnlPcGVyYXRvckV4cHIoZXhwcjogQmluYXJ5T3BlcmF0b3JFeHByKTpcbiAgICAgIFJlY29yZGVkTm9kZTx0cy5CaW5hcnlFeHByZXNzaW9ufHRzLlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uPiB7XG4gICAgbGV0IGJpbmFyeU9wZXJhdG9yOiB0cy5CaW5hcnlPcGVyYXRvcjtcbiAgICBzd2l0Y2ggKGV4cHIub3BlcmF0b3IpIHtcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuQW5kOlxuICAgICAgICBiaW5hcnlPcGVyYXRvciA9IHRzLlN5bnRheEtpbmQuQW1wZXJzYW5kQW1wZXJzYW5kVG9rZW47XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBCaW5hcnlPcGVyYXRvci5CaXR3aXNlQW5kOlxuICAgICAgICBiaW5hcnlPcGVyYXRvciA9IHRzLlN5bnRheEtpbmQuQW1wZXJzYW5kVG9rZW47XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBCaW5hcnlPcGVyYXRvci5CaWdnZXI6XG4gICAgICAgIGJpbmFyeU9wZXJhdG9yID0gdHMuU3ludGF4S2luZC5HcmVhdGVyVGhhblRva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuQmlnZ2VyRXF1YWxzOlxuICAgICAgICBiaW5hcnlPcGVyYXRvciA9IHRzLlN5bnRheEtpbmQuR3JlYXRlclRoYW5FcXVhbHNUb2tlbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEJpbmFyeU9wZXJhdG9yLkRpdmlkZTpcbiAgICAgICAgYmluYXJ5T3BlcmF0b3IgPSB0cy5TeW50YXhLaW5kLlNsYXNoVG9rZW47XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBCaW5hcnlPcGVyYXRvci5FcXVhbHM6XG4gICAgICAgIGJpbmFyeU9wZXJhdG9yID0gdHMuU3ludGF4S2luZC5FcXVhbHNFcXVhbHNUb2tlbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEJpbmFyeU9wZXJhdG9yLklkZW50aWNhbDpcbiAgICAgICAgYmluYXJ5T3BlcmF0b3IgPSB0cy5TeW50YXhLaW5kLkVxdWFsc0VxdWFsc0VxdWFsc1Rva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuTG93ZXI6XG4gICAgICAgIGJpbmFyeU9wZXJhdG9yID0gdHMuU3ludGF4S2luZC5MZXNzVGhhblRva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuTG93ZXJFcXVhbHM6XG4gICAgICAgIGJpbmFyeU9wZXJhdG9yID0gdHMuU3ludGF4S2luZC5MZXNzVGhhbkVxdWFsc1Rva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuTWludXM6XG4gICAgICAgIGJpbmFyeU9wZXJhdG9yID0gdHMuU3ludGF4S2luZC5NaW51c1Rva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuTW9kdWxvOlxuICAgICAgICBiaW5hcnlPcGVyYXRvciA9IHRzLlN5bnRheEtpbmQuUGVyY2VudFRva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuTXVsdGlwbHk6XG4gICAgICAgIGJpbmFyeU9wZXJhdG9yID0gdHMuU3ludGF4S2luZC5Bc3Rlcmlza1Rva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuTm90RXF1YWxzOlxuICAgICAgICBiaW5hcnlPcGVyYXRvciA9IHRzLlN5bnRheEtpbmQuRXhjbGFtYXRpb25FcXVhbHNUb2tlbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEJpbmFyeU9wZXJhdG9yLk5vdElkZW50aWNhbDpcbiAgICAgICAgYmluYXJ5T3BlcmF0b3IgPSB0cy5TeW50YXhLaW5kLkV4Y2xhbWF0aW9uRXF1YWxzRXF1YWxzVG9rZW47XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBCaW5hcnlPcGVyYXRvci5PcjpcbiAgICAgICAgYmluYXJ5T3BlcmF0b3IgPSB0cy5TeW50YXhLaW5kLkJhckJhclRva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuUGx1czpcbiAgICAgICAgYmluYXJ5T3BlcmF0b3IgPSB0cy5TeW50YXhLaW5kLlBsdXNUb2tlbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gb3BlcmF0b3I6ICR7ZXhwci5vcGVyYXRvcn1gKTtcbiAgICB9XG4gICAgY29uc3QgYmluYXJ5ID0gdHMuY3JlYXRlQmluYXJ5KFxuICAgICAgICBleHByLmxocy52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCksIGJpbmFyeU9wZXJhdG9yLCBleHByLnJocy52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpO1xuICAgIHJldHVybiB0aGlzLnJlY29yZChleHByLCBleHByLnBhcmVucyA/IHRzLmNyZWF0ZVBhcmVuKGJpbmFyeSkgOiBiaW5hcnkpO1xuICB9XG5cbiAgdmlzaXRSZWFkUHJvcEV4cHIoZXhwcjogUmVhZFByb3BFeHByKTogUmVjb3JkZWROb2RlPHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiB0aGlzLnJlY29yZChcbiAgICAgICAgZXhwciwgdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MoZXhwci5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCksIGV4cHIubmFtZSkpO1xuICB9XG5cbiAgdmlzaXRSZWFkS2V5RXhwcihleHByOiBSZWFkS2V5RXhwcik6IFJlY29yZGVkTm9kZTx0cy5FbGVtZW50QWNjZXNzRXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiB0aGlzLnJlY29yZChcbiAgICAgICAgZXhwcixcbiAgICAgICAgdHMuY3JlYXRlRWxlbWVudEFjY2VzcyhcbiAgICAgICAgICAgIGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpLCBleHByLmluZGV4LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSkpO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsQXJyYXlFeHByKGV4cHI6IExpdGVyYWxBcnJheUV4cHIpOiBSZWNvcmRlZE5vZGU8dHMuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiB0aGlzLnJlY29yZChcbiAgICAgICAgZXhwciwgdHMuY3JlYXRlQXJyYXlMaXRlcmFsKGV4cHIuZW50cmllcy5tYXAoZW50cnkgPT4gZW50cnkudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpKSkpO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsTWFwRXhwcihleHByOiBMaXRlcmFsTWFwRXhwcik6IFJlY29yZGVkTm9kZTx0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiB0aGlzLnJlY29yZChcbiAgICAgICAgZXhwciwgdHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChleHByLmVudHJpZXMubWFwKFxuICAgICAgICAgICAgICAgICAgZW50cnkgPT4gdHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KFxuICAgICAgICAgICAgICAgICAgICAgIGVudHJ5LnF1b3RlZCB8fCAhX1ZBTElEX0lERU5USUZJRVJfUkUudGVzdChlbnRyeS5rZXkpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHMuY3JlYXRlTGl0ZXJhbChlbnRyeS5rZXkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnkua2V5LFxuICAgICAgICAgICAgICAgICAgICAgIGVudHJ5LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSkpKSk7XG4gIH1cblxuICB2aXNpdENvbW1hRXhwcihleHByOiBDb21tYUV4cHIpOiBSZWNvcmRlZE5vZGU8dHMuRXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiB0aGlzLnJlY29yZChcbiAgICAgICAgZXhwciwgZXhwci5wYXJ0cy5tYXAoZSA9PiBlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSlcbiAgICAgICAgICAgICAgICAgIC5yZWR1Y2U8dHMuRXhwcmVzc2lvbnxudWxsPihcbiAgICAgICAgICAgICAgICAgICAgICAobGVmdCwgcmlnaHQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPyB0cy5jcmVhdGVCaW5hcnkobGVmdCwgdHMuU3ludGF4S2luZC5Db21tYVRva2VuLCByaWdodCkgOiByaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICBudWxsKSk7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFN0YXRlbWVudHMoc3RhdGVtZW50czogU3RhdGVtZW50W10pOiB0cy5CbG9jayB7XG4gICAgcmV0dXJuIHRoaXMuX3Zpc2l0U3RhdGVtZW50c1ByZWZpeChbXSwgc3RhdGVtZW50cyk7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFN0YXRlbWVudHNQcmVmaXgocHJlZml4OiB0cy5TdGF0ZW1lbnRbXSwgc3RhdGVtZW50czogU3RhdGVtZW50W10pIHtcbiAgICByZXR1cm4gdHMuY3JlYXRlQmxvY2soW1xuICAgICAgLi4ucHJlZml4LCAuLi5zdGF0ZW1lbnRzLm1hcChzdG10ID0+IHN0bXQudmlzaXRTdGF0ZW1lbnQodGhpcywgbnVsbCkpLmZpbHRlcihmID0+IGYgIT0gbnVsbClcbiAgICBdKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0SWRlbnRpZmllcih2YWx1ZTogRXh0ZXJuYWxSZWZlcmVuY2UpOiB0cy5FeHByZXNzaW9uIHtcbiAgICAvLyBuYW1lIGNhbiBvbmx5IGJlIG51bGwgZHVyaW5nIEpJVCB3aGljaCBuZXZlciBleGVjdXRlcyB0aGlzIGNvZGUuXG4gICAgY29uc3QgbW9kdWxlTmFtZSA9IHZhbHVlLm1vZHVsZU5hbWUsIG5hbWUgPSB2YWx1ZS5uYW1lICE7XG4gICAgbGV0IHByZWZpeElkZW50OiB0cy5JZGVudGlmaWVyfG51bGwgPSBudWxsO1xuICAgIGlmIChtb2R1bGVOYW1lKSB7XG4gICAgICBsZXQgcHJlZml4ID0gdGhpcy5faW1wb3J0c1dpdGhQcmVmaXhlcy5nZXQobW9kdWxlTmFtZSk7XG4gICAgICBpZiAocHJlZml4ID09IG51bGwpIHtcbiAgICAgICAgcHJlZml4ID0gYGkke3RoaXMuX2ltcG9ydHNXaXRoUHJlZml4ZXMuc2l6ZX1gO1xuICAgICAgICB0aGlzLl9pbXBvcnRzV2l0aFByZWZpeGVzLnNldChtb2R1bGVOYW1lLCBwcmVmaXgpO1xuICAgICAgfVxuICAgICAgcHJlZml4SWRlbnQgPSB0cy5jcmVhdGVJZGVudGlmaWVyKHByZWZpeCk7XG4gICAgfVxuICAgIGlmIChwcmVmaXhJZGVudCkge1xuICAgICAgcmV0dXJuIHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHByZWZpeElkZW50LCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaWQgPSB0cy5jcmVhdGVJZGVudGlmaWVyKG5hbWUpO1xuICAgICAgaWYgKHRoaXMuX2V4cG9ydGVkVmFyaWFibGVJZGVudGlmaWVycy5oYXMobmFtZSkpIHtcbiAgICAgICAgLy8gSW4gb3JkZXIgZm9yIHRoaXMgbmV3IGlkZW50aWZpZXIgbm9kZSB0byBiZSBwcm9wZXJseSByZXdyaXR0ZW4gaW4gQ29tbW9uSlMgb3V0cHV0LFxuICAgICAgICAvLyBpdCBtdXN0IGhhdmUgaXRzIG9yaWdpbmFsIG5vZGUgc2V0IHRvIGEgcGFyc2VkIGluc3RhbmNlIG9mIHRoZSBzYW1lIGlkZW50aWZpZXIuXG4gICAgICAgIHRzLnNldE9yaWdpbmFsTm9kZShpZCwgdGhpcy5fZXhwb3J0ZWRWYXJpYWJsZUlkZW50aWZpZXJzLmdldChuYW1lKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaWQ7XG4gICAgfVxuICB9XG59XG5cblxuZnVuY3Rpb24gZ2V0TWV0aG9kTmFtZShtZXRob2RSZWY6IHtuYW1lOiBzdHJpbmcgfCBudWxsOyBidWlsdGluOiBCdWlsdGluTWV0aG9kIHwgbnVsbH0pOiBzdHJpbmcge1xuICBpZiAobWV0aG9kUmVmLm5hbWUpIHtcbiAgICByZXR1cm4gbWV0aG9kUmVmLm5hbWU7XG4gIH0gZWxzZSB7XG4gICAgc3dpdGNoIChtZXRob2RSZWYuYnVpbHRpbikge1xuICAgICAgY2FzZSBCdWlsdGluTWV0aG9kLkJpbmQ6XG4gICAgICAgIHJldHVybiAnYmluZCc7XG4gICAgICBjYXNlIEJ1aWx0aW5NZXRob2QuQ29uY2F0QXJyYXk6XG4gICAgICAgIHJldHVybiAnY29uY2F0JztcbiAgICAgIGNhc2UgQnVpbHRpbk1ldGhvZC5TdWJzY3JpYmVPYnNlcnZhYmxlOlxuICAgICAgICByZXR1cm4gJ3N1YnNjcmliZSc7XG4gICAgfVxuICB9XG4gIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCBtZXRob2QgcmVmZXJlbmNlIGZvcm0nKTtcbn1cblxuZnVuY3Rpb24gbW9kaWZpZXJGcm9tTW9kaWZpZXIobW9kaWZpZXI6IFN0bXRNb2RpZmllcik6IHRzLk1vZGlmaWVyIHtcbiAgc3dpdGNoIChtb2RpZmllcikge1xuICAgIGNhc2UgU3RtdE1vZGlmaWVyLkV4cG9ydGVkOlxuICAgICAgcmV0dXJuIHRzLmNyZWF0ZVRva2VuKHRzLlN5bnRheEtpbmQuRXhwb3J0S2V5d29yZCk7XG4gICAgY2FzZSBTdG10TW9kaWZpZXIuRmluYWw6XG4gICAgICByZXR1cm4gdHMuY3JlYXRlVG9rZW4odHMuU3ludGF4S2luZC5Db25zdEtleXdvcmQpO1xuICAgIGNhc2UgU3RtdE1vZGlmaWVyLlByaXZhdGU6XG4gICAgICByZXR1cm4gdHMuY3JlYXRlVG9rZW4odHMuU3ludGF4S2luZC5Qcml2YXRlS2V5d29yZCk7XG4gICAgY2FzZSBTdG10TW9kaWZpZXIuU3RhdGljOlxuICAgICAgcmV0dXJuIHRzLmNyZWF0ZVRva2VuKHRzLlN5bnRheEtpbmQuU3RhdGljS2V5d29yZCk7XG4gIH1cbiAgcmV0dXJuIGVycm9yKGB1bmtub3duIHN0YXRlbWVudCBtb2RpZmllcmApO1xufVxuXG5mdW5jdGlvbiB0cmFuc2xhdGVNb2RpZmllcnMobW9kaWZpZXJzOiBTdG10TW9kaWZpZXJbXSB8IG51bGwpOiB0cy5Nb2RpZmllcltdfHVuZGVmaW5lZCB7XG4gIHJldHVybiBtb2RpZmllcnMgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG1vZGlmaWVycyAhLm1hcChtb2RpZmllckZyb21Nb2RpZmllcik7XG59XG4iXX0=