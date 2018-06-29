#!/usr/bin/env node
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
        define("tsickle/src/main", ["require", "exports", "fs", "minimist", "mkdirp", "path", "tsickle/src/typescript", "tsickle/src/cli_support", "tsickle/src/tsickle", "tsickle/src/tsickle", "tsickle/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs = require("fs");
    var minimist = require("minimist");
    var mkdirp = require("mkdirp");
    var path = require("path");
    var ts = require("tsickle/src/typescript");
    var cliSupport = require("tsickle/src/cli_support");
    var tsickle = require("tsickle/src/tsickle");
    var tsickle_1 = require("tsickle/src/tsickle");
    var util_1 = require("tsickle/src/util");
    function usage() {
        console.error("usage: tsickle [tsickle options] -- [tsc options]\n\nexample:\n  tsickle --externs=foo/externs.js -- -p src --noImplicitAny\n\ntsickle flags are:\n  --externs=PATH        save generated Closure externs.js to PATH\n  --typed               [experimental] attempt to provide Closure types instead of {?}\n  --disableAutoQuoting  do not automatically apply quotes to property accesses\n");
    }
    /**
     * Parses the command-line arguments, extracting the tsickle settings and
     * the arguments to pass on to tsc.
     */
    function loadSettingsFromArgs(args) {
        var settings = {};
        var parsedArgs = minimist(args);
        try {
            for (var _a = __values(Object.keys(parsedArgs)), _b = _a.next(); !_b.done; _b = _a.next()) {
                var flag = _b.value;
                switch (flag) {
                    case 'h':
                    case 'help':
                        usage();
                        process.exit(0);
                        break;
                    case 'externs':
                        settings.externsPath = parsedArgs[flag];
                        break;
                    case 'typed':
                        settings.isTyped = true;
                        break;
                    case 'verbose':
                        settings.verbose = true;
                        break;
                    case 'disableAutoQuoting':
                        settings.disableAutoQuoting = true;
                        break;
                    case '_':
                        // This is part of the minimist API, and holds args after the '--'.
                        break;
                    default:
                        console.error("unknown flag '--" + flag + "'");
                        usage();
                        process.exit(1);
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
        // Arguments after the '--' arg are arguments to tsc.
        var tscArgs = parsedArgs['_'];
        return { settings: settings, tscArgs: tscArgs };
        var e_1, _c;
    }
    /**
     * Loads the tsconfig.json from a directory.
     *
     * TODO(martinprobst): use ts.findConfigFile to match tsc behaviour.
     *
     * @param args tsc command-line arguments.
     */
    function loadTscConfig(args) {
        // Gather tsc options/input files from command line.
        var _a = ts.parseCommandLine(args), options = _a.options, fileNames = _a.fileNames, errors = _a.errors;
        if (errors.length > 0) {
            return { options: {}, fileNames: [], errors: errors };
        }
        // Store file arguments
        var tsFileArguments = fileNames;
        // Read further settings from tsconfig.json.
        var projectDir = options.project || '.';
        var configFileName = path.join(projectDir, 'tsconfig.json');
        var _b = ts.readConfigFile(configFileName, function (path) { return fs.readFileSync(path, 'utf-8'); }), json = _b.config, error = _b.error;
        if (error) {
            return { options: {}, fileNames: [], errors: [error] };
        }
        (_c = ts.parseJsonConfigFileContent(json, ts.sys, projectDir, options, configFileName), options = _c.options, fileNames = _c.fileNames, errors = _c.errors);
        if (errors.length > 0) {
            return { options: {}, fileNames: [], errors: errors };
        }
        // if file arguments were given to the typescript transpiler then transpile only those files
        fileNames = tsFileArguments.length > 0 ? tsFileArguments : fileNames;
        return { options: options, fileNames: fileNames, errors: [] };
        var _c;
    }
    /**
     * Compiles TypeScript code into Closure-compiler-ready JS.
     */
    function toClosureJS(options, fileNames, settings, writeFile) {
        // Use absolute paths to determine what files to process since files may be imported using
        // relative or absolute paths
        var absoluteFileNames = fileNames.map(function (i) { return path.resolve(i); });
        var compilerHost = ts.createCompilerHost(options);
        var program = ts.createProgram(fileNames, options, compilerHost);
        var filesToProcess = new Set(absoluteFileNames);
        var rootModulePath = options.rootDir || util_1.getCommonParentDirectory(absoluteFileNames);
        var transformerHost = {
            shouldSkipTsickleProcessing: function (fileName) {
                return !filesToProcess.has(path.resolve(fileName));
            },
            shouldIgnoreWarningsForPath: function (fileName) { return false; },
            pathToModuleName: cliSupport.pathToModuleName.bind(null, rootModulePath),
            fileNameToModuleId: function (fileName) { return path.relative(rootModulePath, fileName); },
            es5Mode: true,
            googmodule: true,
            transformDecorators: true,
            transformTypesToClosure: true,
            typeBlackListPaths: new Set(),
            disableAutoQuoting: settings.disableAutoQuoting,
            untyped: false,
            logWarning: function (warning) { return console.error(tsickle.formatDiagnostics([warning])); },
            options: options,
            host: compilerHost,
        };
        var diagnostics = ts.getPreEmitDiagnostics(program);
        if (diagnostics.length > 0) {
            return {
                diagnostics: diagnostics,
                modulesManifest: new tsickle_1.ModulesManifest(),
                externs: {},
                emitSkipped: true,
                emittedFiles: [],
            };
        }
        return tsickle.emitWithTsickle(program, transformerHost, compilerHost, options, undefined, writeFile);
    }
    exports.toClosureJS = toClosureJS;
    function main(args) {
        var _a = loadSettingsFromArgs(args), settings = _a.settings, tscArgs = _a.tscArgs;
        var config = loadTscConfig(tscArgs);
        if (config.errors.length) {
            console.error(tsickle.formatDiagnostics(config.errors));
            return 1;
        }
        if (config.options.module !== ts.ModuleKind.CommonJS) {
            // This is not an upstream TypeScript diagnostic, therefore it does not go
            // through the diagnostics array mechanism.
            console.error('tsickle converts TypeScript modules to Closure modules via CommonJS internally. ' +
                'Set tsconfig.js "module": "commonjs"');
            return 1;
        }
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var result = toClosureJS(config.options, config.fileNames, settings, function (filePath, contents) {
            mkdirp.sync(path.dirname(filePath));
            fs.writeFileSync(filePath, contents, { encoding: 'utf-8' });
        });
        if (result.diagnostics.length) {
            console.error(tsickle.formatDiagnostics(result.diagnostics));
            return 1;
        }
        if (settings.externsPath) {
            mkdirp.sync(path.dirname(settings.externsPath));
            fs.writeFileSync(settings.externsPath, tsickle.getGeneratedExterns(result.externs));
        }
        return 0;
    }
    // CLI entry point
    if (require.main === module) {
        process.exit(main(process.argv.splice(2)));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFVQSx1QkFBeUI7SUFDekIsbUNBQXFDO0lBQ3JDLCtCQUFpQztJQUNqQywyQkFBNkI7SUFDN0IsMkNBQW1DO0lBRW5DLG9EQUE0QztJQUM1Qyw2Q0FBcUM7SUFDckMsK0NBQTBDO0lBQzFDLHlDQUFnRDtJQWlCaEQ7UUFDRSxPQUFPLENBQUMsS0FBSyxDQUFDLGdZQVNmLENBQUMsQ0FBQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCw4QkFBOEIsSUFBYztRQUMxQyxJQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7UUFDOUIsSUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOztZQUNsQyxLQUFtQixJQUFBLEtBQUEsU0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBLGdCQUFBO2dCQUFyQyxJQUFNLElBQUksV0FBQTtnQkFDYixRQUFRLElBQUksRUFBRTtvQkFDWixLQUFLLEdBQUcsQ0FBQztvQkFDVCxLQUFLLE1BQU07d0JBQ1QsS0FBSyxFQUFFLENBQUM7d0JBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDaEIsTUFBTTtvQkFDUixLQUFLLFNBQVM7d0JBQ1osUUFBUSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3hDLE1BQU07b0JBQ1IsS0FBSyxPQUFPO3dCQUNWLFFBQVEsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO3dCQUN4QixNQUFNO29CQUNSLEtBQUssU0FBUzt3QkFDWixRQUFRLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzt3QkFDeEIsTUFBTTtvQkFDUixLQUFLLG9CQUFvQjt3QkFDdkIsUUFBUSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQzt3QkFD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O1NBQ1Y7UUFFRCxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUU7WUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2hELEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDckY7UUFDRCxPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxrQkFBa0I7SUFDbEIsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtRQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDNUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgbWluaW1pc3QgZnJvbSAnbWluaW1pc3QnO1xuaW1wb3J0ICogYXMgbWtkaXJwIGZyb20gJ21rZGlycCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcblxuaW1wb3J0ICogYXMgY2xpU3VwcG9ydCBmcm9tICcuL2NsaV9zdXBwb3J0JztcbmltcG9ydCAqIGFzIHRzaWNrbGUgZnJvbSAnLi90c2lja2xlJztcbmltcG9ydCB7TW9kdWxlc01hbmlmZXN0fSBmcm9tICcuL3RzaWNrbGUnO1xuaW1wb3J0IHtnZXRDb21tb25QYXJlbnREaXJlY3Rvcnl9IGZyb20gJy4vdXRpbCc7XG5cbi8qKiBUc2lja2xlIHNldHRpbmdzIHBhc3NlZCBvbiB0aGUgY29tbWFuZCBsaW5lLiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXR0aW5ncyB7XG4gIC8qKiBJZiBwcm92aWRlZCwgZG8gbm90IG1vZGlmeSBxdW90aW5nIG9mIHByb3BlcnR5IGFjY2Vzc2VzLiAqL1xuICBkaXNhYmxlQXV0b1F1b3Rpbmc/OiBib29sZWFuO1xuXG4gIC8qKiBJZiBwcm92aWRlZCwgcGF0aCB0byBzYXZlIGV4dGVybnMgdG8uICovXG4gIGV4dGVybnNQYXRoPzogc3RyaW5nO1xuXG4gIC8qKiBJZiBwcm92aWRlZCwgYXR0ZW1wdCB0byBwcm92aWRlIHR5cGVzIHJhdGhlciB0aGFuIHs/fS4gKi9cbiAgaXNUeXBlZD86IGJvb2xlYW47XG5cbiAgLyoqIElmIHRydWUsIGxvZyBpbnRlcm5hbCBkZWJ1ZyB3YXJuaW5ncyB0byB0aGUgY29uc29sZS4gKi9cbiAgdmVyYm9zZT86IGJvb2xlYW47XG59XG5cbmZ1bmN0aW9uIHVzYWdlKCkge1xuICBjb25zb2xlLmVycm9yKGB1c2FnZTogdHNpY2tsZSBbdHNpY2tsZSBvcHRpb25zXSAtLSBbdHNjIG9wdGlvbnNdXG5cbmV4YW1wbGU6XG4gIHRzaWNrbGUgLS1leHRlcm5zPWZvby9leHRlcm5zLmpzIC0tIC1wIHNyYyAtLW5vSW1wbGljaXRBbnlcblxudHNpY2tsZSBmbGFncyBhcmU6XG4gIC0tZXh0ZXJucz1QQVRIICAgICAgICBzYXZlIGdlbmVyYXRlZCBDbG9zdXJlIGV4dGVybnMuanMgdG8gUEFUSFxuICAtLXR5cGVkICAgICAgICAgICAgICAgW2V4cGVyaW1lbnRhbF0gYXR0ZW1wdCB0byBwcm92aWRlIENsb3N1cmUgdHlwZXMgaW5zdGVhZCBvZiB7P31cbiAgLS1kaXNhYmxlQXV0b1F1b3RpbmcgIGRvIG5vdCBhdXRvbWF0aWNhbGx5IGFwcGx5IHF1b3RlcyB0byBwcm9wZXJ0eSBhY2Nlc3Nlc1xuYCk7XG59XG5cbi8qKlxuICogUGFyc2VzIHRoZSBjb21tYW5kLWxpbmUgYXJndW1lbnRzLCBleHRyYWN0aW5nIHRoZSB0c2lja2xlIHNldHRpbmdzIGFuZFxuICogdGhlIGFyZ3VtZW50cyB0byBwYXNzIG9uIHRvIHRzYy5cbiAqL1xuZnVuY3Rpb24gbG9hZFNldHRpbmdzRnJvbUFyZ3MoYXJnczogc3RyaW5nW10pOiB7c2V0dGluZ3M6IFNldHRpbmdzLCB0c2NBcmdzOiBzdHJpbmdbXX0ge1xuICBjb25zdCBzZXR0aW5nczogU2V0dGluZ3MgPSB7fTtcbiAgY29uc3QgcGFyc2VkQXJncyA9IG1pbmltaXN0KGFyZ3MpO1xuICBmb3IgKGNvbnN0IGZsYWcgb2YgT2JqZWN0LmtleXMocGFyc2VkQXJncykpIHtcbiAgICBzd2l0Y2ggKGZsYWcpIHtcbiAgICAgIGNhc2UgJ2gnOlxuICAgICAgY2FzZSAnaGVscCc6XG4gICAgICAgIHVzYWdlKCk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdleHRlcm5zJzpcbiAgICAgICAgc2V0dGluZ3MuZXh0ZXJuc1BhdGggPSBwYXJzZWRBcmdzW2ZsYWddO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3R5cGVkJzpcbiAgICAgICAgc2V0dGluZ3MuaXNUeXBlZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndmVyYm9zZSc6XG4gICAgICAgIHNldHRpbmdzLnZlcmJvc2UgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Rpc2FibGVBdXRvUXVvdGluZyc6XG4gICAgICAgIHNldHRpbmdzLmRpc2FibGVBdXRvUXVvdGluZyA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnXyc6XG4gICAgICAgIC8vIFRoaXMgaXMgcGFydCBvZiB0aGUgbWluaW1pc3QgQVBJLCBhbmQgaG9sZHMgYXJncyBhZnRlciB0aGUgJy0tJy5cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zb2xlLmVycm9yKGB1bmtub3duIGZsYWcgJy0tJHtmbGFnfSdgKTtcbiAgICAgICAgdXNhZ2UoKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgfVxuICAvLyBBcmd1bWVudHMgYWZ0ZXIgdGhlICctLScgYXJnIGFyZSBhcmd1bWVudHMgdG8gdHNjLlxuICBjb25zdCB0c2NBcmdzID0gcGFyc2VkQXJnc1snXyddO1xuICByZXR1cm4ge3NldHRpbmdzLCB0c2NBcmdzfTtcbn1cblxuLyoqXG4gKiBMb2FkcyB0aGUgdHNjb25maWcuanNvbiBmcm9tIGEgZGlyZWN0b3J5LlxuICpcbiAqIFRPRE8obWFydGlucHJvYnN0KTogdXNlIHRzLmZpbmRDb25maWdGaWxlIHRvIG1hdGNoIHRzYyBiZWhhdmlvdXIuXG4gKlxuICogQHBhcmFtIGFyZ3MgdHNjIGNvbW1hbmQtbGluZSBhcmd1bWVudHMuXG4gKi9cbmZ1bmN0aW9uIGxvYWRUc2NDb25maWcoYXJnczogc3RyaW5nW10pOlxuICAgIHtvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMsIGZpbGVOYW1lczogc3RyaW5nW10sIGVycm9yczogdHMuRGlhZ25vc3RpY1tdfSB7XG4gIC8vIEdhdGhlciB0c2Mgb3B0aW9ucy9pbnB1dCBmaWxlcyBmcm9tIGNvbW1hbmQgbGluZS5cbiAgbGV0IHtvcHRpb25zLCBmaWxlTmFtZXMsIGVycm9yc30gPSB0cy5wYXJzZUNvbW1hbmRMaW5lKGFyZ3MpO1xuICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4ge29wdGlvbnM6IHt9LCBmaWxlTmFtZXM6IFtdLCBlcnJvcnN9O1xuICB9XG5cbiAgLy8gU3RvcmUgZmlsZSBhcmd1bWVudHNcbiAgY29uc3QgdHNGaWxlQXJndW1lbnRzID0gZmlsZU5hbWVzO1xuXG4gIC8vIFJlYWQgZnVydGhlciBzZXR0aW5ncyBmcm9tIHRzY29uZmlnLmpzb24uXG4gIGNvbnN0IHByb2plY3REaXIgPSBvcHRpb25zLnByb2plY3QgfHwgJy4nO1xuICBjb25zdCBjb25maWdGaWxlTmFtZSA9IHBhdGguam9pbihwcm9qZWN0RGlyLCAndHNjb25maWcuanNvbicpO1xuICBjb25zdCB7Y29uZmlnOiBqc29uLCBlcnJvcn0gPVxuICAgICAgdHMucmVhZENvbmZpZ0ZpbGUoY29uZmlnRmlsZU5hbWUsIHBhdGggPT4gZnMucmVhZEZpbGVTeW5jKHBhdGgsICd1dGYtOCcpKTtcbiAgaWYgKGVycm9yKSB7XG4gICAgcmV0dXJuIHtvcHRpb25zOiB7fSwgZmlsZU5hbWVzOiBbXSwgZXJyb3JzOiBbZXJyb3JdfTtcbiAgfVxuICAoe29wdGlvbnMsIGZpbGVOYW1lcywgZXJyb3JzfSA9XG4gICAgICAgdHMucGFyc2VKc29uQ29uZmlnRmlsZUNvbnRlbnQoanNvbiwgdHMuc3lzLCBwcm9qZWN0RGlyLCBvcHRpb25zLCBjb25maWdGaWxlTmFtZSkpO1xuICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4ge29wdGlvbnM6IHt9LCBmaWxlTmFtZXM6IFtdLCBlcnJvcnN9O1xuICB9XG5cbiAgLy8gaWYgZmlsZSBhcmd1bWVudHMgd2VyZSBnaXZlbiB0byB0aGUgdHlwZXNjcmlwdCB0cmFuc3BpbGVyIHRoZW4gdHJhbnNwaWxlIG9ubHkgdGhvc2UgZmlsZXNcbiAgZmlsZU5hbWVzID0gdHNGaWxlQXJndW1lbnRzLmxlbmd0aCA+IDAgPyB0c0ZpbGVBcmd1bWVudHMgOiBmaWxlTmFtZXM7XG5cbiAgcmV0dXJuIHtvcHRpb25zLCBmaWxlTmFtZXMsIGVycm9yczogW119O1xufVxuXG4vKipcbiAqIENvbXBpbGVzIFR5cGVTY3JpcHQgY29kZSBpbnRvIENsb3N1cmUtY29tcGlsZXItcmVhZHkgSlMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0Nsb3N1cmVKUyhcbiAgICBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMsIGZpbGVOYW1lczogc3RyaW5nW10sIHNldHRpbmdzOiBTZXR0aW5ncyxcbiAgICB3cml0ZUZpbGU/OiB0cy5Xcml0ZUZpbGVDYWxsYmFjayk6IHRzaWNrbGUuRW1pdFJlc3VsdCB7XG4gIC8vIFVzZSBhYnNvbHV0ZSBwYXRocyB0byBkZXRlcm1pbmUgd2hhdCBmaWxlcyB0byBwcm9jZXNzIHNpbmNlIGZpbGVzIG1heSBiZSBpbXBvcnRlZCB1c2luZ1xuICAvLyByZWxhdGl2ZSBvciBhYnNvbHV0ZSBwYXRoc1xuICBjb25zdCBhYnNvbHV0ZUZpbGVOYW1lcyA9IGZpbGVOYW1lcy5tYXAoaSA9PiBwYXRoLnJlc29sdmUoaSkpO1xuXG4gIGNvbnN0IGNvbXBpbGVySG9zdCA9IHRzLmNyZWF0ZUNvbXBpbGVySG9zdChvcHRpb25zKTtcbiAgY29uc3QgcHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0oZmlsZU5hbWVzLCBvcHRpb25zLCBjb21waWxlckhvc3QpO1xuICBjb25zdCBmaWxlc1RvUHJvY2VzcyA9IG5ldyBTZXQoYWJzb2x1dGVGaWxlTmFtZXMpO1xuICBjb25zdCByb290TW9kdWxlUGF0aCA9IG9wdGlvbnMucm9vdERpciB8fCBnZXRDb21tb25QYXJlbnREaXJlY3RvcnkoYWJzb2x1dGVGaWxlTmFtZXMpO1xuICBjb25zdCB0cmFuc2Zvcm1lckhvc3Q6IHRzaWNrbGUuVHNpY2tsZUhvc3QgPSB7XG4gICAgc2hvdWxkU2tpcFRzaWNrbGVQcm9jZXNzaW5nOiAoZmlsZU5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgcmV0dXJuICFmaWxlc1RvUHJvY2Vzcy5oYXMocGF0aC5yZXNvbHZlKGZpbGVOYW1lKSk7XG4gICAgfSxcbiAgICBzaG91bGRJZ25vcmVXYXJuaW5nc0ZvclBhdGg6IChmaWxlTmFtZTogc3RyaW5nKSA9PiBmYWxzZSxcbiAgICBwYXRoVG9Nb2R1bGVOYW1lOiBjbGlTdXBwb3J0LnBhdGhUb01vZHVsZU5hbWUuYmluZChudWxsLCByb290TW9kdWxlUGF0aCksXG4gICAgZmlsZU5hbWVUb01vZHVsZUlkOiAoZmlsZU5hbWUpID0+IHBhdGgucmVsYXRpdmUocm9vdE1vZHVsZVBhdGgsIGZpbGVOYW1lKSxcbiAgICBlczVNb2RlOiB0cnVlLFxuICAgIGdvb2dtb2R1bGU6IHRydWUsXG4gICAgdHJhbnNmb3JtRGVjb3JhdG9yczogdHJ1ZSxcbiAgICB0cmFuc2Zvcm1UeXBlc1RvQ2xvc3VyZTogdHJ1ZSxcbiAgICB0eXBlQmxhY2tMaXN0UGF0aHM6IG5ldyBTZXQoKSxcbiAgICBkaXNhYmxlQXV0b1F1b3Rpbmc6IHNldHRpbmdzLmRpc2FibGVBdXRvUXVvdGluZyxcbiAgICB1bnR5cGVkOiBmYWxzZSxcbiAgICBsb2dXYXJuaW5nOiAod2FybmluZykgPT4gY29uc29sZS5lcnJvcih0c2lja2xlLmZvcm1hdERpYWdub3N0aWNzKFt3YXJuaW5nXSkpLFxuICAgIG9wdGlvbnMsXG4gICAgaG9zdDogY29tcGlsZXJIb3N0LFxuICB9O1xuICBjb25zdCBkaWFnbm9zdGljcyA9IHRzLmdldFByZUVtaXREaWFnbm9zdGljcyhwcm9ncmFtKTtcbiAgaWYgKGRpYWdub3N0aWNzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGlhZ25vc3RpY3MsXG4gICAgICBtb2R1bGVzTWFuaWZlc3Q6IG5ldyBNb2R1bGVzTWFuaWZlc3QoKSxcbiAgICAgIGV4dGVybnM6IHt9LFxuICAgICAgZW1pdFNraXBwZWQ6IHRydWUsXG4gICAgICBlbWl0dGVkRmlsZXM6IFtdLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHRzaWNrbGUuZW1pdFdpdGhUc2lja2xlKFxuICAgICAgcHJvZ3JhbSwgdHJhbnNmb3JtZXJIb3N0LCBjb21waWxlckhvc3QsIG9wdGlvbnMsIHVuZGVmaW5lZCwgd3JpdGVGaWxlKTtcbn1cblxuZnVuY3Rpb24gbWFpbihhcmdzOiBzdHJpbmdbXSk6IG51bWJlciB7XG4gIGNvbnN0IHtzZXR0aW5ncywgdHNjQXJnc30gPSBsb2FkU2V0dGluZ3NGcm9tQXJncyhhcmdzKTtcbiAgY29uc3QgY29uZmlnID0gbG9hZFRzY0NvbmZpZyh0c2NBcmdzKTtcbiAgaWYgKGNvbmZpZy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgY29uc29sZS5lcnJvcih0c2lja2xlLmZvcm1hdERpYWdub3N0aWNzKGNvbmZpZy5lcnJvcnMpKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGlmIChjb25maWcub3B0aW9ucy5tb2R1bGUgIT09IHRzLk1vZHVsZUtpbmQuQ29tbW9uSlMpIHtcbiAgICAvLyBUaGlzIGlzIG5vdCBhbiB1cHN0cmVhbSBUeXBlU2NyaXB0IGRpYWdub3N0aWMsIHRoZXJlZm9yZSBpdCBkb2VzIG5vdCBnb1xuICAgIC8vIHRocm91Z2ggdGhlIGRpYWdub3N0aWNzIGFycmF5IG1lY2hhbmlzbS5cbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAndHNpY2tsZSBjb252ZXJ0cyBUeXBlU2NyaXB0IG1vZHVsZXMgdG8gQ2xvc3VyZSBtb2R1bGVzIHZpYSBDb21tb25KUyBpbnRlcm5hbGx5LiAnICtcbiAgICAgICAgJ1NldCB0c2NvbmZpZy5qcyBcIm1vZHVsZVwiOiBcImNvbW1vbmpzXCInKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIC8vIFJ1biB0c2lja2xlK1RTQyB0byBjb252ZXJ0IGlucHV0cyB0byBDbG9zdXJlIEpTIGZpbGVzLlxuICBjb25zdCByZXN1bHQgPSB0b0Nsb3N1cmVKUyhcbiAgICAgIGNvbmZpZy5vcHRpb25zLCBjb25maWcuZmlsZU5hbWVzLCBzZXR0aW5ncywgKGZpbGVQYXRoOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcpID0+IHtcbiAgICAgICAgbWtkaXJwLnN5bmMocGF0aC5kaXJuYW1lKGZpbGVQYXRoKSk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGNvbnRlbnRzLCB7ZW5jb2Rpbmc6ICd1dGYtOCd9KTtcbiAgICAgIH0pO1xuICBpZiAocmVzdWx0LmRpYWdub3N0aWNzLmxlbmd0aCkge1xuICAgIGNvbnNvbGUuZXJyb3IodHNpY2tsZS5mb3JtYXREaWFnbm9zdGljcyhyZXN1bHQuZGlhZ25vc3RpY3MpKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGlmIChzZXR0aW5ncy5leHRlcm5zUGF0aCkge1xuICAgIG1rZGlycC5zeW5jKHBhdGguZGlybmFtZShzZXR0aW5ncy5leHRlcm5zUGF0aCkpO1xuICAgIGZzLndyaXRlRmlsZVN5bmMoc2V0dGluZ3MuZXh0ZXJuc1BhdGgsIHRzaWNrbGUuZ2V0R2VuZXJhdGVkRXh0ZXJucyhyZXN1bHQuZXh0ZXJucykpO1xuICB9XG4gIHJldHVybiAwO1xufVxuXG4vLyBDTEkgZW50cnkgcG9pbnRcbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICBwcm9jZXNzLmV4aXQobWFpbihwcm9jZXNzLmFyZ3Yuc3BsaWNlKDIpKSk7XG59XG4iXX0=