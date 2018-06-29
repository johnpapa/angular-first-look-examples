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
import { looseIdentical, stringify } from '../../util';
import { isJsObject } from '../change_detection_util';
/**
 * @template K, V
 */
export class DefaultKeyValueDifferFactory {
    constructor() { }
    /**
     * @param {?} obj
     * @return {?}
     */
    supports(obj) { return obj instanceof Map || isJsObject(obj); }
    /**
     * @template K, V
     * @return {?}
     */
    create() { return new DefaultKeyValueDiffer(); }
}
/**
 * @template K, V
 */
export class DefaultKeyValueDiffer {
    constructor() {
        this._records = new Map();
        this._mapHead = null;
        this._appendAfter = null;
        this._previousMapHead = null;
        this._changesHead = null;
        this._changesTail = null;
        this._additionsHead = null;
        this._additionsTail = null;
        this._removalsHead = null;
        this._removalsTail = null;
    }
    /**
     * @return {?}
     */
    get isDirty() {
        return this._additionsHead !== null || this._changesHead !== null ||
            this._removalsHead !== null;
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    forEachItem(fn) {
        let /** @type {?} */ record;
        for (record = this._mapHead; record !== null; record = record._next) {
            fn(record);
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    forEachPreviousItem(fn) {
        let /** @type {?} */ record;
        for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
            fn(record);
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    forEachChangedItem(fn) {
        let /** @type {?} */ record;
        for (record = this._changesHead; record !== null; record = record._nextChanged) {
            fn(record);
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    forEachAddedItem(fn) {
        let /** @type {?} */ record;
        for (record = this._additionsHead; record !== null; record = record._nextAdded) {
            fn(record);
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    forEachRemovedItem(fn) {
        let /** @type {?} */ record;
        for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
            fn(record);
        }
    }
    /**
     * @param {?=} map
     * @return {?}
     */
    diff(map) {
        if (!map) {
            map = new Map();
        }
        else if (!(map instanceof Map || isJsObject(map))) {
            throw new Error(`Error trying to diff '${stringify(map)}'. Only maps and objects are allowed`);
        }
        return this.check(map) ? this : null;
    }
    /**
     * @return {?}
     */
    onDestroy() { }
    /**
     * Check the current state of the map vs the previous.
     * The algorithm is optimised for when the keys do no change.
     * @param {?} map
     * @return {?}
     */
    check(map) {
        this._reset();
        let /** @type {?} */ insertBefore = this._mapHead;
        this._appendAfter = null;
        this._forEach(map, (value, key) => {
            if (insertBefore && insertBefore.key === key) {
                this._maybeAddToChanges(insertBefore, value);
                this._appendAfter = insertBefore;
                insertBefore = insertBefore._next;
            }
            else {
                const /** @type {?} */ record = this._getOrCreateRecordForKey(key, value);
                insertBefore = this._insertBeforeOrAppend(insertBefore, record);
            }
        });
        // Items remaining at the end of the list have been deleted
        if (insertBefore) {
            if (insertBefore._prev) {
                insertBefore._prev._next = null;
            }
            this._removalsHead = insertBefore;
            for (let /** @type {?} */ record = insertBefore; record !== null; record = record._nextRemoved) {
                if (record === this._mapHead) {
                    this._mapHead = null;
                }
                this._records.delete(record.key);
                record._nextRemoved = record._next;
                record.previousValue = record.currentValue;
                record.currentValue = null;
                record._prev = null;
                record._next = null;
            }
        }
        // Make sure tails have no next records from previous runs
        if (this._changesTail)
            this._changesTail._nextChanged = null;
        if (this._additionsTail)
            this._additionsTail._nextAdded = null;
        return this.isDirty;
    }
    /**
     * Inserts a record before `before` or append at the end of the list when `before` is null.
     *
     * Notes:
     * - This method appends at `this._appendAfter`,
     * - This method updates `this._appendAfter`,
     * - The return value is the new value for the insertion pointer.
     * @param {?} before
     * @param {?} record
     * @return {?}
     */
    _insertBeforeOrAppend(before, record) {
        if (before) {
            const /** @type {?} */ prev = before._prev;
            record._next = before;
            record._prev = prev;
            before._prev = record;
            if (prev) {
                prev._next = record;
            }
            if (before === this._mapHead) {
                this._mapHead = record;
            }
            this._appendAfter = before;
            return before;
        }
        if (this._appendAfter) {
            this._appendAfter._next = record;
            record._prev = this._appendAfter;
        }
        else {
            this._mapHead = record;
        }
        this._appendAfter = record;
        return null;
    }
    /**
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    _getOrCreateRecordForKey(key, value) {
        if (this._records.has(key)) {
            const /** @type {?} */ record = /** @type {?} */ ((this._records.get(key)));
            this._maybeAddToChanges(record, value);
            const /** @type {?} */ prev = record._prev;
            const /** @type {?} */ next = record._next;
            if (prev) {
                prev._next = next;
            }
            if (next) {
                next._prev = prev;
            }
            record._next = null;
            record._prev = null;
            return record;
        }
        const /** @type {?} */ record = new KeyValueChangeRecord_(key);
        this._records.set(key, record);
        record.currentValue = value;
        this._addToAdditions(record);
        return record;
    }
    /**
     * \@internal
     * @return {?}
     */
    _reset() {
        if (this.isDirty) {
            let /** @type {?} */ record;
            // let `_previousMapHead` contain the state of the map before the changes
            this._previousMapHead = this._mapHead;
            for (record = this._previousMapHead; record !== null; record = record._next) {
                record._nextPrevious = record._next;
            }
            // Update `record.previousValue` with the value of the item before the changes
            // We need to update all changed items (that's those which have been added and changed)
            for (record = this._changesHead; record !== null; record = record._nextChanged) {
                record.previousValue = record.currentValue;
            }
            for (record = this._additionsHead; record != null; record = record._nextAdded) {
                record.previousValue = record.currentValue;
            }
            this._changesHead = this._changesTail = null;
            this._additionsHead = this._additionsTail = null;
            this._removalsHead = null;
        }
    }
    /**
     * @param {?} record
     * @param {?} newValue
     * @return {?}
     */
    _maybeAddToChanges(record, newValue) {
        if (!looseIdentical(newValue, record.currentValue)) {
            record.previousValue = record.currentValue;
            record.currentValue = newValue;
            this._addToChanges(record);
        }
    }
    /**
     * @param {?} record
     * @return {?}
     */
    _addToAdditions(record) {
        if (this._additionsHead === null) {
            this._additionsHead = this._additionsTail = record;
        }
        else {
            /** @type {?} */ ((this._additionsTail))._nextAdded = record;
            this._additionsTail = record;
        }
    }
    /**
     * @param {?} record
     * @return {?}
     */
    _addToChanges(record) {
        if (this._changesHead === null) {
            this._changesHead = this._changesTail = record;
        }
        else {
            /** @type {?} */ ((this._changesTail))._nextChanged = record;
            this._changesTail = record;
        }
    }
    /**
     * \@internal
     * @template K, V
     * @param {?} obj
     * @param {?} fn
     * @return {?}
     */
    _forEach(obj, fn) {
        if (obj instanceof Map) {
            obj.forEach(fn);
        }
        else {
            Object.keys(obj).forEach(k => fn(obj[k], k));
        }
    }
}
function DefaultKeyValueDiffer_tsickle_Closure_declarations() {
    /** @type {?} */
    DefaultKeyValueDiffer.prototype._records;
    /** @type {?} */
    DefaultKeyValueDiffer.prototype._mapHead;
    /** @type {?} */
    DefaultKeyValueDiffer.prototype._appendAfter;
    /** @type {?} */
    DefaultKeyValueDiffer.prototype._previousMapHead;
    /** @type {?} */
    DefaultKeyValueDiffer.prototype._changesHead;
    /** @type {?} */
    DefaultKeyValueDiffer.prototype._changesTail;
    /** @type {?} */
    DefaultKeyValueDiffer.prototype._additionsHead;
    /** @type {?} */
    DefaultKeyValueDiffer.prototype._additionsTail;
    /** @type {?} */
    DefaultKeyValueDiffer.prototype._removalsHead;
    /** @type {?} */
    DefaultKeyValueDiffer.prototype._removalsTail;
}
/**
 * @template K, V
 */
class KeyValueChangeRecord_ {
    /**
     * @param {?} key
     */
    constructor(key) {
        this.key = key;
        this.previousValue = null;
        this.currentValue = null;
        /**
         * \@internal
         */
        this._nextPrevious = null;
        /**
         * \@internal
         */
        this._next = null;
        /**
         * \@internal
         */
        this._prev = null;
        /**
         * \@internal
         */
        this._nextAdded = null;
        /**
         * \@internal
         */
        this._nextRemoved = null;
        /**
         * \@internal
         */
        this._nextChanged = null;
    }
}
function KeyValueChangeRecord__tsickle_Closure_declarations() {
    /** @type {?} */
    KeyValueChangeRecord_.prototype.previousValue;
    /** @type {?} */
    KeyValueChangeRecord_.prototype.currentValue;
    /**
     * \@internal
     * @type {?}
     */
    KeyValueChangeRecord_.prototype._nextPrevious;
    /**
     * \@internal
     * @type {?}
     */
    KeyValueChangeRecord_.prototype._next;
    /**
     * \@internal
     * @type {?}
     */
    KeyValueChangeRecord_.prototype._prev;
    /**
     * \@internal
     * @type {?}
     */
    KeyValueChangeRecord_.prototype._nextAdded;
    /**
     * \@internal
     * @type {?}
     */
    KeyValueChangeRecord_.prototype._nextRemoved;
    /**
     * \@internal
     * @type {?}
     */
    KeyValueChangeRecord_.prototype._nextChanged;
    /** @type {?} */
    KeyValueChangeRecord_.prototype.key;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdF9rZXl2YWx1ZV9kaWZmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9jaGFuZ2VfZGV0ZWN0aW9uL2RpZmZlcnMvZGVmYXVsdF9rZXl2YWx1ZV9kaWZmZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsY0FBYyxFQUFFLFNBQVMsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNyRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7Ozs7QUFJcEQsTUFBTTtJQUNKLGlCQUFnQjs7Ozs7SUFDaEIsUUFBUSxDQUFDLEdBQVEsSUFBYSxNQUFNLENBQUMsR0FBRyxZQUFZLEdBQUcsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTs7Ozs7SUFFN0UsTUFBTSxLQUFpQyxNQUFNLENBQUMsSUFBSSxxQkFBcUIsRUFBUSxDQUFDLEVBQUU7Q0FDbkY7Ozs7QUFFRCxNQUFNOzt3QkFDZSxJQUFJLEdBQUcsRUFBa0M7d0JBQ1AsSUFBSTs0QkFFQSxJQUFJO2dDQUNBLElBQUk7NEJBQ1IsSUFBSTs0QkFDSixJQUFJOzhCQUNGLElBQUk7OEJBQ0osSUFBSTs2QkFDTCxJQUFJOzZCQUNKLElBQUk7Ozs7O0lBRTlELElBQUksT0FBTztRQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLElBQUk7WUFDN0QsSUFBSSxDQUFDLGFBQWEsS0FBSyxJQUFJLENBQUM7S0FDakM7Ozs7O0lBRUQsV0FBVyxDQUFDLEVBQTJDO1FBQ3JELHFCQUFJLE1BQXdDLENBQUM7UUFDN0MsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxLQUFLLElBQUksRUFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFD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KipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7bG9vc2VJZGVudGljYWwsIHN0cmluZ2lmeX0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQge2lzSnNPYmplY3R9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb25fdXRpbCc7XG5pbXBvcnQge0tleVZhbHVlQ2hhbmdlUmVjb3JkLCBLZXlWYWx1ZUNoYW5nZXMsIEtleVZhbHVlRGlmZmVyLCBLZXlWYWx1ZURpZmZlckZhY3Rvcnl9IGZyb20gJy4va2V5dmFsdWVfZGlmZmVycyc7XG5cblxuZXhwb3J0IGNsYXNzIERlZmF1bHRLZXlWYWx1ZURpZmZlckZhY3Rvcnk8SywgVj4gaW1wbGVtZW50cyBLZXlWYWx1ZURpZmZlckZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcigpIHt9XG4gIHN1cHBvcnRzKG9iajogYW55KTogYm9vbGVhbiB7IHJldHVybiBvYmogaW5zdGFuY2VvZiBNYXAgfHwgaXNKc09iamVjdChvYmopOyB9XG5cbiAgY3JlYXRlPEssIFY+KCk6IEtleVZhbHVlRGlmZmVyPEssIFY+IHsgcmV0dXJuIG5ldyBEZWZhdWx0S2V5VmFsdWVEaWZmZXI8SywgVj4oKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVmYXVsdEtleVZhbHVlRGlmZmVyPEssIFY+IGltcGxlbWVudHMgS2V5VmFsdWVEaWZmZXI8SywgVj4sIEtleVZhbHVlQ2hhbmdlczxLLCBWPiB7XG4gIHByaXZhdGUgX3JlY29yZHMgPSBuZXcgTWFwPEssIEtleVZhbHVlQ2hhbmdlUmVjb3JkXzxLLCBWPj4oKTtcbiAgcHJpdmF0ZSBfbWFwSGVhZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmRfPEssIFY+fG51bGwgPSBudWxsO1xuICAvLyBfYXBwZW5kQWZ0ZXIgaXMgdXNlZCBpbiB0aGUgY2hlY2sgbG9vcFxuICBwcml2YXRlIF9hcHBlbmRBZnRlcjogS2V5VmFsdWVDaGFuZ2VSZWNvcmRfPEssIFY+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9wcmV2aW91c01hcEhlYWQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkXzxLLCBWPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfY2hhbmdlc0hlYWQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkXzxLLCBWPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfY2hhbmdlc1RhaWw6IEtleVZhbHVlQ2hhbmdlUmVjb3JkXzxLLCBWPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfYWRkaXRpb25zSGVhZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmRfPEssIFY+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9hZGRpdGlvbnNUYWlsOiBLZXlWYWx1ZUNoYW5nZVJlY29yZF88SywgVj58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX3JlbW92YWxzSGVhZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmRfPEssIFY+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9yZW1vdmFsc1RhaWw6IEtleVZhbHVlQ2hhbmdlUmVjb3JkXzxLLCBWPnxudWxsID0gbnVsbDtcblxuICBnZXQgaXNEaXJ0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fYWRkaXRpb25zSGVhZCAhPT0gbnVsbCB8fCB0aGlzLl9jaGFuZ2VzSGVhZCAhPT0gbnVsbCB8fFxuICAgICAgICB0aGlzLl9yZW1vdmFsc0hlYWQgIT09IG51bGw7XG4gIH1cblxuICBmb3JFYWNoSXRlbShmbjogKHI6IEtleVZhbHVlQ2hhbmdlUmVjb3JkPEssIFY+KSA9PiB2b2lkKSB7XG4gICAgbGV0IHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmRfPEssIFY+fG51bGw7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9tYXBIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dCkge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoUHJldmlvdXNJdGVtKGZuOiAocjogS2V5VmFsdWVDaGFuZ2VSZWNvcmQ8SywgVj4pID0+IHZvaWQpIHtcbiAgICBsZXQgcmVjb3JkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZF88SywgVj58bnVsbDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX3ByZXZpb3VzTWFwSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRQcmV2aW91cykge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoQ2hhbmdlZEl0ZW0oZm46IChyOiBLZXlWYWx1ZUNoYW5nZVJlY29yZDxLLCBWPikgPT4gdm9pZCkge1xuICAgIGxldCByZWNvcmQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkXzxLLCBWPnxudWxsO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5fY2hhbmdlc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0Q2hhbmdlZCkge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoQWRkZWRJdGVtKGZuOiAocjogS2V5VmFsdWVDaGFuZ2VSZWNvcmQ8SywgVj4pID0+IHZvaWQpIHtcbiAgICBsZXQgcmVjb3JkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZF88SywgVj58bnVsbDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2FkZGl0aW9uc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0QWRkZWQpIHtcbiAgICAgIGZuKHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgZm9yRWFjaFJlbW92ZWRJdGVtKGZuOiAocjogS2V5VmFsdWVDaGFuZ2VSZWNvcmQ8SywgVj4pID0+IHZvaWQpIHtcbiAgICBsZXQgcmVjb3JkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZF88SywgVj58bnVsbDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX3JlbW92YWxzSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRSZW1vdmVkKSB7XG4gICAgICBmbihyZWNvcmQpO1xuICAgIH1cbiAgfVxuXG4gIGRpZmYobWFwPzogTWFwPGFueSwgYW55Pnx7W2s6IHN0cmluZ106IGFueX18bnVsbCk6IGFueSB7XG4gICAgaWYgKCFtYXApIHtcbiAgICAgIG1hcCA9IG5ldyBNYXAoKTtcbiAgICB9IGVsc2UgaWYgKCEobWFwIGluc3RhbmNlb2YgTWFwIHx8IGlzSnNPYmplY3QobWFwKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRXJyb3IgdHJ5aW5nIHRvIGRpZmYgJyR7c3RyaW5naWZ5KG1hcCl9Jy4gT25seSBtYXBzIGFuZCBvYmplY3RzIGFyZSBhbGxvd2VkYCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY2hlY2sobWFwKSA/IHRoaXMgOiBudWxsO1xuICB9XG5cbiAgb25EZXN0cm95KCkge31cblxuICAvKipcbiAgICogQ2hlY2sgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIG1hcCB2cyB0aGUgcHJldmlvdXMuXG4gICAqIFRoZSBhbGdvcml0aG0gaXMgb3B0aW1pc2VkIGZvciB3aGVuIHRoZSBrZXlzIGRvIG5vIGNoYW5nZS5cbiAgICovXG4gIGNoZWNrKG1hcDogTWFwPGFueSwgYW55Pnx7W2s6IHN0cmluZ106IGFueX0pOiBib29sZWFuIHtcbiAgICB0aGlzLl9yZXNldCgpO1xuXG4gICAgbGV0IGluc2VydEJlZm9yZSA9IHRoaXMuX21hcEhlYWQ7XG4gICAgdGhpcy5fYXBwZW5kQWZ0ZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fZm9yRWFjaChtYXAsICh2YWx1ZTogYW55LCBrZXk6IGFueSkgPT4ge1xuICAgICAgaWYgKGluc2VydEJlZm9yZSAmJiBpbnNlcnRCZWZvcmUua2V5ID09PSBrZXkpIHtcbiAgICAgICAgdGhpcy5fbWF5YmVBZGRUb0NoYW5nZXMoaW5zZXJ0QmVmb3JlLCB2YWx1ZSk7XG4gICAgICAgIHRoaXMuX2FwcGVuZEFmdGVyID0gaW5zZXJ0QmVmb3JlO1xuICAgICAgICBpbnNlcnRCZWZvcmUgPSBpbnNlcnRCZWZvcmUuX25leHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZWNvcmQgPSB0aGlzLl9nZXRPckNyZWF0ZVJlY29yZEZvcktleShrZXksIHZhbHVlKTtcbiAgICAgICAgaW5zZXJ0QmVmb3JlID0gdGhpcy5faW5zZXJ0QmVmb3JlT3JBcHBlbmQoaW5zZXJ0QmVmb3JlLCByZWNvcmQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gSXRlbXMgcmVtYWluaW5nIGF0IHRoZSBlbmQgb2YgdGhlIGxpc3QgaGF2ZSBiZWVuIGRlbGV0ZWRcbiAgICBpZiAoaW5zZXJ0QmVmb3JlKSB7XG4gICAgICBpZiAoaW5zZXJ0QmVmb3JlLl9wcmV2KSB7XG4gICAgICAgIGluc2VydEJlZm9yZS5fcHJldi5fbmV4dCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3JlbW92YWxzSGVhZCA9IGluc2VydEJlZm9yZTtcblxuICAgICAgZm9yIChsZXQgcmVjb3JkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZF88SywgVj58bnVsbCA9IGluc2VydEJlZm9yZTsgcmVjb3JkICE9PSBudWxsO1xuICAgICAgICAgICByZWNvcmQgPSByZWNvcmQuX25leHRSZW1vdmVkKSB7XG4gICAgICAgIGlmIChyZWNvcmQgPT09IHRoaXMuX21hcEhlYWQpIHtcbiAgICAgICAgICB0aGlzLl9tYXBIZWFkID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZWNvcmRzLmRlbGV0ZShyZWNvcmQua2V5KTtcbiAgICAgICAgcmVjb3JkLl9uZXh0UmVtb3ZlZCA9IHJlY29yZC5fbmV4dDtcbiAgICAgICAgcmVjb3JkLnByZXZpb3VzVmFsdWUgPSByZWNvcmQuY3VycmVudFZhbHVlO1xuICAgICAgICByZWNvcmQuY3VycmVudFZhbHVlID0gbnVsbDtcbiAgICAgICAgcmVjb3JkLl9wcmV2ID0gbnVsbDtcbiAgICAgICAgcmVjb3JkLl9uZXh0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGFpbHMgaGF2ZSBubyBuZXh0IHJlY29yZHMgZnJvbSBwcmV2aW91cyBydW5zXG4gICAgaWYgKHRoaXMuX2NoYW5nZXNUYWlsKSB0aGlzLl9jaGFuZ2VzVGFpbC5fbmV4dENoYW5nZWQgPSBudWxsO1xuICAgIGlmICh0aGlzLl9hZGRpdGlvbnNUYWlsKSB0aGlzLl9hZGRpdGlvbnNUYWlsLl9uZXh0QWRkZWQgPSBudWxsO1xuXG4gICAgcmV0dXJuIHRoaXMuaXNEaXJ0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnRzIGEgcmVjb3JkIGJlZm9yZSBgYmVmb3JlYCBvciBhcHBlbmQgYXQgdGhlIGVuZCBvZiB0aGUgbGlzdCB3aGVuIGBiZWZvcmVgIGlzIG51bGwuXG4gICAqXG4gICAqIE5vdGVzOlxuICAgKiAtIFRoaXMgbWV0aG9kIGFwcGVuZHMgYXQgYHRoaXMuX2FwcGVuZEFmdGVyYCxcbiAgICogLSBUaGlzIG1ldGhvZCB1cGRhdGVzIGB0aGlzLl9hcHBlbmRBZnRlcmAsXG4gICAqIC0gVGhlIHJldHVybiB2YWx1ZSBpcyB0aGUgbmV3IHZhbHVlIGZvciB0aGUgaW5zZXJ0aW9uIHBvaW50ZXIuXG4gICAqL1xuICBwcml2YXRlIF9pbnNlcnRCZWZvcmVPckFwcGVuZChcbiAgICAgIGJlZm9yZTogS2V5VmFsdWVDaGFuZ2VSZWNvcmRfPEssIFY+fG51bGwsXG4gICAgICByZWNvcmQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkXzxLLCBWPik6IEtleVZhbHVlQ2hhbmdlUmVjb3JkXzxLLCBWPnxudWxsIHtcbiAgICBpZiAoYmVmb3JlKSB7XG4gICAgICBjb25zdCBwcmV2ID0gYmVmb3JlLl9wcmV2O1xuICAgICAgcmVjb3JkLl9uZXh0ID0gYmVmb3JlO1xuICAgICAgcmVjb3JkLl9wcmV2ID0gcHJldjtcbiAgICAgIGJlZm9yZS5fcHJldiA9IHJlY29yZDtcbiAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgIHByZXYuX25leHQgPSByZWNvcmQ7XG4gICAgICB9XG4gICAgICBpZiAoYmVmb3JlID09PSB0aGlzLl9tYXBIZWFkKSB7XG4gICAgICAgIHRoaXMuX21hcEhlYWQgPSByZWNvcmQ7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2FwcGVuZEFmdGVyID0gYmVmb3JlO1xuICAgICAgcmV0dXJuIGJlZm9yZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fYXBwZW5kQWZ0ZXIpIHtcbiAgICAgIHRoaXMuX2FwcGVuZEFmdGVyLl9uZXh0ID0gcmVjb3JkO1xuICAgICAgcmVjb3JkLl9wcmV2ID0gdGhpcy5fYXBwZW5kQWZ0ZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX21hcEhlYWQgPSByZWNvcmQ7XG4gICAgfVxuXG4gICAgdGhpcy5fYXBwZW5kQWZ0ZXIgPSByZWNvcmQ7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPckNyZWF0ZVJlY29yZEZvcktleShrZXk6IEssIHZhbHVlOiBWKTogS2V5VmFsdWVDaGFuZ2VSZWNvcmRfPEssIFY+IHtcbiAgICBpZiAodGhpcy5fcmVjb3Jkcy5oYXMoa2V5KSkge1xuICAgICAgY29uc3QgcmVjb3JkID0gdGhpcy5fcmVjb3Jkcy5nZXQoa2V5KSAhO1xuICAgICAgdGhpcy5fbWF5YmVBZGRUb0NoYW5nZXMocmVjb3JkLCB2YWx1ZSk7XG4gICAgICBjb25zdCBwcmV2ID0gcmVjb3JkLl9wcmV2O1xuICAgICAgY29uc3QgbmV4dCA9IHJlY29yZC5fbmV4dDtcbiAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgIHByZXYuX25leHQgPSBuZXh0O1xuICAgICAgfVxuICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgbmV4dC5fcHJldiA9IHByZXY7XG4gICAgICB9XG4gICAgICByZWNvcmQuX25leHQgPSBudWxsO1xuICAgICAgcmVjb3JkLl9wcmV2ID0gbnVsbDtcblxuICAgICAgcmV0dXJuIHJlY29yZDtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvcmQgPSBuZXcgS2V5VmFsdWVDaGFuZ2VSZWNvcmRfPEssIFY+KGtleSk7XG4gICAgdGhpcy5fcmVjb3Jkcy5zZXQoa2V5LCByZWNvcmQpO1xuICAgIHJlY29yZC5jdXJyZW50VmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLl9hZGRUb0FkZGl0aW9ucyhyZWNvcmQpO1xuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9yZXNldCgpIHtcbiAgICBpZiAodGhpcy5pc0RpcnR5KSB7XG4gICAgICBsZXQgcmVjb3JkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZF88SywgVj58bnVsbDtcbiAgICAgIC8vIGxldCBgX3ByZXZpb3VzTWFwSGVhZGAgY29udGFpbiB0aGUgc3RhdGUgb2YgdGhlIG1hcCBiZWZvcmUgdGhlIGNoYW5nZXNcbiAgICAgIHRoaXMuX3ByZXZpb3VzTWFwSGVhZCA9IHRoaXMuX21hcEhlYWQ7XG4gICAgICBmb3IgKHJlY29yZCA9IHRoaXMuX3ByZXZpb3VzTWFwSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHQpIHtcbiAgICAgICAgcmVjb3JkLl9uZXh0UHJldmlvdXMgPSByZWNvcmQuX25leHQ7XG4gICAgICB9XG5cbiAgICAgIC8vIFVwZGF0ZSBgcmVjb3JkLnByZXZpb3VzVmFsdWVgIHdpdGggdGhlIHZhbHVlIG9mIHRoZSBpdGVtIGJlZm9yZSB0aGUgY2hhbmdlc1xuICAgICAgLy8gV2UgbmVlZCB0byB1cGRhdGUgYWxsIGNoYW5nZWQgaXRlbXMgKHRoYXQncyB0aG9zZSB3aGljaCBoYXZlIGJlZW4gYWRkZWQgYW5kIGNoYW5nZWQpXG4gICAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2NoYW5nZXNIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dENoYW5nZWQpIHtcbiAgICAgICAgcmVjb3JkLnByZXZpb3VzVmFsdWUgPSByZWNvcmQuY3VycmVudFZhbHVlO1xuICAgICAgfVxuICAgICAgZm9yIChyZWNvcmQgPSB0aGlzLl9hZGRpdGlvbnNIZWFkOyByZWNvcmQgIT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0QWRkZWQpIHtcbiAgICAgICAgcmVjb3JkLnByZXZpb3VzVmFsdWUgPSByZWNvcmQuY3VycmVudFZhbHVlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9jaGFuZ2VzSGVhZCA9IHRoaXMuX2NoYW5nZXNUYWlsID0gbnVsbDtcbiAgICAgIHRoaXMuX2FkZGl0aW9uc0hlYWQgPSB0aGlzLl9hZGRpdGlvbnNUYWlsID0gbnVsbDtcbiAgICAgIHRoaXMuX3JlbW92YWxzSGVhZCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkIHRoZSByZWNvcmQgb3IgYSBnaXZlbiBrZXkgdG8gdGhlIGxpc3Qgb2YgY2hhbmdlcyBvbmx5IHdoZW4gdGhlIHZhbHVlIGhhcyBhY3R1YWxseSBjaGFuZ2VkXG4gIHByaXZhdGUgX21heWJlQWRkVG9DaGFuZ2VzKHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmRfPEssIFY+LCBuZXdWYWx1ZTogYW55KTogdm9pZCB7XG4gICAgaWYgKCFsb29zZUlkZW50aWNhbChuZXdWYWx1ZSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgIHJlY29yZC5wcmV2aW91c1ZhbHVlID0gcmVjb3JkLmN1cnJlbnRWYWx1ZTtcbiAgICAgIHJlY29yZC5jdXJyZW50VmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgIHRoaXMuX2FkZFRvQ2hhbmdlcyhyZWNvcmQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FkZFRvQWRkaXRpb25zKHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmRfPEssIFY+KSB7XG4gICAgaWYgKHRoaXMuX2FkZGl0aW9uc0hlYWQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2FkZGl0aW9uc0hlYWQgPSB0aGlzLl9hZGRpdGlvbnNUYWlsID0gcmVjb3JkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hZGRpdGlvbnNUYWlsICEuX25leHRBZGRlZCA9IHJlY29yZDtcbiAgICAgIHRoaXMuX2FkZGl0aW9uc1RhaWwgPSByZWNvcmQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYWRkVG9DaGFuZ2VzKHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmRfPEssIFY+KSB7XG4gICAgaWYgKHRoaXMuX2NoYW5nZXNIZWFkID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9jaGFuZ2VzSGVhZCA9IHRoaXMuX2NoYW5nZXNUYWlsID0gcmVjb3JkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jaGFuZ2VzVGFpbCAhLl9uZXh0Q2hhbmdlZCA9IHJlY29yZDtcbiAgICAgIHRoaXMuX2NoYW5nZXNUYWlsID0gcmVjb3JkO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfZm9yRWFjaDxLLCBWPihvYmo6IE1hcDxLLCBWPnx7W2s6IHN0cmluZ106IFZ9LCBmbjogKHY6IFYsIGs6IGFueSkgPT4gdm9pZCkge1xuICAgIGlmIChvYmogaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgIG9iai5mb3JFYWNoKGZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGsgPT4gZm4ob2JqW2tdLCBrKSk7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEtleVZhbHVlQ2hhbmdlUmVjb3JkXzxLLCBWPiBpbXBsZW1lbnRzIEtleVZhbHVlQ2hhbmdlUmVjb3JkPEssIFY+IHtcbiAgcHJldmlvdXNWYWx1ZTogVnxudWxsID0gbnVsbDtcbiAgY3VycmVudFZhbHVlOiBWfG51bGwgPSBudWxsO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHRQcmV2aW91czogS2V5VmFsdWVDaGFuZ2VSZWNvcmRfPEssIFY+fG51bGwgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0OiBLZXlWYWx1ZUNoYW5nZVJlY29yZF88SywgVj58bnVsbCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ByZXY6IEtleVZhbHVlQ2hhbmdlUmVjb3JkXzxLLCBWPnxudWxsID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmV4dEFkZGVkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZF88SywgVj58bnVsbCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHRSZW1vdmVkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZF88SywgVj58bnVsbCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHRDaGFuZ2VkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZF88SywgVj58bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGtleTogSykge31cbn1cbiJdfQ==