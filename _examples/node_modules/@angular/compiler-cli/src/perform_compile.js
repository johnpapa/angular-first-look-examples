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
        define("@angular/compiler-cli/src/perform_compile", ["require", "exports", "tslib", "@angular/compiler", "fs", "path", "typescript", "@angular/compiler-cli/src/transformers/api", "@angular/compiler-cli/src/transformers/entry_points", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var fs = require("fs");
    var path = require("path");
    var ts = require("typescript");
    var api = require("@angular/compiler-cli/src/transformers/api");
    var ng = require("@angular/compiler-cli/src/transformers/entry_points");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    var TS_EXT = /\.ts$/;
    function filterErrorsAndWarnings(diagnostics) {
        return diagnostics.filter(function (d) { return d.category !== ts.DiagnosticCategory.Message; });
    }
    exports.filterErrorsAndWarnings = filterErrorsAndWarnings;
    var defaultFormatHost = {
        getCurrentDirectory: function () { return ts.sys.getCurrentDirectory(); },
        getCanonicalFileName: function (fileName) { return fileName; },
        getNewLine: function () { return ts.sys.newLine; }
    };
    function displayFileName(fileName, host) {
        return path.relative(host.getCurrentDirectory(), host.getCanonicalFileName(fileName));
    }
    function formatDiagnosticPosition(position, host) {
        if (host === void 0) { host = defaultFormatHost; }
        return displayFileName(position.fileName, host) + "(" + (position.line + 1) + "," + (position.column + 1) + ")";
    }
    exports.formatDiagnosticPosition = formatDiagnosticPosition;
    function flattenDiagnosticMessageChain(chain, host) {
        if (host === void 0) { host = defaultFormatHost; }
        var result = chain.messageText;
        var indent = 1;
        var current = chain.next;
        var newLine = host.getNewLine();
        while (current) {
            result += newLine;
            for (var i = 0; i < indent; i++) {
                result += '  ';
            }
            result += current.messageText;
            var position = current.position;
            if (position) {
                result += " at " + formatDiagnosticPosition(position, host);
            }
            current = current.next;
            indent++;
        }
        return result;
    }
    exports.flattenDiagnosticMessageChain = flattenDiagnosticMessageChain;
    function formatDiagnostic(diagnostic, host) {
        if (host === void 0) { host = defaultFormatHost; }
        var result = '';
        var newLine = host.getNewLine();
        var span = diagnostic.span;
        if (span) {
            result += formatDiagnosticPosition({
                fileName: span.start.file.url,
                line: span.start.line,
                column: span.start.col
            }, host) + ": ";
        }
        else if (diagnostic.position) {
            result += formatDiagnosticPosition(diagnostic.position, host) + ": ";
        }
        if (diagnostic.span && diagnostic.span.details) {
            result += ": " + diagnostic.span.details + ", " + diagnostic.messageText + newLine;
        }
        else if (diagnostic.chain) {
            result += flattenDiagnosticMessageChain(diagnostic.chain, host) + "." + newLine;
        }
        else {
            result += ": " + diagnostic.messageText + newLine;
        }
        return result;
    }
    exports.formatDiagnostic = formatDiagnostic;
    function formatDiagnostics(diags, host) {
        if (host === void 0) { host = defaultFormatHost; }
        if (diags && diags.length) {
            return diags
                .map(function (diagnostic) {
                if (api.isTsDiagnostic(diagnostic)) {
                    return ts.formatDiagnostics([diagnostic], host);
                }
                else {
                    return formatDiagnostic(diagnostic, host);
                }
            })
                .join('');
        }
        else {
            return '';
        }
    }
    exports.formatDiagnostics = formatDiagnostics;
    function calcProjectFileAndBasePath(project) {
        var projectIsDir = fs.lstatSync(project).isDirectory();
        var projectFile = projectIsDir ? path.join(project, 'tsconfig.json') : project;
        var projectDir = projectIsDir ? project : path.dirname(project);
        var basePath = path.resolve(process.cwd(), projectDir);
        return { projectFile: projectFile, basePath: basePath };
    }
    exports.calcProjectFileAndBasePath = calcProjectFileAndBasePath;
    function createNgCompilerOptions(basePath, config, tsOptions) {
        return tslib_1.__assign({}, tsOptions, config.angularCompilerOptions, { genDir: basePath, basePath: basePath });
    }
    exports.createNgCompilerOptions = createNgCompilerOptions;
    function readConfiguration(project, existingOptions) {
        try {
            var _a = calcProjectFileAndBasePath(project), projectFile = _a.projectFile, basePath = _a.basePath;
            var _b = ts.readConfigFile(projectFile, ts.sys.readFile), config = _b.config, error = _b.error;
            if (error) {
                return {
                    project: project,
                    errors: [error],
                    rootNames: [],
                    options: {},
                    emitFlags: api.EmitFlags.Default
                };
            }
            var parseConfigHost = {
                useCaseSensitiveFileNames: true,
                fileExists: fs.existsSync,
                readDirectory: ts.sys.readDirectory,
                readFile: ts.sys.readFile
            };
            var parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, existingOptions);
            var rootNames = parsed.fileNames.map(function (f) { return path.normalize(f); });
            var options = createNgCompilerOptions(basePath, config, parsed.options);
            var emitFlags = api.EmitFlags.Default;
            if (!(options.skipMetadataEmit || options.flatModuleOutFile)) {
                emitFlags |= api.EmitFlags.Metadata;
            }
            if (options.skipTemplateCodegen) {
                emitFlags = emitFlags & ~api.EmitFlags.Codegen;
            }
            return { project: projectFile, rootNames: rootNames, options: options, errors: parsed.errors, emitFlags: emitFlags };
        }
        catch (e) {
            var errors = [{
                    category: ts.DiagnosticCategory.Error,
                    messageText: e.stack,
                    source: api.SOURCE,
                    code: api.UNKNOWN_ERROR_CODE
                }];
            return { project: '', errors: errors, rootNames: [], options: {}, emitFlags: api.EmitFlags.Default };
        }
    }
    exports.readConfiguration = readConfiguration;
    function exitCodeFromResult(diags) {
        if (!diags || filterErrorsAndWarnings(diags).length === 0) {
            // If we have a result and didn't get any errors, we succeeded.
            return 0;
        }
        // Return 2 if any of the errors were unknown.
        return diags.some(function (d) { return d.source === 'angular' && d.code === api.UNKNOWN_ERROR_CODE; }) ? 2 : 1;
    }
    exports.exitCodeFromResult = exitCodeFromResult;
    function performCompilation(_a) {
        var rootNames = _a.rootNames, options = _a.options, host = _a.host, oldProgram = _a.oldProgram, emitCallback = _a.emitCallback, mergeEmitResultsCallback = _a.mergeEmitResultsCallback, _b = _a.gatherDiagnostics, gatherDiagnostics = _b === void 0 ? defaultGatherDiagnostics : _b, customTransformers = _a.customTransformers, _c = _a.emitFlags, emitFlags = _c === void 0 ? api.EmitFlags.Default : _c;
        var program;
        var emitResult;
        var allDiagnostics = [];
        try {
            if (!host) {
                host = ng.createCompilerHost({ options: options });
            }
            program = ng.createProgram({ rootNames: rootNames, host: host, options: options, oldProgram: oldProgram });
            var beforeDiags = Date.now();
            allDiagnostics.push.apply(allDiagnostics, tslib_1.__spread(gatherDiagnostics(program)));
            if (options.diagnostics) {
                var afterDiags = Date.now();
                allDiagnostics.push(util_1.createMessageDiagnostic("Time for diagnostics: " + (afterDiags - beforeDiags) + "ms."));
            }
            if (!hasErrors(allDiagnostics)) {
                emitResult =
                    program.emit({ emitCallback: emitCallback, mergeEmitResultsCallback: mergeEmitResultsCallback, customTransformers: customTransformers, emitFlags: emitFlags });
                allDiagnostics.push.apply(allDiagnostics, tslib_1.__spread(emitResult.diagnostics));
                return { diagnostics: allDiagnostics, program: program, emitResult: emitResult };
            }
            return { diagnostics: allDiagnostics, program: program };
        }
        catch (e) {
            var errMsg = void 0;
            var code = void 0;
            if (compiler_1.isSyntaxError(e)) {
                // don't report the stack for syntax errors as they are well known errors.
                errMsg = e.message;
                code = api.DEFAULT_ERROR_CODE;
            }
            else {
                errMsg = e.stack;
                // It is not a syntax error we might have a program with unknown state, discard it.
                program = undefined;
                code = api.UNKNOWN_ERROR_CODE;
            }
            allDiagnostics.push({ category: ts.DiagnosticCategory.Error, messageText: errMsg, code: code, source: api.SOURCE });
            return { diagnostics: allDiagnostics, program: program };
        }
    }
    exports.performCompilation = performCompilation;
    function defaultGatherDiagnostics(program) {
        var allDiagnostics = [];
        function checkDiagnostics(diags) {
            if (diags) {
                allDiagnostics.push.apply(allDiagnostics, tslib_1.__spread(diags));
                return !hasErrors(diags);
            }
            return true;
        }
        var checkOtherDiagnostics = true;
        // Check parameter diagnostics
        checkOtherDiagnostics = checkOtherDiagnostics &&
            checkDiagnostics(tslib_1.__spread(program.getTsOptionDiagnostics(), program.getNgOptionDiagnostics()));
        // Check syntactic diagnostics
        checkOtherDiagnostics =
            checkOtherDiagnostics && checkDiagnostics(program.getTsSyntacticDiagnostics());
        // Check TypeScript semantic and Angular structure diagnostics
        checkOtherDiagnostics =
            checkOtherDiagnostics &&
                checkDiagnostics(tslib_1.__spread(program.getTsSemanticDiagnostics(), program.getNgStructuralDiagnostics()));
        // Check Angular semantic diagnostics
        checkOtherDiagnostics =
            checkOtherDiagnostics && checkDiagnostics(program.getNgSemanticDiagnostics());
        return allDiagnostics;
    }
    function hasErrors(diags) {
        return diags.some(function (d) { return d.category === ts.DiagnosticCategory.Error; });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZm9ybV9jb21waWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9wZXJmb3JtX2NvbXBpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsOENBQXVFO0lBQ3ZFLHVCQUF5QjtJQUN6QiwyQkFBNkI7SUFDN0IsK0JBQWlDO0lBRWpDLGdFQUEwQztJQUMxQyx3RUFBa0Q7SUFDbEQsb0VBQTREO0lBRTVELElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQztJQUl2QixpQ0FBd0MsV0FBd0I7UUFDOUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsUUFBUSxLQUFLLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQTVDLENBQTRDLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRkQsMERBRUM7SUFFRCxJQUFNLGlCQUFpQixHQUE2QjtRQUNsRCxtQkFBbUIsRUFBRSxjQUFNLE9BQUEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxFQUE1QixDQUE0QjtRQUN2RCxvQkFBb0IsRUFBRSxVQUFBLFFBQVEsSUFBSSxPQUFBLFFBQVEsRUFBUixDQUFRO1FBQzFDLFVBQVUsRUFBRSxjQUFNLE9BQUEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQWQsQ0FBYztLQUNqQyxDQUFDO0lBRUYseUJBQXlCLFFBQWdCLEVBQUUsSUFBOEI7UUFDdkUsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDeEYsQ0FBQztJQUVELGtDQUNJLFFBQWtCLEVBQUUsSUFBa0Q7UUFBbEQscUJBQUEsRUFBQSx3QkFBa0Q7UUFDeEUsTUFBTSxD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OEJBQThCO1FBQzlCLHFCQUFxQjtZQUNqQixxQkFBcUIsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMseUJBQXlCLEVBQWlCLENBQUMsQ0FBQztRQUVsRyw4REFBOEQ7UUFDOUQscUJBQXFCO1lBQ2pCLHFCQUFxQjtnQkFDckIsZ0JBQWdCLGtCQUNSLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxFQUFLLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxFQUFFLENBQUM7UUFFMUYscUNBQXFDO1FBQ3JDLHFCQUFxQjtZQUNqQixxQkFBcUIsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQWlCLENBQUMsQ0FBQztRQUVqRyxNQUFNLENBQUMsY0FBYyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxtQkFBbUIsS0FBa0I7UUFDbkMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsUUFBUSxLQUFLLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQTFDLENBQTBDLENBQUMsQ0FBQztJQUNyRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1Bvc2l0aW9uLCBpc1N5bnRheEVycm9yLCBzeW50YXhFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQgKiBhcyBhcGkgZnJvbSAnLi90cmFuc2Zvcm1lcnMvYXBpJztcbmltcG9ydCAqIGFzIG5nIGZyb20gJy4vdHJhbnNmb3JtZXJzL2VudHJ5X3BvaW50cyc7XG5pbXBvcnQge2NyZWF0ZU1lc3NhZ2VEaWFnbm9zdGljfSBmcm9tICcuL3RyYW5zZm9ybWVycy91dGlsJztcblxuY29uc3QgVFNfRVhUID0gL1xcLnRzJC87XG5cbmV4cG9ydCB0eXBlIERpYWdub3N0aWNzID0gUmVhZG9ubHlBcnJheTx0cy5EaWFnbm9zdGljfGFwaS5EaWFnbm9zdGljPjtcblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckVycm9yc0FuZFdhcm5pbmdzKGRpYWdub3N0aWNzOiBEaWFnbm9zdGljcyk6IERpYWdub3N0aWNzIHtcbiAgcmV0dXJuIGRpYWdub3N0aWNzLmZpbHRlcihkID0+IGQuY2F0ZWdvcnkgIT09IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5NZXNzYWdlKTtcbn1cblxuY29uc3QgZGVmYXVsdEZvcm1hdEhvc3Q6IHRzLkZvcm1hdERpYWdub3N0aWNzSG9zdCA9IHtcbiAgZ2V0Q3VycmVudERpcmVjdG9yeTogKCkgPT4gdHMuc3lzLmdldEN1cnJlbnREaXJlY3RvcnkoKSxcbiAgZ2V0Q2Fub25pY2FsRmlsZU5hbWU6IGZpbGVOYW1lID0+IGZpbGVOYW1lLFxuICBnZXROZXdMaW5lOiAoKSA9PiB0cy5zeXMubmV3TGluZVxufTtcblxuZnVuY3Rpb24gZGlzcGxheUZpbGVOYW1lKGZpbGVOYW1lOiBzdHJpbmcsIGhvc3Q6IHRzLkZvcm1hdERpYWdub3N0aWNzSG9zdCk6IHN0cmluZyB7XG4gIHJldHVybiBwYXRoLnJlbGF0aXZlKGhvc3QuZ2V0Q3VycmVudERpcmVjdG9yeSgpLCBob3N0LmdldENhbm9uaWNhbEZpbGVOYW1lKGZpbGVOYW1lKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREaWFnbm9zdGljUG9zaXRpb24oXG4gICAgcG9zaXRpb246IFBvc2l0aW9uLCBob3N0OiB0cy5Gb3JtYXREaWFnbm9zdGljc0hvc3QgPSBkZWZhdWx0Rm9ybWF0SG9zdCk6IHN0cmluZyB7XG4gIHJldHVybiBgJHtkaXNwbGF5RmlsZU5hbWUocG9zaXRpb24uZmlsZU5hbWUsIGhvc3QpfSgke3Bvc2l0aW9uLmxpbmUgKyAxfSwke3Bvc2l0aW9uLmNvbHVtbisxfSlgO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmxhdHRlbkRpYWdub3N0aWNNZXNzYWdlQ2hhaW4oXG4gICAgY2hhaW46IGFwaS5EaWFnbm9zdGljTWVzc2FnZUNoYWluLCBob3N0OiB0cy5Gb3JtYXREaWFnbm9zdGljc0hvc3QgPSBkZWZhdWx0Rm9ybWF0SG9zdCk6IHN0cmluZyB7XG4gIGxldCByZXN1bHQgPSBjaGFpbi5tZXNzYWdlVGV4dDtcbiAgbGV0IGluZGVudCA9IDE7XG4gIGxldCBjdXJyZW50ID0gY2hhaW4ubmV4dDtcbiAgY29uc3QgbmV3TGluZSA9IGhvc3QuZ2V0TmV3TGluZSgpO1xuICB3aGlsZSAoY3VycmVudCkge1xuICAgIHJlc3VsdCArPSBuZXdMaW5lO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5kZW50OyBpKyspIHtcbiAgICAgIHJlc3VsdCArPSAnICAnO1xuICAgIH1cbiAgICByZXN1bHQgKz0gY3VycmVudC5tZXNzYWdlVGV4dDtcbiAgICBjb25zdCBwb3NpdGlvbiA9IGN1cnJlbnQucG9zaXRpb247XG4gICAgaWYgKHBvc2l0aW9uKSB7XG4gICAgICByZXN1bHQgKz0gYCBhdCAke2Zvcm1hdERpYWdub3N0aWNQb3NpdGlvbihwb3NpdGlvbiwgaG9zdCl9YDtcbiAgICB9XG4gICAgY3VycmVudCA9IGN1cnJlbnQubmV4dDtcbiAgICBpbmRlbnQrKztcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGlhZ25vc3RpYyhcbiAgICBkaWFnbm9zdGljOiBhcGkuRGlhZ25vc3RpYywgaG9zdDogdHMuRm9ybWF0RGlhZ25vc3RpY3NIb3N0ID0gZGVmYXVsdEZvcm1hdEhvc3QpIHtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuICBjb25zdCBuZXdMaW5lID0gaG9zdC5nZXROZXdMaW5lKCk7XG4gIGNvbnN0IHNwYW4gPSBkaWFnbm9zdGljLnNwYW47XG4gIGlmIChzcGFuKSB7XG4gICAgcmVzdWx0ICs9IGAke2Zvcm1hdERpYWdub3N0aWNQb3NpdGlvbih7XG4gICAgICBmaWxlTmFtZTogc3Bhbi5zdGFydC5maWxlLnVybCxcbiAgICAgIGxpbmU6IHNwYW4uc3RhcnQubGluZSxcbiAgICAgIGNvbHVtbjogc3Bhbi5zdGFydC5jb2xcbiAgICB9LCBob3N0KX06IGA7XG4gIH0gZWxzZSBpZiAoZGlhZ25vc3RpYy5wb3NpdGlvbikge1xuICAgIHJlc3VsdCArPSBgJHtmb3JtYXREaWFnbm9zdGljUG9zaXRpb24oZGlhZ25vc3RpYy5wb3NpdGlvbiwgaG9zdCl9OiBgO1xuICB9XG4gIGlmIChkaWFnbm9zdGljLnNwYW4gJiYgZGlhZ25vc3RpYy5zcGFuLmRldGFpbHMpIHtcbiAgICByZXN1bHQgKz0gYDogJHtkaWFnbm9zdGljLnNwYW4uZGV0YWlsc30sICR7ZGlhZ25vc3RpYy5tZXNzYWdlVGV4dH0ke25ld0xpbmV9YDtcbiAgfSBlbHNlIGlmIChkaWFnbm9zdGljLmNoYWluKSB7XG4gICAgcmVzdWx0ICs9IGAke2ZsYXR0ZW5EaWFnbm9zdGljTWVzc2FnZUNoYWluKGRpYWdub3N0aWMuY2hhaW4sIGhvc3QpfS4ke25ld0xpbmV9YDtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgKz0gYDogJHtkaWFnbm9zdGljLm1lc3NhZ2VUZXh0fSR7bmV3TGluZX1gO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREaWFnbm9zdGljcyhcbiAgICBkaWFnczogRGlhZ25vc3RpY3MsIGhvc3Q6IHRzLkZvcm1hdERpYWdub3N0aWNzSG9zdCA9IGRlZmF1bHRGb3JtYXRIb3N0KTogc3RyaW5nIHtcbiAgaWYgKGRpYWdzICYmIGRpYWdzLmxlbmd0aCkge1xuICAgIHJldHVybiBkaWFnc1xuICAgICAgICAubWFwKGRpYWdub3N0aWMgPT4ge1xuICAgICAgICAgIGlmIChhcGkuaXNUc0RpYWdub3N0aWMoZGlhZ25vc3RpYykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cy5mb3JtYXREaWFnbm9zdGljcyhbZGlhZ25vc3RpY10sIGhvc3QpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0RGlhZ25vc3RpYyhkaWFnbm9zdGljLCBob3N0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5qb2luKCcnKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXJzZWRDb25maWd1cmF0aW9uIHtcbiAgcHJvamVjdDogc3RyaW5nO1xuICBvcHRpb25zOiBhcGkuQ29tcGlsZXJPcHRpb25zO1xuICByb290TmFtZXM6IHN0cmluZ1tdO1xuICBlbWl0RmxhZ3M6IGFwaS5FbWl0RmxhZ3M7XG4gIGVycm9yczogRGlhZ25vc3RpY3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjUHJvamVjdEZpbGVBbmRCYXNlUGF0aChwcm9qZWN0OiBzdHJpbmcpOlxuICAgIHtwcm9qZWN0RmlsZTogc3RyaW5nLCBiYXNlUGF0aDogc3RyaW5nfSB7XG4gIGNvbnN0IHByb2plY3RJc0RpciA9IGZzLmxzdGF0U3luYyhwcm9qZWN0KS5pc0RpcmVjdG9yeSgpO1xuICBjb25zdCBwcm9qZWN0RmlsZSA9IHByb2plY3RJc0RpciA/IHBhdGguam9pbihwcm9qZWN0LCAndHNjb25maWcuanNvbicpIDogcHJvamVjdDtcbiAgY29uc3QgcHJvamVjdERpciA9IHByb2plY3RJc0RpciA/IHByb2plY3QgOiBwYXRoLmRpcm5hbWUocHJvamVjdCk7XG4gIGNvbnN0IGJhc2VQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIHByb2plY3REaXIpO1xuICByZXR1cm4ge3Byb2plY3RGaWxlLCBiYXNlUGF0aH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOZ0NvbXBpbGVyT3B0aW9ucyhcbiAgICBiYXNlUGF0aDogc3RyaW5nLCBjb25maWc6IGFueSwgdHNPcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMpOiBhcGkuQ29tcGlsZXJPcHRpb25zIHtcbiAgcmV0dXJuIHsuLi50c09wdGlvbnMsIC4uLmNvbmZpZy5hbmd1bGFyQ29tcGlsZXJPcHRpb25zLCBnZW5EaXI6IGJhc2VQYXRoLCBiYXNlUGF0aH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQ29uZmlndXJhdGlvbihcbiAgICBwcm9qZWN0OiBzdHJpbmcsIGV4aXN0aW5nT3B0aW9ucz86IHRzLkNvbXBpbGVyT3B0aW9ucyk6IFBhcnNlZENvbmZpZ3VyYXRpb24ge1xuICB0cnkge1xuICAgIGNvbnN0IHtwcm9qZWN0RmlsZSwgYmFzZVBhdGh9ID0gY2FsY1Byb2plY3RGaWxlQW5kQmFzZVBhdGgocHJvamVjdCk7XG5cbiAgICBsZXQge2NvbmZpZywgZXJyb3J9ID0gdHMucmVhZENvbmZpZ0ZpbGUocHJvamVjdEZpbGUsIHRzLnN5cy5yZWFkRmlsZSk7XG5cbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb2plY3QsXG4gICAgICAgIGVycm9yczogW2Vycm9yXSxcbiAgICAgICAgcm9vdE5hbWVzOiBbXSxcbiAgICAgICAgb3B0aW9uczoge30sXG4gICAgICAgIGVtaXRGbGFnczogYXBpLkVtaXRGbGFncy5EZWZhdWx0XG4gICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBwYXJzZUNvbmZpZ0hvc3QgPSB7XG4gICAgICB1c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzOiB0cnVlLFxuICAgICAgZmlsZUV4aXN0czogZnMuZXhpc3RzU3luYyxcbiAgICAgIHJlYWREaXJlY3Rvcnk6IHRzLnN5cy5yZWFkRGlyZWN0b3J5LFxuICAgICAgcmVhZEZpbGU6IHRzLnN5cy5yZWFkRmlsZVxuICAgIH07XG4gICAgY29uc3QgcGFyc2VkID1cbiAgICAgICAgdHMucGFyc2VKc29uQ29uZmlnRmlsZUNvbnRlbnQoY29uZmlnLCBwYXJzZUNvbmZpZ0hvc3QsIGJhc2VQYXRoLCBleGlzdGluZ09wdGlvbnMpO1xuICAgIGNvbnN0IHJvb3ROYW1lcyA9IHBhcnNlZC5maWxlTmFtZXMubWFwKGYgPT4gcGF0aC5ub3JtYWxpemUoZikpO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IGNyZWF0ZU5nQ29tcGlsZXJPcHRpb25zKGJhc2VQYXRoLCBjb25maWcsIHBhcnNlZC5vcHRpb25zKTtcbiAgICBsZXQgZW1pdEZsYWdzID0gYXBpLkVtaXRGbGFncy5EZWZhdWx0O1xuICAgIGlmICghKG9wdGlvbnMuc2tpcE1ldGFkYXRhRW1pdCB8fCBvcHRpb25zLmZsYXRNb2R1bGVPdXRGaWxlKSkge1xuICAgICAgZW1pdEZsYWdzIHw9IGFwaS5FbWl0RmxhZ3MuTWV0YWRhdGE7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLnNraXBUZW1wbGF0ZUNvZGVnZW4pIHtcbiAgICAgIGVtaXRGbGFncyA9IGVtaXRGbGFncyAmIH5hcGkuRW1pdEZsYWdzLkNvZGVnZW47XG4gICAgfVxuICAgIHJldHVybiB7cHJvamVjdDogcHJvamVjdEZpbGUsIHJvb3ROYW1lcywgb3B0aW9ucywgZXJyb3JzOiBwYXJzZWQuZXJyb3JzLCBlbWl0RmxhZ3N9O1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc3QgZXJyb3JzOiBEaWFnbm9zdGljcyA9IFt7XG4gICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgbWVzc2FnZVRleHQ6IGUuc3RhY2ssXG4gICAgICBzb3VyY2U6IGFwaS5TT1VSQ0UsXG4gICAgICBjb2RlOiBhcGkuVU5LTk9XTl9FUlJPUl9DT0RFXG4gICAgfV07XG4gICAgcmV0dXJuIHtwcm9qZWN0OiAnJywgZXJyb3JzLCByb290TmFtZXM6IFtdLCBvcHRpb25zOiB7fSwgZW1pdEZsYWdzOiBhcGkuRW1pdEZsYWdzLkRlZmF1bHR9O1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyZm9ybUNvbXBpbGF0aW9uUmVzdWx0IHtcbiAgZGlhZ25vc3RpY3M6IERpYWdub3N0aWNzO1xuICBwcm9ncmFtPzogYXBpLlByb2dyYW07XG4gIGVtaXRSZXN1bHQ/OiB0cy5FbWl0UmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhpdENvZGVGcm9tUmVzdWx0KGRpYWdzOiBEaWFnbm9zdGljcyB8IHVuZGVmaW5lZCk6IG51bWJlciB7XG4gIGlmICghZGlhZ3MgfHwgZmlsdGVyRXJyb3JzQW5kV2FybmluZ3MoZGlhZ3MpLmxlbmd0aCA9PT0gMCkge1xuICAgIC8vIElmIHdlIGhhdmUgYSByZXN1bHQgYW5kIGRpZG4ndCBnZXQgYW55IGVycm9ycywgd2Ugc3VjY2VlZGVkLlxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gUmV0dXJuIDIgaWYgYW55IG9mIHRoZSBlcnJvcnMgd2VyZSB1bmtub3duLlxuICByZXR1cm4gZGlhZ3Muc29tZShkID0+IGQuc291cmNlID09PSAnYW5ndWxhcicgJiYgZC5jb2RlID09PSBhcGkuVU5LTk9XTl9FUlJPUl9DT0RFKSA/IDIgOiAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGVyZm9ybUNvbXBpbGF0aW9uKHtyb290TmFtZXMsIG9wdGlvbnMsIGhvc3QsIG9sZFByb2dyYW0sIGVtaXRDYWxsYmFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lcmdlRW1pdFJlc3VsdHNDYWxsYmFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdhdGhlckRpYWdub3N0aWNzID0gZGVmYXVsdEdhdGhlckRpYWdub3N0aWNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VzdG9tVHJhbnNmb3JtZXJzLCBlbWl0RmxhZ3MgPSBhcGkuRW1pdEZsYWdzLkRlZmF1bHR9OiB7XG4gIHJvb3ROYW1lczogc3RyaW5nW10sXG4gIG9wdGlvbnM6IGFwaS5Db21waWxlck9wdGlvbnMsXG4gIGhvc3Q/OiBhcGkuQ29tcGlsZXJIb3N0LFxuICBvbGRQcm9ncmFtPzogYXBpLlByb2dyYW0sXG4gIGVtaXRDYWxsYmFjaz86IGFwaS5Uc0VtaXRDYWxsYmFjayxcbiAgbWVyZ2VFbWl0UmVzdWx0c0NhbGxiYWNrPzogYXBpLlRzTWVyZ2VFbWl0UmVzdWx0c0NhbGxiYWNrLFxuICBnYXRoZXJEaWFnbm9zdGljcz86IChwcm9ncmFtOiBhcGkuUHJvZ3JhbSkgPT4gRGlhZ25vc3RpY3MsXG4gIGN1c3RvbVRyYW5zZm9ybWVycz86IGFwaS5DdXN0b21UcmFuc2Zvcm1lcnMsXG4gIGVtaXRGbGFncz86IGFwaS5FbWl0RmxhZ3Ncbn0pOiBQZXJmb3JtQ29tcGlsYXRpb25SZXN1bHQge1xuICBsZXQgcHJvZ3JhbTogYXBpLlByb2dyYW18dW5kZWZpbmVkO1xuICBsZXQgZW1pdFJlc3VsdDogdHMuRW1pdFJlc3VsdHx1bmRlZmluZWQ7XG4gIGxldCBhbGxEaWFnbm9zdGljczogQXJyYXk8dHMuRGlhZ25vc3RpY3xhcGkuRGlhZ25vc3RpYz4gPSBbXTtcbiAgdHJ5IHtcbiAgICBpZiAoIWhvc3QpIHtcbiAgICAgIGhvc3QgPSBuZy5jcmVhdGVDb21waWxlckhvc3Qoe29wdGlvbnN9KTtcbiAgICB9XG5cbiAgICBwcm9ncmFtID0gbmcuY3JlYXRlUHJvZ3JhbSh7cm9vdE5hbWVzLCBob3N0LCBvcHRpb25zLCBvbGRQcm9ncmFtfSk7XG5cbiAgICBjb25zdCBiZWZvcmVEaWFncyA9IERhdGUubm93KCk7XG4gICAgYWxsRGlhZ25vc3RpY3MucHVzaCguLi5nYXRoZXJEaWFnbm9zdGljcyhwcm9ncmFtICEpKTtcbiAgICBpZiAob3B0aW9ucy5kaWFnbm9zdGljcykge1xuICAgICAgY29uc3QgYWZ0ZXJEaWFncyA9IERhdGUubm93KCk7XG4gICAgICBhbGxEaWFnbm9zdGljcy5wdXNoKFxuICAgICAgICAgIGNyZWF0ZU1lc3NhZ2VEaWFnbm9zdGljKGBUaW1lIGZvciBkaWFnbm9zdGljczogJHthZnRlckRpYWdzIC0gYmVmb3JlRGlhZ3N9bXMuYCkpO1xuICAgIH1cblxuICAgIGlmICghaGFzRXJyb3JzKGFsbERpYWdub3N0aWNzKSkge1xuICAgICAgZW1pdFJlc3VsdCA9XG4gICAgICAgICAgcHJvZ3JhbSAhLmVtaXQoe2VtaXRDYWxsYmFjaywgbWVyZ2VFbWl0UmVzdWx0c0NhbGxiYWNrLCBjdXN0b21UcmFuc2Zvcm1lcnMsIGVtaXRGbGFnc30pO1xuICAgICAgYWxsRGlhZ25vc3RpY3MucHVzaCguLi5lbWl0UmVzdWx0LmRpYWdub3N0aWNzKTtcbiAgICAgIHJldHVybiB7ZGlhZ25vc3RpY3M6IGFsbERpYWdub3N0aWNzLCBwcm9ncmFtLCBlbWl0UmVzdWx0fTtcbiAgICB9XG4gICAgcmV0dXJuIHtkaWFnbm9zdGljczogYWxsRGlhZ25vc3RpY3MsIHByb2dyYW19O1xuICB9IGNhdGNoIChlKSB7XG4gICAgbGV0IGVyck1zZzogc3RyaW5nO1xuICAgIGxldCBjb2RlOiBudW1iZXI7XG4gICAgaWYgKGlzU3ludGF4RXJyb3IoZSkpIHtcbiAgICAgIC8vIGRvbid0IHJlcG9ydCB0aGUgc3RhY2sgZm9yIHN5bnRheCBlcnJvcnMgYXMgdGhleSBhcmUgd2VsbCBrbm93biBlcnJvcnMuXG4gICAgICBlcnJNc2cgPSBlLm1lc3NhZ2U7XG4gICAgICBjb2RlID0gYXBpLkRFRkFVTFRfRVJST1JfQ09ERTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyTXNnID0gZS5zdGFjaztcbiAgICAgIC8vIEl0IGlzIG5vdCBhIHN5bnRheCBlcnJvciB3ZSBtaWdodCBoYXZlIGEgcHJvZ3JhbSB3aXRoIHVua25vd24gc3RhdGUsIGRpc2NhcmQgaXQuXG4gICAgICBwcm9ncmFtID0gdW5kZWZpbmVkO1xuICAgICAgY29kZSA9IGFwaS5VTktOT1dOX0VSUk9SX0NPREU7XG4gICAgfVxuICAgIGFsbERpYWdub3N0aWNzLnB1c2goXG4gICAgICAgIHtjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLCBtZXNzYWdlVGV4dDogZXJyTXNnLCBjb2RlLCBzb3VyY2U6IGFwaS5TT1VSQ0V9KTtcbiAgICByZXR1cm4ge2RpYWdub3N0aWNzOiBhbGxEaWFnbm9zdGljcywgcHJvZ3JhbX07XG4gIH1cbn1cbmZ1bmN0aW9uIGRlZmF1bHRHYXRoZXJEaWFnbm9zdGljcyhwcm9ncmFtOiBhcGkuUHJvZ3JhbSk6IERpYWdub3N0aWNzIHtcbiAgY29uc3QgYWxsRGlhZ25vc3RpY3M6IEFycmF5PHRzLkRpYWdub3N0aWN8YXBpLkRpYWdub3N0aWM+ID0gW107XG5cbiAgZnVuY3Rpb24gY2hlY2tEaWFnbm9zdGljcyhkaWFnczogRGlhZ25vc3RpY3MgfCB1bmRlZmluZWQpIHtcbiAgICBpZiAoZGlhZ3MpIHtcbiAgICAgIGFsbERpYWdub3N0aWNzLnB1c2goLi4uZGlhZ3MpO1xuICAgICAgcmV0dXJuICFoYXNFcnJvcnMoZGlhZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGxldCBjaGVja090aGVyRGlhZ25vc3RpY3MgPSB0cnVlO1xuICAvLyBDaGVjayBwYXJhbWV0ZXIgZGlhZ25vc3RpY3NcbiAgY2hlY2tPdGhlckRpYWdub3N0aWNzID0gY2hlY2tPdGhlckRpYWdub3N0aWNzICYmXG4gICAgICBjaGVja0RpYWdub3N0aWNzKFsuLi5wcm9ncmFtLmdldFRzT3B0aW9uRGlhZ25vc3RpY3MoKSwgLi4ucHJvZ3JhbS5nZXROZ09wdGlvbkRpYWdub3N0aWNzKCldKTtcblxuICAvLyBDaGVjayBzeW50YWN0aWMgZGlhZ25vc3RpY3NcbiAgY2hlY2tPdGhlckRpYWdub3N0aWNzID1cbiAgICAgIGNoZWNrT3RoZXJEaWFnbm9zdGljcyAmJiBjaGVja0RpYWdub3N0aWNzKHByb2dyYW0uZ2V0VHNTeW50YWN0aWNEaWFnbm9zdGljcygpIGFzIERpYWdub3N0aWNzKTtcblxuICAvLyBDaGVjayBUeXBlU2NyaXB0IHNlbWFudGljIGFuZCBBbmd1bGFyIHN0cnVjdHVyZSBkaWFnbm9zdGljc1xuICBjaGVja090aGVyRGlhZ25vc3RpY3MgPVxuICAgICAgY2hlY2tPdGhlckRpYWdub3N0aWNzICYmXG4gICAgICBjaGVja0RpYWdub3N0aWNzKFxuICAgICAgICAgIFsuLi5wcm9ncmFtLmdldFRzU2VtYW50aWNEaWFnbm9zdGljcygpLCAuLi5wcm9ncmFtLmdldE5nU3RydWN0dXJhbERpYWdub3N0aWNzKCldKTtcblxuICAvLyBDaGVjayBBbmd1bGFyIHNlbWFudGljIGRpYWdub3N0aWNzXG4gIGNoZWNrT3RoZXJEaWFnbm9zdGljcyA9XG4gICAgICBjaGVja090aGVyRGlhZ25vc3RpY3MgJiYgY2hlY2tEaWFnbm9zdGljcyhwcm9ncmFtLmdldE5nU2VtYW50aWNEaWFnbm9zdGljcygpIGFzIERpYWdub3N0aWNzKTtcblxuICByZXR1cm4gYWxsRGlhZ25vc3RpY3M7XG59XG5cbmZ1bmN0aW9uIGhhc0Vycm9ycyhkaWFnczogRGlhZ25vc3RpY3MpIHtcbiAgcmV0dXJuIGRpYWdzLnNvbWUoZCA9PiBkLmNhdGVnb3J5ID09PSB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IpO1xufVxuIl19