/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { looseIdentical, stringify } from '../../util';
import { isListLikeIterable, iterateListLike } from '../change_detection_util';
var DefaultIterableDifferFactory = /** @class */ (function () {
    function DefaultIterableDifferFactory() {
    }
    DefaultIterableDifferFactory.prototype.supports = function (obj) { return isListLikeIterable(obj); };
    DefaultIterableDifferFactory.prototype.create = function (trackByFn) {
        return new DefaultIterableDiffer(trackByFn);
    };
    return DefaultIterableDifferFactory;
}());
export { DefaultIterableDifferFactory };
var trackByIdentity = function (index, item) { return item; };
var ɵ0 = trackByIdentity;
/**
 * @deprecated v4.0.0 - Should not be part of public API.
 */
var DefaultIterableDiffer = /** @class */ (function () {
    function DefaultIterableDiffer(trackByFn) {
        this.length = 0;
        // Keeps track of the used records at any point in time (during & across `_check()` calls)
        this._linkedRecords = null;
        // Keeps track of the removed records at any point in time during `_check()` calls.
        this._unlinkedRecords = null;
        this._previousItHead = null;
        this._itHead = null;
        this._itTail = null;
        this._additionsHead = null;
        this._additionsTail = null;
        this._movesHead = null;
        this._movesTail = null;
        this._removalsHead = null;
        this._removalsTail = null;
        // Keeps track of records where custom track by is the same, but item identity has changed
        this._identityChangesHead = null;
        this._identityChangesTail = null;
        this._trackByFn = trackByFn || trackByIdentity;
    }
    DefaultIterableDiffer.prototype.forEachItem = function (fn) {
        var record;
        for (record = this._itHead; record !== null; record = record._next) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.forEachOperation = function (fn) {
        var nextIt = this._itHead;
        var nextRemove = this._removalsHead;
        var addRemoveOffset = 0;
        var moveOffsets = null;
        while (nextIt || nextRemove) {
            // Figure out which is the next record to process
            // Order: remove, add, move
            var record = !nextRemove ||
                nextIt &&
                    nextIt.currentIndex <
                        getPreviousIndex(nextRemove, addRemoveOffset, moveOffsets) ?
                nextIt :
                nextRemove;
            var adjPreviousIndex = getPreviousIndex(record, addRemoveOffset, moveOffsets);
            var currentIndex = record.currentIndex;
            // consume the item, and adjust the addRemoveOffset and update moveDistance if necessary
            if (record === nextRemove) {
                addRemoveOffset--;
                nextRemove = nextRemove._nextRemoved;
            }
            else {
                nextIt = nextIt._next;
                if (record.previousIndex == null) {
                    addRemoveOffset++;
                }
                else {
                    // INVARIANT:  currentIndex < previousIndex
                    if (!moveOffsets)
                        moveOffsets = [];
                    var localMovePreviousIndex = adjPreviousIndex - addRemoveOffset;
                    var localCurrentIndex = currentIndex - addRemoveOffset;
                    if (localMovePreviousIndex != localCurrentIndex) {
                        for (var i = 0; i < localMovePreviousIndex; i++) {
                            var offset = i < moveOffsets.length ? moveOffsets[i] : (moveOffsets[i] = 0);
                            var index = offset + i;
                            if (localCurrentIndex <= index && index < localMovePreviousIndex) {
                                moveOffsets[i] = offset + 1;
                            }
                        }
                        var previousIndex = record.previousIndex;
                        moveOffsets[previousIndex] = localCurrentIndex - localMovePreviousIndex;
                    }
                }
            }
            if (adjPreviousIndex !== currentIndex) {
                fn(record, adjPreviousIndex, currentIndex);
            }
        }
    };
    DefaultIterableDiffer.prototype.forEachPreviousItem = function (fn) {
        var record;
        for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.forEachAddedItem = function (fn) {
        var record;
        for (record = this._additionsHead; record !== null; record = record._nextAdded) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.forEachMovedItem = function (fn) {
        var record;
        for (record = this._movesHead; record !== null; record = record._nextMoved) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.forEachRemovedItem = function (fn) {
        var record;
        for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.forEachIdentityChange = function (fn) {
        var record;
        for (record = this._identityChangesHead; record !== null; record = record._nextIdentityChange) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.diff = function (collection) {
        if (collection == null)
            collection = [];
        if (!isListLikeIterable(collection)) {
            throw new Error("Error trying to diff '" + stringify(collection) + "'. Only arrays and iterables are allowed");
        }
        if (this.check(collection)) {
            return this;
        }
        else {
            return null;
        }
    };
    DefaultIterableDiffer.prototype.onDestroy = function () { };
    DefaultIterableDiffer.prototype.check = function (collection) {
        var _this = this;
        this._reset();
        var record = this._itHead;
        var mayBeDirty = false;
        var index;
        var item;
        var itemTrackBy;
        if (Array.isArray(collection)) {
            this.length = collection.length;
            for (var index_1 = 0; index_1 < this.length; index_1++) {
                item = collection[index_1];
                itemTrackBy = this._trackByFn(index_1, item);
                if (record === null || !looseIdentical(record.trackById, itemTrackBy)) {
                    record = this._mismatch(record, item, itemTrackBy, index_1);
                    mayBeDirty = true;
                }
                else {
                    if (mayBeDirty) {
                        // TODO(misko): can we limit this to duplicates only?
                        record = this._verifyReinsertion(record, item, itemTrackBy, index_1);
                    }
                    if (!looseIdentical(record.item, item))
                        this._addIdentityChange(record, item);
                }
                record = record._next;
            }
        }
        else {
            index = 0;
            iterateListLike(collection, function (item) {
                itemTrackBy = _this._trackByFn(index, item);
                if (record === null || !looseIdentical(record.trackById, itemTrackBy)) {
                    record = _this._mismatch(record, item, itemTrackBy, index);
                    mayBeDirty = true;
                }
                else {
                    if (mayBeDirty) {
                        // TODO(misko): can we limit this to duplicates only?
                        record = _this._verifyReinsertion(record, item, itemTrackBy, index);
                    }
                    if (!looseIdentical(record.item, item))
                        _this._addIdentityChange(record, item);
                }
                record = record._next;
                index++;
            });
            this.length = index;
        }
        this._truncate(record);
        this.collection = collection;
        return this.isDirty;
    };
    Object.defineProperty(DefaultIterableDiffer.prototype, "isDirty", {
        /* CollectionChanges is considered dirty if it has any additions, moves, removals, or identity
         * changes.
         */
        get: function () {
            return this._additionsHead !== null || this._movesHead !== null ||
                this._removalsHead !== null || this._identityChangesHead !== null;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Reset the state of the change objects to show no changes. This means set previousKey to
     * currentKey, and clear all of the queues (additions, moves, removals).
     * Set the previousIndexes of moved and added items to their currentIndexes
     * Reset the list of additions, moves and removals
     *
     * @internal
     */
    DefaultIterableDiffer.prototype._reset = function () {
        if (this.isDirty) {
            var record = void 0;
            var nextRecord = void 0;
            for (record = this._previousItHead = this._itHead; record !== null; record = record._next) {
                record._nextPrevious = record._next;
            }
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                record.previousIndex = record.currentIndex;
            }
            this._additionsHead = this._additionsTail = null;
            for (record = this._movesHead; record !== null; record = nextRecord) {
                record.previousIndex = record.currentIndex;
                nextRecord = record._nextMoved;
            }
            this._movesHead = this._movesTail = null;
            this._removalsHead = this._removalsTail = null;
            this._identityChangesHead = this._identityChangesTail = null;
            // TODO(vicb): when assert gets supported
            // assert(!this.isDirty);
        }
    };
    /**
     * This is the core function which handles differences between collections.
     *
     * - `record` is the record which we saw at this position last time. If null then it is a new
     *   item.
     * - `item` is the current item in the collection
     * - `index` is the position of the item in the collection
     *
     * @internal
     */
    DefaultIterableDiffer.prototype._mismatch = function (record, item, itemTrackBy, index) {
        // The previous record after which we will append the current one.
        var previousRecord;
        if (record === null) {
            previousRecord = this._itTail;
        }
        else {
            previousRecord = record._prev;
            // Remove the record from the collection since we know it does not match the item.
            this._remove(record);
        }
        // Attempt to see if we have seen the item before.
        record = this._linkedRecords === null ? null : this._linkedRecords.get(itemTrackBy, index);
        if (record !== null) {
            // We have seen this before, we need to move it forward in the collection.
            // But first we need to check if identity changed, so we can update in view if necessary
            if (!looseIdentical(record.item, item))
                this._addIdentityChange(record, item);
            this._moveAfter(record, previousRecord, index);
        }
        else {
            // Never seen it, check evicted list.
            record = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy, null);
            if (record !== null) {
                // It is an item which we have evicted earlier: reinsert it back into the list.
                // But first we need to check if identity changed, so we can update in view if necessary
                if (!looseIdentical(record.item, item))
                    this._addIdentityChange(record, item);
                this._reinsertAfter(record, previousRecord, index);
            }
            else {
                // It is a new item: add it.
                record =
                    this._addAfter(new IterableChangeRecord_(item, itemTrackBy), previousRecord, index);
            }
        }
        return record;
    };
    /**
     * This check is only needed if an array contains duplicates. (Short circuit of nothing dirty)
     *
     * Use case: `[a, a]` => `[b, a, a]`
     *
     * If we did not have this check then the insertion of `b` would:
     *   1) evict first `a`
     *   2) insert `b` at `0` index.
     *   3) leave `a` at index `1` as is. <-- this is wrong!
     *   3) reinsert `a` at index 2. <-- this is wrong!
     *
     * The correct behavior is:
     *   1) evict first `a`
     *   2) insert `b` at `0` index.
     *   3) reinsert `a` at index 1.
     *   3) move `a` at from `1` to `2`.
     *
     *
     * Double check that we have not evicted a duplicate item. We need to check if the item type may
     * have already been removed:
     * The insertion of b will evict the first 'a'. If we don't reinsert it now it will be reinserted
     * at the end. Which will show up as the two 'a's switching position. This is incorrect, since a
     * better way to think of it is as insert of 'b' rather then switch 'a' with 'b' and then add 'a'
     * at the end.
     *
     * @internal
     */
    DefaultIterableDiffer.prototype._verifyReinsertion = function (record, item, itemTrackBy, index) {
        var reinsertRecord = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy, null);
        if (reinsertRecord !== null) {
            record = this._reinsertAfter(reinsertRecord, record._prev, index);
        }
        else if (record.currentIndex != index) {
            record.currentIndex = index;
            this._addToMoves(record, index);
        }
        return record;
    };
    /**
     * Get rid of any excess {@link IterableChangeRecord_}s from the previous collection
     *
     * - `record` The first excess {@link IterableChangeRecord_}.
     *
     * @internal
     */
    DefaultIterableDiffer.prototype._truncate = function (record) {
        // Anything after that needs to be removed;
        while (record !== null) {
            var nextRecord = record._next;
            this._addToRemovals(this._unlink(record));
            record = nextRecord;
        }
        if (this._unlinkedRecords !== null) {
            this._unlinkedRecords.clear();
        }
        if (this._additionsTail !== null) {
            this._additionsTail._nextAdded = null;
        }
        if (this._movesTail !== null) {
            this._movesTail._nextMoved = null;
        }
        if (this._itTail !== null) {
            this._itTail._next = null;
        }
        if (this._removalsTail !== null) {
            this._removalsTail._nextRemoved = null;
        }
        if (this._identityChangesTail !== null) {
            this._identityChangesTail._nextIdentityChange = null;
        }
    };
    /** @internal */
    DefaultIterableDiffer.prototype._reinsertAfter = function (record, prevRecord, index) {
        if (this._unlinkedRecords !== null) {
            this._unlinkedRecords.remove(record);
        }
        var prev = record._prevRemoved;
        var next = record._nextRemoved;
        if (prev === null) {
            this._removalsHead = next;
        }
        else {
            prev._nextRemoved = next;
        }
        if (next === null) {
            this._removalsTail = prev;
        }
        else {
            next._prevRemoved = prev;
        }
        this._insertAfter(record, prevRecord, index);
        this._addToMoves(record, index);
        return record;
    };
    /** @internal */
    DefaultIterableDiffer.prototype._moveAfter = function (record, prevRecord, index) {
        this._unlink(record);
        this._insertAfter(record, prevRecord, index);
        this._addToMoves(record, index);
        return record;
    };
    /** @internal */
    DefaultIterableDiffer.prototype._addAfter = function (record, prevRecord, index) {
        this._insertAfter(record, prevRecord, index);
        if (this._additionsTail === null) {
            // TODO(vicb):
            // assert(this._additionsHead === null);
            this._additionsTail = this._additionsHead = record;
        }
        else {
            // TODO(vicb):
            // assert(_additionsTail._nextAdded === null);
            // assert(record._nextAdded === null);
            this._additionsTail = this._additionsTail._nextAdded = record;
        }
        return record;
    };
    /** @internal */
    DefaultIterableDiffer.prototype._insertAfter = function (record, prevRecord, index) {
        // TODO(vicb):
        // assert(record != prevRecord);
        // assert(record._next === null);
        // assert(record._prev === null);
        var next = prevRecord === null ? this._itHead : prevRecord._next;
        // TODO(vicb):
        // assert(next != record);
        // assert(prevRecord != record);
        record._next = next;
        record._prev = prevRecord;
        if (next === null) {
            this._itTail = record;
        }
        else {
            next._prev = record;
        }
        if (prevRecord === null) {
            this._itHead = record;
        }
        else {
            prevRecord._next = record;
        }
        if (this._linkedRecords === null) {
            this._linkedRecords = new _DuplicateMap();
        }
        this._linkedRecords.put(record);
        record.currentIndex = index;
        return record;
    };
    /** @internal */
    DefaultIterableDiffer.prototype._remove = function (record) {
        return this._addToRemovals(this._unlink(record));
    };
    /** @internal */
    DefaultIterableDiffer.prototype._unlink = function (record) {
        if (this._linkedRecords !== null) {
            this._linkedRecords.remove(record);
        }
        var prev = record._prev;
        var next = record._next;
        // TODO(vicb):
        // assert((record._prev = null) === null);
        // assert((record._next = null) === null);
        if (prev === null) {
            this._itHead = next;
        }
        else {
            prev._next = next;
        }
        if (next === null) {
            this._itTail = prev;
        }
        else {
            next._prev = prev;
        }
        return record;
    };
    /** @internal */
    DefaultIterableDiffer.prototype._addToMoves = function (record, toIndex) {
        // TODO(vicb):
        // assert(record._nextMoved === null);
        if (record.previousIndex === toIndex) {
            return record;
        }
        if (this._movesTail === null) {
            // TODO(vicb):
            // assert(_movesHead === null);
            this._movesTail = this._movesHead = record;
        }
        else {
            // TODO(vicb):
            // assert(_movesTail._nextMoved === null);
            this._movesTail = this._movesTail._nextMoved = record;
        }
        return record;
    };
    DefaultIterableDiffer.prototype._addToRemovals = function (record) {
        if (this._unlinkedRecords === null) {
            this._unlinkedRecords = new _DuplicateMap();
        }
        this._unlinkedRecords.put(record);
        record.currentIndex = null;
        record._nextRemoved = null;
        if (this._removalsTail === null) {
            // TODO(vicb):
            // assert(_removalsHead === null);
            this._removalsTail = this._removalsHead = record;
            record._prevRemoved = null;
        }
        else {
            // TODO(vicb):
            // assert(_removalsTail._nextRemoved === null);
            // assert(record._nextRemoved === null);
            record._prevRemoved = this._removalsTail;
            this._removalsTail = this._removalsTail._nextRemoved = record;
        }
        return record;
    };
    /** @internal */
    DefaultIterableDiffer.prototype._addIdentityChange = function (record, item) {
        record.item = item;
        if (this._identityChangesTail === null) {
            this._identityChangesTail = this._identityChangesHead = record;
        }
        else {
            this._identityChangesTail = this._identityChangesTail._nextIdentityChange = record;
        }
        return record;
    };
    return DefaultIterableDiffer;
}());
export { DefaultIterableDiffer };
var IterableChangeRecord_ = /** @class */ (function () {
    function IterableChangeRecord_(item, trackById) {
        this.item = item;
        this.trackById = trackById;
        this.currentIndex = null;
        this.previousIndex = null;
        /** @internal */
        this._nextPrevious = null;
        /** @internal */
        this._prev = null;
        /** @internal */
        this._next = null;
        /** @internal */
        this._prevDup = null;
        /** @internal */
        this._nextDup = null;
        /** @internal */
        this._prevRemoved = null;
        /** @internal */
        this._nextRemoved = null;
        /** @internal */
        this._nextAdded = null;
        /** @internal */
        this._nextMoved = null;
        /** @internal */
        this._nextIdentityChange = null;
    }
    return IterableChangeRecord_;
}());
export { IterableChangeRecord_ };
// A linked list of CollectionChangeRecords with the same IterableChangeRecord_.item
var _DuplicateItemRecordList = /** @class */ (function () {
    function _DuplicateItemRecordList() {
        /** @internal */
        this._head = null;
        /** @internal */
        this._tail = null;
    }
    /**
     * Append the record to the list of duplicates.
     *
     * Note: by design all records in the list of duplicates hold the same value in record.item.
     */
    _DuplicateItemRecordList.prototype.add = function (record) {
        if (this._head === null) {
            this._head = this._tail = record;
            record._nextDup = null;
            record._prevDup = null;
        }
        else {
            // TODO(vicb):
            // assert(record.item ==  _head.item ||
            //       record.item is num && record.item.isNaN && _head.item is num && _head.item.isNaN);
            this._tail._nextDup = record;
            record._prevDup = this._tail;
            record._nextDup = null;
            this._tail = record;
        }
    };
    // Returns a IterableChangeRecord_ having IterableChangeRecord_.trackById == trackById and
    // IterableChangeRecord_.currentIndex >= atOrAfterIndex
    _DuplicateItemRecordList.prototype.get = function (trackById, atOrAfterIndex) {
        var record;
        for (record = this._head; record !== null; record = record._nextDup) {
            if ((atOrAfterIndex === null || atOrAfterIndex <= record.currentIndex) &&
                looseIdentical(record.trackById, trackById)) {
                return record;
            }
        }
        return null;
    };
    /**
     * Remove one {@link IterableChangeRecord_} from the list of duplicates.
     *
     * Returns whether the list of duplicates is empty.
     */
    _DuplicateItemRecordList.prototype.remove = function (record) {
        // TODO(vicb):
        // assert(() {
        //  // verify that the record being removed is in the list.
        //  for (IterableChangeRecord_ cursor = _head; cursor != null; cursor = cursor._nextDup) {
        //    if (identical(cursor, record)) return true;
        //  }
        //  return false;
        //});
        var prev = record._prevDup;
        var next = record._nextDup;
        if (prev === null) {
            this._head = next;
        }
        else {
            prev._nextDup = next;
        }
        if (next === null) {
            this._tail = prev;
        }
        else {
            next._prevDup = prev;
        }
        return this._head === null;
    };
    return _DuplicateItemRecordList;
}());
var _DuplicateMap = /** @class */ (function () {
    function _DuplicateMap() {
        this.map = new Map();
    }
    _DuplicateMap.prototype.put = function (record) {
        var key = record.trackById;
        var duplicates = this.map.get(key);
        if (!duplicates) {
            duplicates = new _DuplicateItemRecordList();
            this.map.set(key, duplicates);
        }
        duplicates.add(record);
    };
    /**
     * Retrieve the `value` using key. Because the IterableChangeRecord_ value may be one which we
     * have already iterated over, we use the `atOrAfterIndex` to pretend it is not there.
     *
     * Use case: `[a, b, c, a, a]` if we are at index `3` which is the second `a` then asking if we
     * have any more `a`s needs to return the second `a`.
     */
    _DuplicateMap.prototype.get = function (trackById, atOrAfterIndex) {
        var key = trackById;
        var recordList = this.map.get(key);
        return recordList ? recordList.get(trackById, atOrAfterIndex) : null;
    };
    /**
     * Removes a {@link IterableChangeRecord_} from the list of duplicates.
     *
     * The list of duplicates also is removed from the map if it gets empty.
     */
    _DuplicateMap.prototype.remove = function (record) {
        var key = record.trackById;
        var recordList = this.map.get(key);
        // Remove the list of duplicates when it gets empty
        if (recordList.remove(record)) {
            this.map.delete(key);
        }
        return record;
    };
    Object.defineProperty(_DuplicateMap.prototype, "isEmpty", {
        get: function () { return this.map.size === 0; },
        enumerable: true,
        configurable: true
    });
    _DuplicateMap.prototype.clear = function () { this.map.clear(); };
    return _DuplicateMap;
}());
function getPreviousIndex(item, addRemoveOffset, moveOffsets) {
    var previousIndex = item.previousIndex;
    if (previousIndex === null)
        return previousIndex;
    var moveOffset = 0;
    if (moveOffsets && previousIndex < moveOffsets.length) {
        moveOffset = moveOffsets[previousIndex];
    }
    return previousIndex + addRemoveOffset + moveOffset;
}
export { ɵ0 };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdF9pdGVyYWJsZV9kaWZmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9jaGFuZ2VfZGV0ZWN0aW9uL2RpZmZlcnMvZGVmYXVsdF9pdGVyYWJsZV9kaWZmZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDckQsT0FBTyxFQUFDLGtCQUFrQixFQUFFLGVBQWUsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBSTdFO0lBQ0U7SUFBZSxDQUFDO0lBQ2hCLCtDQUFRLEdBQVIsVUFBUyxHQUEwQixJQUFhLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFakYsNkNBQU0sR0FBTixVQUFVLFNBQThCO1FBQ3RDLE1BQU0sQ0FBQyxJQUFJLHFCQUFxQixDQUFJLFNBQVMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFDSCxtQ0FBQztBQUFELENBQUMsQUFQRCxJQU9DOztBQUVELElBQU0sZUFBZSxHQUFHLFVBQUMsS0FBYSxFQUFFLElBQVMsSUFBSyxPQUFBLElBQUksRUFBSixDQUFJLENBQUM7O0FBRTNEOztHQUVHO0FBQ0g7SUFxQkUsK0JBQVksU0FBOEI7UUFwQjFCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFFbkMsMEZBQTBGO1FBQ2xGLG1CQUFjLEdBQTBCLElBQUksQ0FBQztRQUNyRCxtRkFBbUY7UUFDM0UscUJBQWdCLEdBQTBCLElBQUksQ0FBQztRQUMvQyxvQkFBZSxHQUFrQyxJQUFJLENBQUM7UUFDdEQsWUFBTyxHQUFrQyxJQUFJLENBQUM7UUFDOUMsWUFBTyxHQUFrQyxJQUFJLENBQUM7UUFDOUMsbUJBQWMsR0FBa0MsSUFBSSxDQUFDO1FBQ3JELG1CQUFjLEdBQWtDLElBQUksQ0FBQztR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RyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN0RCxVQUFVLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFDRCxNQUFNLENBQUMsYUFBYSxHQUFHLGVBQWUsR0FBRyxVQUFVLENBQUM7QUFDdEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtsb29zZUlkZW50aWNhbCwgc3RyaW5naWZ5fSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCB7aXNMaXN0TGlrZUl0ZXJhYmxlLCBpdGVyYXRlTGlzdExpa2V9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb25fdXRpbCc7XG5pbXBvcnQge0l0ZXJhYmxlQ2hhbmdlUmVjb3JkLCBJdGVyYWJsZUNoYW5nZXMsIEl0ZXJhYmxlRGlmZmVyLCBJdGVyYWJsZURpZmZlckZhY3RvcnksIE5nSXRlcmFibGUsIFRyYWNrQnlGdW5jdGlvbn0gZnJvbSAnLi9pdGVyYWJsZV9kaWZmZXJzJztcblxuXG5leHBvcnQgY2xhc3MgRGVmYXVsdEl0ZXJhYmxlRGlmZmVyRmFjdG9yeSBpbXBsZW1lbnRzIEl0ZXJhYmxlRGlmZmVyRmFjdG9yeSB7XG4gIGNvbnN0cnVjdG9yKCkge31cbiAgc3VwcG9ydHMob2JqOiBPYmplY3R8bnVsbHx1bmRlZmluZWQpOiBib29sZWFuIHsgcmV0dXJuIGlzTGlzdExpa2VJdGVyYWJsZShvYmopOyB9XG5cbiAgY3JlYXRlPFY+KHRyYWNrQnlGbj86IFRyYWNrQnlGdW5jdGlvbjxWPik6IERlZmF1bHRJdGVyYWJsZURpZmZlcjxWPiB7XG4gICAgcmV0dXJuIG5ldyBEZWZhdWx0SXRlcmFibGVEaWZmZXI8Vj4odHJhY2tCeUZuKTtcbiAgfVxufVxuXG5jb25zdCB0cmFja0J5SWRlbnRpdHkgPSAoaW5kZXg6IG51bWJlciwgaXRlbTogYW55KSA9PiBpdGVtO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkIHY0LjAuMCAtIFNob3VsZCBub3QgYmUgcGFydCBvZiBwdWJsaWMgQVBJLlxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdEl0ZXJhYmxlRGlmZmVyPFY+IGltcGxlbWVudHMgSXRlcmFibGVEaWZmZXI8Vj4sIEl0ZXJhYmxlQ2hhbmdlczxWPiB7XG4gIHB1YmxpYyByZWFkb25seSBsZW5ndGg6IG51bWJlciA9IDA7XG4gIHB1YmxpYyByZWFkb25seSBjb2xsZWN0aW9uOiBWW118SXRlcmFibGU8Vj58bnVsbDtcbiAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIHVzZWQgcmVjb3JkcyBhdCBhbnkgcG9pbnQgaW4gdGltZSAoZHVyaW5nICYgYWNyb3NzIGBfY2hlY2soKWAgY2FsbHMpXG4gIHByaXZhdGUgX2xpbmtlZFJlY29yZHM6IF9EdXBsaWNhdGVNYXA8Vj58bnVsbCA9IG51bGw7XG4gIC8vIEtlZXBzIHRyYWNrIG9mIHRoZSByZW1vdmVkIHJlY29yZHMgYXQgYW55IHBvaW50IGluIHRpbWUgZHVyaW5nIGBfY2hlY2soKWAgY2FsbHMuXG4gIHByaXZhdGUgX3VubGlua2VkUmVjb3JkczogX0R1cGxpY2F0ZU1hcDxWPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfcHJldmlvdXNJdEhlYWQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfaXRIZWFkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2l0VGFpbDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9hZGRpdGlvbnNIZWFkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2FkZGl0aW9uc1RhaWw6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbW92ZXNIZWFkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX21vdmVzVGFpbDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9yZW1vdmFsc0hlYWQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfcmVtb3ZhbHNUYWlsOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIC8vIEtlZXBzIHRyYWNrIG9mIHJlY29yZHMgd2hlcmUgY3VzdG9tIHRyYWNrIGJ5IGlzIHRoZSBzYW1lLCBidXQgaXRlbSBpZGVudGl0eSBoYXMgY2hhbmdlZFxuICBwcml2YXRlIF9pZGVudGl0eUNoYW5nZXNIZWFkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2lkZW50aXR5Q2hhbmdlc1RhaWw6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfdHJhY2tCeUZuOiBUcmFja0J5RnVuY3Rpb248Vj47XG5cbiAgY29uc3RydWN0b3IodHJhY2tCeUZuPzogVHJhY2tCeUZ1bmN0aW9uPFY+KSB7IHRoaXMuX3RyYWNrQnlGbiA9IHRyYWNrQnlGbiB8fCB0cmFja0J5SWRlbnRpdHk7IH1cblxuICBmb3JFYWNoSXRlbShmbjogKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+KSA9PiB2b2lkKSB7XG4gICAgbGV0IHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGw7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9pdEhlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0KSB7XG4gICAgICBmbihyZWNvcmQpO1xuICAgIH1cbiAgfVxuXG4gIGZvckVhY2hPcGVyYXRpb24oXG4gICAgICBmbjogKGl0ZW06IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPFY+LCBwcmV2aW91c0luZGV4OiBudW1iZXJ8bnVsbCwgY3VycmVudEluZGV4OiBudW1iZXJ8bnVsbCkgPT5cbiAgICAgICAgICB2b2lkKSB7XG4gICAgbGV0IG5leHRJdCA9IHRoaXMuX2l0SGVhZDtcbiAgICBsZXQgbmV4dFJlbW92ZSA9IHRoaXMuX3JlbW92YWxzSGVhZDtcbiAgICBsZXQgYWRkUmVtb3ZlT2Zmc2V0ID0gMDtcbiAgICBsZXQgbW92ZU9mZnNldHM6IG51bWJlcltdfG51bGwgPSBudWxsO1xuICAgIHdoaWxlIChuZXh0SXQgfHwgbmV4dFJlbW92ZSkge1xuICAgICAgLy8gRmlndXJlIG91dCB3aGljaCBpcyB0aGUgbmV4dCByZWNvcmQgdG8gcHJvY2Vzc1xuICAgICAgLy8gT3JkZXI6IHJlbW92ZSwgYWRkLCBtb3ZlXG4gICAgICBjb25zdCByZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPFY+ID0gIW5leHRSZW1vdmUgfHxcbiAgICAgICAgICAgICAgbmV4dEl0ICYmXG4gICAgICAgICAgICAgICAgICBuZXh0SXQuY3VycmVudEluZGV4ICEgPFxuICAgICAgICAgICAgICAgICAgICAgIGdldFByZXZpb3VzSW5kZXgobmV4dFJlbW92ZSwgYWRkUmVtb3ZlT2Zmc2V0LCBtb3ZlT2Zmc2V0cykgP1xuICAgICAgICAgIG5leHRJdCAhIDpcbiAgICAgICAgICBuZXh0UmVtb3ZlO1xuICAgICAgY29uc3QgYWRqUHJldmlvdXNJbmRleCA9IGdldFByZXZpb3VzSW5kZXgocmVjb3JkLCBhZGRSZW1vdmVPZmZzZXQsIG1vdmVPZmZzZXRzKTtcbiAgICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IHJlY29yZC5jdXJyZW50SW5kZXg7XG5cbiAgICAgIC8vIGNvbnN1bWUgdGhlIGl0ZW0sIGFuZCBhZGp1c3QgdGhlIGFkZFJlbW92ZU9mZnNldCBhbmQgdXBkYXRlIG1vdmVEaXN0YW5jZSBpZiBuZWNlc3NhcnlcbiAgICAgIGlmIChyZWNvcmQgPT09IG5leHRSZW1vdmUpIHtcbiAgICAgICAgYWRkUmVtb3ZlT2Zmc2V0LS07XG4gICAgICAgIG5leHRSZW1vdmUgPSBuZXh0UmVtb3ZlLl9uZXh0UmVtb3ZlZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHRJdCA9IG5leHRJdCAhLl9uZXh0O1xuICAgICAgICBpZiAocmVjb3JkLnByZXZpb3VzSW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgIGFkZFJlbW92ZU9mZnNldCsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElOVkFSSUFOVDogIGN1cnJlbnRJbmRleCA8IHByZXZpb3VzSW5kZXhcbiAgICAgICAgICBpZiAoIW1vdmVPZmZzZXRzKSBtb3ZlT2Zmc2V0cyA9IFtdO1xuICAgICAgICAgIGNvbnN0IGxvY2FsTW92ZVByZXZpb3VzSW5kZXggPSBhZGpQcmV2aW91c0luZGV4IC0gYWRkUmVtb3ZlT2Zmc2V0O1xuICAgICAgICAgIGNvbnN0IGxvY2FsQ3VycmVudEluZGV4ID0gY3VycmVudEluZGV4ICEgLSBhZGRSZW1vdmVPZmZzZXQ7XG4gICAgICAgICAgaWYgKGxvY2FsTW92ZVByZXZpb3VzSW5kZXggIT0gbG9jYWxDdXJyZW50SW5kZXgpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYWxNb3ZlUHJldmlvdXNJbmRleDsgaSsrKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IGkgPCBtb3ZlT2Zmc2V0cy5sZW5ndGggPyBtb3ZlT2Zmc2V0c1tpXSA6IChtb3ZlT2Zmc2V0c1tpXSA9IDApO1xuICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IG9mZnNldCArIGk7XG4gICAgICAgICAgICAgIGlmIChsb2NhbEN1cnJlbnRJbmRleCA8PSBpbmRleCAmJiBpbmRleCA8IGxvY2FsTW92ZVByZXZpb3VzSW5kZXgpIHtcbiAgICAgICAgICAgICAgICBtb3ZlT2Zmc2V0c1tpXSA9IG9mZnNldCArIDE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzSW5kZXggPSByZWNvcmQucHJldmlvdXNJbmRleDtcbiAgICAgICAgICAgIG1vdmVPZmZzZXRzW3ByZXZpb3VzSW5kZXhdID0gbG9jYWxDdXJyZW50SW5kZXggLSBsb2NhbE1vdmVQcmV2aW91c0luZGV4O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoYWRqUHJldmlvdXNJbmRleCAhPT0gY3VycmVudEluZGV4KSB7XG4gICAgICAgIGZuKHJlY29yZCwgYWRqUHJldmlvdXNJbmRleCwgY3VycmVudEluZGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3JFYWNoUHJldmlvdXNJdGVtKGZuOiAocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4pID0+IHZvaWQpIHtcbiAgICBsZXQgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX3ByZXZpb3VzSXRIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dFByZXZpb3VzKSB7XG4gICAgICBmbihyZWNvcmQpO1xuICAgIH1cbiAgfVxuXG4gIGZvckVhY2hBZGRlZEl0ZW0oZm46IChyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPikgPT4gdm9pZCkge1xuICAgIGxldCByZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5fYWRkaXRpb25zSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRBZGRlZCkge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoTW92ZWRJdGVtKGZuOiAocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4pID0+IHZvaWQpIHtcbiAgICBsZXQgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX21vdmVzSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRNb3ZlZCkge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoUmVtb3ZlZEl0ZW0oZm46IChyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPikgPT4gdm9pZCkge1xuICAgIGxldCByZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5fcmVtb3ZhbHNIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dFJlbW92ZWQpIHtcbiAgICAgIGZuKHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgZm9yRWFjaElkZW50aXR5Q2hhbmdlKGZuOiAocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4pID0+IHZvaWQpIHtcbiAgICBsZXQgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2lkZW50aXR5Q2hhbmdlc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0SWRlbnRpdHlDaGFuZ2UpIHtcbiAgICAgIGZuKHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgZGlmZihjb2xsZWN0aW9uOiBOZ0l0ZXJhYmxlPFY+KTogRGVmYXVsdEl0ZXJhYmxlRGlmZmVyPFY+fG51bGwge1xuICAgIGlmIChjb2xsZWN0aW9uID09IG51bGwpIGNvbGxlY3Rpb24gPSBbXTtcbiAgICBpZiAoIWlzTGlzdExpa2VJdGVyYWJsZShjb2xsZWN0aW9uKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBFcnJvciB0cnlpbmcgdG8gZGlmZiAnJHtzdHJpbmdpZnkoY29sbGVjdGlvbil9Jy4gT25seSBhcnJheXMgYW5kIGl0ZXJhYmxlcyBhcmUgYWxsb3dlZGApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoZWNrKGNvbGxlY3Rpb24pKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgb25EZXN0cm95KCkge31cblxuICBjaGVjayhjb2xsZWN0aW9uOiBOZ0l0ZXJhYmxlPFY+KTogYm9vbGVhbiB7XG4gICAgdGhpcy5fcmVzZXQoKTtcblxuICAgIGxldCByZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gdGhpcy5faXRIZWFkO1xuICAgIGxldCBtYXlCZURpcnR5OiBib29sZWFuID0gZmFsc2U7XG4gICAgbGV0IGluZGV4OiBudW1iZXI7XG4gICAgbGV0IGl0ZW06IFY7XG4gICAgbGV0IGl0ZW1UcmFja0J5OiBhbnk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY29sbGVjdGlvbikpIHtcbiAgICAgICh0aGlzIGFze2xlbmd0aDogbnVtYmVyfSkubGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGg7XG5cbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBpdGVtID0gY29sbGVjdGlvbltpbmRleF07XG4gICAgICAgIGl0ZW1UcmFja0J5ID0gdGhpcy5fdHJhY2tCeUZuKGluZGV4LCBpdGVtKTtcbiAgICAgICAgaWYgKHJlY29yZCA9PT0gbnVsbCB8fCAhbG9vc2VJZGVudGljYWwocmVjb3JkLnRyYWNrQnlJZCwgaXRlbVRyYWNrQnkpKSB7XG4gICAgICAgICAgcmVjb3JkID0gdGhpcy5fbWlzbWF0Y2gocmVjb3JkLCBpdGVtLCBpdGVtVHJhY2tCeSwgaW5kZXgpO1xuICAgICAgICAgIG1heUJlRGlydHkgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChtYXlCZURpcnR5KSB7XG4gICAgICAgICAgICAvLyBUT0RPKG1pc2tvKTogY2FuIHdlIGxpbWl0IHRoaXMgdG8gZHVwbGljYXRlcyBvbmx5P1xuICAgICAgICAgICAgcmVjb3JkID0gdGhpcy5fdmVyaWZ5UmVpbnNlcnRpb24ocmVjb3JkLCBpdGVtLCBpdGVtVHJhY2tCeSwgaW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWxvb3NlSWRlbnRpY2FsKHJlY29yZC5pdGVtLCBpdGVtKSkgdGhpcy5fYWRkSWRlbnRpdHlDaGFuZ2UocmVjb3JkLCBpdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlY29yZCA9IHJlY29yZC5fbmV4dDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaW5kZXggPSAwO1xuICAgICAgaXRlcmF0ZUxpc3RMaWtlKGNvbGxlY3Rpb24sIChpdGVtOiBWKSA9PiB7XG4gICAgICAgIGl0ZW1UcmFja0J5ID0gdGhpcy5fdHJhY2tCeUZuKGluZGV4LCBpdGVtKTtcbiAgICAgICAgaWYgKHJlY29yZCA9PT0gbnVsbCB8fCAhbG9vc2VJZGVudGljYWwocmVjb3JkLnRyYWNrQnlJZCwgaXRlbVRyYWNrQnkpKSB7XG4gICAgICAgICAgcmVjb3JkID0gdGhpcy5fbWlzbWF0Y2gocmVjb3JkLCBpdGVtLCBpdGVtVHJhY2tCeSwgaW5kZXgpO1xuICAgICAgICAgIG1heUJlRGlydHkgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChtYXlCZURpcnR5KSB7XG4gICAgICAgICAgICAvLyBUT0RPKG1pc2tvKTogY2FuIHdlIGxpbWl0IHRoaXMgdG8gZHVwbGljYXRlcyBvbmx5P1xuICAgICAgICAgICAgcmVjb3JkID0gdGhpcy5fdmVyaWZ5UmVpbnNlcnRpb24ocmVjb3JkLCBpdGVtLCBpdGVtVHJhY2tCeSwgaW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWxvb3NlSWRlbnRpY2FsKHJlY29yZC5pdGVtLCBpdGVtKSkgdGhpcy5fYWRkSWRlbnRpdHlDaGFuZ2UocmVjb3JkLCBpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICByZWNvcmQgPSByZWNvcmQuX25leHQ7XG4gICAgICAgIGluZGV4Kys7XG4gICAgICB9KTtcbiAgICAgICh0aGlzIGFze2xlbmd0aDogbnVtYmVyfSkubGVuZ3RoID0gaW5kZXg7XG4gICAgfVxuXG4gICAgdGhpcy5fdHJ1bmNhdGUocmVjb3JkKTtcbiAgICAodGhpcyBhc3tjb2xsZWN0aW9uOiBWW10gfCBJdGVyYWJsZTxWPn0pLmNvbGxlY3Rpb24gPSBjb2xsZWN0aW9uO1xuICAgIHJldHVybiB0aGlzLmlzRGlydHk7XG4gIH1cblxuICAvKiBDb2xsZWN0aW9uQ2hhbmdlcyBpcyBjb25zaWRlcmVkIGRpcnR5IGlmIGl0IGhhcyBhbnkgYWRkaXRpb25zLCBtb3ZlcywgcmVtb3ZhbHMsIG9yIGlkZW50aXR5XG4gICAqIGNoYW5nZXMuXG4gICAqL1xuICBnZXQgaXNEaXJ0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fYWRkaXRpb25zSGVhZCAhPT0gbnVsbCB8fCB0aGlzLl9tb3Zlc0hlYWQgIT09IG51bGwgfHxcbiAgICAgICAgdGhpcy5fcmVtb3ZhbHNIZWFkICE9PSBudWxsIHx8IHRoaXMuX2lkZW50aXR5Q2hhbmdlc0hlYWQgIT09IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIHN0YXRlIG9mIHRoZSBjaGFuZ2Ugb2JqZWN0cyB0byBzaG93IG5vIGNoYW5nZXMuIFRoaXMgbWVhbnMgc2V0IHByZXZpb3VzS2V5IHRvXG4gICAqIGN1cnJlbnRLZXksIGFuZCBjbGVhciBhbGwgb2YgdGhlIHF1ZXVlcyAoYWRkaXRpb25zLCBtb3ZlcywgcmVtb3ZhbHMpLlxuICAgKiBTZXQgdGhlIHByZXZpb3VzSW5kZXhlcyBvZiBtb3ZlZCBhbmQgYWRkZWQgaXRlbXMgdG8gdGhlaXIgY3VycmVudEluZGV4ZXNcbiAgICogUmVzZXQgdGhlIGxpc3Qgb2YgYWRkaXRpb25zLCBtb3ZlcyBhbmQgcmVtb3ZhbHNcbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfcmVzZXQoKSB7XG4gICAgaWYgKHRoaXMuaXNEaXJ0eSkge1xuICAgICAgbGV0IHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGw7XG4gICAgICBsZXQgbmV4dFJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGw7XG5cbiAgICAgIGZvciAocmVjb3JkID0gdGhpcy5fcHJldmlvdXNJdEhlYWQgPSB0aGlzLl9pdEhlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0KSB7XG4gICAgICAgIHJlY29yZC5fbmV4dFByZXZpb3VzID0gcmVjb3JkLl9uZXh0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2FkZGl0aW9uc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0QWRkZWQpIHtcbiAgICAgICAgcmVjb3JkLnByZXZpb3VzSW5kZXggPSByZWNvcmQuY3VycmVudEluZGV4O1xuICAgICAgfVxuICAgICAgdGhpcy5fYWRkaXRpb25zSGVhZCA9IHRoaXMuX2FkZGl0aW9uc1RhaWwgPSBudWxsO1xuXG4gICAgICBmb3IgKHJlY29yZCA9IHRoaXMuX21vdmVzSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSBuZXh0UmVjb3JkKSB7XG4gICAgICAgIHJlY29yZC5wcmV2aW91c0luZGV4ID0gcmVjb3JkLmN1cnJlbnRJbmRleDtcbiAgICAgICAgbmV4dFJlY29yZCA9IHJlY29yZC5fbmV4dE1vdmVkO1xuICAgICAgfVxuICAgICAgdGhpcy5fbW92ZXNIZWFkID0gdGhpcy5fbW92ZXNUYWlsID0gbnVsbDtcbiAgICAgIHRoaXMuX3JlbW92YWxzSGVhZCA9IHRoaXMuX3JlbW92YWxzVGFpbCA9IG51bGw7XG4gICAgICB0aGlzLl9pZGVudGl0eUNoYW5nZXNIZWFkID0gdGhpcy5faWRlbnRpdHlDaGFuZ2VzVGFpbCA9IG51bGw7XG5cbiAgICAgIC8vIFRPRE8odmljYik6IHdoZW4gYXNzZXJ0IGdldHMgc3VwcG9ydGVkXG4gICAgICAvLyBhc3NlcnQoIXRoaXMuaXNEaXJ0eSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgdGhlIGNvcmUgZnVuY3Rpb24gd2hpY2ggaGFuZGxlcyBkaWZmZXJlbmNlcyBiZXR3ZWVuIGNvbGxlY3Rpb25zLlxuICAgKlxuICAgKiAtIGByZWNvcmRgIGlzIHRoZSByZWNvcmQgd2hpY2ggd2Ugc2F3IGF0IHRoaXMgcG9zaXRpb24gbGFzdCB0aW1lLiBJZiBudWxsIHRoZW4gaXQgaXMgYSBuZXdcbiAgICogICBpdGVtLlxuICAgKiAtIGBpdGVtYCBpcyB0aGUgY3VycmVudCBpdGVtIGluIHRoZSBjb2xsZWN0aW9uXG4gICAqIC0gYGluZGV4YCBpcyB0aGUgcG9zaXRpb24gb2YgdGhlIGl0ZW0gaW4gdGhlIGNvbGxlY3Rpb25cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfbWlzbWF0Y2gocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCwgaXRlbTogViwgaXRlbVRyYWNrQnk6IGFueSwgaW5kZXg6IG51bWJlcik6XG4gICAgICBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4ge1xuICAgIC8vIFRoZSBwcmV2aW91cyByZWNvcmQgYWZ0ZXIgd2hpY2ggd2Ugd2lsbCBhcHBlbmQgdGhlIGN1cnJlbnQgb25lLlxuICAgIGxldCBwcmV2aW91c1JlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGw7XG5cbiAgICBpZiAocmVjb3JkID09PSBudWxsKSB7XG4gICAgICBwcmV2aW91c1JlY29yZCA9IHRoaXMuX2l0VGFpbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldmlvdXNSZWNvcmQgPSByZWNvcmQuX3ByZXY7XG4gICAgICAvLyBSZW1vdmUgdGhlIHJlY29yZCBmcm9tIHRoZSBjb2xsZWN0aW9uIHNpbmNlIHdlIGtub3cgaXQgZG9lcyBub3QgbWF0Y2ggdGhlIGl0ZW0uXG4gICAgICB0aGlzLl9yZW1vdmUocmVjb3JkKTtcbiAgICB9XG5cbiAgICAvLyBBdHRlbXB0IHRvIHNlZSBpZiB3ZSBoYXZlIHNlZW4gdGhlIGl0ZW0gYmVmb3JlLlxuICAgIHJlY29yZCA9IHRoaXMuX2xpbmtlZFJlY29yZHMgPT09IG51bGwgPyBudWxsIDogdGhpcy5fbGlua2VkUmVjb3Jkcy5nZXQoaXRlbVRyYWNrQnksIGluZGV4KTtcbiAgICBpZiAocmVjb3JkICE9PSBudWxsKSB7XG4gICAgICAvLyBXZSBoYXZlIHNlZW4gdGhpcyBiZWZvcmUsIHdlIG5lZWQgdG8gbW92ZSBpdCBmb3J3YXJkIGluIHRoZSBjb2xsZWN0aW9uLlxuICAgICAgLy8gQnV0IGZpcnN0IHdlIG5lZWQgdG8gY2hlY2sgaWYgaWRlbnRpdHkgY2hhbmdlZCwgc28gd2UgY2FuIHVwZGF0ZSBpbiB2aWV3IGlmIG5lY2Vzc2FyeVxuICAgICAgaWYgKCFsb29zZUlkZW50aWNhbChyZWNvcmQuaXRlbSwgaXRlbSkpIHRoaXMuX2FkZElkZW50aXR5Q2hhbmdlKHJlY29yZCwgaXRlbSk7XG5cbiAgICAgIHRoaXMuX21vdmVBZnRlcihyZWNvcmQsIHByZXZpb3VzUmVjb3JkLCBpbmRleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5ldmVyIHNlZW4gaXQsIGNoZWNrIGV2aWN0ZWQgbGlzdC5cbiAgICAgIHJlY29yZCA9IHRoaXMuX3VubGlua2VkUmVjb3JkcyA9PT0gbnVsbCA/IG51bGwgOiB0aGlzLl91bmxpbmtlZFJlY29yZHMuZ2V0KGl0ZW1UcmFja0J5LCBudWxsKTtcbiAgICAgIGlmIChyZWNvcmQgIT09IG51bGwpIHtcbiAgICAgICAgLy8gSXQgaXMgYW4gaXRlbSB3aGljaCB3ZSBoYXZlIGV2aWN0ZWQgZWFybGllcjogcmVpbnNlcnQgaXQgYmFjayBpbnRvIHRoZSBsaXN0LlxuICAgICAgICAvLyBCdXQgZmlyc3Qgd2UgbmVlZCB0byBjaGVjayBpZiBpZGVudGl0eSBjaGFuZ2VkLCBzbyB3ZSBjYW4gdXBkYXRlIGluIHZpZXcgaWYgbmVjZXNzYXJ5XG4gICAgICAgIGlmICghbG9vc2VJZGVudGljYWwocmVjb3JkLml0ZW0sIGl0ZW0pKSB0aGlzLl9hZGRJZGVudGl0eUNoYW5nZShyZWNvcmQsIGl0ZW0pO1xuXG4gICAgICAgIHRoaXMuX3JlaW5zZXJ0QWZ0ZXIocmVjb3JkLCBwcmV2aW91c1JlY29yZCwgaW5kZXgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSXQgaXMgYSBuZXcgaXRlbTogYWRkIGl0LlxuICAgICAgICByZWNvcmQgPVxuICAgICAgICAgICAgdGhpcy5fYWRkQWZ0ZXIobmV3IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPihpdGVtLCBpdGVtVHJhY2tCeSksIHByZXZpb3VzUmVjb3JkLCBpbmRleCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBjaGVjayBpcyBvbmx5IG5lZWRlZCBpZiBhbiBhcnJheSBjb250YWlucyBkdXBsaWNhdGVzLiAoU2hvcnQgY2lyY3VpdCBvZiBub3RoaW5nIGRpcnR5KVxuICAgKlxuICAgKiBVc2UgY2FzZTogYFthLCBhXWAgPT4gYFtiLCBhLCBhXWBcbiAgICpcbiAgICogSWYgd2UgZGlkIG5vdCBoYXZlIHRoaXMgY2hlY2sgdGhlbiB0aGUgaW5zZXJ0aW9uIG9mIGBiYCB3b3VsZDpcbiAgICogICAxKSBldmljdCBmaXJzdCBgYWBcbiAgICogICAyKSBpbnNlcnQgYGJgIGF0IGAwYCBpbmRleC5cbiAgICogICAzKSBsZWF2ZSBgYWAgYXQgaW5kZXggYDFgIGFzIGlzLiA8LS0gdGhpcyBpcyB3cm9uZyFcbiAgICogICAzKSByZWluc2VydCBgYWAgYXQgaW5kZXggMi4gPC0tIHRoaXMgaXMgd3JvbmchXG4gICAqXG4gICAqIFRoZSBjb3JyZWN0IGJlaGF2aW9yIGlzOlxuICAgKiAgIDEpIGV2aWN0IGZpcnN0IGBhYFxuICAgKiAgIDIpIGluc2VydCBgYmAgYXQgYDBgIGluZGV4LlxuICAgKiAgIDMpIHJlaW5zZXJ0IGBhYCBhdCBpbmRleCAxLlxuICAgKiAgIDMpIG1vdmUgYGFgIGF0IGZyb20gYDFgIHRvIGAyYC5cbiAgICpcbiAgICpcbiAgICogRG91YmxlIGNoZWNrIHRoYXQgd2UgaGF2ZSBub3QgZXZpY3RlZCBhIGR1cGxpY2F0ZSBpdGVtLiBXZSBuZWVkIHRvIGNoZWNrIGlmIHRoZSBpdGVtIHR5cGUgbWF5XG4gICAqIGhhdmUgYWxyZWFkeSBiZWVuIHJlbW92ZWQ6XG4gICAqIFRoZSBpbnNlcnRpb24gb2YgYiB3aWxsIGV2aWN0IHRoZSBmaXJzdCAnYScuIElmIHdlIGRvbid0IHJlaW5zZXJ0IGl0IG5vdyBpdCB3aWxsIGJlIHJlaW5zZXJ0ZWRcbiAgICogYXQgdGhlIGVuZC4gV2hpY2ggd2lsbCBzaG93IHVwIGFzIHRoZSB0d28gJ2EncyBzd2l0Y2hpbmcgcG9zaXRpb24uIFRoaXMgaXMgaW5jb3JyZWN0LCBzaW5jZSBhXG4gICAqIGJldHRlciB3YXkgdG8gdGhpbmsgb2YgaXQgaXMgYXMgaW5zZXJ0IG9mICdiJyByYXRoZXIgdGhlbiBzd2l0Y2ggJ2EnIHdpdGggJ2InIGFuZCB0aGVuIGFkZCAnYSdcbiAgICogYXQgdGhlIGVuZC5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfdmVyaWZ5UmVpbnNlcnRpb24ocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4sIGl0ZW06IFYsIGl0ZW1UcmFja0J5OiBhbnksIGluZGV4OiBudW1iZXIpOlxuICAgICAgSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+IHtcbiAgICBsZXQgcmVpbnNlcnRSZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID1cbiAgICAgICAgdGhpcy5fdW5saW5rZWRSZWNvcmRzID09PSBudWxsID8gbnVsbCA6IHRoaXMuX3VubGlua2VkUmVjb3Jkcy5nZXQoaXRlbVRyYWNrQnksIG51bGwpO1xuICAgIGlmIChyZWluc2VydFJlY29yZCAhPT0gbnVsbCkge1xuICAgICAgcmVjb3JkID0gdGhpcy5fcmVpbnNlcnRBZnRlcihyZWluc2VydFJlY29yZCwgcmVjb3JkLl9wcmV2ICEsIGluZGV4KTtcbiAgICB9IGVsc2UgaWYgKHJlY29yZC5jdXJyZW50SW5kZXggIT0gaW5kZXgpIHtcbiAgICAgIHJlY29yZC5jdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICAgIHRoaXMuX2FkZFRvTW92ZXMocmVjb3JkLCBpbmRleCk7XG4gICAgfVxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHJpZCBvZiBhbnkgZXhjZXNzIHtAbGluayBJdGVyYWJsZUNoYW5nZVJlY29yZF99cyBmcm9tIHRoZSBwcmV2aW91cyBjb2xsZWN0aW9uXG4gICAqXG4gICAqIC0gYHJlY29yZGAgVGhlIGZpcnN0IGV4Y2VzcyB7QGxpbmsgSXRlcmFibGVDaGFuZ2VSZWNvcmRffS5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfdHJ1bmNhdGUocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCkge1xuICAgIC8vIEFueXRoaW5nIGFmdGVyIHRoYXQgbmVlZHMgdG8gYmUgcmVtb3ZlZDtcbiAgICB3aGlsZSAocmVjb3JkICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBuZXh0UmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IHJlY29yZC5fbmV4dDtcbiAgICAgIHRoaXMuX2FkZFRvUmVtb3ZhbHModGhpcy5fdW5saW5rKHJlY29yZCkpO1xuICAgICAgcmVjb3JkID0gbmV4dFJlY29yZDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3VubGlua2VkUmVjb3JkcyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5fdW5saW5rZWRSZWNvcmRzLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2FkZGl0aW9uc1RhaWwgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2FkZGl0aW9uc1RhaWwuX25leHRBZGRlZCA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9tb3Zlc1RhaWwgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX21vdmVzVGFpbC5fbmV4dE1vdmVkID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2l0VGFpbCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5faXRUYWlsLl9uZXh0ID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3JlbW92YWxzVGFpbCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVtb3ZhbHNUYWlsLl9uZXh0UmVtb3ZlZCA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9pZGVudGl0eUNoYW5nZXNUYWlsICE9PSBudWxsKSB7XG4gICAgICB0aGlzLl9pZGVudGl0eUNoYW5nZXNUYWlsLl9uZXh0SWRlbnRpdHlDaGFuZ2UgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlaW5zZXJ0QWZ0ZXIoXG4gICAgICByZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPiwgcHJldlJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwsXG4gICAgICBpbmRleDogbnVtYmVyKTogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+IHtcbiAgICBpZiAodGhpcy5fdW5saW5rZWRSZWNvcmRzICE9PSBudWxsKSB7XG4gICAgICB0aGlzLl91bmxpbmtlZFJlY29yZHMucmVtb3ZlKHJlY29yZCk7XG4gICAgfVxuICAgIGNvbnN0IHByZXYgPSByZWNvcmQuX3ByZXZSZW1vdmVkO1xuICAgIGNvbnN0IG5leHQgPSByZWNvcmQuX25leHRSZW1vdmVkO1xuXG4gICAgaWYgKHByZXYgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3JlbW92YWxzSGVhZCA9IG5leHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXYuX25leHRSZW1vdmVkID0gbmV4dDtcbiAgICB9XG4gICAgaWYgKG5leHQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3JlbW92YWxzVGFpbCA9IHByZXY7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHQuX3ByZXZSZW1vdmVkID0gcHJldjtcbiAgICB9XG5cbiAgICB0aGlzLl9pbnNlcnRBZnRlcihyZWNvcmQsIHByZXZSZWNvcmQsIGluZGV4KTtcbiAgICB0aGlzLl9hZGRUb01vdmVzKHJlY29yZCwgaW5kZXgpO1xuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tb3ZlQWZ0ZXIoXG4gICAgICByZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPiwgcHJldlJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwsXG4gICAgICBpbmRleDogbnVtYmVyKTogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+IHtcbiAgICB0aGlzLl91bmxpbmsocmVjb3JkKTtcbiAgICB0aGlzLl9pbnNlcnRBZnRlcihyZWNvcmQsIHByZXZSZWNvcmQsIGluZGV4KTtcbiAgICB0aGlzLl9hZGRUb01vdmVzKHJlY29yZCwgaW5kZXgpO1xuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRBZnRlcihcbiAgICAgIHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+LCBwcmV2UmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCxcbiAgICAgIGluZGV4OiBudW1iZXIpOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4ge1xuICAgIHRoaXMuX2luc2VydEFmdGVyKHJlY29yZCwgcHJldlJlY29yZCwgaW5kZXgpO1xuXG4gICAgaWYgKHRoaXMuX2FkZGl0aW9uc1RhaWwgPT09IG51bGwpIHtcbiAgICAgIC8vIFRPRE8odmljYik6XG4gICAgICAvLyBhc3NlcnQodGhpcy5fYWRkaXRpb25zSGVhZCA9PT0gbnVsbCk7XG4gICAgICB0aGlzLl9hZGRpdGlvbnNUYWlsID0gdGhpcy5fYWRkaXRpb25zSGVhZCA9IHJlY29yZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETyh2aWNiKTpcbiAgICAgIC8vIGFzc2VydChfYWRkaXRpb25zVGFpbC5fbmV4dEFkZGVkID09PSBudWxsKTtcbiAgICAgIC8vIGFzc2VydChyZWNvcmQuX25leHRBZGRlZCA9PT0gbnVsbCk7XG4gICAgICB0aGlzLl9hZGRpdGlvbnNUYWlsID0gdGhpcy5fYWRkaXRpb25zVGFpbC5fbmV4dEFkZGVkID0gcmVjb3JkO1xuICAgIH1cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaW5zZXJ0QWZ0ZXIoXG4gICAgICByZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPiwgcHJldlJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwsXG4gICAgICBpbmRleDogbnVtYmVyKTogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+IHtcbiAgICAvLyBUT0RPKHZpY2IpOlxuICAgIC8vIGFzc2VydChyZWNvcmQgIT0gcHJldlJlY29yZCk7XG4gICAgLy8gYXNzZXJ0KHJlY29yZC5fbmV4dCA9PT0gbnVsbCk7XG4gICAgLy8gYXNzZXJ0KHJlY29yZC5fcHJldiA9PT0gbnVsbCk7XG5cbiAgICBjb25zdCBuZXh0OiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9XG4gICAgICAgIHByZXZSZWNvcmQgPT09IG51bGwgPyB0aGlzLl9pdEhlYWQgOiBwcmV2UmVjb3JkLl9uZXh0O1xuICAgIC8vIFRPRE8odmljYik6XG4gICAgLy8gYXNzZXJ0KG5leHQgIT0gcmVjb3JkKTtcbiAgICAvLyBhc3NlcnQocHJldlJlY29yZCAhPSByZWNvcmQpO1xuICAgIHJlY29yZC5fbmV4dCA9IG5leHQ7XG4gICAgcmVjb3JkLl9wcmV2ID0gcHJldlJlY29yZDtcbiAgICBpZiAobmV4dCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faXRUYWlsID0gcmVjb3JkO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0Ll9wcmV2ID0gcmVjb3JkO1xuICAgIH1cbiAgICBpZiAocHJldlJlY29yZCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faXRIZWFkID0gcmVjb3JkO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2UmVjb3JkLl9uZXh0ID0gcmVjb3JkO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9saW5rZWRSZWNvcmRzID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9saW5rZWRSZWNvcmRzID0gbmV3IF9EdXBsaWNhdGVNYXA8Vj4oKTtcbiAgICB9XG4gICAgdGhpcy5fbGlua2VkUmVjb3Jkcy5wdXQocmVjb3JkKTtcblxuICAgIHJlY29yZC5jdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVtb3ZlKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+KTogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+IHtcbiAgICByZXR1cm4gdGhpcy5fYWRkVG9SZW1vdmFscyh0aGlzLl91bmxpbmsocmVjb3JkKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF91bmxpbmsocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4pOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4ge1xuICAgIGlmICh0aGlzLl9saW5rZWRSZWNvcmRzICE9PSBudWxsKSB7XG4gICAgICB0aGlzLl9saW5rZWRSZWNvcmRzLnJlbW92ZShyZWNvcmQpO1xuICAgIH1cblxuICAgIGNvbnN0IHByZXYgPSByZWNvcmQuX3ByZXY7XG4gICAgY29uc3QgbmV4dCA9IHJlY29yZC5fbmV4dDtcblxuICAgIC8vIFRPRE8odmljYik6XG4gICAgLy8gYXNzZXJ0KChyZWNvcmQuX3ByZXYgPSBudWxsKSA9PT0gbnVsbCk7XG4gICAgLy8gYXNzZXJ0KChyZWNvcmQuX25leHQgPSBudWxsKSA9PT0gbnVsbCk7XG5cbiAgICBpZiAocHJldiA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faXRIZWFkID0gbmV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldi5fbmV4dCA9IG5leHQ7XG4gICAgfVxuICAgIGlmIChuZXh0ID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9pdFRhaWwgPSBwcmV2O1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0Ll9wcmV2ID0gcHJldjtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkVG9Nb3ZlcyhyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPiwgdG9JbmRleDogbnVtYmVyKTogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+IHtcbiAgICAvLyBUT0RPKHZpY2IpOlxuICAgIC8vIGFzc2VydChyZWNvcmQuX25leHRNb3ZlZCA9PT0gbnVsbCk7XG5cbiAgICBpZiAocmVjb3JkLnByZXZpb3VzSW5kZXggPT09IHRvSW5kZXgpIHtcbiAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX21vdmVzVGFpbCA9PT0gbnVsbCkge1xuICAgICAgLy8gVE9ETyh2aWNiKTpcbiAgICAgIC8vIGFzc2VydChfbW92ZXNIZWFkID09PSBudWxsKTtcbiAgICAgIHRoaXMuX21vdmVzVGFpbCA9IHRoaXMuX21vdmVzSGVhZCA9IHJlY29yZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETyh2aWNiKTpcbiAgICAgIC8vIGFzc2VydChfbW92ZXNUYWlsLl9uZXh0TW92ZWQgPT09IG51bGwpO1xuICAgICAgdGhpcy5fbW92ZXNUYWlsID0gdGhpcy5fbW92ZXNUYWlsLl9uZXh0TW92ZWQgPSByZWNvcmQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlY29yZDtcbiAgfVxuXG4gIHByaXZhdGUgX2FkZFRvUmVtb3ZhbHMocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4pOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4ge1xuICAgIGlmICh0aGlzLl91bmxpbmtlZFJlY29yZHMgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3VubGlua2VkUmVjb3JkcyA9IG5ldyBfRHVwbGljYXRlTWFwPFY+KCk7XG4gICAgfVxuICAgIHRoaXMuX3VubGlua2VkUmVjb3Jkcy5wdXQocmVjb3JkKTtcbiAgICByZWNvcmQuY3VycmVudEluZGV4ID0gbnVsbDtcbiAgICByZWNvcmQuX25leHRSZW1vdmVkID0gbnVsbDtcblxuICAgIGlmICh0aGlzLl9yZW1vdmFsc1RhaWwgPT09IG51bGwpIHtcbiAgICAgIC8vIFRPRE8odmljYik6XG4gICAgICAvLyBhc3NlcnQoX3JlbW92YWxzSGVhZCA9PT0gbnVsbCk7XG4gICAgICB0aGlzLl9yZW1vdmFsc1RhaWwgPSB0aGlzLl9yZW1vdmFsc0hlYWQgPSByZWNvcmQ7XG4gICAgICByZWNvcmQuX3ByZXZSZW1vdmVkID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETyh2aWNiKTpcbiAgICAgIC8vIGFzc2VydChfcmVtb3ZhbHNUYWlsLl9uZXh0UmVtb3ZlZCA9PT0gbnVsbCk7XG4gICAgICAvLyBhc3NlcnQocmVjb3JkLl9uZXh0UmVtb3ZlZCA9PT0gbnVsbCk7XG4gICAgICByZWNvcmQuX3ByZXZSZW1vdmVkID0gdGhpcy5fcmVtb3ZhbHNUYWlsO1xuICAgICAgdGhpcy5fcmVtb3ZhbHNUYWlsID0gdGhpcy5fcmVtb3ZhbHNUYWlsLl9uZXh0UmVtb3ZlZCA9IHJlY29yZDtcbiAgICB9XG4gICAgcmV0dXJuIHJlY29yZDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZElkZW50aXR5Q2hhbmdlKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+LCBpdGVtOiBWKSB7XG4gICAgcmVjb3JkLml0ZW0gPSBpdGVtO1xuICAgIGlmICh0aGlzLl9pZGVudGl0eUNoYW5nZXNUYWlsID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9pZGVudGl0eUNoYW5nZXNUYWlsID0gdGhpcy5faWRlbnRpdHlDaGFuZ2VzSGVhZCA9IHJlY29yZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faWRlbnRpdHlDaGFuZ2VzVGFpbCA9IHRoaXMuX2lkZW50aXR5Q2hhbmdlc1RhaWwuX25leHRJZGVudGl0eUNoYW5nZSA9IHJlY29yZDtcbiAgICB9XG4gICAgcmV0dXJuIHJlY29yZDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+IGltcGxlbWVudHMgSXRlcmFibGVDaGFuZ2VSZWNvcmQ8Vj4ge1xuICBjdXJyZW50SW5kZXg6IG51bWJlcnxudWxsID0gbnVsbDtcbiAgcHJldmlvdXNJbmRleDogbnVtYmVyfG51bGwgPSBudWxsO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHRQcmV2aW91czogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9wcmV2OiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcHJldkR1cDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0RHVwOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ByZXZSZW1vdmVkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHRSZW1vdmVkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHRBZGRlZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0TW92ZWQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmV4dElkZW50aXR5Q2hhbmdlOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG5cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgaXRlbTogViwgcHVibGljIHRyYWNrQnlJZDogYW55KSB7fVxufVxuXG4vLyBBIGxpbmtlZCBsaXN0IG9mIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmRzIHdpdGggdGhlIHNhbWUgSXRlcmFibGVDaGFuZ2VSZWNvcmRfLml0ZW1cbmNsYXNzIF9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdDxWPiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2hlYWQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdGFpbDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBBcHBlbmQgdGhlIHJlY29yZCB0byB0aGUgbGlzdCBvZiBkdXBsaWNhdGVzLlxuICAgKlxuICAgKiBOb3RlOiBieSBkZXNpZ24gYWxsIHJlY29yZHMgaW4gdGhlIGxpc3Qgb2YgZHVwbGljYXRlcyBob2xkIHRoZSBzYW1lIHZhbHVlIGluIHJlY29yZC5pdGVtLlxuICAgKi9cbiAgYWRkKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2hlYWQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2hlYWQgPSB0aGlzLl90YWlsID0gcmVjb3JkO1xuICAgICAgcmVjb3JkLl9uZXh0RHVwID0gbnVsbDtcbiAgICAgIHJlY29yZC5fcHJldkR1cCA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRPRE8odmljYik6XG4gICAgICAvLyBhc3NlcnQocmVjb3JkLml0ZW0gPT0gIF9oZWFkLml0ZW0gfHxcbiAgICAgIC8vICAgICAgIHJlY29yZC5pdGVtIGlzIG51bSAmJiByZWNvcmQuaXRlbS5pc05hTiAmJiBfaGVhZC5pdGVtIGlzIG51bSAmJiBfaGVhZC5pdGVtLmlzTmFOKTtcbiAgICAgIHRoaXMuX3RhaWwgIS5fbmV4dER1cCA9IHJlY29yZDtcbiAgICAgIHJlY29yZC5fcHJldkR1cCA9IHRoaXMuX3RhaWw7XG4gICAgICByZWNvcmQuX25leHREdXAgPSBudWxsO1xuICAgICAgdGhpcy5fdGFpbCA9IHJlY29yZDtcbiAgICB9XG4gIH1cblxuICAvLyBSZXR1cm5zIGEgSXRlcmFibGVDaGFuZ2VSZWNvcmRfIGhhdmluZyBJdGVyYWJsZUNoYW5nZVJlY29yZF8udHJhY2tCeUlkID09IHRyYWNrQnlJZCBhbmRcbiAgLy8gSXRlcmFibGVDaGFuZ2VSZWNvcmRfLmN1cnJlbnRJbmRleCA+PSBhdE9yQWZ0ZXJJbmRleFxuICBnZXQodHJhY2tCeUlkOiBhbnksIGF0T3JBZnRlckluZGV4OiBudW1iZXJ8bnVsbCk6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsIHtcbiAgICBsZXQgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0RHVwKSB7XG4gICAgICBpZiAoKGF0T3JBZnRlckluZGV4ID09PSBudWxsIHx8IGF0T3JBZnRlckluZGV4IDw9IHJlY29yZC5jdXJyZW50SW5kZXggISkgJiZcbiAgICAgICAgICBsb29zZUlkZW50aWNhbChyZWNvcmQudHJhY2tCeUlkLCB0cmFja0J5SWQpKSB7XG4gICAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBvbmUge0BsaW5rIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkX30gZnJvbSB0aGUgbGlzdCBvZiBkdXBsaWNhdGVzLlxuICAgKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGxpc3Qgb2YgZHVwbGljYXRlcyBpcyBlbXB0eS5cbiAgICovXG4gIHJlbW92ZShyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPik6IGJvb2xlYW4ge1xuICAgIC8vIFRPRE8odmljYik6XG4gICAgLy8gYXNzZXJ0KCgpIHtcbiAgICAvLyAgLy8gdmVyaWZ5IHRoYXQgdGhlIHJlY29yZCBiZWluZyByZW1vdmVkIGlzIGluIHRoZSBsaXN0LlxuICAgIC8vICBmb3IgKEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXyBjdXJzb3IgPSBfaGVhZDsgY3Vyc29yICE9IG51bGw7IGN1cnNvciA9IGN1cnNvci5fbmV4dER1cCkge1xuICAgIC8vICAgIGlmIChpZGVudGljYWwoY3Vyc29yLCByZWNvcmQpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyAgfVxuICAgIC8vICByZXR1cm4gZmFsc2U7XG4gICAgLy99KTtcblxuICAgIGNvbnN0IHByZXY6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gcmVjb3JkLl9wcmV2RHVwO1xuICAgIGNvbnN0IG5leHQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gcmVjb3JkLl9uZXh0RHVwO1xuICAgIGlmIChwcmV2ID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9oZWFkID0gbmV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldi5fbmV4dER1cCA9IG5leHQ7XG4gICAgfVxuICAgIGlmIChuZXh0ID09PSBudWxsKSB7XG4gICAgICB0aGlzLl90YWlsID0gcHJldjtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dC5fcHJldkR1cCA9IHByZXY7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9oZWFkID09PSBudWxsO1xuICB9XG59XG5cbmNsYXNzIF9EdXBsaWNhdGVNYXA8Vj4ge1xuICBtYXAgPSBuZXcgTWFwPGFueSwgX0R1cGxpY2F0ZUl0ZW1SZWNvcmRMaXN0PFY+PigpO1xuXG4gIHB1dChyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPikge1xuICAgIGNvbnN0IGtleSA9IHJlY29yZC50cmFja0J5SWQ7XG5cbiAgICBsZXQgZHVwbGljYXRlcyA9IHRoaXMubWFwLmdldChrZXkpO1xuICAgIGlmICghZHVwbGljYXRlcykge1xuICAgICAgZHVwbGljYXRlcyA9IG5ldyBfRHVwbGljYXRlSXRlbVJlY29yZExpc3Q8Vj4oKTtcbiAgICAgIHRoaXMubWFwLnNldChrZXksIGR1cGxpY2F0ZXMpO1xuICAgIH1cbiAgICBkdXBsaWNhdGVzLmFkZChyZWNvcmQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBgdmFsdWVgIHVzaW5nIGtleS4gQmVjYXVzZSB0aGUgSXRlcmFibGVDaGFuZ2VSZWNvcmRfIHZhbHVlIG1heSBiZSBvbmUgd2hpY2ggd2VcbiAgICogaGF2ZSBhbHJlYWR5IGl0ZXJhdGVkIG92ZXIsIHdlIHVzZSB0aGUgYGF0T3JBZnRlckluZGV4YCB0byBwcmV0ZW5kIGl0IGlzIG5vdCB0aGVyZS5cbiAgICpcbiAgICogVXNlIGNhc2U6IGBbYSwgYiwgYywgYSwgYV1gIGlmIHdlIGFyZSBhdCBpbmRleCBgM2Agd2hpY2ggaXMgdGhlIHNlY29uZCBgYWAgdGhlbiBhc2tpbmcgaWYgd2VcbiAgICogaGF2ZSBhbnkgbW9yZSBgYWBzIG5lZWRzIHRvIHJldHVybiB0aGUgc2Vjb25kIGBhYC5cbiAgICovXG4gIGdldCh0cmFja0J5SWQ6IGFueSwgYXRPckFmdGVySW5kZXg6IG51bWJlcnxudWxsKTogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwge1xuICAgIGNvbnN0IGtleSA9IHRyYWNrQnlJZDtcbiAgICBjb25zdCByZWNvcmRMaXN0ID0gdGhpcy5tYXAuZ2V0KGtleSk7XG4gICAgcmV0dXJuIHJlY29yZExpc3QgPyByZWNvcmRMaXN0LmdldCh0cmFja0J5SWQsIGF0T3JBZnRlckluZGV4KSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIHtAbGluayBJdGVyYWJsZUNoYW5nZVJlY29yZF99IGZyb20gdGhlIGxpc3Qgb2YgZHVwbGljYXRlcy5cbiAgICpcbiAgICogVGhlIGxpc3Qgb2YgZHVwbGljYXRlcyBhbHNvIGlzIHJlbW92ZWQgZnJvbSB0aGUgbWFwIGlmIGl0IGdldHMgZW1wdHkuXG4gICAqL1xuICByZW1vdmUocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4pOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4ge1xuICAgIGNvbnN0IGtleSA9IHJlY29yZC50cmFja0J5SWQ7XG4gICAgY29uc3QgcmVjb3JkTGlzdDogX0R1cGxpY2F0ZUl0ZW1SZWNvcmRMaXN0PFY+ID0gdGhpcy5tYXAuZ2V0KGtleSkgITtcbiAgICAvLyBSZW1vdmUgdGhlIGxpc3Qgb2YgZHVwbGljYXRlcyB3aGVuIGl0IGdldHMgZW1wdHlcbiAgICBpZiAocmVjb3JkTGlzdC5yZW1vdmUocmVjb3JkKSkge1xuICAgICAgdGhpcy5tYXAuZGVsZXRlKGtleSk7XG4gICAgfVxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICBnZXQgaXNFbXB0eSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMubWFwLnNpemUgPT09IDA7IH1cblxuICBjbGVhcigpIHsgdGhpcy5tYXAuY2xlYXIoKTsgfVxufVxuXG5mdW5jdGlvbiBnZXRQcmV2aW91c0luZGV4KFxuICAgIGl0ZW06IGFueSwgYWRkUmVtb3ZlT2Zmc2V0OiBudW1iZXIsIG1vdmVPZmZzZXRzOiBudW1iZXJbXSB8IG51bGwpOiBudW1iZXIge1xuICBjb25zdCBwcmV2aW91c0luZGV4ID0gaXRlbS5wcmV2aW91c0luZGV4O1xuICBpZiAocHJldmlvdXNJbmRleCA9PT0gbnVsbCkgcmV0dXJuIHByZXZpb3VzSW5kZXg7XG4gIGxldCBtb3ZlT2Zmc2V0ID0gMDtcbiAgaWYgKG1vdmVPZmZzZXRzICYmIHByZXZpb3VzSW5kZXggPCBtb3ZlT2Zmc2V0cy5sZW5ndGgpIHtcbiAgICBtb3ZlT2Zmc2V0ID0gbW92ZU9mZnNldHNbcHJldmlvdXNJbmRleF07XG4gIH1cbiAgcmV0dXJuIHByZXZpb3VzSW5kZXggKyBhZGRSZW1vdmVPZmZzZXQgKyBtb3ZlT2Zmc2V0O1xufVxuIl19