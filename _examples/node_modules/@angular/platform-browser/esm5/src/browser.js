/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CommonModule, PlatformLocation, ɵPLATFORM_BROWSER_ID as PLATFORM_BROWSER_ID } from '@angular/common';
import { APP_ID, ApplicationModule, ErrorHandler, NgModule, Optional, PLATFORM_ID, PLATFORM_INITIALIZER, RendererFactory2, Sanitizer, SkipSelf, Testability, createPlatformFactory, platformCore, ɵAPP_ROOT as APP_ROOT } from '@angular/core';
import { BrowserDomAdapter } from './browser/browser_adapter';
import { BrowserPlatformLocation } from './browser/location/browser_platform_location';
import { Meta } from './browser/meta';
import { SERVER_TRANSITION_PROVIDERS, TRANSITION_ID } from './browser/server-transition';
import { BrowserGetTestability } from './browser/testability';
import { Title } from './browser/title';
import { ELEMENT_PROBE_PROVIDERS } from './dom/debug/ng_probe';
import { DomRendererFactory2 } from './dom/dom_renderer';
import { DOCUMENT } from './dom/dom_tokens';
import { DomEventsPlugin } from './dom/events/dom_events';
import { EVENT_MANAGER_PLUGINS, EventManager } from './dom/events/event_manager';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerGesturesPlugin } from './dom/events/hammer_gestures';
import { KeyEventsPlugin } from './dom/events/key_events';
import { DomSharedStylesHost, SharedStylesHost } from './dom/shared_styles_host';
import { DomSanitizer, DomSanitizerImpl } from './security/dom_sanitization_service';
export var INTERNAL_BROWSER_PLATFORM_PROVIDERS = [
    { provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID },
    { provide: PLATFORM_INITIALIZER, useValue: initDomAdapter, multi: true },
    { provide: PlatformLocation, useClass: BrowserPlatformLocation, deps: [DOCUMENT] },
    { provide: DOCUMENT, useFactory: _document, deps: [] },
];
/**
 * @security Replacing built-in sanitization providers exposes the application to XSS risks.
 * Attacker-controlled data introduced by an unsanitized provider could expose your
 * application to XSS risks. For more detail, see the [Security Guide](http://g.co/ng/security).
 * @experimental
 */
export var BROWSER_SANITIZATION_PROVIDERS = [
    { provide: Sanitizer, useExisting: DomSanitizer },
    { provide: DomSanitizer, useClass: DomSanitizerImpl, deps: [DOCUMENT] },
];
export var platformBrowser = createPlatformFactory(platformCore, 'browser', INTERNAL_BROWSER_PLATFORM_PROVIDERS);
export function initDomAdapter() {
    BrowserDomAdapter.makeCurrent();
    BrowserGetTestability.init();
}
export function errorHandler() {
    return new ErrorHandler();
}
export function _document() {
    return document;
}
/**
 * The ng module for the browser.
 *
 *
 */
var BrowserModule = /** @class */ (function () {
    function BrowserModule(parentModule) {
        if (parentModule) {
            throw new Error("BrowserModule has already been loaded. If you need access to common directives such as NgIf and NgFor from a lazy loaded module, import CommonModule instead.");
        }
    }
    /**
     * Configures a browser-based application to transition from a server-rendered app, if
     * one is present on the page. The specified parameters must include an application id,
     * which must match between the client and server applications.
     *
     * @experimental
     */
    BrowserModule.withServerTransition = function (params) {
        return {
            ngModule: BrowserModule,
            providers: [
                { provide: APP_ID, useValue: params.appId },
                { provide: TRANSITION_ID, useExisting: APP_ID },
                SERVER_TRANSITION_PROVIDERS,
            ],
        };
    };
    BrowserModule.decorators = [
        { type: NgModule, args: [{
                    providers: [
                        BROWSER_SANITIZATION_PROVIDERS,
                        { provide: APP_ROOT, useValue: true },
                        { provide: ErrorHandler, useFactory: errorHandler, deps: [] },
                        { provide: EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true },
                        { provide: EVENT_MANAGER_PLUGINS, useClass: KeyEventsPlugin, multi: true },
                        { provide: EVENT_MANAGER_PLUGINS, useClass: HammerGesturesPlugin, multi: true },
                        { provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig },
                        DomRendererFactory2,
                        { provide: RendererFactory2, useExisting: DomRendererFactory2 },
                        { provide: SharedStylesHost, useExisting: DomSharedStylesHost },
                        DomSharedStylesHost,
                        Testability,
                        EventManager,
                        ELEMENT_PROBE_PROVIDERS,
                        Meta,
                        Title,
                    ],
                    exports: [CommonModule, ApplicationModule]
                },] }
    ];
    /** @nocollapse */
    BrowserModule.ctorParameters = function () { return [
        { type: BrowserModule, decorators: [{ type: Optional }, { type: SkipSelf }] }
    ]; };
    return BrowserModule;
}());
export { BrowserModule };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3BsYXRmb3JtLWJyb3dzZXIvc3JjL2Jyb3dzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsSUFBSSxtQkFBbUIsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzVHLE9BQU8sRUFBQyxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxFQUF1QixRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxvQkFBb0IsRUFBZSxnQkFBZ0IsRUFBZ0IsU0FBUyxFQUFFLFFBQVEsRUFBa0IsV0FBVyxFQUFFLHFCQUFxQixFQUFFLFlBQVksRUFBRSxTQUFTLElBQUksUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTdTLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQzVELE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDhDQUE4QyxDQUFDO0FBQ3JGLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwQyxPQUFPLEVBQUMsMkJBQTJCLEVBQUUsYUFBYSxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDdkYsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDNUQsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3RDLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBRTdELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUMxQyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDeEQsT0FBTyxFQUFDLHFCQUFxQixFQUFFLFlBQVksRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQy9FLE9BQU8sRUFBQyxxQkFBcUIsRUFBRSxtQkFBbUIsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQzlHLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUN4RCxPQUFPLEVBQUMsbUJBQW1CLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUMvRSxPQUFPLEVBQUMsWUFBWSxFQUFFLGdCQUFnQixFQUFDLE1BQU0scUNBQXFDLENBQUM7QUFFbkYsTUFBTSxDQUFDLElBQU0sbUNBQW1DLEdBQXFCO0lBQ25FLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLEVBQUM7SUFDckQsRUFBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO0lBQ3RFLEVBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSx1QkFBdUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBQztJQUNoRixFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDO0NBQ3JELENBQUM7QUFFRjs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxJQUFNLDhCQUE4QixHQUFxQjtJQUM5RCxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBQztJQUMvQyxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFDO0NBQ3RFLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSxlQUFlLEdBQ3hCLHFCQUFxQixDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsbUNBQW1DLENBQUMsQ0FBQztBQUV4RixNQUFNO0lBQ0osaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDaEMscUJBQXFCLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDL0IsQ0FBQztBQUVELE1BQU07SUFDSixNQUFNLENBQUMsSUFBSSxZQUFZLEVBQUUsQ0FBQztBQUM1QixDQUFDO0FBRUQsTUFBTTtJQUNKLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSDtJQXNCRSx1QkFBb0MsWUFBMkI7UUFDN0QsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNqQixNQUFNLElBQUksS0FBSyxDQUNYLCtKQUErSixDQUFDLENBQUM7UUFDdkssQ0FBQztJQUNILENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxrQ0FBb0IsR0FBM0IsVUFBNEIsTUFBdUI7UUFDakQsTUFBTSxDQUFDO1lBQ0wsUUFBUSxFQUFFLGFBQWE7WUFDdkIsU0FBUyxFQUFFO2dCQUNULEVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBQztnQkFDekMsRUFBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUM7Z0JBQzdDLDJCQUEyQjthQUM1QjtTQUNGLENBQUM7SUFDSixDQUFDOztnQkE3Q0YsUUFBUSxTQUFDO29CQUNSLFNBQVMsRUFBRTt3QkFDVCw4QkFBOEI7d0JBQzlCLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO3dCQUNuQyxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDO3dCQUMzRCxFQUFDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7d0JBQ3hFLEVBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQzt3QkFDeEUsRUFBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7d0JBQzdFLEVBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBQzt3QkFDL0QsbUJBQW1CO3dCQUNuQixFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUM7d0JBQzdELEVBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBQzt3QkFDN0QsbUJBQW1CO3dCQUNuQixXQUFXO3dCQUNYLFlBQVk7d0JBQ1osdUJBQXVCO3dCQUN2QixJQUFJO3dCQUNKLEtBQUs7cUJBQ047b0JBQ0QsT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFFLGlCQUFpQixDQUFDO2lCQUMzQzs7OztnQkFFbUQsYUFBYSx1QkFBbEQsUUFBUSxZQUFJLFFBQVE7O0lBd0JuQyxvQkFBQztDQUFBLEFBOUNELElBOENDO1NBekJZLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tbW9uTW9kdWxlLCBQbGF0Zm9ybUxvY2F0aW9uLCDJtVBMQVRGT1JNX0JST1dTRVJfSUQgYXMgUExBVEZPUk1fQlJPV1NFUl9JRH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7QVBQX0lELCBBcHBsaWNhdGlvbk1vZHVsZSwgRXJyb3JIYW5kbGVyLCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSwgT3B0aW9uYWwsIFBMQVRGT1JNX0lELCBQTEFURk9STV9JTklUSUFMSVpFUiwgUGxhdGZvcm1SZWYsIFJlbmRlcmVyRmFjdG9yeTIsIFJvb3RSZW5kZXJlciwgU2FuaXRpemVyLCBTa2lwU2VsZiwgU3RhdGljUHJvdmlkZXIsIFRlc3RhYmlsaXR5LCBjcmVhdGVQbGF0Zm9ybUZhY3RvcnksIHBsYXRmb3JtQ29yZSwgybVBUFBfUk9PVCBhcyBBUFBfUk9PVH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7QnJvd3NlckRvbUFkYXB0ZXJ9IGZyb20gJy4vYnJvd3Nlci9icm93c2VyX2FkYXB0ZXInO1xuaW1wb3J0IHtCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnLi9icm93c2VyL2xvY2F0aW9uL2Jyb3dzZXJfcGxhdGZvcm1fbG9jYXRpb24nO1xuaW1wb3J0IHtNZXRhfSBmcm9tICcuL2Jyb3dzZXIvbWV0YSc7XG5pbXBvcnQge1NFUlZFUl9UUkFOU0lUSU9OX1BST1ZJREVSUywgVFJBTlNJVElPTl9JRH0gZnJvbSAnLi9icm93c2VyL3NlcnZlci10cmFuc2l0aW9uJztcbmltcG9ydCB7QnJvd3NlckdldFRlc3RhYmlsaXR5fSBmcm9tICcuL2Jyb3dzZXIvdGVzdGFiaWxpdHknO1xuaW1wb3J0IHtUaXRsZX0gZnJvbSAnLi9icm93c2VyL3RpdGxlJztcbmltcG9ydCB7RUxFTUVOVF9QUk9CRV9QUk9WSURFUlN9IGZyb20gJy4vZG9tL2RlYnVnL25nX3Byb2JlJztcbmltcG9ydCB7Z2V0RE9NfSBmcm9tICcuL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge0RvbVJlbmRlcmVyRmFjdG9yeTJ9IGZyb20gJy4vZG9tL2RvbV9yZW5kZXJlcic7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuL2RvbS9kb21fdG9rZW5zJztcbmltcG9ydCB7RG9tRXZlbnRzUGx1Z2lufSBmcm9tICcuL2RvbS9ldmVudHMvZG9tX2V2ZW50cyc7XG5pbXBvcnQge0VWRU5UX01BTkFHRVJfUExVR0lOUywgRXZlbnRNYW5hZ2VyfSBmcm9tICcuL2RvbS9ldmVudHMvZXZlbnRfbWFuYWdlcic7XG5pbXBvcnQge0hBTU1FUl9HRVNUVVJFX0NPTkZJRywgSGFtbWVyR2VzdHVyZUNvbmZpZywgSGFtbWVyR2VzdHVyZXNQbHVnaW59IGZyb20gJy4vZG9tL2V2ZW50cy9oYW1tZXJfZ2VzdHVyZXMnO1xuaW1wb3J0IHtLZXlFdmVudHNQbHVnaW59IGZyb20gJy4vZG9tL2V2ZW50cy9rZXlfZXZlbnRzJztcbmltcG9ydCB7RG9tU2hhcmVkU3R5bGVzSG9zdCwgU2hhcmVkU3R5bGVzSG9zdH0gZnJvbSAnLi9kb20vc2hhcmVkX3N0eWxlc19ob3N0JztcbmltcG9ydCB7RG9tU2FuaXRpemVyLCBEb21TYW5pdGl6ZXJJbXBsfSBmcm9tICcuL3NlY3VyaXR5L2RvbV9zYW5pdGl6YXRpb25fc2VydmljZSc7XG5cbmV4cG9ydCBjb25zdCBJTlRFUk5BTF9CUk9XU0VSX1BMQVRGT1JNX1BST1ZJREVSUzogU3RhdGljUHJvdmlkZXJbXSA9IFtcbiAge3Byb3ZpZGU6IFBMQVRGT1JNX0lELCB1c2VWYWx1ZTogUExBVEZPUk1fQlJPV1NFUl9JRH0sXG4gIHtwcm92aWRlOiBQTEFURk9STV9JTklUSUFMSVpFUiwgdXNlVmFsdWU6IGluaXREb21BZGFwdGVyLCBtdWx0aTogdHJ1ZX0sXG4gIHtwcm92aWRlOiBQbGF0Zm9ybUxvY2F0aW9uLCB1c2VDbGFzczogQnJvd3NlclBsYXRmb3JtTG9jYXRpb24sIGRlcHM6IFtET0NVTUVOVF19LFxuICB7cHJvdmlkZTogRE9DVU1FTlQsIHVzZUZhY3Rvcnk6IF9kb2N1bWVudCwgZGVwczogW119LFxuXTtcblxuLyoqXG4gKiBAc2VjdXJpdHkgUmVwbGFjaW5nIGJ1aWx0LWluIHNhbml0aXphdGlvbiBwcm92aWRlcnMgZXhwb3NlcyB0aGUgYXBwbGljYXRpb24gdG8gWFNTIHJpc2tzLlxuICogQXR0YWNrZXItY29udHJvbGxlZCBkYXRhIGludHJvZHVjZWQgYnkgYW4gdW5zYW5pdGl6ZWQgcHJvdmlkZXIgY291bGQgZXhwb3NlIHlvdXJcbiAqIGFwcGxpY2F0aW9uIHRvIFhTUyByaXNrcy4gRm9yIG1vcmUgZGV0YWlsLCBzZWUgdGhlIFtTZWN1cml0eSBHdWlkZV0oaHR0cDovL2cuY28vbmcvc2VjdXJpdHkpLlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgY29uc3QgQlJPV1NFUl9TQU5JVElaQVRJT05fUFJPVklERVJTOiBTdGF0aWNQcm92aWRlcltdID0gW1xuICB7cHJvdmlkZTogU2FuaXRpemVyLCB1c2VFeGlzdGluZzogRG9tU2FuaXRpemVyfSxcbiAge3Byb3ZpZGU6IERvbVNhbml0aXplciwgdXNlQ2xhc3M6IERvbVNhbml0aXplckltcGwsIGRlcHM6IFtET0NVTUVOVF19LFxuXTtcblxuZXhwb3J0IGNvbnN0IHBsYXRmb3JtQnJvd3NlcjogKGV4dHJhUHJvdmlkZXJzPzogU3RhdGljUHJvdmlkZXJbXSkgPT4gUGxhdGZvcm1SZWYgPVxuICAgIGNyZWF0ZVBsYXRmb3JtRmFjdG9yeShwbGF0Zm9ybUNvcmUsICdicm93c2VyJywgSU5URVJOQUxfQlJPV1NFUl9QTEFURk9STV9QUk9WSURFUlMpO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5pdERvbUFkYXB0ZXIoKSB7XG4gIEJyb3dzZXJEb21BZGFwdGVyLm1ha2VDdXJyZW50KCk7XG4gIEJyb3dzZXJHZXRUZXN0YWJpbGl0eS5pbml0KCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcnJvckhhbmRsZXIoKTogRXJyb3JIYW5kbGVyIHtcbiAgcmV0dXJuIG5ldyBFcnJvckhhbmRsZXIoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9kb2N1bWVudCgpOiBhbnkge1xuICByZXR1cm4gZG9jdW1lbnQ7XG59XG5cbi8qKlxuICogVGhlIG5nIG1vZHVsZSBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICpcbiAqL1xuQE5nTW9kdWxlKHtcbiAgcHJvdmlkZXJzOiBbXG4gICAgQlJPV1NFUl9TQU5JVElaQVRJT05fUFJPVklERVJTLFxuICAgIHtwcm92aWRlOiBBUFBfUk9PVCwgdXNlVmFsdWU6IHRydWV9LFxuICAgIHtwcm92aWRlOiBFcnJvckhhbmRsZXIsIHVzZUZhY3Rvcnk6IGVycm9ySGFuZGxlciwgZGVwczogW119LFxuICAgIHtwcm92aWRlOiBFVkVOVF9NQU5BR0VSX1BMVUdJTlMsIHVzZUNsYXNzOiBEb21FdmVudHNQbHVnaW4sIG11bHRpOiB0cnVlfSxcbiAgICB7cHJvdmlkZTogRVZFTlRfTUFOQUdFUl9QTFVHSU5TLCB1c2VDbGFzczogS2V5RXZlbnRzUGx1Z2luLCBtdWx0aTogdHJ1ZX0sXG4gICAge3Byb3ZpZGU6IEVWRU5UX01BTkFHRVJfUExVR0lOUywgdXNlQ2xhc3M6IEhhbW1lckdlc3R1cmVzUGx1Z2luLCBtdWx0aTogdHJ1ZX0sXG4gICAge3Byb3ZpZGU6IEhBTU1FUl9HRVNUVVJFX0NPTkZJRywgdXNlQ2xhc3M6IEhhbW1lckdlc3R1cmVDb25maWd9LFxuICAgIERvbVJlbmRlcmVyRmFjdG9yeTIsXG4gICAge3Byb3ZpZGU6IFJlbmRlcmVyRmFjdG9yeTIsIHVzZUV4aXN0aW5nOiBEb21SZW5kZXJlckZhY3RvcnkyfSxcbiAgICB7cHJvdmlkZTogU2hhcmVkU3R5bGVzSG9zdCwgdXNlRXhpc3Rpbmc6IERvbVNoYXJlZFN0eWxlc0hvc3R9LFxuICAgIERvbVNoYXJlZFN0eWxlc0hvc3QsXG4gICAgVGVzdGFiaWxpdHksXG4gICAgRXZlbnRNYW5hZ2VyLFxuICAgIEVMRU1FTlRfUFJPQkVfUFJPVklERVJTLFxuICAgIE1ldGEsXG4gICAgVGl0bGUsXG4gIF0sXG4gIGV4cG9ydHM6IFtDb21tb25Nb2R1bGUsIEFwcGxpY2F0aW9uTW9kdWxlXVxufSlcbmV4cG9ydCBjbGFzcyBCcm93c2VyTW9kdWxlIHtcbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNraXBTZWxmKCkgcGFyZW50TW9kdWxlOiBCcm93c2VyTW9kdWxlKSB7XG4gICAgaWYgKHBhcmVudE1vZHVsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBCcm93c2VyTW9kdWxlIGhhcyBhbHJlYWR5IGJlZW4gbG9hZGVkLiBJZiB5b3UgbmVlZCBhY2Nlc3MgdG8gY29tbW9uIGRpcmVjdGl2ZXMgc3VjaCBhcyBOZ0lmIGFuZCBOZ0ZvciBmcm9tIGEgbGF6eSBsb2FkZWQgbW9kdWxlLCBpbXBvcnQgQ29tbW9uTW9kdWxlIGluc3RlYWQuYCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgYSBicm93c2VyLWJhc2VkIGFwcGxpY2F0aW9uIHRvIHRyYW5zaXRpb24gZnJvbSBhIHNlcnZlci1yZW5kZXJlZCBhcHAsIGlmXG4gICAqIG9uZSBpcyBwcmVzZW50IG9uIHRoZSBwYWdlLiBUaGUgc3BlY2lmaWVkIHBhcmFtZXRlcnMgbXVzdCBpbmNsdWRlIGFuIGFwcGxpY2F0aW9uIGlkLFxuICAgKiB3aGljaCBtdXN0IG1hdGNoIGJldHdlZW4gdGhlIGNsaWVudCBhbmQgc2VydmVyIGFwcGxpY2F0aW9ucy5cbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgc3RhdGljIHdpdGhTZXJ2ZXJUcmFuc2l0aW9uKHBhcmFtczoge2FwcElkOiBzdHJpbmd9KTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBCcm93c2VyTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtwcm92aWRlOiBBUFBfSUQsIHVzZVZhbHVlOiBwYXJhbXMuYXBwSWR9LFxuICAgICAgICB7cHJvdmlkZTogVFJBTlNJVElPTl9JRCwgdXNlRXhpc3Rpbmc6IEFQUF9JRH0sXG4gICAgICAgIFNFUlZFUl9UUkFOU0lUSU9OX1BST1ZJREVSUyxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxufVxuIl19