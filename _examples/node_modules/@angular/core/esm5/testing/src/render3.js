/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
* Wraps a function in a new function which sets up document and HTML for running a test.
*
* This function is intended to wrap an existing testing function. The wrapper
* adds HTML to the `body` element of the `document` and subsequently tears it down.
*
* This function is intended to be used with `async await` and `Promise`s. If the wrapped
* function returns a promise (or is `async`) then the teardown is delayed until that `Promise`
* is resolved.
*
* On `node` this function detects if `document` is present and if not it will create one by
* loading `domino` and installing it.
*
* Example:
*
* ```
* describe('something', () => {
*   it('should do something', withBody('<my-app></my-app>', async () => {
*     const myApp = renderComponent(MyApp);
*     await whenRendered(myApp);
*     expect(getRenderedText(myApp)).toEqual('Hello World!');
*   }));
* });
* ```
*
* @param html HTML which should be inserted into `body` of the `document`.
* @param blockFn function to wrap. The function can return promise or be `async`.
* @experimental
*/
export function withBody(html, blockFn) {
    return function (done) {
        ensureDocument();
        var returnValue = undefined;
        if (typeof blockFn === 'function') {
            document.body.innerHTML = html;
            // TODO(i): I'm not sure why a cast is required here but otherwise I get
            //   TS2349: Cannot invoke an expression whose type lacks a call signature. Type 'never' has
            //   no compatible call signatures.
            var blockReturn = blockFn();
            if (blockReturn instanceof Promise) {
                blockReturn = blockReturn.then(done, done.fail);
            }
            else {
                done();
            }
        }
    };
}
var savedDocument = undefined;
var savedRequestAnimationFrame = undefined;
var savedNode = undefined;
var requestAnimationFrameCount = 0;
var ɵ0 = function (domino) {
    if (typeof global == 'object' && global.process && typeof require == 'function') {
        try {
            return require(domino);
        }
        catch (e) {
            // It is possible that we don't have domino available in which case just give up.
        }
    }
    // Seems like we don't have domino, give up.
    return null;
};
/**
 * System.js uses regexp to look for `require` statements. `domino` has to be
 * extracted into a constant so that the regexp in the System.js does not match
 * and does not try to load domino in the browser.
 */
var domino = (ɵ0)('domino');
/**
 * Ensure that global has `Document` if we are in node.js
 * @experimental
 */
export function ensureDocument() {
    if (domino) {
        // we are in node.js.
        var window_1 = domino.createWindow('', 'http://localhost');
        savedDocument = global.document;
        global.window = window_1;
        global.document = window_1.document;
        // Trick to avoid Event patching from
        // https://github.com/angular/angular/blob/7cf5e95ac9f0f2648beebf0d5bd9056b79946970/packages/platform-browser/src/dom/events/dom_events.ts#L112-L132
        // It fails with Domino with TypeError: Cannot assign to read only property
        // 'stopImmediatePropagation' of object '#<Event>'
        global.Event = null;
        savedNode = global.Node;
        global.Node = domino.impl.Node;
        savedRequestAnimationFrame = global.requestAnimationFrame;
        global.requestAnimationFrame = function (cb) {
            setImmediate(cb);
            return requestAnimationFrameCount++;
        };
    }
}
/**
 * Restore the state of `Document` between tests.
 * @experimental
 */
export function cleanupDocument() {
    if (savedDocument) {
        global.document = savedDocument;
        global.window = undefined;
        savedDocument = undefined;
    }
    if (savedNode) {
        global.Node = savedNode;
        savedNode = undefined;
    }
    if (savedRequestAnimationFrame) {
        global.requestAnimationFrame = savedRequestAnimationFrame;
        savedRequestAnimationFrame = undefined;
    }
}
if (typeof beforeEach == 'function')
    beforeEach(ensureDocument);
if (typeof afterEach == 'function')
    beforeEach(cleanupDocument);
export { ɵ0 };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvdGVzdGluZy9zcmMvcmVuZGVyMy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQTRCRTtBQUNGLE1BQU0sbUJBQXNCLElBQVksRUFBRSxPQUFVO0lBQ2xELE1BQU0sQ0FBQyxVQUFTLElBQThCO1FBQzVDLGNBQWMsRUFBRSxDQUFDO1FBQ2pCLElBQUksV0FBVyxHQUFRLFNBQVMsQ0FBQztRQUNqQyxFQUFFLENBQUMsQ0FBQyxPQUFPLE9BQU8sS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUMvQix3RUFBd0U7WUFDeEUsNEZBQTRGO1lBQzVGLG1DQUFtQztZQUNuQyxJQUFJLFdBQVcsR0FBSSxPQUFlLEVBQUUsQ0FBQztZQUNyQyxFQUFFLENBQUMsQ0FBQyxXQUFXLFlBQVksT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDbkMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sSUFBSSxFQUFFLENBQUM7WUFDVCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQVEsQ0FBQztBQUNYLENBQUM7QUFFRCxJQUFJLGFBQWEsR0FBdUIsU0FBUyxDQUFDO0FBQ2xELElBQUksMEJBQTBCLEdBQTJELFNBQVMsQ0FBQztBQUNuRyxJQUFJLFNBQVMsR0FBMEIsU0FBUyxDQUFDO0FBQ2pELElBQUksMEJBQTBCLEdBQUcsQ0FBQyxDQUFDO1NBT2QsVUFBUyxNQUFNO0lBQ2xDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxJQUFJLFFBQVEsSUFBSSxNQUFNLENBQUMsT0FBTyxJQUFJLE9BQU8sT0FBTyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDaEYsSUFBSSxDQUFDO1lBQ0gsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNYLGlGQUFpRjtRQUNuRixDQUFDO0lBQ0gsQ0FBQztJQUNELDRDQUE0QztJQUM1QyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQWZEOzs7O0dBSUc7QUFDSCxJQUFNLE1BQU0sR0FBUSxJQVVsQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWI7OztHQUdHO0FBQ0gsTUFBTTtJQUNKLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDWCxxQkFBcUI7UUFDckIsSUFBTSxRQUFNLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUMzRCxhQUFhLEdBQUksTUFBYyxDQUFDLFFBQVEsQ0FBQztRQUN4QyxNQUFjLENBQUMsTUFBTSxHQUFHLFFBQU0sQ0FBQztRQUMvQixNQUFjLENBQUMsUUFBUSxHQUFHLFFBQU0sQ0FBQyxRQUFRLENBQUM7UUFDM0MscUNBQXFDO1FBQ3JDLG9KQUFvSjtRQUNwSiwyRUFBMkU7UUFDM0Usa0RBQWtEO1FBQ2pELE1BQWMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQzdCLFNBQVMsR0FBSSxNQUFjLENBQUMsSUFBSSxDQUFDO1FBQ2hDLE1BQWMsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFFeEMsMEJBQTBCLEdBQUksTUFBYyxDQUFDLHFCQUFxQixDQUFDO1FBQ2xFLE1BQWMsQ0FBQyxxQkFBcUIsR0FBRyxVQUFTLEVBQXdCO1lBQ3ZFLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixNQUFNLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUN0QyxDQUFDLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU07SUFDSixFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQWMsQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDO1FBQ3hDLE1BQWMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBQ25DLGFBQWEsR0FBRyxTQUFTLENBQUM7SUFDNUIsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDYixNQUFjLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztRQUNqQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQ3hCLENBQUM7SUFDRCxFQUFFLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7UUFDOUIsTUFBYyxDQUFDLHFCQUFxQixHQUFHLDBCQUEwQixDQUFDO1FBQ25FLDBCQUEwQixHQUFHLFNBQVMsQ0FBQztJQUN6QyxDQUFDO0FBQ0gsQ0FBQztBQUVELEVBQUUsQ0FBQyxDQUFDLE9BQU8sVUFBVSxJQUFJLFVBQVUsQ0FBQztJQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNoRSxFQUFFLENBQUMsQ0FBQyxPQUFPLFNBQVMsSUFBSSxVQUFVLENBQUM7SUFBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuKiBXcmFwcyBhIGZ1bmN0aW9uIGluIGEgbmV3IGZ1bmN0aW9uIHdoaWNoIHNldHMgdXAgZG9jdW1lbnQgYW5kIEhUTUwgZm9yIHJ1bm5pbmcgYSB0ZXN0LlxuKlxuKiBUaGlzIGZ1bmN0aW9uIGlzIGludGVuZGVkIHRvIHdyYXAgYW4gZXhpc3RpbmcgdGVzdGluZyBmdW5jdGlvbi4gVGhlIHdyYXBwZXJcbiogYWRkcyBIVE1MIHRvIHRoZSBgYm9keWAgZWxlbWVudCBvZiB0aGUgYGRvY3VtZW50YCBhbmQgc3Vic2VxdWVudGx5IHRlYXJzIGl0IGRvd24uXG4qXG4qIFRoaXMgZnVuY3Rpb24gaXMgaW50ZW5kZWQgdG8gYmUgdXNlZCB3aXRoIGBhc3luYyBhd2FpdGAgYW5kIGBQcm9taXNlYHMuIElmIHRoZSB3cmFwcGVkXG4qIGZ1bmN0aW9uIHJldHVybnMgYSBwcm9taXNlIChvciBpcyBgYXN5bmNgKSB0aGVuIHRoZSB0ZWFyZG93biBpcyBkZWxheWVkIHVudGlsIHRoYXQgYFByb21pc2VgXG4qIGlzIHJlc29sdmVkLlxuKlxuKiBPbiBgbm9kZWAgdGhpcyBmdW5jdGlvbiBkZXRlY3RzIGlmIGBkb2N1bWVudGAgaXMgcHJlc2VudCBhbmQgaWYgbm90IGl0IHdpbGwgY3JlYXRlIG9uZSBieVxuKiBsb2FkaW5nIGBkb21pbm9gIGFuZCBpbnN0YWxsaW5nIGl0LlxuKlxuKiBFeGFtcGxlOlxuKlxuKiBgYGBcbiogZGVzY3JpYmUoJ3NvbWV0aGluZycsICgpID0+IHtcbiogICBpdCgnc2hvdWxkIGRvIHNvbWV0aGluZycsIHdpdGhCb2R5KCc8bXktYXBwPjwvbXktYXBwPicsIGFzeW5jICgpID0+IHtcbiogICAgIGNvbnN0IG15QXBwID0gcmVuZGVyQ29tcG9uZW50KE15QXBwKTtcbiogICAgIGF3YWl0IHdoZW5SZW5kZXJlZChteUFwcCk7XG4qICAgICBleHBlY3QoZ2V0UmVuZGVyZWRUZXh0KG15QXBwKSkudG9FcXVhbCgnSGVsbG8gV29ybGQhJyk7XG4qICAgfSkpO1xuKiB9KTtcbiogYGBgXG4qXG4qIEBwYXJhbSBodG1sIEhUTUwgd2hpY2ggc2hvdWxkIGJlIGluc2VydGVkIGludG8gYGJvZHlgIG9mIHRoZSBgZG9jdW1lbnRgLlxuKiBAcGFyYW0gYmxvY2tGbiBmdW5jdGlvbiB0byB3cmFwLiBUaGUgZnVuY3Rpb24gY2FuIHJldHVybiBwcm9taXNlIG9yIGJlIGBhc3luY2AuXG4qIEBleHBlcmltZW50YWxcbiovXG5leHBvcnQgZnVuY3Rpb24gd2l0aEJvZHk8VD4oaHRtbDogc3RyaW5nLCBibG9ja0ZuOiBUKTogVCB7XG4gIHJldHVybiBmdW5jdGlvbihkb25lOiB7KCk6IHZvaWQsIGZhaWwoKTogdm9pZH0pIHtcbiAgICBlbnN1cmVEb2N1bWVudCgpO1xuICAgIGxldCByZXR1cm5WYWx1ZTogYW55ID0gdW5kZWZpbmVkO1xuICAgIGlmICh0eXBlb2YgYmxvY2tGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgLy8gVE9ETyhpKTogSSdtIG5vdCBzdXJlIHdoeSBhIGNhc3QgaXMgcmVxdWlyZWQgaGVyZSBidXQgb3RoZXJ3aXNlIEkgZ2V0XG4gICAgICAvLyAgIFRTMjM0OTogQ2Fubm90IGludm9rZSBhbiBleHByZXNzaW9uIHdob3NlIHR5cGUgbGFja3MgYSBjYWxsIHNpZ25hdHVyZS4gVHlwZSAnbmV2ZXInIGhhc1xuICAgICAgLy8gICBubyBjb21wYXRpYmxlIGNhbGwgc2lnbmF0dXJlcy5cbiAgICAgIGxldCBibG9ja1JldHVybiA9IChibG9ja0ZuIGFzIGFueSkoKTtcbiAgICAgIGlmIChibG9ja1JldHVybiBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgYmxvY2tSZXR1cm4gPSBibG9ja1JldHVybi50aGVuKGRvbmUsIGRvbmUuZmFpbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb25lKCk7XG4gICAgICB9XG4gICAgfVxuICB9IGFzIGFueTtcbn1cblxubGV0IHNhdmVkRG9jdW1lbnQ6IERvY3VtZW50fHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbmxldCBzYXZlZFJlcXVlc3RBbmltYXRpb25GcmFtZTogKChjYWxsYmFjazogRnJhbWVSZXF1ZXN0Q2FsbGJhY2spID0+IG51bWJlcil8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xubGV0IHNhdmVkTm9kZTogdHlwZW9mIE5vZGV8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xubGV0IHJlcXVlc3RBbmltYXRpb25GcmFtZUNvdW50ID0gMDtcblxuLyoqXG4gKiBTeXN0ZW0uanMgdXNlcyByZWdleHAgdG8gbG9vayBmb3IgYHJlcXVpcmVgIHN0YXRlbWVudHMuIGBkb21pbm9gIGhhcyB0byBiZVxuICogZXh0cmFjdGVkIGludG8gYSBjb25zdGFudCBzbyB0aGF0IHRoZSByZWdleHAgaW4gdGhlIFN5c3RlbS5qcyBkb2VzIG5vdCBtYXRjaFxuICogYW5kIGRvZXMgbm90IHRyeSB0byBsb2FkIGRvbWlubyBpbiB0aGUgYnJvd3Nlci5cbiAqL1xuY29uc3QgZG9taW5vOiBhbnkgPSAoZnVuY3Rpb24oZG9taW5vKSB7XG4gIGlmICh0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbC5wcm9jZXNzICYmIHR5cGVvZiByZXF1aXJlID09ICdmdW5jdGlvbicpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHJlcXVpcmUoZG9taW5vKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBJdCBpcyBwb3NzaWJsZSB0aGF0IHdlIGRvbid0IGhhdmUgZG9taW5vIGF2YWlsYWJsZSBpbiB3aGljaCBjYXNlIGp1c3QgZ2l2ZSB1cC5cbiAgICB9XG4gIH1cbiAgLy8gU2VlbXMgbGlrZSB3ZSBkb24ndCBoYXZlIGRvbWlubywgZ2l2ZSB1cC5cbiAgcmV0dXJuIG51bGw7XG59KSgnZG9taW5vJyk7XG5cbi8qKlxuICogRW5zdXJlIHRoYXQgZ2xvYmFsIGhhcyBgRG9jdW1lbnRgIGlmIHdlIGFyZSBpbiBub2RlLmpzXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVEb2N1bWVudCgpOiB2b2lkIHtcbiAgaWYgKGRvbWlubykge1xuICAgIC8vIHdlIGFyZSBpbiBub2RlLmpzLlxuICAgIGNvbnN0IHdpbmRvdyA9IGRvbWluby5jcmVhdGVXaW5kb3coJycsICdodHRwOi8vbG9jYWxob3N0Jyk7XG4gICAgc2F2ZWREb2N1bWVudCA9IChnbG9iYWwgYXMgYW55KS5kb2N1bWVudDtcbiAgICAoZ2xvYmFsIGFzIGFueSkud2luZG93ID0gd2luZG93O1xuICAgIChnbG9iYWwgYXMgYW55KS5kb2N1bWVudCA9IHdpbmRvdy5kb2N1bWVudDtcbiAgICAvLyBUcmljayB0byBhdm9pZCBFdmVudCBwYXRjaGluZyBmcm9tXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9ibG9iLzdjZjVlOTVhYzlmMGYyNjQ4YmVlYmYwZDViZDkwNTZiNzk5NDY5NzAvcGFja2FnZXMvcGxhdGZvcm0tYnJvd3Nlci9zcmMvZG9tL2V2ZW50cy9kb21fZXZlbnRzLnRzI0wxMTItTDEzMlxuICAgIC8vIEl0IGZhaWxzIHdpdGggRG9taW5vIHdpdGggVHlwZUVycm9yOiBDYW5ub3QgYXNzaWduIHRvIHJlYWQgb25seSBwcm9wZXJ0eVxuICAgIC8vICdzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24nIG9mIG9iamVjdCAnIzxFdmVudD4nXG4gICAgKGdsb2JhbCBhcyBhbnkpLkV2ZW50ID0gbnVsbDtcbiAgICBzYXZlZE5vZGUgPSAoZ2xvYmFsIGFzIGFueSkuTm9kZTtcbiAgICAoZ2xvYmFsIGFzIGFueSkuTm9kZSA9IGRvbWluby5pbXBsLk5vZGU7XG5cbiAgICBzYXZlZFJlcXVlc3RBbmltYXRpb25GcmFtZSA9IChnbG9iYWwgYXMgYW55KS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gICAgKGdsb2JhbCBhcyBhbnkpLnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNiOiBGcmFtZVJlcXVlc3RDYWxsYmFjayk6IG51bWJlciB7XG4gICAgICBzZXRJbW1lZGlhdGUoY2IpO1xuICAgICAgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZUNvdW50Kys7XG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFJlc3RvcmUgdGhlIHN0YXRlIG9mIGBEb2N1bWVudGAgYmV0d2VlbiB0ZXN0cy5cbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFudXBEb2N1bWVudCgpOiB2b2lkIHtcbiAgaWYgKHNhdmVkRG9jdW1lbnQpIHtcbiAgICAoZ2xvYmFsIGFzIGFueSkuZG9jdW1lbnQgPSBzYXZlZERvY3VtZW50O1xuICAgIChnbG9iYWwgYXMgYW55KS53aW5kb3cgPSB1bmRlZmluZWQ7XG4gICAgc2F2ZWREb2N1bWVudCA9IHVuZGVmaW5lZDtcbiAgfVxuICBpZiAoc2F2ZWROb2RlKSB7XG4gICAgKGdsb2JhbCBhcyBhbnkpLk5vZGUgPSBzYXZlZE5vZGU7XG4gICAgc2F2ZWROb2RlID0gdW5kZWZpbmVkO1xuICB9XG4gIGlmIChzYXZlZFJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgIChnbG9iYWwgYXMgYW55KS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBzYXZlZFJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICBzYXZlZFJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHVuZGVmaW5lZDtcbiAgfVxufVxuXG5pZiAodHlwZW9mIGJlZm9yZUVhY2ggPT0gJ2Z1bmN0aW9uJykgYmVmb3JlRWFjaChlbnN1cmVEb2N1bWVudCk7XG5pZiAodHlwZW9mIGFmdGVyRWFjaCA9PSAnZnVuY3Rpb24nKSBiZWZvcmVFYWNoKGNsZWFudXBEb2N1bWVudCk7Il19