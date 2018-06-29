/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { getParentRenderElement, visitProjectedRenderNodes } from './util';
export function ngContentDef(ngContentIndex, index) {
    return {
        // will bet set by the view definition
        nodeIndex: -1,
        parent: null,
        renderParent: null,
        bindingIndex: -1,
        outputIndex: -1,
        // regular values
        checkIndex: -1,
        flags: 8 /* TypeNgContent */,
        childFlags: 0,
        directChildFlags: 0,
        childMatchedQueries: 0,
        matchedQueries: {},
        matchedQueryIds: 0,
        references: {}, ngContentIndex: ngContentIndex,
        childCount: 0,
        bindings: [],
        bindingFlags: 0,
        outputs: [],
        element: null,
        provider: null,
        text: null,
        query: null,
        ngContent: { index: index }
    };
}
export function appendNgContent(view, renderHost, def) {
    var parentEl = getParentRenderElement(view, renderHost, def);
    if (!parentEl) {
        // Nothing to do if there is no parent element.
        return;
    }
    var ngContentIndex = def.ngContent.index;
    visitProjectedRenderNodes(view, ngContentIndex, 1 /* AppendChild */, parentEl, null, undefined);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udGVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3ZpZXcvbmdfY29udGVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQW1CLHNCQUFzQixFQUFFLHlCQUF5QixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTNGLE1BQU0sdUJBQXVCLGNBQTZCLEVBQUUsS0FBYTtJQUN2RSxNQUFNLENBQUM7UUFDTCxzQ0FBc0M7UUFDdEMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUNiLE1BQU0sRUFBRSxJQUFJO1FBQ1osWUFBWSxFQUFFLElBQUk7UUFDbEIsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUNoQixXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ2YsaUJBQWlCO1FBQ2pCLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDZCxLQUFLLHVCQUF5QjtRQUM5QixVQUFVLEVBQUUsQ0FBQztRQUNiLGdCQUFnQixFQUFFLENBQUM7UUFDbkIsbUJBQW1CLEVBQUUsQ0FBQztRQUN0QixjQUFjLEVBQUUsRUFBRTtRQUNsQixlQUFlLEVBQUUsQ0FBQztRQUNsQixVQUFVLEVBQUUsRUFBRSxFQUFFLGNBQWMsZ0JBQUE7UUFDOUIsVUFBVSxFQUFFLENBQUM7UUFDYixRQUFRLEVBQUUsRUFBRTtRQUNaLFlBQVksRUFBRSxDQUFDO1FBQ2YsT0FBTyxFQUFFLEVBQUU7UUFDWCxPQUFPLEVBQUUsSUFBSTtRQUNiLFFBQVEsRUFBRSxJQUFJO1FBQ2QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVMsRUFBRSxFQUFDLEtBQUssT0FBQSxFQUFDO0tBQ25CLENBQUM7QUFDSixDQUFDO0FBRUQsTUFBTSwwQkFBMEIsSUFBYyxFQUFFLFVBQWUsRUFBRSxHQUFZO0lBQzNFLElBQU0sUUFBUSxHQUFHLHNCQUFzQixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDL0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2QsK0NBQStDO1FBQy9DLE1BQU0sQ0FBQztJQUNULENBQUM7SUFDRCxJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsU0FBVyxDQUFDLEtBQUssQ0FBQztJQUM3Qyx5QkFBeUIsQ0FDckIsSUFBSSxFQUFFLGNBQWMsdUJBQWdDLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDckYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOb2RlRGVmLCBOb2RlRmxhZ3MsIFZpZXdEYXRhfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7UmVuZGVyTm9kZUFjdGlvbiwgZ2V0UGFyZW50UmVuZGVyRWxlbWVudCwgdmlzaXRQcm9qZWN0ZWRSZW5kZXJOb2Rlc30gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGZ1bmN0aW9uIG5nQ29udGVudERlZihuZ0NvbnRlbnRJbmRleDogbnVsbCB8IG51bWJlciwgaW5kZXg6IG51bWJlcik6IE5vZGVEZWYge1xuICByZXR1cm4ge1xuICAgIC8vIHdpbGwgYmV0IHNldCBieSB0aGUgdmlldyBkZWZpbml0aW9uXG4gICAgbm9kZUluZGV4OiAtMSxcbiAgICBwYXJlbnQ6IG51bGwsXG4gICAgcmVuZGVyUGFyZW50OiBudWxsLFxuICAgIGJpbmRpbmdJbmRleDogLTEsXG4gICAgb3V0cHV0SW5kZXg6IC0xLFxuICAgIC8vIHJlZ3VsYXIgdmFsdWVzXG4gICAgY2hlY2tJbmRleDogLTEsXG4gICAgZmxhZ3M6IE5vZGVGbGFncy5UeXBlTmdDb250ZW50LFxuICAgIGNoaWxkRmxhZ3M6IDAsXG4gICAgZGlyZWN0Q2hpbGRGbGFnczogMCxcbiAgICBjaGlsZE1hdGNoZWRRdWVyaWVzOiAwLFxuICAgIG1hdGNoZWRRdWVyaWVzOiB7fSxcbiAgICBtYXRjaGVkUXVlcnlJZHM6IDAsXG4gICAgcmVmZXJlbmNlczoge30sIG5nQ29udGVudEluZGV4LFxuICAgIGNoaWxkQ291bnQ6IDAsXG4gICAgYmluZGluZ3M6IFtdLFxuICAgIGJpbmRpbmdGbGFnczogMCxcbiAgICBvdXRwdXRzOiBbXSxcbiAgICBlbGVtZW50OiBudWxsLFxuICAgIHByb3ZpZGVyOiBudWxsLFxuICAgIHRleHQ6IG51bGwsXG4gICAgcXVlcnk6IG51bGwsXG4gICAgbmdDb250ZW50OiB7aW5kZXh9XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmROZ0NvbnRlbnQodmlldzogVmlld0RhdGEsIHJlbmRlckhvc3Q6IGFueSwgZGVmOiBOb2RlRGVmKSB7XG4gIGNvbnN0IHBhcmVudEVsID0gZ2V0UGFyZW50UmVuZGVyRWxlbWVudCh2aWV3LCByZW5kZXJIb3N0LCBkZWYpO1xuICBpZiAoIXBhcmVudEVsKSB7XG4gICAgLy8gTm90aGluZyB0byBkbyBpZiB0aGVyZSBpcyBubyBwYXJlbnQgZWxlbWVudC5cbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgbmdDb250ZW50SW5kZXggPSBkZWYubmdDb250ZW50ICEuaW5kZXg7XG4gIHZpc2l0UHJvamVjdGVkUmVuZGVyTm9kZXMoXG4gICAgICB2aWV3LCBuZ0NvbnRlbnRJbmRleCwgUmVuZGVyTm9kZUFjdGlvbi5BcHBlbmRDaGlsZCwgcGFyZW50RWwsIG51bGwsIHVuZGVmaW5lZCk7XG59XG4iXX0=