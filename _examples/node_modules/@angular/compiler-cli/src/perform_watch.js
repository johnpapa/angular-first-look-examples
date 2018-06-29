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
        define("@angular/compiler-cli/src/perform_watch", ["require", "exports", "chokidar", "path", "typescript", "@angular/compiler-cli/src/perform_compile", "@angular/compiler-cli/src/transformers/api", "@angular/compiler-cli/src/transformers/entry_points", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var chokidar = require("chokidar");
    var path = require("path");
    var ts = require("typescript");
    var perform_compile_1 = require("@angular/compiler-cli/src/perform_compile");
    var api = require("@angular/compiler-cli/src/transformers/api");
    var entry_points_1 = require("@angular/compiler-cli/src/transformers/entry_points");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    function totalCompilationTimeDiagnostic(timeInMillis) {
        var duration;
        if (timeInMillis > 1000) {
            duration = (timeInMillis / 1000).toPrecision(2) + "s";
        }
        else {
            duration = timeInMillis + "ms";
        }
        return {
            category: ts.DiagnosticCategory.Message,
            messageText: "Total time: " + duration,
            code: api.DEFAULT_ERROR_CODE,
            source: api.SOURCE,
        };
    }
    var FileChangeEvent;
    (function (FileChangeEvent) {
        FileChangeEvent[FileChangeEvent["Change"] = 0] = "Change";
        FileChangeEvent[FileChangeEvent["CreateDelete"] = 1] = "CreateDelete";
        FileChangeEvent[FileChangeEvent["CreateDeleteDir"] = 2] = "CreateDeleteDir";
    })(FileChangeEvent = exports.FileChangeEvent || (exports.FileChangeEvent = {}));
    function createPerformWatchHost(configFileName, reportDiagnostics, existingOptions, createEmitCallback) {
        return {
            reportDiagnostics: reportDiagnostics,
            createCompilerHost: function (options) { return entry_points_1.createCompilerHost({ options: options }); },
            readConfiguration: function () { return perform_compile_1.readConfiguration(configFileName, existingOptions); },
            createEmitCallback: function (options) { return createEmitCallback ? createEmitCallback(options) : undefined; },
            onFileChange: function (options, listener, ready) {
                if (!options.basePath) {
                    reportDiagnostics([{
                            category: ts.DiagnosticCategory.Error,
                            messageText: 'Invalid configuration option. baseDir not specified',
                            source: api.SOURCE,
                            code: api.DEFAULT_ERROR_CODE
                        }]);
                    return { close: function () { } };
                }
                var watcher = chokidar.watch(options.basePath, {
                    // ignore .dotfiles, .js and .map files.
                    // can't ignore other files as we e.g. want to recompile if an `.html` file changes as well.
                    ignored: /((^[\/\\])\..)|(\.js$)|(\.map$)|(\.metadata\.json)/,
                    ignoreInitial: true,
                    persistent: true,
                });
                watcher.on('all', function (event, path) {
                    switch (event) {
                        case 'change':
                            listener(FileChangeEvent.Change, path);
                            break;
                        case 'unlink':
                        case 'add':
                            listener(FileChangeEvent.CreateDelete, path);
                            break;
                        case 'unlinkDir':
                        case 'addDir':
                            listener(FileChangeEvent.CreateDeleteDir, path);
                            break;
                    }
                });
                watcher.on('ready', ready);
                return { close: function () { return watcher.close(); }, ready: ready };
            },
            setTimeout: (ts.sys.clearTimeout && ts.sys.setTimeout) || setTimeout,
            clearTimeout: (ts.sys.setTimeout && ts.sys.clearTimeout) || clearTimeout,
        };
    }
    exports.createPerformWatchHost = createPerformWatchHost;
    /**
     * The logic in this function is adapted from `tsc.ts` from TypeScript.
     */
    function performWatchCompilation(host) {
        var cachedProgram; // Program cached from last compilation
        var cachedCompilerHost; // CompilerHost cached from last compilation
        var cachedOptions; // CompilerOptions cached from last compilation
        var timerHandleForRecompilation; // Handle for 0.25s wait timer to trigger recompilation
        var ingoreFilesForWatch = new Set();
        var fileCache = new Map();
        var firstCompileResult = doCompilation();
        // Watch basePath, ignoring .dotfiles
        var resolveReadyPromise;
        var readyPromise = new Promise(function (resolve) { return resolveReadyPromise = resolve; });
        // Note: ! is ok as options are filled after the first compilation
        // Note: ! is ok as resolvedReadyPromise is filled by the previous call
        var fileWatcher = host.onFileChange(cachedOptions.options, watchedFileChanged, resolveReadyPromise);
        return { close: close, ready: function (cb) { return readyPromise.then(cb); }, firstCompileResult: firstCompileResult };
        function cacheEntry(fileName) {
            fileName = path.normalize(fileName);
            var entry = fileCache.get(fileName);
            if (!entry) {
                entry = {};
                fileCache.set(fileName, entry);
            }
            return entry;
        }
        function close() {
            fileWatcher.close();
            if (timerHandleForRecompilation) {
                host.clearTimeout(timerHandleForRecompilation);
                timerHandleForRecompilation = undefined;
            }
        }
        // Invoked to perform initial compilation or re-compilation in watch mode
        function doCompilation() {
            if (!cachedOptions) {
                cachedOptions = host.readConfiguration();
            }
            if (cachedOptions.errors && cachedOptions.errors.length) {
                host.reportDiagnostics(cachedOptions.errors);
                return cachedOptions.errors;
            }
            var startTime = Date.now();
            if (!cachedCompilerHost) {
                cachedCompilerHost = host.createCompilerHost(cachedOptions.options);
                var originalWriteFileCallback_1 = cachedCompilerHost.writeFile;
                cachedCompilerHost.writeFile = function (fileName, data, writeByteOrderMark, onError, sourceFiles) {
                    if (sourceFiles === void 0) { sourceFiles = []; }
                    ingoreFilesForWatch.add(path.normalize(fileName));
                    return originalWriteFileCallback_1(fileName, data, writeByteOrderMark, onError, sourceFiles);
                };
                var originalFileExists_1 = cachedCompilerHost.fileExists;
                cachedCompilerHost.fileExists = function (fileName) {
                    var ce = cacheEntry(fileName);
                    if (ce.exists == null) {
                        ce.exists = originalFileExists_1.call(this, fileName);
                    }
                    return ce.exists;
                };
                var originalGetSourceFile_1 = cachedCompilerHost.getSourceFile;
                cachedCompilerHost.getSourceFile = function (fileName, languageVersion) {
                    var ce = cacheEntry(fileName);
                    if (!ce.sf) {
                        ce.sf = originalGetSourceFile_1.call(this, fileName, languageVersion);
                    }
                    return ce.sf;
                };
                var originalReadFile_1 = cachedCompilerHost.readFile;
                cachedCompilerHost.readFile = function (fileName) {
                    var ce = cacheEntry(fileName);
                    if (ce.content == null) {
                        ce.content = originalReadFile_1.call(this, fileName);
                    }
                    return ce.content;
                };
            }
            ingoreFilesForWatch.clear();
            var oldProgram = cachedProgram;
            // We clear out the `cachedProgram` here as a
            // program can only be used as `oldProgram` 1x
            cachedProgram = undefined;
            var compileResult = perform_compile_1.performCompilation({
                rootNames: cachedOptions.rootNames,
                options: cachedOptions.options,
                host: cachedCompilerHost,
                oldProgram: cachedProgram,
                emitCallback: host.createEmitCallback(cachedOptions.options)
            });
            if (compileResult.diagnostics.length) {
                host.reportDiagnostics(compileResult.diagnostics);
            }
            var endTime = Date.now();
            if (cachedOptions.options.diagnostics) {
                var totalTime = (endTime - startTime) / 1000;
                host.reportDiagnostics([totalCompilationTimeDiagnostic(endTime - startTime)]);
            }
            var exitCode = perform_compile_1.exitCodeFromResult(compileResult.diagnostics);
            if (exitCode == 0) {
                cachedProgram = compileResult.program;
                host.reportDiagnostics([util_1.createMessageDiagnostic('Compilation complete. Watching for file changes.')]);
            }
            else {
                host.reportDiagnostics([util_1.createMessageDiagnostic('Compilation failed. Watching for file changes.')]);
            }
            return compileResult.diagnostics;
        }
        function resetOptions() {
            cachedProgram = undefined;
            cachedCompilerHost = undefined;
            cachedOptions = undefined;
        }
        function watchedFileChanged(event, fileName) {
            if (cachedOptions && event === FileChangeEvent.Change &&
                // TODO(chuckj): validate that this is sufficient to skip files that were written.
                // This assumes that the file path we write is the same file path we will receive in the
                // change notification.
                path.normalize(fileName) === path.normalize(cachedOptions.project)) {
                // If the configuration file changes, forget everything and start the recompilation timer
                resetOptions();
            }
            else if (event === FileChangeEvent.CreateDelete || event === FileChangeEvent.CreateDeleteDir) {
                // If a file was added or removed, reread the configuration
                // to determine the new list of root files.
                cachedOptions = undefined;
            }
            if (event === FileChangeEvent.CreateDeleteDir) {
                fileCache.clear();
            }
            else {
                fileCache.delete(path.normalize(fileName));
            }
            if (!ingoreFilesForWatch.has(path.normalize(fileName))) {
                // Ignore the file if the file is one that was written by the compiler.
                startTimerForRecompilation();
            }
        }
        // Upon detecting a file change, wait for 250ms and then perform a recompilation. This gives batch
        // operations (such as saving all modified files in an editor) a chance to complete before we kick
        // off a new compilation.
        function startTimerForRecompilation() {
            if (timerHandleForRecompilation) {
                host.clearTimeout(timerHandleForRecompilation);
            }
            timerHandleForRecompilation = host.setTimeout(recompile, 250);
        }
        function recompile() {
            timerHandleForRecompilation = undefined;
            host.reportDiagnostics([util_1.createMessageDiagnostic('File change detected. Starting incremental compilation.')]);
            doCompilation();
        }
    }
    exports.performWatchCompilation = performWatchCompilation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZm9ybV93YXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvcGVyZm9ybV93YXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILG1DQUFxQztJQUNyQywyQkFBNkI7SUFDN0IsK0JBQWlDO0lBRWpDLDZFQUF3SjtJQUN4SixnRUFBMEM7SUFDMUMsb0ZBQStEO0lBQy9ELG9FQUE0RDtJQUU1RCx3Q0FBd0MsWUFBb0I7UUFDMUQsSUFBSSxRQUFnQixDQUFDO1FBQ3JCLEVBQUUsQ0FBQyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLFFBQVEsR0FBTSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQUcsQ0FBQztRQUN4RCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixRQUFRLEdBQU0sWUFBWSxPQUFJLENBQUM7UUFDakMsQ0FBQztRQUNELE1BQU0sQ0FBQztZQUNMLFFBQVEsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTztZQUN2QyxXQUFXLEVBQUUsaUJBQWUsUUFBVTtZQUN0QyxJQUFJLEVBQUUsR0FBRyxDQUFDLGtCQUFrQjtZQUM1QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07U0FDbkIsQ0FBQztJQUNKLENBQUM7SUFFRCxJQUFZLGVBSVg7SUFKRCxXQUFZLGVBQWU7UUFDekIseURBQU0sQ0FBQTtRQUNOLHFFQUFZLENBQUE7UUFDWiwyRUFBZSxDQUFBO0lBQ2pCLENBQUMsRUFKVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQUkxQjtJQWNELGdDQUNJLGNBQXNCLEVBQUUsaUJBQXFELEVBQzdFLGVBQW9DLEVBQUUsa0JBQ2tDO1FBQzFFLE1BQU0sQ0FBQztZQUNMLGlCQUFpQixFQUFFLGlCQUFpQjtZ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QUNOLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzdDLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCx1RUFBdUU7Z0JBQ3ZFLDBCQUEwQixFQUFFLENBQUM7WUFDL0IsQ0FBQztRQUNILENBQUM7UUFFRCxrR0FBa0c7UUFDbEcsa0dBQWtHO1FBQ2xHLHlCQUF5QjtRQUN6QjtZQUNFLEVBQUUsQ0FBQyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLFlBQVksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQ2pELENBQUM7WUFDRCwyQkFBMkIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRUQ7WUFDRSwyQkFBMkIsR0FBRyxTQUFTLENBQUM7WUFDeEMsSUFBSSxDQUFDLGlCQUFpQixDQUNsQixDQUFDLDhCQUF1QixDQUFDLHlEQUF5RCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFGLGFBQWEsRUFBRSxDQUFDO1FBQ2xCLENBQUM7SUFDSCxDQUFDO0lBektELDBEQXlLQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgY2hva2lkYXIgZnJvbSAnY2hva2lkYXInO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0RpYWdub3N0aWNzLCBQYXJzZWRDb25maWd1cmF0aW9uLCBQZXJmb3JtQ29tcGlsYXRpb25SZXN1bHQsIGV4aXRDb2RlRnJvbVJlc3VsdCwgcGVyZm9ybUNvbXBpbGF0aW9uLCByZWFkQ29uZmlndXJhdGlvbn0gZnJvbSAnLi9wZXJmb3JtX2NvbXBpbGUnO1xuaW1wb3J0ICogYXMgYXBpIGZyb20gJy4vdHJhbnNmb3JtZXJzL2FwaSc7XG5pbXBvcnQge2NyZWF0ZUNvbXBpbGVySG9zdH0gZnJvbSAnLi90cmFuc2Zvcm1lcnMvZW50cnlfcG9pbnRzJztcbmltcG9ydCB7Y3JlYXRlTWVzc2FnZURpYWdub3N0aWN9IGZyb20gJy4vdHJhbnNmb3JtZXJzL3V0aWwnO1xuXG5mdW5jdGlvbiB0b3RhbENvbXBpbGF0aW9uVGltZURpYWdub3N0aWModGltZUluTWlsbGlzOiBudW1iZXIpOiBhcGkuRGlhZ25vc3RpYyB7XG4gIGxldCBkdXJhdGlvbjogc3RyaW5nO1xuICBpZiAodGltZUluTWlsbGlzID4gMTAwMCkge1xuICAgIGR1cmF0aW9uID0gYCR7KHRpbWVJbk1pbGxpcyAvIDEwMDApLnRvUHJlY2lzaW9uKDIpfXNgO1xuICB9IGVsc2Uge1xuICAgIGR1cmF0aW9uID0gYCR7dGltZUluTWlsbGlzfW1zYDtcbiAgfVxuICByZXR1cm4ge1xuICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuTWVzc2FnZSxcbiAgICBtZXNzYWdlVGV4dDogYFRvdGFsIHRpbWU6ICR7ZHVyYXRpb259YCxcbiAgICBjb2RlOiBhcGkuREVGQVVMVF9FUlJPUl9DT0RFLFxuICAgIHNvdXJjZTogYXBpLlNPVVJDRSxcbiAgfTtcbn1cblxuZXhwb3J0IGVudW0gRmlsZUNoYW5nZUV2ZW50IHtcbiAgQ2hhbmdlLFxuICBDcmVhdGVEZWxldGUsXG4gIENyZWF0ZURlbGV0ZURpcixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQZXJmb3JtV2F0Y2hIb3N0IHtcbiAgcmVwb3J0RGlhZ25vc3RpY3MoZGlhZ25vc3RpY3M6IERpYWdub3N0aWNzKTogdm9pZDtcbiAgcmVhZENvbmZpZ3VyYXRpb24oKTogUGFyc2VkQ29uZmlndXJhdGlvbjtcbiAgY3JlYXRlQ29tcGlsZXJIb3N0KG9wdGlvbnM6IGFwaS5Db21waWxlck9wdGlvbnMpOiBhcGkuQ29tcGlsZXJIb3N0O1xuICBjcmVhdGVFbWl0Q2FsbGJhY2sob3B0aW9uczogYXBpLkNvbXBpbGVyT3B0aW9ucyk6IGFwaS5Uc0VtaXRDYWxsYmFja3x1bmRlZmluZWQ7XG4gIG9uRmlsZUNoYW5nZShcbiAgICAgIG9wdGlvbnM6IGFwaS5Db21waWxlck9wdGlvbnMsIGxpc3RlbmVyOiAoZXZlbnQ6IEZpbGVDaGFuZ2VFdmVudCwgZmlsZU5hbWU6IHN0cmluZykgPT4gdm9pZCxcbiAgICAgIHJlYWR5OiAoKSA9PiB2b2lkKToge2Nsb3NlOiAoKSA9PiB2b2lkfTtcbiAgc2V0VGltZW91dChjYWxsYmFjazogKCkgPT4gdm9pZCwgbXM6IG51bWJlcik6IGFueTtcbiAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZDogYW55KTogdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBlcmZvcm1XYXRjaEhvc3QoXG4gICAgY29uZmlnRmlsZU5hbWU6IHN0cmluZywgcmVwb3J0RGlhZ25vc3RpY3M6IChkaWFnbm9zdGljczogRGlhZ25vc3RpY3MpID0+IHZvaWQsXG4gICAgZXhpc3RpbmdPcHRpb25zPzogdHMuQ29tcGlsZXJPcHRpb25zLCBjcmVhdGVFbWl0Q2FsbGJhY2s/OiAob3B0aW9uczogYXBpLkNvbXBpbGVyT3B0aW9ucykgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGkuVHNFbWl0Q2FsbGJhY2sgfCB1bmRlZmluZWQpOiBQZXJmb3JtV2F0Y2hIb3N0IHtcbiAgcmV0dXJuIHtcbiAgICByZXBvcnREaWFnbm9zdGljczogcmVwb3J0RGlhZ25vc3RpY3MsXG4gICAgY3JlYXRlQ29tcGlsZXJIb3N0OiBvcHRpb25zID0+IGNyZWF0ZUNvbXBpbGVySG9zdCh7b3B0aW9uc30pLFxuICAgIHJlYWRDb25maWd1cmF0aW9uOiAoKSA9PiByZWFkQ29uZmlndXJhdGlvbihjb25maWdGaWxlTmFtZSwgZXhpc3RpbmdPcHRpb25zKSxcbiAgICBjcmVhdGVFbWl0Q2FsbGJhY2s6IG9wdGlvbnMgPT4gY3JlYXRlRW1pdENhbGxiYWNrID8gY3JlYXRlRW1pdENhbGxiYWNrKG9wdGlvbnMpIDogdW5kZWZpbmVkLFxuICAgIG9uRmlsZUNoYW5nZTogKG9wdGlvbnMsIGxpc3RlbmVyLCByZWFkeTogKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgaWYgKCFvcHRpb25zLmJhc2VQYXRoKSB7XG4gICAgICAgIHJlcG9ydERpYWdub3N0aWNzKFt7XG4gICAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgICBtZXNzYWdlVGV4dDogJ0ludmFsaWQgY29uZmlndXJhdGlvbiBvcHRpb24uIGJhc2VEaXIgbm90IHNwZWNpZmllZCcsXG4gICAgICAgICAgc291cmNlOiBhcGkuU09VUkNFLFxuICAgICAgICAgIGNvZGU6IGFwaS5ERUZBVUxUX0VSUk9SX0NPREVcbiAgICAgICAgfV0pO1xuICAgICAgICByZXR1cm4ge2Nsb3NlOiAoKSA9PiB7fX07XG4gICAgICB9XG4gICAgICBjb25zdCB3YXRjaGVyID0gY2hva2lkYXIud2F0Y2gob3B0aW9ucy5iYXNlUGF0aCwge1xuICAgICAgICAvLyBpZ25vcmUgLmRvdGZpbGVzLCAuanMgYW5kIC5tYXAgZmlsZXMuXG4gICAgICAgIC8vIGNhbid0IGlnbm9yZSBvdGhlciBmaWxlcyBhcyB3ZSBlLmcuIHdhbnQgdG8gcmVjb21waWxlIGlmIGFuIGAuaHRtbGAgZmlsZSBjaGFuZ2VzIGFzIHdlbGwuXG4gICAgICAgIGlnbm9yZWQ6IC8oKF5bXFwvXFxcXF0pXFwuLil8KFxcLmpzJCl8KFxcLm1hcCQpfChcXC5tZXRhZGF0YVxcLmpzb24pLyxcbiAgICAgICAgaWdub3JlSW5pdGlhbDogdHJ1ZSxcbiAgICAgICAgcGVyc2lzdGVudDogdHJ1ZSxcbiAgICAgIH0pO1xuICAgICAgd2F0Y2hlci5vbignYWxsJywgKGV2ZW50OiBzdHJpbmcsIHBhdGg6IHN0cmluZykgPT4ge1xuICAgICAgICBzd2l0Y2ggKGV2ZW50KSB7XG4gICAgICAgICAgY2FzZSAnY2hhbmdlJzpcbiAgICAgICAgICAgIGxpc3RlbmVyKEZpbGVDaGFuZ2VFdmVudC5DaGFuZ2UsIHBhdGgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndW5saW5rJzpcbiAgICAgICAgICBjYXNlICdhZGQnOlxuICAgICAgICAgICAgbGlzdGVuZXIoRmlsZUNoYW5nZUV2ZW50LkNyZWF0ZURlbGV0ZSwgcGF0aCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd1bmxpbmtEaXInOlxuICAgICAgICAgIGNhc2UgJ2FkZERpcic6XG4gICAgICAgICAgICBsaXN0ZW5lcihGaWxlQ2hhbmdlRXZlbnQuQ3JlYXRlRGVsZXRlRGlyLCBwYXRoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHdhdGNoZXIub24oJ3JlYWR5JywgcmVhZHkpO1xuICAgICAgcmV0dXJuIHtjbG9zZTogKCkgPT4gd2F0Y2hlci5jbG9zZSgpLCByZWFkeX07XG4gICAgfSxcbiAgICBzZXRUaW1lb3V0OiAodHMuc3lzLmNsZWFyVGltZW91dCAmJiB0cy5zeXMuc2V0VGltZW91dCkgfHwgc2V0VGltZW91dCxcbiAgICBjbGVhclRpbWVvdXQ6ICh0cy5zeXMuc2V0VGltZW91dCAmJiB0cy5zeXMuY2xlYXJUaW1lb3V0KSB8fCBjbGVhclRpbWVvdXQsXG4gIH07XG59XG5cbmludGVyZmFjZSBDYWNoZUVudHJ5IHtcbiAgZXhpc3RzPzogYm9vbGVhbjtcbiAgc2Y/OiB0cy5Tb3VyY2VGaWxlO1xuICBjb250ZW50Pzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFRoZSBsb2dpYyBpbiB0aGlzIGZ1bmN0aW9uIGlzIGFkYXB0ZWQgZnJvbSBgdHNjLnRzYCBmcm9tIFR5cGVTY3JpcHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwZXJmb3JtV2F0Y2hDb21waWxhdGlvbihob3N0OiBQZXJmb3JtV2F0Y2hIb3N0KTpcbiAgICB7Y2xvc2U6ICgpID0+IHZvaWQsIHJlYWR5OiAoY2I6ICgpID0+IHZvaWQpID0+IHZvaWQsIGZpcnN0Q29tcGlsZVJlc3VsdDogRGlhZ25vc3RpY3N9IHtcbiAgbGV0IGNhY2hlZFByb2dyYW06IGFwaS5Qcm9ncmFtfHVuZGVmaW5lZDsgICAgICAgICAgICAvLyBQcm9ncmFtIGNhY2hlZCBmcm9tIGxhc3QgY29tcGlsYXRpb25cbiAgbGV0IGNhY2hlZENvbXBpbGVySG9zdDogYXBpLkNvbXBpbGVySG9zdHx1bmRlZmluZWQ7ICAvLyBDb21waWxlckhvc3QgY2FjaGVkIGZyb20gbGFzdCBjb21waWxhdGlvblxuICBsZXQgY2FjaGVkT3B0aW9uczogUGFyc2VkQ29uZmlndXJhdGlvbnx1bmRlZmluZWQ7ICAvLyBDb21waWxlck9wdGlvbnMgY2FjaGVkIGZyb20gbGFzdCBjb21waWxhdGlvblxuICBsZXQgdGltZXJIYW5kbGVGb3JSZWNvbXBpbGF0aW9uOiBhbnk7ICAvLyBIYW5kbGUgZm9yIDAuMjVzIHdhaXQgdGltZXIgdG8gdHJpZ2dlciByZWNvbXBpbGF0aW9uXG5cbiAgY29uc3QgaW5nb3JlRmlsZXNGb3JXYXRjaCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCBmaWxlQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgQ2FjaGVFbnRyeT4oKTtcblxuICBjb25zdCBmaXJzdENvbXBpbGVSZXN1bHQgPSBkb0NvbXBpbGF0aW9uKCk7XG5cbiAgLy8gV2F0Y2ggYmFzZVBhdGgsIGlnbm9yaW5nIC5kb3RmaWxlc1xuICBsZXQgcmVzb2x2ZVJlYWR5UHJvbWlzZTogKCkgPT4gdm9pZDtcbiAgY29uc3QgcmVhZHlQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlUmVhZHlQcm9taXNlID0gcmVzb2x2ZSk7XG4gIC8vIE5vdGU6ICEgaXMgb2sgYXMgb3B0aW9ucyBhcmUgZmlsbGVkIGFmdGVyIHRoZSBmaXJzdCBjb21waWxhdGlvblxuICAvLyBOb3RlOiAhIGlzIG9rIGFzIHJlc29sdmVkUmVhZHlQcm9taXNlIGlzIGZpbGxlZCBieSB0aGUgcHJldmlvdXMgY2FsbFxuICBjb25zdCBmaWxlV2F0Y2hlciA9XG4gICAgICBob3N0Lm9uRmlsZUNoYW5nZShjYWNoZWRPcHRpb25zICEub3B0aW9ucywgd2F0Y2hlZEZpbGVDaGFuZ2VkLCByZXNvbHZlUmVhZHlQcm9taXNlICEpO1xuXG4gIHJldHVybiB7Y2xvc2UsIHJlYWR5OiBjYiA9PiByZWFkeVByb21pc2UudGhlbihjYiksIGZpcnN0Q29tcGlsZVJlc3VsdH07XG5cbiAgZnVuY3Rpb24gY2FjaGVFbnRyeShmaWxlTmFtZTogc3RyaW5nKTogQ2FjaGVFbnRyeSB7XG4gICAgZmlsZU5hbWUgPSBwYXRoLm5vcm1hbGl6ZShmaWxlTmFtZSk7XG4gICAgbGV0IGVudHJ5ID0gZmlsZUNhY2hlLmdldChmaWxlTmFtZSk7XG4gICAgaWYgKCFlbnRyeSkge1xuICAgICAgZW50cnkgPSB7fTtcbiAgICAgIGZpbGVDYWNoZS5zZXQoZmlsZU5hbWUsIGVudHJ5KTtcbiAgICB9XG4gICAgcmV0dXJuIGVudHJ5O1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgZmlsZVdhdGNoZXIuY2xvc2UoKTtcbiAgICBpZiAodGltZXJIYW5kbGVGb3JSZWNvbXBpbGF0aW9uKSB7XG4gICAgICBob3N0LmNsZWFyVGltZW91dCh0aW1lckhhbmRsZUZvclJlY29tcGlsYXRpb24pO1xuICAgICAgdGltZXJIYW5kbGVGb3JSZWNvbXBpbGF0aW9uID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIC8vIEludm9rZWQgdG8gcGVyZm9ybSBpbml0aWFsIGNvbXBpbGF0aW9uIG9yIHJlLWNvbXBpbGF0aW9uIGluIHdhdGNoIG1vZGVcbiAgZnVuY3Rpb24gZG9Db21waWxhdGlvbigpOiBEaWFnbm9zdGljcyB7XG4gICAgaWYgKCFjYWNoZWRPcHRpb25zKSB7XG4gICAgICBjYWNoZWRPcHRpb25zID0gaG9zdC5yZWFkQ29uZmlndXJhdGlvbigpO1xuICAgIH1cbiAgICBpZiAoY2FjaGVkT3B0aW9ucy5lcnJvcnMgJiYgY2FjaGVkT3B0aW9ucy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgICBob3N0LnJlcG9ydERpYWdub3N0aWNzKGNhY2hlZE9wdGlvbnMuZXJyb3JzKTtcbiAgICAgIHJldHVybiBjYWNoZWRPcHRpb25zLmVycm9ycztcbiAgICB9XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBpZiAoIWNhY2hlZENvbXBpbGVySG9zdCkge1xuICAgICAgY2FjaGVkQ29tcGlsZXJIb3N0ID0gaG9zdC5jcmVhdGVDb21waWxlckhvc3QoY2FjaGVkT3B0aW9ucy5vcHRpb25zKTtcbiAgICAgIGNvbnN0IG9yaWdpbmFsV3JpdGVGaWxlQ2FsbGJhY2sgPSBjYWNoZWRDb21waWxlckhvc3Qud3JpdGVGaWxlO1xuICAgICAgY2FjaGVkQ29tcGlsZXJIb3N0LndyaXRlRmlsZSA9IGZ1bmN0aW9uKFxuICAgICAgICAgIGZpbGVOYW1lOiBzdHJpbmcsIGRhdGE6IHN0cmluZywgd3JpdGVCeXRlT3JkZXJNYXJrOiBib29sZWFuLFxuICAgICAgICAgIG9uRXJyb3I/OiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkLCBzb3VyY2VGaWxlczogUmVhZG9ubHlBcnJheTx0cy5Tb3VyY2VGaWxlPiA9IFtdKSB7XG4gICAgICAgIGluZ29yZUZpbGVzRm9yV2F0Y2guYWRkKHBhdGgubm9ybWFsaXplKGZpbGVOYW1lKSk7XG4gICAgICAgIHJldHVybiBvcmlnaW5hbFdyaXRlRmlsZUNhbGxiYWNrKGZpbGVOYW1lLCBkYXRhLCB3cml0ZUJ5dGVPcmRlck1hcmssIG9uRXJyb3IsIHNvdXJjZUZpbGVzKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBvcmlnaW5hbEZpbGVFeGlzdHMgPSBjYWNoZWRDb21waWxlckhvc3QuZmlsZUV4aXN0cztcbiAgICAgIGNhY2hlZENvbXBpbGVySG9zdC5maWxlRXhpc3RzID0gZnVuY3Rpb24oZmlsZU5hbWU6IHN0cmluZykge1xuICAgICAgICBjb25zdCBjZSA9IGNhY2hlRW50cnkoZmlsZU5hbWUpO1xuICAgICAgICBpZiAoY2UuZXhpc3RzID09IG51bGwpIHtcbiAgICAgICAgICBjZS5leGlzdHMgPSBvcmlnaW5hbEZpbGVFeGlzdHMuY2FsbCh0aGlzLCBmaWxlTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNlLmV4aXN0cyAhO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IG9yaWdpbmFsR2V0U291cmNlRmlsZSA9IGNhY2hlZENvbXBpbGVySG9zdC5nZXRTb3VyY2VGaWxlO1xuICAgICAgY2FjaGVkQ29tcGlsZXJIb3N0LmdldFNvdXJjZUZpbGUgPSBmdW5jdGlvbihcbiAgICAgICAgICBmaWxlTmFtZTogc3RyaW5nLCBsYW5ndWFnZVZlcnNpb246IHRzLlNjcmlwdFRhcmdldCkge1xuICAgICAgICBjb25zdCBjZSA9IGNhY2hlRW50cnkoZmlsZU5hbWUpO1xuICAgICAgICBpZiAoIWNlLnNmKSB7XG4gICAgICAgICAgY2Uuc2YgPSBvcmlnaW5hbEdldFNvdXJjZUZpbGUuY2FsbCh0aGlzLCBmaWxlTmFtZSwgbGFuZ3VhZ2VWZXJzaW9uKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2Uuc2YgITtcbiAgICAgIH07XG4gICAgICBjb25zdCBvcmlnaW5hbFJlYWRGaWxlID0gY2FjaGVkQ29tcGlsZXJIb3N0LnJlYWRGaWxlO1xuICAgICAgY2FjaGVkQ29tcGlsZXJIb3N0LnJlYWRGaWxlID0gZnVuY3Rpb24oZmlsZU5hbWU6IHN0cmluZykge1xuICAgICAgICBjb25zdCBjZSA9IGNhY2hlRW50cnkoZmlsZU5hbWUpO1xuICAgICAgICBpZiAoY2UuY29udGVudCA9PSBudWxsKSB7XG4gICAgICAgICAgY2UuY29udGVudCA9IG9yaWdpbmFsUmVhZEZpbGUuY2FsbCh0aGlzLCBmaWxlTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNlLmNvbnRlbnQgITtcbiAgICAgIH07XG4gICAgfVxuICAgIGluZ29yZUZpbGVzRm9yV2F0Y2guY2xlYXIoKTtcbiAgICBjb25zdCBvbGRQcm9ncmFtID0gY2FjaGVkUHJvZ3JhbTtcbiAgICAvLyBXZSBjbGVhciBvdXQgdGhlIGBjYWNoZWRQcm9ncmFtYCBoZXJlIGFzIGFcbiAgICAvLyBwcm9ncmFtIGNhbiBvbmx5IGJlIHVzZWQgYXMgYG9sZFByb2dyYW1gIDF4XG4gICAgY2FjaGVkUHJvZ3JhbSA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBjb21waWxlUmVzdWx0ID0gcGVyZm9ybUNvbXBpbGF0aW9uKHtcbiAgICAgIHJvb3ROYW1lczogY2FjaGVkT3B0aW9ucy5yb290TmFtZXMsXG4gICAgICBvcHRpb25zOiBjYWNoZWRPcHRpb25zLm9wdGlvbnMsXG4gICAgICBob3N0OiBjYWNoZWRDb21waWxlckhvc3QsXG4gICAgICBvbGRQcm9ncmFtOiBjYWNoZWRQcm9ncmFtLFxuICAgICAgZW1pdENhbGxiYWNrOiBob3N0LmNyZWF0ZUVtaXRDYWxsYmFjayhjYWNoZWRPcHRpb25zLm9wdGlvbnMpXG4gICAgfSk7XG5cbiAgICBpZiAoY29tcGlsZVJlc3VsdC5kaWFnbm9zdGljcy5sZW5ndGgpIHtcbiAgICAgIGhvc3QucmVwb3J0RGlhZ25vc3RpY3MoY29tcGlsZVJlc3VsdC5kaWFnbm9zdGljcyk7XG4gICAgfVxuXG4gICAgY29uc3QgZW5kVGltZSA9IERhdGUubm93KCk7XG4gICAgaWYgKGNhY2hlZE9wdGlvbnMub3B0aW9ucy5kaWFnbm9zdGljcykge1xuICAgICAgY29uc3QgdG90YWxUaW1lID0gKGVuZFRpbWUgLSBzdGFydFRpbWUpIC8gMTAwMDtcbiAgICAgIGhvc3QucmVwb3J0RGlhZ25vc3RpY3MoW3RvdGFsQ29tcGlsYXRpb25UaW1lRGlhZ25vc3RpYyhlbmRUaW1lIC0gc3RhcnRUaW1lKV0pO1xuICAgIH1cbiAgICBjb25zdCBleGl0Q29kZSA9IGV4aXRDb2RlRnJvbVJlc3VsdChjb21waWxlUmVzdWx0LmRpYWdub3N0aWNzKTtcbiAgICBpZiAoZXhpdENvZGUgPT0gMCkge1xuICAgICAgY2FjaGVkUHJvZ3JhbSA9IGNvbXBpbGVSZXN1bHQucHJvZ3JhbTtcbiAgICAgIGhvc3QucmVwb3J0RGlhZ25vc3RpY3MoXG4gICAgICAgICAgW2NyZWF0ZU1lc3NhZ2VEaWFnbm9zdGljKCdDb21waWxhdGlvbiBjb21wbGV0ZS4gV2F0Y2hpbmcgZm9yIGZpbGUgY2hhbmdlcy4nKV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBob3N0LnJlcG9ydERpYWdub3N0aWNzKFxuICAgICAgICAgIFtjcmVhdGVNZXNzYWdlRGlhZ25vc3RpYygnQ29tcGlsYXRpb24gZmFpbGVkLiBXYXRjaGluZyBmb3IgZmlsZSBjaGFuZ2VzLicpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbXBpbGVSZXN1bHQuZGlhZ25vc3RpY3M7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldE9wdGlvbnMoKSB7XG4gICAgY2FjaGVkUHJvZ3JhbSA9IHVuZGVmaW5lZDtcbiAgICBjYWNoZWRDb21waWxlckhvc3QgPSB1bmRlZmluZWQ7XG4gICAgY2FjaGVkT3B0aW9ucyA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdhdGNoZWRGaWxlQ2hhbmdlZChldmVudDogRmlsZUNoYW5nZUV2ZW50LCBmaWxlTmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKGNhY2hlZE9wdGlvbnMgJiYgZXZlbnQgPT09IEZpbGVDaGFuZ2VFdmVudC5DaGFuZ2UgJiZcbiAgICAgICAgLy8gVE9ETyhjaHVja2opOiB2YWxpZGF0ZSB0aGF0IHRoaXMgaXMgc3VmZmljaWVudCB0byBza2lwIGZpbGVzIHRoYXQgd2VyZSB3cml0dGVuLlxuICAgICAgICAvLyBUaGlzIGFzc3VtZXMgdGhhdCB0aGUgZmlsZSBwYXRoIHdlIHdyaXRlIGlzIHRoZSBzYW1lIGZpbGUgcGF0aCB3ZSB3aWxsIHJlY2VpdmUgaW4gdGhlXG4gICAgICAgIC8vIGNoYW5nZSBub3RpZmljYXRpb24uXG4gICAgICAgIHBhdGgubm9ybWFsaXplKGZpbGVOYW1lKSA9PT0gcGF0aC5ub3JtYWxpemUoY2FjaGVkT3B0aW9ucy5wcm9qZWN0KSkge1xuICAgICAgLy8gSWYgdGhlIGNvbmZpZ3VyYXRpb24gZmlsZSBjaGFuZ2VzLCBmb3JnZXQgZXZlcnl0aGluZyBhbmQgc3RhcnQgdGhlIHJlY29tcGlsYXRpb24gdGltZXJcbiAgICAgIHJlc2V0T3B0aW9ucygpO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGV2ZW50ID09PSBGaWxlQ2hhbmdlRXZlbnQuQ3JlYXRlRGVsZXRlIHx8IGV2ZW50ID09PSBGaWxlQ2hhbmdlRXZlbnQuQ3JlYXRlRGVsZXRlRGlyKSB7XG4gICAgICAvLyBJZiBhIGZpbGUgd2FzIGFkZGVkIG9yIHJlbW92ZWQsIHJlcmVhZCB0aGUgY29uZmlndXJhdGlvblxuICAgICAgLy8gdG8gZGV0ZXJtaW5lIHRoZSBuZXcgbGlzdCBvZiByb290IGZpbGVzLlxuICAgICAgY2FjaGVkT3B0aW9ucyA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoZXZlbnQgPT09IEZpbGVDaGFuZ2VFdmVudC5DcmVhdGVEZWxldGVEaXIpIHtcbiAgICAgIGZpbGVDYWNoZS5jbGVhcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaWxlQ2FjaGUuZGVsZXRlKHBhdGgubm9ybWFsaXplKGZpbGVOYW1lKSk7XG4gICAgfVxuXG4gICAgaWYgKCFpbmdvcmVGaWxlc0ZvcldhdGNoLmhhcyhwYXRoLm5vcm1hbGl6ZShmaWxlTmFtZSkpKSB7XG4gICAgICAvLyBJZ25vcmUgdGhlIGZpbGUgaWYgdGhlIGZpbGUgaXMgb25lIHRoYXQgd2FzIHdyaXR0ZW4gYnkgdGhlIGNvbXBpbGVyLlxuICAgICAgc3RhcnRUaW1lckZvclJlY29tcGlsYXRpb24oKTtcbiAgICB9XG4gIH1cblxuICAvLyBVcG9uIGRldGVjdGluZyBhIGZpbGUgY2hhbmdlLCB3YWl0IGZvciAyNTBtcyBhbmQgdGhlbiBwZXJmb3JtIGEgcmVjb21waWxhdGlvbi4gVGhpcyBnaXZlcyBiYXRjaFxuICAvLyBvcGVyYXRpb25zIChzdWNoIGFzIHNhdmluZyBhbGwgbW9kaWZpZWQgZmlsZXMgaW4gYW4gZWRpdG9yKSBhIGNoYW5jZSB0byBjb21wbGV0ZSBiZWZvcmUgd2Uga2lja1xuICAvLyBvZmYgYSBuZXcgY29tcGlsYXRpb24uXG4gIGZ1bmN0aW9uIHN0YXJ0VGltZXJGb3JSZWNvbXBpbGF0aW9uKCkge1xuICAgIGlmICh0aW1lckhhbmRsZUZvclJlY29tcGlsYXRpb24pIHtcbiAgICAgIGhvc3QuY2xlYXJUaW1lb3V0KHRpbWVySGFuZGxlRm9yUmVjb21waWxhdGlvbik7XG4gICAgfVxuICAgIHRpbWVySGFuZGxlRm9yUmVjb21waWxhdGlvbiA9IGhvc3Quc2V0VGltZW91dChyZWNvbXBpbGUsIDI1MCk7XG4gIH1cblxuICBmdW5jdGlvbiByZWNvbXBpbGUoKSB7XG4gICAgdGltZXJIYW5kbGVGb3JSZWNvbXBpbGF0aW9uID0gdW5kZWZpbmVkO1xuICAgIGhvc3QucmVwb3J0RGlhZ25vc3RpY3MoXG4gICAgICAgIFtjcmVhdGVNZXNzYWdlRGlhZ25vc3RpYygnRmlsZSBjaGFuZ2UgZGV0ZWN0ZWQuIFN0YXJ0aW5nIGluY3JlbWVudGFsIGNvbXBpbGF0aW9uLicpXSk7XG4gICAgZG9Db21waWxhdGlvbigpO1xuICB9XG59XG4iXX0=