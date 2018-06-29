#!/usr/bin/env node
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/extract_i18n", ["require", "exports", "tslib", "reflect-metadata", "@angular/compiler-cli/src/transformers/api", "@angular/compiler-cli/src/main"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    require("reflect-metadata");
    var api = require("@angular/compiler-cli/src/transformers/api");
    var main_1 = require("@angular/compiler-cli/src/main");
    function mainXi18n(args, consoleError) {
        if (consoleError === void 0) { consoleError = console.error; }
        var config = readXi18nCommandLineAndConfiguration(args);
        return main_1.main(args, consoleError, config);
    }
    exports.mainXi18n = mainXi18n;
    function readXi18nCommandLineAndConfiguration(args) {
        var options = {};
        var parsedArgs = require('minimist')(args);
        if (parsedArgs.outFile)
            options.i18nOutFile = parsedArgs.outFile;
        if (parsedArgs.i18nFormat)
            options.i18nOutFormat = parsedArgs.i18nFormat;
        if (parsedArgs.locale)
            options.i18nOutLocale = parsedArgs.locale;
        var config = main_1.readCommandLineAndConfiguration(args, options, [
            'outFile',
            'i18nFormat',
            'locale',
        ]);
        // only emit the i18nBundle but nothing else.
        return tslib_1.__assign({}, config, { emitFlags: api.EmitFlags.I18nBundle });
    }
    // Entry point
    if (require.main === module) {
        var args = process.argv.slice(2);
        process.exitCode = mainXi18n(args);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0cmFjdF9pMThuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9leHRyYWN0X2kxOG4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQWNBLDRCQUEwQjtJQUMxQixnRUFBMEM7SUFFMUMsdURBQTZEO0lBRTdELG1CQUNJLElBQWMsRUFBRSxZQUFtRDtRQUFuRCw2QkFBQSxFQUFBLGVBQXNDLE9BQU8sQ0FBQyxLQUFLO1FBQ3JFLElBQU0sTUFBTSxHQUFHLG9DQUFvQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFELE1BQU0sQ0FBQyxXQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBSkQsOEJBSUM7SUFFRCw4Q0FBOEMsSUFBYztRQUMxRCxJQUFNLE9BQU8sR0FBd0IsRUFBRSxDQUFDO1FBQ3hDLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDO1lBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQ2pFLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7WUFBQyxPQUFPLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDekUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztZQUFDLE9BQU8sQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUVqRSxJQUFNLE1BQU0sR0FBRyxzQ0FBK0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQzVELFNBQVM7WUFDVCxZQUFZO1lBQ1osUUFBUTtTQUNULENBQUMsQ0FBQztRQUNILDZDQUE2QztRQUM3QyxNQUFNLHNCQUFLLE1BQU0sSUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLElBQUU7SUFDMUQsQ0FBQztJQUVELGNBQWM7SUFDZCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsT0FBTyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuXG4vKipcbiAqIEV4dHJhY3QgaTE4biBtZXNzYWdlcyBmcm9tIHNvdXJjZSBjb2RlXG4gKi9cbi8vIE11c3QgYmUgaW1wb3J0ZWQgZmlyc3QsIGJlY2F1c2UgQW5ndWxhciBkZWNvcmF0b3JzIHRocm93IG9uIGxvYWQuXG5pbXBvcnQgJ3JlZmxlY3QtbWV0YWRhdGEnO1xuaW1wb3J0ICogYXMgYXBpIGZyb20gJy4vdHJhbnNmb3JtZXJzL2FwaSc7XG5pbXBvcnQge1BhcnNlZENvbmZpZ3VyYXRpb259IGZyb20gJy4vcGVyZm9ybV9jb21waWxlJztcbmltcG9ydCB7bWFpbiwgcmVhZENvbW1hbmRMaW5lQW5kQ29uZmlndXJhdGlvbn0gZnJvbSAnLi9tYWluJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1haW5YaTE4bihcbiAgICBhcmdzOiBzdHJpbmdbXSwgY29uc29sZUVycm9yOiAobXNnOiBzdHJpbmcpID0+IHZvaWQgPSBjb25zb2xlLmVycm9yKTogbnVtYmVyIHtcbiAgY29uc3QgY29uZmlnID0gcmVhZFhpMThuQ29tbWFuZExpbmVBbmRDb25maWd1cmF0aW9uKGFyZ3MpO1xuICByZXR1cm4gbWFpbihhcmdzLCBjb25zb2xlRXJyb3IsIGNvbmZpZyk7XG59XG5cbmZ1bmN0aW9uIHJlYWRYaTE4bkNvbW1hbmRMaW5lQW5kQ29uZmlndXJhdGlvbihhcmdzOiBzdHJpbmdbXSk6IFBhcnNlZENvbmZpZ3VyYXRpb24ge1xuICBjb25zdCBvcHRpb25zOiBhcGkuQ29tcGlsZXJPcHRpb25zID0ge307XG4gIGNvbnN0IHBhcnNlZEFyZ3MgPSByZXF1aXJlKCdtaW5pbWlzdCcpKGFyZ3MpO1xuICBpZiAocGFyc2VkQXJncy5vdXRGaWxlKSBvcHRpb25zLmkxOG5PdXRGaWxlID0gcGFyc2VkQXJncy5vdXRGaWxlO1xuICBpZiAocGFyc2VkQXJncy5pMThuRm9ybWF0KSBvcHRpb25zLmkxOG5PdXRGb3JtYXQgPSBwYXJzZWRBcmdzLmkxOG5Gb3JtYXQ7XG4gIGlmIChwYXJzZWRBcmdzLmxvY2FsZSkgb3B0aW9ucy5pMThuT3V0TG9jYWxlID0gcGFyc2VkQXJncy5sb2NhbGU7XG5cbiAgY29uc3QgY29uZmlnID0gcmVhZENvbW1hbmRMaW5lQW5kQ29uZmlndXJhdGlvbihhcmdzLCBvcHRpb25zLCBbXG4gICAgJ291dEZpbGUnLFxuICAgICdpMThuRm9ybWF0JyxcbiAgICAnbG9jYWxlJyxcbiAgXSk7XG4gIC8vIG9ubHkgZW1pdCB0aGUgaTE4bkJ1bmRsZSBidXQgbm90aGluZyBlbHNlLlxuICByZXR1cm4gey4uLmNvbmZpZywgZW1pdEZsYWdzOiBhcGkuRW1pdEZsYWdzLkkxOG5CdW5kbGV9O1xufVxuXG4vLyBFbnRyeSBwb2ludFxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIGNvbnN0IGFyZ3MgPSBwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7XG4gIHByb2Nlc3MuZXhpdENvZGUgPSBtYWluWGkxOG4oYXJncyk7XG59XG4iXX0=