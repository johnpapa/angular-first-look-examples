"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics"); // tslint:disable-line:no-implicit-dependencies
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const node_1 = require("../../tasks/node");
const node_module_engine_host_1 = require("../node-module-engine-host");
const schema_option_transform_1 = require("../schema-option-transform");
class NodeWorkflow {
    constructor(_host, _options) {
        this._host = _host;
        this._options = _options;
        this._reporter = new rxjs_1.Subject();
        this._lifeCycle = new rxjs_1.Subject();
        /**
         * Create the SchematicEngine, which is used by the Schematic library as callbacks to load a
         * Collection or a Schematic.
         */
        this._engineHost = new node_module_engine_host_1.NodeModulesEngineHost();
        this._engine = new schematics_1.SchematicEngine(this._engineHost, this);
        // Add support for schemaJson.
        this._registry = new core_1.schema.CoreSchemaRegistry(schematics_1.formats.standardFormats);
        this._engineHost.registerOptionsTransform(schema_option_transform_1.validateOptionsWithSchema(this._registry));
        this._engineHost.registerTaskExecutor(node_1.BuiltinTaskExecutor.NodePackage, {
            allowPackageManagerOverride: true,
            packageManager: this._options.packageManager,
            rootDirectory: this._options.root,
        });
        this._engineHost.registerTaskExecutor(node_1.BuiltinTaskExecutor.RepositoryInitializer, {
            rootDirectory: this._options.root,
        });
        this._engineHost.registerTaskExecutor(node_1.BuiltinTaskExecutor.RunSchematic);
        this._engineHost.registerTaskExecutor(node_1.BuiltinTaskExecutor.TslintFix);
        this._context = [];
    }
    get context() {
        const maybeContext = this._context[this._context.length - 1];
        if (!maybeContext) {
            throw new Error('Cannot get context when workflow is not executing...');
        }
        return maybeContext;
    }
    get registry() {
        return this._registry;
    }
    get reporter() {
        return this._reporter.asObservable();
    }
    get lifeCycle() {
        return this._lifeCycle.asObservable();
    }
    execute(options) {
        const parentContext = this._context[this._context.length - 1];
        if (!parentContext) {
            this._lifeCycle.next({ kind: 'start' });
        }
        /** Create the collection and the schematic. */
        const collection = this._engine.createCollection(options.collection);
        // Only allow private schematics if called from the same collection.
        const allowPrivate = options.allowPrivate
            || (parentContext && parentContext.collection === options.collection);
        const schematic = collection.createSchematic(options.schematic, allowPrivate);
        // We need two sinks if we want to output what will happen, and actually do the work.
        // Note that fsSink is technically not used if `--dry-run` is passed, but creating the Sink
        // does not have any side effect.
        const dryRunSink = new schematics_1.DryRunSink(this._host, this._options.force);
        const fsSink = new schematics_1.HostSink(this._host, this._options.force);
        let error = false;
        const dryRunSubscriber = dryRunSink.reporter.subscribe(event => {
            this._reporter.next(event);
            error = error || (event.kind == 'error');
        });
        this._lifeCycle.next({ kind: 'workflow-start' });
        const context = Object.assign({}, options, { debug: options.debug || false, logger: options.logger || (parentContext && parentContext.logger) || new core_1.logging.NullLogger(), parentContext });
        this._context.push(context);
        return schematic.call(options.options, rxjs_1.of(new schematics_1.HostTree(this._host)), { logger: context.logger }).pipe(operators_1.map(tree => schematics_1.Tree.optimize(tree)), operators_1.concatMap((tree) => {
            return rxjs_1.concat(dryRunSink.commit(tree).pipe(operators_1.ignoreElements()), rxjs_1.of(tree));
        }), operators_1.concatMap((tree) => {
            dryRunSubscriber.unsubscribe();
            if (error) {
                return rxjs_1.throwError(new schematics_1.UnsuccessfulWorkflowExecution());
            }
            if (this._options.dryRun) {
                return rxjs_1.of();
            }
            return fsSink.commit(tree).pipe(operators_1.defaultIfEmpty(), operators_1.last());
        }), operators_1.concatMap(() => {
            if (this._options.dryRun) {
                return rxjs_1.of();
            }
            this._lifeCycle.next({ kind: 'post-tasks-start' });
            return this._engine.executePostTasks()
                .pipe(operators_1.tap({ complete: () => this._lifeCycle.next({ kind: 'post-tasks-end' }) }), operators_1.defaultIfEmpty(), operators_1.last());
        }), operators_1.tap({ complete: () => {
                this._lifeCycle.next({ kind: 'workflow-end' });
                this._context.pop();
                if (this._context.length == 0) {
                    this._lifeCycle.next({ kind: 'end' });
                }
            } }));
    }
}
exports.NodeWorkflow = NodeWorkflow;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS13b3JrZmxvdy5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvc2NoZW1hdGljcy90b29scy93b3JrZmxvdy9ub2RlLXdvcmtmbG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0NBQXdFO0FBQ3hFLDJEQVNvQyxDQUFFLCtDQUErQztBQUNyRiwrQkFBbUU7QUFDbkUsOENBQTJGO0FBRTNGLDJDQUF1RDtBQUN2RCx3RUFBbUU7QUFDbkUsd0VBQXVFO0FBRXZFO0lBVUUsWUFDWSxLQUFxQixFQUNyQixRQUtUO1FBTlMsVUFBSyxHQUFMLEtBQUssQ0FBZ0I7UUFDckIsYUFBUSxHQUFSLFFBQVEsQ0FLakI7UUFaTyxjQUFTLEdBQXlCLElBQUksY0FBTyxFQUFFLENBQUM7UUFDaEQsZUFBVSxHQUFxQyxJQUFJLGNBQU8sRUFBRSxDQUFDO1FBYXJFOzs7V0FHRztRQUNILElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSwrQ0FBcUIsRUFBRSxDQUFDO1FBQy9DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSw0QkFBZSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFM0QsOEJBQThCO1FBQzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxhQUFNLENBQUMsa0JBQWtCLENBQUMsb0JBQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsV0FBVyxDQUFDLHdCQUF3QixDQUFDLG1EQUF5QixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBRXJGLElBQUksQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQ25DLDBCQUFtQixDQUFDLFdBQVcsRUFDL0I7WUFDRSwyQkFBMkIsRUFBRSxJQUFJO1lBQ2pDLGNBQWMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWM7WUFDNUMsYUFBYSxFQUFFLElBQUksQ0FBQyxR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eEMsQ0FBQztZQUNILENBQUMsRUFBQyxDQUFDLENBQ0osQ0FBQztJQUNKLENBQUM7Q0FDRjtBQTFKRCxvQ0EwSkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBQYXRoLCBsb2dnaW5nLCBzY2hlbWEsIHZpcnR1YWxGcyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7XG4gIERyeVJ1blNpbmssXG4gIEhvc3RTaW5rLFxuICBIb3N0VHJlZSxcbiAgU2NoZW1hdGljRW5naW5lLFxuICBUcmVlLFxuICBVbnN1Y2Nlc3NmdWxXb3JrZmxvd0V4ZWN1dGlvbixcbiAgZm9ybWF0cyxcbiAgd29ya2Zsb3csXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJzsgIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8taW1wbGljaXQtZGVwZW5kZW5jaWVzXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0LCBjb25jYXQsIG9mLCB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBjb25jYXRNYXAsIGRlZmF1bHRJZkVtcHR5LCBpZ25vcmVFbGVtZW50cywgbGFzdCwgbWFwLCB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBEcnlSdW5FdmVudCB9IGZyb20gJy4uLy4uL3NyYy9zaW5rL2RyeXJ1bic7XG5pbXBvcnQgeyBCdWlsdGluVGFza0V4ZWN1dG9yIH0gZnJvbSAnLi4vLi4vdGFza3Mvbm9kZSc7XG5pbXBvcnQgeyBOb2RlTW9kdWxlc0VuZ2luZUhvc3QgfSBmcm9tICcuLi9ub2RlLW1vZHVsZS1lbmdpbmUtaG9zdCc7XG5pbXBvcnQgeyB2YWxpZGF0ZU9wdGlvbnNXaXRoU2NoZW1hIH0gZnJvbSAnLi4vc2NoZW1hLW9wdGlvbi10cmFuc2Zvcm0nO1xuXG5leHBvcnQgY2xhc3MgTm9kZVdvcmtmbG93IGltcGxlbWVudHMgd29ya2Zsb3cuV29ya2Zsb3cge1xuICBwcm90ZWN0ZWQgX2VuZ2luZTogU2NoZW1hdGljRW5naW5lPHt9LCB7fT47XG4gIHByb3RlY3RlZCBfZW5naW5lSG9zdDogTm9kZU1vZHVsZXNFbmdpbmVIb3N0O1xuICBwcm90ZWN0ZWQgX3JlZ2lzdHJ5OiBzY2hlbWEuQ29yZVNjaGVtYVJlZ2lzdHJ5O1xuXG4gIHByb3RlY3RlZCBfcmVwb3J0ZXI6IFN1YmplY3Q8RHJ5UnVuRXZlbnQ+ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJvdGVjdGVkIF9saWZlQ3ljbGU6IFN1YmplY3Q8d29ya2Zsb3cuTGlmZUN5Y2xlRXZlbnQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICBwcm90ZWN0ZWQgX2NvbnRleHQ6IHdvcmtmbG93LldvcmtmbG93RXhlY3V0aW9uQ29udGV4dFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCBfaG9zdDogdmlydHVhbEZzLkhvc3QsXG4gICAgcHJvdGVjdGVkIF9vcHRpb25zOiB7XG4gICAgICBmb3JjZT86IGJvb2xlYW47XG4gICAgICBkcnlSdW4/OiBib29sZWFuO1xuICAgICAgcm9vdD86IFBhdGgsXG4gICAgICBwYWNrYWdlTWFuYWdlcj86IHN0cmluZztcbiAgICB9LFxuICApIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgdGhlIFNjaGVtYXRpY0VuZ2luZSwgd2hpY2ggaXMgdXNlZCBieSB0aGUgU2NoZW1hdGljIGxpYnJhcnkgYXMgY2FsbGJhY2tzIHRvIGxvYWQgYVxuICAgICAqIENvbGxlY3Rpb24gb3IgYSBTY2hlbWF0aWMuXG4gICAgICovXG4gICAgdGhpcy5fZW5naW5lSG9zdCA9IG5ldyBOb2RlTW9kdWxlc0VuZ2luZUhvc3QoKTtcbiAgICB0aGlzLl9lbmdpbmUgPSBuZXcgU2NoZW1hdGljRW5naW5lKHRoaXMuX2VuZ2luZUhvc3QsIHRoaXMpO1xuXG4gICAgLy8gQWRkIHN1cHBvcnQgZm9yIHNjaGVtYUpzb24uXG4gICAgdGhpcy5fcmVnaXN0cnkgPSBuZXcgc2NoZW1hLkNvcmVTY2hlbWFSZWdpc3RyeShmb3JtYXRzLnN0YW5kYXJkRm9ybWF0cyk7XG4gICAgdGhpcy5fZW5naW5lSG9zdC5yZWdpc3Rlck9wdGlvbnNUcmFuc2Zvcm0odmFsaWRhdGVPcHRpb25zV2l0aFNjaGVtYSh0aGlzLl9yZWdpc3RyeSkpO1xuXG4gICAgdGhpcy5fZW5naW5lSG9zdC5yZWdpc3RlclRhc2tFeGVjdXRvcihcbiAgICAgIEJ1aWx0aW5UYXNrRXhlY3V0b3IuTm9kZVBhY2thZ2UsXG4gICAgICB7XG4gICAgICAgIGFsbG93UGFja2FnZU1hbmFnZXJPdmVycmlkZTogdHJ1ZSxcbiAgICAgICAgcGFja2FnZU1hbmFnZXI6IHRoaXMuX29wdGlvbnMucGFja2FnZU1hbmFnZXIsXG4gICAgICAgIHJvb3REaXJlY3Rvcnk6IHRoaXMuX29wdGlvbnMucm9vdCxcbiAgICAgIH0sXG4gICAgKTtcbiAgICB0aGlzLl9lbmdpbmVIb3N0LnJlZ2lzdGVyVGFza0V4ZWN1dG9yKFxuICAgICAgQnVpbHRpblRhc2tFeGVjdXRvci5SZXBvc2l0b3J5SW5pdGlhbGl6ZXIsXG4gICAgICB7XG4gICAgICAgIHJvb3REaXJlY3Rvcnk6IHRoaXMuX29wdGlvbnMucm9vdCxcbiAgICAgIH0sXG4gICAgKTtcbiAgICB0aGlzLl9lbmdpbmVIb3N0LnJlZ2lzdGVyVGFza0V4ZWN1dG9yKEJ1aWx0aW5UYXNrRXhlY3V0b3IuUnVuU2NoZW1hdGljKTtcbiAgICB0aGlzLl9lbmdpbmVIb3N0LnJlZ2lzdGVyVGFza0V4ZWN1dG9yKEJ1aWx0aW5UYXNrRXhlY3V0b3IuVHNsaW50Rml4KTtcblxuICAgIHRoaXMuX2NvbnRleHQgPSBbXTtcbiAgfVxuXG4gIGdldCBjb250ZXh0KCk6IFJlYWRvbmx5PHdvcmtmbG93LldvcmtmbG93RXhlY3V0aW9uQ29udGV4dD4ge1xuICAgIGNvbnN0IG1heWJlQ29udGV4dCA9IHRoaXMuX2NvbnRleHRbdGhpcy5fY29udGV4dC5sZW5ndGggLSAxXTtcbiAgICBpZiAoIW1heWJlQ29udGV4dCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZ2V0IGNvbnRleHQgd2hlbiB3b3JrZmxvdyBpcyBub3QgZXhlY3V0aW5nLi4uJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1heWJlQ29udGV4dDtcbiAgfVxuICBnZXQgcmVnaXN0cnkoKTogc2NoZW1hLlNjaGVtYVJlZ2lzdHJ5IHtcbiAgICByZXR1cm4gdGhpcy5fcmVnaXN0cnk7XG4gIH1cbiAgZ2V0IHJlcG9ydGVyKCk6IE9ic2VydmFibGU8RHJ5UnVuRXZlbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVwb3J0ZXIuYXNPYnNlcnZhYmxlKCk7XG4gIH1cbiAgZ2V0IGxpZmVDeWNsZSgpOiBPYnNlcnZhYmxlPHdvcmtmbG93LkxpZmVDeWNsZUV2ZW50PiB7XG4gICAgcmV0dXJuIHRoaXMuX2xpZmVDeWNsZS5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIGV4ZWN1dGUoXG4gICAgb3B0aW9uczogUGFydGlhbDx3b3JrZmxvdy5Xb3JrZmxvd0V4ZWN1dGlvbkNvbnRleHQ+ICYgd29ya2Zsb3cuUmVxdWlyZWRXb3JrZmxvd0V4ZWN1dGlvbkNvbnRleHQsXG4gICk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIGNvbnN0IHBhcmVudENvbnRleHQgPSB0aGlzLl9jb250ZXh0W3RoaXMuX2NvbnRleHQubGVuZ3RoIC0gMV07XG5cbiAgICBpZiAoIXBhcmVudENvbnRleHQpIHtcbiAgICAgIHRoaXMuX2xpZmVDeWNsZS5uZXh0KHsga2luZDogJ3N0YXJ0JyB9KTtcbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIHRoZSBjb2xsZWN0aW9uIGFuZCB0aGUgc2NoZW1hdGljLiAqL1xuICAgIGNvbnN0IGNvbGxlY3Rpb24gPSB0aGlzLl9lbmdpbmUuY3JlYXRlQ29sbGVjdGlvbihvcHRpb25zLmNvbGxlY3Rpb24pO1xuICAgIC8vIE9ubHkgYWxsb3cgcHJpdmF0ZSBzY2hlbWF0aWNzIGlmIGNhbGxlZCBmcm9tIHRoZSBzYW1lIGNvbGxlY3Rpb24uXG4gICAgY29uc3QgYWxsb3dQcml2YXRlID0gb3B0aW9ucy5hbGxvd1ByaXZhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICB8fCAocGFyZW50Q29udGV4dCAmJiBwYXJlbnRDb250ZXh0LmNvbGxlY3Rpb24gPT09IG9wdGlvbnMuY29sbGVjdGlvbik7XG4gICAgY29uc3Qgc2NoZW1hdGljID0gY29sbGVjdGlvbi5jcmVhdGVTY2hlbWF0aWMob3B0aW9ucy5zY2hlbWF0aWMsIGFsbG93UHJpdmF0ZSk7XG5cbiAgICAvLyBXZSBuZWVkIHR3byBzaW5rcyBpZiB3ZSB3YW50IHRvIG91dHB1dCB3aGF0IHdpbGwgaGFwcGVuLCBhbmQgYWN0dWFsbHkgZG8gdGhlIHdvcmsuXG4gICAgLy8gTm90ZSB0aGF0IGZzU2luayBpcyB0ZWNobmljYWxseSBub3QgdXNlZCBpZiBgLS1kcnktcnVuYCBpcyBwYXNzZWQsIGJ1dCBjcmVhdGluZyB0aGUgU2lua1xuICAgIC8vIGRvZXMgbm90IGhhdmUgYW55IHNpZGUgZWZmZWN0LlxuICAgIGNvbnN0IGRyeVJ1blNpbmsgPSBuZXcgRHJ5UnVuU2luayh0aGlzLl9ob3N0LCB0aGlzLl9vcHRpb25zLmZvcmNlKTtcbiAgICBjb25zdCBmc1NpbmsgPSBuZXcgSG9zdFNpbmsodGhpcy5faG9zdCwgdGhpcy5fb3B0aW9ucy5mb3JjZSk7XG5cbiAgICBsZXQgZXJyb3IgPSBmYWxzZTtcbiAgICBjb25zdCBkcnlSdW5TdWJzY3JpYmVyID0gZHJ5UnVuU2luay5yZXBvcnRlci5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgdGhpcy5fcmVwb3J0ZXIubmV4dChldmVudCk7XG4gICAgICBlcnJvciA9IGVycm9yIHx8IChldmVudC5raW5kID09ICdlcnJvcicpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fbGlmZUN5Y2xlLm5leHQoeyBraW5kOiAnd29ya2Zsb3ctc3RhcnQnIH0pO1xuXG4gICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBkZWJ1Zzogb3B0aW9ucy5kZWJ1ZyB8fCBmYWxzZSxcbiAgICAgIGxvZ2dlcjogb3B0aW9ucy5sb2dnZXIgfHwgKHBhcmVudENvbnRleHQgJiYgcGFyZW50Q29udGV4dC5sb2dnZXIpIHx8IG5ldyBsb2dnaW5nLk51bGxMb2dnZXIoKSxcbiAgICAgIHBhcmVudENvbnRleHQsXG4gICAgfTtcbiAgICB0aGlzLl9jb250ZXh0LnB1c2goY29udGV4dCk7XG5cbiAgICByZXR1cm4gc2NoZW1hdGljLmNhbGwoXG4gICAgICBvcHRpb25zLm9wdGlvbnMsXG4gICAgICBvZihuZXcgSG9zdFRyZWUodGhpcy5faG9zdCkpLFxuICAgICAgeyBsb2dnZXI6IGNvbnRleHQubG9nZ2VyIH0sXG4gICAgKS5waXBlKFxuICAgICAgbWFwKHRyZWUgPT4gVHJlZS5vcHRpbWl6ZSh0cmVlKSksXG4gICAgICBjb25jYXRNYXAoKHRyZWU6IFRyZWUpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbmNhdChcbiAgICAgICAgICBkcnlSdW5TaW5rLmNvbW1pdCh0cmVlKS5waXBlKGlnbm9yZUVsZW1lbnRzKCkpLFxuICAgICAgICAgIG9mKHRyZWUpLFxuICAgICAgICApO1xuICAgICAgfSksXG4gICAgICBjb25jYXRNYXAoKHRyZWU6IFRyZWUpID0+IHtcbiAgICAgICAgZHJ5UnVuU3Vic2NyaWJlci51bnN1YnNjcmliZSgpO1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihuZXcgVW5zdWNjZXNzZnVsV29ya2Zsb3dFeGVjdXRpb24oKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5kcnlSdW4pIHtcbiAgICAgICAgICByZXR1cm4gb2YoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmc1NpbmsuY29tbWl0KHRyZWUpLnBpcGUoZGVmYXVsdElmRW1wdHkoKSwgbGFzdCgpKTtcbiAgICAgIH0pLFxuICAgICAgY29uY2F0TWFwKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuZHJ5UnVuKSB7XG4gICAgICAgICAgcmV0dXJuIG9mKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9saWZlQ3ljbGUubmV4dCh7IGtpbmQ6ICdwb3N0LXRhc2tzLXN0YXJ0JyB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZW5naW5lLmV4ZWN1dGVQb3N0VGFza3MoKVxuICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgdGFwKHsgY29tcGxldGU6ICgpID0+IHRoaXMuX2xpZmVDeWNsZS5uZXh0KHsga2luZDogJ3Bvc3QtdGFza3MtZW5kJyB9KSB9KSxcbiAgICAgICAgICAgIGRlZmF1bHRJZkVtcHR5KCksXG4gICAgICAgICAgICBsYXN0KCksXG4gICAgICAgICAgKTtcbiAgICAgIH0pLFxuICAgICAgdGFwKHsgY29tcGxldGU6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fbGlmZUN5Y2xlLm5leHQoeyBraW5kOiAnd29ya2Zsb3ctZW5kJyB9KTtcbiAgICAgICAgdGhpcy5fY29udGV4dC5wb3AoKTtcblxuICAgICAgICBpZiAodGhpcy5fY29udGV4dC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgIHRoaXMuX2xpZmVDeWNsZS5uZXh0KHsga2luZDogJ2VuZCcgfSk7XG4gICAgICAgIH1cbiAgICAgIH19KSxcbiAgICApO1xuICB9XG59XG4iXX0=