/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Pipe } from '@angular/core';
/**
 * @ngModule CommonModule
 * @description
 *
 * Converts value into string using `JSON.stringify`. Useful for debugging.
 *
 * ### Example
 * {@example common/pipes/ts/json_pipe.ts region='JsonPipe'}
 *
 *
 */
var JsonPipe = /** @class */ (function () {
    function JsonPipe() {
    }
    JsonPipe.prototype.transform = function (value) { return JSON.stringify(value, null, 2); };
    JsonPipe.decorators = [
        { type: Pipe, args: [{ name: 'json', pure: false },] }
    ];
    return JsonPipe;
}());
export { JsonPipe };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbl9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9waXBlcy9qc29uX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFFbEQ7Ozs7Ozs7Ozs7R0FVRztBQUNIO0lBQUE7SUFHQSxDQUFDO0lBREMsNEJBQVMsR0FBVCxVQUFVLEtBQVUsSUFBWSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Z0JBRnpFLElBQUksU0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQzs7SUFHakMsZUFBQztDQUFBLEFBSEQsSUFHQztTQUZZLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UGlwZSwgUGlwZVRyYW5zZm9ybX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQ29udmVydHMgdmFsdWUgaW50byBzdHJpbmcgdXNpbmcgYEpTT04uc3RyaW5naWZ5YC4gVXNlZnVsIGZvciBkZWJ1Z2dpbmcuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvanNvbl9waXBlLnRzIHJlZ2lvbj0nSnNvblBpcGUnfVxuICpcbiAqXG4gKi9cbkBQaXBlKHtuYW1lOiAnanNvbicsIHB1cmU6IGZhbHNlfSlcbmV4cG9ydCBjbGFzcyBKc29uUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IGFueSk6IHN0cmluZyB7IHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgbnVsbCwgMik7IH1cbn1cbiJdfQ==