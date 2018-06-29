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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/fileoverview_comment_transformer", ["require", "exports", "tsickle/src/jsdoc", "tsickle/src/transformer_util", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var jsdoc = require("tsickle/src/jsdoc");
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var ts = require("tsickle/src/typescript");
    /**
     * A set of JSDoc tags that mark a comment as a fileoverview comment. These are recognized by other
     * pieces of infrastructure (Closure Compiler, module system, ...).
     */
    var FILEOVERVIEW_COMMENT_MARKERS = new Set(['fileoverview', 'externs', 'modName', 'mods', 'pintomodule']);
    /**
     * Returns true if the given comment is a \@fileoverview style comment in the Closure sense, i.e. a
     * comment that has JSDoc tags marking it as a fileoverview comment.
     * Note that this is different from TypeScript's understanding of the concept, where a file comment
     * is a comment separated from the rest of the file by a double newline.
     */
    function isClosureFileoverviewComment(text) {
        var current = jsdoc.parse(text);
        return current !== null && current.tags.some(function (t) { return FILEOVERVIEW_COMMENT_MARKERS.has(t.tagName); });
    }
    exports.isClosureFileoverviewComment = isClosureFileoverviewComment;
    /**
     * A transformer that ensures the emitted JS file has an \@fileoverview comment that contains an
     * \@suppress {checkTypes} annotation by either adding or updating an existing comment.
     */
    function transformFileoverviewComment(context) {
        return function (sf) {
            var comments = [];
            // Use trailing comments because that's what transformer_util.ts creates (i.e. by convention).
            if (sf.statements.length && sf.statements[0].kind === ts.SyntaxKind.NotEmittedStatement) {
                comments = ts.getSyntheticTrailingComments(sf.statements[0]) || [];
            }
            var fileoverviewIdx = -1;
            var parsed = null;
            for (var i = comments.length - 1; i >= 0; i--) {
                var current = jsdoc.parseContents(comments[i].text);
                if (current !== null && current.tags.some(function (t) { return FILEOVERVIEW_COMMENT_MARKERS.has(t.tagName); })) {
                    fileoverviewIdx = i;
                    parsed = current;
                    break;
                }
            }
            // Add a @suppress {checkTypes} tag to each source file's JSDoc comment,
            // being careful to retain existing comments and their @suppress'ions.
            // Closure Compiler considers the *last* comment with @fileoverview (or @externs or @nocompile)
            // that has not been attached to some other tree node to be the file overview comment, and
            // only applies @suppress tags from it.
            // AJD considers *any* comment mentioning @fileoverview.
            if (!parsed) {
                // No existing comment to merge with, just emit a new one.
                return addNewFileoverviewComment(sf);
            }
            // Add @suppress {checkTypes}, or add to the list in an existing @suppress tag.
            // Closure compiler barfs if there's a duplicated @suppress tag in a file, so the tag must
            // only appear once and be merged.
            var tags = parsed.tags;
            var suppressTag = tags.find(function (t) { return t.tagName === 'suppress'; });
            if (suppressTag) {
                var suppressions = suppressTag.type || '';
                var suppressionsList = suppressions.split(',').map(function (s) { return s.trim(); });
                if (suppressionsList.indexOf('checkTypes') === -1) {
                    suppressionsList.push('checkTypes');
                }
                suppressTag.type = suppressionsList.join(',');
            }
            else {
                tags.push({
                    tagName: 'suppress',
                    type: 'checkTypes,extraRequire',
                    text: 'checked by tsc',
                });
            }
            // Closure compiler fails if a tag at the start of the file has @suppress but no @fileoverview.
            if (!tags.find(function (t) { return t.tagName === 'fileoverview'; })) {
                tags.push({ tagName: 'fileoverview' });
            }
            var commentText = jsdoc.toStringWithoutStartEnd(tags);
            comments[fileoverviewIdx].text = commentText;
            // sf does not need to be updated, synthesized comments are mutable.
            return sf;
        };
    }
    exports.transformFileoverviewComment = transformFileoverviewComment;
    function addNewFileoverviewComment(sf) {
        var commentText = jsdoc.toStringWithoutStartEnd([
            { tagName: 'fileoverview', text: 'added by tsickle' },
            { tagName: 'suppress', type: 'checkTypes', text: 'checked by tsc' },
        ]);
        var syntheticFirstStatement = transformer_util_1.createNotEmittedStatement(sf);
        syntheticFirstStatement = ts.addSyntheticTrailingComment(syntheticFirstStatement, ts.SyntaxKind.MultiLineCommentTrivia, commentText, true);
        return transformer_util_1.updateSourceFileNode(sf, ts.createNodeArray(__spread([syntheticFirstStatement], sf.statements)));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZW92ZXJ2aWV3X2NvbW1lbnRfdHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZmlsZW92ZXJ2aWV3X2NvbW1lbnRfdHJhbnNmb3JtZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVILHlDQUFpQztJQUNqQyxpRUFBbUY7SUFDbkYsMkNBQW1DO0lBRW5DOzs7T0FHRztJQUNILElBQU0sNEJBQTRCLEdBQzlCLElBQUksR0FBRyxDQUFDLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFFM0U7Ozs7O09BS0c7SUFDSCxzQ0FBNkMsSUFBWTtRQUN2RCxJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sT0FBTyxLQUFLLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQTNDLENBQTJDLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBSEQsb0VBR0M7SUFFRDs7O09BR0c7SUFDSCxzQ0FBNkMsT0FBaUM7UUFFNUUsT0FBTyxVQUFDLEVBQWlCO1lBQ3ZCLElBQUksUUFBUSxHQUE0QixFQUFFLENBQUM7WUFDM0MsOEZBQThGO1lBQzlGLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDdkYsUUFBUSxHQUFHLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FB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RUFBQztZQUNuRCxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7U0FDbEUsQ0FBQyxDQUFDO1FBQ0gsSUFBSSx1QkFBdUIsR0FBRyw0Q0FBeUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1RCx1QkFBdUIsR0FBRyxFQUFFLENBQUMsMkJBQTJCLENBQ3BELHVCQUF1QixFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3RGLE9BQU8sdUNBQW9CLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxlQUFlLFdBQUUsdUJBQXVCLEdBQUssRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDbkcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMganNkb2MgZnJvbSAnLi9qc2RvYyc7XG5pbXBvcnQge2NyZWF0ZU5vdEVtaXR0ZWRTdGF0ZW1lbnQsIHVwZGF0ZVNvdXJjZUZpbGVOb2RlfSBmcm9tICcuL3RyYW5zZm9ybWVyX3V0aWwnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcblxuLyoqXG4gKiBBIHNldCBvZiBKU0RvYyB0YWdzIHRoYXQgbWFyayBhIGNvbW1lbnQgYXMgYSBmaWxlb3ZlcnZpZXcgY29tbWVudC4gVGhlc2UgYXJlIHJlY29nbml6ZWQgYnkgb3RoZXJcbiAqIHBpZWNlcyBvZiBpbmZyYXN0cnVjdHVyZSAoQ2xvc3VyZSBDb21waWxlciwgbW9kdWxlIHN5c3RlbSwgLi4uKS5cbiAqL1xuY29uc3QgRklMRU9WRVJWSUVXX0NPTU1FTlRfTUFSS0VSUzogUmVhZG9ubHlTZXQ8c3RyaW5nPiA9XG4gICAgbmV3IFNldChbJ2ZpbGVvdmVydmlldycsICdleHRlcm5zJywgJ21vZE5hbWUnLCAnbW9kcycsICdwaW50b21vZHVsZSddKTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIGNvbW1lbnQgaXMgYSBcXEBmaWxlb3ZlcnZpZXcgc3R5bGUgY29tbWVudCBpbiB0aGUgQ2xvc3VyZSBzZW5zZSwgaS5lLiBhXG4gKiBjb21tZW50IHRoYXQgaGFzIEpTRG9jIHRhZ3MgbWFya2luZyBpdCBhcyBhIGZpbGVvdmVydmlldyBjb21tZW50LlxuICogTm90ZSB0aGF0IHRoaXMgaXMgZGlmZmVyZW50IGZyb20gVHlwZVNjcmlwdCdzIHVuZGVyc3RhbmRpbmcgb2YgdGhlIGNvbmNlcHQsIHdoZXJlIGEgZmlsZSBjb21tZW50XG4gKiBpcyBhIGNvbW1lbnQgc2VwYXJhdGVkIGZyb20gdGhlIHJlc3Qgb2YgdGhlIGZpbGUgYnkgYSBkb3VibGUgbmV3bGluZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2xvc3VyZUZpbGVvdmVydmlld0NvbW1lbnQodGV4dDogc3RyaW5nKSB7XG4gIGNvbnN0IGN1cnJlbnQgPSBqc2RvYy5wYXJzZSh0ZXh0KTtcbiAgcmV0dXJuIGN1cnJlbnQgIT09IG51bGwgJiYgY3VycmVudC50YWdzLnNvbWUodCA9PiBGSUxFT1ZFUlZJRVdfQ09NTUVOVF9NQVJLRVJTLmhhcyh0LnRhZ05hbWUpKTtcbn1cblxuLyoqXG4gKiBBIHRyYW5zZm9ybWVyIHRoYXQgZW5zdXJlcyB0aGUgZW1pdHRlZCBKUyBmaWxlIGhhcyBhbiBcXEBmaWxlb3ZlcnZpZXcgY29tbWVudCB0aGF0IGNvbnRhaW5zIGFuXG4gKiBcXEBzdXBwcmVzcyB7Y2hlY2tUeXBlc30gYW5ub3RhdGlvbiBieSBlaXRoZXIgYWRkaW5nIG9yIHVwZGF0aW5nIGFuIGV4aXN0aW5nIGNvbW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1GaWxlb3ZlcnZpZXdDb21tZW50KGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6XG4gICAgKHNmOiB0cy5Tb3VyY2VGaWxlKSA9PiB0cy5Tb3VyY2VGaWxlIHtcbiAgcmV0dXJuIChzZjogdHMuU291cmNlRmlsZSkgPT4ge1xuICAgIGxldCBjb21tZW50czogdHMuU3ludGhlc2l6ZWRDb21tZW50W10gPSBbXTtcbiAgICAvLyBVc2UgdHJhaWxpbmcgY29tbWVudHMgYmVjYXVzZSB0aGF0J3Mgd2hhdCB0cmFuc2Zvcm1lcl91dGlsLnRzIGNyZWF0ZXMgKGkuZS4gYnkgY29udmVudGlvbikuXG4gICAgaWYgKHNmLnN0YXRlbWVudHMubGVuZ3RoICYmIHNmLnN0YXRlbWVudHNbMF0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5Ob3RFbWl0dGVkU3RhdGVtZW50KSB7XG4gICAgICBjb21tZW50cyA9IHRzLmdldFN5bnRoZXRpY1RyYWlsaW5nQ29tbWVudHMoc2Yuc3RhdGVtZW50c1swXSkgfHwgW107XG4gICAgfVxuXG4gICAgbGV0IGZpbGVvdmVydmlld0lkeCA9IC0xO1xuICAgIGxldCBwYXJzZWQ6IHt0YWdzOiBqc2RvYy5UYWdbXX18bnVsbCA9IG51bGw7XG4gICAgZm9yIChsZXQgaSA9IGNvbW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBjdXJyZW50ID0ganNkb2MucGFyc2VDb250ZW50cyhjb21tZW50c1tpXS50ZXh0KTtcbiAgICAgIGlmIChjdXJyZW50ICE9PSBudWxsICYmIGN1cnJlbnQudGFncy5zb21lKHQgPT4gRklMRU9WRVJWSUVXX0NPTU1FTlRfTUFSS0VSUy5oYXModC50YWdOYW1lKSkpIHtcbiAgICAgICAgZmlsZW92ZXJ2aWV3SWR4ID0gaTtcbiAgICAgICAgcGFyc2VkID0gY3VycmVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEFkZCBhIEBzdXBwcmVzcyB7Y2hlY2tUeXBlc30gdGFnIHRvIGVhY2ggc291cmNlIGZpbGUncyBKU0RvYyBjb21tZW50LFxuICAgIC8vIGJlaW5nIGNhcmVmdWwgdG8gcmV0YWluIGV4aXN0aW5nIGNvbW1lbnRzIGFuZCB0aGVpciBAc3VwcHJlc3MnaW9ucy5cbiAgICAvLyBDbG9zdXJlIENvbXBpbGVyIGNvbnNpZGVycyB0aGUgKmxhc3QqIGNvbW1lbnQgd2l0aCBAZmlsZW92ZXJ2aWV3IChvciBAZXh0ZXJucyBvciBAbm9jb21waWxlKVxuICAgIC8vIHRoYXQgaGFzIG5vdCBiZWVuIGF0dGFjaGVkIHRvIHNvbWUgb3RoZXIgdHJlZSBub2RlIHRvIGJlIHRoZSBmaWxlIG92ZXJ2aWV3IGNvbW1lbnQsIGFuZFxuICAgIC8vIG9ubHkgYXBwbGllcyBAc3VwcHJlc3MgdGFncyBmcm9tIGl0LlxuICAgIC8vIEFKRCBjb25zaWRlcnMgKmFueSogY29tbWVudCBtZW50aW9uaW5nIEBmaWxlb3ZlcnZpZXcuXG4gICAgaWYgKCFwYXJzZWQpIHtcbiAgICAgIC8vIE5vIGV4aXN0aW5nIGNvbW1lbnQgdG8gbWVyZ2Ugd2l0aCwganVzdCBlbWl0IGEgbmV3IG9uZS5cbiAgICAgIHJldHVybiBhZGROZXdGaWxlb3ZlcnZpZXdDb21tZW50KHNmKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgQHN1cHByZXNzIHtjaGVja1R5cGVzfSwgb3IgYWRkIHRvIHRoZSBsaXN0IGluIGFuIGV4aXN0aW5nIEBzdXBwcmVzcyB0YWcuXG4gICAgLy8gQ2xvc3VyZSBjb21waWxlciBiYXJmcyBpZiB0aGVyZSdzIGEgZHVwbGljYXRlZCBAc3VwcHJlc3MgdGFnIGluIGEgZmlsZSwgc28gdGhlIHRhZyBtdXN0XG4gICAgLy8gb25seSBhcHBlYXIgb25jZSBhbmQgYmUgbWVyZ2VkLlxuICAgIGNvbnN0IHt0YWdzfSA9IHBhcnNlZDtcbiAgICBjb25zdCBzdXBwcmVzc1RhZyA9IHRhZ3MuZmluZCh0ID0+IHQudGFnTmFtZSA9PT0gJ3N1cHByZXNzJyk7XG4gICAgaWYgKHN1cHByZXNzVGFnKSB7XG4gICAgICBjb25zdCBzdXBwcmVzc2lvbnMgPSBzdXBwcmVzc1RhZy50eXBlIHx8ICcnO1xuICAgICAgY29uc3Qgc3VwcHJlc3Npb25zTGlzdCA9IHN1cHByZXNzaW9ucy5zcGxpdCgnLCcpLm1hcChzID0+IHMudHJpbSgpKTtcbiAgICAgIGlmIChzdXBwcmVzc2lvbnNMaXN0LmluZGV4T2YoJ2NoZWNrVHlwZXMnKSA9PT0gLTEpIHtcbiAgICAgICAgc3VwcHJlc3Npb25zTGlzdC5wdXNoKCdjaGVja1R5cGVzJyk7XG4gICAgICB9XG4gICAgICBzdXBwcmVzc1RhZy50eXBlID0gc3VwcHJlc3Npb25zTGlzdC5qb2luKCcsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhZ3MucHVzaCh7XG4gICAgICAgIHRhZ05hbWU6ICdzdXBwcmVzcycsXG4gICAgICAgIHR5cGU6ICdjaGVja1R5cGVzLGV4dHJhUmVxdWlyZScsXG4gICAgICAgIHRleHQ6ICdjaGVja2VkIGJ5IHRzYycsXG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gQ2xvc3VyZSBjb21waWxlciBmYWlscyBpZiBhIHRhZyBhdCB0aGUgc3RhcnQgb2YgdGhlIGZpbGUgaGFzIEBzdXBwcmVzcyBidXQgbm8gQGZpbGVvdmVydmlldy5cbiAgICBpZiAoIXRhZ3MuZmluZCh0ID0+IHQudGFnTmFtZSA9PT0gJ2ZpbGVvdmVydmlldycpKSB7XG4gICAgICB0YWdzLnB1c2goe3RhZ05hbWU6ICdmaWxlb3ZlcnZpZXcnfSk7XG4gICAgfVxuICAgIGNvbnN0IGNvbW1lbnRUZXh0ID0ganNkb2MudG9TdHJpbmdXaXRob3V0U3RhcnRFbmQodGFncyk7XG4gICAgY29tbWVudHNbZmlsZW92ZXJ2aWV3SWR4XS50ZXh0ID0gY29tbWVudFRleHQ7XG4gICAgLy8gc2YgZG9lcyBub3QgbmVlZCB0byBiZSB1cGRhdGVkLCBzeW50aGVzaXplZCBjb21tZW50cyBhcmUgbXV0YWJsZS5cbiAgICByZXR1cm4gc2Y7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZE5ld0ZpbGVvdmVydmlld0NvbW1lbnQoc2Y6IHRzLlNvdXJjZUZpbGUpOiB0cy5Tb3VyY2VGaWxlIHtcbiAgY29uc3QgY29tbWVudFRleHQgPSBqc2RvYy50b1N0cmluZ1dpdGhvdXRTdGFydEVuZChbXG4gICAge3RhZ05hbWU6ICdmaWxlb3ZlcnZpZXcnLCB0ZXh0OiAnYWRkZWQgYnkgdHNpY2tsZSd9LFxuICAgIHt0YWdOYW1lOiAnc3VwcHJlc3MnLCB0eXBlOiAnY2hlY2tUeXBlcycsIHRleHQ6ICdjaGVja2VkIGJ5IHRzYyd9LFxuICBdKTtcbiAgbGV0IHN5bnRoZXRpY0ZpcnN0U3RhdGVtZW50ID0gY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudChzZik7XG4gIHN5bnRoZXRpY0ZpcnN0U3RhdGVtZW50ID0gdHMuYWRkU3ludGhldGljVHJhaWxpbmdDb21tZW50KFxuICAgICAgc3ludGhldGljRmlyc3RTdGF0ZW1lbnQsIHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSwgY29tbWVudFRleHQsIHRydWUpO1xuICByZXR1cm4gdXBkYXRlU291cmNlRmlsZU5vZGUoc2YsIHRzLmNyZWF0ZU5vZGVBcnJheShbc3ludGhldGljRmlyc3RTdGF0ZW1lbnQsIC4uLnNmLnN0YXRlbWVudHNdKSk7XG59XG4iXX0=