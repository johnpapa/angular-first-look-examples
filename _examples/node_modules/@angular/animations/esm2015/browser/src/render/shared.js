/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { AUTO_STYLE, NoopAnimationPlayer, ɵAnimationGroupPlayer, ɵPRE_STYLE as PRE_STYLE } from '@angular/animations';
/**
 * @param {?} players
 * @return {?}
 */
export function optimizeGroupPlayer(players) {
    switch (players.length) {
        case 0:
            return new NoopAnimationPlayer();
        case 1:
            return players[0];
        default:
            return new ɵAnimationGroupPlayer(players);
    }
}
/**
 * @param {?} driver
 * @param {?} normalizer
 * @param {?} element
 * @param {?} keyframes
 * @param {?=} preStyles
 * @param {?=} postStyles
 * @return {?}
 */
export function normalizeKeyframes(driver, normalizer, element, keyframes, preStyles = {}, postStyles = {}) {
    const /** @type {?} */ errors = [];
    const /** @type {?} */ normalizedKeyframes = [];
    let /** @type {?} */ previousOffset = -1;
    let /** @type {?} */ previousKeyframe = null;
    keyframes.forEach(kf => {
        const /** @type {?} */ offset = /** @type {?} */ (kf['offset']);
        const /** @type {?} */ isSameOffset = offset == previousOffset;
        const /** @type {?} */ normalizedKeyframe = (isSameOffset && previousKeyframe) || {};
        Object.keys(kf).forEach(prop => {
            let /** @type {?} */ normalizedProp = prop;
            let /** @type {?} */ normalizedValue = kf[prop];
            if (prop !== 'offset') {
                normalizedProp = normalizer.normalizePropertyName(normalizedProp, errors);
                switch (normalizedValue) {
                    case PRE_STYLE:
                        normalizedValue = preStyles[prop];
                        break;
                    case AUTO_STYLE:
                        normalizedValue = postStyles[prop];
                        break;
                    default:
                        normalizedValue =
                            normalizer.normalizeStyleValue(prop, normalizedProp, normalizedValue, errors);
                        break;
                }
            }
            normalizedKeyframe[normalizedProp] = normalizedValue;
        });
        if (!isSameOffset) {
            normalizedKeyframes.push(normalizedKeyframe);
        }
        previousKeyframe = normalizedKeyframe;
        previousOffset = offset;
    });
    if (errors.length) {
        const /** @type {?} */ LINE_START = '\n - ';
        throw new Error(`Unable to animate due to the following errors:${LINE_START}${errors.join(LINE_START)}`);
    }
    return normalizedKeyframes;
}
/**
 * @param {?} player
 * @param {?} eventName
 * @param {?} event
 * @param {?} callback
 * @return {?}
 */
export function listenOnPlayer(player, eventName, event, callback) {
    switch (eventName) {
        case 'start':
            player.onStart(() => callback(event && copyAnimationEvent(event, 'start', player)));
            break;
        case 'done':
            player.onDone(() => callback(event && copyAnimationEvent(event, 'done', player)));
            break;
        case 'destroy':
            player.onDestroy(() => callback(event && copyAnimationEvent(event, 'destroy', player)));
            break;
    }
}
/**
 * @param {?} e
 * @param {?} phaseName
 * @param {?} player
 * @return {?}
 */
export function copyAnimationEvent(e, phaseName, player) {
    const /** @type {?} */ totalTime = player.totalTime;
    const /** @type {?} */ disabled = (/** @type {?} */ (player)).disabled ? true : false;
    const /** @type {?} */ event = makeAnimationEvent(e.element, e.triggerName, e.fromState, e.toState, phaseName || e.phaseName, totalTime == undefined ? e.totalTime : totalTime, disabled);
    const /** @type {?} */ data = (/** @type {?} */ (e))['_data'];
    if (data != null) {
        (/** @type {?} */ (event))['_data'] = data;
    }
    return event;
}
/**
 * @param {?} element
 * @param {?} triggerName
 * @param {?} fromState
 * @param {?} toState
 * @param {?=} phaseName
 * @param {?=} totalTime
 * @param {?=} disabled
 * @return {?}
 */
export function makeAnimationEvent(element, triggerName, fromState, toState, phaseName = '', totalTime = 0, disabled) {
    return { element, triggerName, fromState, toState, phaseName, totalTime, disabled: !!disabled };
}
/**
 * @param {?} map
 * @param {?} key
 * @param {?} defaultValue
 * @return {?}
 */
export function getOrSetAsInMap(map, key, defaultValue) {
    let /** @type {?} */ value;
    if (map instanceof Map) {
        value = map.get(key);
        if (!value) {
            map.set(key, value = defaultValue);
        }
    }
    else {
        value = map[key];
        if (!value) {
            value = map[key] = defaultValue;
        }
    }
    return value;
}
/**
 * @param {?} command
 * @return {?}
 */
export function parseTimelineCommand(command) {
    const /** @type {?} */ separatorPos = command.indexOf(':');
    const /** @type {?} */ id = command.substring(1, separatorPos);
    const /** @type {?} */ action = command.substr(separatorPos + 1);
    return [id, action];
}
let /** @type {?} */ _contains = (elm1, elm2) => false;
const ɵ0 = _contains;
let /** @type {?} */ _matches = (element, selector) => false;
const ɵ1 = _matches;
let /** @type {?} */ _query = (element, selector, multi) => {
    return [];
};
const ɵ2 = _query;
if (typeof Element != 'undefined') {
    // this is well supported in all browsers
    _contains = (elm1, elm2) => { return /** @type {?} */ (elm1.contains(elm2)); };
    if (Element.prototype.matches) {
        _matches = (element, selector) => element.matches(selector);
    }
    else {
        const /** @type {?} */ proto = /** @type {?} */ (Element.prototype);
        const /** @type {?} */ fn = proto.matchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector ||
            proto.oMatchesSelector || proto.webkitMatchesSelector;
        if (fn) {
            _matches = (element, selector) => fn.apply(element, [selector]);
        }
    }
    _query = (element, selector, multi) => {
        let /** @type {?} */ results = [];
        if (multi) {
            results.push(...element.querySelectorAll(selector));
        }
        else {
            const /** @type {?} */ elm = element.querySelector(selector);
            if (elm) {
                results.push(elm);
            }
        }
        return results;
    };
}
/**
 * @param {?} prop
 * @return {?}
 */
function containsVendorPrefix(prop) {
    // Webkit is the only real popular vendor prefix nowadays
    // cc: http://shouldiprefix.com/
    return prop.substring(1, 6) == 'ebkit'; // webkit or Webkit
}
let /** @type {?} */ _CACHED_BODY = null;
let /** @type {?} */ _IS_WEBKIT = false;
/**
 * @param {?} prop
 * @return {?}
 */
export function validateStyleProperty(prop) {
    if (!_CACHED_BODY) {
        _CACHED_BODY = getBodyNode() || {};
        _IS_WEBKIT = /** @type {?} */ ((_CACHED_BODY)).style ? ('WebkitAppearance' in /** @type {?} */ ((_CACHED_BODY)).style) : false;
    }
    let /** @type {?} */ result = true;
    if (/** @type {?} */ ((_CACHED_BODY)).style && !containsVendorPrefix(prop)) {
        result = prop in /** @type {?} */ ((_CACHED_BODY)).style;
        if (!result && _IS_WEBKIT) {
            const /** @type {?} */ camelProp = 'Webkit' + prop.charAt(0).toUpperCase() + prop.substr(1);
            result = camelProp in /** @type {?} */ ((_CACHED_BODY)).style;
        }
    }
    return result;
}
/**
 * @return {?}
 */
export function getBodyNode() {
    if (typeof document != 'undefined') {
        return document.body;
    }
    return null;
}
export const /** @type {?} */ matchesElement = _matches;
export const /** @type {?} */ containsElement = _contains;
export const /** @type {?} */ invokeQuery = _query;
/**
 * @param {?} object
 * @return {?}
 */
export function hypenatePropsObject(object) {
    const /** @type {?} */ newObj = {};
    Object.keys(object).forEach(prop => {
        const /** @type {?} */ newProp = prop.replace(/([a-z])([A-Z])/g, '$1-$2');
        newObj[newProp] = object[prop];
    });
    return newObj;
}
export { ɵ0, ɵ1, ɵ2 };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvc2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFPQSxPQUFPLEVBQUMsVUFBVSxFQUFtQyxtQkFBbUIsRUFBRSxxQkFBcUIsRUFBRSxVQUFVLElBQUksU0FBUyxFQUFhLE1BQU0scUJBQXFCLENBQUM7Ozs7O0FBS2pLLE1BQU0sOEJBQThCLE9BQTBCO0lBQzVELE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLEtBQUssQ0FBQztZQUNKLE1BQU0sQ0FBQyxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDbkMsS0FBSyxDQUFDO1lBQ0osTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQjtZQUNFLE1BQU0sQ0FBQyxJQUFJLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzdDO0NBQ0Y7Ozs7Ozs7Ozs7QUFFRCxNQUFNLDZCQUNGLE1BQXVCLEVBQUUsVUFBb0MsRUFBRSxPQUFZLEVBQzNFLFNBQXVCLEVBQUUsWUFBd0IsRUFBRSxFQUNuRCxhQUF5QixFQUFFO0lBQzdCLHVCQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7SUFDNUIsdUJBQU0sbUJBQW1CLEdBQWlCLEVBQUUsQ0FBQztJQUM3QyxxQkFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDeEIscUJBQUksZ0JBQWdCLEdBQW9CLElBQUksQ0FBQztJQUM3QyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ3JCLHVCQUFNLE1BQU0scUJBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBVyxDQUFBLENBQUM7UUFDdEMsdUJBQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxjQUFjLENBQUM7UUFDOUMsdUJBQU0sa0JBQWtCLEdBQWUsQ0FB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QyxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7S0FDdEI7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0NBQ2I7QUFFRCxNQUFNLENBQUMsdUJBQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQztBQUN2QyxNQUFNLENBQUMsdUJBQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQztBQUN6QyxNQUFNLENBQUMsdUJBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQzs7Ozs7QUFFbEMsTUFBTSw4QkFBOEIsTUFBNEI7SUFDOUQsdUJBQU0sTUFBTSxHQUF5QixFQUFFLENBQUM7SUFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDakMsdUJBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNoQyxDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsTUFBTSxDQUFDO0NBQ2YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FVVE9fU1RZTEUsIEFuaW1hdGlvbkV2ZW50LCBBbmltYXRpb25QbGF5ZXIsIE5vb3BBbmltYXRpb25QbGF5ZXIsIMm1QW5pbWF0aW9uR3JvdXBQbGF5ZXIsIMm1UFJFX1NUWUxFIGFzIFBSRV9TVFlMRSwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge0FuaW1hdGlvblN0eWxlTm9ybWFsaXplcn0gZnJvbSAnLi4vLi4vc3JjL2RzbC9zdHlsZV9ub3JtYWxpemF0aW9uL2FuaW1hdGlvbl9zdHlsZV9ub3JtYWxpemVyJztcbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuLi8uLi9zcmMvcmVuZGVyL2FuaW1hdGlvbl9kcml2ZXInO1xuXG5leHBvcnQgZnVuY3Rpb24gb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSk6IEFuaW1hdGlvblBsYXllciB7XG4gIHN3aXRjaCAocGxheWVycy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoKTtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gcGxheWVyc1swXTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG5ldyDJtUFuaW1hdGlvbkdyb3VwUGxheWVyKHBsYXllcnMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVLZXlmcmFtZXMoXG4gICAgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIG5vcm1hbGl6ZXI6IEFuaW1hdGlvblN0eWxlTm9ybWFsaXplciwgZWxlbWVudDogYW55LFxuICAgIGtleWZyYW1lczogybVTdHlsZURhdGFbXSwgcHJlU3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9LFxuICAgIHBvc3RTdHlsZXM6IMm1U3R5bGVEYXRhID0ge30pOiDJtVN0eWxlRGF0YVtdIHtcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBub3JtYWxpemVkS2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdID0gW107XG4gIGxldCBwcmV2aW91c09mZnNldCA9IC0xO1xuICBsZXQgcHJldmlvdXNLZXlmcmFtZTogybVTdHlsZURhdGF8bnVsbCA9IG51bGw7XG4gIGtleWZyYW1lcy5mb3JFYWNoKGtmID0+IHtcbiAgICBjb25zdCBvZmZzZXQgPSBrZlsnb2Zmc2V0J10gYXMgbnVtYmVyO1xuICAgIGNvbnN0IGlzU2FtZU9mZnNldCA9IG9mZnNldCA9PSBwcmV2aW91c09mZnNldDtcbiAgICBjb25zdCBub3JtYWxpemVkS2V5ZnJhbWU6IMm1U3R5bGVEYXRhID0gKGlzU2FtZU9mZnNldCAmJiBwcmV2aW91c0tleWZyYW1lKSB8fCB7fTtcbiAgICBPYmplY3Qua2V5cyhrZikuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGxldCBub3JtYWxpemVkUHJvcCA9IHByb3A7XG4gICAgICBsZXQgbm9ybWFsaXplZFZhbHVlID0ga2ZbcHJvcF07XG4gICAgICBpZiAocHJvcCAhPT0gJ29mZnNldCcpIHtcbiAgICAgICAgbm9ybWFsaXplZFByb3AgPSBub3JtYWxpemVyLm5vcm1hbGl6ZVByb3BlcnR5TmFtZShub3JtYWxpemVkUHJvcCwgZXJyb3JzKTtcbiAgICAgICAgc3dpdGNoIChub3JtYWxpemVkVmFsdWUpIHtcbiAgICAgICAgICBjYXNlIFBSRV9TVFlMRTpcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9IHByZVN0eWxlc1twcm9wXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBBVVRPX1NUWUxFOlxuICAgICAgICAgICAgbm9ybWFsaXplZFZhbHVlID0gcG9zdFN0eWxlc1twcm9wXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9XG4gICAgICAgICAgICAgICAgbm9ybWFsaXplci5ub3JtYWxpemVTdHlsZVZhbHVlKHByb3AsIG5vcm1hbGl6ZWRQcm9wLCBub3JtYWxpemVkVmFsdWUsIGVycm9ycyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbm9ybWFsaXplZEtleWZyYW1lW25vcm1hbGl6ZWRQcm9wXSA9IG5vcm1hbGl6ZWRWYWx1ZTtcbiAgICB9KTtcbiAgICBpZiAoIWlzU2FtZU9mZnNldCkge1xuICAgICAgbm9ybWFsaXplZEtleWZyYW1lcy5wdXNoKG5vcm1hbGl6ZWRLZXlmcmFtZSk7XG4gICAgfVxuICAgIHByZXZpb3VzS2V5ZnJhbWUgPSBub3JtYWxpemVkS2V5ZnJhbWU7XG4gICAgcHJldmlvdXNPZmZzZXQgPSBvZmZzZXQ7XG4gIH0pO1xuICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgIGNvbnN0IExJTkVfU1RBUlQgPSAnXFxuIC0gJztcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gYW5pbWF0ZSBkdWUgdG8gdGhlIGZvbGxvd2luZyBlcnJvcnM6JHtMSU5FX1NUQVJUfSR7ZXJyb3JzLmpvaW4oTElORV9TVEFSVCl9YCk7XG4gIH1cblxuICByZXR1cm4gbm9ybWFsaXplZEtleWZyYW1lcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpc3Rlbk9uUGxheWVyKFxuICAgIHBsYXllcjogQW5pbWF0aW9uUGxheWVyLCBldmVudE5hbWU6IHN0cmluZywgZXZlbnQ6IEFuaW1hdGlvbkV2ZW50IHwgdW5kZWZpbmVkLFxuICAgIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55KSB7XG4gIHN3aXRjaCAoZXZlbnROYW1lKSB7XG4gICAgY2FzZSAnc3RhcnQnOlxuICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4gY2FsbGJhY2soZXZlbnQgJiYgY29weUFuaW1hdGlvbkV2ZW50KGV2ZW50LCAnc3RhcnQnLCBwbGF5ZXIpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkb25lJzpcbiAgICAgIHBsYXllci5vbkRvbmUoKCkgPT4gY2FsbGJhY2soZXZlbnQgJiYgY29weUFuaW1hdGlvbkV2ZW50KGV2ZW50LCAnZG9uZScsIHBsYXllcikpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Rlc3Ryb3knOlxuICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBjYWxsYmFjayhldmVudCAmJiBjb3B5QW5pbWF0aW9uRXZlbnQoZXZlbnQsICdkZXN0cm95JywgcGxheWVyKSkpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlBbmltYXRpb25FdmVudChcbiAgICBlOiBBbmltYXRpb25FdmVudCwgcGhhc2VOYW1lOiBzdHJpbmcsIHBsYXllcjogQW5pbWF0aW9uUGxheWVyKTogQW5pbWF0aW9uRXZlbnQge1xuICBjb25zdCB0b3RhbFRpbWUgPSBwbGF5ZXIudG90YWxUaW1lO1xuICBjb25zdCBkaXNhYmxlZCA9IChwbGF5ZXIgYXMgYW55KS5kaXNhYmxlZCA/IHRydWUgOiBmYWxzZTtcbiAgY29uc3QgZXZlbnQgPSBtYWtlQW5pbWF0aW9uRXZlbnQoXG4gICAgICBlLmVsZW1lbnQsIGUudHJpZ2dlck5hbWUsIGUuZnJvbVN0YXRlLCBlLnRvU3RhdGUsIHBoYXNlTmFtZSB8fCBlLnBoYXNlTmFtZSxcbiAgICAgIHRvdGFsVGltZSA9PSB1bmRlZmluZWQgPyBlLnRvdGFsVGltZSA6IHRvdGFsVGltZSwgZGlzYWJsZWQpO1xuICBjb25zdCBkYXRhID0gKGUgYXMgYW55KVsnX2RhdGEnXTtcbiAgaWYgKGRhdGEgIT0gbnVsbCkge1xuICAgIChldmVudCBhcyBhbnkpWydfZGF0YSddID0gZGF0YTtcbiAgfVxuICByZXR1cm4gZXZlbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQW5pbWF0aW9uRXZlbnQoXG4gICAgZWxlbWVudDogYW55LCB0cmlnZ2VyTmFtZTogc3RyaW5nLCBmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLCBwaGFzZU5hbWU6IHN0cmluZyA9ICcnLFxuICAgIHRvdGFsVGltZTogbnVtYmVyID0gMCwgZGlzYWJsZWQ/OiBib29sZWFuKTogQW5pbWF0aW9uRXZlbnQge1xuICByZXR1cm4ge2VsZW1lbnQsIHRyaWdnZXJOYW1lLCBmcm9tU3RhdGUsIHRvU3RhdGUsIHBoYXNlTmFtZSwgdG90YWxUaW1lLCBkaXNhYmxlZDogISFkaXNhYmxlZH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPclNldEFzSW5NYXAoXG4gICAgbWFwOiBNYXA8YW55LCBhbnk+fCB7W2tleTogc3RyaW5nXTogYW55fSwga2V5OiBhbnksIGRlZmF1bHRWYWx1ZTogYW55KSB7XG4gIGxldCB2YWx1ZTogYW55O1xuICBpZiAobWFwIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgdmFsdWUgPSBtYXAuZ2V0KGtleSk7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgbWFwLnNldChrZXksIHZhbHVlID0gZGVmYXVsdFZhbHVlKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFsdWUgPSBtYXBba2V5XTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IG1hcFtrZXldID0gZGVmYXVsdFZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRpbWVsaW5lQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiBbc3RyaW5nLCBzdHJpbmddIHtcbiAgY29uc3Qgc2VwYXJhdG9yUG9zID0gY29tbWFuZC5pbmRleE9mKCc6Jyk7XG4gIGNvbnN0IGlkID0gY29tbWFuZC5zdWJzdHJpbmcoMSwgc2VwYXJhdG9yUG9zKTtcbiAgY29uc3QgYWN0aW9uID0gY29tbWFuZC5zdWJzdHIoc2VwYXJhdG9yUG9zICsgMSk7XG4gIHJldHVybiBbaWQsIGFjdGlvbl07XG59XG5cbmxldCBfY29udGFpbnM6IChlbG0xOiBhbnksIGVsbTI6IGFueSkgPT4gYm9vbGVhbiA9IChlbG0xOiBhbnksIGVsbTI6IGFueSkgPT4gZmFsc2U7XG5sZXQgX21hdGNoZXM6IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+IGJvb2xlYW4gPSAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKSA9PlxuICAgIGZhbHNlO1xubGV0IF9xdWVyeTogKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pID0+IGFueVtdID1cbiAgICAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbikgPT4ge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH07XG5cbmlmICh0eXBlb2YgRWxlbWVudCAhPSAndW5kZWZpbmVkJykge1xuICAvLyB0aGlzIGlzIHdlbGwgc3VwcG9ydGVkIGluIGFsbCBicm93c2Vyc1xuICBfY29udGFpbnMgPSAoZWxtMTogYW55LCBlbG0yOiBhbnkpID0+IHsgcmV0dXJuIGVsbTEuY29udGFpbnMoZWxtMikgYXMgYm9vbGVhbjsgfTtcblxuICBpZiAoRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICAgIF9tYXRjaGVzID0gKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT4gZWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBwcm90byA9IEVsZW1lbnQucHJvdG90eXBlIGFzIGFueTtcbiAgICBjb25zdCBmbiA9IHByb3RvLm1hdGNoZXNTZWxlY3RvciB8fCBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgcHJvdG8ubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgcHJvdG8ub01hdGNoZXNTZWxlY3RvciB8fCBwcm90by53ZWJraXRNYXRjaGVzU2VsZWN0b3I7XG4gICAgaWYgKGZuKSB7XG4gICAgICBfbWF0Y2hlcyA9IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+IGZuLmFwcGx5KGVsZW1lbnQsIFtzZWxlY3Rvcl0pO1xuICAgIH1cbiAgfVxuXG4gIF9xdWVyeSA9IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKTogYW55W10gPT4ge1xuICAgIGxldCByZXN1bHRzOiBhbnlbXSA9IFtdO1xuICAgIGlmIChtdWx0aSkge1xuICAgICAgcmVzdWx0cy5wdXNoKC4uLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBlbG0gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgaWYgKGVsbSkge1xuICAgICAgICByZXN1bHRzLnB1c2goZWxtKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5zVmVuZG9yUHJlZml4KHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAvLyBXZWJraXQgaXMgdGhlIG9ubHkgcmVhbCBwb3B1bGFyIHZlbmRvciBwcmVmaXggbm93YWRheXNcbiAgLy8gY2M6IGh0dHA6Ly9zaG91bGRpcHJlZml4LmNvbS9cbiAgcmV0dXJuIHByb3Auc3Vic3RyaW5nKDEsIDYpID09ICdlYmtpdCc7ICAvLyB3ZWJraXQgb3IgV2Via2l0XG59XG5cbmxldCBfQ0FDSEVEX0JPRFk6IHtzdHlsZTogYW55fXxudWxsID0gbnVsbDtcbmxldCBfSVNfV0VCS0lUID0gZmFsc2U7XG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoIV9DQUNIRURfQk9EWSkge1xuICAgIF9DQUNIRURfQk9EWSA9IGdldEJvZHlOb2RlKCkgfHwge307XG4gICAgX0lTX1dFQktJVCA9IF9DQUNIRURfQk9EWSAhLnN0eWxlID8gKCdXZWJraXRBcHBlYXJhbmNlJyBpbiBfQ0FDSEVEX0JPRFkgIS5zdHlsZSkgOiBmYWxzZTtcbiAgfVxuXG4gIGxldCByZXN1bHQgPSB0cnVlO1xuICBpZiAoX0NBQ0hFRF9CT0RZICEuc3R5bGUgJiYgIWNvbnRhaW5zVmVuZG9yUHJlZml4KHByb3ApKSB7XG4gICAgcmVzdWx0ID0gcHJvcCBpbiBfQ0FDSEVEX0JPRFkgIS5zdHlsZTtcbiAgICBpZiAoIXJlc3VsdCAmJiBfSVNfV0VCS0lUKSB7XG4gICAgICBjb25zdCBjYW1lbFByb3AgPSAnV2Via2l0JyArIHByb3AuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnN1YnN0cigxKTtcbiAgICAgIHJlc3VsdCA9IGNhbWVsUHJvcCBpbiBfQ0FDSEVEX0JPRFkgIS5zdHlsZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qm9keU5vZGUoKTogYW55fG51bGwge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmJvZHk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBjb25zdCBtYXRjaGVzRWxlbWVudCA9IF9tYXRjaGVzO1xuZXhwb3J0IGNvbnN0IGNvbnRhaW5zRWxlbWVudCA9IF9jb250YWlucztcbmV4cG9ydCBjb25zdCBpbnZva2VRdWVyeSA9IF9xdWVyeTtcblxuZXhwb3J0IGZ1bmN0aW9uIGh5cGVuYXRlUHJvcHNPYmplY3Qob2JqZWN0OiB7W2tleTogc3RyaW5nXTogYW55fSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgY29uc3QgbmV3T2JqOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICBPYmplY3Qua2V5cyhvYmplY3QpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgY29uc3QgbmV3UHJvcCA9IHByb3AucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJyk7XG4gICAgbmV3T2JqW25ld1Byb3BdID0gb2JqZWN0W3Byb3BdO1xuICB9KTtcbiAgcmV0dXJuIG5ld09iajtcbn1cbiJdfQ==