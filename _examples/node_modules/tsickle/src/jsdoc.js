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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/jsdoc", ["require", "exports", "tsickle/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require("tsickle/src/util");
    /**
     * A list of all JSDoc tags allowed by the Closure compiler.
     * The public Closure docs don't list all the tags it allows; this list comes
     * from the compiler source itself.
     * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/parsing/Annotation.java
     * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/parsing/ParserConfig.properties
     */
    var JSDOC_TAGS_WHITELIST = new Set([
        'abstract', 'argument',
        'author', 'consistentIdGenerator',
        'const', 'constant',
        'constructor', 'copyright',
        'define', 'deprecated',
        'desc', 'dict',
        'disposes', 'enhance',
        'enhanceable', 'enum',
        'export', 'expose',
        'extends', 'externs',
        'fileoverview', 'final',
        'hassoydelcall', 'hassoydeltemplate',
        'hidden', 'id',
        'idGenerator', 'ignore',
        'implements', 'implicitCast',
        'inheritDoc', 'interface',
        'jaggerInject', 'jaggerModule',
        'jaggerProvide', 'jaggerProvidePromise',
        'lends', 'license',
        'link', 'meaning',
        'modifies', 'modName',
        'mods', 'ngInject',
        'noalias', 'nocollapse',
        'nocompile', 'nosideeffects',
        'override', 'owner',
        'package', 'param',
        'pintomodule', 'polymerBehavior',
        'preserve', 'preserveTry',
        'private', 'protected',
        'public', 'record',
        'requirecss', 'requires',
        'return', 'returns',
        'see', 'stableIdGenerator',
        'struct', 'suppress',
        'template', 'this',
        'throws', 'type',
        'typedef', 'unrestricted',
        'version', 'wizaction',
        'wizmodule',
    ]);
    /**
     * A list of JSDoc @tags that are never allowed in TypeScript source. These are Closure tags that
     * can be expressed in the TypeScript surface syntax. As tsickle's emit will mangle type names,
     * these will cause Closure Compiler issues and should not be used.
     */
    var JSDOC_TAGS_BLACKLIST = new Set([
        'augments', 'class', 'constructs', 'constructor', 'enum', 'extends', 'field',
        'function', 'implements', 'interface', 'lends', 'namespace', 'private', 'public',
        'record', 'static', 'template', 'this', 'type', 'typedef',
    ]);
    /**
     * A list of JSDoc @tags that might include a {type} after them. Only banned when a type is passed.
     * Note that this does not include tags that carry a non-type system type, e.g. \@suppress.
     */
    var JSDOC_TAGS_WITH_TYPES = new Set([
        'const',
        'export',
        'param',
        'return',
    ]);
    /**
     * parse parses JSDoc out of a comment string.
     * Returns null if comment is not JSDoc.
     */
    // TODO(martinprobst): representing JSDoc as a list of tags is too simplistic. We need functionality
    // such as merging (below), de-duplicating certain tags (@deprecated), and special treatment for
    // others (e.g. @suppress). We should introduce a proper model class with a more suitable data
    // strucure (e.g. a Map<TagName, Values[]>).
    function parse(comment) {
        // Make sure we have proper line endings before parsing on Windows.
        comment = util_1.normalizeLineEndings(comment);
        // TODO(evanm): this is a pile of hacky regexes for now, because we
        // would rather use the better TypeScript implementation of JSDoc
        // parsing.  https://github.com/Microsoft/TypeScript/issues/7393
        var match = comment.match(/^\/\*\*([\s\S]*?)\*\/$/);
        if (!match)
            return null;
        return parseContents(match[1].trim());
    }
    exports.parse = parse;
    /**
     * parseContents parses JSDoc out of a comment text.
     * Returns null if comment is not JSDoc.
     *
     * @param commentText a comment's text content, i.e. the comment w/o /* and * /.
     */
    function parseContents(commentText) {
        // Make sure we have proper line endings before parsing on Windows.
        commentText = util_1.normalizeLineEndings(commentText);
        // Strip all the " * " bits from the front of each line.
        commentText = commentText.replace(/^\s*\*? ?/gm, '');
        var lines = commentText.split('\n');
        var tags = [];
        var warnings = [];
        try {
            for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
                var line = lines_1_1.value;
                var match = line.match(/^\s*@(\S+) *(.*)/);
                if (match) {
                    var _a = __read(match, 3), _ = _a[0], tagName = _a[1], text = _a[2];
                    if (tagName === 'returns') {
                        // A synonym for 'return'.
                        tagName = 'return';
                    }
                    var type = void 0;
                    if (JSDOC_TAGS_BLACKLIST.has(tagName)) {
                        warnings.push("@" + tagName + " annotations are redundant with TypeScript equivalents");
                        continue; // Drop the tag so Closure won't process it.
                    }
                    else if (JSDOC_TAGS_WITH_TYPES.has(tagName) && text[0] === '{') {
                        warnings.push("the type annotation on @" + tagName + " is redundant with its TypeScript type, " +
                            "remove the {...} part");
                        continue;
                    }
                    else if (tagName === 'suppress') {
                        var suppressMatch = text.match(/^\{(.*)\}(.*)$/);
                        if (!suppressMatch) {
                            warnings.push("malformed @suppress tag: \"" + text + "\"");
                        }
                        else {
                            _b = __read(suppressMatch, 3), type = _b[1], text = _b[2];
                        }
                    }
                    else if (tagName === 'dict') {
                        warnings.push('use index signatures (`[k: string]: type`) instead of @dict');
                        continue;
                    }
                    // Grab the parameter name from @param tags.
                    var parameterName = void 0;
                    if (tagName === 'param') {
                        match = text.match(/^(\S+) ?(.*)/);
                        if (match)
                            _c = __read(match, 3), _ = _c[0], parameterName = _c[1], text = _c[2];
                    }
                    var tag = { tagName: tagName };
                    if (parameterName)
                        tag.parameterName = parameterName;
                    if (text)
                        tag.text = text;
                    if (type)
                        tag.type = type;
                    tags.push(tag);
                }
                else {
                    // Text without a preceding @tag on it is either the plain text
                    // documentation or a continuation of a previous tag.
                    if (tags.length === 0) {
                        tags.push({ tagName: '', text: line });
                    }
                    else {
                        var lastTag = tags[tags.length - 1];
                        lastTag.text = (lastTag.text || '') + '\n' + line;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (lines_1_1 && !lines_1_1.done && (_d = lines_1.return)) _d.call(lines_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (warnings.length > 0) {
            return { tags: tags, warnings: warnings };
        }
        return { tags: tags };
        var e_1, _d, _b, _c;
    }
    exports.parseContents = parseContents;
    /**
     * Serializes a Tag into a string usable in a comment.
     * Returns a string like " @foo {bar} baz" (note the whitespace).
     */
    function tagToString(tag, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        var out = '';
        if (tag.tagName) {
            if (!JSDOC_TAGS_WHITELIST.has(tag.tagName) || escapeExtraTags.has(tag.tagName)) {
                // Escape tags we don't understand.  This is a subtle
                // compromise between multiple issues.
                // 1) If we pass through these non-Closure tags, the user will
                //    get a warning from Closure, and the point of tsickle is
                //    to insulate the user from Closure.
                // 2) The output of tsickle is for Closure but also may be read
                //    by humans, for example non-TypeScript users of Angular.
                // 3) Finally, we don't want to warn because users should be
                //    free to add whichever JSDoc they feel like.  If the user
                //    wants help ensuring they didn't typo a tag, that is the
                //    responsibility of a linter.
                out += " \\@" + tag.tagName;
            }
            else {
                out += " @" + tag.tagName;
            }
        }
        if (tag.type) {
            out += ' {';
            if (tag.restParam) {
                out += '...';
            }
            out += tag.type;
            if (tag.optional) {
                out += '=';
            }
            out += '}';
        }
        if (tag.parameterName) {
            out += ' ' + tag.parameterName;
        }
        if (tag.text) {
            out += ' ' + tag.text.replace(/@/g, '\\@');
        }
        return out;
    }
    /** Tags that must only occur onces in a comment (filtered below). */
    var SINGLETON_TAGS = new Set(['deprecated']);
    /** Serializes a Comment out to a string, but does not include the start and end comment tokens. */
    function toStringWithoutStartEnd(tags, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        return serialize(tags, false, escapeExtraTags);
    }
    exports.toStringWithoutStartEnd = toStringWithoutStartEnd;
    /** Serializes a Comment out to a string usable in source code. */
    function toString(tags, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        return serialize(tags, true, escapeExtraTags);
    }
    exports.toString = toString;
    function serialize(tags, includeStartEnd, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        if (tags.length === 0)
            return '';
        if (tags.length === 1) {
            var tag = tags[0];
            if ((tag.tagName === 'type' || tag.tagName === 'nocollapse') &&
                (!tag.text || !tag.text.match('\n'))) {
                // Special-case one-liner "type" and "nocollapse" tags to fit on one line, e.g.
                //   /** @type {foo} */
                return '/**' + tagToString(tag, escapeExtraTags) + ' */\n';
            }
            // Otherwise, fall through to the multi-line output.
        }
        var out = includeStartEnd ? '/**\n' : '*\n';
        var emitted = new Set();
        try {
            for (var tags_1 = __values(tags), tags_1_1 = tags_1.next(); !tags_1_1.done; tags_1_1 = tags_1.next()) {
                var tag = tags_1_1.value;
                if (emitted.has(tag.tagName) && SINGLETON_TAGS.has(tag.tagName)) {
                    continue;
                }
                emitted.add(tag.tagName);
                out += ' *';
                // If the tagToString is multi-line, insert " * " prefixes on subsequent lines.
                out += tagToString(tag, escapeExtraTags).split('\n').join('\n * ');
                out += '\n';
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (tags_1_1 && !tags_1_1.done && (_a = tags_1.return)) _a.call(tags_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        out += includeStartEnd ? ' */\n' : ' ';
        return out;
        var e_2, _a;
    }
    /** Merges multiple tags (of the same tagName type) into a single unified tag. */
    function merge(tags) {
        var tagNames = new Set();
        var parameterNames = new Set();
        var types = new Set();
        var texts = new Set();
        // If any of the tags are optional/rest, then the merged output is optional/rest.
        var optional = false;
        var restParam = false;
        try {
            for (var tags_2 = __values(tags), tags_2_1 = tags_2.next(); !tags_2_1.done; tags_2_1 = tags_2.next()) {
                var tag_1 = tags_2_1.value;
                if (tag_1.tagName)
                    tagNames.add(tag_1.tagName);
                if (tag_1.parameterName)
                    parameterNames.add(tag_1.parameterName);
                if (tag_1.type)
                    types.add(tag_1.type);
                if (tag_1.text)
                    texts.add(tag_1.text);
                if (tag_1.optional)
                    optional = true;
                if (tag_1.restParam)
                    restParam = true;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (tags_2_1 && !tags_2_1.done && (_a = tags_2.return)) _a.call(tags_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
        if (tagNames.size !== 1) {
            throw new Error("cannot merge differing tags: " + JSON.stringify(tags));
        }
        var tagName = tagNames.values().next().value;
        var parameterName = parameterNames.size > 0 ? Array.from(parameterNames).join('_or_') : undefined;
        var type = types.size > 0 ? Array.from(types).join('|') : undefined;
        var text = texts.size > 0 ? Array.from(texts).join(' / ') : undefined;
        var tag = { tagName: tagName, parameterName: parameterName, type: type, text: text };
        // Note: a param can either be optional or a rest param; if we merged an
        // optional and rest param together, prefer marking it as a rest param.
        if (restParam) {
            tag.restParam = true;
        }
        else if (optional) {
            tag.optional = true;
        }
        return tag;
        var e_3, _a;
    }
    exports.merge = merge;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNkb2MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvanNkb2MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVILHlDQUE0QztJQXNDNUM7Ozs7OztPQU1HO0lBQ0gsSUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBQztRQUNuQyxVQUFVLEVBQU8sVUFBVTtRQUMzQixRQUFRLEVBQVMsdUJBQXVCO1FBQ3hDLE9BQU8sRUFBVSxVQUFVO1FBQzNCLGFBQWEsRUFBSSxXQUFXO1FBQzVCLFFBQVEsRUFBUyxZQUFZO1FBQzdCLE1BQU0sRUFBVyxNQUFNO1FBQ3ZCLFVBQVUsRUFBTyxTQUFTO1FBQzFCLGFBQWEsRUFBSSxNQUFNO1FBQ3ZCLFFBQVEsRUFBUyxRQUFRO1FBQ3pCLFNBQVMsRUFBUSxTQUFTO1FBQzFCLGNBQWMsRUFBRyxPQUFPO1FBQ3hCLGVBQWUsRUFBRSxtQkFBbUI7UUFDcEMsUUFBUSxFQUFTLElBQUk7UUFDckIsYUFBYSxFQUFJLFFBQVE7UUFDekIsWUFBWSxFQUFLLGNBQWM7UUFDL0IsWUFBWSxFQUFLLFdBQVc7UUFDNUIsY0FBYyxFQUFHLGNBQWM7UUFDL0IsZUFBZSxFQUFFLHNCQUFzQjtRQUN2QyxPQUFPLEVBQVUsU0FBUztRQUMxQixNQUFNLEVBQVcsU0FBUztRQUMxQixVQUFVLEVBQU8sU0FBUztRQUMxQixNQUFNLEVBQVcsVUFBVTtRQUMzQixTQUFTLEVBQVEsWUFBWTtRQUM3QixXQUFXLEVBQU0sZUFBZTtRQUNoQyxVQUFVLEVBQU8sT0FBTztRQUN4QixTQUFTLEVBQVEsT0FBTztRQUN4QixhQUFhLEVBQUksaUJBQWlCO1FBQ2xDLFVBQVUsRUFBTyxhQUFhO1FBQzlCLFNBQVMsRUFBUSxXQUFXO1FBQzVCLFFBQVEsRUFBUyxRQUFRO1FBQ3pCLFlBQVksRUFBSyxVQUFVO1FBQzNCLFFBQVEsRUFB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Qzs7SUFDYixDQUFDO0lBbENELHNCQWtDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtub3JtYWxpemVMaW5lRW5kaW5nc30gZnJvbSAnLi91dGlsJztcblxuLyoqXG4gKiBUeXBlU2NyaXB0IGhhcyBhbiBBUEkgZm9yIEpTRG9jIGFscmVhZHksIGJ1dCBpdCdzIG5vdCBleHBvc2VkLlxuICogaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy83MzkzXG4gKiBGb3Igbm93IHdlIGNyZWF0ZSB0eXBlcyB0aGF0IGFyZSBzaW1pbGFyIHRvIHRoZWlycyBzbyB0aGF0IG1pZ3JhdGluZ1xuICogdG8gdGhlaXIgQVBJIHdpbGwgYmUgZWFzaWVyLiAgU2VlIGUuZy4gdHMuSlNEb2NUYWcgYW5kIHRzLkpTRG9jQ29tbWVudC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUYWcge1xuICAvKipcbiAgICogdGFnTmFtZSBpcyBlLmcuIFwicGFyYW1cIiBpbiBhbiBAcGFyYW0gZGVjbGFyYXRpb24uICBJdCBpcyB0aGUgZW1wdHkgc3RyaW5nXG4gICAqIGZvciB0aGUgcGxhaW4gdGV4dCBkb2N1bWVudGF0aW9uIHRoYXQgb2NjdXJzIGJlZm9yZSBhbnkgQGZvbyBsaW5lcy5cbiAgICovXG4gIHRhZ05hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIHBhcmFtZXRlck5hbWUgaXMgdGhlIHRoZSBuYW1lIG9mIHRoZSBmdW5jdGlvbiBwYXJhbWV0ZXIsIGUuZy4gXCJmb29cIlxuICAgKiBpbiBgXFxAcGFyYW0gZm9vIFRoZSBmb28gcGFyYW1gXG4gICAqL1xuICBwYXJhbWV0ZXJOYW1lPzogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIHR5cGUgb2YgYSBKU0RvYyBcXEBwYXJhbSwgXFxAdHlwZSBldGMgdGFnLCByZW5kZXJlZCBpbiBjdXJseSBicmFjZXMuXG4gICAqIENhbiBhbHNvIGhvbGQgdGhlIHR5cGUgb2YgYW4gXFxAc3VwcHJlc3MuXG4gICAqL1xuICB0eXBlPzogc3RyaW5nO1xuICAvKiogb3B0aW9uYWwgaXMgdHJ1ZSBmb3Igb3B0aW9uYWwgZnVuY3Rpb24gcGFyYW1ldGVycy4gKi9cbiAgb3B0aW9uYWw/OiBib29sZWFuO1xuICAvKiogcmVzdFBhcmFtIGlzIHRydWUgZm9yIFwiLi4ueDogZm9vW11cIiBmdW5jdGlvbiBwYXJhbWV0ZXJzLiAqL1xuICByZXN0UGFyYW0/OiBib29sZWFuO1xuICAvKipcbiAgICogZGVzdHJ1Y3R1cmluZyBpcyB0cnVlIGZvciBkZXN0cnVjdHVyaW5nIGJpbmQgcGFyYW1ldGVycywgd2hpY2ggcmVxdWlyZVxuICAgKiBub24tbnVsbCBhcmd1bWVudHMgb24gdGhlIENsb3N1cmUgc2lkZS4gIENhbiBsaWtlbHkgcmVtb3ZlIHRoaXNcbiAgICogb25jZSBUeXBlU2NyaXB0IG51bGxhYmxlIHR5cGVzIGFyZSBhdmFpbGFibGUuXG4gICAqL1xuICBkZXN0cnVjdHVyaW5nPzogYm9vbGVhbjtcbiAgLyoqIEFueSByZW1haW5pbmcgdGV4dCBvbiB0aGUgdGFnLCBlLmcuIHRoZSBkZXNjcmlwdGlvbi4gKi9cbiAgdGV4dD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBBIGxpc3Qgb2YgYWxsIEpTRG9jIHRhZ3MgYWxsb3dlZCBieSB0aGUgQ2xvc3VyZSBjb21waWxlci5cbiAqIFRoZSBwdWJsaWMgQ2xvc3VyZSBkb2NzIGRvbid0IGxpc3QgYWxsIHRoZSB0YWdzIGl0IGFsbG93czsgdGhpcyBsaXN0IGNvbWVzXG4gKiBmcm9tIHRoZSBjb21waWxlciBzb3VyY2UgaXRzZWxmLlxuICogaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9jbG9zdXJlLWNvbXBpbGVyL2Jsb2IvbWFzdGVyL3NyYy9jb20vZ29vZ2xlL2phdmFzY3JpcHQvanNjb21wL3BhcnNpbmcvQW5ub3RhdGlvbi5qYXZhXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL2Nsb3N1cmUtY29tcGlsZXIvYmxvYi9tYXN0ZXIvc3JjL2NvbS9nb29nbGUvamF2YXNjcmlwdC9qc2NvbXAvcGFyc2luZy9QYXJzZXJDb25maWcucHJvcGVydGllc1xuICovXG5jb25zdCBKU0RPQ19UQUdTX1dISVRFTElTVCA9IG5ldyBTZXQoW1xuICAnYWJzdHJhY3QnLCAgICAgICdhcmd1bWVudCcsXG4gICdhdXRob3InLCAgICAgICAgJ2NvbnNpc3RlbnRJZEdlbmVyYXRvcicsXG4gICdjb25zdCcsICAgICAgICAgJ2NvbnN0YW50JyxcbiAgJ2NvbnN0cnVjdG9yJywgICAnY29weXJpZ2h0JyxcbiAgJ2RlZmluZScsICAgICAgICAnZGVwcmVjYXRlZCcsXG4gICdkZXNjJywgICAgICAgICAgJ2RpY3QnLFxuICAnZGlzcG9zZXMnLCAgICAgICdlbmhhbmNlJyxcbiAgJ2VuaGFuY2VhYmxlJywgICAnZW51bScsXG4gICdleHBvcnQnLCAgICAgICAgJ2V4cG9zZScsXG4gICdleHRlbmRzJywgICAgICAgJ2V4dGVybnMnLFxuICAnZmlsZW92ZXJ2aWV3JywgICdmaW5hbCcsXG4gICdoYXNzb3lkZWxjYWxsJywgJ2hhc3NveWRlbHRlbXBsYXRlJyxcbiAgJ2hpZGRlbicsICAgICAgICAnaWQnLFxuICAnaWRHZW5lcmF0b3InLCAgICdpZ25vcmUnLFxuICAnaW1wbGVtZW50cycsICAgICdpbXBsaWNpdENhc3QnLFxuICAnaW5oZXJpdERvYycsICAgICdpbnRlcmZhY2UnLFxuICAnamFnZ2VySW5qZWN0JywgICdqYWdnZXJNb2R1bGUnLFxuICAnamFnZ2VyUHJvdmlkZScsICdqYWdnZXJQcm92aWRlUHJvbWlzZScsXG4gICdsZW5kcycsICAgICAgICAgJ2xpY2Vuc2UnLFxuICAnbGluaycsICAgICAgICAgICdtZWFuaW5nJyxcbiAgJ21vZGlmaWVzJywgICAgICAnbW9kTmFtZScsXG4gICdtb2RzJywgICAgICAgICAgJ25nSW5qZWN0JyxcbiAgJ25vYWxpYXMnLCAgICAgICAnbm9jb2xsYXBzZScsXG4gICdub2NvbXBpbGUnLCAgICAgJ25vc2lkZWVmZmVjdHMnLFxuICAnb3ZlcnJpZGUnLCAgICAgICdvd25lcicsXG4gICdwYWNrYWdlJywgICAgICAgJ3BhcmFtJyxcbiAgJ3BpbnRvbW9kdWxlJywgICAncG9seW1lckJlaGF2aW9yJyxcbiAgJ3ByZXNlcnZlJywgICAgICAncHJlc2VydmVUcnknLFxuICAncHJpdmF0ZScsICAgICAgICdwcm90ZWN0ZWQnLFxuICAncHVibGljJywgICAgICAgICdyZWNvcmQnLFxuICAncmVxdWlyZWNzcycsICAgICdyZXF1aXJlcycsXG4gICdyZXR1cm4nLCAgICAgICAgJ3JldHVybnMnLFxuICAnc2VlJywgICAgICAgICAgICdzdGFibGVJZEdlbmVyYXRvcicsXG4gICdzdHJ1Y3QnLCAgICAgICAgJ3N1cHByZXNzJyxcbiAgJ3RlbXBsYXRlJywgICAgICAndGhpcycsXG4gICd0aHJvd3MnLCAgICAgICAgJ3R5cGUnLFxuICAndHlwZWRlZicsICAgICAgICd1bnJlc3RyaWN0ZWQnLFxuICAndmVyc2lvbicsICAgICAgICd3aXphY3Rpb24nLFxuICAnd2l6bW9kdWxlJyxcbl0pO1xuXG4vKipcbiAqIEEgbGlzdCBvZiBKU0RvYyBAdGFncyB0aGF0IGFyZSBuZXZlciBhbGxvd2VkIGluIFR5cGVTY3JpcHQgc291cmNlLiBUaGVzZSBhcmUgQ2xvc3VyZSB0YWdzIHRoYXRcbiAqIGNhbiBiZSBleHByZXNzZWQgaW4gdGhlIFR5cGVTY3JpcHQgc3VyZmFjZSBzeW50YXguIEFzIHRzaWNrbGUncyBlbWl0IHdpbGwgbWFuZ2xlIHR5cGUgbmFtZXMsXG4gKiB0aGVzZSB3aWxsIGNhdXNlIENsb3N1cmUgQ29tcGlsZXIgaXNzdWVzIGFuZCBzaG91bGQgbm90IGJlIHVzZWQuXG4gKi9cbmNvbnN0IEpTRE9DX1RBR1NfQkxBQ0tMSVNUID0gbmV3IFNldChbXG4gICdhdWdtZW50cycsICdjbGFzcycsICAgICAgJ2NvbnN0cnVjdHMnLCAnY29uc3RydWN0b3InLCAnZW51bScsICAgICAgJ2V4dGVuZHMnLCAnZmllbGQnLFxuICAnZnVuY3Rpb24nLCAnaW1wbGVtZW50cycsICdpbnRlcmZhY2UnLCAgJ2xlbmRzJywgICAgICAgJ25hbWVzcGFjZScsICdwcml2YXRlJywgJ3B1YmxpYycsXG4gICdyZWNvcmQnLCAgICdzdGF0aWMnLCAgICAgJ3RlbXBsYXRlJywgICAndGhpcycsICAgICAgICAndHlwZScsICAgICAgJ3R5cGVkZWYnLFxuXSk7XG5cbi8qKlxuICogQSBsaXN0IG9mIEpTRG9jIEB0YWdzIHRoYXQgbWlnaHQgaW5jbHVkZSBhIHt0eXBlfSBhZnRlciB0aGVtLiBPbmx5IGJhbm5lZCB3aGVuIGEgdHlwZSBpcyBwYXNzZWQuXG4gKiBOb3RlIHRoYXQgdGhpcyBkb2VzIG5vdCBpbmNsdWRlIHRhZ3MgdGhhdCBjYXJyeSBhIG5vbi10eXBlIHN5c3RlbSB0eXBlLCBlLmcuIFxcQHN1cHByZXNzLlxuICovXG5jb25zdCBKU0RPQ19UQUdTX1dJVEhfVFlQRVMgPSBuZXcgU2V0KFtcbiAgJ2NvbnN0JyxcbiAgJ2V4cG9ydCcsXG4gICdwYXJhbScsXG4gICdyZXR1cm4nLFxuXSk7XG5cbi8qKlxuICogUmVzdWx0IG9mIHBhcnNpbmcgYSBKU0RvYyBjb21tZW50LiBTdWNoIGNvbW1lbnRzIGVzc2VudGlhbGx5IGFyZSBidWlsdCBvZiBhIGxpc3Qgb2YgdGFncy5cbiAqIEluIGFkZGl0aW9uIHRvIHRoZSB0YWdzLCB0aGlzIG1pZ2h0IGFsc28gY29udGFpbiB3YXJuaW5ncyB0byBpbmRpY2F0ZSBub24tZmF0YWwgcHJvYmxlbXNcbiAqIHdoaWxlIGZpbmRpbmcgdGhlIHRhZ3MuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkSlNEb2NDb21tZW50IHtcbiAgdGFnczogVGFnW107XG4gIHdhcm5pbmdzPzogc3RyaW5nW107XG59XG5cbi8qKlxuICogcGFyc2UgcGFyc2VzIEpTRG9jIG91dCBvZiBhIGNvbW1lbnQgc3RyaW5nLlxuICogUmV0dXJucyBudWxsIGlmIGNvbW1lbnQgaXMgbm90IEpTRG9jLlxuICovXG4vLyBUT0RPKG1hcnRpbnByb2JzdCk6IHJlcHJlc2VudGluZyBKU0RvYyBhcyBhIGxpc3Qgb2YgdGFncyBpcyB0b28gc2ltcGxpc3RpYy4gV2UgbmVlZCBmdW5jdGlvbmFsaXR5XG4vLyBzdWNoIGFzIG1lcmdpbmcgKGJlbG93KSwgZGUtZHVwbGljYXRpbmcgY2VydGFpbiB0YWdzIChAZGVwcmVjYXRlZCksIGFuZCBzcGVjaWFsIHRyZWF0bWVudCBmb3Jcbi8vIG90aGVycyAoZS5nLiBAc3VwcHJlc3MpLiBXZSBzaG91bGQgaW50cm9kdWNlIGEgcHJvcGVyIG1vZGVsIGNsYXNzIHdpdGggYSBtb3JlIHN1aXRhYmxlIGRhdGFcbi8vIHN0cnVjdXJlIChlLmcuIGEgTWFwPFRhZ05hbWUsIFZhbHVlc1tdPikuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UoY29tbWVudDogc3RyaW5nKTogUGFyc2VkSlNEb2NDb21tZW50fG51bGwge1xuICAvLyBNYWtlIHN1cmUgd2UgaGF2ZSBwcm9wZXIgbGluZSBlbmRpbmdzIGJlZm9yZSBwYXJzaW5nIG9uIFdpbmRvd3MuXG4gIGNvbW1lbnQgPSBub3JtYWxpemVMaW5lRW5kaW5ncyhjb21tZW50KTtcbiAgLy8gVE9ETyhldmFubSk6IHRoaXMgaXMgYSBwaWxlIG9mIGhhY2t5IHJlZ2V4ZXMgZm9yIG5vdywgYmVjYXVzZSB3ZVxuICAvLyB3b3VsZCByYXRoZXIgdXNlIHRoZSBiZXR0ZXIgVHlwZVNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiBKU0RvY1xuICAvLyBwYXJzaW5nLiAgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy83MzkzXG4gIGNvbnN0IG1hdGNoID0gY29tbWVudC5tYXRjaCgvXlxcL1xcKlxcKihbXFxzXFxTXSo/KVxcKlxcLyQvKTtcbiAgaWYgKCFtYXRjaCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiBwYXJzZUNvbnRlbnRzKG1hdGNoWzFdLnRyaW0oKSk7XG59XG5cbi8qKlxuICogcGFyc2VDb250ZW50cyBwYXJzZXMgSlNEb2Mgb3V0IG9mIGEgY29tbWVudCB0ZXh0LlxuICogUmV0dXJucyBudWxsIGlmIGNvbW1lbnQgaXMgbm90IEpTRG9jLlxuICpcbiAqIEBwYXJhbSBjb21tZW50VGV4dCBhIGNvbW1lbnQncyB0ZXh0IGNvbnRlbnQsIGkuZS4gdGhlIGNvbW1lbnQgdy9vIC8qIGFuZCAqIC8uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbnRlbnRzKGNvbW1lbnRUZXh0OiBzdHJpbmcpOiB7dGFnczogVGFnW10sIHdhcm5pbmdzPzogc3RyaW5nW119fG51bGwge1xuICAvLyBNYWtlIHN1cmUgd2UgaGF2ZSBwcm9wZXIgbGluZSBlbmRpbmdzIGJlZm9yZSBwYXJzaW5nIG9uIFdpbmRvd3MuXG4gIGNvbW1lbnRUZXh0ID0gbm9ybWFsaXplTGluZUVuZGluZ3MoY29tbWVudFRleHQpO1xuICAvLyBTdHJpcCBhbGwgdGhlIFwiICogXCIgYml0cyBmcm9tIHRoZSBmcm9udCBvZiBlYWNoIGxpbmUuXG4gIGNvbW1lbnRUZXh0ID0gY29tbWVudFRleHQucmVwbGFjZSgvXlxccypcXCo/ID8vZ20sICcnKTtcbiAgY29uc3QgbGluZXMgPSBjb21tZW50VGV4dC5zcGxpdCgnXFxuJyk7XG4gIGNvbnN0IHRhZ3M6IFRhZ1tdID0gW107XG4gIGNvbnN0IHdhcm5pbmdzOiBzdHJpbmdbXSA9IFtdO1xuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBsZXQgbWF0Y2ggPSBsaW5lLm1hdGNoKC9eXFxzKkAoXFxTKykgKiguKikvKTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIGxldCBbXywgdGFnTmFtZSwgdGV4dF0gPSBtYXRjaDtcbiAgICAgIGlmICh0YWdOYW1lID09PSAncmV0dXJucycpIHtcbiAgICAgICAgLy8gQSBzeW5vbnltIGZvciAncmV0dXJuJy5cbiAgICAgICAgdGFnTmFtZSA9ICdyZXR1cm4nO1xuICAgICAgfVxuICAgICAgbGV0IHR5cGU6IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgICBpZiAoSlNET0NfVEFHU19CTEFDS0xJU1QuaGFzKHRhZ05hbWUpKSB7XG4gICAgICAgIHdhcm5pbmdzLnB1c2goYEAke3RhZ05hbWV9IGFubm90YXRpb25zIGFyZSByZWR1bmRhbnQgd2l0aCBUeXBlU2NyaXB0IGVxdWl2YWxlbnRzYCk7XG4gICAgICAgIGNvbnRpbnVlOyAgLy8gRHJvcCB0aGUgdGFnIHNvIENsb3N1cmUgd29uJ3QgcHJvY2VzcyBpdC5cbiAgICAgIH0gZWxzZSBpZiAoSlNET0NfVEFHU19XSVRIX1RZUEVTLmhhcyh0YWdOYW1lKSAmJiB0ZXh0WzBdID09PSAneycpIHtcbiAgICAgICAgd2FybmluZ3MucHVzaChcbiAgICAgICAgICAgIGB0aGUgdHlwZSBhbm5vdGF0aW9uIG9uIEAke3RhZ05hbWV9IGlzIHJlZHVuZGFudCB3aXRoIGl0cyBUeXBlU2NyaXB0IHR5cGUsIGAgK1xuICAgICAgICAgICAgYHJlbW92ZSB0aGUgey4uLn0gcGFydGApO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSBpZiAodGFnTmFtZSA9PT0gJ3N1cHByZXNzJykge1xuICAgICAgICBjb25zdCBzdXBwcmVzc01hdGNoID0gdGV4dC5tYXRjaCgvXlxceyguKilcXH0oLiopJC8pO1xuICAgICAgICBpZiAoIXN1cHByZXNzTWF0Y2gpIHtcbiAgICAgICAgICB3YXJuaW5ncy5wdXNoKGBtYWxmb3JtZWQgQHN1cHByZXNzIHRhZzogXCIke3RleHR9XCJgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBbLCB0eXBlLCB0ZXh0XSA9IHN1cHByZXNzTWF0Y2g7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGFnTmFtZSA9PT0gJ2RpY3QnKSB7XG4gICAgICAgIHdhcm5pbmdzLnB1c2goJ3VzZSBpbmRleCBzaWduYXR1cmVzIChgW2s6IHN0cmluZ106IHR5cGVgKSBpbnN0ZWFkIG9mIEBkaWN0Jyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBHcmFiIHRoZSBwYXJhbWV0ZXIgbmFtZSBmcm9tIEBwYXJhbSB0YWdzLlxuICAgICAgbGV0IHBhcmFtZXRlck5hbWU6IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgICBpZiAodGFnTmFtZSA9PT0gJ3BhcmFtJykge1xuICAgICAgICBtYXRjaCA9IHRleHQubWF0Y2goL14oXFxTKykgPyguKikvKTtcbiAgICAgICAgaWYgKG1hdGNoKSBbXywgcGFyYW1ldGVyTmFtZSwgdGV4dF0gPSBtYXRjaDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGFnOiBUYWcgPSB7dGFnTmFtZX07XG4gICAgICBpZiAocGFyYW1ldGVyTmFtZSkgdGFnLnBhcmFtZXRlck5hbWUgPSBwYXJhbWV0ZXJOYW1lO1xuICAgICAgaWYgKHRleHQpIHRhZy50ZXh0ID0gdGV4dDtcbiAgICAgIGlmICh0eXBlKSB0YWcudHlwZSA9IHR5cGU7XG4gICAgICB0YWdzLnB1c2godGFnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGV4dCB3aXRob3V0IGEgcHJlY2VkaW5nIEB0YWcgb24gaXQgaXMgZWl0aGVyIHRoZSBwbGFpbiB0ZXh0XG4gICAgICAvLyBkb2N1bWVudGF0aW9uIG9yIGEgY29udGludWF0aW9uIG9mIGEgcHJldmlvdXMgdGFnLlxuICAgICAgaWYgKHRhZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRhZ3MucHVzaCh7dGFnTmFtZTogJycsIHRleHQ6IGxpbmV9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxhc3RUYWcgPSB0YWdzW3RhZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgIGxhc3RUYWcudGV4dCA9IChsYXN0VGFnLnRleHQgfHwgJycpICsgJ1xcbicgKyBsaW5lO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAod2FybmluZ3MubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiB7dGFncywgd2FybmluZ3N9O1xuICB9XG4gIHJldHVybiB7dGFnc307XG59XG5cbi8qKlxuICogU2VyaWFsaXplcyBhIFRhZyBpbnRvIGEgc3RyaW5nIHVzYWJsZSBpbiBhIGNvbW1lbnQuXG4gKiBSZXR1cm5zIGEgc3RyaW5nIGxpa2UgXCIgQGZvbyB7YmFyfSBiYXpcIiAobm90ZSB0aGUgd2hpdGVzcGFjZSkuXG4gKi9cbmZ1bmN0aW9uIHRhZ1RvU3RyaW5nKHRhZzogVGFnLCBlc2NhcGVFeHRyYVRhZ3MgPSBuZXcgU2V0PHN0cmluZz4oKSk6IHN0cmluZyB7XG4gIGxldCBvdXQgPSAnJztcbiAgaWYgKHRhZy50YWdOYW1lKSB7XG4gICAgaWYgKCFKU0RPQ19UQUdTX1dISVRFTElTVC5oYXModGFnLnRhZ05hbWUpIHx8IGVzY2FwZUV4dHJhVGFncy5oYXModGFnLnRhZ05hbWUpKSB7XG4gICAgICAvLyBFc2NhcGUgdGFncyB3ZSBkb24ndCB1bmRlcnN0YW5kLiAgVGhpcyBpcyBhIHN1YnRsZVxuICAgICAgLy8gY29tcHJvbWlzZSBiZXR3ZWVuIG11bHRpcGxlIGlzc3Vlcy5cbiAgICAgIC8vIDEpIElmIHdlIHBhc3MgdGhyb3VnaCB0aGVzZSBub24tQ2xvc3VyZSB0YWdzLCB0aGUgdXNlciB3aWxsXG4gICAgICAvLyAgICBnZXQgYSB3YXJuaW5nIGZyb20gQ2xvc3VyZSwgYW5kIHRoZSBwb2ludCBvZiB0c2lja2xlIGlzXG4gICAgICAvLyAgICB0byBpbnN1bGF0ZSB0aGUgdXNlciBmcm9tIENsb3N1cmUuXG4gICAgICAvLyAyKSBUaGUgb3V0cHV0IG9mIHRzaWNrbGUgaXMgZm9yIENsb3N1cmUgYnV0IGFsc28gbWF5IGJlIHJlYWRcbiAgICAgIC8vICAgIGJ5IGh1bWFucywgZm9yIGV4YW1wbGUgbm9uLVR5cGVTY3JpcHQgdXNlcnMgb2YgQW5ndWxhci5cbiAgICAgIC8vIDMpIEZpbmFsbHksIHdlIGRvbid0IHdhbnQgdG8gd2FybiBiZWNhdXNlIHVzZXJzIHNob3VsZCBiZVxuICAgICAgLy8gICAgZnJlZSB0byBhZGQgd2hpY2hldmVyIEpTRG9jIHRoZXkgZmVlbCBsaWtlLiAgSWYgdGhlIHVzZXJcbiAgICAgIC8vICAgIHdhbnRzIGhlbHAgZW5zdXJpbmcgdGhleSBkaWRuJ3QgdHlwbyBhIHRhZywgdGhhdCBpcyB0aGVcbiAgICAgIC8vICAgIHJlc3BvbnNpYmlsaXR5IG9mIGEgbGludGVyLlxuICAgICAgb3V0ICs9IGAgXFxcXEAke3RhZy50YWdOYW1lfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBgIEAke3RhZy50YWdOYW1lfWA7XG4gICAgfVxuICB9XG4gIGlmICh0YWcudHlwZSkge1xuICAgIG91dCArPSAnIHsnO1xuICAgIGlmICh0YWcucmVzdFBhcmFtKSB7XG4gICAgICBvdXQgKz0gJy4uLic7XG4gICAgfVxuICAgIG91dCArPSB0YWcudHlwZTtcbiAgICBpZiAodGFnLm9wdGlvbmFsKSB7XG4gICAgICBvdXQgKz0gJz0nO1xuICAgIH1cbiAgICBvdXQgKz0gJ30nO1xuICB9XG4gIGlmICh0YWcucGFyYW1ldGVyTmFtZSkge1xuICAgIG91dCArPSAnICcgKyB0YWcucGFyYW1ldGVyTmFtZTtcbiAgfVxuICBpZiAodGFnLnRleHQpIHtcbiAgICBvdXQgKz0gJyAnICsgdGFnLnRleHQucmVwbGFjZSgvQC9nLCAnXFxcXEAnKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKiogVGFncyB0aGF0IG11c3Qgb25seSBvY2N1ciBvbmNlcyBpbiBhIGNvbW1lbnQgKGZpbHRlcmVkIGJlbG93KS4gKi9cbmNvbnN0IFNJTkdMRVRPTl9UQUdTID0gbmV3IFNldChbJ2RlcHJlY2F0ZWQnXSk7XG5cbi8qKiBTZXJpYWxpemVzIGEgQ29tbWVudCBvdXQgdG8gYSBzdHJpbmcsIGJ1dCBkb2VzIG5vdCBpbmNsdWRlIHRoZSBzdGFydCBhbmQgZW5kIGNvbW1lbnQgdG9rZW5zLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvU3RyaW5nV2l0aG91dFN0YXJ0RW5kKHRhZ3M6IFRhZ1tdLCBlc2NhcGVFeHRyYVRhZ3MgPSBuZXcgU2V0PHN0cmluZz4oKSk6IHN0cmluZyB7XG4gIHJldHVybiBzZXJpYWxpemUodGFncywgZmFsc2UsIGVzY2FwZUV4dHJhVGFncyk7XG59XG5cbi8qKiBTZXJpYWxpemVzIGEgQ29tbWVudCBvdXQgdG8gYSBzdHJpbmcgdXNhYmxlIGluIHNvdXJjZSBjb2RlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvU3RyaW5nKHRhZ3M6IFRhZ1tdLCBlc2NhcGVFeHRyYVRhZ3MgPSBuZXcgU2V0PHN0cmluZz4oKSk6IHN0cmluZyB7XG4gIHJldHVybiBzZXJpYWxpemUodGFncywgdHJ1ZSwgZXNjYXBlRXh0cmFUYWdzKTtcbn1cblxuZnVuY3Rpb24gc2VyaWFsaXplKFxuICAgIHRhZ3M6IFRhZ1tdLCBpbmNsdWRlU3RhcnRFbmQ6IGJvb2xlYW4sIGVzY2FwZUV4dHJhVGFncyA9IG5ldyBTZXQ8c3RyaW5nPigpKTogc3RyaW5nIHtcbiAgaWYgKHRhZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gJyc7XG4gIGlmICh0YWdzLmxlbmd0aCA9PT0gMSkge1xuICAgIGNvbnN0IHRhZyA9IHRhZ3NbMF07XG4gICAgaWYgKCh0YWcudGFnTmFtZSA9PT0gJ3R5cGUnIHx8IHRhZy50YWdOYW1lID09PSAnbm9jb2xsYXBzZScpICYmXG4gICAgICAgICghdGFnLnRleHQgfHwgIXRhZy50ZXh0Lm1hdGNoKCdcXG4nKSkpIHtcbiAgICAgIC8vIFNwZWNpYWwtY2FzZSBvbmUtbGluZXIgXCJ0eXBlXCIgYW5kIFwibm9jb2xsYXBzZVwiIHRhZ3MgdG8gZml0IG9uIG9uZSBsaW5lLCBlLmcuXG4gICAgICAvLyAgIC8qKiBAdHlwZSB7Zm9vfSAqL1xuICAgICAgcmV0dXJuICcvKionICsgdGFnVG9TdHJpbmcodGFnLCBlc2NhcGVFeHRyYVRhZ3MpICsgJyAqL1xcbic7XG4gICAgfVxuICAgIC8vIE90aGVyd2lzZSwgZmFsbCB0aHJvdWdoIHRvIHRoZSBtdWx0aS1saW5lIG91dHB1dC5cbiAgfVxuXG4gIGxldCBvdXQgPSBpbmNsdWRlU3RhcnRFbmQgPyAnLyoqXFxuJyA6ICcqXFxuJztcbiAgY29uc3QgZW1pdHRlZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IHRhZyBvZiB0YWdzKSB7XG4gICAgaWYgKGVtaXR0ZWQuaGFzKHRhZy50YWdOYW1lKSAmJiBTSU5HTEVUT05fVEFHUy5oYXModGFnLnRhZ05hbWUpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgZW1pdHRlZC5hZGQodGFnLnRhZ05hbWUpO1xuICAgIG91dCArPSAnIConO1xuICAgIC8vIElmIHRoZSB0YWdUb1N0cmluZyBpcyBtdWx0aS1saW5lLCBpbnNlcnQgXCIgKiBcIiBwcmVmaXhlcyBvbiBzdWJzZXF1ZW50IGxpbmVzLlxuICAgIG91dCArPSB0YWdUb1N0cmluZyh0YWcsIGVzY2FwZUV4dHJhVGFncykuc3BsaXQoJ1xcbicpLmpvaW4oJ1xcbiAqICcpO1xuICAgIG91dCArPSAnXFxuJztcbiAgfVxuICBvdXQgKz0gaW5jbHVkZVN0YXJ0RW5kID8gJyAqL1xcbicgOiAnICc7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKiBNZXJnZXMgbXVsdGlwbGUgdGFncyAob2YgdGhlIHNhbWUgdGFnTmFtZSB0eXBlKSBpbnRvIGEgc2luZ2xlIHVuaWZpZWQgdGFnLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlKHRhZ3M6IFRhZ1tdKTogVGFnIHtcbiAgY29uc3QgdGFnTmFtZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgcGFyYW1ldGVyTmFtZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgdHlwZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgdGV4dHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgLy8gSWYgYW55IG9mIHRoZSB0YWdzIGFyZSBvcHRpb25hbC9yZXN0LCB0aGVuIHRoZSBtZXJnZWQgb3V0cHV0IGlzIG9wdGlvbmFsL3Jlc3QuXG4gIGxldCBvcHRpb25hbCA9IGZhbHNlO1xuICBsZXQgcmVzdFBhcmFtID0gZmFsc2U7XG4gIGZvciAoY29uc3QgdGFnIG9mIHRhZ3MpIHtcbiAgICBpZiAodGFnLnRhZ05hbWUpIHRhZ05hbWVzLmFkZCh0YWcudGFnTmFtZSk7XG4gICAgaWYgKHRhZy5wYXJhbWV0ZXJOYW1lKSBwYXJhbWV0ZXJOYW1lcy5hZGQodGFnLnBhcmFtZXRlck5hbWUpO1xuICAgIGlmICh0YWcudHlwZSkgdHlwZXMuYWRkKHRhZy50eXBlKTtcbiAgICBpZiAodGFnLnRleHQpIHRleHRzLmFkZCh0YWcudGV4dCk7XG4gICAgaWYgKHRhZy5vcHRpb25hbCkgb3B0aW9uYWwgPSB0cnVlO1xuICAgIGlmICh0YWcucmVzdFBhcmFtKSByZXN0UGFyYW0gPSB0cnVlO1xuICB9XG5cbiAgaWYgKHRhZ05hbWVzLnNpemUgIT09IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCBtZXJnZSBkaWZmZXJpbmcgdGFnczogJHtKU09OLnN0cmluZ2lmeSh0YWdzKX1gKTtcbiAgfVxuICBjb25zdCB0YWdOYW1lID0gdGFnTmFtZXMudmFsdWVzKCkubmV4dCgpLnZhbHVlO1xuICBjb25zdCBwYXJhbWV0ZXJOYW1lID1cbiAgICAgIHBhcmFtZXRlck5hbWVzLnNpemUgPiAwID8gQXJyYXkuZnJvbShwYXJhbWV0ZXJOYW1lcykuam9pbignX29yXycpIDogdW5kZWZpbmVkO1xuICBjb25zdCB0eXBlID0gdHlwZXMuc2l6ZSA+IDAgPyBBcnJheS5mcm9tKHR5cGVzKS5qb2luKCd8JykgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHRleHQgPSB0ZXh0cy5zaXplID4gMCA/IEFycmF5LmZyb20odGV4dHMpLmpvaW4oJyAvICcpIDogdW5kZWZpbmVkO1xuICBjb25zdCB0YWc6IFRhZyA9IHt0YWdOYW1lLCBwYXJhbWV0ZXJOYW1lLCB0eXBlLCB0ZXh0fTtcbiAgLy8gTm90ZTogYSBwYXJhbSBjYW4gZWl0aGVyIGJlIG9wdGlvbmFsIG9yIGEgcmVzdCBwYXJhbTsgaWYgd2UgbWVyZ2VkIGFuXG4gIC8vIG9wdGlvbmFsIGFuZCByZXN0IHBhcmFtIHRvZ2V0aGVyLCBwcmVmZXIgbWFya2luZyBpdCBhcyBhIHJlc3QgcGFyYW0uXG4gIGlmIChyZXN0UGFyYW0pIHtcbiAgICB0YWcucmVzdFBhcmFtID0gdHJ1ZTtcbiAgfSBlbHNlIGlmIChvcHRpb25hbCkge1xuICAgIHRhZy5vcHRpb25hbCA9IHRydWU7XG4gIH1cbiAgcmV0dXJuIHRhZztcbn1cbiJdfQ==