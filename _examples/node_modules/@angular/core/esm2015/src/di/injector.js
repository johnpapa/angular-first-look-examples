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
import { stringify } from '../util';
import { defineInjectable } from './defs';
import { resolveForwardRef } from './forward_ref';
import { InjectionToken } from './injection_token';
import { Inject, Optional, Self, SkipSelf } from './metadata';
export const /** @type {?} */ SOURCE = '__source';
const /** @type {?} */ _THROW_IF_NOT_FOUND = new Object();
export const /** @type {?} */ THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
/**
 * An InjectionToken that gets the current `Injector` for `createInjector()`-style injectors.
 *
 * Requesting this token instead of `Injector` allows `StaticInjector` to be tree-shaken from a
 * project.
 *
 * \@experimental
 */
export const /** @type {?} */ INJECTOR = new InjectionToken('INJECTOR');
export class NullInjector {
    /**
     * @param {?} token
     * @param {?=} notFoundValue
     * @return {?}
     */
    get(token, notFoundValue = _THROW_IF_NOT_FOUND) {
        if (notFoundValue === _THROW_IF_NOT_FOUND) {
            throw new Error(`NullInjectorError: No provider for ${stringify(token)}!`);
        }
        return notFoundValue;
    }
}
/**
 * Concrete injectors implement this interface.
 *
 * For more details, see the ["Dependency Injection Guide"](guide/dependency-injection).
 *
 * \@usageNotes
 * ### Example
 *
 * {\@example core/di/ts/injector_spec.ts region='Injector'}
 *
 * `Injector` returns itself when given `Injector` as a token:
 *
 * {\@example core/di/ts/injector_spec.ts region='injectInjector'}
 *
 *
 * @abstract
 */
export class Injector {
    /**
     * Create a new Injector which is configure using `StaticProvider`s.
     *
     * \@usageNotes
     * ### Example
     *
     * {\@example core/di/ts/provider_spec.ts region='ConstructorProvider'}
     * @param {?} options
     * @param {?=} parent
     * @return {?}
     */
    static create(options, parent) {
        if (Array.isArray(options)) {
            return new StaticInjector(options, parent);
        }
        else {
            return new StaticInjector(options.providers, options.parent, options.name || null);
        }
    }
}
Injector.THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
Injector.NULL = new NullInjector();
/** @nocollapse */ Injector.ngInjectableDef = defineInjectable({
    providedIn: /** @type {?} */ ('any'),
    factory: () => inject(INJECTOR),
});
function Injector_tsickle_Closure_declarations() {
    /** @type {?} */
    Injector.THROW_IF_NOT_FOUND;
    /** @type {?} */
    Injector.NULL;
    /** @type {?} */
    Injector.ngInjectableDef;
    /**
     * Retrieves an instance from the injector based on the provided token.
     * If not found:
     * - Throws an error if no `notFoundValue` that is not equal to
     * Injector.THROW_IF_NOT_FOUND is given
     * - Returns the `notFoundValue` otherwise
     * @abstract
     * @template T
     * @param {?} token
     * @param {?=} notFoundValue
     * @param {?=} flags
     * @return {?}
     */
    Injector.prototype.get = function (token, notFoundValue, flags) { };
    /**
     * @deprecated from v4.0.0 use Type<T> or InjectionToken<T>
     * @suppress {duplicate}
     * @abstract
     * @param {?} token
     * @param {?=} notFoundValue
     * @return {?}
     */
    Injector.prototype.get = function (token, notFoundValue) { };
}
const /** @type {?} */ IDENT = function (value) {
    return value;
};
const ɵ0 = IDENT;
const /** @type {?} */ EMPTY = /** @type {?} */ ([]);
const /** @type {?} */ CIRCULAR = IDENT;
const /** @type {?} */ MULTI_PROVIDER_FN = function () {
    return Array.prototype.slice.call(arguments);
};
const ɵ1 = MULTI_PROVIDER_FN;
const /** @type {?} */ GET_PROPERTY_NAME = /** @type {?} */ ({});
export const /** @type {?} */ USE_VALUE = getClosureSafeProperty({ provide: String, useValue: GET_PROPERTY_NAME });
const /** @type {?} */ NG_TOKEN_PATH = 'ngTokenPath';
const /** @type {?} */ NG_TEMP_TOKEN_PATH = 'ngTempTokenPath';
/** @enum {number} */
const OptionFlags = {
    Optional: 1,
    CheckSelf: 2,
    CheckParent: 4,
    Default: 6,
};
const /** @type {?} */ NULL_INJECTOR = Injector.NULL;
const /** @type {?} */ NEW_LINE = /\n/gm;
const /** @type {?} */ NO_NEW_LINE = 'ɵ';
export class StaticInjector {
    /**
     * @param {?} providers
     * @param {?=} parent
     * @param {?=} source
     */
    constructor(providers, parent = NULL_INJECTOR, source = null) {
        this.parent = parent;
        this.source = source;
        const /** @type {?} */ records = this._records = new Map();
        records.set(Injector, /** @type {?} */ ({ token: Injector, fn: IDENT, deps: EMPTY, value: this, useNew: false }));
        records.set(INJECTOR, /** @type {?} */ ({ token: INJECTOR, fn: IDENT, deps: EMPTY, value: this, useNew: false }));
        recursivelyProcessProviders(records, providers);
    }
    /**
     * @param {?} token
     * @param {?=} notFoundValue
     * @param {?=} flags
     * @return {?}
     */
    get(token, notFoundValue, flags = 0 /* Default */) {
        const /** @type {?} */ record = this._records.get(token);
        try {
            return tryResolveToken(token, record, this._records, this.parent, notFoundValue, flags);
        }
        catch (/** @type {?} */ e) {
            const /** @type {?} */ tokenPath = e[NG_TEMP_TOKEN_PATH];
            if (token[SOURCE]) {
                tokenPath.unshift(token[SOURCE]);
            }
            e.message = formatError('\n' + e.message, tokenPath, this.source);
            e[NG_TOKEN_PATH] = tokenPath;
            e[NG_TEMP_TOKEN_PATH] = null;
            throw e;
        }
    }
    /**
     * @return {?}
     */
    toString() {
        const /** @type {?} */ tokens = /** @type {?} */ ([]), /** @type {?} */ records = this._records;
        records.forEach((v, token) => tokens.push(stringify(token)));
        return `StaticInjector[${tokens.join(', ')}]`;
    }
}
function StaticInjector_tsickle_Closure_declarations() {
    /** @type {?} */
    StaticInjector.prototype.parent;
    /** @type {?} */
    StaticInjector.prototype.source;
    /** @type {?} */
    StaticInjector.prototype._records;
}
/**
 * @record
 */
function Record() { }
function Record_tsickle_Closure_declarations() {
    /** @type {?} */
    Record.prototype.fn;
    /** @type {?} */
    Record.prototype.useNew;
    /** @type {?} */
    Record.prototype.deps;
    /** @type {?} */
    Record.prototype.value;
}
/**
 * @record
 */
function DependencyRecord() { }
function DependencyRecord_tsickle_Closure_declarations() {
    /** @type {?} */
    DependencyRecord.prototype.token;
    /** @type {?} */
    DependencyRecord.prototype.options;
}
/**
 * @param {?} provider
 * @return {?}
 */
function resolveProvider(provider) {
    const /** @type {?} */ deps = computeDeps(provider);
    let /** @type {?} */ fn = IDENT;
    let /** @type {?} */ value = EMPTY;
    let /** @type {?} */ useNew = false;
    let /** @type {?} */ provide = resolveForwardRef(provider.provide);
    if (USE_VALUE in provider) {
        // We need to use USE_VALUE in provider since provider.useValue could be defined as undefined.
        value = (/** @type {?} */ (provider)).useValue;
    }
    else if ((/** @type {?} */ (provider)).useFactory) {
        fn = (/** @type {?} */ (provider)).useFactory;
    }
    else if ((/** @type {?} */ (provider)).useExisting) {
        // Just use IDENT
    }
    else if ((/** @type {?} */ (provider)).useClass) {
        useNew = true;
        fn = resolveForwardRef((/** @type {?} */ (provider)).useClass);
    }
    else if (typeof provide == 'function') {
        useNew = true;
        fn = provide;
    }
    else {
        throw staticError('StaticProvider does not have [useValue|useFactory|useExisting|useClass] or [provide] is not newable', provider);
    }
    return { deps, fn, useNew, value };
}
/**
 * @param {?} token
 * @return {?}
 */
function multiProviderMixError(token) {
    return staticError('Cannot mix multi providers and regular providers', token);
}
/**
 * @param {?} records
 * @param {?} provider
 * @return {?}
 */
function recursivelyProcessProviders(records, provider) {
    if (provider) {
        provider = resolveForwardRef(provider);
        if (provider instanceof Array) {
            // if we have an array recurse into the array
            for (let /** @type {?} */ i = 0; i < provider.length; i++) {
                recursivelyProcessProviders(records, provider[i]);
            }
        }
        else if (typeof provider === 'function') {
            // Functions were supported in ReflectiveInjector, but are not here. For safety give useful
            // error messages
            throw staticError('Function/Class not supported', provider);
        }
        else if (provider && typeof provider === 'object' && provider.provide) {
            // At this point we have what looks like a provider: {provide: ?, ....}
            let /** @type {?} */ token = resolveForwardRef(provider.provide);
            const /** @type {?} */ resolvedProvider = resolveProvider(provider);
            if (provider.multi === true) {
                // This is a multi provider.
                let /** @type {?} */ multiProvider = records.get(token);
                if (multiProvider) {
                    if (multiProvider.fn !== MULTI_PROVIDER_FN) {
                        throw multiProviderMixError(token);
                    }
                }
                else {
                    // Create a placeholder factory which will look up the constituents of the multi provider.
                    records.set(token, multiProvider = /** @type {?} */ ({
                        token: provider.provide,
                        deps: [],
                        useNew: false,
                        fn: MULTI_PROVIDER_FN,
                        value: EMPTY
                    }));
                }
                // Treat the provider as the token.
                token = provider;
                multiProvider.deps.push({ token, options: 6 /* Default */ });
            }
            const /** @type {?} */ record = records.get(token);
            if (record && record.fn == MULTI_PROVIDER_FN) {
                throw multiProviderMixError(token);
            }
            records.set(token, resolvedProvider);
        }
        else {
            throw staticError('Unexpected provider', provider);
        }
    }
}
/**
 * @param {?} token
 * @param {?} record
 * @param {?} records
 * @param {?} parent
 * @param {?} notFoundValue
 * @param {?} flags
 * @return {?}
 */
function tryResolveToken(token, record, records, parent, notFoundValue, flags) {
    try {
        return resolveToken(token, record, records, parent, notFoundValue, flags);
    }
    catch (/** @type {?} */ e) {
        // ensure that 'e' is of type Error.
        if (!(e instanceof Error)) {
            e = new Error(e);
        }
        const /** @type {?} */ path = e[NG_TEMP_TOKEN_PATH] = e[NG_TEMP_TOKEN_PATH] || [];
        path.unshift(token);
        if (record && record.value == CIRCULAR) {
            // Reset the Circular flag.
            record.value = EMPTY;
        }
        throw e;
    }
}
/**
 * @param {?} token
 * @param {?} record
 * @param {?} records
 * @param {?} parent
 * @param {?} notFoundValue
 * @param {?} flags
 * @return {?}
 */
function resolveToken(token, record, records, parent, notFoundValue, flags) {
    let /** @type {?} */ value;
    if (record && !(flags & 4 /* SkipSelf */)) {
        // If we don't have a record, this implies that we don't own the provider hence don't know how
        // to resolve it.
        value = record.value;
        if (value == CIRCULAR) {
            throw Error(NO_NEW_LINE + 'Circular dependency');
        }
        else if (value === EMPTY) {
            record.value = CIRCULAR;
            let /** @type {?} */ obj = undefined;
            let /** @type {?} */ useNew = record.useNew;
            let /** @type {?} */ fn = record.fn;
            let /** @type {?} */ depRecords = record.deps;
            let /** @type {?} */ deps = EMPTY;
            if (depRecords.length) {
                deps = [];
                for (let /** @type {?} */ i = 0; i < depRecords.length; i++) {
                    const /** @type {?} */ depRecord = depRecords[i];
                    const /** @type {?} */ options = depRecord.options;
                    const /** @type {?} */ childRecord = options & 2 /* CheckSelf */ ? records.get(depRecord.token) : undefined;
                    deps.push(tryResolveToken(
                    // Current Token to resolve
                    depRecord.token, childRecord, records, 
                    // If we don't know how to resolve dependency and we should not check parent for it,
                    // than pass in Null injector.
                    !childRecord && !(options & 4 /* CheckParent */) ? NULL_INJECTOR : parent, options & 1 /* Optional */ ? null : Injector.THROW_IF_NOT_FOUND, 0 /* Default */));
                }
            }
            record.value = value = useNew ? new (/** @type {?} */ (fn))(...deps) : fn.apply(obj, deps);
        }
    }
    else if (!(flags & 2 /* Self */)) {
        value = parent.get(token, notFoundValue, 0 /* Default */);
    }
    return value;
}
/**
 * @param {?} provider
 * @return {?}
 */
function computeDeps(provider) {
    let /** @type {?} */ deps = EMPTY;
    const /** @type {?} */ providerDeps = (/** @type {?} */ (provider)).deps;
    if (providerDeps && providerDeps.length) {
        deps = [];
        for (let /** @type {?} */ i = 0; i < providerDeps.length; i++) {
            let /** @type {?} */ options = 6 /* Default */;
            let /** @type {?} */ token = resolveForwardRef(providerDeps[i]);
            if (token instanceof Array) {
                for (let /** @type {?} */ j = 0, /** @type {?} */ annotations = token; j < annotations.length; j++) {
                    const /** @type {?} */ annotation = annotations[j];
                    if (annotation instanceof Optional || annotation == Optional) {
                        options = options | 1 /* Optional */;
                    }
                    else if (annotation instanceof SkipSelf || annotation == SkipSelf) {
                        options = options & ~2 /* CheckSelf */;
                    }
                    else if (annotation instanceof Self || annotation == Self) {
                        options = options & ~4 /* CheckParent */;
                    }
                    else if (annotation instanceof Inject) {
                        token = (/** @type {?} */ (annotation)).token;
                    }
                    else {
                        token = resolveForwardRef(annotation);
                    }
                }
            }
            deps.push({ token, options });
        }
    }
    else if ((/** @type {?} */ (provider)).useExisting) {
        const /** @type {?} */ token = resolveForwardRef((/** @type {?} */ (provider)).useExisting);
        deps = [{ token, options: 6 /* Default */ }];
    }
    else if (!providerDeps && !(USE_VALUE in provider)) {
        // useValue & useExisting are the only ones which are exempt from deps all others need it.
        throw staticError('\'deps\' required', provider);
    }
    return deps;
}
/**
 * @param {?} text
 * @param {?} obj
 * @param {?=} source
 * @return {?}
 */
function formatError(text, obj, source = null) {
    text = text && text.charAt(0) === '\n' && text.charAt(1) == NO_NEW_LINE ? text.substr(2) : text;
    let /** @type {?} */ context = stringify(obj);
    if (obj instanceof Array) {
        context = obj.map(stringify).join(' -> ');
    }
    else if (typeof obj === 'object') {
        let /** @type {?} */ parts = /** @type {?} */ ([]);
        for (let /** @type {?} */ key in obj) {
            if (obj.hasOwnProperty(key)) {
                let /** @type {?} */ value = obj[key];
                parts.push(key + ':' + (typeof value === 'string' ? JSON.stringify(value) : stringify(value)));
            }
        }
        context = `{${parts.join(', ')}}`;
    }
    return `StaticInjectorError${source ? '(' + source + ')' : ''}[${context}]: ${text.replace(NEW_LINE, '\n  ')}`;
}
/**
 * @param {?} text
 * @param {?} obj
 * @return {?}
 */
function staticError(text, obj) {
    return new Error(formatError(text, obj));
}
/**
 * @template T
 * @param {?} objWithPropertyToExtract
 * @return {?}
 */
function getClosureSafeProperty(objWithPropertyToExtract) {
    for (let /** @type {?} */ key in objWithPropertyToExtract) {
        if (objWithPropertyToExtract[key] === GET_PROPERTY_NAME) {
            return key;
        }
    }
    throw Error('!prop');
}
/** @enum {number} */
const InjectFlags = {
    Default: 0,
    /**
       * Specifies that an injector should retrieve a dependency from any injector until reaching the
       * host element of the current component. (Only used with Element Injector)
       */
    Host: 1,
    /** Don't descend into ancestors of the node requesting injection. */
    Self: 2,
    /** Skip the node that is requesting injection. */
    SkipSelf: 4,
    /** Inject `defaultValue` instead if token not found. */
    Optional: 8,
};
export { InjectFlags };
/**
 * Current injector value used by `inject`.
 * - `undefined`: it is an error to call `inject`
 * - `null`: `inject` can be called but there is no injector (limp-mode).
 * - Injector instance: Use the injector for resolution.
 */
let /** @type {?} */ _currentInjector = undefined;
/**
 * @param {?} injector
 * @return {?}
 */
export function setCurrentInjector(injector) {
    const /** @type {?} */ former = _currentInjector;
    _currentInjector = injector;
    return former;
}
/**
 * @template T
 * @param {?} token
 * @param {?=} flags
 * @return {?}
 */
export function inject(token, flags = 0 /* Default */) {
    if (_currentInjector === undefined) {
        throw new Error(`inject() must be called from an injection context`);
    }
    else if (_currentInjector === null) {
        const /** @type {?} */ injectableDef = (/** @type {?} */ (token)).ngInjectableDef;
        if (injectableDef && injectableDef.providedIn == 'root') {
            return injectableDef.value === undefined ? injectableDef.value = injectableDef.factory() :
                injectableDef.value;
        }
        throw new Error(`Injector: NOT_FOUND [${stringify(token)}]`);
    }
    else {
        return _currentInjector.get(token, flags & 8 /* Optional */ ? null : undefined, flags);
    }
}
/**
 * @param {?} types
 * @return {?}
 */
export function injectArgs(types) {
    const /** @type {?} */ args = [];
    for (let /** @type {?} */ i = 0; i < types.length; i++) {
        const /** @type {?} */ arg = types[i];
        if (Array.isArray(arg)) {
            if (arg.length === 0) {
                throw new Error('Arguments array must have arguments.');
            }
            let /** @type {?} */ type = undefined;
            let /** @type {?} */ flags = 0 /* Default */;
            for (let /** @type {?} */ j = 0; j < arg.length; j++) {
                const /** @type {?} */ meta = arg[j];
                if (meta instanceof Optional || meta.__proto__.ngMetadataName === 'Optional') {
                    flags |= 8 /* Optional */;
                }
                else if (meta instanceof SkipSelf || meta.__proto__.ngMetadataName === 'SkipSelf') {
                    flags |= 4 /* SkipSelf */;
                }
                else if (meta instanceof Self || meta.__proto__.ngMetadataName === 'Self') {
                    flags |= 2 /* Self */;
                }
                else if (meta instanceof Inject) {
                    type = meta.token;
                }
                else {
                    type = meta;
                }
            }
            args.push(inject(/** @type {?} */ ((type)), flags));
        }
        else {
            args.push(inject(arg));
        }
    }
    return args;
}
export { ɵ0, ɵ1 };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9kaS9pbmplY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVNBLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFbEMsT0FBTyxFQUFnQixnQkFBZ0IsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUN2RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDaEQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFHNUQsTUFBTSxDQUFDLHVCQUFNLE1BQU0sR0FBRyxVQUFVLENBQUM7QUFDakMsdUJBQU0sbUJBQW1CLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztBQUN6QyxNQUFNLENBQUMsdUJBQU0sa0JBQWtCLEdBQUcsbUJBQW1CLENBQUM7Ozs7Ozs7OztBQVV0RCxNQUFNLENBQUMsdUJBQU0sUUFBUSxHQUFHLElBQUksY0FBYyxDQUFXLFVBQVUsQ0FBQyxDQUFDO0FBRWpFLE1BQU07Ozs7OztJQUNKLEdBQUcsQ0FBQyxLQUFVLEVBQUUsZ0JBQXFCLG1CQUFtQjtRQUN0RCxFQUFFLENBQUMsQ0FBQyxhQUFhLEtBQUssbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDNUU7UUFDRCxNQUFNLENBQUMsYUFBYSxDQUFDO0tBQ3RCO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCRCxNQUFNOzs7Ozs7Ozs7Ozs7SUFpQ0osTUFBTSxDQUFDLE1BQU0sQ0FDVCxPQUF5RixFQUN6RixNQUFpQjtRQUNu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QU0sQ0FBQyxJQUFJLENBQUM7Q0FDYiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi90eXBlJztcbmltcG9ydCB7c3RyaW5naWZ5fSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtJbmplY3RhYmxlRGVmLCBkZWZpbmVJbmplY3RhYmxlfSBmcm9tICcuL2RlZnMnO1xuaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnLi9mb3J3YXJkX3JlZic7XG5pbXBvcnQge0luamVjdGlvblRva2VufSBmcm9tICcuL2luamVjdGlvbl90b2tlbic7XG5pbXBvcnQge0luamVjdCwgT3B0aW9uYWwsIFNlbGYsIFNraXBTZWxmfSBmcm9tICcuL21ldGFkYXRhJztcbmltcG9ydCB7Q29uc3RydWN0b3JQcm92aWRlciwgRXhpc3RpbmdQcm92aWRlciwgRmFjdG9yeVByb3ZpZGVyLCBTdGF0aWNDbGFzc1Byb3ZpZGVyLCBTdGF0aWNQcm92aWRlciwgVmFsdWVQcm92aWRlcn0gZnJvbSAnLi9wcm92aWRlcic7XG5cbmV4cG9ydCBjb25zdCBTT1VSQ0UgPSAnX19zb3VyY2UnO1xuY29uc3QgX1RIUk9XX0lGX05PVF9GT1VORCA9IG5ldyBPYmplY3QoKTtcbmV4cG9ydCBjb25zdCBUSFJPV19JRl9OT1RfRk9VTkQgPSBfVEhST1dfSUZfTk9UX0ZPVU5EO1xuXG4vKipcbiAqIEFuIEluamVjdGlvblRva2VuIHRoYXQgZ2V0cyB0aGUgY3VycmVudCBgSW5qZWN0b3JgIGZvciBgY3JlYXRlSW5qZWN0b3IoKWAtc3R5bGUgaW5qZWN0b3JzLlxuICpcbiAqIFJlcXVlc3RpbmcgdGhpcyB0b2tlbiBpbnN0ZWFkIG9mIGBJbmplY3RvcmAgYWxsb3dzIGBTdGF0aWNJbmplY3RvcmAgdG8gYmUgdHJlZS1zaGFrZW4gZnJvbSBhXG4gKiBwcm9qZWN0LlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGNvbnN0IElOSkVDVE9SID0gbmV3IEluamVjdGlvblRva2VuPEluamVjdG9yPignSU5KRUNUT1InKTtcblxuZXhwb3J0IGNsYXNzIE51bGxJbmplY3RvciBpbXBsZW1lbnRzIEluamVjdG9yIHtcbiAgZ2V0KHRva2VuOiBhbnksIG5vdEZvdW5kVmFsdWU6IGFueSA9IF9USFJPV19JRl9OT1RfRk9VTkQpOiBhbnkge1xuICAgIGlmIChub3RGb3VuZFZhbHVlID09PSBfVEhST1dfSUZfTk9UX0ZPVU5EKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE51bGxJbmplY3RvckVycm9yOiBObyBwcm92aWRlciBmb3IgJHtzdHJpbmdpZnkodG9rZW4pfSFgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vdEZvdW5kVmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBDb25jcmV0ZSBpbmplY3RvcnMgaW1wbGVtZW50IHRoaXMgaW50ZXJmYWNlLlxuICpcbiAqIEZvciBtb3JlIGRldGFpbHMsIHNlZSB0aGUgW1wiRGVwZW5kZW5jeSBJbmplY3Rpb24gR3VpZGVcIl0oZ3VpZGUvZGVwZW5kZW5jeS1pbmplY3Rpb24pLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2RpL3RzL2luamVjdG9yX3NwZWMudHMgcmVnaW9uPSdJbmplY3Rvcid9XG4gKlxuICogYEluamVjdG9yYCByZXR1cm5zIGl0c2VsZiB3aGVuIGdpdmVuIGBJbmplY3RvcmAgYXMgYSB0b2tlbjpcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9kaS90cy9pbmplY3Rvcl9zcGVjLnRzIHJlZ2lvbj0naW5qZWN0SW5qZWN0b3InfVxuICpcbiAqXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBJbmplY3RvciB7XG4gIHN0YXRpYyBUSFJPV19JRl9OT1RfRk9VTkQgPSBfVEhST1dfSUZfTk9UX0ZPVU5EO1xuICBzdGF0aWMgTlVMTDogSW5qZWN0b3IgPSBuZXcgTnVsbEluamVjdG9yKCk7XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhbiBpbnN0YW5jZSBmcm9tIHRoZSBpbmplY3RvciBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgdG9rZW4uXG4gICAqIElmIG5vdCBmb3VuZDpcbiAgICogLSBUaHJvd3MgYW4gZXJyb3IgaWYgbm8gYG5vdEZvdW5kVmFsdWVgIHRoYXQgaXMgbm90IGVxdWFsIHRvXG4gICAqIEluamVjdG9yLlRIUk9XX0lGX05PVF9GT1VORCBpcyBnaXZlblxuICAgKiAtIFJldHVybnMgdGhlIGBub3RGb3VuZFZhbHVlYCBvdGhlcndpc2VcbiAgICovXG4gIGFic3RyYWN0IGdldDxUPih0b2tlbjogVHlwZTxUPnxJbmplY3Rpb25Ub2tlbjxUPiwgbm90Rm91bmRWYWx1ZT86IFQsIGZsYWdzPzogSW5qZWN0RmxhZ3MpOiBUO1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgZnJvbSB2NC4wLjAgdXNlIFR5cGU8VD4gb3IgSW5qZWN0aW9uVG9rZW48VD5cbiAgICogQHN1cHByZXNzIHtkdXBsaWNhdGV9XG4gICAqL1xuICBhYnN0cmFjdCBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZT86IGFueSk6IGFueTtcblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgZnJvbSB2NSB1c2UgdGhlIG5ldyBzaWduYXR1cmUgSW5qZWN0b3IuY3JlYXRlKG9wdGlvbnMpXG4gICAqL1xuICBzdGF0aWMgY3JlYXRlKHByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSwgcGFyZW50PzogSW5qZWN0b3IpOiBJbmplY3RvcjtcblxuICBzdGF0aWMgY3JlYXRlKG9wdGlvbnM6IHtwcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10sIHBhcmVudD86IEluamVjdG9yLCBuYW1lPzogc3RyaW5nfSk6IEluamVjdG9yO1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgSW5qZWN0b3Igd2hpY2ggaXMgY29uZmlndXJlIHVzaW5nIGBTdGF0aWNQcm92aWRlcmBzLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgY29yZS9kaS90cy9wcm92aWRlcl9zcGVjLnRzIHJlZ2lvbj0nQ29uc3RydWN0b3JQcm92aWRlcid9XG4gICAqL1xuICBzdGF0aWMgY3JlYXRlKFxuICAgICAgb3B0aW9uczogU3RhdGljUHJvdmlkZXJbXXx7cHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdLCBwYXJlbnQ/OiBJbmplY3RvciwgbmFtZT86IHN0cmluZ30sXG4gICAgICBwYXJlbnQ/OiBJbmplY3Rvcik6IEluamVjdG9yIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvcHRpb25zKSkge1xuICAgICAgcmV0dXJuIG5ldyBTdGF0aWNJbmplY3RvcihvcHRpb25zLCBwYXJlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFN0YXRpY0luamVjdG9yKG9wdGlvbnMucHJvdmlkZXJzLCBvcHRpb25zLnBhcmVudCwgb3B0aW9ucy5uYW1lIHx8IG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBuZ0luamVjdGFibGVEZWYgPSBkZWZpbmVJbmplY3RhYmxlKHtcbiAgICBwcm92aWRlZEluOiAnYW55JyBhcyBhbnksXG4gICAgZmFjdG9yeTogKCkgPT4gaW5qZWN0KElOSkVDVE9SKSxcbiAgfSk7XG59XG5cblxuXG5jb25zdCBJREVOVCA9IGZ1bmN0aW9uPFQ+KHZhbHVlOiBUKTogVCB7XG4gIHJldHVybiB2YWx1ZTtcbn07XG5jb25zdCBFTVBUWSA9IDxhbnlbXT5bXTtcbmNvbnN0IENJUkNVTEFSID0gSURFTlQ7XG5jb25zdCBNVUxUSV9QUk9WSURFUl9GTiA9IGZ1bmN0aW9uKCk6IGFueVtdIHtcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG59O1xuY29uc3QgR0VUX1BST1BFUlRZX05BTUUgPSB7fSBhcyBhbnk7XG5leHBvcnQgY29uc3QgVVNFX1ZBTFVFID1cbiAgICBnZXRDbG9zdXJlU2FmZVByb3BlcnR5PFZhbHVlUHJvdmlkZXI+KHtwcm92aWRlOiBTdHJpbmcsIHVzZVZhbHVlOiBHRVRfUFJPUEVSVFlfTkFNRX0pO1xuY29uc3QgTkdfVE9LRU5fUEFUSCA9ICduZ1Rva2VuUGF0aCc7XG5jb25zdCBOR19URU1QX1RPS0VOX1BBVEggPSAnbmdUZW1wVG9rZW5QYXRoJztcbmNvbnN0IGVudW0gT3B0aW9uRmxhZ3Mge1xuICBPcHRpb25hbCA9IDEgPDwgMCxcbiAgQ2hlY2tTZWxmID0gMSA8PCAxLFxuICBDaGVja1BhcmVudCA9IDEgPDwgMixcbiAgRGVmYXVsdCA9IENoZWNrU2VsZiB8IENoZWNrUGFyZW50XG59XG5jb25zdCBOVUxMX0lOSkVDVE9SID0gSW5qZWN0b3IuTlVMTDtcbmNvbnN0IE5FV19MSU5FID0gL1xcbi9nbTtcbmNvbnN0IE5PX05FV19MSU5FID0gJ8m1JztcblxuZXhwb3J0IGNsYXNzIFN0YXRpY0luamVjdG9yIGltcGxlbWVudHMgSW5qZWN0b3Ige1xuICByZWFkb25seSBwYXJlbnQ6IEluamVjdG9yO1xuICByZWFkb25seSBzb3VyY2U6IHN0cmluZ3xudWxsO1xuXG4gIHByaXZhdGUgX3JlY29yZHM6IE1hcDxhbnksIFJlY29yZD47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10sIHBhcmVudDogSW5qZWN0b3IgPSBOVUxMX0lOSkVDVE9SLCBzb3VyY2U6IHN0cmluZ3xudWxsID0gbnVsbCkge1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgIGNvbnN0IHJlY29yZHMgPSB0aGlzLl9yZWNvcmRzID0gbmV3IE1hcDxhbnksIFJlY29yZD4oKTtcbiAgICByZWNvcmRzLnNldChcbiAgICAgICAgSW5qZWN0b3IsIDxSZWNvcmQ+e3Rva2VuOiBJbmplY3RvciwgZm46IElERU5ULCBkZXBzOiBFTVBUWSwgdmFsdWU6IHRoaXMsIHVzZU5ldzogZmFsc2V9KTtcbiAgICByZWNvcmRzLnNldChcbiAgICAgICAgSU5KRUNUT1IsIDxSZWNvcmQ+e3Rva2VuOiBJTkpFQ1RPUiwgZm46IElERU5ULCBkZXBzOiBFTVBUWSwgdmFsdWU6IHRoaXMsIHVzZU5ldzogZmFsc2V9KTtcbiAgICByZWN1cnNpdmVseVByb2Nlc3NQcm92aWRlcnMocmVjb3JkcywgcHJvdmlkZXJzKTtcbiAgfVxuXG4gIGdldDxUPih0b2tlbjogVHlwZTxUPnxJbmplY3Rpb25Ub2tlbjxUPiwgbm90Rm91bmRWYWx1ZT86IFQsIGZsYWdzPzogSW5qZWN0RmxhZ3MpOiBUO1xuICBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZT86IGFueSk6IGFueTtcbiAgZ2V0KHRva2VuOiBhbnksIG5vdEZvdW5kVmFsdWU/OiBhbnksIGZsYWdzOiBJbmplY3RGbGFncyA9IEluamVjdEZsYWdzLkRlZmF1bHQpOiBhbnkge1xuICAgIGNvbnN0IHJlY29yZCA9IHRoaXMuX3JlY29yZHMuZ2V0KHRva2VuKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRyeVJlc29sdmVUb2tlbih0b2tlbiwgcmVjb3JkLCB0aGlzLl9yZWNvcmRzLCB0aGlzLnBhcmVudCwgbm90Rm91bmRWYWx1ZSwgZmxhZ3MpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnN0IHRva2VuUGF0aDogYW55W10gPSBlW05HX1RFTVBfVE9LRU5fUEFUSF07XG4gICAgICBpZiAodG9rZW5bU09VUkNFXSkge1xuICAgICAgICB0b2tlblBhdGgudW5zaGlmdCh0b2tlbltTT1VSQ0VdKTtcbiAgICAgIH1cbiAgICAgIGUubWVzc2FnZSA9IGZvcm1hdEVycm9yKCdcXG4nICsgZS5tZXNzYWdlLCB0b2tlblBhdGgsIHRoaXMuc291cmNlKTtcbiAgICAgIGVbTkdfVE9LRU5fUEFUSF0gPSB0b2tlblBhdGg7XG4gICAgICBlW05HX1RFTVBfVE9LRU5fUEFUSF0gPSBudWxsO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICBjb25zdCB0b2tlbnMgPSA8c3RyaW5nW10+W10sIHJlY29yZHMgPSB0aGlzLl9yZWNvcmRzO1xuICAgIHJlY29yZHMuZm9yRWFjaCgodiwgdG9rZW4pID0+IHRva2Vucy5wdXNoKHN0cmluZ2lmeSh0b2tlbikpKTtcbiAgICByZXR1cm4gYFN0YXRpY0luamVjdG9yWyR7dG9rZW5zLmpvaW4oJywgJyl9XWA7XG4gIH1cbn1cblxudHlwZSBTdXBwb3J0ZWRQcm92aWRlciA9XG4gICAgVmFsdWVQcm92aWRlciB8IEV4aXN0aW5nUHJvdmlkZXIgfCBTdGF0aWNDbGFzc1Byb3ZpZGVyIHwgQ29uc3RydWN0b3JQcm92aWRlciB8IEZhY3RvcnlQcm92aWRlcjtcblxuaW50ZXJmYWNlIFJlY29yZCB7XG4gIGZuOiBGdW5jdGlvbjtcbiAgdXNlTmV3OiBib29sZWFuO1xuICBkZXBzOiBEZXBlbmRlbmN5UmVjb3JkW107XG4gIHZhbHVlOiBhbnk7XG59XG5cbmludGVyZmFjZSBEZXBlbmRlbmN5UmVjb3JkIHtcbiAgdG9rZW46IGFueTtcbiAgb3B0aW9uczogbnVtYmVyO1xufVxuXG50eXBlIFRva2VuUGF0aCA9IEFycmF5PGFueT47XG5cbmZ1bmN0aW9uIHJlc29sdmVQcm92aWRlcihwcm92aWRlcjogU3VwcG9ydGVkUHJvdmlkZXIpOiBSZWNvcmQge1xuICBjb25zdCBkZXBzID0gY29tcHV0ZURlcHMocHJvdmlkZXIpO1xuICBsZXQgZm46IEZ1bmN0aW9uID0gSURFTlQ7XG4gIGxldCB2YWx1ZTogYW55ID0gRU1QVFk7XG4gIGxldCB1c2VOZXc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgbGV0IHByb3ZpZGUgPSByZXNvbHZlRm9yd2FyZFJlZihwcm92aWRlci5wcm92aWRlKTtcbiAgaWYgKFVTRV9WQUxVRSBpbiBwcm92aWRlcikge1xuICAgIC8vIFdlIG5lZWQgdG8gdXNlIFVTRV9WQUxVRSBpbiBwcm92aWRlciBzaW5jZSBwcm92aWRlci51c2VWYWx1ZSBjb3VsZCBiZSBkZWZpbmVkIGFzIHVuZGVmaW5lZC5cbiAgICB2YWx1ZSA9IChwcm92aWRlciBhcyBWYWx1ZVByb3ZpZGVyKS51c2VWYWx1ZTtcbiAgfSBlbHNlIGlmICgocHJvdmlkZXIgYXMgRmFjdG9yeVByb3ZpZGVyKS51c2VGYWN0b3J5KSB7XG4gICAgZm4gPSAocHJvdmlkZXIgYXMgRmFjdG9yeVByb3ZpZGVyKS51c2VGYWN0b3J5O1xuICB9IGVsc2UgaWYgKChwcm92aWRlciBhcyBFeGlzdGluZ1Byb3ZpZGVyKS51c2VFeGlzdGluZykge1xuICAgIC8vIEp1c3QgdXNlIElERU5UXG4gIH0gZWxzZSBpZiAoKHByb3ZpZGVyIGFzIFN0YXRpY0NsYXNzUHJvdmlkZXIpLnVzZUNsYXNzKSB7XG4gICAgdXNlTmV3ID0gdHJ1ZTtcbiAgICBmbiA9IHJlc29sdmVGb3J3YXJkUmVmKChwcm92aWRlciBhcyBTdGF0aWNDbGFzc1Byb3ZpZGVyKS51c2VDbGFzcyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb3ZpZGUgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHVzZU5ldyA9IHRydWU7XG4gICAgZm4gPSBwcm92aWRlO1xuICB9IGVsc2Uge1xuICAgIHRocm93IHN0YXRpY0Vycm9yKFxuICAgICAgICAnU3RhdGljUHJvdmlkZXIgZG9lcyBub3QgaGF2ZSBbdXNlVmFsdWV8dXNlRmFjdG9yeXx1c2VFeGlzdGluZ3x1c2VDbGFzc10gb3IgW3Byb3ZpZGVdIGlzIG5vdCBuZXdhYmxlJyxcbiAgICAgICAgcHJvdmlkZXIpO1xuICB9XG4gIHJldHVybiB7ZGVwcywgZm4sIHVzZU5ldywgdmFsdWV9O1xufVxuXG5mdW5jdGlvbiBtdWx0aVByb3ZpZGVyTWl4RXJyb3IodG9rZW46IGFueSkge1xuICByZXR1cm4gc3RhdGljRXJyb3IoJ0Nhbm5vdCBtaXggbXVsdGkgcHJvdmlkZXJzIGFuZCByZWd1bGFyIHByb3ZpZGVycycsIHRva2VuKTtcbn1cblxuZnVuY3Rpb24gcmVjdXJzaXZlbHlQcm9jZXNzUHJvdmlkZXJzKHJlY29yZHM6IE1hcDxhbnksIFJlY29yZD4sIHByb3ZpZGVyOiBTdGF0aWNQcm92aWRlcikge1xuICBpZiAocHJvdmlkZXIpIHtcbiAgICBwcm92aWRlciA9IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyKTtcbiAgICBpZiAocHJvdmlkZXIgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgLy8gaWYgd2UgaGF2ZSBhbiBhcnJheSByZWN1cnNlIGludG8gdGhlIGFycmF5XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3ZpZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlY3Vyc2l2ZWx5UHJvY2Vzc1Byb3ZpZGVycyhyZWNvcmRzLCBwcm92aWRlcltpXSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcHJvdmlkZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIEZ1bmN0aW9ucyB3ZXJlIHN1cHBvcnRlZCBpbiBSZWZsZWN0aXZlSW5qZWN0b3IsIGJ1dCBhcmUgbm90IGhlcmUuIEZvciBzYWZldHkgZ2l2ZSB1c2VmdWxcbiAgICAgIC8vIGVycm9yIG1lc3NhZ2VzXG4gICAgICB0aHJvdyBzdGF0aWNFcnJvcignRnVuY3Rpb24vQ2xhc3Mgbm90IHN1cHBvcnRlZCcsIHByb3ZpZGVyKTtcbiAgICB9IGVsc2UgaWYgKHByb3ZpZGVyICYmIHR5cGVvZiBwcm92aWRlciA9PT0gJ29iamVjdCcgJiYgcHJvdmlkZXIucHJvdmlkZSkge1xuICAgICAgLy8gQXQgdGhpcyBwb2ludCB3ZSBoYXZlIHdoYXQgbG9va3MgbGlrZSBhIHByb3ZpZGVyOiB7cHJvdmlkZTogPywgLi4uLn1cbiAgICAgIGxldCB0b2tlbiA9IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyLnByb3ZpZGUpO1xuICAgICAgY29uc3QgcmVzb2x2ZWRQcm92aWRlciA9IHJlc29sdmVQcm92aWRlcihwcm92aWRlcik7XG4gICAgICBpZiAocHJvdmlkZXIubXVsdGkgPT09IHRydWUpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBhIG11bHRpIHByb3ZpZGVyLlxuICAgICAgICBsZXQgbXVsdGlQcm92aWRlcjogUmVjb3JkfHVuZGVmaW5lZCA9IHJlY29yZHMuZ2V0KHRva2VuKTtcbiAgICAgICAgaWYgKG11bHRpUHJvdmlkZXIpIHtcbiAgICAgICAgICBpZiAobXVsdGlQcm92aWRlci5mbiAhPT0gTVVMVElfUFJPVklERVJfRk4pIHtcbiAgICAgICAgICAgIHRocm93IG11bHRpUHJvdmlkZXJNaXhFcnJvcih0b2tlbik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENyZWF0ZSBhIHBsYWNlaG9sZGVyIGZhY3Rvcnkgd2hpY2ggd2lsbCBsb29rIHVwIHRoZSBjb25zdGl0dWVudHMgb2YgdGhlIG11bHRpIHByb3ZpZGVyLlxuICAgICAgICAgIHJlY29yZHMuc2V0KHRva2VuLCBtdWx0aVByb3ZpZGVyID0gPFJlY29yZD57XG4gICAgICAgICAgICB0b2tlbjogcHJvdmlkZXIucHJvdmlkZSxcbiAgICAgICAgICAgIGRlcHM6IFtdLFxuICAgICAgICAgICAgdXNlTmV3OiBmYWxzZSxcbiAgICAgICAgICAgIGZuOiBNVUxUSV9QUk9WSURFUl9GTixcbiAgICAgICAgICAgIHZhbHVlOiBFTVBUWVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRyZWF0IHRoZSBwcm92aWRlciBhcyB0aGUgdG9rZW4uXG4gICAgICAgIHRva2VuID0gcHJvdmlkZXI7XG4gICAgICAgIG11bHRpUHJvdmlkZXIuZGVwcy5wdXNoKHt0b2tlbiwgb3B0aW9uczogT3B0aW9uRmxhZ3MuRGVmYXVsdH0pO1xuICAgICAgfVxuICAgICAgY29uc3QgcmVjb3JkID0gcmVjb3Jkcy5nZXQodG9rZW4pO1xuICAgICAgaWYgKHJlY29yZCAmJiByZWNvcmQuZm4gPT0gTVVMVElfUFJPVklERVJfRk4pIHtcbiAgICAgICAgdGhyb3cgbXVsdGlQcm92aWRlck1peEVycm9yKHRva2VuKTtcbiAgICAgIH1cbiAgICAgIHJlY29yZHMuc2V0KHRva2VuLCByZXNvbHZlZFByb3ZpZGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgc3RhdGljRXJyb3IoJ1VuZXhwZWN0ZWQgcHJvdmlkZXInLCBwcm92aWRlcik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHRyeVJlc29sdmVUb2tlbihcbiAgICB0b2tlbjogYW55LCByZWNvcmQ6IFJlY29yZCB8IHVuZGVmaW5lZCwgcmVjb3JkczogTWFwPGFueSwgUmVjb3JkPiwgcGFyZW50OiBJbmplY3RvcixcbiAgICBub3RGb3VuZFZhbHVlOiBhbnksIGZsYWdzOiBJbmplY3RGbGFncyk6IGFueSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHJlc29sdmVUb2tlbih0b2tlbiwgcmVjb3JkLCByZWNvcmRzLCBwYXJlbnQsIG5vdEZvdW5kVmFsdWUsIGZsYWdzKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIGVuc3VyZSB0aGF0ICdlJyBpcyBvZiB0eXBlIEVycm9yLlxuICAgIGlmICghKGUgaW5zdGFuY2VvZiBFcnJvcikpIHtcbiAgICAgIGUgPSBuZXcgRXJyb3IoZSk7XG4gICAgfVxuICAgIGNvbnN0IHBhdGg6IGFueVtdID0gZVtOR19URU1QX1RPS0VOX1BBVEhdID0gZVtOR19URU1QX1RPS0VOX1BBVEhdIHx8IFtdO1xuICAgIHBhdGgudW5zaGlmdCh0b2tlbik7XG4gICAgaWYgKHJlY29yZCAmJiByZWNvcmQudmFsdWUgPT0gQ0lSQ1VMQVIpIHtcbiAgICAgIC8vIFJlc2V0IHRoZSBDaXJjdWxhciBmbGFnLlxuICAgICAgcmVjb3JkLnZhbHVlID0gRU1QVFk7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVRva2VuKFxuICAgIHRva2VuOiBhbnksIHJlY29yZDogUmVjb3JkIHwgdW5kZWZpbmVkLCByZWNvcmRzOiBNYXA8YW55LCBSZWNvcmQ+LCBwYXJlbnQ6IEluamVjdG9yLFxuICAgIG5vdEZvdW5kVmFsdWU6IGFueSwgZmxhZ3M6IEluamVjdEZsYWdzKTogYW55IHtcbiAgbGV0IHZhbHVlO1xuICBpZiAocmVjb3JkICYmICEoZmxhZ3MgJiBJbmplY3RGbGFncy5Ta2lwU2VsZikpIHtcbiAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgcmVjb3JkLCB0aGlzIGltcGxpZXMgdGhhdCB3ZSBkb24ndCBvd24gdGhlIHByb3ZpZGVyIGhlbmNlIGRvbid0IGtub3cgaG93XG4gICAgLy8gdG8gcmVzb2x2ZSBpdC5cbiAgICB2YWx1ZSA9IHJlY29yZC52YWx1ZTtcbiAgICBpZiAodmFsdWUgPT0gQ0lSQ1VMQVIpIHtcbiAgICAgIHRocm93IEVycm9yKE5PX05FV19MSU5FICsgJ0NpcmN1bGFyIGRlcGVuZGVuY3knKTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBFTVBUWSkge1xuICAgICAgcmVjb3JkLnZhbHVlID0gQ0lSQ1VMQVI7XG4gICAgICBsZXQgb2JqID0gdW5kZWZpbmVkO1xuICAgICAgbGV0IHVzZU5ldyA9IHJlY29yZC51c2VOZXc7XG4gICAgICBsZXQgZm4gPSByZWNvcmQuZm47XG4gICAgICBsZXQgZGVwUmVjb3JkcyA9IHJlY29yZC5kZXBzO1xuICAgICAgbGV0IGRlcHMgPSBFTVBUWTtcbiAgICAgIGlmIChkZXBSZWNvcmRzLmxlbmd0aCkge1xuICAgICAgICBkZXBzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGVwUmVjb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGRlcFJlY29yZDogRGVwZW5kZW5jeVJlY29yZCA9IGRlcFJlY29yZHNbaV07XG4gICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGRlcFJlY29yZC5vcHRpb25zO1xuICAgICAgICAgIGNvbnN0IGNoaWxkUmVjb3JkID1cbiAgICAgICAgICAgICAgb3B0aW9ucyAmIE9wdGlvbkZsYWdzLkNoZWNrU2VsZiA/IHJlY29yZHMuZ2V0KGRlcFJlY29yZC50b2tlbikgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgZGVwcy5wdXNoKHRyeVJlc29sdmVUb2tlbihcbiAgICAgICAgICAgICAgLy8gQ3VycmVudCBUb2tlbiB0byByZXNvbHZlXG4gICAgICAgICAgICAgIGRlcFJlY29yZC50b2tlbixcbiAgICAgICAgICAgICAgLy8gQSByZWNvcmQgd2hpY2ggZGVzY3JpYmVzIGhvdyB0byByZXNvbHZlIHRoZSB0b2tlbi5cbiAgICAgICAgICAgICAgLy8gSWYgdW5kZWZpbmVkLCB0aGlzIG1lYW5zIHdlIGRvbid0IGhhdmUgc3VjaCBhIHJlY29yZFxuICAgICAgICAgICAgICBjaGlsZFJlY29yZCxcbiAgICAgICAgICAgICAgLy8gT3RoZXIgcmVjb3JkcyB3ZSBrbm93IGFib3V0LlxuICAgICAgICAgICAgICByZWNvcmRzLFxuICAgICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBrbm93IGhvdyB0byByZXNvbHZlIGRlcGVuZGVuY3kgYW5kIHdlIHNob3VsZCBub3QgY2hlY2sgcGFyZW50IGZvciBpdCxcbiAgICAgICAgICAgICAgLy8gdGhhbiBwYXNzIGluIE51bGwgaW5qZWN0b3IuXG4gICAgICAgICAgICAgICFjaGlsZFJlY29yZCAmJiAhKG9wdGlvbnMgJiBPcHRpb25GbGFncy5DaGVja1BhcmVudCkgPyBOVUxMX0lOSkVDVE9SIDogcGFyZW50LFxuICAgICAgICAgICAgICBvcHRpb25zICYgT3B0aW9uRmxhZ3MuT3B0aW9uYWwgPyBudWxsIDogSW5qZWN0b3IuVEhST1dfSUZfTk9UX0ZPVU5ELFxuICAgICAgICAgICAgICBJbmplY3RGbGFncy5EZWZhdWx0KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlY29yZC52YWx1ZSA9IHZhbHVlID0gdXNlTmV3ID8gbmV3IChmbiBhcyBhbnkpKC4uLmRlcHMpIDogZm4uYXBwbHkob2JqLCBkZXBzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoIShmbGFncyAmIEluamVjdEZsYWdzLlNlbGYpKSB7XG4gICAgdmFsdWUgPSBwYXJlbnQuZ2V0KHRva2VuLCBub3RGb3VuZFZhbHVlLCBJbmplY3RGbGFncy5EZWZhdWx0KTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cblxuZnVuY3Rpb24gY29tcHV0ZURlcHMocHJvdmlkZXI6IFN0YXRpY1Byb3ZpZGVyKTogRGVwZW5kZW5jeVJlY29yZFtdIHtcbiAgbGV0IGRlcHM6IERlcGVuZGVuY3lSZWNvcmRbXSA9IEVNUFRZO1xuICBjb25zdCBwcm92aWRlckRlcHM6IGFueVtdID1cbiAgICAgIChwcm92aWRlciBhcyBFeGlzdGluZ1Byb3ZpZGVyICYgU3RhdGljQ2xhc3NQcm92aWRlciAmIENvbnN0cnVjdG9yUHJvdmlkZXIpLmRlcHM7XG4gIGlmIChwcm92aWRlckRlcHMgJiYgcHJvdmlkZXJEZXBzLmxlbmd0aCkge1xuICAgIGRlcHMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3ZpZGVyRGVwcy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IG9wdGlvbnMgPSBPcHRpb25GbGFncy5EZWZhdWx0O1xuICAgICAgbGV0IHRva2VuID0gcmVzb2x2ZUZvcndhcmRSZWYocHJvdmlkZXJEZXBzW2ldKTtcbiAgICAgIGlmICh0b2tlbiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwLCBhbm5vdGF0aW9ucyA9IHRva2VuOyBqIDwgYW5ub3RhdGlvbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBjb25zdCBhbm5vdGF0aW9uID0gYW5ub3RhdGlvbnNbal07XG4gICAgICAgICAgaWYgKGFubm90YXRpb24gaW5zdGFuY2VvZiBPcHRpb25hbCB8fCBhbm5vdGF0aW9uID09IE9wdGlvbmFsKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8IE9wdGlvbkZsYWdzLk9wdGlvbmFsO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYW5ub3RhdGlvbiBpbnN0YW5jZW9mIFNraXBTZWxmIHx8IGFubm90YXRpb24gPT0gU2tpcFNlbGYpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBvcHRpb25zICYgfk9wdGlvbkZsYWdzLkNoZWNrU2VsZjtcbiAgICAgICAgICB9IGVsc2UgaWYgKGFubm90YXRpb24gaW5zdGFuY2VvZiBTZWxmIHx8IGFubm90YXRpb24gPT0gU2VsZikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgJiB+T3B0aW9uRmxhZ3MuQ2hlY2tQYXJlbnQ7XG4gICAgICAgICAgfSBlbHNlIGlmIChhbm5vdGF0aW9uIGluc3RhbmNlb2YgSW5qZWN0KSB7XG4gICAgICAgICAgICB0b2tlbiA9IChhbm5vdGF0aW9uIGFzIEluamVjdCkudG9rZW47XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRva2VuID0gcmVzb2x2ZUZvcndhcmRSZWYoYW5ub3RhdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBkZXBzLnB1c2goe3Rva2VuLCBvcHRpb25zfSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKChwcm92aWRlciBhcyBFeGlzdGluZ1Byb3ZpZGVyKS51c2VFeGlzdGluZykge1xuICAgIGNvbnN0IHRva2VuID0gcmVzb2x2ZUZvcndhcmRSZWYoKHByb3ZpZGVyIGFzIEV4aXN0aW5nUHJvdmlkZXIpLnVzZUV4aXN0aW5nKTtcbiAgICBkZXBzID0gW3t0b2tlbiwgb3B0aW9uczogT3B0aW9uRmxhZ3MuRGVmYXVsdH1dO1xuICB9IGVsc2UgaWYgKCFwcm92aWRlckRlcHMgJiYgIShVU0VfVkFMVUUgaW4gcHJvdmlkZXIpKSB7XG4gICAgLy8gdXNlVmFsdWUgJiB1c2VFeGlzdGluZyBhcmUgdGhlIG9ubHkgb25lcyB3aGljaCBhcmUgZXhlbXB0IGZyb20gZGVwcyBhbGwgb3RoZXJzIG5lZWQgaXQuXG4gICAgdGhyb3cgc3RhdGljRXJyb3IoJ1xcJ2RlcHNcXCcgcmVxdWlyZWQnLCBwcm92aWRlcik7XG4gIH1cbiAgcmV0dXJuIGRlcHM7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHRleHQ6IHN0cmluZywgb2JqOiBhbnksIHNvdXJjZTogc3RyaW5nIHwgbnVsbCA9IG51bGwpOiBzdHJpbmcge1xuICB0ZXh0ID0gdGV4dCAmJiB0ZXh0LmNoYXJBdCgwKSA9PT0gJ1xcbicgJiYgdGV4dC5jaGFyQXQoMSkgPT0gTk9fTkVXX0xJTkUgPyB0ZXh0LnN1YnN0cigyKSA6IHRleHQ7XG4gIGxldCBjb250ZXh0ID0gc3RyaW5naWZ5KG9iaik7XG4gIGlmIChvYmogaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGNvbnRleHQgPSBvYmoubWFwKHN0cmluZ2lmeSkuam9pbignIC0+ICcpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgbGV0IHBhcnRzID0gPHN0cmluZ1tdPltdO1xuICAgIGZvciAobGV0IGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBsZXQgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgICAgcGFydHMucHVzaChcbiAgICAgICAgICAgIGtleSArICc6JyArICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gSlNPTi5zdHJpbmdpZnkodmFsdWUpIDogc3RyaW5naWZ5KHZhbHVlKSkpO1xuICAgICAgfVxuICAgIH1cbiAgICBjb250ZXh0ID0gYHske3BhcnRzLmpvaW4oJywgJyl9fWA7XG4gIH1cbiAgcmV0dXJuIGBTdGF0aWNJbmplY3RvckVycm9yJHtzb3VyY2UgPyAnKCcgKyBzb3VyY2UgKyAnKScgOiAnJ31bJHtjb250ZXh0fV06ICR7dGV4dC5yZXBsYWNlKE5FV19MSU5FLCAnXFxuICAnKX1gO1xufVxuXG5mdW5jdGlvbiBzdGF0aWNFcnJvcih0ZXh0OiBzdHJpbmcsIG9iajogYW55KTogRXJyb3Ige1xuICByZXR1cm4gbmV3IEVycm9yKGZvcm1hdEVycm9yKHRleHQsIG9iaikpO1xufVxuXG5mdW5jdGlvbiBnZXRDbG9zdXJlU2FmZVByb3BlcnR5PFQ+KG9ialdpdGhQcm9wZXJ0eVRvRXh0cmFjdDogVCk6IHN0cmluZyB7XG4gIGZvciAobGV0IGtleSBpbiBvYmpXaXRoUHJvcGVydHlUb0V4dHJhY3QpIHtcbiAgICBpZiAob2JqV2l0aFByb3BlcnR5VG9FeHRyYWN0W2tleV0gPT09IEdFVF9QUk9QRVJUWV9OQU1FKSB7XG4gICAgICByZXR1cm4ga2V5O1xuICAgIH1cbiAgfVxuICB0aHJvdyBFcnJvcignIXByb3AnKTtcbn1cblxuLyoqXG4gKiBJbmplY3Rpb24gZmxhZ3MgZm9yIERJLlxuICovXG5leHBvcnQgY29uc3QgZW51bSBJbmplY3RGbGFncyB7XG4gIERlZmF1bHQgPSAwLFxuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgdGhhdCBhbiBpbmplY3RvciBzaG91bGQgcmV0cmlldmUgYSBkZXBlbmRlbmN5IGZyb20gYW55IGluamVjdG9yIHVudGlsIHJlYWNoaW5nIHRoZVxuICAgKiBob3N0IGVsZW1lbnQgb2YgdGhlIGN1cnJlbnQgY29tcG9uZW50LiAoT25seSB1c2VkIHdpdGggRWxlbWVudCBJbmplY3RvcilcbiAgICovXG4gIEhvc3QgPSAxIDw8IDAsXG4gIC8qKiBEb24ndCBkZXNjZW5kIGludG8gYW5jZXN0b3JzIG9mIHRoZSBub2RlIHJlcXVlc3RpbmcgaW5qZWN0aW9uLiAqL1xuICBTZWxmID0gMSA8PCAxLFxuICAvKiogU2tpcCB0aGUgbm9kZSB0aGF0IGlzIHJlcXVlc3RpbmcgaW5qZWN0aW9uLiAqL1xuICBTa2lwU2VsZiA9IDEgPDwgMixcbiAgLyoqIEluamVjdCBgZGVmYXVsdFZhbHVlYCBpbnN0ZWFkIGlmIHRva2VuIG5vdCBmb3VuZC4gKi9cbiAgT3B0aW9uYWwgPSAxIDw8IDMsXG59XG5cbi8qKlxuICogQ3VycmVudCBpbmplY3RvciB2YWx1ZSB1c2VkIGJ5IGBpbmplY3RgLlxuICogLSBgdW5kZWZpbmVkYDogaXQgaXMgYW4gZXJyb3IgdG8gY2FsbCBgaW5qZWN0YFxuICogLSBgbnVsbGA6IGBpbmplY3RgIGNhbiBiZSBjYWxsZWQgYnV0IHRoZXJlIGlzIG5vIGluamVjdG9yIChsaW1wLW1vZGUpLlxuICogLSBJbmplY3RvciBpbnN0YW5jZTogVXNlIHRoZSBpbmplY3RvciBmb3IgcmVzb2x1dGlvbi5cbiAqL1xubGV0IF9jdXJyZW50SW5qZWN0b3I6IEluamVjdG9yfHVuZGVmaW5lZHxudWxsID0gdW5kZWZpbmVkO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q3VycmVudEluamVjdG9yKGluamVjdG9yOiBJbmplY3RvciB8IG51bGwgfCB1bmRlZmluZWQpOiBJbmplY3Rvcnx1bmRlZmluZWR8bnVsbCB7XG4gIGNvbnN0IGZvcm1lciA9IF9jdXJyZW50SW5qZWN0b3I7XG4gIF9jdXJyZW50SW5qZWN0b3IgPSBpbmplY3RvcjtcbiAgcmV0dXJuIGZvcm1lcjtcbn1cblxuLyoqXG4gKiBJbmplY3RzIGEgdG9rZW4gZnJvbSB0aGUgY3VycmVudGx5IGFjdGl2ZSBpbmplY3Rvci5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIG11c3QgYmUgdXNlZCBpbiB0aGUgY29udGV4dCBvZiBhIGZhY3RvcnkgZnVuY3Rpb24gc3VjaCBhcyBvbmUgZGVmaW5lZCBmb3IgYW5cbiAqIGBJbmplY3Rpb25Ub2tlbmAsIGFuZCB3aWxsIHRocm93IGFuIGVycm9yIGlmIG5vdCBjYWxsZWQgZnJvbSBzdWNoIGEgY29udGV4dC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9kaS90cy9pbmplY3Rvcl9zcGVjLnRzIHJlZ2lvbj0nU2hha2VhYmxlSW5qZWN0aW9uVG9rZW4nfVxuICpcbiAqIFdpdGhpbiBzdWNoIGEgZmFjdG9yeSBmdW5jdGlvbiBgaW5qZWN0YCBpcyB1dGlsaXplZCB0byByZXF1ZXN0IGluamVjdGlvbiBvZiBhIGRlcGVuZGVuY3ksIGluc3RlYWRcbiAqIG9mIHByb3ZpZGluZyBhbiBhZGRpdGlvbmFsIGFycmF5IG9mIGRlcGVuZGVuY2llcyBhcyB3YXMgY29tbW9uIHRvIGRvIHdpdGggYHVzZUZhY3RvcnlgIHByb3ZpZGVycy5cbiAqIGBpbmplY3RgIGlzIGZhc3RlciBhbmQgbW9yZSB0eXBlLXNhZmUuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0PFQ+KHRva2VuOiBUeXBlPFQ+fCBJbmplY3Rpb25Ub2tlbjxUPik6IFQ7XG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0PFQ+KHRva2VuOiBUeXBlPFQ+fCBJbmplY3Rpb25Ub2tlbjxUPiwgZmxhZ3M/OiBJbmplY3RGbGFncyk6IFR8bnVsbDtcbmV4cG9ydCBmdW5jdGlvbiBpbmplY3Q8VD4odG9rZW46IFR5cGU8VD58IEluamVjdGlvblRva2VuPFQ+LCBmbGFncyA9IEluamVjdEZsYWdzLkRlZmF1bHQpOiBUfG51bGwge1xuICBpZiAoX2N1cnJlbnRJbmplY3RvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBpbmplY3QoKSBtdXN0IGJlIGNhbGxlZCBmcm9tIGFuIGluamVjdGlvbiBjb250ZXh0YCk7XG4gIH0gZWxzZSBpZiAoX2N1cnJlbnRJbmplY3RvciA9PT0gbnVsbCkge1xuICAgIGNvbnN0IGluamVjdGFibGVEZWY6IEluamVjdGFibGVEZWY8VD4gPSAodG9rZW4gYXMgYW55KS5uZ0luamVjdGFibGVEZWY7XG4gICAgaWYgKGluamVjdGFibGVEZWYgJiYgaW5qZWN0YWJsZURlZi5wcm92aWRlZEluID09ICdyb290Jykge1xuICAgICAgcmV0dXJuIGluamVjdGFibGVEZWYudmFsdWUgPT09IHVuZGVmaW5lZCA/IGluamVjdGFibGVEZWYudmFsdWUgPSBpbmplY3RhYmxlRGVmLmZhY3RvcnkoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0YWJsZURlZi52YWx1ZTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbmplY3RvcjogTk9UX0ZPVU5EIFske3N0cmluZ2lmeSh0b2tlbil9XWApO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBfY3VycmVudEluamVjdG9yLmdldCh0b2tlbiwgZmxhZ3MgJiBJbmplY3RGbGFncy5PcHRpb25hbCA/IG51bGwgOiB1bmRlZmluZWQsIGZsYWdzKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0QXJncyh0eXBlczogKFR5cGU8YW55PnwgSW5qZWN0aW9uVG9rZW48YW55PnwgYW55W10pW10pOiBhbnlbXSB7XG4gIGNvbnN0IGFyZ3M6IGFueVtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBhcmcgPSB0eXBlc1tpXTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG4gICAgICBpZiAoYXJnLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FyZ3VtZW50cyBhcnJheSBtdXN0IGhhdmUgYXJndW1lbnRzLicpO1xuICAgICAgfVxuICAgICAgbGV0IHR5cGU6IFR5cGU8YW55Pnx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgICBsZXQgZmxhZ3M6IEluamVjdEZsYWdzID0gSW5qZWN0RmxhZ3MuRGVmYXVsdDtcblxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBhcmcubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3QgbWV0YSA9IGFyZ1tqXTtcbiAgICAgICAgaWYgKG1ldGEgaW5zdGFuY2VvZiBPcHRpb25hbCB8fCBtZXRhLl9fcHJvdG9fXy5uZ01ldGFkYXRhTmFtZSA9PT0gJ09wdGlvbmFsJykge1xuICAgICAgICAgIGZsYWdzIHw9IEluamVjdEZsYWdzLk9wdGlvbmFsO1xuICAgICAgICB9IGVsc2UgaWYgKG1ldGEgaW5zdGFuY2VvZiBTa2lwU2VsZiB8fCBtZXRhLl9fcHJvdG9fXy5uZ01ldGFkYXRhTmFtZSA9PT0gJ1NraXBTZWxmJykge1xuICAgICAgICAgIGZsYWdzIHw9IEluamVjdEZsYWdzLlNraXBTZWxmO1xuICAgICAgICB9IGVsc2UgaWYgKG1ldGEgaW5zdGFuY2VvZiBTZWxmIHx8IG1ldGEuX19wcm90b19fLm5nTWV0YWRhdGFOYW1lID09PSAnU2VsZicpIHtcbiAgICAgICAgICBmbGFncyB8PSBJbmplY3RGbGFncy5TZWxmO1xuICAgICAgICB9IGVsc2UgaWYgKG1ldGEgaW5zdGFuY2VvZiBJbmplY3QpIHtcbiAgICAgICAgICB0eXBlID0gbWV0YS50b2tlbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0eXBlID0gbWV0YTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBhcmdzLnB1c2goaW5qZWN0KHR5cGUgISwgZmxhZ3MpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXJncy5wdXNoKGluamVjdChhcmcpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFyZ3M7XG59XG4iXX0=