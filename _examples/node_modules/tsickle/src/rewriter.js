/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
        define("tsickle/src/rewriter", ["require", "exports", "tsickle/src/fileoverview_comment_transformer", "tsickle/src/source_map_utils", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fileoverview_comment_transformer_1 = require("tsickle/src/fileoverview_comment_transformer");
    var source_map_utils_1 = require("tsickle/src/source_map_utils");
    var ts = require("tsickle/src/typescript");
    /**
     * A Rewriter manages iterating through a ts.SourceFile, copying input
     * to output while letting the subclass potentially alter some nodes
     * along the way by implementing maybeProcess().
     */
    var Rewriter = /** @class */ (function () {
        function Rewriter(file, sourceMapper) {
            if (sourceMapper === void 0) { sourceMapper = source_map_utils_1.NOOP_SOURCE_MAPPER; }
            this.file = file;
            this.sourceMapper = sourceMapper;
            this.output = [];
            /** Errors found while examining the code. */
            this.diagnostics = [];
            /** Current position in the output. */
            this.position = { line: 0, column: 0, position: 0 };
            /**
             * The current level of recursion through TypeScript Nodes.  Used in formatting internal debug
             * print statements.
             */
            this.indent = 0;
            /**
             * Skip emitting any code before the given offset. E.g. used to avoid emitting @fileoverview
             * comments twice.
             */
            this.skipCommentsUpToOffset = -1;
        }
        Rewriter.prototype.getOutput = function (prefix) {
            if (this.indent !== 0) {
                throw new Error('visit() failed to track nesting');
            }
            var out = this.output.join('');
            if (prefix) {
                // Insert prefix after any leading @fileoverview comments, so they still come first in the
                // file. This must not use file.getStart() (comment position in the input file), but rahter
                // check comments in the new output, as those (in particular for comments) are unrelated.
                var insertionIdx = 0;
                try {
                    for (var _a = __values(ts.getLeadingCommentRanges(out, 0) || []), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var cr = _b.value;
                        if (fileoverview_comment_transformer_1.isClosureFileoverviewComment(out.substring(cr.pos, cr.end))) {
                            insertionIdx = cr.end;
                            // Include space (in particular line breaks) after a @fileoverview comment; without the
                            // space seperating it, TypeScript might elide the emit.
                            while (insertionIdx < out.length && out[insertionIdx].match(/\s/))
                                insertionIdx++;
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
                out = out.substring(0, insertionIdx) + prefix + out.substring(insertionIdx);
                this.sourceMapper.shiftByOffset(prefix.length);
            }
            return {
                output: out,
                diagnostics: this.diagnostics,
            };
            var e_1, _c;
        };
        /**
         * visit traverses a Node, recursively writing all nodes not handled by this.maybeProcess.
         */
        Rewriter.prototype.visit = function (node) {
            // this.logWithIndent('node: ' + ts.SyntaxKind[node.kind]);
            this.indent++;
            try {
                if (!this.maybeProcess(node)) {
                    this.writeNode(node);
                }
            }
            catch (e) {
                if (!e.message)
                    e.message = 'Unhandled error in tsickle';
                e.message += "\n at " + ts.SyntaxKind[node.kind] + " in " + this.file.fileName + ":";
                var _a = this.file.getLineAndCharacterOfPosition(node.getStart()), line = _a.line, character = _a.character;
                e.message += line + 1 + ":" + (character + 1);
                throw e;
            }
            this.indent--;
        };
        /**
         * maybeProcess lets subclasses optionally processes a node.
         *
         * @return True if the node has been handled and doesn't need to be traversed;
         *    false to have the node written and its children recursively visited.
         */
        Rewriter.prototype.maybeProcess = function (node) {
            return false;
        };
        /** writeNode writes a ts.Node, calling this.visit() on its children. */
        Rewriter.prototype.writeNode = function (node, skipComments, newLineIfCommentsStripped) {
            if (skipComments === void 0) { skipComments = false; }
            if (newLineIfCommentsStripped === void 0) { newLineIfCommentsStripped = true; }
            var pos = node.getFullStart();
            if (skipComments) {
                // To skip comments, we skip all whitespace/comments preceding
                // the node.  But if there was anything skipped we should emit
                // a newline in its place so that the node remains separated
                // from the previous node.  TODO: don't skip anything here if
                // there wasn't any comment.
                if (newLineIfCommentsStripped && node.getFullStart() < node.getStart()) {
                    this.emit('\n');
                }
                pos = node.getStart();
            }
            this.writeNodeFrom(node, pos);
        };
        Rewriter.prototype.writeNodeFrom = function (node, pos, end) {
            var _this = this;
            if (end === void 0) { end = node.getEnd(); }
            if (end <= this.skipCommentsUpToOffset) {
                return;
            }
            var oldSkipCommentsUpToOffset = this.skipCommentsUpToOffset;
            this.skipCommentsUpToOffset = Math.max(this.skipCommentsUpToOffset, pos);
            ts.forEachChild(node, function (child) {
                _this.writeRange(node, pos, child.getFullStart());
                _this.visit(child);
                pos = child.getEnd();
            });
            this.writeRange(node, pos, end);
            this.skipCommentsUpToOffset = oldSkipCommentsUpToOffset;
        };
        /**
         * Writes all leading trivia (whitespace or comments) on node, or all trivia up to the given
         * position. Also marks those trivia as "already emitted" by shifting the skipCommentsUpTo marker.
         */
        Rewriter.prototype.writeLeadingTrivia = function (node, upTo) {
            if (upTo === void 0) { upTo = 0; }
            var upToOffset = upTo || node.getStart();
            this.writeRange(node, node.getFullStart(), upTo || node.getStart());
            this.skipCommentsUpToOffset = upToOffset;
        };
        Rewriter.prototype.addSourceMapping = function (node) {
            this.writeRange(node, node.getEnd(), node.getEnd());
        };
        /**
         * Write a span of the input file as expressed by absolute offsets.
         * These offsets are found in attributes like node.getFullStart() and
         * node.getEnd().
         */
        Rewriter.prototype.writeRange = function (node, from, to) {
            var fullStart = node.getFullStart();
            var textStart = node.getStart();
            if (from >= fullStart && from < textStart) {
                from = Math.max(from, this.skipCommentsUpToOffset);
            }
            // Add a source mapping. writeRange(from, to) always corresponds to
            // original source code, so add a mapping at the current location that
            // points back to the location at `from`. The additional code generated
            // by tsickle will then be considered part of the last mapped code
            // section preceding it. That's arguably incorrect (e.g. for the fake
            // methods defining properties), but is good enough for stack traces.
            var pos = this.file.getLineAndCharacterOfPosition(from);
            this.sourceMapper.addMapping(node, { line: pos.line, column: pos.character, position: from }, this.position, to - from);
            // getSourceFile().getText() is wrong here because it has the text of
            // the SourceFile node of the AST, which doesn't contain the comments
            // preceding that node.  Semantically these ranges are just offsets
            // into the original source file text, so slice from that.
            var text = this.file.text.slice(from, to);
            if (text) {
                this.emit(text);
            }
        };
        Rewriter.prototype.emit = function (str) {
            this.output.push(str);
            try {
                for (var str_1 = __values(str), str_1_1 = str_1.next(); !str_1_1.done; str_1_1 = str_1.next()) {
                    var c = str_1_1.value;
                    this.position.column++;
                    if (c === '\n') {
                        this.position.line++;
                        this.position.column = 0;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (str_1_1 && !str_1_1.done && (_a = str_1.return)) _a.call(str_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            this.position.position += str.length;
            var e_2, _a;
        };
        /** Removes comment metacharacters from a string, to make it safe to embed in a comment. */
        Rewriter.prototype.escapeForComment = function (str) {
            return str.replace(/\/\*/g, '__').replace(/\*\//g, '__');
        };
        /* tslint:disable: no-unused-variable */
        Rewriter.prototype.logWithIndent = function (message) {
            /* tslint:enable: no-unused-variable */
            var prefix = new Array(this.indent + 1).join('| ');
            console.log(prefix + message);
        };
        /**
         * Produces a compiler error that references the Node's kind.  This is useful for the "else"
         * branch of code that is attempting to handle all possible input Node types, to ensure all cases
         * covered.
         */
        Rewriter.prototype.errorUnimplementedKind = function (node, where) {
            this.error(node, ts.SyntaxKind[node.kind] + " not implemented in " + where);
        };
        Rewriter.prototype.error = function (node, messageText) {
            this.diagnostics.push({
                file: node.getSourceFile(),
                start: node.getStart(),
                length: node.getEnd() - node.getStart(),
                messageText: messageText,
                category: ts.DiagnosticCategory.Error,
                code: 0,
            });
        };
        return Rewriter;
    }());
    exports.Rewriter = Rewriter;
    /** Returns the string contents of a ts.Identifier. */
    function getIdentifierText(identifier) {
        // NOTE: the 'text' property on an Identifier may be escaped if it starts
        // with '__', so just use getText().
        return identifier.getText();
    }
    exports.getIdentifierText = getIdentifierText;
    /** Returns a dot-joined qualified name (foo.bar.Baz). */
    function getEntityNameText(name) {
        if (ts.isIdentifier(name)) {
            return getIdentifierText(name);
        }
        return getEntityNameText(name.left) + '.' + getIdentifierText(name.right);
    }
    exports.getEntityNameText = getEntityNameText;
    /**
     * Converts an escaped TypeScript name into the original source name.
     * Prefer getIdentifierText() instead if possible.
     */
    function unescapeName(name) {
        // See the private function unescapeIdentifier in TypeScript's utilities.ts.
        if (name.match(/^___/))
            return name.substr(1);
        return name;
    }
    exports.unescapeName = unescapeName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV3cml0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmV3cml0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRUgsaUdBQWdGO0lBQ2hGLGlFQUFvRjtJQUNwRiwyQ0FBbUM7SUFFbkM7Ozs7T0FJRztJQUNIO1FBaUJFLGtCQUFtQixJQUFtQixFQUFVLFlBQStDO1lBQS9DLDZCQUFBLEVBQUEsZUFBNkIscUNBQWtCO1lBQTVFLFNBQUksR0FBSixJQUFJLENBQWU7WUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBbUM7WUFoQnZGLFdBQU0sR0FBYSxFQUFFLENBQUM7WUFDOUIsNkNBQTZDO1lBQ25DLGdCQUFXLEdBQW9CLEVBQUUsQ0FBQztZQUM1QyxzQ0FBc0M7WUFDOUIsYUFBUSxHQUFtQixFQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFDLENBQUM7WUFDckU7OztlQUdHO1lBQ0ssV0FBTSxHQUFHLENBQUMsQ0FBQztZQUNuQjs7O2VBR0c7WUFDSywyQkFBc0IsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUdwQyxDQUFDO1FBRUQsNEJBQVMsR0FBVCxVQUFVLE1BQWU7WUFDdkIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO2FBQ3BEO1lBQ0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDL0IsSUFBSSxNQUFNLEVBQUU7Z0JBQ1YsMEZBQTBGO2dCQUMxRiwyRkFBMkY7Z0JBQzNGLHlGQUF5RjtnQkFDekYsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDOztvQkFDckIsS0FBaUIsSUFBQSxLQUFBLFNBQUEsRUFBRSxDQUFDLHVC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LG9DQUlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2lzQ2xvc3VyZUZpbGVvdmVydmlld0NvbW1lbnR9IGZyb20gJy4vZmlsZW92ZXJ2aWV3X2NvbW1lbnRfdHJhbnNmb3JtZXInO1xuaW1wb3J0IHtOT09QX1NPVVJDRV9NQVBQRVIsIFNvdXJjZU1hcHBlciwgU291cmNlUG9zaXRpb259IGZyb20gJy4vc291cmNlX21hcF91dGlscyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICcuL3R5cGVzY3JpcHQnO1xuXG4vKipcbiAqIEEgUmV3cml0ZXIgbWFuYWdlcyBpdGVyYXRpbmcgdGhyb3VnaCBhIHRzLlNvdXJjZUZpbGUsIGNvcHlpbmcgaW5wdXRcbiAqIHRvIG91dHB1dCB3aGlsZSBsZXR0aW5nIHRoZSBzdWJjbGFzcyBwb3RlbnRpYWxseSBhbHRlciBzb21lIG5vZGVzXG4gKiBhbG9uZyB0aGUgd2F5IGJ5IGltcGxlbWVudGluZyBtYXliZVByb2Nlc3MoKS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJld3JpdGVyIHtcbiAgcHJpdmF0ZSBvdXRwdXQ6IHN0cmluZ1tdID0gW107XG4gIC8qKiBFcnJvcnMgZm91bmQgd2hpbGUgZXhhbWluaW5nIHRoZSBjb2RlLiAqL1xuICBwcm90ZWN0ZWQgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuICAvKiogQ3VycmVudCBwb3NpdGlvbiBpbiB0aGUgb3V0cHV0LiAqL1xuICBwcml2YXRlIHBvc2l0aW9uOiBTb3VyY2VQb3NpdGlvbiA9IHtsaW5lOiAwLCBjb2x1bW46IDAsIHBvc2l0aW9uOiAwfTtcbiAgLyoqXG4gICAqIFRoZSBjdXJyZW50IGxldmVsIG9mIHJlY3Vyc2lvbiB0aHJvdWdoIFR5cGVTY3JpcHQgTm9kZXMuICBVc2VkIGluIGZvcm1hdHRpbmcgaW50ZXJuYWwgZGVidWdcbiAgICogcHJpbnQgc3RhdGVtZW50cy5cbiAgICovXG4gIHByaXZhdGUgaW5kZW50ID0gMDtcbiAgLyoqXG4gICAqIFNraXAgZW1pdHRpbmcgYW55IGNvZGUgYmVmb3JlIHRoZSBnaXZlbiBvZmZzZXQuIEUuZy4gdXNlZCB0byBhdm9pZCBlbWl0dGluZyBAZmlsZW92ZXJ2aWV3XG4gICAqIGNvbW1lbnRzIHR3aWNlLlxuICAgKi9cbiAgcHJpdmF0ZSBza2lwQ29tbWVudHNVcFRvT2Zmc2V0ID0gLTE7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGZpbGU6IHRzLlNvdXJjZUZpbGUsIHByaXZhdGUgc291cmNlTWFwcGVyOiBTb3VyY2VNYXBwZXIgPSBOT09QX1NPVVJDRV9NQVBQRVIpIHtcbiAgfVxuXG4gIGdldE91dHB1dChwcmVmaXg/OiBzdHJpbmcpOiB7b3V0cHV0OiBzdHJpbmcsIGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW119IHtcbiAgICBpZiAodGhpcy5pbmRlbnQgIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndmlzaXQoKSBmYWlsZWQgdG8gdHJhY2sgbmVzdGluZycpO1xuICAgIH1cbiAgICBsZXQgb3V0ID0gdGhpcy5vdXRwdXQuam9pbignJyk7XG4gICAgaWYgKHByZWZpeCkge1xuICAgICAgLy8gSW5zZXJ0IHByZWZpeCBhZnRlciBhbnkgbGVhZGluZyBAZmlsZW92ZXJ2aWV3IGNvbW1lbnRzLCBzbyB0aGV5IHN0aWxsIGNvbWUgZmlyc3QgaW4gdGhlXG4gICAgICAvLyBmaWxlLiBUaGlzIG11c3Qgbm90IHVzZSBmaWxlLmdldFN0YXJ0KCkgKGNvbW1lbnQgcG9zaXRpb24gaW4gdGhlIGlucHV0IGZpbGUpLCBidXQgcmFodGVyXG4gICAgICAvLyBjaGVjayBjb21tZW50cyBpbiB0aGUgbmV3IG91dHB1dCwgYXMgdGhvc2UgKGluIHBhcnRpY3VsYXIgZm9yIGNvbW1lbnRzKSBhcmUgdW5yZWxhdGVkLlxuICAgICAgbGV0IGluc2VydGlvbklkeCA9IDA7XG4gICAgICBmb3IgKGNvbnN0IGNyIG9mIHRzLmdldExlYWRpbmdDb21tZW50UmFuZ2VzKG91dCwgMCkgfHwgW10pIHtcbiAgICAgICAgaWYgKGlzQ2xvc3VyZUZpbGVvdmVydmlld0NvbW1lbnQob3V0LnN1YnN0cmluZyhjci5wb3MsIGNyLmVuZCkpKSB7XG4gICAgICAgICAgaW5zZXJ0aW9uSWR4ID0gY3IuZW5kO1xuICAgICAgICAgIC8vIEluY2x1ZGUgc3BhY2UgKGluIHBhcnRpY3VsYXIgbGluZSBicmVha3MpIGFmdGVyIGEgQGZpbGVvdmVydmlldyBjb21tZW50OyB3aXRob3V0IHRoZVxuICAgICAgICAgIC8vIHNwYWNlIHNlcGVyYXRpbmcgaXQsIFR5cGVTY3JpcHQgbWlnaHQgZWxpZGUgdGhlIGVtaXQuXG4gICAgICAgICAgd2hpbGUgKGluc2VydGlvbklkeCA8IG91dC5sZW5ndGggJiYgb3V0W2luc2VydGlvbklkeF0ubWF0Y2goL1xccy8pKSBpbnNlcnRpb25JZHgrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgb3V0ID0gb3V0LnN1YnN0cmluZygwLCBpbnNlcnRpb25JZHgpICsgcHJlZml4ICsgb3V0LnN1YnN0cmluZyhpbnNlcnRpb25JZHgpO1xuICAgICAgdGhpcy5zb3VyY2VNYXBwZXIuc2hpZnRCeU9mZnNldChwcmVmaXgubGVuZ3RoKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIG91dHB1dDogb3V0LFxuICAgICAgZGlhZ25vc3RpY3M6IHRoaXMuZGlhZ25vc3RpY3MsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiB2aXNpdCB0cmF2ZXJzZXMgYSBOb2RlLCByZWN1cnNpdmVseSB3cml0aW5nIGFsbCBub2RlcyBub3QgaGFuZGxlZCBieSB0aGlzLm1heWJlUHJvY2Vzcy5cbiAgICovXG4gIHZpc2l0KG5vZGU6IHRzLk5vZGUpIHtcbiAgICAvLyB0aGlzLmxvZ1dpdGhJbmRlbnQoJ25vZGU6ICcgKyB0cy5TeW50YXhLaW5kW25vZGUua2luZF0pO1xuICAgIHRoaXMuaW5kZW50Kys7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghdGhpcy5tYXliZVByb2Nlc3Mobm9kZSkpIHtcbiAgICAgICAgdGhpcy53cml0ZU5vZGUobm9kZSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKCFlLm1lc3NhZ2UpIGUubWVzc2FnZSA9ICdVbmhhbmRsZWQgZXJyb3IgaW4gdHNpY2tsZSc7XG4gICAgICBlLm1lc3NhZ2UgKz0gYFxcbiBhdCAke3RzLlN5bnRheEtpbmRbbm9kZS5raW5kXX0gaW4gJHt0aGlzLmZpbGUuZmlsZU5hbWV9OmA7XG4gICAgICBjb25zdCB7bGluZSwgY2hhcmFjdGVyfSA9IHRoaXMuZmlsZS5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihub2RlLmdldFN0YXJ0KCkpO1xuICAgICAgZS5tZXNzYWdlICs9IGAke2xpbmUgKyAxfToke2NoYXJhY3RlciArIDF9YDtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICAgIHRoaXMuaW5kZW50LS07XG4gIH1cblxuICAvKipcbiAgICogbWF5YmVQcm9jZXNzIGxldHMgc3ViY2xhc3NlcyBvcHRpb25hbGx5IHByb2Nlc3NlcyBhIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4gVHJ1ZSBpZiB0aGUgbm9kZSBoYXMgYmVlbiBoYW5kbGVkIGFuZCBkb2Vzbid0IG5lZWQgdG8gYmUgdHJhdmVyc2VkO1xuICAgKiAgICBmYWxzZSB0byBoYXZlIHRoZSBub2RlIHdyaXR0ZW4gYW5kIGl0cyBjaGlsZHJlbiByZWN1cnNpdmVseSB2aXNpdGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIG1heWJlUHJvY2Vzcyhub2RlOiB0cy5Ob2RlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIHdyaXRlTm9kZSB3cml0ZXMgYSB0cy5Ob2RlLCBjYWxsaW5nIHRoaXMudmlzaXQoKSBvbiBpdHMgY2hpbGRyZW4uICovXG4gIHdyaXRlTm9kZShub2RlOiB0cy5Ob2RlLCBza2lwQ29tbWVudHMgPSBmYWxzZSwgbmV3TGluZUlmQ29tbWVudHNTdHJpcHBlZCA9IHRydWUpIHtcbiAgICBsZXQgcG9zID0gbm9kZS5nZXRGdWxsU3RhcnQoKTtcbiAgICBpZiAoc2tpcENvbW1lbnRzKSB7XG4gICAgICAvLyBUbyBza2lwIGNvbW1lbnRzLCB3ZSBza2lwIGFsbCB3aGl0ZXNwYWNlL2NvbW1lbnRzIHByZWNlZGluZ1xuICAgICAgLy8gdGhlIG5vZGUuICBCdXQgaWYgdGhlcmUgd2FzIGFueXRoaW5nIHNraXBwZWQgd2Ugc2hvdWxkIGVtaXRcbiAgICAgIC8vIGEgbmV3bGluZSBpbiBpdHMgcGxhY2Ugc28gdGhhdCB0aGUgbm9kZSByZW1haW5zIHNlcGFyYXRlZFxuICAgICAgLy8gZnJvbSB0aGUgcHJldmlvdXMgbm9kZS4gIFRPRE86IGRvbid0IHNraXAgYW55dGhpbmcgaGVyZSBpZlxuICAgICAgLy8gdGhlcmUgd2Fzbid0IGFueSBjb21tZW50LlxuICAgICAgaWYgKG5ld0xpbmVJZkNvbW1lbnRzU3RyaXBwZWQgJiYgbm9kZS5nZXRGdWxsU3RhcnQoKSA8IG5vZGUuZ2V0U3RhcnQoKSkge1xuICAgICAgICB0aGlzLmVtaXQoJ1xcbicpO1xuICAgICAgfVxuICAgICAgcG9zID0gbm9kZS5nZXRTdGFydCgpO1xuICAgIH1cbiAgICB0aGlzLndyaXRlTm9kZUZyb20obm9kZSwgcG9zKTtcbiAgfVxuXG4gIHdyaXRlTm9kZUZyb20obm9kZTogdHMuTm9kZSwgcG9zOiBudW1iZXIsIGVuZCA9IG5vZGUuZ2V0RW5kKCkpIHtcbiAgICBpZiAoZW5kIDw9IHRoaXMuc2tpcENvbW1lbnRzVXBUb09mZnNldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBvbGRTa2lwQ29tbWVudHNVcFRvT2Zmc2V0ID0gdGhpcy5za2lwQ29tbWVudHNVcFRvT2Zmc2V0O1xuICAgIHRoaXMuc2tpcENvbW1lbnRzVXBUb09mZnNldCA9IE1hdGgubWF4KHRoaXMuc2tpcENvbW1lbnRzVXBUb09mZnNldCwgcG9zKTtcbiAgICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgY2hpbGQgPT4ge1xuICAgICAgdGhpcy53cml0ZVJhbmdlKG5vZGUsIHBvcywgY2hpbGQuZ2V0RnVsbFN0YXJ0KCkpO1xuICAgICAgdGhpcy52aXNpdChjaGlsZCk7XG4gICAgICBwb3MgPSBjaGlsZC5nZXRFbmQoKTtcbiAgICB9KTtcbiAgICB0aGlzLndyaXRlUmFuZ2Uobm9kZSwgcG9zLCBlbmQpO1xuICAgIHRoaXMuc2tpcENvbW1lbnRzVXBUb09mZnNldCA9IG9sZFNraXBDb21tZW50c1VwVG9PZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogV3JpdGVzIGFsbCBsZWFkaW5nIHRyaXZpYSAod2hpdGVzcGFjZSBvciBjb21tZW50cykgb24gbm9kZSwgb3IgYWxsIHRyaXZpYSB1cCB0byB0aGUgZ2l2ZW5cbiAgICogcG9zaXRpb24uIEFsc28gbWFya3MgdGhvc2UgdHJpdmlhIGFzIFwiYWxyZWFkeSBlbWl0dGVkXCIgYnkgc2hpZnRpbmcgdGhlIHNraXBDb21tZW50c1VwVG8gbWFya2VyLlxuICAgKi9cbiAgd3JpdGVMZWFkaW5nVHJpdmlhKG5vZGU6IHRzLk5vZGUsIHVwVG8gPSAwKSB7XG4gICAgY29uc3QgdXBUb09mZnNldCA9IHVwVG8gfHwgbm9kZS5nZXRTdGFydCgpO1xuICAgIHRoaXMud3JpdGVSYW5nZShub2RlLCBub2RlLmdldEZ1bGxTdGFydCgpLCB1cFRvIHx8IG5vZGUuZ2V0U3RhcnQoKSk7XG4gICAgdGhpcy5za2lwQ29tbWVudHNVcFRvT2Zmc2V0ID0gdXBUb09mZnNldDtcbiAgfVxuXG4gIGFkZFNvdXJjZU1hcHBpbmcobm9kZTogdHMuTm9kZSkge1xuICAgIHRoaXMud3JpdGVSYW5nZShub2RlLCBub2RlLmdldEVuZCgpLCBub2RlLmdldEVuZCgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXcml0ZSBhIHNwYW4gb2YgdGhlIGlucHV0IGZpbGUgYXMgZXhwcmVzc2VkIGJ5IGFic29sdXRlIG9mZnNldHMuXG4gICAqIFRoZXNlIG9mZnNldHMgYXJlIGZvdW5kIGluIGF0dHJpYnV0ZXMgbGlrZSBub2RlLmdldEZ1bGxTdGFydCgpIGFuZFxuICAgKiBub2RlLmdldEVuZCgpLlxuICAgKi9cbiAgd3JpdGVSYW5nZShub2RlOiB0cy5Ob2RlLCBmcm9tOiBudW1iZXIsIHRvOiBudW1iZXIpIHtcbiAgICBjb25zdCBmdWxsU3RhcnQgPSBub2RlLmdldEZ1bGxTdGFydCgpO1xuICAgIGNvbnN0IHRleHRTdGFydCA9IG5vZGUuZ2V0U3RhcnQoKTtcbiAgICBpZiAoZnJvbSA+PSBmdWxsU3RhcnQgJiYgZnJvbSA8IHRleHRTdGFydCkge1xuICAgICAgZnJvbSA9IE1hdGgubWF4KGZyb20sIHRoaXMuc2tpcENvbW1lbnRzVXBUb09mZnNldCk7XG4gICAgfVxuICAgIC8vIEFkZCBhIHNvdXJjZSBtYXBwaW5nLiB3cml0ZVJhbmdlKGZyb20sIHRvKSBhbHdheXMgY29ycmVzcG9uZHMgdG9cbiAgICAvLyBvcmlnaW5hbCBzb3VyY2UgY29kZSwgc28gYWRkIGEgbWFwcGluZyBhdCB0aGUgY3VycmVudCBsb2NhdGlvbiB0aGF0XG4gICAgLy8gcG9pbnRzIGJhY2sgdG8gdGhlIGxvY2F0aW9uIGF0IGBmcm9tYC4gVGhlIGFkZGl0aW9uYWwgY29kZSBnZW5lcmF0ZWRcbiAgICAvLyBieSB0c2lja2xlIHdpbGwgdGhlbiBiZSBjb25zaWRlcmVkIHBhcnQgb2YgdGhlIGxhc3QgbWFwcGVkIGNvZGVcbiAgICAvLyBzZWN0aW9uIHByZWNlZGluZyBpdC4gVGhhdCdzIGFyZ3VhYmx5IGluY29ycmVjdCAoZS5nLiBmb3IgdGhlIGZha2VcbiAgICAvLyBtZXRob2RzIGRlZmluaW5nIHByb3BlcnRpZXMpLCBidXQgaXMgZ29vZCBlbm91Z2ggZm9yIHN0YWNrIHRyYWNlcy5cbiAgICBjb25zdCBwb3MgPSB0aGlzLmZpbGUuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24oZnJvbSk7XG4gICAgdGhpcy5zb3VyY2VNYXBwZXIuYWRkTWFwcGluZyhcbiAgICAgICAgbm9kZSwge2xpbmU6IHBvcy5saW5lLCBjb2x1bW46IHBvcy5jaGFyYWN0ZXIsIHBvc2l0aW9uOiBmcm9tfSwgdGhpcy5wb3NpdGlvbiwgdG8gLSBmcm9tKTtcbiAgICAvLyBnZXRTb3VyY2VGaWxlKCkuZ2V0VGV4dCgpIGlzIHdyb25nIGhlcmUgYmVjYXVzZSBpdCBoYXMgdGhlIHRleHQgb2ZcbiAgICAvLyB0aGUgU291cmNlRmlsZSBub2RlIG9mIHRoZSBBU1QsIHdoaWNoIGRvZXNuJ3QgY29udGFpbiB0aGUgY29tbWVudHNcbiAgICAvLyBwcmVjZWRpbmcgdGhhdCBub2RlLiAgU2VtYW50aWNhbGx5IHRoZXNlIHJhbmdlcyBhcmUganVzdCBvZmZzZXRzXG4gICAgLy8gaW50byB0aGUgb3JpZ2luYWwgc291cmNlIGZpbGUgdGV4dCwgc28gc2xpY2UgZnJvbSB0aGF0LlxuICAgIGNvbnN0IHRleHQgPSB0aGlzLmZpbGUudGV4dC5zbGljZShmcm9tLCB0byk7XG4gICAgaWYgKHRleHQpIHtcbiAgICAgIHRoaXMuZW1pdCh0ZXh0KTtcbiAgICB9XG4gIH1cblxuICBlbWl0KHN0cjogc3RyaW5nKSB7XG4gICAgdGhpcy5vdXRwdXQucHVzaChzdHIpO1xuICAgIGZvciAoY29uc3QgYyBvZiBzdHIpIHtcbiAgICAgIHRoaXMucG9zaXRpb24uY29sdW1uKys7XG4gICAgICBpZiAoYyA9PT0gJ1xcbicpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5saW5lKys7XG4gICAgICAgIHRoaXMucG9zaXRpb24uY29sdW1uID0gMDtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5wb3NpdGlvbi5wb3NpdGlvbiArPSBzdHIubGVuZ3RoO1xuICB9XG5cbiAgLyoqIFJlbW92ZXMgY29tbWVudCBtZXRhY2hhcmFjdGVycyBmcm9tIGEgc3RyaW5nLCB0byBtYWtlIGl0IHNhZmUgdG8gZW1iZWQgaW4gYSBjb21tZW50LiAqL1xuICBlc2NhcGVGb3JDb21tZW50KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1xcL1xcKi9nLCAnX18nKS5yZXBsYWNlKC9cXCpcXC8vZywgJ19fJyk7XG4gIH1cblxuICAvKiB0c2xpbnQ6ZGlzYWJsZTogbm8tdW51c2VkLXZhcmlhYmxlICovXG4gIGxvZ1dpdGhJbmRlbnQobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgLyogdHNsaW50OmVuYWJsZTogbm8tdW51c2VkLXZhcmlhYmxlICovXG4gICAgY29uc3QgcHJlZml4ID0gbmV3IEFycmF5KHRoaXMuaW5kZW50ICsgMSkuam9pbignfCAnKTtcbiAgICBjb25zb2xlLmxvZyhwcmVmaXggKyBtZXNzYWdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9kdWNlcyBhIGNvbXBpbGVyIGVycm9yIHRoYXQgcmVmZXJlbmNlcyB0aGUgTm9kZSdzIGtpbmQuICBUaGlzIGlzIHVzZWZ1bCBmb3IgdGhlIFwiZWxzZVwiXG4gICAqIGJyYW5jaCBvZiBjb2RlIHRoYXQgaXMgYXR0ZW1wdGluZyB0byBoYW5kbGUgYWxsIHBvc3NpYmxlIGlucHV0IE5vZGUgdHlwZXMsIHRvIGVuc3VyZSBhbGwgY2FzZXNcbiAgICogY292ZXJlZC5cbiAgICovXG4gIGVycm9yVW5pbXBsZW1lbnRlZEtpbmQobm9kZTogdHMuTm9kZSwgd2hlcmU6IHN0cmluZykge1xuICAgIHRoaXMuZXJyb3Iobm9kZSwgYCR7dHMuU3ludGF4S2luZFtub2RlLmtpbmRdfSBub3QgaW1wbGVtZW50ZWQgaW4gJHt3aGVyZX1gKTtcbiAgfVxuXG4gIGVycm9yKG5vZGU6IHRzLk5vZGUsIG1lc3NhZ2VUZXh0OiBzdHJpbmcpIHtcbiAgICB0aGlzLmRpYWdub3N0aWNzLnB1c2goe1xuICAgICAgZmlsZTogbm9kZS5nZXRTb3VyY2VGaWxlKCksXG4gICAgICBzdGFydDogbm9kZS5nZXRTdGFydCgpLFxuICAgICAgbGVuZ3RoOiBub2RlLmdldEVuZCgpIC0gbm9kZS5nZXRTdGFydCgpLFxuICAgICAgbWVzc2FnZVRleHQsXG4gICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgY29kZTogMCxcbiAgICB9KTtcbiAgfVxufVxuXG4vKiogUmV0dXJucyB0aGUgc3RyaW5nIGNvbnRlbnRzIG9mIGEgdHMuSWRlbnRpZmllci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJZGVudGlmaWVyVGV4dChpZGVudGlmaWVyOiB0cy5JZGVudGlmaWVyKTogc3RyaW5nIHtcbiAgLy8gTk9URTogdGhlICd0ZXh0JyBwcm9wZXJ0eSBvbiBhbiBJZGVudGlmaWVyIG1heSBiZSBlc2NhcGVkIGlmIGl0IHN0YXJ0c1xuICAvLyB3aXRoICdfXycsIHNvIGp1c3QgdXNlIGdldFRleHQoKS5cbiAgcmV0dXJuIGlkZW50aWZpZXIuZ2V0VGV4dCgpO1xufVxuXG4vKiogUmV0dXJucyBhIGRvdC1qb2luZWQgcXVhbGlmaWVkIG5hbWUgKGZvby5iYXIuQmF6KS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbnRpdHlOYW1lVGV4dChuYW1lOiB0cy5FbnRpdHlOYW1lKTogc3RyaW5nIHtcbiAgaWYgKHRzLmlzSWRlbnRpZmllcihuYW1lKSkge1xuICAgIHJldHVybiBnZXRJZGVudGlmaWVyVGV4dChuYW1lKTtcbiAgfVxuICByZXR1cm4gZ2V0RW50aXR5TmFtZVRleHQobmFtZS5sZWZ0KSArICcuJyArIGdldElkZW50aWZpZXJUZXh0KG5hbWUucmlnaHQpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIGVzY2FwZWQgVHlwZVNjcmlwdCBuYW1lIGludG8gdGhlIG9yaWdpbmFsIHNvdXJjZSBuYW1lLlxuICogUHJlZmVyIGdldElkZW50aWZpZXJUZXh0KCkgaW5zdGVhZCBpZiBwb3NzaWJsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuZXNjYXBlTmFtZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBTZWUgdGhlIHByaXZhdGUgZnVuY3Rpb24gdW5lc2NhcGVJZGVudGlmaWVyIGluIFR5cGVTY3JpcHQncyB1dGlsaXRpZXMudHMuXG4gIGlmIChuYW1lLm1hdGNoKC9eX19fLykpIHJldHVybiBuYW1lLnN1YnN0cigxKTtcbiAgcmV0dXJuIG5hbWU7XG59XG4iXX0=