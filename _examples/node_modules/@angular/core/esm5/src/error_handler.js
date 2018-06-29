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
 * @usageNotes
 * ### Example
 *
 * ```
 * class MyErrorHandler implements ErrorHandler {
 *   handleError(error) {
 *     // do something with the exception
 *   }
 * }
 *
 * @NgModule({
 *   providers: [{provide: ErrorHandler, useClass: MyErrorHandler}]
 * })
 * class MyModule {}
 * ```
 */
var ErrorHandler = /** @class */ (function () {
    function ErrorHandler() {
        /**
         * @internal
         */
        this._console = console;
    }
    ErrorHandler.prototype.handleError = function (error) {
        var originalError = this._findOriginalError(error);
        var context = this._findContext(error);
        // Note: Browser consoles show the place from where console.error was called.
        // We can use this to give users additional information about the error.
        var errorLogger = getErrorLogger(error);
        errorLogger(this._console, "ERROR", error);
        if (originalError) {
            errorLogger(this._console, "ORIGINAL ERROR", originalError);
        }
        if (context) {
            errorLogger(this._console, 'ERROR CONTEXT', context);
        }
    };
    /** @internal */
    ErrorHandler.prototype._findContext = function (error) {
        if (error) {
            return getDebugContext(error) ? getDebugContext(error) :
                this._findContext(getOriginalError(error));
        }
        return null;
    };
    /** @internal */
    ErrorHandler.prototype._findOriginalError = function (error) {
        var e = getOriginalError(error);
        while (e && getOriginalError(e)) {
            e = getOriginalError(e);
        }
        return e;
    };
    return ErrorHandler;
}());
export { ErrorHandler };
export function wrappedError(message, originalError) {
    var msg = message + " caused by: " + (originalError instanceof Error ? originalError.message : originalError);
    var error = Error(msg);
    error[ERROR_ORIGINAL_ERROR] = originalError;
    return error;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JfaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2Vycm9yX2hhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLG9CQUFvQixFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFJakc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQkc7QUFDSDtJQUFBO1FBQ0U7O1dBRUc7UUFDSCxhQUFRLEdBQVksT0FBTyxDQUFDO0lBcUM5QixDQUFDO0lBbkNDLGtDQUFXLEdBQVgsVUFBWSxLQUFVO1FBQ3BCLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyRCxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLDZFQUE2RTtRQUM3RSx3RUFBd0U7UUFDeEUsSUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQyxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1osV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZELENBQUM7SUFDSCxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLG1DQUFZLEdBQVosVUFBYSxLQUFVO1FBQ3JCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDVixNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzdFLENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELGdCQUFnQjtJQUNoQix5Q0FBa0IsR0FBbEIsVUFBbUIsS0FBWTtRQUM3QixJQUFJLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoQyxPQUFPLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2hDLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBRUQsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFDSCxtQkFBQztBQUFELENBQUMsQUF6Q0QsSUF5Q0M7O0FBRUQsTUFBTSx1QkFBdUIsT0FBZSxFQUFFLGFBQWtCO0lBQzlELElBQU0sR0FBRyxHQUNGLE9BQU8scUJBQWUsYUFBYSxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQSxDQUFDLENBQUMsYUFBYSxDQUFHLENBQUM7SUFDdEcsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hCLEtBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLGFBQWEsQ0FBQztJQUNyRCxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFUlJPUl9PUklHSU5BTF9FUlJPUiwgZ2V0RGVidWdDb250ZXh0LCBnZXRFcnJvckxvZ2dlciwgZ2V0T3JpZ2luYWxFcnJvcn0gZnJvbSAnLi9lcnJvcnMnO1xuXG5cblxuLyoqXG4gKiBQcm92aWRlcyBhIGhvb2sgZm9yIGNlbnRyYWxpemVkIGV4Y2VwdGlvbiBoYW5kbGluZy5cbiAqXG4gKiBUaGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBvZiBgRXJyb3JIYW5kbGVyYCBwcmludHMgZXJyb3IgbWVzc2FnZXMgdG8gdGhlIGBjb25zb2xlYC4gVG9cbiAqIGludGVyY2VwdCBlcnJvciBoYW5kbGluZywgd3JpdGUgYSBjdXN0b20gZXhjZXB0aW9uIGhhbmRsZXIgdGhhdCByZXBsYWNlcyB0aGlzIGRlZmF1bHQgYXNcbiAqIGFwcHJvcHJpYXRlIGZvciB5b3VyIGFwcC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGNsYXNzIE15RXJyb3JIYW5kbGVyIGltcGxlbWVudHMgRXJyb3JIYW5kbGVyIHtcbiAqICAgaGFuZGxlRXJyb3IoZXJyb3IpIHtcbiAqICAgICAvLyBkbyBzb21ldGhpbmcgd2l0aCB0aGUgZXhjZXB0aW9uXG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBATmdNb2R1bGUoe1xuICogICBwcm92aWRlcnM6IFt7cHJvdmlkZTogRXJyb3JIYW5kbGVyLCB1c2VDbGFzczogTXlFcnJvckhhbmRsZXJ9XVxuICogfSlcbiAqIGNsYXNzIE15TW9kdWxlIHt9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIEVycm9ySGFuZGxlciB7XG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF9jb25zb2xlOiBDb25zb2xlID0gY29uc29sZTtcblxuICBoYW5kbGVFcnJvcihlcnJvcjogYW55KTogdm9pZCB7XG4gICAgY29uc3Qgb3JpZ2luYWxFcnJvciA9IHRoaXMuX2ZpbmRPcmlnaW5hbEVycm9yKGVycm9yKTtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5fZmluZENvbnRleHQoZXJyb3IpO1xuICAgIC8vIE5vdGU6IEJyb3dzZXIgY29uc29sZXMgc2hvdyB0aGUgcGxhY2UgZnJvbSB3aGVyZSBjb25zb2xlLmVycm9yIHdhcyBjYWxsZWQuXG4gICAgLy8gV2UgY2FuIHVzZSB0aGlzIHRvIGdpdmUgdXNlcnMgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZXJyb3IuXG4gICAgY29uc3QgZXJyb3JMb2dnZXIgPSBnZXRFcnJvckxvZ2dlcihlcnJvcik7XG5cbiAgICBlcnJvckxvZ2dlcih0aGlzLl9jb25zb2xlLCBgRVJST1JgLCBlcnJvcik7XG4gICAgaWYgKG9yaWdpbmFsRXJyb3IpIHtcbiAgICAgIGVycm9yTG9nZ2VyKHRoaXMuX2NvbnNvbGUsIGBPUklHSU5BTCBFUlJPUmAsIG9yaWdpbmFsRXJyb3IpO1xuICAgIH1cbiAgICBpZiAoY29udGV4dCkge1xuICAgICAgZXJyb3JMb2dnZXIodGhpcy5fY29uc29sZSwgJ0VSUk9SIENPTlRFWFQnLCBjb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9maW5kQ29udGV4dChlcnJvcjogYW55KTogYW55IHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBnZXREZWJ1Z0NvbnRleHQoZXJyb3IpID8gZ2V0RGVidWdDb250ZXh0KGVycm9yKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZpbmRDb250ZXh0KGdldE9yaWdpbmFsRXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2ZpbmRPcmlnaW5hbEVycm9yKGVycm9yOiBFcnJvcik6IGFueSB7XG4gICAgbGV0IGUgPSBnZXRPcmlnaW5hbEVycm9yKGVycm9yKTtcbiAgICB3aGlsZSAoZSAmJiBnZXRPcmlnaW5hbEVycm9yKGUpKSB7XG4gICAgICBlID0gZ2V0T3JpZ2luYWxFcnJvcihlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcHBlZEVycm9yKG1lc3NhZ2U6IHN0cmluZywgb3JpZ2luYWxFcnJvcjogYW55KTogRXJyb3Ige1xuICBjb25zdCBtc2cgPVxuICAgICAgYCR7bWVzc2FnZX0gY2F1c2VkIGJ5OiAke29yaWdpbmFsRXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IG9yaWdpbmFsRXJyb3IubWVzc2FnZTogb3JpZ2luYWxFcnJvciB9YDtcbiAgY29uc3QgZXJyb3IgPSBFcnJvcihtc2cpO1xuICAoZXJyb3IgYXMgYW55KVtFUlJPUl9PUklHSU5BTF9FUlJPUl0gPSBvcmlnaW5hbEVycm9yO1xuICByZXR1cm4gZXJyb3I7XG59XG4iXX0=