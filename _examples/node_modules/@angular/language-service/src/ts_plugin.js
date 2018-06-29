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
        define("@angular/language-service/src/ts_plugin", ["require", "exports", "tslib", "typescript", "@angular/language-service/src/language_service", "@angular/language-service/src/typescript_host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var language_service_1 = require("@angular/language-service/src/language_service");
    var typescript_host_1 = require("@angular/language-service/src/typescript_host");
    var projectHostMap = new WeakMap();
    function getExternalFiles(project) {
        var host = projectHostMap.get(project);
        if (host) {
            return host.getTemplateReferences();
        }
    }
    exports.getExternalFiles = getExternalFiles;
    function create(info /* ts.server.PluginCreateInfo */) {
        // Create the proxy
        var proxy = Object.create(null);
        var oldLS = info.languageService;
        function tryCall(fileName, callback) {
            if (fileName && !oldLS.getProgram().getSourceFile(fileName)) {
                return undefined;
            }
            try {
                return callback();
            }
            catch (e) {
                return undefined;
            }
        }
        function tryFilenameCall(m) {
            return function (fileName) { return tryCall(fileName, function () { return (m.call(ls, fileName)); }); };
        }
        function tryFilenameOneCall(m) {
            return function (fileName, p) { return tryCall(fileName, function () { return (m.call(ls, fileName, p)); }); };
        }
        function tryFilenameTwoCall(m) {
            return function (fileName, p1, p2) { return tryCall(fileName, function () { return (m.call(ls, fileName, p1, p2)); }); };
        }
        function tryFilenameThreeCall(m) {
            return function (fileName, p1, p2, p3) { return tryCall(fileName, function () { return (m.call(ls, fileName, p1, p2, p3)); }); };
        }
        function tryFilenameFourCall(m) {
            return function (fileName, p1, p2, p3, p4) {
                return tryCall(fileName, function () { return (m.call(ls, fileName, p1, p2, p3, p4)); });
            };
        }
        function typescriptOnly(ls) {
            return {
                cleanupSemanticCache: function () { return ls.cleanupSemanticCache(); },
                getSyntacticDiagnostics: tryFilenameCall(ls.getSyntacticDiagnostics),
                getSemanticDiagnostics: tryFilenameCall(ls.getSemanticDiagnostics),
                getCompilerOptionsDiagnostics: function () { return ls.getCompilerOptionsDiagnostics(); },
                getSyntacticClassifications: tryFilenameOneCall(ls.getSemanticClassifications),
                getSemanticClassifications: tryFilenameOneCall(ls.getSemanticClassifications),
                getEncodedSyntacticClassifications: tryFilenameOneCall(ls.getEncodedSyntacticClassifications),
                getEncodedSemanticClassifications: tryFilenameOneCall(ls.getEncodedSemanticClassifications),
                getCompletionsAtPosition: tryFilenameTwoCall(ls.getCompletionsAtPosition),
                getCompletionEntryDetails: tryFilenameFourCall(ls.getCompletionEntryDetails),
                getCompletionEntrySymbol: tryFilenameThreeCall(ls.getCompletionEntrySymbol),
                getQuickInfoAtPosition: tryFilenameOneCall(ls.getQuickInfoAtPosition),
                getNameOrDottedNameSpan: tryFilenameTwoCall(ls.getNameOrDottedNameSpan),
                getBreakpointStatementAtPosition: tryFilenameOneCall(ls.getBreakpointStatementAtPosition),
                getSignatureHelpItems: tryFilenameOneCall(ls.getSignatureHelpItems),
                getRenameInfo: tryFilenameOneCall(ls.getRenameInfo),
                findRenameLocations: tryFilenameThreeCall(ls.findRenameLocations),
                getDefinitionAtPosition: tryFilenameOneCall(ls.getDefinitionAtPosition),
                getTypeDefinitionAtPosition: tryFilenameOneCall(ls.getTypeDefinitionAtPosition),
                getImplementationAtPosition: tryFilenameOneCall(ls.getImplementationAtPosition),
                getReferencesAtPosition: tryFilenameOneCall(ls.getReferencesAtPosition),
                findReferences: tryFilenameOneCall(ls.findReferences),
                getDocumentHighlights: tryFilenameTwoCall(ls.getDocumentHighlights),
                /** @deprecated */
                getOccurrencesAtPosition: tryFilenameOneCall(ls.getOccurrencesAtPosition),
                getNavigateToItems: function (searchValue, maxResultCount, fileName, excludeDtsFiles) { return tryCall(fileName, function () { return ls.getNavigateToItems(searchValue, maxResultCount, fileName, excludeDtsFiles); }); },
                getNavigationBarItems: tryFilenameCall(ls.getNavigationBarItems),
                getNavigationTree: tryFilenameCall(ls.getNavigationTree),
                getOutliningSpans: tryFilenameCall(ls.getOutliningSpans),
                getTodoComments: tryFilenameOneCall(ls.getTodoComments),
                getBraceMatchingAtPosition: tryFilenameOneCall(ls.getBraceMatchingAtPosition),
                getIndentationAtPosition: tryFilenameTwoCall(ls.getIndentationAtPosition),
                getFormattingEditsForRange: tryFilenameThreeCall(ls.getFormattingEditsForRange),
                getFormattingEditsForDocument: tryFilenameOneCall(ls.getFormattingEditsForDocument),
                getFormattingEditsAfterKeystroke: tryFilenameThreeCall(ls.getFormattingEditsAfterKeystroke),
                getDocCommentTemplateAtPosition: tryFilenameOneCall(ls.getDocCommentTemplateAtPosition),
                isValidBraceCompletionAtPosition: tryFilenameTwoCall(ls.isValidBraceCompletionAtPosition),
                getSpanOfEnclosingComment: tryFilenameTwoCall(ls.getSpanOfEnclosingComment),
                getCodeFixesAtPosition: tryFilenameFourCall(ls.getCodeFixesAtPosition),
                applyCodeActionCommand: (function (action) { return tryCall(undefined, function () { return ls.applyCodeActionCommand(action); }); }),
                getEmitOutput: tryFilenameCall(ls.getEmitOutput),
                getProgram: function () { return ls.getProgram(); },
                dispose: function () { return ls.dispose(); },
                getApplicableRefactors: tryFilenameOneCall(ls.getApplicableRefactors),
                getEditsForRefactor: tryFilenameFourCall(ls.getEditsForRefactor),
                getDefinitionAndBoundSpan: tryFilenameOneCall(ls.getDefinitionAndBoundSpan),
                getCombinedCodeFix: function (scope, fixId, formatOptions) {
                    return tryCall(undefined, function () { return ls.getCombinedCodeFix(scope, fixId, formatOptions); });
                }
            };
        }
        oldLS = typescriptOnly(oldLS);
        var _loop_1 = function (k) {
            proxy[k] = function () { return oldLS[k].apply(oldLS, arguments); };
        };
        for (var k in oldLS) {
            _loop_1(k);
        }
        function completionToEntry(c) {
            return {
                // TODO: remove any and fix type error.
                kind: c.kind,
                name: c.name,
                sortText: c.sort,
                kindModifiers: ''
            };
        }
        function diagnosticChainToDiagnosticChain(chain) {
            return {
                messageText: chain.message,
                category: ts.DiagnosticCategory.Error,
                code: 0,
                next: chain.next ? diagnosticChainToDiagnosticChain(chain.next) : undefined
            };
        }
        function diagnosticMessageToDiagnosticMessageText(message) {
            if (typeof message === 'string') {
                return message;
            }
            return diagnosticChainToDiagnosticChain(message);
        }
        function diagnosticToDiagnostic(d, file) {
            var result = {
                file: file,
                start: d.span.start,
                length: d.span.end - d.span.start,
                messageText: diagnosticMessageToDiagnosticMessageText(d.message),
                category: ts.DiagnosticCategory.Error,
                code: 0,
                source: 'ng'
            };
            return result;
        }
        function tryOperation(attempting, callback) {
            try {
                return callback();
            }
            catch (e) {
                info.project.projectService.logger.info("Failed to " + attempting + ": " + e.toString());
                info.project.projectService.logger.info("Stack trace: " + e.stack);
                return null;
            }
        }
        var serviceHost = new typescript_host_1.TypeScriptServiceHost(info.languageServiceHost, info.languageService);
        var ls = language_service_1.createLanguageService(serviceHost);
        serviceHost.setSite(ls);
        projectHostMap.set(info.project, serviceHost);
        proxy.getCompletionsAtPosition = function (fileName, position, options) {
            var base = oldLS.getCompletionsAtPosition(fileName, position, options) || {
                isGlobalCompletion: false,
                isMemberCompletion: false,
                isNewIdentifierLocation: false,
                entries: []
            };
            tryOperation('get completions', function () {
                var results = ls.getCompletionsAt(fileName, position);
                if (results && results.length) {
                    if (base === undefined) {
                        base = {
                            isGlobalCompletion: false,
                            isMemberCompletion: false,
                            isNewIdentifierLocation: false,
                            entries: []
                        };
                    }
                    try {
                        for (var results_1 = tslib_1.__values(results), results_1_1 = results_1.next(); !results_1_1.done; results_1_1 = results_1.next()) {
                            var entry = results_1_1.value;
                            base.entries.push(completionToEntry(entry));
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (results_1_1 && !results_1_1.done && (_a = results_1.return)) _a.call(results_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                var e_1, _a;
            });
            return base;
        };
        proxy.getQuickInfoAtPosition = function (fileName, position) {
            var base = oldLS.getQuickInfoAtPosition(fileName, position);
            // TODO(vicb): the tags property has been removed in TS 2.2
            tryOperation('get quick info', function () {
                var ours = ls.getHoverAt(fileName, position);
                if (ours) {
                    var displayParts = [];
                    try {
                        for (var _a = tslib_1.__values(ours.text), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var part = _b.value;
                            displayParts.push({ kind: part.language || 'angular', text: part.text });
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    var tags = base && base.tags;
                    base = {
                        displayParts: displayParts,
                        documentation: [],
                        kind: 'angular',
                        kindModifiers: 'what does this do?',
                        textSpan: { start: ours.span.start, length: ours.span.end - ours.span.start },
                    };
                    if (tags) {
                        base.tags = tags;
                    }
                }
                var e_2, _c;
            });
            return base;
        };
        proxy.getSemanticDiagnostics = function (fileName) {
            var result = oldLS.getSemanticDiagnostics(fileName);
            var base = result || [];
            tryOperation('get diagnostics', function () {
                info.project.projectService.logger.info("Computing Angular semantic diagnostics...");
                var ours = ls.getDiagnostics(fileName);
                if (ours && ours.length) {
                    var file_1 = oldLS.getProgram().getSourceFile(fileName);
                    if (file_1) {
                        base.push.apply(base, ours.map(function (d) { return diagnosticToDiagnostic(d, file_1); }));
                    }
                }
            });
            return base;
        };
        proxy.getDefinitionAtPosition = function (fileName, position) {
            var base = oldLS.getDefinitionAtPosition(fileName, position);
            if (base && base.length) {
                return base;
            }
            return tryOperation('get definition', function () {
                var ours = ls.getDefinitionAt(fileName, position);
                if (ours && ours.length) {
                    base = base || [];
                    try {
                        for (var ours_1 = tslib_1.__values(ours), ours_1_1 = ours_1.next(); !ours_1_1.done; ours_1_1 = ours_1.next()) {
                            var loc = ours_1_1.value;
                            base.push({
                                fileName: loc.fileName,
                                textSpan: { start: loc.span.start, length: loc.span.end - loc.span.start },
                                name: '',
                                // TODO: remove any and fix type error.
                                kind: 'definition',
                                containerName: loc.fileName,
                                containerKind: 'file',
                            });
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (ours_1_1 && !ours_1_1.done && (_a = ours_1.return)) _a.call(ours_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
                return base;
                var e_3, _a;
            }) || [];
        };
        return proxy;
    }
    exports.create = create;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHNfcGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvbGFuZ3VhZ2Utc2VydmljZS9zcmMvdHNfcGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQyxtRkFBeUQ7SUFFekQsaUZBQXdEO0lBRXhELElBQU0sY0FBYyxHQUFHLElBQUksT0FBTyxFQUE4QixDQUFDO0lBRWpFLDBCQUFpQyxPQUFZO1FBQzNDLElBQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUN0QyxDQUFDO0lBQ0gsQ0FBQztJQUxELDRDQUtDO0lBRUQsZ0JBQXVCLElBQVMsQ0FBQyxnQ0FBZ0M7UUFDL0QsbUJBQW1CO1FBQ25CLElBQU0sS0FBSyxHQUF1QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RELElBQUksS0FBSyxHQUF1QixJQUFJLENBQUMsZUFBZSxDQUFDO1FBRXJELGlCQUFvQixRQUE0QixFQUFFLFFBQWlCO1lBQ2pFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1RCxNQUFNLENBQUMsU0FBcUIsQ0FBQztZQUMvQixDQUFDO1lBQ0QsSUFBSSxDQUFDO2dCQUNILE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwQixDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxNQUFNLENBQUMsU0FBcUIsQ0FBQztZQUMvQixDQUFDO1FBQ0gsQ0FBQztRQUVE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LFFBQVE7Z0NBQzNCLGFBQWEsRUFBRSxNQUFhOzZCQUM3QixDQUFDLENBQUM7eUJBQ0o7Ozs7Ozs7OztnQkFDSCxDQUFDO2dCQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7O1lBQ2QsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2xCLENBQUMsQ0FBQztRQUVGLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZixDQUFDO0lBclFELHdCQXFRQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Y3JlYXRlTGFuZ3VhZ2VTZXJ2aWNlfSBmcm9tICcuL2xhbmd1YWdlX3NlcnZpY2UnO1xuaW1wb3J0IHtDb21wbGV0aW9uLCBEaWFnbm9zdGljLCBEaWFnbm9zdGljTWVzc2FnZUNoYWluLCBMYW5ndWFnZVNlcnZpY2UsIExhbmd1YWdlU2VydmljZUhvc3R9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHtUeXBlU2NyaXB0U2VydmljZUhvc3R9IGZyb20gJy4vdHlwZXNjcmlwdF9ob3N0JztcblxuY29uc3QgcHJvamVjdEhvc3RNYXAgPSBuZXcgV2Vha01hcDxhbnksIFR5cGVTY3JpcHRTZXJ2aWNlSG9zdD4oKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEV4dGVybmFsRmlsZXMocHJvamVjdDogYW55KTogc3RyaW5nW118dW5kZWZpbmVkIHtcbiAgY29uc3QgaG9zdCA9IHByb2plY3RIb3N0TWFwLmdldChwcm9qZWN0KTtcbiAgaWYgKGhvc3QpIHtcbiAgICByZXR1cm4gaG9zdC5nZXRUZW1wbGF0ZVJlZmVyZW5jZXMoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKGluZm86IGFueSAvKiB0cy5zZXJ2ZXIuUGx1Z2luQ3JlYXRlSW5mbyAqLyk6IHRzLkxhbmd1YWdlU2VydmljZSB7XG4gIC8vIENyZWF0ZSB0aGUgcHJveHlcbiAgY29uc3QgcHJveHk6IHRzLkxhbmd1YWdlU2VydmljZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGxldCBvbGRMUzogdHMuTGFuZ3VhZ2VTZXJ2aWNlID0gaW5mby5sYW5ndWFnZVNlcnZpY2U7XG5cbiAgZnVuY3Rpb24gdHJ5Q2FsbDxUPihmaWxlTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkLCBjYWxsYmFjazogKCkgPT4gVCk6IFQge1xuICAgIGlmIChmaWxlTmFtZSAmJiAhb2xkTFMuZ2V0UHJvZ3JhbSgpLmdldFNvdXJjZUZpbGUoZmlsZU5hbWUpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkIGFzIGFueSBhcyBUO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZCBhcyBhbnkgYXMgVDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0cnlGaWxlbmFtZUNhbGw8VD4obTogKGZpbGVOYW1lOiBzdHJpbmcpID0+IFQpOiAoZmlsZU5hbWU6IHN0cmluZykgPT4gVCB7XG4gICAgcmV0dXJuIGZpbGVOYW1lID0+IHRyeUNhbGwoZmlsZU5hbWUsICgpID0+IDxUPihtLmNhbGwobHMsIGZpbGVOYW1lKSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJ5RmlsZW5hbWVPbmVDYWxsPFQsIFA+KG06IChmaWxlTmFtZTogc3RyaW5nLCBwOiBQKSA9PiBUKTogKGZpbGVuYW1lOiBzdHJpbmcsIHA6IFApID0+XG4gICAgICBUIHtcbiAgICByZXR1cm4gKGZpbGVOYW1lLCBwKSA9PiB0cnlDYWxsKGZpbGVOYW1lLCAoKSA9PiA8VD4obS5jYWxsKGxzLCBmaWxlTmFtZSwgcCkpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyeUZpbGVuYW1lVHdvQ2FsbDxULCBQMSwgUDI+KG06IChmaWxlTmFtZTogc3RyaW5nLCBwMTogUDEsIHAyOiBQMikgPT4gVCk6IChcbiAgICAgIGZpbGVuYW1lOiBzdHJpbmcsIHAxOiBQMSwgcDI6IFAyKSA9PiBUIHtcbiAgICByZXR1cm4gKGZpbGVOYW1lLCBwMSwgcDIpID0+IHRyeUNhbGwoZmlsZU5hbWUsICgpID0+IDxUPihtLmNhbGwobHMsIGZpbGVOYW1lLCBwMSwgcDIpKSk7XG4gIH1cblxuICBmdW5jdGlvbiB0cnlGaWxlbmFtZVRocmVlQ2FsbDxULCBQMSwgUDIsIFAzPihtOiAoZmlsZU5hbWU6IHN0cmluZywgcDE6IFAxLCBwMjogUDIsIHAzOiBQMykgPT4gVCk6XG4gICAgICAoZmlsZW5hbWU6IHN0cmluZywgcDE6IFAxLCBwMjogUDIsIHAzOiBQMykgPT4gVCB7XG4gICAgcmV0dXJuIChmaWxlTmFtZSwgcDEsIHAyLCBwMykgPT4gdHJ5Q2FsbChmaWxlTmFtZSwgKCkgPT4gPFQ+KG0uY2FsbChscywgZmlsZU5hbWUsIHAxLCBwMiwgcDMpKSk7XG4gIH1cblxuICBmdW5jdGlvbiB0cnlGaWxlbmFtZUZvdXJDYWxsPFQsIFAxLCBQMiwgUDMsIFA0PihcbiAgICAgIG06IChmaWxlTmFtZTogc3RyaW5nLCBwMTogUDEsIHAyOiBQMiwgcDM6IFAzLCBwNDogUDQpID0+XG4gICAgICAgICAgVCk6IChmaWxlTmFtZTogc3RyaW5nLCBwMTogUDEsIHAyOiBQMiwgcDM6IFAzLCBwNDogUDQpID0+IFQge1xuICAgIHJldHVybiAoZmlsZU5hbWUsIHAxLCBwMiwgcDMsIHA0KSA9PlxuICAgICAgICAgICAgICAgdHJ5Q2FsbChmaWxlTmFtZSwgKCkgPT4gPFQ+KG0uY2FsbChscywgZmlsZU5hbWUsIHAxLCBwMiwgcDMsIHA0KSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHlwZXNjcmlwdE9ubHkobHM6IHRzLkxhbmd1YWdlU2VydmljZSk6IHRzLkxhbmd1YWdlU2VydmljZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNsZWFudXBTZW1hbnRpY0NhY2hlOiAoKSA9PiBscy5jbGVhbnVwU2VtYW50aWNDYWNoZSgpLFxuICAgICAgZ2V0U3ludGFjdGljRGlhZ25vc3RpY3M6IHRyeUZpbGVuYW1lQ2FsbChscy5nZXRTeW50YWN0aWNEaWFnbm9zdGljcyksXG4gICAgICBnZXRTZW1hbnRpY0RpYWdub3N0aWNzOiB0cnlGaWxlbmFtZUNhbGwobHMuZ2V0U2VtYW50aWNEaWFnbm9zdGljcyksXG4gICAgICBnZXRDb21waWxlck9wdGlvbnNEaWFnbm9zdGljczogKCkgPT4gbHMuZ2V0Q29tcGlsZXJPcHRpb25zRGlhZ25vc3RpY3MoKSxcbiAgICAgIGdldFN5bnRhY3RpY0NsYXNzaWZpY2F0aW9uczogdHJ5RmlsZW5hbWVPbmVDYWxsKGxzLmdldFNlbWFudGljQ2xhc3NpZmljYXRpb25zKSxcbiAgICAgIGdldFNlbWFudGljQ2xhc3NpZmljYXRpb25zOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0U2VtYW50aWNDbGFzc2lmaWNhdGlvbnMpLFxuICAgICAgZ2V0RW5jb2RlZFN5bnRhY3RpY0NsYXNzaWZpY2F0aW9uczogdHJ5RmlsZW5hbWVPbmVDYWxsKGxzLmdldEVuY29kZWRTeW50YWN0aWNDbGFzc2lmaWNhdGlvbnMpLFxuICAgICAgZ2V0RW5jb2RlZFNlbWFudGljQ2xhc3NpZmljYXRpb25zOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0RW5jb2RlZFNlbWFudGljQ2xhc3NpZmljYXRpb25zKSxcbiAgICAgIGdldENvbXBsZXRpb25zQXRQb3NpdGlvbjogdHJ5RmlsZW5hbWVUd29DYWxsKGxzLmdldENvbXBsZXRpb25zQXRQb3NpdGlvbiksXG4gICAgICBnZXRDb21wbGV0aW9uRW50cnlEZXRhaWxzOiB0cnlGaWxlbmFtZUZvdXJDYWxsKGxzLmdldENvbXBsZXRpb25FbnRyeURldGFpbHMpLFxuICAgICAgZ2V0Q29tcGxldGlvbkVudHJ5U3ltYm9sOiB0cnlGaWxlbmFtZVRocmVlQ2FsbChscy5nZXRDb21wbGV0aW9uRW50cnlTeW1ib2wpLFxuICAgICAgZ2V0UXVpY2tJbmZvQXRQb3NpdGlvbjogdHJ5RmlsZW5hbWVPbmVDYWxsKGxzLmdldFF1aWNrSW5mb0F0UG9zaXRpb24pLFxuICAgICAgZ2V0TmFtZU9yRG90dGVkTmFtZVNwYW46IHRyeUZpbGVuYW1lVHdvQ2FsbChscy5nZXROYW1lT3JEb3R0ZWROYW1lU3BhbiksXG4gICAgICBnZXRCcmVha3BvaW50U3RhdGVtZW50QXRQb3NpdGlvbjogdHJ5RmlsZW5hbWVPbmVDYWxsKGxzLmdldEJyZWFrcG9pbnRTdGF0ZW1lbnRBdFBvc2l0aW9uKSxcbiAgICAgIGdldFNpZ25hdHVyZUhlbHBJdGVtczogdHJ5RmlsZW5hbWVPbmVDYWxsKGxzLmdldFNpZ25hdHVyZUhlbHBJdGVtcyksXG4gICAgICBnZXRSZW5hbWVJbmZvOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0UmVuYW1lSW5mbyksXG4gICAgICBmaW5kUmVuYW1lTG9jYXRpb25zOiB0cnlGaWxlbmFtZVRocmVlQ2FsbChscy5maW5kUmVuYW1lTG9jYXRpb25zKSxcbiAgICAgIGdldERlZmluaXRpb25BdFBvc2l0aW9uOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0RGVmaW5pdGlvbkF0UG9zaXRpb24pLFxuICAgICAgZ2V0VHlwZURlZmluaXRpb25BdFBvc2l0aW9uOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0VHlwZURlZmluaXRpb25BdFBvc2l0aW9uKSxcbiAgICAgIGdldEltcGxlbWVudGF0aW9uQXRQb3NpdGlvbjogdHJ5RmlsZW5hbWVPbmVDYWxsKGxzLmdldEltcGxlbWVudGF0aW9uQXRQb3NpdGlvbiksXG4gICAgICBnZXRSZWZlcmVuY2VzQXRQb3NpdGlvbjogdHJ5RmlsZW5hbWVPbmVDYWxsKGxzLmdldFJlZmVyZW5jZXNBdFBvc2l0aW9uKSxcbiAgICAgIGZpbmRSZWZlcmVuY2VzOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZmluZFJlZmVyZW5jZXMpLFxuICAgICAgZ2V0RG9jdW1lbnRIaWdobGlnaHRzOiB0cnlGaWxlbmFtZVR3b0NhbGwobHMuZ2V0RG9jdW1lbnRIaWdobGlnaHRzKSxcbiAgICAgIC8qKiBAZGVwcmVjYXRlZCAqL1xuICAgICAgZ2V0T2NjdXJyZW5jZXNBdFBvc2l0aW9uOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0T2NjdXJyZW5jZXNBdFBvc2l0aW9uKSxcbiAgICAgIGdldE5hdmlnYXRlVG9JdGVtczpcbiAgICAgICAgICAoc2VhcmNoVmFsdWUsIG1heFJlc3VsdENvdW50LCBmaWxlTmFtZSwgZXhjbHVkZUR0c0ZpbGVzKSA9PiB0cnlDYWxsKFxuICAgICAgICAgICAgICBmaWxlTmFtZSxcbiAgICAgICAgICAgICAgKCkgPT4gbHMuZ2V0TmF2aWdhdGVUb0l0ZW1zKHNlYXJjaFZhbHVlLCBtYXhSZXN1bHRDb3VudCwgZmlsZU5hbWUsIGV4Y2x1ZGVEdHNGaWxlcykpLFxuICAgICAgZ2V0TmF2aWdhdGlvbkJhckl0ZW1zOiB0cnlGaWxlbmFtZUNhbGwobHMuZ2V0TmF2aWdhdGlvbkJhckl0ZW1zKSxcbiAgICAgIGdldE5hdmlnYXRpb25UcmVlOiB0cnlGaWxlbmFtZUNhbGwobHMuZ2V0TmF2aWdhdGlvblRyZWUpLFxuICAgICAgZ2V0T3V0bGluaW5nU3BhbnM6IHRyeUZpbGVuYW1lQ2FsbChscy5nZXRPdXRsaW5pbmdTcGFucyksXG4gICAgICBnZXRUb2RvQ29tbWVudHM6IHRyeUZpbGVuYW1lT25lQ2FsbChscy5nZXRUb2RvQ29tbWVudHMpLFxuICAgICAgZ2V0QnJhY2VNYXRjaGluZ0F0UG9zaXRpb246IHRyeUZpbGVuYW1lT25lQ2FsbChscy5nZXRCcmFjZU1hdGNoaW5nQXRQb3NpdGlvbiksXG4gICAgICBnZXRJbmRlbnRhdGlvbkF0UG9zaXRpb246IHRyeUZpbGVuYW1lVHdvQ2FsbChscy5nZXRJbmRlbnRhdGlvbkF0UG9zaXRpb24pLFxuICAgICAgZ2V0Rm9ybWF0dGluZ0VkaXRzRm9yUmFuZ2U6IHRyeUZpbGVuYW1lVGhyZWVDYWxsKGxzLmdldEZvcm1hdHRpbmdFZGl0c0ZvclJhbmdlKSxcbiAgICAgIGdldEZvcm1hdHRpbmdFZGl0c0ZvckRvY3VtZW50OiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0Rm9ybWF0dGluZ0VkaXRzRm9yRG9jdW1lbnQpLFxuICAgICAgZ2V0Rm9ybWF0dGluZ0VkaXRzQWZ0ZXJLZXlzdHJva2U6IHRyeUZpbGVuYW1lVGhyZWVDYWxsKGxzLmdldEZvcm1hdHRpbmdFZGl0c0FmdGVyS2V5c3Ryb2tlKSxcbiAgICAgIGdldERvY0NvbW1lbnRUZW1wbGF0ZUF0UG9zaXRpb246IHRyeUZpbGVuYW1lT25lQ2FsbChscy5nZXREb2NDb21tZW50VGVtcGxhdGVBdFBvc2l0aW9uKSxcbiAgICAgIGlzVmFsaWRCcmFjZUNvbXBsZXRpb25BdFBvc2l0aW9uOiB0cnlGaWxlbmFtZVR3b0NhbGwobHMuaXNWYWxpZEJyYWNlQ29tcGxldGlvbkF0UG9zaXRpb24pLFxuICAgICAgZ2V0U3Bhbk9mRW5jbG9zaW5nQ29tbWVudDogdHJ5RmlsZW5hbWVUd29DYWxsKGxzLmdldFNwYW5PZkVuY2xvc2luZ0NvbW1lbnQpLFxuICAgICAgZ2V0Q29kZUZpeGVzQXRQb3NpdGlvbjogdHJ5RmlsZW5hbWVGb3VyQ2FsbChscy5nZXRDb2RlRml4ZXNBdFBvc2l0aW9uKSxcbiAgICAgIGFwcGx5Q29kZUFjdGlvbkNvbW1hbmQ6XG4gICAgICAgICAgPGFueT4oKGFjdGlvbjogYW55KSA9PiB0cnlDYWxsKHVuZGVmaW5lZCwgKCkgPT4gbHMuYXBwbHlDb2RlQWN0aW9uQ29tbWFuZChhY3Rpb24pKSksXG4gICAgICBnZXRFbWl0T3V0cHV0OiB0cnlGaWxlbmFtZUNhbGwobHMuZ2V0RW1pdE91dHB1dCksXG4gICAgICBnZXRQcm9ncmFtOiAoKSA9PiBscy5nZXRQcm9ncmFtKCksXG4gICAgICBkaXNwb3NlOiAoKSA9PiBscy5kaXNwb3NlKCksXG4gICAgICBnZXRBcHBsaWNhYmxlUmVmYWN0b3JzOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0QXBwbGljYWJsZVJlZmFjdG9ycyksXG4gICAgICBnZXRFZGl0c0ZvclJlZmFjdG9yOiB0cnlGaWxlbmFtZUZvdXJDYWxsKGxzLmdldEVkaXRzRm9yUmVmYWN0b3IpLFxuICAgICAgZ2V0RGVmaW5pdGlvbkFuZEJvdW5kU3BhbjogdHJ5RmlsZW5hbWVPbmVDYWxsKGxzLmdldERlZmluaXRpb25BbmRCb3VuZFNwYW4pLFxuICAgICAgZ2V0Q29tYmluZWRDb2RlRml4OlxuICAgICAgICAgIChzY29wZTogdHMuQ29tYmluZWRDb2RlRml4U2NvcGUsIGZpeElkOiB7fSwgZm9ybWF0T3B0aW9uczogdHMuRm9ybWF0Q29kZVNldHRpbmdzKSA9PlxuICAgICAgICAgICAgICB0cnlDYWxsKHVuZGVmaW5lZCwgKCkgPT4gbHMuZ2V0Q29tYmluZWRDb2RlRml4KHNjb3BlLCBmaXhJZCwgZm9ybWF0T3B0aW9ucykpXG4gICAgfTtcbiAgfVxuXG4gIG9sZExTID0gdHlwZXNjcmlwdE9ubHkob2xkTFMpO1xuXG4gIGZvciAoY29uc3QgayBpbiBvbGRMUykge1xuICAgICg8YW55PnByb3h5KVtrXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKG9sZExTIGFzIGFueSlba10uYXBwbHkob2xkTFMsIGFyZ3VtZW50cyk7IH07XG4gIH1cblxuICBmdW5jdGlvbiBjb21wbGV0aW9uVG9FbnRyeShjOiBDb21wbGV0aW9uKTogdHMuQ29tcGxldGlvbkVudHJ5IHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gVE9ETzogcmVtb3ZlIGFueSBhbmQgZml4IHR5cGUgZXJyb3IuXG4gICAgICBraW5kOiBjLmtpbmQgYXMgYW55LFxuICAgICAgbmFtZTogYy5uYW1lLFxuICAgICAgc29ydFRleHQ6IGMuc29ydCxcbiAgICAgIGtpbmRNb2RpZmllcnM6ICcnXG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRpYWdub3N0aWNDaGFpblRvRGlhZ25vc3RpY0NoYWluKGNoYWluOiBEaWFnbm9zdGljTWVzc2FnZUNoYWluKTpcbiAgICAgIHRzLkRpYWdub3N0aWNNZXNzYWdlQ2hhaW4ge1xuICAgIHJldHVybiB7XG4gICAgICBtZXNzYWdlVGV4dDogY2hhaW4ubWVzc2FnZSxcbiAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICBjb2RlOiAwLFxuICAgICAgbmV4dDogY2hhaW4ubmV4dCA/IGRpYWdub3N0aWNDaGFpblRvRGlhZ25vc3RpY0NoYWluKGNoYWluLm5leHQpIDogdW5kZWZpbmVkXG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRpYWdub3N0aWNNZXNzYWdlVG9EaWFnbm9zdGljTWVzc2FnZVRleHQobWVzc2FnZTogc3RyaW5nIHwgRGlhZ25vc3RpY01lc3NhZ2VDaGFpbik6XG4gICAgICBzdHJpbmd8dHMuRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiB7XG4gICAgaWYgKHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgfVxuICAgIHJldHVybiBkaWFnbm9zdGljQ2hhaW5Ub0RpYWdub3N0aWNDaGFpbihtZXNzYWdlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRpYWdub3N0aWNUb0RpYWdub3N0aWMoZDogRGlhZ25vc3RpYywgZmlsZTogdHMuU291cmNlRmlsZSk6IHRzLkRpYWdub3N0aWMge1xuICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgIGZpbGUsXG4gICAgICBzdGFydDogZC5zcGFuLnN0YXJ0LFxuICAgICAgbGVuZ3RoOiBkLnNwYW4uZW5kIC0gZC5zcGFuLnN0YXJ0LFxuICAgICAgbWVzc2FnZVRleHQ6IGRpYWdub3N0aWNNZXNzYWdlVG9EaWFnbm9zdGljTWVzc2FnZVRleHQoZC5tZXNzYWdlKSxcbiAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICBjb2RlOiAwLFxuICAgICAgc291cmNlOiAnbmcnXG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gdHJ5T3BlcmF0aW9uPFQ+KGF0dGVtcHRpbmc6IHN0cmluZywgY2FsbGJhY2s6ICgpID0+IFQpOiBUfG51bGwge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpbmZvLnByb2plY3QucHJvamVjdFNlcnZpY2UubG9nZ2VyLmluZm8oYEZhaWxlZCB0byAke2F0dGVtcHRpbmd9OiAke2UudG9TdHJpbmcoKX1gKTtcbiAgICAgIGluZm8ucHJvamVjdC5wcm9qZWN0U2VydmljZS5sb2dnZXIuaW5mbyhgU3RhY2sgdHJhY2U6ICR7ZS5zdGFja31gKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHNlcnZpY2VIb3N0ID0gbmV3IFR5cGVTY3JpcHRTZXJ2aWNlSG9zdChpbmZvLmxhbmd1YWdlU2VydmljZUhvc3QsIGluZm8ubGFuZ3VhZ2VTZXJ2aWNlKTtcbiAgY29uc3QgbHMgPSBjcmVhdGVMYW5ndWFnZVNlcnZpY2Uoc2VydmljZUhvc3QgYXMgYW55KTtcbiAgc2VydmljZUhvc3Quc2V0U2l0ZShscyk7XG4gIHByb2plY3RIb3N0TWFwLnNldChpbmZvLnByb2plY3QsIHNlcnZpY2VIb3N0KTtcblxuICBwcm94eS5nZXRDb21wbGV0aW9uc0F0UG9zaXRpb24gPSBmdW5jdGlvbihcbiAgICAgIGZpbGVOYW1lOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIsIG9wdGlvbnM6IHRzLkdldENvbXBsZXRpb25zQXRQb3NpdGlvbk9wdGlvbnN8dW5kZWZpbmVkKSB7XG4gICAgbGV0IGJhc2UgPSBvbGRMUy5nZXRDb21wbGV0aW9uc0F0UG9zaXRpb24oZmlsZU5hbWUsIHBvc2l0aW9uLCBvcHRpb25zKSB8fCB7XG4gICAgICBpc0dsb2JhbENvbXBsZXRpb246IGZhbHNlLFxuICAgICAgaXNNZW1iZXJDb21wbGV0aW9uOiBmYWxzZSxcbiAgICAgIGlzTmV3SWRlbnRpZmllckxvY2F0aW9uOiBmYWxzZSxcbiAgICAgIGVudHJpZXM6IFtdXG4gICAgfTtcbiAgICB0cnlPcGVyYXRpb24oJ2dldCBjb21wbGV0aW9ucycsICgpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBscy5nZXRDb21wbGV0aW9uc0F0KGZpbGVOYW1lLCBwb3NpdGlvbik7XG4gICAgICBpZiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICBpZiAoYmFzZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgYmFzZSA9IHtcbiAgICAgICAgICAgIGlzR2xvYmFsQ29tcGxldGlvbjogZmFsc2UsXG4gICAgICAgICAgICBpc01lbWJlckNvbXBsZXRpb246IGZhbHNlLFxuICAgICAgICAgICAgaXNOZXdJZGVudGlmaWVyTG9jYXRpb246IGZhbHNlLFxuICAgICAgICAgICAgZW50cmllczogW11cbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgcmVzdWx0cykge1xuICAgICAgICAgIGJhc2UuZW50cmllcy5wdXNoKGNvbXBsZXRpb25Ub0VudHJ5KGVudHJ5KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gYmFzZTtcbiAgfTtcblxuICBwcm94eS5nZXRRdWlja0luZm9BdFBvc2l0aW9uID0gZnVuY3Rpb24oZmlsZU5hbWU6IHN0cmluZywgcG9zaXRpb246IG51bWJlcik6IHRzLlF1aWNrSW5mbyB7XG4gICAgbGV0IGJhc2UgPSBvbGRMUy5nZXRRdWlja0luZm9BdFBvc2l0aW9uKGZpbGVOYW1lLCBwb3NpdGlvbik7XG4gICAgLy8gVE9ETyh2aWNiKTogdGhlIHRhZ3MgcHJvcGVydHkgaGFzIGJlZW4gcmVtb3ZlZCBpbiBUUyAyLjJcbiAgICB0cnlPcGVyYXRpb24oJ2dldCBxdWljayBpbmZvJywgKCkgPT4ge1xuICAgICAgY29uc3Qgb3VycyA9IGxzLmdldEhvdmVyQXQoZmlsZU5hbWUsIHBvc2l0aW9uKTtcbiAgICAgIGlmIChvdXJzKSB7XG4gICAgICAgIGNvbnN0IGRpc3BsYXlQYXJ0czogdHMuU3ltYm9sRGlzcGxheVBhcnRbXSA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2Ygb3Vycy50ZXh0KSB7XG4gICAgICAgICAgZGlzcGxheVBhcnRzLnB1c2goe2tpbmQ6IHBhcnQubGFuZ3VhZ2UgfHwgJ2FuZ3VsYXInLCB0ZXh0OiBwYXJ0LnRleHR9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0YWdzID0gYmFzZSAmJiAoPGFueT5iYXNlKS50YWdzO1xuICAgICAgICBiYXNlID0gPGFueT57XG4gICAgICAgICAgZGlzcGxheVBhcnRzLFxuICAgICAgICAgIGRvY3VtZW50YXRpb246IFtdLFxuICAgICAgICAgIGtpbmQ6ICdhbmd1bGFyJyxcbiAgICAgICAgICBraW5kTW9kaWZpZXJzOiAnd2hhdCBkb2VzIHRoaXMgZG8/JyxcbiAgICAgICAgICB0ZXh0U3Bhbjoge3N0YXJ0OiBvdXJzLnNwYW4uc3RhcnQsIGxlbmd0aDogb3Vycy5zcGFuLmVuZCAtIG91cnMuc3Bhbi5zdGFydH0sXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0YWdzKSB7XG4gICAgICAgICAgKDxhbnk+YmFzZSkudGFncyA9IHRhZ3M7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBiYXNlO1xuICB9O1xuXG4gIHByb3h5LmdldFNlbWFudGljRGlhZ25vc3RpY3MgPSBmdW5jdGlvbihmaWxlTmFtZTogc3RyaW5nKSB7XG4gICAgbGV0IHJlc3VsdCA9IG9sZExTLmdldFNlbWFudGljRGlhZ25vc3RpY3MoZmlsZU5hbWUpO1xuICAgIGNvbnN0IGJhc2UgPSByZXN1bHQgfHwgW107XG4gICAgdHJ5T3BlcmF0aW9uKCdnZXQgZGlhZ25vc3RpY3MnLCAoKSA9PiB7XG4gICAgICBpbmZvLnByb2plY3QucHJvamVjdFNlcnZpY2UubG9nZ2VyLmluZm8oYENvbXB1dGluZyBBbmd1bGFyIHNlbWFudGljIGRpYWdub3N0aWNzLi4uYCk7XG4gICAgICBjb25zdCBvdXJzID0gbHMuZ2V0RGlhZ25vc3RpY3MoZmlsZU5hbWUpO1xuICAgICAgaWYgKG91cnMgJiYgb3Vycy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgZmlsZSA9IG9sZExTLmdldFByb2dyYW0oKS5nZXRTb3VyY2VGaWxlKGZpbGVOYW1lKTtcbiAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICBiYXNlLnB1c2guYXBwbHkoYmFzZSwgb3Vycy5tYXAoZCA9PiBkaWFnbm9zdGljVG9EaWFnbm9zdGljKGQsIGZpbGUpKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBiYXNlO1xuICB9O1xuXG4gIHByb3h5LmdldERlZmluaXRpb25BdFBvc2l0aW9uID0gZnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIpOiB0cy5EZWZpbml0aW9uSW5mb1tdIHtcbiAgICBsZXQgYmFzZSA9IG9sZExTLmdldERlZmluaXRpb25BdFBvc2l0aW9uKGZpbGVOYW1lLCBwb3NpdGlvbik7XG4gICAgaWYgKGJhc2UgJiYgYmFzZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBiYXNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnlPcGVyYXRpb24oJ2dldCBkZWZpbml0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgIGNvbnN0IG91cnMgPSBscy5nZXREZWZpbml0aW9uQXQoZmlsZU5hbWUsIHBvc2l0aW9uKTtcbiAgICAgICAgICAgICBpZiAob3VycyAmJiBvdXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgYmFzZSA9IGJhc2UgfHwgW107XG4gICAgICAgICAgICAgICBmb3IgKGNvbnN0IGxvYyBvZiBvdXJzKSB7XG4gICAgICAgICAgICAgICAgIGJhc2UucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgZmlsZU5hbWU6IGxvYy5maWxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICB0ZXh0U3Bhbjoge3N0YXJ0OiBsb2Muc3Bhbi5zdGFydCwgbGVuZ3RoOiBsb2Muc3Bhbi5lbmQgLSBsb2Muc3Bhbi5zdGFydH0sXG4gICAgICAgICAgICAgICAgICAgbmFtZTogJycsXG4gICAgICAgICAgICAgICAgICAgLy8gVE9ETzogcmVtb3ZlIGFueSBhbmQgZml4IHR5cGUgZXJyb3IuXG4gICAgICAgICAgICAgICAgICAga2luZDogJ2RlZmluaXRpb24nIGFzIGFueSxcbiAgICAgICAgICAgICAgICAgICBjb250YWluZXJOYW1lOiBsb2MuZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgY29udGFpbmVyS2luZDogJ2ZpbGUnIGFzIGFueSxcbiAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICAgIHJldHVybiBiYXNlO1xuICAgICAgICAgICB9KSB8fCBbXTtcbiAgfTtcblxuICByZXR1cm4gcHJveHk7XG59XG4iXX0=