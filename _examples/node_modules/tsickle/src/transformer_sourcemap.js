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
        define("tsickle/src/transformer_sourcemap", ["require", "exports", "tsickle/src/transformer_util", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var ts = require("tsickle/src/typescript");
    /**
     * Creates a TypeScript transformer based on a source->text transformation.
     *
     * TypeScript transformers operate on AST nodes. Newly created nodes must be marked as replacing an
     * older AST node. This shim allows running a transformation step that's based on emitting new text
     * as a node based transformer. It achieves that by running the transformation, collecting a source
     * mapping in the process, and then afterwards parsing the source text into a new AST and marking
     * the new nodes as representations of the old nodes based on their source map positions.
     *
     * The process marks all nodes as synthesized except for a handful of special cases (identifiers
     * etc).
     */
    function createTransformerFromSourceMap(sourceBasedTransformer) {
        return function (context) { return function (sourceFile) {
            var sourceMapper = new NodeSourceMapper();
            var transformedSourceText = sourceBasedTransformer(sourceFile, sourceMapper);
            var newFile = ts.createSourceFile(sourceFile.fileName, transformedSourceText, ts.ScriptTarget.Latest, true);
            var mappedFile = visitNode(newFile);
            return transformer_util_1.updateSourceFileNode(sourceFile, mappedFile.statements);
            function visitNode(node) {
                return transformer_util_1.visitNodeWithSynthesizedComments(context, newFile, node, visitNodeImpl);
            }
            function visitNodeImpl(node) {
                if (node.flags & ts.NodeFlags.Synthesized) {
                    return node;
                }
                var originalNode = sourceMapper.getOriginalNode(node);
                // Use the originalNode for:
                // - literals: as e.g. typescript does not support synthetic regex literals
                // - identifiers: as they don't have children and behave well
                //    regarding comment synthesization
                // - types: as they are not emited anyways
                //          and it leads to errors with `extends` cases.
                // - imports/exports: as TypeScript will only attempt to elide type only
                //                    imports if the new node is identical to the original node.
                if (originalNode) {
                    if (isLiteralKind(node.kind) || node.kind === ts.SyntaxKind.Identifier ||
                        transformer_util_1.isTypeNodeKind(node.kind) || node.kind === ts.SyntaxKind.IndexSignature) {
                        return originalNode;
                    }
                    if (node.kind === ts.SyntaxKind.ImportDeclaration ||
                        node.kind === ts.SyntaxKind.ImportEqualsDeclaration ||
                        node.kind === ts.SyntaxKind.ExportAssignment) {
                        return originalNode;
                    }
                    if (ts.isExportDeclaration(node)) {
                        // Return the original nodes for export declarations, unless they were expanded from an
                        // export * to specific exported symbols.
                        var originalExport = originalNode;
                        if (!node.moduleSpecifier) {
                            // export {a, b, c};
                            return originalNode;
                        }
                        if (!!originalExport.exportClause === !!node.exportClause) {
                            // This already was exported with symbols (export {...}) or was not expanded.
                            return originalNode;
                        }
                        // Rewrote export * -> export {...}, the export declaration must be emitted in the updated
                        // form.
                    }
                }
                node = ts.visitEachChild(node, visitNode, context);
                node.flags |= ts.NodeFlags.Synthesized;
                node.parent = undefined;
                ts.setTextRange(node, originalNode ? originalNode : { pos: -1, end: -1 });
                ts.setOriginalNode(node, originalNode);
                // Loop over all nested ts.NodeArrays /
                // ts.Nodes that were not visited and set their
                // text range to -1 to not emit their whitespace.
                // Sadly, TypeScript does not have an API for this...
                // tslint:disable-next-line:no-any To read all properties
                var nodeAny = node;
                // tslint:disable-next-line:no-any To read all properties
                var originalNodeAny = originalNode;
                for (var prop in nodeAny) {
                    if (nodeAny.hasOwnProperty(prop)) {
                        // tslint:disable-next-line:no-any
                        var value = nodeAny[prop];
                        if (isNodeArray(value)) {
                            // reset the pos/end of all NodeArrays so that we don't emit comments
                            // from them.
                            ts.setTextRange(value, { pos: -1, end: -1 });
                        }
                        else if (isToken(value) && !(value.flags & ts.NodeFlags.Synthesized) &&
                            value.getSourceFile() !== sourceFile) {
                            // Use the original TextRange for all non visited tokens (e.g. the
                            // `BinaryExpression.operatorToken`) to preserve the formatting
                            var textRange = originalNode ? originalNodeAny[prop] : { pos: -1, end: -1 };
                            ts.setTextRange(value, textRange);
                        }
                    }
                }
                return node;
            }
        }; };
    }
    exports.createTransformerFromSourceMap = createTransformerFromSourceMap;
    /**
     * Implementation of the `SourceMapper` that stores and retrieves mappings
     * to original nodes.
     */
    var NodeSourceMapper = /** @class */ (function () {
        function NodeSourceMapper() {
            this.originalNodeByGeneratedRange = new Map();
            this.genStartPositions = new Map();
            /** Conceptual offset for all nodes in this mapping. */
            this.offset = 0;
        }
        NodeSourceMapper.prototype.addFullNodeRange = function (node, genStartPos) {
            var _this = this;
            this.originalNodeByGeneratedRange.set(this.nodeCacheKey(node.kind, genStartPos, genStartPos + (node.getEnd() - node.getStart())), node);
            node.forEachChild(function (child) { return _this.addFullNodeRange(child, genStartPos + (child.getStart() - node.getStart())); });
        };
        NodeSourceMapper.prototype.shiftByOffset = function (offset) {
            this.offset += offset;
        };
        NodeSourceMapper.prototype.addMapping = function (originalNode, original, generated, length) {
            var _this = this;
            var originalStartPos = original.position;
            var genStartPos = generated.position;
            if (originalStartPos >= originalNode.getFullStart() &&
                originalStartPos <= originalNode.getStart()) {
                // always use the node.getStart() for the index,
                // as comments and whitespaces might differ between the original and transformed code.
                var diffToStart = originalNode.getStart() - originalStartPos;
                originalStartPos += diffToStart;
                genStartPos += diffToStart;
                length -= diffToStart;
                this.genStartPositions.set(originalNode, genStartPos);
            }
            if (originalStartPos + length === originalNode.getEnd()) {
                this.originalNodeByGeneratedRange.set(this.nodeCacheKey(originalNode.kind, this.genStartPositions.get(originalNode), genStartPos + length), originalNode);
            }
            originalNode.forEachChild(function (child) {
                if (child.getStart() >= originalStartPos && child.getEnd() <= originalStartPos + length) {
                    _this.addFullNodeRange(child, genStartPos + (child.getStart() - originalStartPos));
                }
            });
        };
        /** For the newly parsed `node`, find what node corresponded to it in the original source text. */
        NodeSourceMapper.prototype.getOriginalNode = function (node) {
            // Apply the offset: if there is an offset > 0, all nodes are conceptually shifted by so many
            // characters from the start of the file.
            var start = node.getStart() - this.offset;
            if (start < 0) {
                // Special case: the source file conceptually spans all of the file, including any added
                // prefix added that causes offset to be set.
                if (node.kind !== ts.SyntaxKind.SourceFile) {
                    // Nodes within [0, offset] of the new file (start < 0) is the additional prefix that has no
                    // corresponding nodes in the original source, so return undefined.
                    return undefined;
                }
                start = 0;
            }
            var end = node.getEnd() - this.offset;
            var key = this.nodeCacheKey(node.kind, start, end);
            return this.originalNodeByGeneratedRange.get(key);
        };
        NodeSourceMapper.prototype.nodeCacheKey = function (kind, start, end) {
            return kind + "#" + start + "#" + end;
        };
        return NodeSourceMapper;
    }());
    // tslint:disable-next-line:no-any
    function isNodeArray(value) {
        var anyValue = value;
        return Array.isArray(value) && anyValue.pos !== undefined && anyValue.end !== undefined;
    }
    // tslint:disable-next-line:no-any
    function isToken(value) {
        return value != null && typeof value === 'object' && value.kind >= ts.SyntaxKind.FirstToken &&
            value.kind <= ts.SyntaxKind.LastToken;
    }
    // Copied from TypeScript
    function isLiteralKind(kind) {
        return ts.SyntaxKind.FirstLiteralToken <= kind && kind <= ts.SyntaxKind.LastLiteralToken;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXJfc291cmNlbWFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3RyYW5zZm9ybWVyX3NvdXJjZW1hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUdILGlFQUEwRztJQUMxRywyQ0FBbUM7SUFFbkM7Ozs7Ozs7Ozs7O09BV0c7SUFDSCx3Q0FDSSxzQkFDVTtRQUNaLE9BQU8sVUFBQyxPQUFPLElBQUssT0FBQSxVQUFDLFVBQVU7WUFDN0IsSUFBTSxZQUFZLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQzVDLElBQU0scUJBQXFCLEdBQUcsc0JBQXNCLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQy9FLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDL0IsVUFBVSxDQUFDLFFBQVEsRUFBRSxxQkFBcUIsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5RSxJQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEMsT0FBTyx1Q0FBb0IsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRS9ELG1CQUFzQyxJQUFPO2dCQUMzQyxPQUFPLG1EQUFnQyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBTSxDQUFDO1lBQ3RGLENBQUM7WUFFRCx1QkFBdUIsSUFBYTtnQkFDbEMsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFO29CQUN6QyxPQUFPLElBQUksQ0FBQztpQkFDYjtnQkFDRCxJQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUV4RCw0QkFBNEI7Z0JBQzVCLDJFQUEyRTtnQkFDM0UsNkRBQTZE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QztRQUN2QixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsS0FBSyxTQUFTLElBQUksUUFBUSxDQUFDLEdBQUcsS0FBSyxTQUFTLENBQUM7SUFDMUYsQ0FBQztJQUVELGtDQUFrQztJQUNsQyxpQkFBaUIsS0FBVTtRQUN6QixPQUFPLEtBQUssSUFBSSxJQUFJLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVO1lBQ3ZGLEtBQUssQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUM7SUFDNUMsQ0FBQztJQUVELHlCQUF5QjtJQUN6Qix1QkFBdUIsSUFBbUI7UUFDeEMsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLGlCQUFpQixJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztJQUMzRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1NvdXJjZU1hcHBlciwgU291cmNlUG9zaXRpb259IGZyb20gJy4vc291cmNlX21hcF91dGlscyc7XG5pbXBvcnQge2lzVHlwZU5vZGVLaW5kLCB1cGRhdGVTb3VyY2VGaWxlTm9kZSwgdmlzaXROb2RlV2l0aFN5bnRoZXNpemVkQ29tbWVudHN9IGZyb20gJy4vdHJhbnNmb3JtZXJfdXRpbCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICcuL3R5cGVzY3JpcHQnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBUeXBlU2NyaXB0IHRyYW5zZm9ybWVyIGJhc2VkIG9uIGEgc291cmNlLT50ZXh0IHRyYW5zZm9ybWF0aW9uLlxuICpcbiAqIFR5cGVTY3JpcHQgdHJhbnNmb3JtZXJzIG9wZXJhdGUgb24gQVNUIG5vZGVzLiBOZXdseSBjcmVhdGVkIG5vZGVzIG11c3QgYmUgbWFya2VkIGFzIHJlcGxhY2luZyBhblxuICogb2xkZXIgQVNUIG5vZGUuIFRoaXMgc2hpbSBhbGxvd3MgcnVubmluZyBhIHRyYW5zZm9ybWF0aW9uIHN0ZXAgdGhhdCdzIGJhc2VkIG9uIGVtaXR0aW5nIG5ldyB0ZXh0XG4gKiBhcyBhIG5vZGUgYmFzZWQgdHJhbnNmb3JtZXIuIEl0IGFjaGlldmVzIHRoYXQgYnkgcnVubmluZyB0aGUgdHJhbnNmb3JtYXRpb24sIGNvbGxlY3RpbmcgYSBzb3VyY2VcbiAqIG1hcHBpbmcgaW4gdGhlIHByb2Nlc3MsIGFuZCB0aGVuIGFmdGVyd2FyZHMgcGFyc2luZyB0aGUgc291cmNlIHRleHQgaW50byBhIG5ldyBBU1QgYW5kIG1hcmtpbmdcbiAqIHRoZSBuZXcgbm9kZXMgYXMgcmVwcmVzZW50YXRpb25zIG9mIHRoZSBvbGQgbm9kZXMgYmFzZWQgb24gdGhlaXIgc291cmNlIG1hcCBwb3NpdGlvbnMuXG4gKlxuICogVGhlIHByb2Nlc3MgbWFya3MgYWxsIG5vZGVzIGFzIHN5bnRoZXNpemVkIGV4Y2VwdCBmb3IgYSBoYW5kZnVsIG9mIHNwZWNpYWwgY2FzZXMgKGlkZW50aWZpZXJzXG4gKiBldGMpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHJhbnNmb3JtZXJGcm9tU291cmNlTWFwKFxuICAgIHNvdXJjZUJhc2VkVHJhbnNmb3JtZXI6IChzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBzb3VyY2VNYXBwZXI6IFNvdXJjZU1hcHBlcikgPT5cbiAgICAgICAgc3RyaW5nKTogdHMuVHJhbnNmb3JtZXJGYWN0b3J5PHRzLlNvdXJjZUZpbGU+IHtcbiAgcmV0dXJuIChjb250ZXh0KSA9PiAoc291cmNlRmlsZSkgPT4ge1xuICAgIGNvbnN0IHNvdXJjZU1hcHBlciA9IG5ldyBOb2RlU291cmNlTWFwcGVyKCk7XG4gICAgY29uc3QgdHJhbnNmb3JtZWRTb3VyY2VUZXh0ID0gc291cmNlQmFzZWRUcmFuc2Zvcm1lcihzb3VyY2VGaWxlLCBzb3VyY2VNYXBwZXIpO1xuICAgIGNvbnN0IG5ld0ZpbGUgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKFxuICAgICAgICBzb3VyY2VGaWxlLmZpbGVOYW1lLCB0cmFuc2Zvcm1lZFNvdXJjZVRleHQsIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsIHRydWUpO1xuICAgIGNvbnN0IG1hcHBlZEZpbGUgPSB2aXNpdE5vZGUobmV3RmlsZSk7XG4gICAgcmV0dXJuIHVwZGF0ZVNvdXJjZUZpbGVOb2RlKHNvdXJjZUZpbGUsIG1hcHBlZEZpbGUuc3RhdGVtZW50cyk7XG5cbiAgICBmdW5jdGlvbiB2aXNpdE5vZGU8VCBleHRlbmRzIHRzLk5vZGU+KG5vZGU6IFQpOiBUIHtcbiAgICAgIHJldHVybiB2aXNpdE5vZGVXaXRoU3ludGhlc2l6ZWRDb21tZW50cyhjb250ZXh0LCBuZXdGaWxlLCBub2RlLCB2aXNpdE5vZGVJbXBsKSBhcyBUO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZpc2l0Tm9kZUltcGwobm9kZTogdHMuTm9kZSkge1xuICAgICAgaWYgKG5vZGUuZmxhZ3MgJiB0cy5Ob2RlRmxhZ3MuU3ludGhlc2l6ZWQpIHtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG4gICAgICBjb25zdCBvcmlnaW5hbE5vZGUgPSBzb3VyY2VNYXBwZXIuZ2V0T3JpZ2luYWxOb2RlKG5vZGUpO1xuXG4gICAgICAvLyBVc2UgdGhlIG9yaWdpbmFsTm9kZSBmb3I6XG4gICAgICAvLyAtIGxpdGVyYWxzOiBhcyBlLmcuIHR5cGVzY3JpcHQgZG9lcyBub3Qgc3VwcG9ydCBzeW50aGV0aWMgcmVnZXggbGl0ZXJhbHNcbiAgICAgIC8vIC0gaWRlbnRpZmllcnM6IGFzIHRoZXkgZG9uJ3QgaGF2ZSBjaGlsZHJlbiBhbmQgYmVoYXZlIHdlbGxcbiAgICAgIC8vICAgIHJlZ2FyZGluZyBjb21tZW50IHN5bnRoZXNpemF0aW9uXG4gICAgICAvLyAtIHR5cGVzOiBhcyB0aGV5IGFyZSBub3QgZW1pdGVkIGFueXdheXNcbiAgICAgIC8vICAgICAgICAgIGFuZCBpdCBsZWFkcyB0byBlcnJvcnMgd2l0aCBgZXh0ZW5kc2AgY2FzZXMuXG4gICAgICAvLyAtIGltcG9ydHMvZXhwb3J0czogYXMgVHlwZVNjcmlwdCB3aWxsIG9ubHkgYXR0ZW1wdCB0byBlbGlkZSB0eXBlIG9ubHlcbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICBpbXBvcnRzIGlmIHRoZSBuZXcgbm9kZSBpcyBpZGVudGljYWwgdG8gdGhlIG9yaWdpbmFsIG5vZGUuXG4gICAgICBpZiAob3JpZ2luYWxOb2RlKSB7XG4gICAgICAgIGlmIChpc0xpdGVyYWxLaW5kKG5vZGUua2luZCkgfHwgbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIgfHxcbiAgICAgICAgICAgIGlzVHlwZU5vZGVLaW5kKG5vZGUua2luZCkgfHwgbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkluZGV4U2lnbmF0dXJlKSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbmFsTm9kZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uIHx8XG4gICAgICAgICAgICBub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSW1wb3J0RXF1YWxzRGVjbGFyYXRpb24gfHxcbiAgICAgICAgICAgIG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHBvcnRBc3NpZ25tZW50KSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbmFsTm9kZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHMuaXNFeHBvcnREZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAgICAgIC8vIFJldHVybiB0aGUgb3JpZ2luYWwgbm9kZXMgZm9yIGV4cG9ydCBkZWNsYXJhdGlvbnMsIHVubGVzcyB0aGV5IHdlcmUgZXhwYW5kZWQgZnJvbSBhblxuICAgICAgICAgIC8vIGV4cG9ydCAqIHRvIHNwZWNpZmljIGV4cG9ydGVkIHN5bWJvbHMuXG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxFeHBvcnQgPSBvcmlnaW5hbE5vZGUgYXMgdHMuRXhwb3J0RGVjbGFyYXRpb247XG4gICAgICAgICAgaWYgKCFub2RlLm1vZHVsZVNwZWNpZmllcikge1xuICAgICAgICAgICAgLy8gZXhwb3J0IHthLCBiLCBjfTtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbE5vZGU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghIW9yaWdpbmFsRXhwb3J0LmV4cG9ydENsYXVzZSA9PT0gISFub2RlLmV4cG9ydENsYXVzZSkge1xuICAgICAgICAgICAgLy8gVGhpcyBhbHJlYWR5IHdhcyBleHBvcnRlZCB3aXRoIHN5bWJvbHMgKGV4cG9ydCB7Li4ufSkgb3Igd2FzIG5vdCBleHBhbmRlZC5cbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbE5vZGU7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFJld3JvdGUgZXhwb3J0ICogLT4gZXhwb3J0IHsuLi59LCB0aGUgZXhwb3J0IGRlY2xhcmF0aW9uIG11c3QgYmUgZW1pdHRlZCBpbiB0aGUgdXBkYXRlZFxuICAgICAgICAgIC8vIGZvcm0uXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5vZGUgPSB0cy52aXNpdEVhY2hDaGlsZChub2RlLCB2aXNpdE5vZGUsIGNvbnRleHQpO1xuXG4gICAgICBub2RlLmZsYWdzIHw9IHRzLk5vZGVGbGFncy5TeW50aGVzaXplZDtcbiAgICAgIG5vZGUucGFyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdHMuc2V0VGV4dFJhbmdlKG5vZGUsIG9yaWdpbmFsTm9kZSA/IG9yaWdpbmFsTm9kZSA6IHtwb3M6IC0xLCBlbmQ6IC0xfSk7XG4gICAgICB0cy5zZXRPcmlnaW5hbE5vZGUobm9kZSwgb3JpZ2luYWxOb2RlKTtcblxuICAgICAgLy8gTG9vcCBvdmVyIGFsbCBuZXN0ZWQgdHMuTm9kZUFycmF5cyAvXG4gICAgICAvLyB0cy5Ob2RlcyB0aGF0IHdlcmUgbm90IHZpc2l0ZWQgYW5kIHNldCB0aGVpclxuICAgICAgLy8gdGV4dCByYW5nZSB0byAtMSB0byBub3QgZW1pdCB0aGVpciB3aGl0ZXNwYWNlLlxuICAgICAgLy8gU2FkbHksIFR5cGVTY3JpcHQgZG9lcyBub3QgaGF2ZSBhbiBBUEkgZm9yIHRoaXMuLi5cbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnkgVG8gcmVhZCBhbGwgcHJvcGVydGllc1xuICAgICAgY29uc3Qgbm9kZUFueSA9IG5vZGUgYXMge1trZXk6IHN0cmluZ106IGFueX07XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55IFRvIHJlYWQgYWxsIHByb3BlcnRpZXNcbiAgICAgIGNvbnN0IG9yaWdpbmFsTm9kZUFueSA9IG9yaWdpbmFsTm9kZSBhcyB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgICAgIGZvciAoY29uc3QgcHJvcCBpbiBub2RlQW55KSB7XG4gICAgICAgIGlmIChub2RlQW55Lmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAgIGNvbnN0IHZhbHVlID0gbm9kZUFueVtwcm9wXTtcbiAgICAgICAgICBpZiAoaXNOb2RlQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAvLyByZXNldCB0aGUgcG9zL2VuZCBvZiBhbGwgTm9kZUFycmF5cyBzbyB0aGF0IHdlIGRvbid0IGVtaXQgY29tbWVudHNcbiAgICAgICAgICAgIC8vIGZyb20gdGhlbS5cbiAgICAgICAgICAgIHRzLnNldFRleHRSYW5nZSh2YWx1ZSwge3BvczogLTEsIGVuZDogLTF9KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICBpc1Rva2VuKHZhbHVlKSAmJiAhKHZhbHVlLmZsYWdzICYgdHMuTm9kZUZsYWdzLlN5bnRoZXNpemVkKSAmJlxuICAgICAgICAgICAgICB2YWx1ZS5nZXRTb3VyY2VGaWxlKCkgIT09IHNvdXJjZUZpbGUpIHtcbiAgICAgICAgICAgIC8vIFVzZSB0aGUgb3JpZ2luYWwgVGV4dFJhbmdlIGZvciBhbGwgbm9uIHZpc2l0ZWQgdG9rZW5zIChlLmcuIHRoZVxuICAgICAgICAgICAgLy8gYEJpbmFyeUV4cHJlc3Npb24ub3BlcmF0b3JUb2tlbmApIHRvIHByZXNlcnZlIHRoZSBmb3JtYXR0aW5nXG4gICAgICAgICAgICBjb25zdCB0ZXh0UmFuZ2UgPSBvcmlnaW5hbE5vZGUgPyBvcmlnaW5hbE5vZGVBbnlbcHJvcF0gOiB7cG9zOiAtMSwgZW5kOiAtMX07XG4gICAgICAgICAgICB0cy5zZXRUZXh0UmFuZ2UodmFsdWUsIHRleHRSYW5nZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgYFNvdXJjZU1hcHBlcmAgdGhhdCBzdG9yZXMgYW5kIHJldHJpZXZlcyBtYXBwaW5nc1xuICogdG8gb3JpZ2luYWwgbm9kZXMuXG4gKi9cbmNsYXNzIE5vZGVTb3VyY2VNYXBwZXIgaW1wbGVtZW50cyBTb3VyY2VNYXBwZXIge1xuICBwcml2YXRlIG9yaWdpbmFsTm9kZUJ5R2VuZXJhdGVkUmFuZ2UgPSBuZXcgTWFwPHN0cmluZywgdHMuTm9kZT4oKTtcbiAgcHJpdmF0ZSBnZW5TdGFydFBvc2l0aW9ucyA9IG5ldyBNYXA8dHMuTm9kZSwgbnVtYmVyPigpO1xuICAvKiogQ29uY2VwdHVhbCBvZmZzZXQgZm9yIGFsbCBub2RlcyBpbiB0aGlzIG1hcHBpbmcuICovXG4gIHByaXZhdGUgb2Zmc2V0ID0gMDtcblxuICBwcml2YXRlIGFkZEZ1bGxOb2RlUmFuZ2Uobm9kZTogdHMuTm9kZSwgZ2VuU3RhcnRQb3M6IG51bWJlcikge1xuICAgIHRoaXMub3JpZ2luYWxOb2RlQnlHZW5lcmF0ZWRSYW5nZS5zZXQoXG4gICAgICAgIHRoaXMubm9kZUNhY2hlS2V5KG5vZGUua2luZCwgZ2VuU3RhcnRQb3MsIGdlblN0YXJ0UG9zICsgKG5vZGUuZ2V0RW5kKCkgLSBub2RlLmdldFN0YXJ0KCkpKSxcbiAgICAgICAgbm9kZSk7XG4gICAgbm9kZS5mb3JFYWNoQ2hpbGQoXG4gICAgICAgIGNoaWxkID0+IHRoaXMuYWRkRnVsbE5vZGVSYW5nZShjaGlsZCwgZ2VuU3RhcnRQb3MgKyAoY2hpbGQuZ2V0U3RhcnQoKSAtIG5vZGUuZ2V0U3RhcnQoKSkpKTtcbiAgfVxuXG4gIHNoaWZ0QnlPZmZzZXQob2Zmc2V0OiBudW1iZXIpIHtcbiAgICB0aGlzLm9mZnNldCArPSBvZmZzZXQ7XG4gIH1cblxuICBhZGRNYXBwaW5nKFxuICAgICAgb3JpZ2luYWxOb2RlOiB0cy5Ob2RlLCBvcmlnaW5hbDogU291cmNlUG9zaXRpb24sIGdlbmVyYXRlZDogU291cmNlUG9zaXRpb24sIGxlbmd0aDogbnVtYmVyKSB7XG4gICAgbGV0IG9yaWdpbmFsU3RhcnRQb3MgPSBvcmlnaW5hbC5wb3NpdGlvbjtcbiAgICBsZXQgZ2VuU3RhcnRQb3MgPSBnZW5lcmF0ZWQucG9zaXRpb247XG4gICAgaWYgKG9yaWdpbmFsU3RhcnRQb3MgPj0gb3JpZ2luYWxOb2RlLmdldEZ1bGxTdGFydCgpICYmXG4gICAgICAgIG9yaWdpbmFsU3RhcnRQb3MgPD0gb3JpZ2luYWxOb2RlLmdldFN0YXJ0KCkpIHtcbiAgICAgIC8vIGFsd2F5cyB1c2UgdGhlIG5vZGUuZ2V0U3RhcnQoKSBmb3IgdGhlIGluZGV4LFxuICAgICAgLy8gYXMgY29tbWVudHMgYW5kIHdoaXRlc3BhY2VzIG1pZ2h0IGRpZmZlciBiZXR3ZWVuIHRoZSBvcmlnaW5hbCBhbmQgdHJhbnNmb3JtZWQgY29kZS5cbiAgICAgIGNvbnN0IGRpZmZUb1N0YXJ0ID0gb3JpZ2luYWxOb2RlLmdldFN0YXJ0KCkgLSBvcmlnaW5hbFN0YXJ0UG9zO1xuICAgICAgb3JpZ2luYWxTdGFydFBvcyArPSBkaWZmVG9TdGFydDtcbiAgICAgIGdlblN0YXJ0UG9zICs9IGRpZmZUb1N0YXJ0O1xuICAgICAgbGVuZ3RoIC09IGRpZmZUb1N0YXJ0O1xuICAgICAgdGhpcy5nZW5TdGFydFBvc2l0aW9ucy5zZXQob3JpZ2luYWxOb2RlLCBnZW5TdGFydFBvcyk7XG4gICAgfVxuICAgIGlmIChvcmlnaW5hbFN0YXJ0UG9zICsgbGVuZ3RoID09PSBvcmlnaW5hbE5vZGUuZ2V0RW5kKCkpIHtcbiAgICAgIHRoaXMub3JpZ2luYWxOb2RlQnlHZW5lcmF0ZWRSYW5nZS5zZXQoXG4gICAgICAgICAgdGhpcy5ub2RlQ2FjaGVLZXkoXG4gICAgICAgICAgICAgIG9yaWdpbmFsTm9kZS5raW5kLCB0aGlzLmdlblN0YXJ0UG9zaXRpb25zLmdldChvcmlnaW5hbE5vZGUpISwgZ2VuU3RhcnRQb3MgKyBsZW5ndGgpLFxuICAgICAgICAgIG9yaWdpbmFsTm9kZSk7XG4gICAgfVxuICAgIG9yaWdpbmFsTm9kZS5mb3JFYWNoQ2hpbGQoKGNoaWxkKSA9PiB7XG4gICAgICBpZiAoY2hpbGQuZ2V0U3RhcnQoKSA+PSBvcmlnaW5hbFN0YXJ0UG9zICYmIGNoaWxkLmdldEVuZCgpIDw9IG9yaWdpbmFsU3RhcnRQb3MgKyBsZW5ndGgpIHtcbiAgICAgICAgdGhpcy5hZGRGdWxsTm9kZVJhbmdlKGNoaWxkLCBnZW5TdGFydFBvcyArIChjaGlsZC5nZXRTdGFydCgpIC0gb3JpZ2luYWxTdGFydFBvcykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEZvciB0aGUgbmV3bHkgcGFyc2VkIGBub2RlYCwgZmluZCB3aGF0IG5vZGUgY29ycmVzcG9uZGVkIHRvIGl0IGluIHRoZSBvcmlnaW5hbCBzb3VyY2UgdGV4dC4gKi9cbiAgZ2V0T3JpZ2luYWxOb2RlKG5vZGU6IHRzLk5vZGUpOiB0cy5Ob2RlfHVuZGVmaW5lZCB7XG4gICAgLy8gQXBwbHkgdGhlIG9mZnNldDogaWYgdGhlcmUgaXMgYW4gb2Zmc2V0ID4gMCwgYWxsIG5vZGVzIGFyZSBjb25jZXB0dWFsbHkgc2hpZnRlZCBieSBzbyBtYW55XG4gICAgLy8gY2hhcmFjdGVycyBmcm9tIHRoZSBzdGFydCBvZiB0aGUgZmlsZS5cbiAgICBsZXQgc3RhcnQgPSBub2RlLmdldFN0YXJ0KCkgLSB0aGlzLm9mZnNldDtcbiAgICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgICAvLyBTcGVjaWFsIGNhc2U6IHRoZSBzb3VyY2UgZmlsZSBjb25jZXB0dWFsbHkgc3BhbnMgYWxsIG9mIHRoZSBmaWxlLCBpbmNsdWRpbmcgYW55IGFkZGVkXG4gICAgICAvLyBwcmVmaXggYWRkZWQgdGhhdCBjYXVzZXMgb2Zmc2V0IHRvIGJlIHNldC5cbiAgICAgIGlmIChub2RlLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuU291cmNlRmlsZSkge1xuICAgICAgICAvLyBOb2RlcyB3aXRoaW4gWzAsIG9mZnNldF0gb2YgdGhlIG5ldyBmaWxlIChzdGFydCA8IDApIGlzIHRoZSBhZGRpdGlvbmFsIHByZWZpeCB0aGF0IGhhcyBub1xuICAgICAgICAvLyBjb3JyZXNwb25kaW5nIG5vZGVzIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UsIHNvIHJldHVybiB1bmRlZmluZWQuXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIGNvbnN0IGVuZCA9IG5vZGUuZ2V0RW5kKCkgLSB0aGlzLm9mZnNldDtcbiAgICBjb25zdCBrZXkgPSB0aGlzLm5vZGVDYWNoZUtleShub2RlLmtpbmQsIHN0YXJ0LCBlbmQpO1xuICAgIHJldHVybiB0aGlzLm9yaWdpbmFsTm9kZUJ5R2VuZXJhdGVkUmFuZ2UuZ2V0KGtleSk7XG4gIH1cblxuICBwcml2YXRlIG5vZGVDYWNoZUtleShraW5kOiB0cy5TeW50YXhLaW5kLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke2tpbmR9IyR7c3RhcnR9IyR7ZW5kfWA7XG4gIH1cbn1cblxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuZnVuY3Rpb24gaXNOb2RlQXJyYXkodmFsdWU6IGFueSk6IHZhbHVlIGlzIHRzLk5vZGVBcnJheTxhbnk+IHtcbiAgY29uc3QgYW55VmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpICYmIGFueVZhbHVlLnBvcyAhPT0gdW5kZWZpbmVkICYmIGFueVZhbHVlLmVuZCAhPT0gdW5kZWZpbmVkO1xufVxuXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG5mdW5jdGlvbiBpc1Rva2VuKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyB0cy5Ub2tlbjxhbnk+IHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS5raW5kID49IHRzLlN5bnRheEtpbmQuRmlyc3RUb2tlbiAmJlxuICAgICAgdmFsdWUua2luZCA8PSB0cy5TeW50YXhLaW5kLkxhc3RUb2tlbjtcbn1cblxuLy8gQ29waWVkIGZyb20gVHlwZVNjcmlwdFxuZnVuY3Rpb24gaXNMaXRlcmFsS2luZChraW5kOiB0cy5TeW50YXhLaW5kKSB7XG4gIHJldHVybiB0cy5TeW50YXhLaW5kLkZpcnN0TGl0ZXJhbFRva2VuIDw9IGtpbmQgJiYga2luZCA8PSB0cy5TeW50YXhLaW5kLkxhc3RMaXRlcmFsVG9rZW47XG59XG4iXX0=