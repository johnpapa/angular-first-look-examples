/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Pipe } from '@angular/core';
import { NgLocalization, getPluralCategory } from '../i18n/localization';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
var _INTERPOLATION_REGEXP = /#/g;
/**
 * @ngModule CommonModule
 * @description
 *
 * Maps a value to a string that pluralizes the value according to locale rules.
 *
 *  ## Example
 *
 * {@example common/pipes/ts/i18n_pipe.ts region='I18nPluralPipeComponent'}
 *
 * @experimental
 */
var I18nPluralPipe = /** @class */ (function () {
    function I18nPluralPipe(_localization) {
        this._localization = _localization;
    }
    /**
     * @param value the number to be formatted
     * @param pluralMap an object that mimics the ICU format, see
     * http://userguide.icu-project.org/formatparse/messages.
     * @param locale a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
     * default).
     */
    I18nPluralPipe.prototype.transform = function (value, pluralMap, locale) {
        if (value == null)
            return '';
        if (typeof pluralMap !== 'object' || pluralMap === null) {
            throw invalidPipeArgumentError(I18nPluralPipe, pluralMap);
        }
        var key = getPluralCategory(value, Object.keys(pluralMap), this._localization, locale);
        return pluralMap[key].replace(_INTERPOLATION_REGEXP, value.toString());
    };
    I18nPluralPipe.decorators = [
        { type: Pipe, args: [{ name: 'i18nPlural', pure: true },] }
    ];
    /** @nocollapse */
    I18nPluralPipe.ctorParameters = function () { return [
        { type: NgLocalization }
    ]; };
    return I18nPluralPipe;
}());
export { I18nPluralPipe };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wbHVyYWxfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvaTE4bl9wbHVyYWxfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQVksSUFBSSxFQUFnQixNQUFNLGVBQWUsQ0FBQztBQUM3RCxPQUFPLEVBQUMsY0FBYyxFQUFFLGlCQUFpQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdkUsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFFdkUsSUFBTSxxQkFBcUIsR0FBVyxJQUFJLENBQUM7QUFFM0M7Ozs7Ozs7Ozs7O0dBV0c7QUFDSDtJQUVFLHdCQUFvQixhQUE2QjtRQUE3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7SUFBRyxDQUFDO0lBRXJEOzs7Ozs7T0FNRztJQUNILGtDQUFTLEdBQVQsVUFBVSxLQUFhLEVBQUUsU0FBb0MsRUFBRSxNQUFlO1FBQzVFLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7WUFBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBRTdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sU0FBUyxLQUFLLFFBQVEsSUFBSSxTQUFTLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN4RCxNQUFNLHdCQUF3QixDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBRUQsSUFBTSxHQUFHLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV6RixNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUN6RSxDQUFDOztnQkFyQkYsSUFBSSxTQUFDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDOzs7O2dCQWpCOUIsY0FBYzs7SUF1Q3RCLHFCQUFDO0NBQUEsQUF0QkQsSUFzQkM7U0FyQlksY0FBYyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMT0NBTEVfSUQsIFBpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtOZ0xvY2FsaXphdGlvbiwgZ2V0UGx1cmFsQ2F0ZWdvcnl9IGZyb20gJy4uL2kxOG4vbG9jYWxpemF0aW9uJztcbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5cbmNvbnN0IF9JTlRFUlBPTEFUSU9OX1JFR0VYUDogUmVnRXhwID0gLyMvZztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBNYXBzIGEgdmFsdWUgdG8gYSBzdHJpbmcgdGhhdCBwbHVyYWxpemVzIHRoZSB2YWx1ZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqICAjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9pMThuX3BpcGUudHMgcmVnaW9uPSdJMThuUGx1cmFsUGlwZUNvbXBvbmVudCd9XG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5AUGlwZSh7bmFtZTogJ2kxOG5QbHVyYWwnLCBwdXJlOiB0cnVlfSlcbmV4cG9ydCBjbGFzcyBJMThuUGx1cmFsUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9sb2NhbGl6YXRpb246IE5nTG9jYWxpemF0aW9uKSB7fVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWUgdGhlIG51bWJlciB0byBiZSBmb3JtYXR0ZWRcbiAgICogQHBhcmFtIHBsdXJhbE1hcCBhbiBvYmplY3QgdGhhdCBtaW1pY3MgdGhlIElDVSBmb3JtYXQsIHNlZVxuICAgKiBodHRwOi8vdXNlcmd1aWRlLmljdS1wcm9qZWN0Lm9yZy9mb3JtYXRwYXJzZS9tZXNzYWdlcy5cbiAgICogQHBhcmFtIGxvY2FsZSBhIGBzdHJpbmdgIGRlZmluaW5nIHRoZSBsb2NhbGUgdG8gdXNlICh1c2VzIHRoZSBjdXJyZW50IHtAbGluayBMT0NBTEVfSUR9IGJ5XG4gICAqIGRlZmF1bHQpLlxuICAgKi9cbiAgdHJhbnNmb3JtKHZhbHVlOiBudW1iZXIsIHBsdXJhbE1hcDoge1tjb3VudDogc3RyaW5nXTogc3RyaW5nfSwgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuICcnO1xuXG4gICAgaWYgKHR5cGVvZiBwbHVyYWxNYXAgIT09ICdvYmplY3QnIHx8IHBsdXJhbE1hcCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKEkxOG5QbHVyYWxQaXBlLCBwbHVyYWxNYXApO1xuICAgIH1cblxuICAgIGNvbnN0IGtleSA9IGdldFBsdXJhbENhdGVnb3J5KHZhbHVlLCBPYmplY3Qua2V5cyhwbHVyYWxNYXApLCB0aGlzLl9sb2NhbGl6YXRpb24sIGxvY2FsZSk7XG5cbiAgICByZXR1cm4gcGx1cmFsTWFwW2tleV0ucmVwbGFjZShfSU5URVJQT0xBVElPTl9SRUdFWFAsIHZhbHVlLnRvU3RyaW5nKCkpO1xuICB9XG59XG4iXX0=