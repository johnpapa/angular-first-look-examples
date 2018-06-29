/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/transformer_util", ["require", "exports", "tsickle/src/typescript", "tsickle/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ts = require("tsickle/src/typescript");
    var util_1 = require("tsickle/src/util");
    /**
     * Adjusts the given CustomTransformers with additional transformers
     * to fix bugs in TypeScript.
     */
    function createCustomTransformers(given) {
        var before = given.before || [];
        before.unshift(addFileContexts);
        before.push(prepareNodesBeforeTypeScriptTransform);
        var after = given.after || [];
        after.unshift(emitMissingSyntheticCommentsAfterTypescriptTransform);
        return { before: before, after: after };
    }
    exports.createCustomTransformers = createCustomTransformers;
    /**
     * A transformer that does nothing, but synthesizes all comments. This allows testing transformers
     * in isolation, but with an AST and comment placement that matches what'd happen after a source map
     * based transformer ran.
     */
    function synthesizeCommentsTransformer(context) {
        return function (sf) {
            function visitNodeRecursively(n) {
                return visitEachChild(n, function (n) { return visitNodeWithSynthesizedComments(context, sf, n, visitNodeRecursively); }, context);
            }
            return visitNodeWithSynthesizedComments(context, sf, sf, visitNodeRecursively);
        };
    }
    exports.synthesizeCommentsTransformer = synthesizeCommentsTransformer;
    /**
     * Transform that adds the FileContext to the TransformationContext.
     */
    function addFileContexts(context) {
        return function (sourceFile) {
            context.fileContext = new FileContext(sourceFile);
            return sourceFile;
        };
    }
    function assertFileContext(context, sourceFile) {
        if (!context.fileContext) {
            throw new Error("Illegal State: FileContext not initialized. " +
                "Did you forget to add the \"firstTransform\" as first transformer? " +
                ("File: " + sourceFile.fileName));
        }
        if (context.fileContext.file.fileName !== sourceFile.fileName) {
            throw new Error("Illegal State: File of the FileContext does not match. File: " + sourceFile.fileName);
        }
        return context.fileContext;
    }
    /**
     * A context that stores information per file to e.g. allow communication
     * between transformers.
     * There is one ts.TransformationContext per emit,
     * but files are handled sequentially by all transformers. Thefore we can
     * store file related information on a property on the ts.TransformationContext,
     * given that we reset it in the first transformer.
     */
    var FileContext = /** @class */ (function () {
        function FileContext(file) {
            this.file = file;
            /**
             * Stores the parent node for all processed nodes.
             * This is needed for nodes from the parse tree that are used
             * in a synthetic node as must not modify these, even though they
             * have a new parent now.
             */
            this.syntheticNodeParents = new Map();
            this.importOrReexportDeclarations = [];
            this.lastCommentEnd = -1;
        }
        return FileContext;
    }());
    /**
     * Transform that needs to be executed right before TypeScript's transform.
     *
     * This prepares the node tree to workaround some bugs in the TypeScript emitter.
     */
    function prepareNodesBeforeTypeScriptTransform(context) {
        return function (sourceFile) {
            var fileCtx = assertFileContext(context, sourceFile);
            var nodePath = [];
            visitNode(sourceFile);
            return sourceFile;
            function visitNode(node) {
                var parent = nodePath[nodePath.length - 1];
                if (node.flags & ts.NodeFlags.Synthesized) {
                    // Set `parent` for synthetic nodes as well,
                    // as otherwise the TS emit will crash for decorators.
                    // Note: don't update the `parent` of original nodes, as:
                    // 1) we don't want to change them at all
                    // 2) TS emit becomes errorneous in some cases if we add a synthetic parent.
                    // see https://github.com/Microsoft/TypeScript/issues/17384
                    node.parent = parent;
                }
                fileCtx.syntheticNodeParents.set(node, parent);
                var originalNode = ts.getOriginalNode(node);
                if (node.kind === ts.SyntaxKind.ImportDeclaration ||
                    node.kind === ts.SyntaxKind.ExportDeclaration) {
                    var ied = node;
                    if (ied.moduleSpecifier) {
                        fileCtx.importOrReexportDeclarations.push(ied);
                    }
                }
                // recurse
                nodePath.push(node);
                node.forEachChild(visitNode);
                nodePath.pop();
            }
        };
    }
    /**
     * Transform that needs to be executed after TypeScript's transform.
     *
     * This fixes places where the TypeScript transformer does not
     * emit synthetic comments.
     *
     * See https://github.com/Microsoft/TypeScript/issues/17594
     */
    function emitMissingSyntheticCommentsAfterTypescriptTransform(context) {
        return function (sourceFile) {
            var fileContext = assertFileContext(context, sourceFile);
            var nodePath = [];
            visitNode(sourceFile);
            context.fileContext = undefined;
            return sourceFile;
            function visitNode(node) {
                if (node.kind === ts.SyntaxKind.Identifier) {
                    var parent1 = fileContext.syntheticNodeParents.get(node);
                    var parent2 = parent1 && fileContext.syntheticNodeParents.get(parent1);
                    var parent3 = parent2 && fileContext.syntheticNodeParents.get(parent2);
                    if (parent1 && parent1.kind === ts.SyntaxKind.PropertyDeclaration) {
                        // TypeScript ignores synthetic comments on (static) property declarations
                        // with initializers.
                        // find the parent ExpressionStatement like MyClass.foo = ...
                        var expressionStmt = lastNodeWith(nodePath, function (node) { return node.kind === ts.SyntaxKind.ExpressionStatement; });
                        if (expressionStmt) {
                            ts.setSyntheticLeadingComments(expressionStmt, ts.getSyntheticLeadingComments(parent1) || []);
                        }
                    }
                    else if (parent3 && parent3.kind === ts.SyntaxKind.VariableStatement &&
                        util_1.hasModifierFlag(parent3, ts.ModifierFlags.Export)) {
                        // TypeScript ignores synthetic comments on exported variables.
                        // find the parent ExpressionStatement like exports.foo = ...
                        var expressionStmt = lastNodeWith(nodePath, function (node) { return node.kind === ts.SyntaxKind.ExpressionStatement; });
                        if (expressionStmt) {
                            ts.setSyntheticLeadingComments(expressionStmt, ts.getSyntheticLeadingComments(parent3) || []);
                        }
                    }
                }
                // TypeScript ignores synthetic comments on reexport / import statements.
                // The code below re-adds them one the converted CommonJS import statements, and resets the
                // text range to prevent previous comments from being emitted.
                if (isCommonJsRequireStatement(node) && fileContext.importOrReexportDeclarations) {
                    // Locate the original import/export declaration via the
                    // text range.
                    var importOrReexportDeclaration = fileContext.importOrReexportDeclarations.find(function (ied) { return ied.pos === node.pos; });
                    if (importOrReexportDeclaration) {
                        ts.setSyntheticLeadingComments(node, ts.getSyntheticLeadingComments(importOrReexportDeclaration) || []);
                    }
                    // Need to clear the textRange for ImportDeclaration / ExportDeclaration as
                    // otherwise TypeScript would emit the original comments even if we set the
                    // ts.EmitFlag.NoComments. (see also resetNodeTextRangeToPreventDuplicateComments below)
                    ts.setSourceMapRange(node, { pos: node.pos, end: node.end });
                    ts.setTextRange(node, { pos: -1, end: -1 });
                }
                nodePath.push(node);
                node.forEachChild(visitNode);
                nodePath.pop();
            }
        };
    }
    function isCommonJsRequireStatement(node) {
        // CommonJS requires can be either "var x = require('...');" or (for side effect imports), just
        // "require('...');".
        var callExpr;
        if (ts.isVariableStatement(node)) {
            var varStmt = node;
            var decls = varStmt.declarationList.declarations;
            var init = void 0;
            if (decls.length !== 1 || !(init = decls[0].initializer) ||
                init.kind !== ts.SyntaxKind.CallExpression) {
                return false;
            }
            callExpr = init;
        }
        else if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)) {
            callExpr = node.expression;
        }
        else {
            return false;
        }
        if (callExpr.expression.kind !== ts.SyntaxKind.Identifier ||
            callExpr.expression.text !== 'require' ||
            callExpr.arguments.length !== 1) {
            return false;
        }
        var moduleExpr = callExpr.arguments[0];
        return moduleExpr.kind === ts.SyntaxKind.StringLiteral;
    }
    function lastNodeWith(nodes, predicate) {
        for (var i = nodes.length - 1; i >= 0; i--) {
            var node = nodes[i];
            if (predicate(node)) {
                return node;
            }
        }
        return null;
    }
    /**
     * Convert comment text ranges before and after a node
     * into ts.SynthesizedComments for the node and prevent the
     * comment text ranges to be emitted, to allow
     * changing these comments.
     *
     * This function takes a visitor to be able to do some
     * state management after the caller is done changing a node.
     */
    function visitNodeWithSynthesizedComments(context, sourceFile, node, visitor) {
        if (node.flags & ts.NodeFlags.Synthesized) {
            return visitor(node);
        }
        if (node.kind === ts.SyntaxKind.Block) {
            var block_1 = node;
            node = visitNodeStatementsWithSynthesizedComments(context, sourceFile, node, block_1.statements, function (node, stmts) { return visitor(ts.updateBlock(block_1, stmts)); });
        }
        else if (node.kind === ts.SyntaxKind.SourceFile) {
            node = visitNodeStatementsWithSynthesizedComments(context, sourceFile, node, sourceFile.statements, function (node, stmts) { return visitor(updateSourceFileNode(sourceFile, stmts)); });
        }
        else {
            // In arrow functions with expression bodies (`(x) => expr`), do not synthesize comment nodes
            // that precede the body expression. When downleveling to ES5, TypeScript inserts a return
            // statement and moves the comment in front of it, but then still emits any syntesized comment
            // we create here. That can cause a line comment to be emitted after the return, which causes
            // Automatic Semicolon Insertion, which then breaks the code. See arrow_fn_es5.ts for an
            // example.
            if (node.parent && node.kind !== ts.SyntaxKind.Block &&
                ts.isArrowFunction(node.parent) && node === node.parent.body) {
                return visitor(node);
            }
            var fileContext = assertFileContext(context, sourceFile);
            var leadingLastCommentEnd = synthesizeLeadingComments(sourceFile, node, fileContext.lastCommentEnd);
            var trailingLastCommentEnd = synthesizeTrailingComments(sourceFile, node);
            if (leadingLastCommentEnd !== -1) {
                fileContext.lastCommentEnd = leadingLastCommentEnd;
            }
            node = visitor(node);
            if (trailingLastCommentEnd !== -1) {
                fileContext.lastCommentEnd = trailingLastCommentEnd;
            }
        }
        return resetNodeTextRangeToPreventDuplicateComments(node);
    }
    exports.visitNodeWithSynthesizedComments = visitNodeWithSynthesizedComments;
    /**
     * Reset the text range for some special nodes as otherwise TypeScript
     * would always emit the original comments for them.
     * See https://github.com/Microsoft/TypeScript/issues/17594
     *
     * @param node
     */
    function resetNodeTextRangeToPreventDuplicateComments(node) {
        ts.setEmitFlags(node, (ts.getEmitFlags(node) || 0) | ts.EmitFlags.NoComments);
        // See also emitMissingSyntheticCommentsAfterTypescriptTransform.
        // Note: Don't reset the textRange for ts.ExportDeclaration / ts.ImportDeclaration
        // until after the TypeScript transformer as we need the source location
        // to map the generated `require` calls back to the original
        // ts.ExportDeclaration / ts.ImportDeclaration nodes.
        var allowTextRange = node.kind !== ts.SyntaxKind.ClassDeclaration &&
            node.kind !== ts.SyntaxKind.VariableDeclaration &&
            !(node.kind === ts.SyntaxKind.VariableStatement &&
                util_1.hasModifierFlag(node, ts.ModifierFlags.Export)) &&
            node.kind !== ts.SyntaxKind.ModuleDeclaration;
        if (node.kind === ts.SyntaxKind.PropertyDeclaration) {
            allowTextRange = false;
            var pd = node;
            node = ts.updateProperty(pd, pd.decorators, pd.modifiers, resetTextRange(pd.name), pd.questionToken, pd.type, pd.initializer);
        }
        if (!allowTextRange) {
            node = resetTextRange(node);
        }
        return node;
        function resetTextRange(node) {
            if (!(node.flags & ts.NodeFlags.Synthesized)) {
                // need to clone as we don't want to modify source nodes,
                // as the parsed SourceFiles could be cached!
                node = ts.getMutableClone(node);
            }
            var textRange = { pos: node.pos, end: node.end };
            ts.setSourceMapRange(node, textRange);
            ts.setTextRange(node, { pos: -1, end: -1 });
            return node;
        }
    }
    /**
     * Reads in the leading comment text ranges of the given node,
     * converts them into `ts.SyntheticComment`s and stores them on the node.
     *
     * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
     *
     * @param lastCommentEnd The end of the last comment
     * @return The end of the last found comment, -1 if no comment was found.
     */
    function synthesizeLeadingComments(sourceFile, node, lastCommentEnd) {
        var parent = node.parent;
        var sharesStartWithParent = parent && parent.kind !== ts.SyntaxKind.Block &&
            parent.kind !== ts.SyntaxKind.SourceFile && parent.getFullStart() === node.getFullStart();
        if (sharesStartWithParent || lastCommentEnd >= node.getStart()) {
            return -1;
        }
        var adjustedNodeFullStart = Math.max(lastCommentEnd, node.getFullStart());
        var leadingComments = getAllLeadingCommentRanges(sourceFile, adjustedNodeFullStart, node.getStart());
        if (leadingComments && leadingComments.length) {
            ts.setSyntheticLeadingComments(node, synthesizeCommentRanges(sourceFile, leadingComments));
            return node.getStart();
        }
        return -1;
    }
    /**
     * Reads in the trailing comment text ranges of the given node,
     * converts them into `ts.SyntheticComment`s and stores them on the node.
     *
     * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
     *
     * @return The end of the last found comment, -1 if no comment was found.
     */
    function synthesizeTrailingComments(sourceFile, node) {
        var parent = node.parent;
        var sharesEndWithParent = parent && parent.kind !== ts.SyntaxKind.Block &&
            parent.kind !== ts.SyntaxKind.SourceFile && parent.getEnd() === node.getEnd();
        if (sharesEndWithParent) {
            return -1;
        }
        var trailingComments = ts.getTrailingCommentRanges(sourceFile.text, node.getEnd());
        if (trailingComments && trailingComments.length) {
            ts.setSyntheticTrailingComments(node, synthesizeCommentRanges(sourceFile, trailingComments));
            return trailingComments[trailingComments.length - 1].end;
        }
        return -1;
    }
    function arrayOf(value) {
        return value ? [value] : [];
    }
    /**
     * Convert leading/trailing detached comment ranges of statement arrays
     * (e.g. the statements of a ts.SourceFile or ts.Block) into
     * `ts.NonEmittedStatement`s with `ts.SynthesizedComment`s and
     * prepends / appends them to the given statement array.
     * This is needed to allow changing these comments.
     *
     * This function takes a visitor to be able to do some
     * state management after the caller is done changing a node.
     */
    function visitNodeStatementsWithSynthesizedComments(context, sourceFile, node, statements, visitor) {
        var leading = synthesizeDetachedLeadingComments(sourceFile, node, statements);
        var trailing = synthesizeDetachedTrailingComments(sourceFile, node, statements);
        if (leading.commentStmt || trailing.commentStmt) {
            var newStatements = __spread(arrayOf(leading.commentStmt), statements, arrayOf(trailing.commentStmt));
            statements = ts.setTextRange(ts.createNodeArray(newStatements), { pos: -1, end: -1 });
            /**
             * The visitor creates a new node with the new statements. However, doing so
             * reveals a TypeScript bug.
             * To reproduce comment out the line below and compile:
             *
             * // ......
             *
             * abstract class A {
             * }
             * abstract class B extends A {
             *   // ......
             * }
             *
             * Note that newlines are significant. This would result in the following:
             * runtime error "TypeError: Cannot read property 'members' of undefined".
             *
             * The line below is a workaround that ensures that updateSourceFileNode and
             * updateBlock never create new Nodes.
             * TODO(#634): file a bug with TS team.
             */
            node.statements = statements;
            var fileContext = assertFileContext(context, sourceFile);
            if (leading.lastCommentEnd !== -1) {
                fileContext.lastCommentEnd = leading.lastCommentEnd;
            }
            node = visitor(node, statements);
            if (trailing.lastCommentEnd !== -1) {
                fileContext.lastCommentEnd = trailing.lastCommentEnd;
            }
            return node;
        }
        return visitor(node, statements);
    }
    /**
     * Convert leading detached comment ranges of statement arrays
     * (e.g. the statements of a ts.SourceFile or ts.Block) into a
     * `ts.NonEmittedStatement` with `ts.SynthesizedComment`s.
     *
     * A Detached leading comment is the first comment in a SourceFile / Block
     * that is separated with a newline from the first statement.
     *
     * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
     */
    function synthesizeDetachedLeadingComments(sourceFile, node, statements) {
        var triviaEnd = statements.end;
        if (statements.length) {
            triviaEnd = statements[0].getStart();
        }
        var detachedComments = getDetachedLeadingCommentRanges(sourceFile, statements.pos, triviaEnd);
        if (!detachedComments.length) {
            return { commentStmt: null, lastCommentEnd: -1 };
        }
        var lastCommentEnd = detachedComments[detachedComments.length - 1].end;
        var commentStmt = createNotEmittedStatement(sourceFile);
        ts.setSyntheticTrailingComments(commentStmt, synthesizeCommentRanges(sourceFile, detachedComments));
        return { commentStmt: commentStmt, lastCommentEnd: lastCommentEnd };
    }
    /**
     * Convert trailing detached comment ranges of statement arrays
     * (e.g. the statements of a ts.SourceFile or ts.Block) into a
     * `ts.NonEmittedStatement` with `ts.SynthesizedComment`s.
     *
     * A Detached trailing comment are all comments after the first newline
     * the follows the last statement in a SourceFile / Block.
     *
     * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
     */
    function synthesizeDetachedTrailingComments(sourceFile, node, statements) {
        var trailingCommentStart = statements.end;
        if (statements.length) {
            var lastStmt = statements[statements.length - 1];
            var lastStmtTrailingComments = ts.getTrailingCommentRanges(sourceFile.text, lastStmt.end);
            if (lastStmtTrailingComments && lastStmtTrailingComments.length) {
                trailingCommentStart = lastStmtTrailingComments[lastStmtTrailingComments.length - 1].end;
            }
        }
        var detachedComments = getAllLeadingCommentRanges(sourceFile, trailingCommentStart, node.end);
        if (!detachedComments || !detachedComments.length) {
            return { commentStmt: null, lastCommentEnd: -1 };
        }
        var lastCommentEnd = detachedComments[detachedComments.length - 1].end;
        var commentStmt = createNotEmittedStatement(sourceFile);
        ts.setSyntheticLeadingComments(commentStmt, synthesizeCommentRanges(sourceFile, detachedComments));
        return { commentStmt: commentStmt, lastCommentEnd: lastCommentEnd };
    }
    /**
     * Calculates the the detached leading comment ranges in an area of a SourceFile.
     * @param sourceFile The source file
     * @param start Where to start scanning
     * @param end Where to end scanning
     */
    // Note: This code is based on compiler/comments.ts in TypeScript
    function getDetachedLeadingCommentRanges(sourceFile, start, end) {
        var leadingComments = getAllLeadingCommentRanges(sourceFile, start, end);
        if (!leadingComments || !leadingComments.length) {
            return [];
        }
        var detachedComments = [];
        var lastComment = undefined;
        try {
            for (var leadingComments_1 = __values(leadingComments), leadingComments_1_1 = leadingComments_1.next(); !leadingComments_1_1.done; leadingComments_1_1 = leadingComments_1.next()) {
                var comment = leadingComments_1_1.value;
                if (lastComment) {
                    var lastCommentLine = getLineOfPos(sourceFile, lastComment.end);
                    var commentLine = getLineOfPos(sourceFile, comment.pos);
                    if (commentLine >= lastCommentLine + 2) {
                        // There was a blank line between the last comment and this comment.  This
                        // comment is not part of the copyright comments.  Return what we have so
                        // far.
                        break;
                    }
                }
                detachedComments.push(comment);
                lastComment = comment;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (leadingComments_1_1 && !leadingComments_1_1.done && (_a = leadingComments_1.return)) _a.call(leadingComments_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (detachedComments.length) {
            // All comments look like they could have been part of the copyright header.  Make
            // sure there is at least one blank line between it and the node.  If not, it's not
            // a copyright header.
            var lastCommentLine = getLineOfPos(sourceFile, detachedComments[detachedComments.length - 1].end);
            var nodeLine = getLineOfPos(sourceFile, end);
            if (nodeLine >= lastCommentLine + 2) {
                // Valid detachedComments
                return detachedComments;
            }
        }
        return [];
        var e_1, _a;
    }
    function getLineOfPos(sourceFile, pos) {
        return ts.getLineAndCharacterOfPosition(sourceFile, pos).line;
    }
    /**
     * ts.createNotEmittedStatement will create a node whose comments are never emitted except for very
     * specific special cases (/// comments). createNotEmittedStatementWithComments creates a not
     * emitted statement and adds comment ranges from the original statement as synthetic comments to
     * it, so that they get retained in the output.
     */
    function createNotEmittedStatementWithComments(sourceFile, original) {
        var replacement = ts.createNotEmittedStatement(original);
        // NB: synthetic nodes can have pos/end == -1. This is handled by the underlying implementation.
        var leading = ts.getLeadingCommentRanges(sourceFile.text, original.pos) || [];
        var trailing = ts.getTrailingCommentRanges(sourceFile.text, original.end) || [];
        replacement =
            ts.setSyntheticLeadingComments(replacement, synthesizeCommentRanges(sourceFile, leading));
        replacement =
            ts.setSyntheticTrailingComments(replacement, synthesizeCommentRanges(sourceFile, trailing));
        return replacement;
    }
    exports.createNotEmittedStatementWithComments = createNotEmittedStatementWithComments;
    /**
     * Converts `ts.CommentRange`s into `ts.SynthesizedComment`s
     * @param sourceFile
     * @param parsedComments
     */
    function synthesizeCommentRanges(sourceFile, parsedComments) {
        var synthesizedComments = [];
        parsedComments.forEach(function (_a, commentIdx) {
            var kind = _a.kind, pos = _a.pos, end = _a.end, hasTrailingNewLine = _a.hasTrailingNewLine;
            var commentText = sourceFile.text.substring(pos, end).trim();
            if (kind === ts.SyntaxKind.MultiLineCommentTrivia) {
                commentText = commentText.replace(/(^\/\*)|(\*\/$)/g, '');
            }
            else if (kind === ts.SyntaxKind.SingleLineCommentTrivia) {
                if (commentText.startsWith('///')) {
                    // tripple-slash comments are typescript specific, ignore them in the output.
                    return;
                }
                commentText = commentText.replace(/(^\/\/)/g, '');
            }
            synthesizedComments.push({ kind: kind, text: commentText, hasTrailingNewLine: hasTrailingNewLine, pos: -1, end: -1 });
        });
        return synthesizedComments;
    }
    /**
     * Creates a non emitted statement that can be used to store synthesized comments.
     */
    function createNotEmittedStatement(sourceFile) {
        var stmt = ts.createNotEmittedStatement(sourceFile);
        ts.setOriginalNode(stmt, undefined);
        ts.setTextRange(stmt, { pos: 0, end: 0 });
        ts.setEmitFlags(stmt, ts.EmitFlags.CustomPrologue);
        return stmt;
    }
    exports.createNotEmittedStatement = createNotEmittedStatement;
    /**
     * Returns the leading comment ranges in the source file that start at the given position.
     * This is the same as `ts.getLeadingCommentRanges`, except that it does not skip
     * comments before the first newline in the range.
     *
     * @param sourceFile
     * @param start Where to start scanning
     * @param end Where to end scanning
     */
    function getAllLeadingCommentRanges(sourceFile, start, end) {
        // exeute ts.getLeadingCommentRanges with pos = 0 so that it does not skip
        // comments until the first newline.
        var commentRanges = ts.getLeadingCommentRanges(sourceFile.text.substring(start, end), 0) || [];
        return commentRanges.map(function (cr) { return ({
            hasTrailingNewLine: cr.hasTrailingNewLine,
            kind: cr.kind,
            pos: cr.pos + start,
            end: cr.end + start
        }); });
    }
    /**
     * This is a version of `ts.visitEachChild` that works that calls our version
     * of `updateSourceFileNode`, so that typescript doesn't lose type information
     * for property decorators.
     * See https://github.com/Microsoft/TypeScript/issues/17384
     *
     * @param sf
     * @param statements
     */
    function visitEachChild(node, visitor, context) {
        if (node.kind === ts.SyntaxKind.SourceFile) {
            var sf = node;
            return updateSourceFileNode(sf, ts.visitLexicalEnvironment(sf.statements, visitor, context));
        }
        return ts.visitEachChild(node, visitor, context);
    }
    exports.visitEachChild = visitEachChild;
    /**
     * This is a version of `ts.updateSourceFileNode` that works
     * well with property decorators.
     * See https://github.com/Microsoft/TypeScript/issues/17384
     * TODO(#634): This has been fixed in TS 2.5. Investigate removal.
     *
     * @param sf
     * @param statements
     */
    function updateSourceFileNode(sf, statements) {
        if (statements === sf.statements) {
            return sf;
        }
        // Note: Need to clone the original file (and not use `ts.updateSourceFileNode`)
        // as otherwise TS fails when resolving types for decorators.
        sf = ts.getMutableClone(sf);
        sf.statements = statements;
        return sf;
    }
    exports.updateSourceFileNode = updateSourceFileNode;
    // Copied from TypeScript
    function isTypeNodeKind(kind) {
        return (kind >= ts.SyntaxKind.FirstTypeNode && kind <= ts.SyntaxKind.LastTypeNode) ||
            kind === ts.SyntaxKind.AnyKeyword || kind === ts.SyntaxKind.NumberKeyword ||
            kind === ts.SyntaxKind.ObjectKeyword || kind === ts.SyntaxKind.BooleanKeyword ||
            kind === ts.SyntaxKind.StringKeyword || kind === ts.SyntaxKind.SymbolKeyword ||
            kind === ts.SyntaxKind.ThisKeyword || kind === ts.SyntaxKind.VoidKeyword ||
            kind === ts.SyntaxKind.UndefinedKeyword || kind === ts.SyntaxKind.NullKeyword ||
            kind === ts.SyntaxKind.NeverKeyword || kind === ts.SyntaxKind.ExpressionWithTypeArguments;
    }
    exports.isTypeNodeKind = isTypeNodeKind;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXJfdXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90cmFuc2Zvcm1lcl91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRUgsMkNBQW1DO0lBQ25DLHlDQUF1QztJQUV2Qzs7O09BR0c7SUFDSCxrQ0FBeUMsS0FBNEI7UUFDbkUsSUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDbEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDbkQsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDaEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sRUFBQyxNQUFNLFFBQUEsRUFBRSxLQUFLLE9BQUEsRUFBQyxDQUFDO0lBQ3pCLENBQUM7SUFQRCw0REFPQztJQUVEOzs7O09BSUc7SUFDSCx1Q0FBOEMsT0FBaUM7UUFFN0UsT0FBTyxVQUFDLEVBQWlCO1lBQ3ZCLDhCQUE4QixDQUFVO2dCQUN0QyxPQUFPLGNBQWMsQ0FDakIsQ0FBQyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsZ0NBQWdDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsb0JBQW9CLENBQUMsRUFBdEUsQ0FBc0UsRUFDaEYsT0FBTyxDQUFDLENBQUM7WUFDZixDQUFDO1lBQ0QsT0FBTyxnQ0FBZ0MsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxvQkFBb0IsQ0FBa0IsQ0FBQztRQUNsRyxDQUFDLENBQUM7SUFDSixDQUFDO0lBVkQsc0VBVUM7SUFFRDs7T0FFRztJQUNILHlCQUF5QixPQUFp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QUMsVUFBVSxDQUFDLGdCQUFnQixJQUFJLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVc7WUFDN0UsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxJQUFJLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLDJCQUEyQixDQUFDO0lBQ2hHLENBQUM7SUFSRCx3Q0FRQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcbmltcG9ydCB7aGFzTW9kaWZpZXJGbGFnfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIEFkanVzdHMgdGhlIGdpdmVuIEN1c3RvbVRyYW5zZm9ybWVycyB3aXRoIGFkZGl0aW9uYWwgdHJhbnNmb3JtZXJzXG4gKiB0byBmaXggYnVncyBpbiBUeXBlU2NyaXB0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ3VzdG9tVHJhbnNmb3JtZXJzKGdpdmVuOiB0cy5DdXN0b21UcmFuc2Zvcm1lcnMpOiB0cy5DdXN0b21UcmFuc2Zvcm1lcnMge1xuICBjb25zdCBiZWZvcmUgPSBnaXZlbi5iZWZvcmUgfHwgW107XG4gIGJlZm9yZS51bnNoaWZ0KGFkZEZpbGVDb250ZXh0cyk7XG4gIGJlZm9yZS5wdXNoKHByZXBhcmVOb2Rlc0JlZm9yZVR5cGVTY3JpcHRUcmFuc2Zvcm0pO1xuICBjb25zdCBhZnRlciA9IGdpdmVuLmFmdGVyIHx8IFtdO1xuICBhZnRlci51bnNoaWZ0KGVtaXRNaXNzaW5nU3ludGhldGljQ29tbWVudHNBZnRlclR5cGVzY3JpcHRUcmFuc2Zvcm0pO1xuICByZXR1cm4ge2JlZm9yZSwgYWZ0ZXJ9O1xufVxuXG4vKipcbiAqIEEgdHJhbnNmb3JtZXIgdGhhdCBkb2VzIG5vdGhpbmcsIGJ1dCBzeW50aGVzaXplcyBhbGwgY29tbWVudHMuIFRoaXMgYWxsb3dzIHRlc3RpbmcgdHJhbnNmb3JtZXJzXG4gKiBpbiBpc29sYXRpb24sIGJ1dCB3aXRoIGFuIEFTVCBhbmQgY29tbWVudCBwbGFjZW1lbnQgdGhhdCBtYXRjaGVzIHdoYXQnZCBoYXBwZW4gYWZ0ZXIgYSBzb3VyY2UgbWFwXG4gKiBiYXNlZCB0cmFuc2Zvcm1lciByYW4uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzeW50aGVzaXplQ29tbWVudHNUcmFuc2Zvcm1lcihjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpOlxuICAgIHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+IHtcbiAgcmV0dXJuIChzZjogdHMuU291cmNlRmlsZSkgPT4ge1xuICAgIGZ1bmN0aW9uIHZpc2l0Tm9kZVJlY3Vyc2l2ZWx5KG46IHRzLk5vZGUpOiB0cy5Ob2RlIHtcbiAgICAgIHJldHVybiB2aXNpdEVhY2hDaGlsZChcbiAgICAgICAgICBuLCAobikgPT4gdmlzaXROb2RlV2l0aFN5bnRoZXNpemVkQ29tbWVudHMoY29udGV4dCwgc2YsIG4sIHZpc2l0Tm9kZVJlY3Vyc2l2ZWx5KSxcbiAgICAgICAgICBjb250ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIHZpc2l0Tm9kZVdpdGhTeW50aGVzaXplZENvbW1lbnRzKGNvbnRleHQsIHNmLCBzZiwgdmlzaXROb2RlUmVjdXJzaXZlbHkpIGFzIHRzLlNvdXJjZUZpbGU7XG4gIH07XG59XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoYXQgYWRkcyB0aGUgRmlsZUNvbnRleHQgdG8gdGhlIFRyYW5zZm9ybWF0aW9uQ29udGV4dC5cbiAqL1xuZnVuY3Rpb24gYWRkRmlsZUNvbnRleHRzKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCkge1xuICByZXR1cm4gKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpID0+IHtcbiAgICAoY29udGV4dCBhcyBUcmFuc2Zvcm1hdGlvbkNvbnRleHQpLmZpbGVDb250ZXh0ID0gbmV3IEZpbGVDb250ZXh0KHNvdXJjZUZpbGUpO1xuICAgIHJldHVybiBzb3VyY2VGaWxlO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhc3NlcnRGaWxlQ29udGV4dChjb250ZXh0OiBUcmFuc2Zvcm1hdGlvbkNvbnRleHQsIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiBGaWxlQ29udGV4dCB7XG4gIGlmICghY29udGV4dC5maWxlQ29udGV4dCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYElsbGVnYWwgU3RhdGU6IEZpbGVDb250ZXh0IG5vdCBpbml0aWFsaXplZC4gYCArXG4gICAgICAgIGBEaWQgeW91IGZvcmdldCB0byBhZGQgdGhlIFwiZmlyc3RUcmFuc2Zvcm1cIiBhcyBmaXJzdCB0cmFuc2Zvcm1lcj8gYCArXG4gICAgICAgIGBGaWxlOiAke3NvdXJjZUZpbGUuZmlsZU5hbWV9YCk7XG4gIH1cbiAgaWYgKGNvbnRleHQuZmlsZUNvbnRleHQuZmlsZS5maWxlTmFtZSAhPT0gc291cmNlRmlsZS5maWxlTmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYElsbGVnYWwgU3RhdGU6IEZpbGUgb2YgdGhlIEZpbGVDb250ZXh0IGRvZXMgbm90IG1hdGNoLiBGaWxlOiAke3NvdXJjZUZpbGUuZmlsZU5hbWV9YCk7XG4gIH1cbiAgcmV0dXJuIGNvbnRleHQuZmlsZUNvbnRleHQ7XG59XG5cbi8qKlxuICogQW4gZXh0ZW5kZWQgdmVyc2lvbiBvZiB0aGUgVHJhbnNmb3JtYXRpb25Db250ZXh0IHRoYXQgc3RvcmVzIHRoZSBGaWxlQ29udGV4dCBhcyB3ZWxsLlxuICovXG5pbnRlcmZhY2UgVHJhbnNmb3JtYXRpb25Db250ZXh0IGV4dGVuZHMgdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0IHtcbiAgZmlsZUNvbnRleHQ/OiBGaWxlQ29udGV4dDtcbn1cblxuLyoqXG4gKiBBIGNvbnRleHQgdGhhdCBzdG9yZXMgaW5mb3JtYXRpb24gcGVyIGZpbGUgdG8gZS5nLiBhbGxvdyBjb21tdW5pY2F0aW9uXG4gKiBiZXR3ZWVuIHRyYW5zZm9ybWVycy5cbiAqIFRoZXJlIGlzIG9uZSB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQgcGVyIGVtaXQsXG4gKiBidXQgZmlsZXMgYXJlIGhhbmRsZWQgc2VxdWVudGlhbGx5IGJ5IGFsbCB0cmFuc2Zvcm1lcnMuIFRoZWZvcmUgd2UgY2FuXG4gKiBzdG9yZSBmaWxlIHJlbGF0ZWQgaW5mb3JtYXRpb24gb24gYSBwcm9wZXJ0eSBvbiB0aGUgdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0LFxuICogZ2l2ZW4gdGhhdCB3ZSByZXNldCBpdCBpbiB0aGUgZmlyc3QgdHJhbnNmb3JtZXIuXG4gKi9cbmNsYXNzIEZpbGVDb250ZXh0IHtcbiAgLyoqXG4gICAqIFN0b3JlcyB0aGUgcGFyZW50IG5vZGUgZm9yIGFsbCBwcm9jZXNzZWQgbm9kZXMuXG4gICAqIFRoaXMgaXMgbmVlZGVkIGZvciBub2RlcyBmcm9tIHRoZSBwYXJzZSB0cmVlIHRoYXQgYXJlIHVzZWRcbiAgICogaW4gYSBzeW50aGV0aWMgbm9kZSBhcyBtdXN0IG5vdCBtb2RpZnkgdGhlc2UsIGV2ZW4gdGhvdWdoIHRoZXlcbiAgICogaGF2ZSBhIG5ldyBwYXJlbnQgbm93LlxuICAgKi9cbiAgc3ludGhldGljTm9kZVBhcmVudHMgPSBuZXcgTWFwPHRzLk5vZGUsIHRzLk5vZGV8dW5kZWZpbmVkPigpO1xuICBpbXBvcnRPclJlZXhwb3J0RGVjbGFyYXRpb25zOiBBcnJheTx0cy5FeHBvcnREZWNsYXJhdGlvbnx0cy5JbXBvcnREZWNsYXJhdGlvbj4gPSBbXTtcbiAgbGFzdENvbW1lbnRFbmQgPSAtMTtcbiAgY29uc3RydWN0b3IocHVibGljIGZpbGU6IHRzLlNvdXJjZUZpbGUpIHt9XG59XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoYXQgbmVlZHMgdG8gYmUgZXhlY3V0ZWQgcmlnaHQgYmVmb3JlIFR5cGVTY3JpcHQncyB0cmFuc2Zvcm0uXG4gKlxuICogVGhpcyBwcmVwYXJlcyB0aGUgbm9kZSB0cmVlIHRvIHdvcmthcm91bmQgc29tZSBidWdzIGluIHRoZSBUeXBlU2NyaXB0IGVtaXR0ZXIuXG4gKi9cbmZ1bmN0aW9uIHByZXBhcmVOb2Rlc0JlZm9yZVR5cGVTY3JpcHRUcmFuc2Zvcm0oY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSB7XG4gIHJldHVybiAoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkgPT4ge1xuICAgIGNvbnN0IGZpbGVDdHggPSBhc3NlcnRGaWxlQ29udGV4dChjb250ZXh0LCBzb3VyY2VGaWxlKTtcblxuICAgIGNvbnN0IG5vZGVQYXRoOiB0cy5Ob2RlW10gPSBbXTtcbiAgICB2aXNpdE5vZGUoc291cmNlRmlsZSk7XG4gICAgcmV0dXJuIHNvdXJjZUZpbGU7XG5cbiAgICBmdW5jdGlvbiB2aXNpdE5vZGUobm9kZTogdHMuTm9kZSkge1xuICAgICAgY29uc3QgcGFyZW50ID0gbm9kZVBhdGhbbm9kZVBhdGgubGVuZ3RoIC0gMV07XG5cbiAgICAgIGlmIChub2RlLmZsYWdzICYgdHMuTm9kZUZsYWdzLlN5bnRoZXNpemVkKSB7XG4gICAgICAgIC8vIFNldCBgcGFyZW50YCBmb3Igc3ludGhldGljIG5vZGVzIGFzIHdlbGwsXG4gICAgICAgIC8vIGFzIG90aGVyd2lzZSB0aGUgVFMgZW1pdCB3aWxsIGNyYXNoIGZvciBkZWNvcmF0b3JzLlxuICAgICAgICAvLyBOb3RlOiBkb24ndCB1cGRhdGUgdGhlIGBwYXJlbnRgIG9mIG9yaWdpbmFsIG5vZGVzLCBhczpcbiAgICAgICAgLy8gMSkgd2UgZG9uJ3Qgd2FudCB0byBjaGFuZ2UgdGhlbSBhdCBhbGxcbiAgICAgICAgLy8gMikgVFMgZW1pdCBiZWNvbWVzIGVycm9ybmVvdXMgaW4gc29tZSBjYXNlcyBpZiB3ZSBhZGQgYSBzeW50aGV0aWMgcGFyZW50LlxuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzM4NFxuICAgICAgICBub2RlLnBhcmVudCA9IHBhcmVudDtcbiAgICAgIH1cbiAgICAgIGZpbGVDdHguc3ludGhldGljTm9kZVBhcmVudHMuc2V0KG5vZGUsIHBhcmVudCk7XG5cbiAgICAgIGNvbnN0IG9yaWdpbmFsTm9kZSA9IHRzLmdldE9yaWdpbmFsTm9kZShub2RlKTtcblxuICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbXBvcnREZWNsYXJhdGlvbiB8fFxuICAgICAgICAgIG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHBvcnREZWNsYXJhdGlvbikge1xuICAgICAgICBjb25zdCBpZWQgPSBub2RlIGFzIHRzLkltcG9ydERlY2xhcmF0aW9uIHwgdHMuRXhwb3J0RGVjbGFyYXRpb247XG4gICAgICAgIGlmIChpZWQubW9kdWxlU3BlY2lmaWVyKSB7XG4gICAgICAgICAgZmlsZUN0eC5pbXBvcnRPclJlZXhwb3J0RGVjbGFyYXRpb25zLnB1c2goaWVkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyByZWN1cnNlXG4gICAgICBub2RlUGF0aC5wdXNoKG5vZGUpO1xuICAgICAgbm9kZS5mb3JFYWNoQ2hpbGQodmlzaXROb2RlKTtcbiAgICAgIG5vZGVQYXRoLnBvcCgpO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhhdCBuZWVkcyB0byBiZSBleGVjdXRlZCBhZnRlciBUeXBlU2NyaXB0J3MgdHJhbnNmb3JtLlxuICpcbiAqIFRoaXMgZml4ZXMgcGxhY2VzIHdoZXJlIHRoZSBUeXBlU2NyaXB0IHRyYW5zZm9ybWVyIGRvZXMgbm90XG4gKiBlbWl0IHN5bnRoZXRpYyBjb21tZW50cy5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzU5NFxuICovXG5mdW5jdGlvbiBlbWl0TWlzc2luZ1N5bnRoZXRpY0NvbW1lbnRzQWZ0ZXJUeXBlc2NyaXB0VHJhbnNmb3JtKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCkge1xuICByZXR1cm4gKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpID0+IHtcbiAgICBjb25zdCBmaWxlQ29udGV4dCA9IGFzc2VydEZpbGVDb250ZXh0KGNvbnRleHQsIHNvdXJjZUZpbGUpO1xuICAgIGNvbnN0IG5vZGVQYXRoOiB0cy5Ob2RlW10gPSBbXTtcbiAgICB2aXNpdE5vZGUoc291cmNlRmlsZSk7XG4gICAgKGNvbnRleHQgYXMgVHJhbnNmb3JtYXRpb25Db250ZXh0KS5maWxlQ29udGV4dCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gc291cmNlRmlsZTtcblxuICAgIGZ1bmN0aW9uIHZpc2l0Tm9kZShub2RlOiB0cy5Ob2RlKSB7XG4gICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICAgICAgY29uc3QgcGFyZW50MSA9IGZpbGVDb250ZXh0LnN5bnRoZXRpY05vZGVQYXJlbnRzLmdldChub2RlKTtcbiAgICAgICAgY29uc3QgcGFyZW50MiA9IHBhcmVudDEgJiYgZmlsZUNvbnRleHQuc3ludGhldGljTm9kZVBhcmVudHMuZ2V0KHBhcmVudDEpO1xuICAgICAgICBjb25zdCBwYXJlbnQzID0gcGFyZW50MiAmJiBmaWxlQ29udGV4dC5zeW50aGV0aWNOb2RlUGFyZW50cy5nZXQocGFyZW50Mik7XG5cbiAgICAgICAgaWYgKHBhcmVudDEgJiYgcGFyZW50MS5raW5kID09PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5RGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAvLyBUeXBlU2NyaXB0IGlnbm9yZXMgc3ludGhldGljIGNvbW1lbnRzIG9uIChzdGF0aWMpIHByb3BlcnR5IGRlY2xhcmF0aW9uc1xuICAgICAgICAgIC8vIHdpdGggaW5pdGlhbGl6ZXJzLlxuICAgICAgICAgIC8vIGZpbmQgdGhlIHBhcmVudCBFeHByZXNzaW9uU3RhdGVtZW50IGxpa2UgTXlDbGFzcy5mb28gPSAuLi5cbiAgICAgICAgICBjb25zdCBleHByZXNzaW9uU3RtdCA9XG4gICAgICAgICAgICAgIGxhc3ROb2RlV2l0aChub2RlUGF0aCwgKG5vZGUpID0+IG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHByZXNzaW9uU3RhdGVtZW50KTtcbiAgICAgICAgICBpZiAoZXhwcmVzc2lvblN0bXQpIHtcbiAgICAgICAgICAgIHRzLnNldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uU3RtdCwgdHMuZ2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKHBhcmVudDEpIHx8IFtdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICBwYXJlbnQzICYmIHBhcmVudDMua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudCAmJlxuICAgICAgICAgICAgaGFzTW9kaWZpZXJGbGFnKHBhcmVudDMsIHRzLk1vZGlmaWVyRmxhZ3MuRXhwb3J0KSkge1xuICAgICAgICAgIC8vIFR5cGVTY3JpcHQgaWdub3JlcyBzeW50aGV0aWMgY29tbWVudHMgb24gZXhwb3J0ZWQgdmFyaWFibGVzLlxuICAgICAgICAgIC8vIGZpbmQgdGhlIHBhcmVudCBFeHByZXNzaW9uU3RhdGVtZW50IGxpa2UgZXhwb3J0cy5mb28gPSAuLi5cbiAgICAgICAgICBjb25zdCBleHByZXNzaW9uU3RtdCA9XG4gICAgICAgICAgICAgIGxhc3ROb2RlV2l0aChub2RlUGF0aCwgKG5vZGUpID0+IG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHByZXNzaW9uU3RhdGVtZW50KTtcbiAgICAgICAgICBpZiAoZXhwcmVzc2lvblN0bXQpIHtcbiAgICAgICAgICAgIHRzLnNldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uU3RtdCwgdHMuZ2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKHBhcmVudDMpIHx8IFtdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIFR5cGVTY3JpcHQgaWdub3JlcyBzeW50aGV0aWMgY29tbWVudHMgb24gcmVleHBvcnQgLyBpbXBvcnQgc3RhdGVtZW50cy5cbiAgICAgIC8vIFRoZSBjb2RlIGJlbG93IHJlLWFkZHMgdGhlbSBvbmUgdGhlIGNvbnZlcnRlZCBDb21tb25KUyBpbXBvcnQgc3RhdGVtZW50cywgYW5kIHJlc2V0cyB0aGVcbiAgICAgIC8vIHRleHQgcmFuZ2UgdG8gcHJldmVudCBwcmV2aW91cyBjb21tZW50cyBmcm9tIGJlaW5nIGVtaXR0ZWQuXG4gICAgICBpZiAoaXNDb21tb25Kc1JlcXVpcmVTdGF0ZW1lbnQobm9kZSkgJiYgZmlsZUNvbnRleHQuaW1wb3J0T3JSZWV4cG9ydERlY2xhcmF0aW9ucykge1xuICAgICAgICAvLyBMb2NhdGUgdGhlIG9yaWdpbmFsIGltcG9ydC9leHBvcnQgZGVjbGFyYXRpb24gdmlhIHRoZVxuICAgICAgICAvLyB0ZXh0IHJhbmdlLlxuICAgICAgICBjb25zdCBpbXBvcnRPclJlZXhwb3J0RGVjbGFyYXRpb24gPVxuICAgICAgICAgICAgZmlsZUNvbnRleHQuaW1wb3J0T3JSZWV4cG9ydERlY2xhcmF0aW9ucy5maW5kKGllZCA9PiBpZWQucG9zID09PSBub2RlLnBvcyk7XG4gICAgICAgIGlmIChpbXBvcnRPclJlZXhwb3J0RGVjbGFyYXRpb24pIHtcbiAgICAgICAgICB0cy5zZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMoXG4gICAgICAgICAgICAgIG5vZGUsIHRzLmdldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhpbXBvcnRPclJlZXhwb3J0RGVjbGFyYXRpb24pIHx8IFtdKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBOZWVkIHRvIGNsZWFyIHRoZSB0ZXh0UmFuZ2UgZm9yIEltcG9ydERlY2xhcmF0aW9uIC8gRXhwb3J0RGVjbGFyYXRpb24gYXNcbiAgICAgICAgLy8gb3RoZXJ3aXNlIFR5cGVTY3JpcHQgd291bGQgZW1pdCB0aGUgb3JpZ2luYWwgY29tbWVudHMgZXZlbiBpZiB3ZSBzZXQgdGhlXG4gICAgICAgIC8vIHRzLkVtaXRGbGFnLk5vQ29tbWVudHMuIChzZWUgYWxzbyByZXNldE5vZGVUZXh0UmFuZ2VUb1ByZXZlbnREdXBsaWNhdGVDb21tZW50cyBiZWxvdylcbiAgICAgICAgdHMuc2V0U291cmNlTWFwUmFuZ2Uobm9kZSwge3Bvczogbm9kZS5wb3MsIGVuZDogbm9kZS5lbmR9KTtcbiAgICAgICAgdHMuc2V0VGV4dFJhbmdlKG5vZGUsIHtwb3M6IC0xLCBlbmQ6IC0xfSk7XG4gICAgICB9XG4gICAgICBub2RlUGF0aC5wdXNoKG5vZGUpO1xuICAgICAgbm9kZS5mb3JFYWNoQ2hpbGQodmlzaXROb2RlKTtcbiAgICAgIG5vZGVQYXRoLnBvcCgpO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gaXNDb21tb25Kc1JlcXVpcmVTdGF0ZW1lbnQobm9kZTogdHMuTm9kZSk6IGJvb2xlYW4ge1xuICAvLyBDb21tb25KUyByZXF1aXJlcyBjYW4gYmUgZWl0aGVyIFwidmFyIHggPSByZXF1aXJlKCcuLi4nKTtcIiBvciAoZm9yIHNpZGUgZWZmZWN0IGltcG9ydHMpLCBqdXN0XG4gIC8vIFwicmVxdWlyZSgnLi4uJyk7XCIuXG4gIGxldCBjYWxsRXhwcjogdHMuQ2FsbEV4cHJlc3Npb247XG4gIGlmICh0cy5pc1ZhcmlhYmxlU3RhdGVtZW50KG5vZGUpKSB7XG4gICAgY29uc3QgdmFyU3RtdCA9IG5vZGUgYXMgdHMuVmFyaWFibGVTdGF0ZW1lbnQ7XG4gICAgY29uc3QgZGVjbHMgPSB2YXJTdG10LmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnM7XG4gICAgbGV0IGluaXQ6IHRzLkV4cHJlc3Npb258dW5kZWZpbmVkO1xuICAgIGlmIChkZWNscy5sZW5ndGggIT09IDEgfHwgIShpbml0ID0gZGVjbHNbMF0uaW5pdGlhbGl6ZXIpIHx8XG4gICAgICAgIGluaXQua2luZCAhPT0gdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjYWxsRXhwciA9IGluaXQgYXMgdHMuQ2FsbEV4cHJlc3Npb247XG4gIH0gZWxzZSBpZiAodHMuaXNFeHByZXNzaW9uU3RhdGVtZW50KG5vZGUpICYmIHRzLmlzQ2FsbEV4cHJlc3Npb24obm9kZS5leHByZXNzaW9uKSkge1xuICAgIGNhbGxFeHByID0gbm9kZS5leHByZXNzaW9uO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoY2FsbEV4cHIuZXhwcmVzc2lvbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIgfHxcbiAgICAgIChjYWxsRXhwci5leHByZXNzaW9uIGFzIHRzLklkZW50aWZpZXIpLnRleHQgIT09ICdyZXF1aXJlJyB8fFxuICAgICAgY2FsbEV4cHIuYXJndW1lbnRzLmxlbmd0aCAhPT0gMSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBtb2R1bGVFeHByID0gY2FsbEV4cHIuYXJndW1lbnRzWzBdO1xuICByZXR1cm4gbW9kdWxlRXhwci5raW5kID09PSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw7XG59XG5cbmZ1bmN0aW9uIGxhc3ROb2RlV2l0aChub2RlczogdHMuTm9kZVtdLCBwcmVkaWNhdGU6IChub2RlOiB0cy5Ob2RlKSA9PiBib29sZWFuKTogdHMuTm9kZXxudWxsIHtcbiAgZm9yIChsZXQgaSA9IG5vZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgIGlmIChwcmVkaWNhdGUobm9kZSkpIHtcbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGNvbW1lbnQgdGV4dCByYW5nZXMgYmVmb3JlIGFuZCBhZnRlciBhIG5vZGVcbiAqIGludG8gdHMuU3ludGhlc2l6ZWRDb21tZW50cyBmb3IgdGhlIG5vZGUgYW5kIHByZXZlbnQgdGhlXG4gKiBjb21tZW50IHRleHQgcmFuZ2VzIHRvIGJlIGVtaXR0ZWQsIHRvIGFsbG93XG4gKiBjaGFuZ2luZyB0aGVzZSBjb21tZW50cy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHRha2VzIGEgdmlzaXRvciB0byBiZSBhYmxlIHRvIGRvIHNvbWVcbiAqIHN0YXRlIG1hbmFnZW1lbnQgYWZ0ZXIgdGhlIGNhbGxlciBpcyBkb25lIGNoYW5naW5nIGEgbm9kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0Tm9kZVdpdGhTeW50aGVzaXplZENvbW1lbnRzPFQgZXh0ZW5kcyB0cy5Ob2RlPihcbiAgICBjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQsIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIG5vZGU6IFQsXG4gICAgdmlzaXRvcjogKG5vZGU6IFQpID0+IFQpOiBUIHtcbiAgaWYgKG5vZGUuZmxhZ3MgJiB0cy5Ob2RlRmxhZ3MuU3ludGhlc2l6ZWQpIHtcbiAgICByZXR1cm4gdmlzaXRvcihub2RlKTtcbiAgfVxuICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkJsb2NrKSB7XG4gICAgY29uc3QgYmxvY2sgPSBub2RlIGFzIHRzLk5vZGUgYXMgdHMuQmxvY2s7XG4gICAgbm9kZSA9IHZpc2l0Tm9kZVN0YXRlbWVudHNXaXRoU3ludGhlc2l6ZWRDb21tZW50cyhcbiAgICAgICAgY29udGV4dCwgc291cmNlRmlsZSwgbm9kZSwgYmxvY2suc3RhdGVtZW50cyxcbiAgICAgICAgKG5vZGUsIHN0bXRzKSA9PiB2aXNpdG9yKHRzLnVwZGF0ZUJsb2NrKGJsb2NrLCBzdG10cykgYXMgdHMuTm9kZSBhcyBUKSk7XG4gIH0gZWxzZSBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlNvdXJjZUZpbGUpIHtcbiAgICBub2RlID0gdmlzaXROb2RlU3RhdGVtZW50c1dpdGhTeW50aGVzaXplZENvbW1lbnRzKFxuICAgICAgICBjb250ZXh0LCBzb3VyY2VGaWxlLCBub2RlLCBzb3VyY2VGaWxlLnN0YXRlbWVudHMsXG4gICAgICAgIChub2RlLCBzdG10cykgPT4gdmlzaXRvcih1cGRhdGVTb3VyY2VGaWxlTm9kZShzb3VyY2VGaWxlLCBzdG10cykgYXMgdHMuTm9kZSBhcyBUKSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gSW4gYXJyb3cgZnVuY3Rpb25zIHdpdGggZXhwcmVzc2lvbiBib2RpZXMgKGAoeCkgPT4gZXhwcmApLCBkbyBub3Qgc3ludGhlc2l6ZSBjb21tZW50IG5vZGVzXG4gICAgLy8gdGhhdCBwcmVjZWRlIHRoZSBib2R5IGV4cHJlc3Npb24uIFdoZW4gZG93bmxldmVsaW5nIHRvIEVTNSwgVHlwZVNjcmlwdCBpbnNlcnRzIGEgcmV0dXJuXG4gICAgLy8gc3RhdGVtZW50IGFuZCBtb3ZlcyB0aGUgY29tbWVudCBpbiBmcm9udCBvZiBpdCwgYnV0IHRoZW4gc3RpbGwgZW1pdHMgYW55IHN5bnRlc2l6ZWQgY29tbWVudFxuICAgIC8vIHdlIGNyZWF0ZSBoZXJlLiBUaGF0IGNhbiBjYXVzZSBhIGxpbmUgY29tbWVudCB0byBiZSBlbWl0dGVkIGFmdGVyIHRoZSByZXR1cm4sIHdoaWNoIGNhdXNlc1xuICAgIC8vIEF1dG9tYXRpYyBTZW1pY29sb24gSW5zZXJ0aW9uLCB3aGljaCB0aGVuIGJyZWFrcyB0aGUgY29kZS4gU2VlIGFycm93X2ZuX2VzNS50cyBmb3IgYW5cbiAgICAvLyBleGFtcGxlLlxuICAgIGlmIChub2RlLnBhcmVudCAmJiAobm9kZSBhcyB0cy5Ob2RlKS5raW5kICE9PSB0cy5TeW50YXhLaW5kLkJsb2NrICYmXG4gICAgICAgIHRzLmlzQXJyb3dGdW5jdGlvbihub2RlLnBhcmVudCkgJiYgKG5vZGUgYXMgdHMuTm9kZSkgPT09IG5vZGUucGFyZW50LmJvZHkpIHtcbiAgICAgIHJldHVybiB2aXNpdG9yKG5vZGUpO1xuICAgIH1cbiAgICBjb25zdCBmaWxlQ29udGV4dCA9IGFzc2VydEZpbGVDb250ZXh0KGNvbnRleHQsIHNvdXJjZUZpbGUpO1xuICAgIGNvbnN0IGxlYWRpbmdMYXN0Q29tbWVudEVuZCA9XG4gICAgICAgIHN5bnRoZXNpemVMZWFkaW5nQ29tbWVudHMoc291cmNlRmlsZSwgbm9kZSwgZmlsZUNvbnRleHQubGFzdENvbW1lbnRFbmQpO1xuICAgIGNvbnN0IHRyYWlsaW5nTGFzdENvbW1lbnRFbmQgPSBzeW50aGVzaXplVHJhaWxpbmdDb21tZW50cyhzb3VyY2VGaWxlLCBub2RlKTtcbiAgICBpZiAobGVhZGluZ0xhc3RDb21tZW50RW5kICE9PSAtMSkge1xuICAgICAgZmlsZUNvbnRleHQubGFzdENvbW1lbnRFbmQgPSBsZWFkaW5nTGFzdENvbW1lbnRFbmQ7XG4gICAgfVxuICAgIG5vZGUgPSB2aXNpdG9yKG5vZGUpO1xuICAgIGlmICh0cmFpbGluZ0xhc3RDb21tZW50RW5kICE9PSAtMSkge1xuICAgICAgZmlsZUNvbnRleHQubGFzdENvbW1lbnRFbmQgPSB0cmFpbGluZ0xhc3RDb21tZW50RW5kO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzZXROb2RlVGV4dFJhbmdlVG9QcmV2ZW50RHVwbGljYXRlQ29tbWVudHMobm9kZSk7XG59XG5cbi8qKlxuICogUmVzZXQgdGhlIHRleHQgcmFuZ2UgZm9yIHNvbWUgc3BlY2lhbCBub2RlcyBhcyBvdGhlcndpc2UgVHlwZVNjcmlwdFxuICogd291bGQgYWx3YXlzIGVtaXQgdGhlIG9yaWdpbmFsIGNvbW1lbnRzIGZvciB0aGVtLlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMTc1OTRcbiAqXG4gKiBAcGFyYW0gbm9kZVxuICovXG5mdW5jdGlvbiByZXNldE5vZGVUZXh0UmFuZ2VUb1ByZXZlbnREdXBsaWNhdGVDb21tZW50czxUIGV4dGVuZHMgdHMuTm9kZT4obm9kZTogVCk6IFQge1xuICB0cy5zZXRFbWl0RmxhZ3Mobm9kZSwgKHRzLmdldEVtaXRGbGFncyhub2RlKSB8fCAwKSB8IHRzLkVtaXRGbGFncy5Ob0NvbW1lbnRzKTtcbiAgLy8gU2VlIGFsc28gZW1pdE1pc3NpbmdTeW50aGV0aWNDb21tZW50c0FmdGVyVHlwZXNjcmlwdFRyYW5zZm9ybS5cbiAgLy8gTm90ZTogRG9uJ3QgcmVzZXQgdGhlIHRleHRSYW5nZSBmb3IgdHMuRXhwb3J0RGVjbGFyYXRpb24gLyB0cy5JbXBvcnREZWNsYXJhdGlvblxuICAvLyB1bnRpbCBhZnRlciB0aGUgVHlwZVNjcmlwdCB0cmFuc2Zvcm1lciBhcyB3ZSBuZWVkIHRoZSBzb3VyY2UgbG9jYXRpb25cbiAgLy8gdG8gbWFwIHRoZSBnZW5lcmF0ZWQgYHJlcXVpcmVgIGNhbGxzIGJhY2sgdG8gdGhlIG9yaWdpbmFsXG4gIC8vIHRzLkV4cG9ydERlY2xhcmF0aW9uIC8gdHMuSW1wb3J0RGVjbGFyYXRpb24gbm9kZXMuXG4gIGxldCBhbGxvd1RleHRSYW5nZSA9IG5vZGUua2luZCAhPT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uICYmXG4gICAgICBub2RlLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvbiAmJlxuICAgICAgIShub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVmFyaWFibGVTdGF0ZW1lbnQgJiZcbiAgICAgICAgaGFzTW9kaWZpZXJGbGFnKG5vZGUsIHRzLk1vZGlmaWVyRmxhZ3MuRXhwb3J0KSkgJiZcbiAgICAgIG5vZGUua2luZCAhPT0gdHMuU3ludGF4S2luZC5Nb2R1bGVEZWNsYXJhdGlvbjtcbiAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eURlY2xhcmF0aW9uKSB7XG4gICAgYWxsb3dUZXh0UmFuZ2UgPSBmYWxzZTtcbiAgICBjb25zdCBwZCA9IG5vZGUgYXMgdHMuTm9kZSBhcyB0cy5Qcm9wZXJ0eURlY2xhcmF0aW9uO1xuICAgIG5vZGUgPSB0cy51cGRhdGVQcm9wZXJ0eShcbiAgICAgICAgICAgICAgIHBkLCBwZC5kZWNvcmF0b3JzLCBwZC5tb2RpZmllcnMsIHJlc2V0VGV4dFJhbmdlKHBkLm5hbWUpIGFzIHRzLlByb3BlcnR5TmFtZSxcbiAgICAgICAgICAgICAgIHBkLnF1ZXN0aW9uVG9rZW4sIHBkLnR5cGUsIHBkLmluaXRpYWxpemVyKSBhcyB0cy5Ob2RlIGFzIFQ7XG4gIH1cbiAgaWYgKCFhbGxvd1RleHRSYW5nZSkge1xuICAgIG5vZGUgPSByZXNldFRleHRSYW5nZShub2RlKTtcbiAgfVxuICByZXR1cm4gbm9kZTtcblxuICBmdW5jdGlvbiByZXNldFRleHRSYW5nZTxUIGV4dGVuZHMgdHMuTm9kZT4obm9kZTogVCk6IFQge1xuICAgIGlmICghKG5vZGUuZmxhZ3MgJiB0cy5Ob2RlRmxhZ3MuU3ludGhlc2l6ZWQpKSB7XG4gICAgICAvLyBuZWVkIHRvIGNsb25lIGFzIHdlIGRvbid0IHdhbnQgdG8gbW9kaWZ5IHNvdXJjZSBub2RlcyxcbiAgICAgIC8vIGFzIHRoZSBwYXJzZWQgU291cmNlRmlsZXMgY291bGQgYmUgY2FjaGVkIVxuICAgICAgbm9kZSA9IHRzLmdldE11dGFibGVDbG9uZShub2RlKTtcbiAgICB9XG4gICAgY29uc3QgdGV4dFJhbmdlID0ge3Bvczogbm9kZS5wb3MsIGVuZDogbm9kZS5lbmR9O1xuICAgIHRzLnNldFNvdXJjZU1hcFJhbmdlKG5vZGUsIHRleHRSYW5nZSk7XG4gICAgdHMuc2V0VGV4dFJhbmdlKG5vZGUsIHtwb3M6IC0xLCBlbmQ6IC0xfSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkcyBpbiB0aGUgbGVhZGluZyBjb21tZW50IHRleHQgcmFuZ2VzIG9mIHRoZSBnaXZlbiBub2RlLFxuICogY29udmVydHMgdGhlbSBpbnRvIGB0cy5TeW50aGV0aWNDb21tZW50YHMgYW5kIHN0b3JlcyB0aGVtIG9uIHRoZSBub2RlLlxuICpcbiAqIE5vdGU6IFRoaXMgd291bGQgYmUgZ3JlYXRseSBzaW1wbGlmaWVkIHdpdGggaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzYxNS5cbiAqXG4gKiBAcGFyYW0gbGFzdENvbW1lbnRFbmQgVGhlIGVuZCBvZiB0aGUgbGFzdCBjb21tZW50XG4gKiBAcmV0dXJuIFRoZSBlbmQgb2YgdGhlIGxhc3QgZm91bmQgY29tbWVudCwgLTEgaWYgbm8gY29tbWVudCB3YXMgZm91bmQuXG4gKi9cbmZ1bmN0aW9uIHN5bnRoZXNpemVMZWFkaW5nQ29tbWVudHMoXG4gICAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgbm9kZTogdHMuTm9kZSwgbGFzdENvbW1lbnRFbmQ6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50O1xuICBjb25zdCBzaGFyZXNTdGFydFdpdGhQYXJlbnQgPSBwYXJlbnQgJiYgcGFyZW50LmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQmxvY2sgJiZcbiAgICAgIHBhcmVudC5raW5kICE9PSB0cy5TeW50YXhLaW5kLlNvdXJjZUZpbGUgJiYgcGFyZW50LmdldEZ1bGxTdGFydCgpID09PSBub2RlLmdldEZ1bGxTdGFydCgpO1xuICBpZiAoc2hhcmVzU3RhcnRXaXRoUGFyZW50IHx8IGxhc3RDb21tZW50RW5kID49IG5vZGUuZ2V0U3RhcnQoKSkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICBjb25zdCBhZGp1c3RlZE5vZGVGdWxsU3RhcnQgPSBNYXRoLm1heChsYXN0Q29tbWVudEVuZCwgbm9kZS5nZXRGdWxsU3RhcnQoKSk7XG4gIGNvbnN0IGxlYWRpbmdDb21tZW50cyA9XG4gICAgICBnZXRBbGxMZWFkaW5nQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLCBhZGp1c3RlZE5vZGVGdWxsU3RhcnQsIG5vZGUuZ2V0U3RhcnQoKSk7XG4gIGlmIChsZWFkaW5nQ29tbWVudHMgJiYgbGVhZGluZ0NvbW1lbnRzLmxlbmd0aCkge1xuICAgIHRzLnNldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhub2RlLCBzeW50aGVzaXplQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLCBsZWFkaW5nQ29tbWVudHMpKTtcbiAgICByZXR1cm4gbm9kZS5nZXRTdGFydCgpO1xuICB9XG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBSZWFkcyBpbiB0aGUgdHJhaWxpbmcgY29tbWVudCB0ZXh0IHJhbmdlcyBvZiB0aGUgZ2l2ZW4gbm9kZSxcbiAqIGNvbnZlcnRzIHRoZW0gaW50byBgdHMuU3ludGhldGljQ29tbWVudGBzIGFuZCBzdG9yZXMgdGhlbSBvbiB0aGUgbm9kZS5cbiAqXG4gKiBOb3RlOiBUaGlzIHdvdWxkIGJlIGdyZWF0bHkgc2ltcGxpZmllZCB3aXRoIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMTc2MTUuXG4gKlxuICogQHJldHVybiBUaGUgZW5kIG9mIHRoZSBsYXN0IGZvdW5kIGNvbW1lbnQsIC0xIGlmIG5vIGNvbW1lbnQgd2FzIGZvdW5kLlxuICovXG5mdW5jdGlvbiBzeW50aGVzaXplVHJhaWxpbmdDb21tZW50cyhzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBub2RlOiB0cy5Ob2RlKTogbnVtYmVyIHtcbiAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnQ7XG4gIGNvbnN0IHNoYXJlc0VuZFdpdGhQYXJlbnQgPSBwYXJlbnQgJiYgcGFyZW50LmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQmxvY2sgJiZcbiAgICAgIHBhcmVudC5raW5kICE9PSB0cy5TeW50YXhLaW5kLlNvdXJjZUZpbGUgJiYgcGFyZW50LmdldEVuZCgpID09PSBub2RlLmdldEVuZCgpO1xuICBpZiAoc2hhcmVzRW5kV2l0aFBhcmVudCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICBjb25zdCB0cmFpbGluZ0NvbW1lbnRzID0gdHMuZ2V0VHJhaWxpbmdDb21tZW50UmFuZ2VzKHNvdXJjZUZpbGUudGV4dCwgbm9kZS5nZXRFbmQoKSk7XG4gIGlmICh0cmFpbGluZ0NvbW1lbnRzICYmIHRyYWlsaW5nQ29tbWVudHMubGVuZ3RoKSB7XG4gICAgdHMuc2V0U3ludGhldGljVHJhaWxpbmdDb21tZW50cyhub2RlLCBzeW50aGVzaXplQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLCB0cmFpbGluZ0NvbW1lbnRzKSk7XG4gICAgcmV0dXJuIHRyYWlsaW5nQ29tbWVudHNbdHJhaWxpbmdDb21tZW50cy5sZW5ndGggLSAxXS5lbmQ7XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBhcnJheU9mPFQ+KHZhbHVlOiBUfHVuZGVmaW5lZHxudWxsKTogVFtdIHtcbiAgcmV0dXJuIHZhbHVlID8gW3ZhbHVlXSA6IFtdO1xufVxuXG4vKipcbiAqIENvbnZlcnQgbGVhZGluZy90cmFpbGluZyBkZXRhY2hlZCBjb21tZW50IHJhbmdlcyBvZiBzdGF0ZW1lbnQgYXJyYXlzXG4gKiAoZS5nLiB0aGUgc3RhdGVtZW50cyBvZiBhIHRzLlNvdXJjZUZpbGUgb3IgdHMuQmxvY2spIGludG9cbiAqIGB0cy5Ob25FbWl0dGVkU3RhdGVtZW50YHMgd2l0aCBgdHMuU3ludGhlc2l6ZWRDb21tZW50YHMgYW5kXG4gKiBwcmVwZW5kcyAvIGFwcGVuZHMgdGhlbSB0byB0aGUgZ2l2ZW4gc3RhdGVtZW50IGFycmF5LlxuICogVGhpcyBpcyBuZWVkZWQgdG8gYWxsb3cgY2hhbmdpbmcgdGhlc2UgY29tbWVudHMuXG4gKlxuICogVGhpcyBmdW5jdGlvbiB0YWtlcyBhIHZpc2l0b3IgdG8gYmUgYWJsZSB0byBkbyBzb21lXG4gKiBzdGF0ZSBtYW5hZ2VtZW50IGFmdGVyIHRoZSBjYWxsZXIgaXMgZG9uZSBjaGFuZ2luZyBhIG5vZGUuXG4gKi9cbmZ1bmN0aW9uIHZpc2l0Tm9kZVN0YXRlbWVudHNXaXRoU3ludGhlc2l6ZWRDb21tZW50czxUIGV4dGVuZHMgdHMuTm9kZT4oXG4gICAgY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0LCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBub2RlOiBULFxuICAgIHN0YXRlbWVudHM6IHRzLk5vZGVBcnJheTx0cy5TdGF0ZW1lbnQ+LFxuICAgIHZpc2l0b3I6IChub2RlOiBULCBzdGF0ZW1lbnRzOiB0cy5Ob2RlQXJyYXk8dHMuU3RhdGVtZW50PikgPT4gVCk6IFQge1xuICBjb25zdCBsZWFkaW5nID0gc3ludGhlc2l6ZURldGFjaGVkTGVhZGluZ0NvbW1lbnRzKHNvdXJjZUZpbGUsIG5vZGUsIHN0YXRlbWVudHMpO1xuICBjb25zdCB0cmFpbGluZyA9IHN5bnRoZXNpemVEZXRhY2hlZFRyYWlsaW5nQ29tbWVudHMoc291cmNlRmlsZSwgbm9kZSwgc3RhdGVtZW50cyk7XG4gIGlmIChsZWFkaW5nLmNvbW1lbnRTdG10IHx8IHRyYWlsaW5nLmNvbW1lbnRTdG10KSB7XG4gICAgY29uc3QgbmV3U3RhdGVtZW50czogdHMuU3RhdGVtZW50W10gPVxuICAgICAgICBbLi4uYXJyYXlPZihsZWFkaW5nLmNvbW1lbnRTdG10KSwgLi4uc3RhdGVtZW50cywgLi4uYXJyYXlPZih0cmFpbGluZy5jb21tZW50U3RtdCldO1xuICAgIHN0YXRlbWVudHMgPSB0cy5zZXRUZXh0UmFuZ2UodHMuY3JlYXRlTm9kZUFycmF5KG5ld1N0YXRlbWVudHMpLCB7cG9zOiAtMSwgZW5kOiAtMX0pO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHZpc2l0b3IgY3JlYXRlcyBhIG5ldyBub2RlIHdpdGggdGhlIG5ldyBzdGF0ZW1lbnRzLiBIb3dldmVyLCBkb2luZyBzb1xuICAgICAqIHJldmVhbHMgYSBUeXBlU2NyaXB0IGJ1Zy5cbiAgICAgKiBUbyByZXByb2R1Y2UgY29tbWVudCBvdXQgdGhlIGxpbmUgYmVsb3cgYW5kIGNvbXBpbGU6XG4gICAgICpcbiAgICAgKiAvLyAuLi4uLi5cbiAgICAgKlxuICAgICAqIGFic3RyYWN0IGNsYXNzIEEge1xuICAgICAqIH1cbiAgICAgKiBhYnN0cmFjdCBjbGFzcyBCIGV4dGVuZHMgQSB7XG4gICAgICogICAvLyAuLi4uLi5cbiAgICAgKiB9XG4gICAgICpcbiAgICAgKiBOb3RlIHRoYXQgbmV3bGluZXMgYXJlIHNpZ25pZmljYW50LiBUaGlzIHdvdWxkIHJlc3VsdCBpbiB0aGUgZm9sbG93aW5nOlxuICAgICAqIHJ1bnRpbWUgZXJyb3IgXCJUeXBlRXJyb3I6IENhbm5vdCByZWFkIHByb3BlcnR5ICdtZW1iZXJzJyBvZiB1bmRlZmluZWRcIi5cbiAgICAgKlxuICAgICAqIFRoZSBsaW5lIGJlbG93IGlzIGEgd29ya2Fyb3VuZCB0aGF0IGVuc3VyZXMgdGhhdCB1cGRhdGVTb3VyY2VGaWxlTm9kZSBhbmRcbiAgICAgKiB1cGRhdGVCbG9jayBuZXZlciBjcmVhdGUgbmV3IE5vZGVzLlxuICAgICAqIFRPRE8oIzYzNCk6IGZpbGUgYSBidWcgd2l0aCBUUyB0ZWFtLlxuICAgICAqL1xuICAgIChub2RlIGFzIHRzLk5vZGUgYXMgdHMuU291cmNlRmlsZSkuc3RhdGVtZW50cyA9IHN0YXRlbWVudHM7XG5cbiAgICBjb25zdCBmaWxlQ29udGV4dCA9IGFzc2VydEZpbGVDb250ZXh0KGNvbnRleHQsIHNvdXJjZUZpbGUpO1xuICAgIGlmIChsZWFkaW5nLmxhc3RDb21tZW50RW5kICE9PSAtMSkge1xuICAgICAgZmlsZUNvbnRleHQubGFzdENvbW1lbnRFbmQgPSBsZWFkaW5nLmxhc3RDb21tZW50RW5kO1xuICAgIH1cbiAgICBub2RlID0gdmlzaXRvcihub2RlLCBzdGF0ZW1lbnRzKTtcbiAgICBpZiAodHJhaWxpbmcubGFzdENvbW1lbnRFbmQgIT09IC0xKSB7XG4gICAgICBmaWxlQ29udGV4dC5sYXN0Q29tbWVudEVuZCA9IHRyYWlsaW5nLmxhc3RDb21tZW50RW5kO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuICByZXR1cm4gdmlzaXRvcihub2RlLCBzdGF0ZW1lbnRzKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGxlYWRpbmcgZGV0YWNoZWQgY29tbWVudCByYW5nZXMgb2Ygc3RhdGVtZW50IGFycmF5c1xuICogKGUuZy4gdGhlIHN0YXRlbWVudHMgb2YgYSB0cy5Tb3VyY2VGaWxlIG9yIHRzLkJsb2NrKSBpbnRvIGFcbiAqIGB0cy5Ob25FbWl0dGVkU3RhdGVtZW50YCB3aXRoIGB0cy5TeW50aGVzaXplZENvbW1lbnRgcy5cbiAqXG4gKiBBIERldGFjaGVkIGxlYWRpbmcgY29tbWVudCBpcyB0aGUgZmlyc3QgY29tbWVudCBpbiBhIFNvdXJjZUZpbGUgLyBCbG9ja1xuICogdGhhdCBpcyBzZXBhcmF0ZWQgd2l0aCBhIG5ld2xpbmUgZnJvbSB0aGUgZmlyc3Qgc3RhdGVtZW50LlxuICpcbiAqIE5vdGU6IFRoaXMgd291bGQgYmUgZ3JlYXRseSBzaW1wbGlmaWVkIHdpdGggaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzYxNS5cbiAqL1xuZnVuY3Rpb24gc3ludGhlc2l6ZURldGFjaGVkTGVhZGluZ0NvbW1lbnRzKFxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIG5vZGU6IHRzLk5vZGUsIHN0YXRlbWVudHM6IHRzLk5vZGVBcnJheTx0cy5TdGF0ZW1lbnQ+KTpcbiAgICB7Y29tbWVudFN0bXQ6IHRzLlN0YXRlbWVudHxudWxsLCBsYXN0Q29tbWVudEVuZDogbnVtYmVyfSB7XG4gIGxldCB0cml2aWFFbmQgPSBzdGF0ZW1lbnRzLmVuZDtcbiAgaWYgKHN0YXRlbWVudHMubGVuZ3RoKSB7XG4gICAgdHJpdmlhRW5kID0gc3RhdGVtZW50c1swXS5nZXRTdGFydCgpO1xuICB9XG4gIGNvbnN0IGRldGFjaGVkQ29tbWVudHMgPSBnZXREZXRhY2hlZExlYWRpbmdDb21tZW50UmFuZ2VzKHNvdXJjZUZpbGUsIHN0YXRlbWVudHMucG9zLCB0cml2aWFFbmQpO1xuICBpZiAoIWRldGFjaGVkQ29tbWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtjb21tZW50U3RtdDogbnVsbCwgbGFzdENvbW1lbnRFbmQ6IC0xfTtcbiAgfVxuICBjb25zdCBsYXN0Q29tbWVudEVuZCA9IGRldGFjaGVkQ29tbWVudHNbZGV0YWNoZWRDb21tZW50cy5sZW5ndGggLSAxXS5lbmQ7XG4gIGNvbnN0IGNvbW1lbnRTdG10ID0gY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudChzb3VyY2VGaWxlKTtcbiAgdHMuc2V0U3ludGhldGljVHJhaWxpbmdDb21tZW50cyhcbiAgICAgIGNvbW1lbnRTdG10LCBzeW50aGVzaXplQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLCBkZXRhY2hlZENvbW1lbnRzKSk7XG4gIHJldHVybiB7Y29tbWVudFN0bXQsIGxhc3RDb21tZW50RW5kfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IHRyYWlsaW5nIGRldGFjaGVkIGNvbW1lbnQgcmFuZ2VzIG9mIHN0YXRlbWVudCBhcnJheXNcbiAqIChlLmcuIHRoZSBzdGF0ZW1lbnRzIG9mIGEgdHMuU291cmNlRmlsZSBvciB0cy5CbG9jaykgaW50byBhXG4gKiBgdHMuTm9uRW1pdHRlZFN0YXRlbWVudGAgd2l0aCBgdHMuU3ludGhlc2l6ZWRDb21tZW50YHMuXG4gKlxuICogQSBEZXRhY2hlZCB0cmFpbGluZyBjb21tZW50IGFyZSBhbGwgY29tbWVudHMgYWZ0ZXIgdGhlIGZpcnN0IG5ld2xpbmVcbiAqIHRoZSBmb2xsb3dzIHRoZSBsYXN0IHN0YXRlbWVudCBpbiBhIFNvdXJjZUZpbGUgLyBCbG9jay5cbiAqXG4gKiBOb3RlOiBUaGlzIHdvdWxkIGJlIGdyZWF0bHkgc2ltcGxpZmllZCB3aXRoIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMTc2MTUuXG4gKi9cbmZ1bmN0aW9uIHN5bnRoZXNpemVEZXRhY2hlZFRyYWlsaW5nQ29tbWVudHMoXG4gICAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgbm9kZTogdHMuTm9kZSwgc3RhdGVtZW50czogdHMuTm9kZUFycmF5PHRzLlN0YXRlbWVudD4pOlxuICAgIHtjb21tZW50U3RtdDogdHMuU3RhdGVtZW50fG51bGwsIGxhc3RDb21tZW50RW5kOiBudW1iZXJ9IHtcbiAgbGV0IHRyYWlsaW5nQ29tbWVudFN0YXJ0ID0gc3RhdGVtZW50cy5lbmQ7XG4gIGlmIChzdGF0ZW1lbnRzLmxlbmd0aCkge1xuICAgIGNvbnN0IGxhc3RTdG10ID0gc3RhdGVtZW50c1tzdGF0ZW1lbnRzLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IGxhc3RTdG10VHJhaWxpbmdDb21tZW50cyA9IHRzLmdldFRyYWlsaW5nQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLnRleHQsIGxhc3RTdG10LmVuZCk7XG4gICAgaWYgKGxhc3RTdG10VHJhaWxpbmdDb21tZW50cyAmJiBsYXN0U3RtdFRyYWlsaW5nQ29tbWVudHMubGVuZ3RoKSB7XG4gICAgICB0cmFpbGluZ0NvbW1lbnRTdGFydCA9IGxhc3RTdG10VHJhaWxpbmdDb21tZW50c1tsYXN0U3RtdFRyYWlsaW5nQ29tbWVudHMubGVuZ3RoIC0gMV0uZW5kO1xuICAgIH1cbiAgfVxuICBjb25zdCBkZXRhY2hlZENvbW1lbnRzID0gZ2V0QWxsTGVhZGluZ0NvbW1lbnRSYW5nZXMoc291cmNlRmlsZSwgdHJhaWxpbmdDb21tZW50U3RhcnQsIG5vZGUuZW5kKTtcbiAgaWYgKCFkZXRhY2hlZENvbW1lbnRzIHx8ICFkZXRhY2hlZENvbW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiB7Y29tbWVudFN0bXQ6IG51bGwsIGxhc3RDb21tZW50RW5kOiAtMX07XG4gIH1cbiAgY29uc3QgbGFzdENvbW1lbnRFbmQgPSBkZXRhY2hlZENvbW1lbnRzW2RldGFjaGVkQ29tbWVudHMubGVuZ3RoIC0gMV0uZW5kO1xuICBjb25zdCBjb21tZW50U3RtdCA9IGNyZWF0ZU5vdEVtaXR0ZWRTdGF0ZW1lbnQoc291cmNlRmlsZSk7XG4gIHRzLnNldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhcbiAgICAgIGNvbW1lbnRTdG10LCBzeW50aGVzaXplQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLCBkZXRhY2hlZENvbW1lbnRzKSk7XG4gIHJldHVybiB7Y29tbWVudFN0bXQsIGxhc3RDb21tZW50RW5kfTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSB0aGUgZGV0YWNoZWQgbGVhZGluZyBjb21tZW50IHJhbmdlcyBpbiBhbiBhcmVhIG9mIGEgU291cmNlRmlsZS5cbiAqIEBwYXJhbSBzb3VyY2VGaWxlIFRoZSBzb3VyY2UgZmlsZVxuICogQHBhcmFtIHN0YXJ0IFdoZXJlIHRvIHN0YXJ0IHNjYW5uaW5nXG4gKiBAcGFyYW0gZW5kIFdoZXJlIHRvIGVuZCBzY2FubmluZ1xuICovXG4vLyBOb3RlOiBUaGlzIGNvZGUgaXMgYmFzZWQgb24gY29tcGlsZXIvY29tbWVudHMudHMgaW4gVHlwZVNjcmlwdFxuZnVuY3Rpb24gZ2V0RGV0YWNoZWRMZWFkaW5nQ29tbWVudFJhbmdlcyhcbiAgICBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IHRzLkNvbW1lbnRSYW5nZVtdIHtcbiAgY29uc3QgbGVhZGluZ0NvbW1lbnRzID0gZ2V0QWxsTGVhZGluZ0NvbW1lbnRSYW5nZXMoc291cmNlRmlsZSwgc3RhcnQsIGVuZCk7XG4gIGlmICghbGVhZGluZ0NvbW1lbnRzIHx8ICFsZWFkaW5nQ29tbWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IGRldGFjaGVkQ29tbWVudHM6IHRzLkNvbW1lbnRSYW5nZVtdID0gW107XG4gIGxldCBsYXN0Q29tbWVudDogdHMuQ29tbWVudFJhbmdlfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBmb3IgKGNvbnN0IGNvbW1lbnQgb2YgbGVhZGluZ0NvbW1lbnRzKSB7XG4gICAgaWYgKGxhc3RDb21tZW50KSB7XG4gICAgICBjb25zdCBsYXN0Q29tbWVudExpbmUgPSBnZXRMaW5lT2ZQb3Moc291cmNlRmlsZSwgbGFzdENvbW1lbnQuZW5kKTtcbiAgICAgIGNvbnN0IGNvbW1lbnRMaW5lID0gZ2V0TGluZU9mUG9zKHNvdXJjZUZpbGUsIGNvbW1lbnQucG9zKTtcblxuICAgICAgaWYgKGNvbW1lbnRMaW5lID49IGxhc3RDb21tZW50TGluZSArIDIpIHtcbiAgICAgICAgLy8gVGhlcmUgd2FzIGEgYmxhbmsgbGluZSBiZXR3ZWVuIHRoZSBsYXN0IGNvbW1lbnQgYW5kIHRoaXMgY29tbWVudC4gIFRoaXNcbiAgICAgICAgLy8gY29tbWVudCBpcyBub3QgcGFydCBvZiB0aGUgY29weXJpZ2h0IGNvbW1lbnRzLiAgUmV0dXJuIHdoYXQgd2UgaGF2ZSBzb1xuICAgICAgICAvLyBmYXIuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRldGFjaGVkQ29tbWVudHMucHVzaChjb21tZW50KTtcbiAgICBsYXN0Q29tbWVudCA9IGNvbW1lbnQ7XG4gIH1cblxuICBpZiAoZGV0YWNoZWRDb21tZW50cy5sZW5ndGgpIHtcbiAgICAvLyBBbGwgY29tbWVudHMgbG9vayBsaWtlIHRoZXkgY291bGQgaGF2ZSBiZWVuIHBhcnQgb2YgdGhlIGNvcHlyaWdodCBoZWFkZXIuICBNYWtlXG4gICAgLy8gc3VyZSB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgYmxhbmsgbGluZSBiZXR3ZWVuIGl0IGFuZCB0aGUgbm9kZS4gIElmIG5vdCwgaXQncyBub3RcbiAgICAvLyBhIGNvcHlyaWdodCBoZWFkZXIuXG4gICAgY29uc3QgbGFzdENvbW1lbnRMaW5lID1cbiAgICAgICAgZ2V0TGluZU9mUG9zKHNvdXJjZUZpbGUsIGRldGFjaGVkQ29tbWVudHNbZGV0YWNoZWRDb21tZW50cy5sZW5ndGggLSAxXS5lbmQpO1xuICAgIGNvbnN0IG5vZGVMaW5lID0gZ2V0TGluZU9mUG9zKHNvdXJjZUZpbGUsIGVuZCk7XG4gICAgaWYgKG5vZGVMaW5lID49IGxhc3RDb21tZW50TGluZSArIDIpIHtcbiAgICAgIC8vIFZhbGlkIGRldGFjaGVkQ29tbWVudHNcbiAgICAgIHJldHVybiBkZXRhY2hlZENvbW1lbnRzO1xuICAgIH1cbiAgfVxuICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIGdldExpbmVPZlBvcyhzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBwb3M6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiB0cy5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihzb3VyY2VGaWxlLCBwb3MpLmxpbmU7XG59XG5cbi8qKlxuICogdHMuY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudCB3aWxsIGNyZWF0ZSBhIG5vZGUgd2hvc2UgY29tbWVudHMgYXJlIG5ldmVyIGVtaXR0ZWQgZXhjZXB0IGZvciB2ZXJ5XG4gKiBzcGVjaWZpYyBzcGVjaWFsIGNhc2VzICgvLy8gY29tbWVudHMpLiBjcmVhdGVOb3RFbWl0dGVkU3RhdGVtZW50V2l0aENvbW1lbnRzIGNyZWF0ZXMgYSBub3RcbiAqIGVtaXR0ZWQgc3RhdGVtZW50IGFuZCBhZGRzIGNvbW1lbnQgcmFuZ2VzIGZyb20gdGhlIG9yaWdpbmFsIHN0YXRlbWVudCBhcyBzeW50aGV0aWMgY29tbWVudHMgdG9cbiAqIGl0LCBzbyB0aGF0IHRoZXkgZ2V0IHJldGFpbmVkIGluIHRoZSBvdXRwdXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOb3RFbWl0dGVkU3RhdGVtZW50V2l0aENvbW1lbnRzKFxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIG9yaWdpbmFsOiB0cy5Ob2RlKTogdHMuU3RhdGVtZW50IHtcbiAgbGV0IHJlcGxhY2VtZW50ID0gdHMuY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudChvcmlnaW5hbCk7XG4gIC8vIE5COiBzeW50aGV0aWMgbm9kZXMgY2FuIGhhdmUgcG9zL2VuZCA9PSAtMS4gVGhpcyBpcyBoYW5kbGVkIGJ5IHRoZSB1bmRlcmx5aW5nIGltcGxlbWVudGF0aW9uLlxuICBjb25zdCBsZWFkaW5nID0gdHMuZ2V0TGVhZGluZ0NvbW1lbnRSYW5nZXMoc291cmNlRmlsZS50ZXh0LCBvcmlnaW5hbC5wb3MpIHx8IFtdO1xuICBjb25zdCB0cmFpbGluZyA9IHRzLmdldFRyYWlsaW5nQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLnRleHQsIG9yaWdpbmFsLmVuZCkgfHwgW107XG4gIHJlcGxhY2VtZW50ID1cbiAgICAgIHRzLnNldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhyZXBsYWNlbWVudCwgc3ludGhlc2l6ZUNvbW1lbnRSYW5nZXMoc291cmNlRmlsZSwgbGVhZGluZykpO1xuICByZXBsYWNlbWVudCA9XG4gICAgICB0cy5zZXRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnRzKHJlcGxhY2VtZW50LCBzeW50aGVzaXplQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLCB0cmFpbGluZykpO1xuICByZXR1cm4gcmVwbGFjZW1lbnQ7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHRzLkNvbW1lbnRSYW5nZWBzIGludG8gYHRzLlN5bnRoZXNpemVkQ29tbWVudGBzXG4gKiBAcGFyYW0gc291cmNlRmlsZVxuICogQHBhcmFtIHBhcnNlZENvbW1lbnRzXG4gKi9cbmZ1bmN0aW9uIHN5bnRoZXNpemVDb21tZW50UmFuZ2VzKFxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHBhcnNlZENvbW1lbnRzOiB0cy5Db21tZW50UmFuZ2VbXSk6IHRzLlN5bnRoZXNpemVkQ29tbWVudFtdIHtcbiAgY29uc3Qgc3ludGhlc2l6ZWRDb21tZW50czogdHMuU3ludGhlc2l6ZWRDb21tZW50W10gPSBbXTtcbiAgcGFyc2VkQ29tbWVudHMuZm9yRWFjaCgoe2tpbmQsIHBvcywgZW5kLCBoYXNUcmFpbGluZ05ld0xpbmV9LCBjb21tZW50SWR4KSA9PiB7XG4gICAgbGV0IGNvbW1lbnRUZXh0ID0gc291cmNlRmlsZS50ZXh0LnN1YnN0cmluZyhwb3MsIGVuZCkudHJpbSgpO1xuICAgIGlmIChraW5kID09PSB0cy5TeW50YXhLaW5kLk11bHRpTGluZUNvbW1lbnRUcml2aWEpIHtcbiAgICAgIGNvbW1lbnRUZXh0ID0gY29tbWVudFRleHQucmVwbGFjZSgvKF5cXC9cXCopfChcXCpcXC8kKS9nLCAnJyk7XG4gICAgfSBlbHNlIGlmIChraW5kID09PSB0cy5TeW50YXhLaW5kLlNpbmdsZUxpbmVDb21tZW50VHJpdmlhKSB7XG4gICAgICBpZiAoY29tbWVudFRleHQuc3RhcnRzV2l0aCgnLy8vJykpIHtcbiAgICAgICAgLy8gdHJpcHBsZS1zbGFzaCBjb21tZW50cyBhcmUgdHlwZXNjcmlwdCBzcGVjaWZpYywgaWdub3JlIHRoZW0gaW4gdGhlIG91dHB1dC5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29tbWVudFRleHQgPSBjb21tZW50VGV4dC5yZXBsYWNlKC8oXlxcL1xcLykvZywgJycpO1xuICAgIH1cbiAgICBzeW50aGVzaXplZENvbW1lbnRzLnB1c2goe2tpbmQsIHRleHQ6IGNvbW1lbnRUZXh0LCBoYXNUcmFpbGluZ05ld0xpbmUsIHBvczogLTEsIGVuZDogLTF9KTtcbiAgfSk7XG4gIHJldHVybiBzeW50aGVzaXplZENvbW1lbnRzO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBub24gZW1pdHRlZCBzdGF0ZW1lbnQgdGhhdCBjYW4gYmUgdXNlZCB0byBzdG9yZSBzeW50aGVzaXplZCBjb21tZW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU5vdEVtaXR0ZWRTdGF0ZW1lbnQoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IHRzLk5vdEVtaXR0ZWRTdGF0ZW1lbnQge1xuICBjb25zdCBzdG10ID0gdHMuY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudChzb3VyY2VGaWxlKTtcbiAgdHMuc2V0T3JpZ2luYWxOb2RlKHN0bXQsIHVuZGVmaW5lZCk7XG4gIHRzLnNldFRleHRSYW5nZShzdG10LCB7cG9zOiAwLCBlbmQ6IDB9KTtcbiAgdHMuc2V0RW1pdEZsYWdzKHN0bXQsIHRzLkVtaXRGbGFncy5DdXN0b21Qcm9sb2d1ZSk7XG4gIHJldHVybiBzdG10O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGxlYWRpbmcgY29tbWVudCByYW5nZXMgaW4gdGhlIHNvdXJjZSBmaWxlIHRoYXQgc3RhcnQgYXQgdGhlIGdpdmVuIHBvc2l0aW9uLlxuICogVGhpcyBpcyB0aGUgc2FtZSBhcyBgdHMuZ2V0TGVhZGluZ0NvbW1lbnRSYW5nZXNgLCBleGNlcHQgdGhhdCBpdCBkb2VzIG5vdCBza2lwXG4gKiBjb21tZW50cyBiZWZvcmUgdGhlIGZpcnN0IG5ld2xpbmUgaW4gdGhlIHJhbmdlLlxuICpcbiAqIEBwYXJhbSBzb3VyY2VGaWxlXG4gKiBAcGFyYW0gc3RhcnQgV2hlcmUgdG8gc3RhcnQgc2Nhbm5pbmdcbiAqIEBwYXJhbSBlbmQgV2hlcmUgdG8gZW5kIHNjYW5uaW5nXG4gKi9cbmZ1bmN0aW9uIGdldEFsbExlYWRpbmdDb21tZW50UmFuZ2VzKFxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogdHMuQ29tbWVudFJhbmdlW10ge1xuICAvLyBleGV1dGUgdHMuZ2V0TGVhZGluZ0NvbW1lbnRSYW5nZXMgd2l0aCBwb3MgPSAwIHNvIHRoYXQgaXQgZG9lcyBub3Qgc2tpcFxuICAvLyBjb21tZW50cyB1bnRpbCB0aGUgZmlyc3QgbmV3bGluZS5cbiAgY29uc3QgY29tbWVudFJhbmdlcyA9IHRzLmdldExlYWRpbmdDb21tZW50UmFuZ2VzKHNvdXJjZUZpbGUudGV4dC5zdWJzdHJpbmcoc3RhcnQsIGVuZCksIDApIHx8IFtdO1xuICByZXR1cm4gY29tbWVudFJhbmdlcy5tYXAoY3IgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzVHJhaWxpbmdOZXdMaW5lOiBjci5oYXNUcmFpbGluZ05ld0xpbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IGNyLmtpbmQgYXMgbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3M6IGNyLnBvcyArIHN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQ6IGNyLmVuZCArIHN0YXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG59XG5cbi8qKlxuICogVGhpcyBpcyBhIHZlcnNpb24gb2YgYHRzLnZpc2l0RWFjaENoaWxkYCB0aGF0IHdvcmtzIHRoYXQgY2FsbHMgb3VyIHZlcnNpb25cbiAqIG9mIGB1cGRhdGVTb3VyY2VGaWxlTm9kZWAsIHNvIHRoYXQgdHlwZXNjcmlwdCBkb2Vzbid0IGxvc2UgdHlwZSBpbmZvcm1hdGlvblxuICogZm9yIHByb3BlcnR5IGRlY29yYXRvcnMuXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzM4NFxuICpcbiAqIEBwYXJhbSBzZlxuICogQHBhcmFtIHN0YXRlbWVudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0RWFjaENoaWxkKFxuICAgIG5vZGU6IHRzLk5vZGUsIHZpc2l0b3I6IHRzLlZpc2l0b3IsIGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6IHRzLk5vZGUge1xuICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlNvdXJjZUZpbGUpIHtcbiAgICBjb25zdCBzZiA9IG5vZGUgYXMgdHMuU291cmNlRmlsZTtcbiAgICByZXR1cm4gdXBkYXRlU291cmNlRmlsZU5vZGUoc2YsIHRzLnZpc2l0TGV4aWNhbEVudmlyb25tZW50KHNmLnN0YXRlbWVudHMsIHZpc2l0b3IsIGNvbnRleHQpKTtcbiAgfVxuXG4gIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChub2RlLCB2aXNpdG9yLCBjb250ZXh0KTtcbn1cblxuLyoqXG4gKiBUaGlzIGlzIGEgdmVyc2lvbiBvZiBgdHMudXBkYXRlU291cmNlRmlsZU5vZGVgIHRoYXQgd29ya3NcbiAqIHdlbGwgd2l0aCBwcm9wZXJ0eSBkZWNvcmF0b3JzLlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMTczODRcbiAqIFRPRE8oIzYzNCk6IFRoaXMgaGFzIGJlZW4gZml4ZWQgaW4gVFMgMi41LiBJbnZlc3RpZ2F0ZSByZW1vdmFsLlxuICpcbiAqIEBwYXJhbSBzZlxuICogQHBhcmFtIHN0YXRlbWVudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNvdXJjZUZpbGVOb2RlKFxuICAgIHNmOiB0cy5Tb3VyY2VGaWxlLCBzdGF0ZW1lbnRzOiB0cy5Ob2RlQXJyYXk8dHMuU3RhdGVtZW50Pik6IHRzLlNvdXJjZUZpbGUge1xuICBpZiAoc3RhdGVtZW50cyA9PT0gc2Yuc3RhdGVtZW50cykge1xuICAgIHJldHVybiBzZjtcbiAgfVxuICAvLyBOb3RlOiBOZWVkIHRvIGNsb25lIHRoZSBvcmlnaW5hbCBmaWxlIChhbmQgbm90IHVzZSBgdHMudXBkYXRlU291cmNlRmlsZU5vZGVgKVxuICAvLyBhcyBvdGhlcndpc2UgVFMgZmFpbHMgd2hlbiByZXNvbHZpbmcgdHlwZXMgZm9yIGRlY29yYXRvcnMuXG4gIHNmID0gdHMuZ2V0TXV0YWJsZUNsb25lKHNmKTtcbiAgc2Yuc3RhdGVtZW50cyA9IHN0YXRlbWVudHM7XG4gIHJldHVybiBzZjtcbn1cblxuLy8gQ29waWVkIGZyb20gVHlwZVNjcmlwdFxuZXhwb3J0IGZ1bmN0aW9uIGlzVHlwZU5vZGVLaW5kKGtpbmQ6IHRzLlN5bnRheEtpbmQpIHtcbiAgcmV0dXJuIChraW5kID49IHRzLlN5bnRheEtpbmQuRmlyc3RUeXBlTm9kZSAmJiBraW5kIDw9IHRzLlN5bnRheEtpbmQuTGFzdFR5cGVOb2RlKSB8fFxuICAgICAga2luZCA9PT0gdHMuU3ludGF4S2luZC5BbnlLZXl3b3JkIHx8IGtpbmQgPT09IHRzLlN5bnRheEtpbmQuTnVtYmVyS2V5d29yZCB8fFxuICAgICAga2luZCA9PT0gdHMuU3ludGF4S2luZC5PYmplY3RLZXl3b3JkIHx8IGtpbmQgPT09IHRzLlN5bnRheEtpbmQuQm9vbGVhbktleXdvcmQgfHxcbiAgICAgIGtpbmQgPT09IHRzLlN5bnRheEtpbmQuU3RyaW5nS2V5d29yZCB8fCBraW5kID09PSB0cy5TeW50YXhLaW5kLlN5bWJvbEtleXdvcmQgfHxcbiAgICAgIGtpbmQgPT09IHRzLlN5bnRheEtpbmQuVGhpc0tleXdvcmQgfHwga2luZCA9PT0gdHMuU3ludGF4S2luZC5Wb2lkS2V5d29yZCB8fFxuICAgICAga2luZCA9PT0gdHMuU3ludGF4S2luZC5VbmRlZmluZWRLZXl3b3JkIHx8IGtpbmQgPT09IHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQgfHxcbiAgICAgIGtpbmQgPT09IHRzLlN5bnRheEtpbmQuTmV2ZXJLZXl3b3JkIHx8IGtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXhwcmVzc2lvbldpdGhUeXBlQXJndW1lbnRzO1xufVxuIl19