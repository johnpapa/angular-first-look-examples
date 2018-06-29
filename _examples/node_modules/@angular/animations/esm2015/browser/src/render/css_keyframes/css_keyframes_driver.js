/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { allowPreviousPlayerStylesMerge, balancePreviousStylesIntoKeyframes } from '../../util';
import { containsElement, hypenatePropsObject, invokeQuery, matchesElement, validateStyleProperty } from '../shared';
import { CssKeyframesPlayer } from './css_keyframes_player';
import { DirectStylePlayer } from './direct_style_player';
const /** @type {?} */ KEYFRAMES_NAME_PREFIX = 'gen_css_kf_';
const /** @type {?} */ TAB_SPACE = ' ';
export class CssKeyframesDriver {
    constructor() {
        this._count = 0;
        this._head = document.querySelector('head');
        this._warningIssued = false;
    }
    /**
     * @param {?} prop
     * @return {?}
     */
    validateStyleProperty(prop) { return validateStyleProperty(prop); }
    /**
     * @param {?} element
     * @param {?} selector
     * @return {?}
     */
    matchesElement(element, selector) {
        return matchesElement(element, selector);
    }
    /**
     * @param {?} elm1
     * @param {?} elm2
     * @return {?}
     */
    containsElement(elm1, elm2) { return containsElement(elm1, elm2); }
    /**
     * @param {?} element
     * @param {?} selector
     * @param {?} multi
     * @return {?}
     */
    query(element, selector, multi) {
        return invokeQuery(element, selector, multi);
    }
    /**
     * @param {?} element
     * @param {?} prop
     * @param {?=} defaultValue
     * @return {?}
     */
    computeStyle(element, prop, defaultValue) {
        return /** @type {?} */ ((/** @type {?} */ (window.getComputedStyle(element)))[prop]);
    }
    /**
     * @param {?} element
     * @param {?} name
     * @param {?} keyframes
     * @return {?}
     */
    buildKeyframeElement(element, name, keyframes) {
        keyframes = keyframes.map(kf => hypenatePropsObject(kf));
        let /** @type {?} */ keyframeStr = `@keyframes ${name} {\n`;
        let /** @type {?} */ tab = '';
        keyframes.forEach(kf => {
            tab = TAB_SPACE;
            const /** @type {?} */ offset = parseFloat(kf["offset"]);
            keyframeStr += `${tab}${offset * 100}% {\n`;
            tab += TAB_SPACE;
            Object.keys(kf).forEach(prop => {
                const /** @type {?} */ value = kf[prop];
                switch (prop) {
                    case 'offset':
                        return;
                    case 'easing':
                        if (value) {
                            keyframeStr += `${tab}animation-timing-function: ${value};\n`;
                        }
                        return;
                    default:
                        keyframeStr += `${tab}${prop}: ${value};\n`;
                        return;
                }
            });
            keyframeStr += `${tab}}\n`;
        });
        keyframeStr += `}\n`;
        const /** @type {?} */ kfElm = document.createElement('style');
        kfElm.innerHTML = keyframeStr;
        return kfElm;
    }
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @param {?=} scrubberAccessRequested
     * @return {?}
     */
    animate(element, keyframes, duration, delay, easing, previousPlayers = [], scrubberAccessRequested) {
        if (scrubberAccessRequested) {
            this._notifyFaultyScrubber();
        }
        const /** @type {?} */ previousCssKeyframePlayers = /** @type {?} */ (previousPlayers.filter(player => player instanceof CssKeyframesPlayer));
        const /** @type {?} */ previousStyles = {};
        if (allowPreviousPlayerStylesMerge(duration, delay)) {
            previousCssKeyframePlayers.forEach(player => {
                let /** @type {?} */ styles = player.currentSnapshot;
                Object.keys(styles).forEach(prop => previousStyles[prop] = styles[prop]);
            });
        }
        keyframes = balancePreviousStylesIntoKeyframes(element, keyframes, previousStyles);
        const /** @type {?} */ finalStyles = flattenKeyframesIntoStyles(keyframes);
        // if there is no animation then there is no point in applying
        // styles and waiting for an event to get fired. This causes lag.
        // It's better to just directly apply the styles to the element
        // via the direct styling animation player.
        if (duration == 0) {
            return new DirectStylePlayer(element, finalStyles);
        }
        const /** @type {?} */ animationName = `${KEYFRAMES_NAME_PREFIX}${this._count++}`;
        const /** @type {?} */ kfElm = this.buildKeyframeElement(element, animationName, keyframes); /** @type {?} */
        ((document.querySelector('head'))).appendChild(kfElm);
        const /** @type {?} */ player = new CssKeyframesPlayer(element, keyframes, animationName, duration, delay, easing, finalStyles);
        player.onDestroy(() => removeElement(kfElm));
        return player;
    }
    /**
     * @return {?}
     */
    _notifyFaultyScrubber() {
        if (!this._warningIssued) {
            console.warn('@angular/animations: please load the web-animations.js polyfill to allow programmatic access...\n', '  visit http://bit.ly/IWukam to learn more about using the web-animation-js polyfill.');
            this._warningIssued = true;
        }
    }
}
function CssKeyframesDriver_tsickle_Closure_declarations() {
    /** @type {?} */
    CssKeyframesDriver.prototype._count;
    /** @type {?} */
    CssKeyframesDriver.prototype._head;
    /** @type {?} */
    CssKeyframesDriver.prototype._warningIssued;
}
/**
 * @param {?} keyframes
 * @return {?}
 */
function flattenKeyframesIntoStyles(keyframes) {
    let /** @type {?} */ flatKeyframes = {};
    if (keyframes) {
        const /** @type {?} */ kfs = Array.isArray(keyframes) ? keyframes : [keyframes];
        kfs.forEach(kf => {
            Object.keys(kf).forEach(prop => {
                if (prop == 'offset' || prop == 'easing')
                    return;
                flatKeyframes[prop] = kf[prop];
            });
        });
    }
    return flatKeyframes;
}
/**
 * @param {?} node
 * @return {?}
 */
function removeElement(node) {
    node.parentNode.removeChild(node);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzX2tleWZyYW1lc19kcml2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL3JlbmRlci9jc3Nfa2V5ZnJhbWVzL2Nzc19rZXlmcmFtZXNfZHJpdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFTQSxPQUFPLEVBQUMsOEJBQThCLEVBQUUsa0NBQWtDLEVBQWUsTUFBTSxZQUFZLENBQUM7QUFFNUcsT0FBTyxFQUFDLGVBQWUsRUFBRSxtQkFBbUIsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLHFCQUFxQixFQUFDLE1BQU0sV0FBVyxDQUFDO0FBRW5ILE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzFELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRXhELHVCQUFNLHFCQUFxQixHQUFHLGFBQWEsQ0FBQztBQUM1Qyx1QkFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBRXRCLE1BQU07O3NCQUNhLENBQUM7cUJBQ1ksUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7OEJBQ25DLEtBQUs7Ozs7OztJQUU5QixxQkFBcUIsQ0FBQyxJQUFZLElBQWEsTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7Ozs7OztJQUVwRixjQUFjLENBQUMsT0FBWSxFQUFFLFFBQWdCO1FBQzNDLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzFDOzs7Ozs7SUFFRCxlQUFlLENBQUMsSUFBUyxFQUFFLElBQVMsSUFBYSxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFOzs7Ozs7O0lBRXRGLEtBQUssQ0FBQyxPQUFZLEVBQUUsUUFBZ0IsRUFBRSxLQUFjO1FBQ2xELE1BQU0sQ0FBQyxXQUFX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LENBQUM7SUFDN0MsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNkLHVCQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM3QixFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksUUFBUSxJQUFJLElBQUksSUFBSSxRQUFRLENBQUM7b0JBQUMsTUFBTSxDQUFDO2dCQUNqRCxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hDLENBQUMsQ0FBQztTQUNKLENBQUMsQ0FBQztLQUNKO0lBQ0QsTUFBTSxDQUFDLGFBQWEsQ0FBQztDQUN0Qjs7Ozs7QUFFRCx1QkFBdUIsSUFBUztJQUM5QixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNuQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uUGxheWVyLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7YWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlLCBiYWxhbmNlUHJldmlvdXNTdHlsZXNJbnRvS2V5ZnJhbWVzLCBjb21wdXRlU3R5bGV9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXJ9IGZyb20gJy4uL2FuaW1hdGlvbl9kcml2ZXInO1xuaW1wb3J0IHtjb250YWluc0VsZW1lbnQsIGh5cGVuYXRlUHJvcHNPYmplY3QsIGludm9rZVF1ZXJ5LCBtYXRjaGVzRWxlbWVudCwgdmFsaWRhdGVTdHlsZVByb3BlcnR5fSBmcm9tICcuLi9zaGFyZWQnO1xuXG5pbXBvcnQge0Nzc0tleWZyYW1lc1BsYXllcn0gZnJvbSAnLi9jc3Nfa2V5ZnJhbWVzX3BsYXllcic7XG5pbXBvcnQge0RpcmVjdFN0eWxlUGxheWVyfSBmcm9tICcuL2RpcmVjdF9zdHlsZV9wbGF5ZXInO1xuXG5jb25zdCBLRVlGUkFNRVNfTkFNRV9QUkVGSVggPSAnZ2VuX2Nzc19rZl8nO1xuY29uc3QgVEFCX1NQQUNFID0gJyAnO1xuXG5leHBvcnQgY2xhc3MgQ3NzS2V5ZnJhbWVzRHJpdmVyIGltcGxlbWVudHMgQW5pbWF0aW9uRHJpdmVyIHtcbiAgcHJpdmF0ZSBfY291bnQgPSAwO1xuICBwcml2YXRlIHJlYWRvbmx5IF9oZWFkOiBhbnkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkJyk7XG4gIHByaXZhdGUgX3dhcm5pbmdJc3N1ZWQgPSBmYWxzZTtcblxuICB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcCk7IH1cblxuICBtYXRjaGVzRWxlbWVudChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbWF0Y2hlc0VsZW1lbnQoZWxlbWVudCwgc2VsZWN0b3IpO1xuICB9XG5cbiAgY29udGFpbnNFbGVtZW50KGVsbTE6IGFueSwgZWxtMjogYW55KTogYm9vbGVhbiB7IHJldHVybiBjb250YWluc0VsZW1lbnQoZWxtMSwgZWxtMik7IH1cblxuICBxdWVyeShlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKTogYW55W10ge1xuICAgIHJldHVybiBpbnZva2VRdWVyeShlbGVtZW50LCBzZWxlY3RvciwgbXVsdGkpO1xuICB9XG5cbiAgY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiAod2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkgYXMgYW55KVtwcm9wXSBhcyBzdHJpbmc7XG4gIH1cblxuICBidWlsZEtleWZyYW1lRWxlbWVudChlbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZywga2V5ZnJhbWVzOiB7W2tleTogc3RyaW5nXTogYW55fVtdKTogYW55IHtcbiAgICBrZXlmcmFtZXMgPSBrZXlmcmFtZXMubWFwKGtmID0+IGh5cGVuYXRlUHJvcHNPYmplY3Qoa2YpKTtcbiAgICBsZXQga2V5ZnJhbWVTdHIgPSBgQGtleWZyYW1lcyAke25hbWV9IHtcXG5gO1xuICAgIGxldCB0YWIgPSAnJztcbiAgICBrZXlmcmFtZXMuZm9yRWFjaChrZiA9PiB7XG4gICAgICB0YWIgPSBUQUJfU1BBQ0U7XG4gICAgICBjb25zdCBvZmZzZXQgPSBwYXJzZUZsb2F0KGtmLm9mZnNldCk7XG4gICAgICBrZXlmcmFtZVN0ciArPSBgJHt0YWJ9JHtvZmZzZXQgKiAxMDB9JSB7XFxuYDtcbiAgICAgIHRhYiArPSBUQUJfU1BBQ0U7XG4gICAgICBPYmplY3Qua2V5cyhrZikuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBrZltwcm9wXTtcbiAgICAgICAgc3dpdGNoIChwcm9wKSB7XG4gICAgICAgICAgY2FzZSAnb2Zmc2V0JzpcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICBjYXNlICdlYXNpbmcnOlxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgIGtleWZyYW1lU3RyICs9IGAke3RhYn1hbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiAke3ZhbHVlfTtcXG5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBrZXlmcmFtZVN0ciArPSBgJHt0YWJ9JHtwcm9wfTogJHt2YWx1ZX07XFxuYDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBrZXlmcmFtZVN0ciArPSBgJHt0YWJ9fVxcbmA7XG4gICAgfSk7XG4gICAga2V5ZnJhbWVTdHIgKz0gYH1cXG5gO1xuXG4gICAgY29uc3Qga2ZFbG0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIGtmRWxtLmlubmVySFRNTCA9IGtleWZyYW1lU3RyO1xuICAgIHJldHVybiBrZkVsbTtcbiAgfVxuXG4gIGFuaW1hdGUoXG4gICAgICBlbGVtZW50OiBhbnksIGtleWZyYW1lczogybVTdHlsZURhdGFbXSwgZHVyYXRpb246IG51bWJlciwgZGVsYXk6IG51bWJlciwgZWFzaW5nOiBzdHJpbmcsXG4gICAgICBwcmV2aW91c1BsYXllcnM6IEFuaW1hdGlvblBsYXllcltdID0gW10sIHNjcnViYmVyQWNjZXNzUmVxdWVzdGVkPzogYm9vbGVhbik6IEFuaW1hdGlvblBsYXllciB7XG4gICAgaWYgKHNjcnViYmVyQWNjZXNzUmVxdWVzdGVkKSB7XG4gICAgICB0aGlzLl9ub3RpZnlGYXVsdHlTY3J1YmJlcigpO1xuICAgIH1cblxuICAgIGNvbnN0IHByZXZpb3VzQ3NzS2V5ZnJhbWVQbGF5ZXJzID0gPENzc0tleWZyYW1lc1BsYXllcltdPnByZXZpb3VzUGxheWVycy5maWx0ZXIoXG4gICAgICAgIHBsYXllciA9PiBwbGF5ZXIgaW5zdGFuY2VvZiBDc3NLZXlmcmFtZXNQbGF5ZXIpO1xuXG4gICAgY29uc3QgcHJldmlvdXNTdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG5cbiAgICBpZiAoYWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlKGR1cmF0aW9uLCBkZWxheSkpIHtcbiAgICAgIHByZXZpb3VzQ3NzS2V5ZnJhbWVQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgbGV0IHN0eWxlcyA9IHBsYXllci5jdXJyZW50U25hcHNob3Q7XG4gICAgICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChwcm9wID0+IHByZXZpb3VzU3R5bGVzW3Byb3BdID0gc3R5bGVzW3Byb3BdKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGtleWZyYW1lcyA9IGJhbGFuY2VQcmV2aW91c1N0eWxlc0ludG9LZXlmcmFtZXMoZWxlbWVudCwga2V5ZnJhbWVzLCBwcmV2aW91c1N0eWxlcyk7XG4gICAgY29uc3QgZmluYWxTdHlsZXMgPSBmbGF0dGVuS2V5ZnJhbWVzSW50b1N0eWxlcyhrZXlmcmFtZXMpO1xuXG4gICAgLy8gaWYgdGhlcmUgaXMgbm8gYW5pbWF0aW9uIHRoZW4gdGhlcmUgaXMgbm8gcG9pbnQgaW4gYXBwbHlpbmdcbiAgICAvLyBzdHlsZXMgYW5kIHdhaXRpbmcgZm9yIGFuIGV2ZW50IHRvIGdldCBmaXJlZC4gVGhpcyBjYXVzZXMgbGFnLlxuICAgIC8vIEl0J3MgYmV0dGVyIHRvIGp1c3QgZGlyZWN0bHkgYXBwbHkgdGhlIHN0eWxlcyB0byB0aGUgZWxlbWVudFxuICAgIC8vIHZpYSB0aGUgZGlyZWN0IHN0eWxpbmcgYW5pbWF0aW9uIHBsYXllci5cbiAgICBpZiAoZHVyYXRpb24gPT0gMCkge1xuICAgICAgcmV0dXJuIG5ldyBEaXJlY3RTdHlsZVBsYXllcihlbGVtZW50LCBmaW5hbFN0eWxlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgYW5pbWF0aW9uTmFtZSA9IGAke0tFWUZSQU1FU19OQU1FX1BSRUZJWH0ke3RoaXMuX2NvdW50Kyt9YDtcbiAgICBjb25zdCBrZkVsbSA9IHRoaXMuYnVpbGRLZXlmcmFtZUVsZW1lbnQoZWxlbWVudCwgYW5pbWF0aW9uTmFtZSwga2V5ZnJhbWVzKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkJykgIS5hcHBlbmRDaGlsZChrZkVsbSk7XG5cbiAgICBjb25zdCBwbGF5ZXIgPSBuZXcgQ3NzS2V5ZnJhbWVzUGxheWVyKFxuICAgICAgICBlbGVtZW50LCBrZXlmcmFtZXMsIGFuaW1hdGlvbk5hbWUsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBmaW5hbFN0eWxlcyk7XG5cbiAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHJlbW92ZUVsZW1lbnQoa2ZFbG0pKTtcbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG5cbiAgcHJpdmF0ZSBfbm90aWZ5RmF1bHR5U2NydWJiZXIoKSB7XG4gICAgaWYgKCF0aGlzLl93YXJuaW5nSXNzdWVkKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgJ0Bhbmd1bGFyL2FuaW1hdGlvbnM6IHBsZWFzZSBsb2FkIHRoZSB3ZWItYW5pbWF0aW9ucy5qcyBwb2x5ZmlsbCB0byBhbGxvdyBwcm9ncmFtbWF0aWMgYWNjZXNzLi4uXFxuJyxcbiAgICAgICAgICAnICB2aXNpdCBodHRwOi8vYml0Lmx5L0lXdWthbSB0byBsZWFybiBtb3JlIGFib3V0IHVzaW5nIHRoZSB3ZWItYW5pbWF0aW9uLWpzIHBvbHlmaWxsLicpO1xuICAgICAgdGhpcy5fd2FybmluZ0lzc3VlZCA9IHRydWU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5LZXlmcmFtZXNJbnRvU3R5bGVzKFxuICAgIGtleWZyYW1lczogbnVsbCB8IHtba2V5OiBzdHJpbmddOiBhbnl9IHwge1trZXk6IHN0cmluZ106IGFueX1bXSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgbGV0IGZsYXRLZXlmcmFtZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gIGlmIChrZXlmcmFtZXMpIHtcbiAgICBjb25zdCBrZnMgPSBBcnJheS5pc0FycmF5KGtleWZyYW1lcykgPyBrZXlmcmFtZXMgOiBba2V5ZnJhbWVzXTtcbiAgICBrZnMuZm9yRWFjaChrZiA9PiB7XG4gICAgICBPYmplY3Qua2V5cyhrZikuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgaWYgKHByb3AgPT0gJ29mZnNldCcgfHwgcHJvcCA9PSAnZWFzaW5nJykgcmV0dXJuO1xuICAgICAgICBmbGF0S2V5ZnJhbWVzW3Byb3BdID0ga2ZbcHJvcF07XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZmxhdEtleWZyYW1lcztcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRWxlbWVudChub2RlOiBhbnkpIHtcbiAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xufVxuIl19