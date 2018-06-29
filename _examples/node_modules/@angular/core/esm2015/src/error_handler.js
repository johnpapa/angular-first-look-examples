/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ERROR_ORIGINAL_ERROR, getDebugContext, getErrorLogger, getOriginalError } from './errors';
/**
 * Provides a hook for centralized exception handling.
 *
 * The default implementation of `ErrorHandler` prints error messages to the `console`. To
 * intercept error handling, write a custom exception handler that replaces this default as
 * appropriate for your app.
 *
 * \@usageNotes
 * ### Example
 *
 * ```
 * class MyErrorHandler implements ErrorHandler {
 *   handleError(error) {
 *     // do something with the exception
 *   }
 * }
 *
 * \@NgModule({
 *   providers: [{provide: ErrorHandler, useClass: MyErrorHandler}]
 * })
 * class MyModule {}
 * ```
 */
export class ErrorHandler {
    constructor() {
        /**
         * \@internal
         */
        this._console = console;
    }
    /**
     * @param {?} error
     * @return {?}
     */
    handleError(error) {
        const /** @type {?} */ originalError = this._findOriginalError(error);
        const /** @type {?} */ context = this._findContext(error);
        // Note: Browser consoles show the place from where console.error was called.
        // We can use this to give users additional information about the error.
        const /** @type {?} */ errorLogger = getErrorLogger(error);
        errorLogger(this._console, `ERROR`, error);
        if (originalError) {
            errorLogger(this._console, `ORIGINAL ERROR`, originalError);
        }
        if (context) {
            errorLogger(this._console, 'ERROR CONTEXT', context);
        }
    }
    /**
     * \@internal
     * @param {?} error
     * @return {?}
     */
    _findContext(error) {
        if (error) {
            return getDebugContext(error) ? getDebugContext(error) :
                this._findContext(getOriginalError(error));
        }
        return null;
    }
    /**
     * \@internal
     * @param {?} error
     * @return {?}
     */
    _findOriginalError(error) {
        let /** @type {?} */ e = getOriginalError(error);
        while (e && getOriginalError(e)) {
            e = getOriginalError(e);
        }
        return e;
    }
}
function ErrorHandler_tsickle_Closure_declarations() {
    /**
     * \@internal
     * @type {?}
     */
    ErrorHandler.prototype._console;
}
/**
 * @param {?} message
 * @param {?} originalError
 * @return {?}
 */
export function wrappedError(message, originalError) {
    const /** @type {?} */ msg = `${message} caused by: ${originalError instanceof Error ? originalError.message : originalError}`;
    const /** @type {?} */ error = Error(msg);
    (/** @type {?} */ (error))[ERROR_ORIGINAL_ERROR] = originalError;
    return error;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JfaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2Vycm9yX2hhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLFVBQVUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMkJqRyxNQUFNOzs7Ozt3QkFJZ0IsT0FBTzs7Ozs7O0lBRTNCLFdBQVcsQ0FBQyxLQUFVO1FBQ3BCLHVCQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckQsdUJBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7OztRQUd6Qyx1QkFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQyxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQzdEO1FBQ0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNaLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUN0RDtLQUNGOzs7Ozs7SUFHRCxZQUFZLENBQUMsS0FBVTtRQUNyQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ1YsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUM1RTtRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7S0FDYjs7Ozs7O0lBR0Qsa0JBQWtCLENBQUMsS0FBWTtRQUM3QixxQkFBSSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEMsT0FBTyxDQUFDLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNoQyxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDekI7UUFFRCxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQ1Y7Q0FDRjs7Ozs7Ozs7Ozs7OztBQUVELE1BQU0sdUJBQXVCLE9BQWUsRUFBRSxhQUFrQjtJQUM5RCx1QkFBTSxHQUFHLEdBQ0wsR0FBRyxPQUFPLGVBQWUsYUFBYSxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQSxDQUFDLENBQUMsYUFBYyxFQUFFLENBQUM7SUFDdEcsdUJBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixtQkFBQyxLQUFZLEVBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLGFBQWEsQ0FBQztJQUNyRCxNQUFNLENBQUMsS0FBSyxDQUFDO0NBQ2QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RVJST1JfT1JJR0lOQUxfRVJST1IsIGdldERlYnVnQ29udGV4dCwgZ2V0RXJyb3JMb2dnZXIsIGdldE9yaWdpbmFsRXJyb3J9IGZyb20gJy4vZXJyb3JzJztcblxuXG5cbi8qKlxuICogUHJvdmlkZXMgYSBob29rIGZvciBjZW50cmFsaXplZCBleGNlcHRpb24gaGFuZGxpbmcuXG4gKlxuICogVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gb2YgYEVycm9ySGFuZGxlcmAgcHJpbnRzIGVycm9yIG1lc3NhZ2VzIHRvIHRoZSBgY29uc29sZWAuIFRvXG4gKiBpbnRlcmNlcHQgZXJyb3IgaGFuZGxpbmcsIHdyaXRlIGEgY3VzdG9tIGV4Y2VwdGlvbiBoYW5kbGVyIHRoYXQgcmVwbGFjZXMgdGhpcyBkZWZhdWx0IGFzXG4gKiBhcHByb3ByaWF0ZSBmb3IgeW91ciBhcHAuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBjbGFzcyBNeUVycm9ySGFuZGxlciBpbXBsZW1lbnRzIEVycm9ySGFuZGxlciB7XG4gKiAgIGhhbmRsZUVycm9yKGVycm9yKSB7XG4gKiAgICAgLy8gZG8gc29tZXRoaW5nIHdpdGggdGhlIGV4Y2VwdGlvblxuICogICB9XG4gKiB9XG4gKlxuICogQE5nTW9kdWxlKHtcbiAqICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IEVycm9ySGFuZGxlciwgdXNlQ2xhc3M6IE15RXJyb3JIYW5kbGVyfV1cbiAqIH0pXG4gKiBjbGFzcyBNeU1vZHVsZSB7fVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBFcnJvckhhbmRsZXIge1xuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfY29uc29sZTogQ29uc29sZSA9IGNvbnNvbGU7XG5cbiAgaGFuZGxlRXJyb3IoZXJyb3I6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IG9yaWdpbmFsRXJyb3IgPSB0aGlzLl9maW5kT3JpZ2luYWxFcnJvcihlcnJvcik7XG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMuX2ZpbmRDb250ZXh0KGVycm9yKTtcbiAgICAvLyBOb3RlOiBCcm93c2VyIGNvbnNvbGVzIHNob3cgdGhlIHBsYWNlIGZyb20gd2hlcmUgY29uc29sZS5lcnJvciB3YXMgY2FsbGVkLlxuICAgIC8vIFdlIGNhbiB1c2UgdGhpcyB0byBnaXZlIHVzZXJzIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGVycm9yLlxuICAgIGNvbnN0IGVycm9yTG9nZ2VyID0gZ2V0RXJyb3JMb2dnZXIoZXJyb3IpO1xuXG4gICAgZXJyb3JMb2dnZXIodGhpcy5fY29uc29sZSwgYEVSUk9SYCwgZXJyb3IpO1xuICAgIGlmIChvcmlnaW5hbEVycm9yKSB7XG4gICAgICBlcnJvckxvZ2dlcih0aGlzLl9jb25zb2xlLCBgT1JJR0lOQUwgRVJST1JgLCBvcmlnaW5hbEVycm9yKTtcbiAgICB9XG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIGVycm9yTG9nZ2VyKHRoaXMuX2NvbnNvbGUsICdFUlJPUiBDT05URVhUJywgY29udGV4dCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZmluZENvbnRleHQoZXJyb3I6IGFueSk6IGFueSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gZ2V0RGVidWdDb250ZXh0KGVycm9yKSA/IGdldERlYnVnQ29udGV4dChlcnJvcikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9maW5kQ29udGV4dChnZXRPcmlnaW5hbEVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9maW5kT3JpZ2luYWxFcnJvcihlcnJvcjogRXJyb3IpOiBhbnkge1xuICAgIGxldCBlID0gZ2V0T3JpZ2luYWxFcnJvcihlcnJvcik7XG4gICAgd2hpbGUgKGUgJiYgZ2V0T3JpZ2luYWxFcnJvcihlKSkge1xuICAgICAgZSA9IGdldE9yaWdpbmFsRXJyb3IoZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBwZWRFcnJvcihtZXNzYWdlOiBzdHJpbmcsIG9yaWdpbmFsRXJyb3I6IGFueSk6IEVycm9yIHtcbiAgY29uc3QgbXNnID1cbiAgICAgIGAke21lc3NhZ2V9IGNhdXNlZCBieTogJHtvcmlnaW5hbEVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBvcmlnaW5hbEVycm9yLm1lc3NhZ2U6IG9yaWdpbmFsRXJyb3IgfWA7XG4gIGNvbnN0IGVycm9yID0gRXJyb3IobXNnKTtcbiAgKGVycm9yIGFzIGFueSlbRVJST1JfT1JJR0lOQUxfRVJST1JdID0gb3JpZ2luYWxFcnJvcjtcbiAgcmV0dXJuIGVycm9yO1xufVxuIl19