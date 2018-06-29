/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ApplicationInitStatus } from './application_init';
import { ApplicationRef } from './application_ref';
import { APP_ID_RANDOM_PROVIDER } from './application_tokens';
import { IterableDiffers, KeyValueDiffers, defaultIterableDiffers, defaultKeyValueDiffers } from './change_detection/change_detection';
import { Inject, Optional, SkipSelf } from './di/metadata';
import { LOCALE_ID } from './i18n/tokens';
import { Compiler } from './linker/compiler';
import { NgModule } from './metadata';
export function _iterableDiffersFactory() {
    return defaultIterableDiffers;
}
export function _keyValueDiffersFactory() {
    return defaultKeyValueDiffers;
}
export function _localeFactory(locale) {
    return locale || 'en-US';
}
/**
 * This module includes the providers of @angular/core that are needed
 * to bootstrap components via `ApplicationRef`.
 *
 * @experimental
 */
var ApplicationModule = /** @class */ (function () {
    // Inject ApplicationRef to make it eager...
    function ApplicationModule(appRef) {
    }
    ApplicationModule.decorators = [
        { type: NgModule, args: [{
                    providers: [
                        ApplicationRef,
                        ApplicationInitStatus,
                        Compiler,
                        APP_ID_RANDOM_PROVIDER,
                        { provide: IterableDiffers, useFactory: _iterableDiffersFactory },
                        { provide: KeyValueDiffers, useFactory: _keyValueDiffersFactory },
                        {
                            provide: LOCALE_ID,
                            useFactory: _localeFactory,
                            deps: [[new Inject(LOCALE_ID), new Optional(), new SkipSelf()]]
                        },
                    ]
                },] }
    ];
    /** @nocollapse */
    ApplicationModule.ctorParameters = function () { return [
        { type: ApplicationRef }
    ]; };
    return ApplicationModule;
}());
export { ApplicationModule };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25fbW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvYXBwbGljYXRpb25fbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3pELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUM1RCxPQUFPLEVBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxzQkFBc0IsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLHFDQUFxQyxDQUFDO0FBQ3JJLE9BQU8sRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6RCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRXBDLE1BQU07SUFDSixNQUFNLENBQUMsc0JBQXNCLENBQUM7QUFDaEMsQ0FBQztBQUVELE1BQU07SUFDSixNQUFNLENBQUMsc0JBQXNCLENBQUM7QUFDaEMsQ0FBQztBQUVELE1BQU0seUJBQXlCLE1BQWU7SUFDNUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUM7QUFDM0IsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0g7SUFnQkUsNENBQTRDO0lBQzVDLDJCQUFZLE1BQXNCO0lBQUcsQ0FBQzs7Z0JBakJ2QyxRQUFRLFNBQUM7b0JBQ1IsU0FBUyxFQUFFO3dCQUNULGNBQWM7d0JBQ2QscUJBQXFCO3dCQUNyQixRQUFRO3dCQUNSLHNCQUFzQjt3QkFDdEIsRUFBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSx1QkFBdUIsRUFBQzt3QkFDL0QsRUFBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSx1QkFBdUIsRUFBQzt3QkFDL0Q7NEJBQ0UsT0FBTyxFQUFFLFNBQVM7NEJBQ2xCLFVBQVUsRUFBRSxjQUFjOzRCQUMxQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksUUFBUSxFQUFFLEVBQUUsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO3lCQUNoRTtxQkFDRjtpQkFDRjs7OztnQkF4Q08sY0FBYzs7SUE0Q3RCLHdCQUFDO0NBQUEsQUFsQkQsSUFrQkM7U0FIWSxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXBwbGljYXRpb25Jbml0U3RhdHVzfSBmcm9tICcuL2FwcGxpY2F0aW9uX2luaXQnO1xuaW1wb3J0IHtBcHBsaWNhdGlvblJlZn0gZnJvbSAnLi9hcHBsaWNhdGlvbl9yZWYnO1xuaW1wb3J0IHtBUFBfSURfUkFORE9NX1BST1ZJREVSfSBmcm9tICcuL2FwcGxpY2F0aW9uX3Rva2Vucyc7XG5pbXBvcnQge0l0ZXJhYmxlRGlmZmVycywgS2V5VmFsdWVEaWZmZXJzLCBkZWZhdWx0SXRlcmFibGVEaWZmZXJzLCBkZWZhdWx0S2V5VmFsdWVEaWZmZXJzfSBmcm9tICcuL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge0luamVjdCwgT3B0aW9uYWwsIFNraXBTZWxmfSBmcm9tICcuL2RpL21ldGFkYXRhJztcbmltcG9ydCB7TE9DQUxFX0lEfSBmcm9tICcuL2kxOG4vdG9rZW5zJztcbmltcG9ydCB7Q29tcGlsZXJ9IGZyb20gJy4vbGlua2VyL2NvbXBpbGVyJztcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJy4vbWV0YWRhdGEnO1xuXG5leHBvcnQgZnVuY3Rpb24gX2l0ZXJhYmxlRGlmZmVyc0ZhY3RvcnkoKSB7XG4gIHJldHVybiBkZWZhdWx0SXRlcmFibGVEaWZmZXJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX2tleVZhbHVlRGlmZmVyc0ZhY3RvcnkoKSB7XG4gIHJldHVybiBkZWZhdWx0S2V5VmFsdWVEaWZmZXJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX2xvY2FsZUZhY3RvcnkobG9jYWxlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGxvY2FsZSB8fCAnZW4tVVMnO1xufVxuXG4vKipcbiAqIFRoaXMgbW9kdWxlIGluY2x1ZGVzIHRoZSBwcm92aWRlcnMgb2YgQGFuZ3VsYXIvY29yZSB0aGF0IGFyZSBuZWVkZWRcbiAqIHRvIGJvb3RzdHJhcCBjb21wb25lbnRzIHZpYSBgQXBwbGljYXRpb25SZWZgLlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuQE5nTW9kdWxlKHtcbiAgcHJvdmlkZXJzOiBbXG4gICAgQXBwbGljYXRpb25SZWYsXG4gICAgQXBwbGljYXRpb25Jbml0U3RhdHVzLFxuICAgIENvbXBpbGVyLFxuICAgIEFQUF9JRF9SQU5ET01fUFJPVklERVIsXG4gICAge3Byb3ZpZGU6IEl0ZXJhYmxlRGlmZmVycywgdXNlRmFjdG9yeTogX2l0ZXJhYmxlRGlmZmVyc0ZhY3Rvcnl9LFxuICAgIHtwcm92aWRlOiBLZXlWYWx1ZURpZmZlcnMsIHVzZUZhY3Rvcnk6IF9rZXlWYWx1ZURpZmZlcnNGYWN0b3J5fSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBMT0NBTEVfSUQsXG4gICAgICB1c2VGYWN0b3J5OiBfbG9jYWxlRmFjdG9yeSxcbiAgICAgIGRlcHM6IFtbbmV3IEluamVjdChMT0NBTEVfSUQpLCBuZXcgT3B0aW9uYWwoKSwgbmV3IFNraXBTZWxmKCldXVxuICAgIH0sXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgQXBwbGljYXRpb25Nb2R1bGUge1xuICAvLyBJbmplY3QgQXBwbGljYXRpb25SZWYgdG8gbWFrZSBpdCBlYWdlci4uLlxuICBjb25zdHJ1Y3RvcihhcHBSZWY6IEFwcGxpY2F0aW9uUmVmKSB7fVxufVxuIl19