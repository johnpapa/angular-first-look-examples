/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Input, IterableDiffers, KeyValueDiffers, Renderer2, ɵisListLikeIterable as isListLikeIterable, ɵstringify as stringify } from '@angular/core';
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```
 *     <some-element [ngClass]="'first second'">...</some-element>
 *
 *     <some-element [ngClass]="['first', 'second']">...</some-element>
 *
 *     <some-element [ngClass]="{'first': true, 'second': true, 'third': false}">...</some-element>
 *
 *     <some-element [ngClass]="stringExp|arrayExp|objExp">...</some-element>
 *
 *     <some-element [ngClass]="{'class1 class2 class3' : true}">...</some-element>
 * ```
 *
 * @description
 *
 * Adds and removes CSS classes on an HTML element.
 *
 * The CSS classes are updated as follows, depending on the type of the expression evaluation:
 * - `string` - the CSS classes listed in the string (space delimited) are added,
 * - `Array` - the CSS classes declared as Array elements are added,
 * - `Object` - keys are CSS classes that get added when the expression given in the value
 *              evaluates to a truthy value, otherwise they are removed.
 *
 *
 */
var NgClass = /** @class */ (function () {
    function NgClass(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
        this._iterableDiffers = _iterableDiffers;
        this._keyValueDiffers = _keyValueDiffers;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this._initialClasses = [];
    }
    Object.defineProperty(NgClass.prototype, "klass", {
        set: function (v) {
            this._removeClasses(this._initialClasses);
            this._initialClasses = typeof v === 'string' ? v.split(/\s+/) : [];
            this._applyClasses(this._initialClasses);
            this._applyClasses(this._rawClass);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgClass.prototype, "ngClass", {
        set: function (v) {
            this._removeClasses(this._rawClass);
            this._applyClasses(this._initialClasses);
            this._iterableDiffer = null;
            this._keyValueDiffer = null;
            this._rawClass = typeof v === 'string' ? v.split(/\s+/) : v;
            if (this._rawClass) {
                if (isListLikeIterable(this._rawClass)) {
                    this._iterableDiffer = this._iterableDiffers.find(this._rawClass).create();
                }
                else {
                    this._keyValueDiffer = this._keyValueDiffers.find(this._rawClass).create();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    NgClass.prototype.ngDoCheck = function () {
        if (this._iterableDiffer) {
            var iterableChanges = this._iterableDiffer.diff(this._rawClass);
            if (iterableChanges) {
                this._applyIterableChanges(iterableChanges);
            }
        }
        else if (this._keyValueDiffer) {
            var keyValueChanges = this._keyValueDiffer.diff(this._rawClass);
            if (keyValueChanges) {
                this._applyKeyValueChanges(keyValueChanges);
            }
        }
    };
    NgClass.prototype._applyKeyValueChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) { return _this._toggleClass(record.key, record.currentValue); });
        changes.forEachChangedItem(function (record) { return _this._toggleClass(record.key, record.currentValue); });
        changes.forEachRemovedItem(function (record) {
            if (record.previousValue) {
                _this._toggleClass(record.key, false);
            }
        });
    };
    NgClass.prototype._applyIterableChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) {
            if (typeof record.item === 'string') {
                _this._toggleClass(record.item, true);
            }
            else {
                throw new Error("NgClass can only toggle CSS classes expressed as strings, got " + stringify(record.item));
            }
        });
        changes.forEachRemovedItem(function (record) { return _this._toggleClass(record.item, false); });
    };
    /**
     * Applies a collection of CSS classes to the DOM element.
     *
     * For argument of type Set and Array CSS class names contained in those collections are always
     * added.
     * For argument of type Map CSS class name in the map's key is toggled based on the value (added
     * for truthy and removed for falsy).
     */
    NgClass.prototype._applyClasses = function (rawClassVal) {
        var _this = this;
        if (rawClassVal) {
            if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
                rawClassVal.forEach(function (klass) { return _this._toggleClass(klass, true); });
            }
            else {
                Object.keys(rawClassVal).forEach(function (klass) { return _this._toggleClass(klass, !!rawClassVal[klass]); });
            }
        }
    };
    /**
     * Removes a collection of CSS classes from the DOM element. This is mostly useful for cleanup
     * purposes.
     */
    NgClass.prototype._removeClasses = function (rawClassVal) {
        var _this = this;
        if (rawClassVal) {
            if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
                rawClassVal.forEach(function (klass) { return _this._toggleClass(klass, false); });
            }
            else {
                Object.keys(rawClassVal).forEach(function (klass) { return _this._toggleClass(klass, false); });
            }
        }
    };
    NgClass.prototype._toggleClass = function (klass, enabled) {
        var _this = this;
        klass = klass.trim();
        if (klass) {
            klass.split(/\s+/g).forEach(function (klass) {
                if (enabled) {
                    _this._renderer.addClass(_this._ngEl.nativeElement, klass);
                }
                else {
                    _this._renderer.removeClass(_this._ngEl.nativeElement, klass);
                }
            });
        }
    };
    NgClass.decorators = [
        { type: Directive, args: [{ selector: '[ngClass]' },] }
    ];
    /** @nocollapse */
    NgClass.ctorParameters = function () { return [
        { type: IterableDiffers },
        { type: KeyValueDiffers },
        { type: ElementRef },
        { type: Renderer2 }
    ]; };
    NgClass.propDecorators = {
        klass: [{ type: Input, args: ['class',] }],
        ngClass: [{ type: Input }]
    };
    return NgClass;
}());
export { NgClass };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBVyxVQUFVLEVBQUUsS0FBSyxFQUFtQyxlQUFlLEVBQW1DLGVBQWUsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsVUFBVSxJQUFJLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV2UDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMkJHO0FBQ0g7SUFPRSxpQkFDWSxnQkFBaUMsRUFBVSxnQkFBaUMsRUFDNUUsS0FBaUIsRUFBVSxTQUFvQjtRQUQvQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWlCO1FBQVUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFpQjtRQUM1RSxVQUFLLEdBQUwsS0FBSyxDQUFZO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBVztRQUxuRCxvQkFBZSxHQUFhLEVBQUUsQ0FBQztJQUt1QixDQUFDO0lBRS9ELHNCQUNJLDBCQUFLO2FBRFQsVUFDVSxDQUFTO1lBQ2pCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDbkUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckMsQ0FBQzs7O09BQUE7SUFFRCxzQkFDSSw0QkFBTzthQURY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QUFDLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDOztnQkF0SEYsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBQzs7OztnQkE5QjhDLGVBQWU7Z0JBQW1DLGVBQWU7Z0JBQXJILFVBQVU7Z0JBQTZHLFNBQVM7Ozt3QkF5Q3pKLEtBQUssU0FBQyxPQUFPOzBCQVFiLEtBQUs7O0lBb0dSLGNBQUM7Q0FBQSxBQXZIRCxJQXVIQztTQXRIWSxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgRWxlbWVudFJlZiwgSW5wdXQsIEl0ZXJhYmxlQ2hhbmdlcywgSXRlcmFibGVEaWZmZXIsIEl0ZXJhYmxlRGlmZmVycywgS2V5VmFsdWVDaGFuZ2VzLCBLZXlWYWx1ZURpZmZlciwgS2V5VmFsdWVEaWZmZXJzLCBSZW5kZXJlcjIsIMm1aXNMaXN0TGlrZUl0ZXJhYmxlIGFzIGlzTGlzdExpa2VJdGVyYWJsZSwgybVzdHJpbmdpZnkgYXMgc3RyaW5naWZ5fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwiJ2ZpcnN0IHNlY29uZCdcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJbJ2ZpcnN0JywgJ3NlY29uZCddXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwieydmaXJzdCc6IHRydWUsICdzZWNvbmQnOiB0cnVlLCAndGhpcmQnOiBmYWxzZX1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJzdHJpbmdFeHB8YXJyYXlFeHB8b2JqRXhwXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwieydjbGFzczEgY2xhc3MyIGNsYXNzMycgOiB0cnVlfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQWRkcyBhbmQgcmVtb3ZlcyBDU1MgY2xhc3NlcyBvbiBhbiBIVE1MIGVsZW1lbnQuXG4gKlxuICogVGhlIENTUyBjbGFzc2VzIGFyZSB1cGRhdGVkIGFzIGZvbGxvd3MsIGRlcGVuZGluZyBvbiB0aGUgdHlwZSBvZiB0aGUgZXhwcmVzc2lvbiBldmFsdWF0aW9uOlxuICogLSBgc3RyaW5nYCAtIHRoZSBDU1MgY2xhc3NlcyBsaXN0ZWQgaW4gdGhlIHN0cmluZyAoc3BhY2UgZGVsaW1pdGVkKSBhcmUgYWRkZWQsXG4gKiAtIGBBcnJheWAgLSB0aGUgQ1NTIGNsYXNzZXMgZGVjbGFyZWQgYXMgQXJyYXkgZWxlbWVudHMgYXJlIGFkZGVkLFxuICogLSBgT2JqZWN0YCAtIGtleXMgYXJlIENTUyBjbGFzc2VzIHRoYXQgZ2V0IGFkZGVkIHdoZW4gdGhlIGV4cHJlc3Npb24gZ2l2ZW4gaW4gdGhlIHZhbHVlXG4gKiAgICAgICAgICAgICAgZXZhbHVhdGVzIHRvIGEgdHJ1dGh5IHZhbHVlLCBvdGhlcndpc2UgdGhleSBhcmUgcmVtb3ZlZC5cbiAqXG4gKlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ0NsYXNzXSd9KVxuZXhwb3J0IGNsYXNzIE5nQ2xhc3MgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgcHJpdmF0ZSBfaXRlcmFibGVEaWZmZXI6IEl0ZXJhYmxlRGlmZmVyPHN0cmluZz58bnVsbDtcbiAgcHJpdmF0ZSBfa2V5VmFsdWVEaWZmZXI6IEtleVZhbHVlRGlmZmVyPHN0cmluZywgYW55PnxudWxsO1xuICBwcml2YXRlIF9pbml0aWFsQ2xhc3Nlczogc3RyaW5nW10gPSBbXTtcbiAgcHJpdmF0ZSBfcmF3Q2xhc3M6IHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2xhc3M6IHN0cmluZ106IGFueX07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9pdGVyYWJsZURpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycywgcHJpdmF0ZSBfa2V5VmFsdWVEaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMsXG4gICAgICBwcml2YXRlIF9uZ0VsOiBFbGVtZW50UmVmLCBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIyKSB7fVxuXG4gIEBJbnB1dCgnY2xhc3MnKVxuICBzZXQga2xhc3Modjogc3RyaW5nKSB7XG4gICAgdGhpcy5fcmVtb3ZlQ2xhc3Nlcyh0aGlzLl9pbml0aWFsQ2xhc3Nlcyk7XG4gICAgdGhpcy5faW5pdGlhbENsYXNzZXMgPSB0eXBlb2YgdiA9PT0gJ3N0cmluZycgPyB2LnNwbGl0KC9cXHMrLykgOiBbXTtcbiAgICB0aGlzLl9hcHBseUNsYXNzZXModGhpcy5faW5pdGlhbENsYXNzZXMpO1xuICAgIHRoaXMuX2FwcGx5Q2xhc3Nlcyh0aGlzLl9yYXdDbGFzcyk7XG4gIH1cblxuICBASW5wdXQoKVxuICBzZXQgbmdDbGFzcyh2OiBzdHJpbmd8c3RyaW5nW118U2V0PHN0cmluZz58e1trbGFzczogc3RyaW5nXTogYW55fSkge1xuICAgIHRoaXMuX3JlbW92ZUNsYXNzZXModGhpcy5fcmF3Q2xhc3MpO1xuICAgIHRoaXMuX2FwcGx5Q2xhc3Nlcyh0aGlzLl9pbml0aWFsQ2xhc3Nlcyk7XG5cbiAgICB0aGlzLl9pdGVyYWJsZURpZmZlciA9IG51bGw7XG4gICAgdGhpcy5fa2V5VmFsdWVEaWZmZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fcmF3Q2xhc3MgPSB0eXBlb2YgdiA9PT0gJ3N0cmluZycgPyB2LnNwbGl0KC9cXHMrLykgOiB2O1xuXG4gICAgaWYgKHRoaXMuX3Jhd0NsYXNzKSB7XG4gICAgICBpZiAoaXNMaXN0TGlrZUl0ZXJhYmxlKHRoaXMuX3Jhd0NsYXNzKSkge1xuICAgICAgICB0aGlzLl9pdGVyYWJsZURpZmZlciA9IHRoaXMuX2l0ZXJhYmxlRGlmZmVycy5maW5kKHRoaXMuX3Jhd0NsYXNzKS5jcmVhdGUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2tleVZhbHVlRGlmZmVyID0gdGhpcy5fa2V5VmFsdWVEaWZmZXJzLmZpbmQodGhpcy5fcmF3Q2xhc3MpLmNyZWF0ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faXRlcmFibGVEaWZmZXIpIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlQ2hhbmdlcyA9IHRoaXMuX2l0ZXJhYmxlRGlmZmVyLmRpZmYodGhpcy5fcmF3Q2xhc3MgYXMgc3RyaW5nW10pO1xuICAgICAgaWYgKGl0ZXJhYmxlQ2hhbmdlcykge1xuICAgICAgICB0aGlzLl9hcHBseUl0ZXJhYmxlQ2hhbmdlcyhpdGVyYWJsZUNoYW5nZXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fa2V5VmFsdWVEaWZmZXIpIHtcbiAgICAgIGNvbnN0IGtleVZhbHVlQ2hhbmdlcyA9IHRoaXMuX2tleVZhbHVlRGlmZmVyLmRpZmYodGhpcy5fcmF3Q2xhc3MgYXN7W2s6IHN0cmluZ106IGFueX0pO1xuICAgICAgaWYgKGtleVZhbHVlQ2hhbmdlcykge1xuICAgICAgICB0aGlzLl9hcHBseUtleVZhbHVlQ2hhbmdlcyhrZXlWYWx1ZUNoYW5nZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5S2V5VmFsdWVDaGFuZ2VzKGNoYW5nZXM6IEtleVZhbHVlQ2hhbmdlczxzdHJpbmcsIGFueT4pOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSkpO1xuICAgIGNoYW5nZXMuZm9yRWFjaENoYW5nZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpKTtcbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbSgocmVjb3JkKSA9PiB7XG4gICAgICBpZiAocmVjb3JkLnByZXZpb3VzVmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLmtleSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlJdGVyYWJsZUNoYW5nZXMoY2hhbmdlczogSXRlcmFibGVDaGFuZ2VzPHN0cmluZz4pOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKHJlY29yZCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiByZWNvcmQuaXRlbSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLml0ZW0sIHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYE5nQ2xhc3MgY2FuIG9ubHkgdG9nZ2xlIENTUyBjbGFzc2VzIGV4cHJlc3NlZCBhcyBzdHJpbmdzLCBnb3QgJHtzdHJpbmdpZnkocmVjb3JkLml0ZW0pfWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLml0ZW0sIGZhbHNlKSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyBhIGNvbGxlY3Rpb24gb2YgQ1NTIGNsYXNzZXMgdG8gdGhlIERPTSBlbGVtZW50LlxuICAgKlxuICAgKiBGb3IgYXJndW1lbnQgb2YgdHlwZSBTZXQgYW5kIEFycmF5IENTUyBjbGFzcyBuYW1lcyBjb250YWluZWQgaW4gdGhvc2UgY29sbGVjdGlvbnMgYXJlIGFsd2F5c1xuICAgKiBhZGRlZC5cbiAgICogRm9yIGFyZ3VtZW50IG9mIHR5cGUgTWFwIENTUyBjbGFzcyBuYW1lIGluIHRoZSBtYXAncyBrZXkgaXMgdG9nZ2xlZCBiYXNlZCBvbiB0aGUgdmFsdWUgKGFkZGVkXG4gICAqIGZvciB0cnV0aHkgYW5kIHJlbW92ZWQgZm9yIGZhbHN5KS5cbiAgICovXG4gIHByaXZhdGUgX2FwcGx5Q2xhc3NlcyhyYXdDbGFzc1ZhbDogc3RyaW5nW118U2V0PHN0cmluZz58e1trbGFzczogc3RyaW5nXTogYW55fSkge1xuICAgIGlmIChyYXdDbGFzc1ZhbCkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmF3Q2xhc3NWYWwpIHx8IHJhd0NsYXNzVmFsIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICg8YW55PnJhd0NsYXNzVmFsKS5mb3JFYWNoKChrbGFzczogc3RyaW5nKSA9PiB0aGlzLl90b2dnbGVDbGFzcyhrbGFzcywgdHJ1ZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgT2JqZWN0LmtleXMocmF3Q2xhc3NWYWwpLmZvckVhY2goa2xhc3MgPT4gdGhpcy5fdG9nZ2xlQ2xhc3Moa2xhc3MsICEhcmF3Q2xhc3NWYWxba2xhc3NdKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBjb2xsZWN0aW9uIG9mIENTUyBjbGFzc2VzIGZyb20gdGhlIERPTSBlbGVtZW50LiBUaGlzIGlzIG1vc3RseSB1c2VmdWwgZm9yIGNsZWFudXBcbiAgICogcHVycG9zZXMuXG4gICAqL1xuICBwcml2YXRlIF9yZW1vdmVDbGFzc2VzKHJhd0NsYXNzVmFsOiBzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tsYXNzOiBzdHJpbmddOiBhbnl9KSB7XG4gICAgaWYgKHJhd0NsYXNzVmFsKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShyYXdDbGFzc1ZhbCkgfHwgcmF3Q2xhc3NWYWwgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgKDxhbnk+cmF3Q2xhc3NWYWwpLmZvckVhY2goKGtsYXNzOiBzdHJpbmcpID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGtsYXNzLCBmYWxzZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgT2JqZWN0LmtleXMocmF3Q2xhc3NWYWwpLmZvckVhY2goa2xhc3MgPT4gdGhpcy5fdG9nZ2xlQ2xhc3Moa2xhc3MsIGZhbHNlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdG9nZ2xlQ2xhc3Moa2xhc3M6IHN0cmluZywgZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGtsYXNzID0ga2xhc3MudHJpbSgpO1xuICAgIGlmIChrbGFzcykge1xuICAgICAga2xhc3Muc3BsaXQoL1xccysvZykuZm9yRWFjaChrbGFzcyA9PiB7XG4gICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgdGhpcy5fcmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCBrbGFzcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCBrbGFzcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuIl19