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
import { defineInjectable } from '../../di/defs';
import { Optional, SkipSelf } from '../../di/metadata';
import { DefaultIterableDifferFactory } from '../differs/default_iterable_differ';
/**
 * A strategy for tracking changes over time to an iterable. Used by {\@link NgForOf} to
 * respond to changes in an iterable by effecting equivalent changes in the DOM.
 *
 *
 * @record
 * @template V
 */
export function IterableDiffer() { }
function IterableDiffer_tsickle_Closure_declarations() {
    /**
     * Compute a difference between the previous state and the new `object` state.
     *
     * \@param object containing the new value.
     * \@return an object describing the difference. The return value is only valid until the next
     * `diff()` invocation.
     * @type {?}
     */
    IterableDiffer.prototype.diff;
}
/**
 * An object describing the changes in the `Iterable` collection since last time
 * `IterableDiffer#diff()` was invoked.
 *
 *
 * @record
 * @template V
 */
export function IterableChanges() { }
function IterableChanges_tsickle_Closure_declarations() {
    /**
     * Iterate over all changes. `IterableChangeRecord` will contain information about changes
     * to each item.
     * @type {?}
     */
    IterableChanges.prototype.forEachItem;
    /**
     * Iterate over a set of operations which when applied to the original `Iterable` will produce the
     * new `Iterable`.
     *
     * NOTE: These are not necessarily the actual operations which were applied to the original
     * `Iterable`, rather these are a set of computed operations which may not be the same as the
     * ones applied.
     *
     * \@param record A change which needs to be applied
     * \@param previousIndex The `IterableChangeRecord#previousIndex` of the `record` refers to the
     *        original `Iterable` location, where as `previousIndex` refers to the transient location
     *        of the item, after applying the operations up to this point.
     * \@param currentIndex The `IterableChangeRecord#currentIndex` of the `record` refers to the
     *        original `Iterable` location, where as `currentIndex` refers to the transient location
     *        of the item, after applying the operations up to this point.
     * @type {?}
     */
    IterableChanges.prototype.forEachOperation;
    /**
     * Iterate over changes in the order of original `Iterable` showing where the original items
     * have moved.
     * @type {?}
     */
    IterableChanges.prototype.forEachPreviousItem;
    /**
     * Iterate over all added items.
     * @type {?}
     */
    IterableChanges.prototype.forEachAddedItem;
    /**
     * Iterate over all moved items.
     * @type {?}
     */
    IterableChanges.prototype.forEachMovedItem;
    /**
     * Iterate over all removed items.
     * @type {?}
     */
    IterableChanges.prototype.forEachRemovedItem;
    /**
     * Iterate over all items which had their identity (as computed by the `TrackByFunction`)
     * changed.
     * @type {?}
     */
    IterableChanges.prototype.forEachIdentityChange;
}
/**
 * Record representing the item change information.
 *
 *
 * @record
 * @template V
 */
export function IterableChangeRecord() { }
function IterableChangeRecord_tsickle_Closure_declarations() {
    /**
     * Current index of the item in `Iterable` or null if removed.
     * @type {?}
     */
    IterableChangeRecord.prototype.currentIndex;
    /**
     * Previous index of the item in `Iterable` or null if added.
     * @type {?}
     */
    IterableChangeRecord.prototype.previousIndex;
    /**
     * The item.
     * @type {?}
     */
    IterableChangeRecord.prototype.item;
    /**
     * Track by identity as computed by the `TrackByFunction`.
     * @type {?}
     */
    IterableChangeRecord.prototype.trackById;
}
/**
 * @deprecated v4.0.0 - Use IterableChangeRecord instead.
 * @record
 * @template V
 */
export function CollectionChangeRecord() { }
function CollectionChangeRecord_tsickle_Closure_declarations() {
}
/**
 * An optional function passed into {\@link NgForOf} that defines how to track
 * items in an iterable (e.g. fby index or id)
 *
 *
 * @record
 * @template T
 */
export function TrackByFunction() { }
function TrackByFunction_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (index: number, item: T): any;
    */
}
/**
 * Provides a factory for {\@link IterableDiffer}.
 *
 *
 * @record
 */
export function IterableDifferFactory() { }
function IterableDifferFactory_tsickle_Closure_declarations() {
    /** @type {?} */
    IterableDifferFactory.prototype.supports;
    /** @type {?} */
    IterableDifferFactory.prototype.create;
}
/**
 * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
 *
 */
export class IterableDiffers {
    /**
     * @param {?} factories
     */
    constructor(factories) { this.factories = factories; }
    /**
     * @param {?} factories
     * @param {?=} parent
     * @return {?}
     */
    static create(factories, parent) {
        if (parent != null) {
            const /** @type {?} */ copied = parent.factories.slice();
            factories = factories.concat(copied);
        }
        return new IterableDiffers(factories);
    }
    /**
     * Takes an array of {\@link IterableDifferFactory} and returns a provider used to extend the
     * inherited {\@link IterableDiffers} instance with the provided factories and return a new
     * {\@link IterableDiffers} instance.
     *
     * \@usageNotes
     * ### Example
     *
     * The following example shows how to extend an existing list of factories,
     * which will only be applied to the injector for this component and its children.
     * This step is all that's required to make a new {\@link IterableDiffer} available.
     *
     * ```
     * \@Component({
     *   viewProviders: [
     *     IterableDiffers.extend([new ImmutableListDiffer()])
     *   ]
     * })
     * ```
     * @param {?} factories
     * @return {?}
     */
    static extend(factories) {
        return {
            provide: IterableDiffers,
            useFactory: (parent) => {
                if (!parent) {
                    // Typically would occur when calling IterableDiffers.extend inside of dependencies passed
                    // to
                    // bootstrap(), which would override default pipes instead of extending them.
                    throw new Error('Cannot extend IterableDiffers without a parent injector');
                }
                return IterableDiffers.create(factories, parent);
            },
            // Dependency technically isn't optional, but we can provide a better error message this way.
            deps: [[IterableDiffers, new SkipSelf(), new Optional()]]
        };
    }
    /**
     * @param {?} iterable
     * @return {?}
     */
    find(iterable) {
        const /** @type {?} */ factory = this.factories.find(f => f.supports(iterable));
        if (factory != null) {
            return factory;
        }
        else {
            throw new Error(`Cannot find a differ supporting object '${iterable}' of type '${getTypeNameForDebugging(iterable)}'`);
        }
    }
}
/** @nocollapse */ IterableDiffers.ngInjectableDef = defineInjectable({
    providedIn: 'root',
    factory: () => new IterableDiffers([new DefaultIterableDifferFactory()])
});
function IterableDiffers_tsickle_Closure_declarations() {
    /** @type {?} */
    IterableDiffers.ngInjectableDef;
    /**
     * @deprecated v4.0.0 - Should be private
     * @type {?}
     */
    IterableDiffers.prototype.factories;
}
/**
 * @param {?} type
 * @return {?}
 */
export function getTypeNameForDebugging(type) {
    return type['name'] || typeof type;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlcmFibGVfZGlmZmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2NoYW5nZV9kZXRlY3Rpb24vZGlmZmVycy9pdGVyYWJsZV9kaWZmZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQy9DLE9BQU8sRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFckQsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sb0NBQW9DLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBK0hoRixNQUFNOzs7O0lBVUosWUFBWSxTQUFrQyxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLEVBQUU7Ozs7OztJQUUvRSxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQWtDLEVBQUUsTUFBd0I7UUFDeEUsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbkIsdUJBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDeEMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDdEM7UUFFRCxNQUFNLENBQUMsSUFBSSxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDdkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBc0JELE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBa0M7UUFDOUMsTUFBTSxDQUFDO1lBQ0wsT0FBTyxFQUFFLGVBQWU7WUFDeEIsVUFBVSxFQUFFLENBQUMsTUFBdUIsRUFBRSxFQUFFO2dCQUN0QyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Ozs7b0JBSVosTUFBTSxJQUFJLEtBQUssQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO2lCQUM1RTtnQkFDRCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDbEQ7O1lBRUQsSUFBSSxFQUFFLENBQUMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxRQUFRLEVBQUUsRUFBRSxJQUFJLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDMUQsQ0FBQztLQUNIOzs7OztJQUVELElBQUksQ0FBQyxRQUFhO1FBQ2hCLHVCQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMvRCxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNwQixNQUFNLENBQUMsT0FBTyxDQUFDO1NBQ2hCO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLElBQUksS0FBSyxDQUNYLDJDQUEyQyxRQUFRLGNBQWMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzVHO0tBQ0Y7O2tDQWpFd0IsZ0JBQWdCLENBQUM7SUFDeEMsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksZUFBZSxDQUFDLENBQUMsSUFBSSw0QkFBNEIsRUFBRSxDQUFDLENBQUM7Q0FDekUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUFpRUosTUFBTSxrQ0FBa0MsSUFBUztJQUMvQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDO0NBQ3BDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2RlZmluZUluamVjdGFibGV9IGZyb20gJy4uLy4uL2RpL2RlZnMnO1xuaW1wb3J0IHtPcHRpb25hbCwgU2tpcFNlbGZ9IGZyb20gJy4uLy4uL2RpL21ldGFkYXRhJztcbmltcG9ydCB7U3RhdGljUHJvdmlkZXJ9IGZyb20gJy4uLy4uL2RpL3Byb3ZpZGVyJztcbmltcG9ydCB7RGVmYXVsdEl0ZXJhYmxlRGlmZmVyRmFjdG9yeX0gZnJvbSAnLi4vZGlmZmVycy9kZWZhdWx0X2l0ZXJhYmxlX2RpZmZlcic7XG5cblxuLyoqXG4gKiBBIHR5cGUgZGVzY3JpYmluZyBzdXBwb3J0ZWQgaXRlcmFibGUgdHlwZXMuXG4gKlxuICpcbiAqL1xuZXhwb3J0IHR5cGUgTmdJdGVyYWJsZTxUPiA9IEFycmF5PFQ+fCBJdGVyYWJsZTxUPjtcblxuLyoqXG4gKiBBIHN0cmF0ZWd5IGZvciB0cmFja2luZyBjaGFuZ2VzIG92ZXIgdGltZSB0byBhbiBpdGVyYWJsZS4gVXNlZCBieSB7QGxpbmsgTmdGb3JPZn0gdG9cbiAqIHJlc3BvbmQgdG8gY2hhbmdlcyBpbiBhbiBpdGVyYWJsZSBieSBlZmZlY3RpbmcgZXF1aXZhbGVudCBjaGFuZ2VzIGluIHRoZSBET00uXG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJdGVyYWJsZURpZmZlcjxWPiB7XG4gIC8qKlxuICAgKiBDb21wdXRlIGEgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBwcmV2aW91cyBzdGF0ZSBhbmQgdGhlIG5ldyBgb2JqZWN0YCBzdGF0ZS5cbiAgICpcbiAgICogQHBhcmFtIG9iamVjdCBjb250YWluaW5nIHRoZSBuZXcgdmFsdWUuXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBkaWZmZXJlbmNlLiBUaGUgcmV0dXJuIHZhbHVlIGlzIG9ubHkgdmFsaWQgdW50aWwgdGhlIG5leHRcbiAgICogYGRpZmYoKWAgaW52b2NhdGlvbi5cbiAgICovXG4gIGRpZmYob2JqZWN0OiBOZ0l0ZXJhYmxlPFY+KTogSXRlcmFibGVDaGFuZ2VzPFY+fG51bGw7XG59XG5cbi8qKlxuICogQW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNoYW5nZXMgaW4gdGhlIGBJdGVyYWJsZWAgY29sbGVjdGlvbiBzaW5jZSBsYXN0IHRpbWVcbiAqIGBJdGVyYWJsZURpZmZlciNkaWZmKClgIHdhcyBpbnZva2VkLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmFibGVDaGFuZ2VzPFY+IHtcbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciBhbGwgY2hhbmdlcy4gYEl0ZXJhYmxlQ2hhbmdlUmVjb3JkYCB3aWxsIGNvbnRhaW4gaW5mb3JtYXRpb24gYWJvdXQgY2hhbmdlc1xuICAgKiB0byBlYWNoIGl0ZW0uXG4gICAqL1xuICBmb3JFYWNoSXRlbShmbjogKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8Vj4pID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBJdGVyYXRlIG92ZXIgYSBzZXQgb2Ygb3BlcmF0aW9ucyB3aGljaCB3aGVuIGFwcGxpZWQgdG8gdGhlIG9yaWdpbmFsIGBJdGVyYWJsZWAgd2lsbCBwcm9kdWNlIHRoZVxuICAgKiBuZXcgYEl0ZXJhYmxlYC5cbiAgICpcbiAgICogTk9URTogVGhlc2UgYXJlIG5vdCBuZWNlc3NhcmlseSB0aGUgYWN0dWFsIG9wZXJhdGlvbnMgd2hpY2ggd2VyZSBhcHBsaWVkIHRvIHRoZSBvcmlnaW5hbFxuICAgKiBgSXRlcmFibGVgLCByYXRoZXIgdGhlc2UgYXJlIGEgc2V0IG9mIGNvbXB1dGVkIG9wZXJhdGlvbnMgd2hpY2ggbWF5IG5vdCBiZSB0aGUgc2FtZSBhcyB0aGVcbiAgICogb25lcyBhcHBsaWVkLlxuICAgKlxuICAgKiBAcGFyYW0gcmVjb3JkIEEgY2hhbmdlIHdoaWNoIG5lZWRzIHRvIGJlIGFwcGxpZWRcbiAgICogQHBhcmFtIHByZXZpb3VzSW5kZXggVGhlIGBJdGVyYWJsZUNoYW5nZVJlY29yZCNwcmV2aW91c0luZGV4YCBvZiB0aGUgYHJlY29yZGAgcmVmZXJzIHRvIHRoZVxuICAgKiAgICAgICAgb3JpZ2luYWwgYEl0ZXJhYmxlYCBsb2NhdGlvbiwgd2hlcmUgYXMgYHByZXZpb3VzSW5kZXhgIHJlZmVycyB0byB0aGUgdHJhbnNpZW50IGxvY2F0aW9uXG4gICAqICAgICAgICBvZiB0aGUgaXRlbSwgYWZ0ZXIgYXBwbHlpbmcgdGhlIG9wZXJhdGlvbnMgdXAgdG8gdGhpcyBwb2ludC5cbiAgICogQHBhcmFtIGN1cnJlbnRJbmRleCBUaGUgYEl0ZXJhYmxlQ2hhbmdlUmVjb3JkI2N1cnJlbnRJbmRleGAgb2YgdGhlIGByZWNvcmRgIHJlZmVycyB0byB0aGVcbiAgICogICAgICAgIG9yaWdpbmFsIGBJdGVyYWJsZWAgbG9jYXRpb24sIHdoZXJlIGFzIGBjdXJyZW50SW5kZXhgIHJlZmVycyB0byB0aGUgdHJhbnNpZW50IGxvY2F0aW9uXG4gICAqICAgICAgICBvZiB0aGUgaXRlbSwgYWZ0ZXIgYXBwbHlpbmcgdGhlIG9wZXJhdGlvbnMgdXAgdG8gdGhpcyBwb2ludC5cbiAgICovXG4gIGZvckVhY2hPcGVyYXRpb24oXG4gICAgICBmbjpcbiAgICAgICAgICAocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxWPiwgcHJldmlvdXNJbmRleDogbnVtYmVyfG51bGwsXG4gICAgICAgICAgIGN1cnJlbnRJbmRleDogbnVtYmVyfG51bGwpID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBJdGVyYXRlIG92ZXIgY2hhbmdlcyBpbiB0aGUgb3JkZXIgb2Ygb3JpZ2luYWwgYEl0ZXJhYmxlYCBzaG93aW5nIHdoZXJlIHRoZSBvcmlnaW5hbCBpdGVtc1xuICAgKiBoYXZlIG1vdmVkLlxuICAgKi9cbiAgZm9yRWFjaFByZXZpb3VzSXRlbShmbjogKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8Vj4pID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKiBJdGVyYXRlIG92ZXIgYWxsIGFkZGVkIGl0ZW1zLiAqL1xuICBmb3JFYWNoQWRkZWRJdGVtKGZuOiAocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxWPikgPT4gdm9pZCk6IHZvaWQ7XG5cbiAgLyoqIEl0ZXJhdGUgb3ZlciBhbGwgbW92ZWQgaXRlbXMuICovXG4gIGZvckVhY2hNb3ZlZEl0ZW0oZm46IChyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPFY+KSA9PiB2b2lkKTogdm9pZDtcblxuICAvKiogSXRlcmF0ZSBvdmVyIGFsbCByZW1vdmVkIGl0ZW1zLiAqL1xuICBmb3JFYWNoUmVtb3ZlZEl0ZW0oZm46IChyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPFY+KSA9PiB2b2lkKTogdm9pZDtcblxuICAvKiogSXRlcmF0ZSBvdmVyIGFsbCBpdGVtcyB3aGljaCBoYWQgdGhlaXIgaWRlbnRpdHkgKGFzIGNvbXB1dGVkIGJ5IHRoZSBgVHJhY2tCeUZ1bmN0aW9uYClcbiAgICogY2hhbmdlZC4gKi9cbiAgZm9yRWFjaElkZW50aXR5Q2hhbmdlKGZuOiAocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxWPikgPT4gdm9pZCk6IHZvaWQ7XG59XG5cbi8qKlxuICogUmVjb3JkIHJlcHJlc2VudGluZyB0aGUgaXRlbSBjaGFuZ2UgaW5mb3JtYXRpb24uXG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJdGVyYWJsZUNoYW5nZVJlY29yZDxWPiB7XG4gIC8qKiBDdXJyZW50IGluZGV4IG9mIHRoZSBpdGVtIGluIGBJdGVyYWJsZWAgb3IgbnVsbCBpZiByZW1vdmVkLiAqL1xuICByZWFkb25seSBjdXJyZW50SW5kZXg6IG51bWJlcnxudWxsO1xuXG4gIC8qKiBQcmV2aW91cyBpbmRleCBvZiB0aGUgaXRlbSBpbiBgSXRlcmFibGVgIG9yIG51bGwgaWYgYWRkZWQuICovXG4gIHJlYWRvbmx5IHByZXZpb3VzSW5kZXg6IG51bWJlcnxudWxsO1xuXG4gIC8qKiBUaGUgaXRlbS4gKi9cbiAgcmVhZG9ubHkgaXRlbTogVjtcblxuICAvKiogVHJhY2sgYnkgaWRlbnRpdHkgYXMgY29tcHV0ZWQgYnkgdGhlIGBUcmFja0J5RnVuY3Rpb25gLiAqL1xuICByZWFkb25seSB0cmFja0J5SWQ6IGFueTtcbn1cblxuLyoqXG4gKiBAZGVwcmVjYXRlZCB2NC4wLjAgLSBVc2UgSXRlcmFibGVDaGFuZ2VSZWNvcmQgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkPFY+IGV4dGVuZHMgSXRlcmFibGVDaGFuZ2VSZWNvcmQ8Vj4ge31cblxuLyoqXG4gKiBBbiBvcHRpb25hbCBmdW5jdGlvbiBwYXNzZWQgaW50byB7QGxpbmsgTmdGb3JPZn0gdGhhdCBkZWZpbmVzIGhvdyB0byB0cmFja1xuICogaXRlbXMgaW4gYW4gaXRlcmFibGUgKGUuZy4gZmJ5IGluZGV4IG9yIGlkKVxuICpcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJhY2tCeUZ1bmN0aW9uPFQ+IHsgKGluZGV4OiBudW1iZXIsIGl0ZW06IFQpOiBhbnk7IH1cblxuLyoqXG4gKiBQcm92aWRlcyBhIGZhY3RvcnkgZm9yIHtAbGluayBJdGVyYWJsZURpZmZlcn0uXG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJdGVyYWJsZURpZmZlckZhY3Rvcnkge1xuICBzdXBwb3J0cyhvYmplY3RzOiBhbnkpOiBib29sZWFuO1xuICBjcmVhdGU8Vj4odHJhY2tCeUZuPzogVHJhY2tCeUZ1bmN0aW9uPFY+KTogSXRlcmFibGVEaWZmZXI8Vj47XG59XG5cbi8qKlxuICogQSByZXBvc2l0b3J5IG9mIGRpZmZlcmVudCBpdGVyYWJsZSBkaWZmaW5nIHN0cmF0ZWdpZXMgdXNlZCBieSBOZ0ZvciwgTmdDbGFzcywgYW5kIG90aGVycy5cbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBJdGVyYWJsZURpZmZlcnMge1xuICBzdGF0aWMgbmdJbmplY3RhYmxlRGVmID0gZGVmaW5lSW5qZWN0YWJsZSh7XG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6ICgpID0+IG5ldyBJdGVyYWJsZURpZmZlcnMoW25ldyBEZWZhdWx0SXRlcmFibGVEaWZmZXJGYWN0b3J5KCldKVxuICB9KTtcblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgdjQuMC4wIC0gU2hvdWxkIGJlIHByaXZhdGVcbiAgICovXG4gIGZhY3RvcmllczogSXRlcmFibGVEaWZmZXJGYWN0b3J5W107XG4gIGNvbnN0cnVjdG9yKGZhY3RvcmllczogSXRlcmFibGVEaWZmZXJGYWN0b3J5W10pIHsgdGhpcy5mYWN0b3JpZXMgPSBmYWN0b3JpZXM7IH1cblxuICBzdGF0aWMgY3JlYXRlKGZhY3RvcmllczogSXRlcmFibGVEaWZmZXJGYWN0b3J5W10sIHBhcmVudD86IEl0ZXJhYmxlRGlmZmVycyk6IEl0ZXJhYmxlRGlmZmVycyB7XG4gICAgaWYgKHBhcmVudCAhPSBudWxsKSB7XG4gICAgICBjb25zdCBjb3BpZWQgPSBwYXJlbnQuZmFjdG9yaWVzLnNsaWNlKCk7XG4gICAgICBmYWN0b3JpZXMgPSBmYWN0b3JpZXMuY29uY2F0KGNvcGllZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBJdGVyYWJsZURpZmZlcnMoZmFjdG9yaWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhbiBhcnJheSBvZiB7QGxpbmsgSXRlcmFibGVEaWZmZXJGYWN0b3J5fSBhbmQgcmV0dXJucyBhIHByb3ZpZGVyIHVzZWQgdG8gZXh0ZW5kIHRoZVxuICAgKiBpbmhlcml0ZWQge0BsaW5rIEl0ZXJhYmxlRGlmZmVyc30gaW5zdGFuY2Ugd2l0aCB0aGUgcHJvdmlkZWQgZmFjdG9yaWVzIGFuZCByZXR1cm4gYSBuZXdcbiAgICoge0BsaW5rIEl0ZXJhYmxlRGlmZmVyc30gaW5zdGFuY2UuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gZXh0ZW5kIGFuIGV4aXN0aW5nIGxpc3Qgb2YgZmFjdG9yaWVzLFxuICAgKiB3aGljaCB3aWxsIG9ubHkgYmUgYXBwbGllZCB0byB0aGUgaW5qZWN0b3IgZm9yIHRoaXMgY29tcG9uZW50IGFuZCBpdHMgY2hpbGRyZW4uXG4gICAqIFRoaXMgc3RlcCBpcyBhbGwgdGhhdCdzIHJlcXVpcmVkIHRvIG1ha2UgYSBuZXcge0BsaW5rIEl0ZXJhYmxlRGlmZmVyfSBhdmFpbGFibGUuXG4gICAqXG4gICAqIGBgYFxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICB2aWV3UHJvdmlkZXJzOiBbXG4gICAqICAgICBJdGVyYWJsZURpZmZlcnMuZXh0ZW5kKFtuZXcgSW1tdXRhYmxlTGlzdERpZmZlcigpXSlcbiAgICogICBdXG4gICAqIH0pXG4gICAqIGBgYFxuICAgKi9cbiAgc3RhdGljIGV4dGVuZChmYWN0b3JpZXM6IEl0ZXJhYmxlRGlmZmVyRmFjdG9yeVtdKTogU3RhdGljUHJvdmlkZXIge1xuICAgIHJldHVybiB7XG4gICAgICBwcm92aWRlOiBJdGVyYWJsZURpZmZlcnMsXG4gICAgICB1c2VGYWN0b3J5OiAocGFyZW50OiBJdGVyYWJsZURpZmZlcnMpID0+IHtcbiAgICAgICAgaWYgKCFwYXJlbnQpIHtcbiAgICAgICAgICAvLyBUeXBpY2FsbHkgd291bGQgb2NjdXIgd2hlbiBjYWxsaW5nIEl0ZXJhYmxlRGlmZmVycy5leHRlbmQgaW5zaWRlIG9mIGRlcGVuZGVuY2llcyBwYXNzZWRcbiAgICAgICAgICAvLyB0b1xuICAgICAgICAgIC8vIGJvb3RzdHJhcCgpLCB3aGljaCB3b3VsZCBvdmVycmlkZSBkZWZhdWx0IHBpcGVzIGluc3RlYWQgb2YgZXh0ZW5kaW5nIHRoZW0uXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZXh0ZW5kIEl0ZXJhYmxlRGlmZmVycyB3aXRob3V0IGEgcGFyZW50IGluamVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEl0ZXJhYmxlRGlmZmVycy5jcmVhdGUoZmFjdG9yaWVzLCBwYXJlbnQpO1xuICAgICAgfSxcbiAgICAgIC8vIERlcGVuZGVuY3kgdGVjaG5pY2FsbHkgaXNuJ3Qgb3B0aW9uYWwsIGJ1dCB3ZSBjYW4gcHJvdmlkZSBhIGJldHRlciBlcnJvciBtZXNzYWdlIHRoaXMgd2F5LlxuICAgICAgZGVwczogW1tJdGVyYWJsZURpZmZlcnMsIG5ldyBTa2lwU2VsZigpLCBuZXcgT3B0aW9uYWwoKV1dXG4gICAgfTtcbiAgfVxuXG4gIGZpbmQoaXRlcmFibGU6IGFueSk6IEl0ZXJhYmxlRGlmZmVyRmFjdG9yeSB7XG4gICAgY29uc3QgZmFjdG9yeSA9IHRoaXMuZmFjdG9yaWVzLmZpbmQoZiA9PiBmLnN1cHBvcnRzKGl0ZXJhYmxlKSk7XG4gICAgaWYgKGZhY3RvcnkgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQ2Fubm90IGZpbmQgYSBkaWZmZXIgc3VwcG9ydGluZyBvYmplY3QgJyR7aXRlcmFibGV9JyBvZiB0eXBlICcke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKGl0ZXJhYmxlKX0nYCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyh0eXBlOiBhbnkpOiBzdHJpbmcge1xuICByZXR1cm4gdHlwZVsnbmFtZSddIHx8IHR5cGVvZiB0eXBlO1xufVxuIl19