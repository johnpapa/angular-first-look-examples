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
import { Directive, EventEmitter, Host, Inject, Input, Optional, Output, Self, forwardRef } from '@angular/core';
import { FormControl } from '../model';
import { NG_ASYNC_VALIDATORS, NG_VALIDATORS } from '../validators';
import { AbstractFormGroupDirective } from './abstract_form_group_directive';
import { ControlContainer } from './control_container';
import { NG_VALUE_ACCESSOR } from './control_value_accessor';
import { NgControl } from './ng_control';
import { NgForm } from './ng_form';
import { NgModelGroup } from './ng_model_group';
import { composeAsyncValidators, composeValidators, controlPath, isPropertyUpdated, selectValueAccessor, setUpControl } from './shared';
import { TemplateDrivenErrors } from './template_driven_errors';
export const /** @type {?} */ formControlBinding = {
    provide: NgControl,
    useExisting: forwardRef(() => NgModel)
};
/**
 * `ngModel` forces an additional change detection run when its inputs change:
 * E.g.:
 * ```
 * <div>{{myModel.valid}}</div>
 * <input [(ngModel)]="myValue" #myModel="ngModel">
 * ```
 * I.e. `ngModel` can export itself on the element and then be used in the template.
 * Normally, this would result in expressions before the `input` that use the exported directive
 * to have and old value as they have been
 * dirty checked before. As this is a very common case for `ngModel`, we added this second change
 * detection run.
 *
 * Notes:
 * - this is just one extra run no matter how many `ngModel` have been changed.
 * - this is a general problem when using `exportAs` for directives!
 */
const /** @type {?} */ resolvedPromise = Promise.resolve(null);
/**
 * \@description
 *
 * Creates a `FormControl` instance from a domain model and binds it
 * to a form control element.
 *
 * The `FormControl` instance will track the value, user interaction, and
 * validation status of the control and keep the view synced with the model. If used
 * within a parent form, the directive will also register itself with the form as a child
 * control.
 *
 * This directive can be used by itself or as part of a larger form. All you need is the
 * `ngModel` selector to activate it.
 *
 * It accepts a domain model as an optional `Input`. If you have a one-way binding
 * to `ngModel` with `[]` syntax, changing the value of the domain model in the component
 * class will set the value in the view. If you have a two-way binding with `[()]` syntax
 * (also known as 'banana-box syntax'), the value in the UI will always be synced back to
 * the domain model in your class as well.
 *
 * If you wish to inspect the properties of the associated `FormControl` (like
 * validity state), you can also export the directive into a local template variable using
 * `ngModel` as the key (ex: `#myVar="ngModel"`). You can then access the control using the
 * directive's `control` property, but most properties you'll need (like `valid` and `dirty`)
 * will fall through to the control anyway, so you can access them directly. You can see a
 * full list of properties directly available in `AbstractControlDirective`.
 *
 * The following is an example of a simple standalone control using `ngModel`:
 *
 * {\@example forms/ts/simpleNgModel/simple_ng_model_example.ts region='Component'}
 *
 * When using the `ngModel` within `<form>` tags, you'll also need to supply a `name` attribute
 * so that the control can be registered with the parent form under that name.
 *
 * It's worth noting that in the context of a parent form, you often can skip one-way or
 * two-way binding because the parent form will sync the value for you. You can access
 * its properties by exporting it into a local template variable using `ngForm` (ex:
 * `#f="ngForm"`). Then you can pass it where it needs to go on submit.
 *
 * If you do need to populate initial values into your form, using a one-way binding for
 * `ngModel` tends to be sufficient as long as you use the exported form's value rather
 * than the domain model's value on submit.
 *
 * Take a look at an example of using `ngModel` within a form:
 *
 * {\@example forms/ts/simpleForm/simple_form_example.ts region='Component'}
 *
 * To see `ngModel` examples with different form control types, see:
 *
 * * Radio buttons: `RadioControlValueAccessor`
 * * Selects: `SelectControlValueAccessor`
 *
 * **npm package**: `\@angular/forms`
 *
 * **NgModule**: `FormsModule`
 *
 *
 */
export class NgModel extends NgControl {
    /**
     * @param {?} parent
     * @param {?} validators
     * @param {?} asyncValidators
     * @param {?} valueAccessors
     */
    constructor(parent, validators, asyncValidators, valueAccessors) {
        super();
        this.control = new FormControl();
        /**
         * \@internal
         */
        this._registered = false;
        this.update = new EventEmitter();
        this._parent = parent;
        this._rawValidators = validators || [];
        this._rawAsyncValidators = asyncValidators || [];
        this.valueAccessor = selectValueAccessor(this, valueAccessors);
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        this._checkForErrors();
        if (!this._registered)
            this._setUpControl();
        if ('isDisabled' in changes) {
            this._updateDisabled(changes);
        }
        if (isPropertyUpdated(changes, this.viewModel)) {
            this._updateValue(this.model);
            this.viewModel = this.model;
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() { this.formDirective && this.formDirective.removeControl(this); }
    /**
     * @return {?}
     */
    get path() {
        return this._parent ? controlPath(this.name, this._parent) : [this.name];
    }
    /**
     * @return {?}
     */
    get formDirective() { return this._parent ? this._parent.formDirective : null; }
    /**
     * @return {?}
     */
    get validator() { return composeValidators(this._rawValidators); }
    /**
     * @return {?}
     */
    get asyncValidator() {
        return composeAsyncValidators(this._rawAsyncValidators);
    }
    /**
     * @param {?} newValue
     * @return {?}
     */
    viewToModelUpdate(newValue) {
        this.viewModel = newValue;
        this.update.emit(newValue);
    }
    /**
     * @return {?}
     */
    _setUpControl() {
        this._setUpdateStrategy();
        this._isStandalone() ? this._setUpStandalone() :
            this.formDirective.addControl(this);
        this._registered = true;
    }
    /**
     * @return {?}
     */
    _setUpdateStrategy() {
        if (this.options && this.options.updateOn != null) {
            this.control._updateOn = this.options.updateOn;
        }
    }
    /**
     * @return {?}
     */
    _isStandalone() {
        return !this._parent || !!(this.options && this.options.standalone);
    }
    /**
     * @return {?}
     */
    _setUpStandalone() {
        setUpControl(this.control, this);
        this.control.updateValueAndValidity({ emitEvent: false });
    }
    /**
     * @return {?}
     */
    _checkForErrors() {
        if (!this._isStandalone()) {
            this._checkParentType();
        }
        this._checkName();
    }
    /**
     * @return {?}
     */
    _checkParentType() {
        if (!(this._parent instanceof NgModelGroup) &&
            this._parent instanceof AbstractFormGroupDirective) {
            TemplateDrivenErrors.formGroupNameException();
        }
        else if (!(this._parent instanceof NgModelGroup) && !(this._parent instanceof NgForm)) {
            TemplateDrivenErrors.modelParentException();
        }
    }
    /**
     * @return {?}
     */
    _checkName() {
        if (this.options && this.options.name)
            this.name = this.options.name;
        if (!this._isStandalone() && !this.name) {
            TemplateDrivenErrors.missingNameException();
        }
    }
    /**
     * @param {?} value
     * @return {?}
     */
    _updateValue(value) {
        resolvedPromise.then(() => { this.control.setValue(value, { emitViewToModelChange: false }); });
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    _updateDisabled(changes) {
        const /** @type {?} */ disabledValue = changes['isDisabled'].currentValue;
        const /** @type {?} */ isDisabled = disabledValue === '' || (disabledValue && disabledValue !== 'false');
        resolvedPromise.then(() => {
            if (isDisabled && !this.control.disabled) {
                this.control.disable();
            }
            else if (!isDisabled && this.control.disabled) {
                this.control.enable();
            }
        });
    }
}
NgModel.decorators = [
    { type: Directive, args: [{
                selector: '[ngModel]:not([formControlName]):not([formControl])',
                providers: [formControlBinding],
                exportAs: 'ngModel'
            },] }
];
/** @nocollapse */
NgModel.ctorParameters = () => [
    { type: ControlContainer, decorators: [{ type: Optional }, { type: Host }] },
    { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALIDATORS,] }] },
    { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_ASYNC_VALIDATORS,] }] },
    { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALUE_ACCESSOR,] }] }
];
NgModel.propDecorators = {
    name: [{ type: Input }],
    isDisabled: [{ type: Input, args: ['disabled',] }],
    model: [{ type: Input, args: ['ngModel',] }],
    options: [{ type: Input, args: ['ngModelOptions',] }],
    update: [{ type: Output, args: ['ngModelChange',] }]
};
function NgModel_tsickle_Closure_declarations() {
    /** @type {?} */
    NgModel.prototype.control;
    /**
     * \@internal
     * @type {?}
     */
    NgModel.prototype._registered;
    /** @type {?} */
    NgModel.prototype.viewModel;
    /** @type {?} */
    NgModel.prototype.name;
    /** @type {?} */
    NgModel.prototype.isDisabled;
    /** @type {?} */
    NgModel.prototype.model;
    /**
     * Options object for this `ngModel` instance. You can configure the following properties:
     *
     * **name**: An alternative to setting the name attribute on the form control element.
     * Sometimes, especially with custom form components, the name attribute might be used
     * as an `\@Input` property for a different purpose. In cases like these, you can configure
     * the `ngModel` name through this option.
     *
     * ```html
     * <form>
     *   <my-person-control name="Nancy" ngModel [ngModelOptions]="{name: 'user'}">
     *   </my-person-control>
     * </form>
     * <!-- form value: {user: ''} -->
     * ```
     *
     * **standalone**: Defaults to false. If this is set to true, the `ngModel` will not
     * register itself with its parent form, and will act as if it's not in the form. This
     * can be handy if you have form meta-controls, a.k.a. form elements nested in
     * the `<form>` tag that control the display of the form, but don't contain form data.
     *
     * ```html
     * <form>
     *   <input name="login" ngModel placeholder="Login">
     *   <input type="checkbox" ngModel [ngModelOptions]="{standalone: true}"> Show more options?
     * </form>
     * <!-- form value: {login: ''} -->
     * ```
     *
     * **updateOn**: Defaults to `'change'`. Defines the event upon which the form control
     * value and validity will update. Also accepts `'blur'` and `'submit'`.
     *
     * ```html
     * <input [(ngModel)]="firstName" [ngModelOptions]="{updateOn: 'blur'}">
     * ```
     *
     * @type {?}
     */
    NgModel.prototype.options;
    /** @type {?} */
    NgModel.prototype.update;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9mb3Jtcy9zcmMvZGlyZWN0aXZlcy9uZ19tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUF3QixRQUFRLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBaUIsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXBKLE9BQU8sRUFBQyxXQUFXLEVBQVksTUFBTSxVQUFVLENBQUM7QUFDaEQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLGFBQWEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVqRSxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUMzRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQXVCLGlCQUFpQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDakYsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN2QyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ2pDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsc0JBQXNCLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLFlBQVksRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUN0SSxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUc5RCxNQUFNLENBQUMsdUJBQU0sa0JBQWtCLEdBQVE7SUFDckMsT0FBTyxFQUFFLFNBQVM7SUFDbEIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7Q0FDdkMsQ0FBQzs7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S2xCLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUscURBQXFEO2dCQUMvRCxTQUFTLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztnQkFDL0IsUUFBUSxFQUFFLFNBQVM7YUFDcEI7Ozs7WUEvRk8sZ0JBQWdCLHVCQW9KVCxRQUFRLFlBQUksSUFBSTtZQUNzQyxLQUFLLHVCQUEzRCxRQUFRLFlBQUksSUFBSSxZQUFJLE1BQU0sU0FBQyxhQUFhO1lBQ3lCLEtBQUssdUJBQXRFLFFBQVEsWUFBSSxJQUFJLFlBQUksTUFBTSxTQUFDLG1CQUFtQjt3Q0FDOUMsUUFBUSxZQUFJLElBQUksWUFBSSxNQUFNLFNBQUMsaUJBQWlCOzs7bUJBaER4RCxLQUFLO3lCQUNMLEtBQUssU0FBQyxVQUFVO29CQUNoQixLQUFLLFNBQUMsU0FBUztzQkF1Q2YsS0FBSyxTQUFDLGdCQUFnQjtxQkFFdEIsTUFBTSxTQUFDLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFdmVudEVtaXR0ZXIsIEhvc3QsIEluamVjdCwgSW5wdXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPcHRpb25hbCwgT3V0cHV0LCBTZWxmLCBTaW1wbGVDaGFuZ2VzLCBmb3J3YXJkUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtGb3JtQ29udHJvbCwgRm9ybUhvb2tzfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge05HX0FTWU5DX1ZBTElEQVRPUlMsIE5HX1ZBTElEQVRPUlN9IGZyb20gJy4uL3ZhbGlkYXRvcnMnO1xuXG5pbXBvcnQge0Fic3RyYWN0Rm9ybUdyb3VwRGlyZWN0aXZlfSBmcm9tICcuL2Fic3RyYWN0X2Zvcm1fZ3JvdXBfZGlyZWN0aXZlJztcbmltcG9ydCB7Q29udHJvbENvbnRhaW5lcn0gZnJvbSAnLi9jb250cm9sX2NvbnRhaW5lcic7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnLi9jb250cm9sX3ZhbHVlX2FjY2Vzc29yJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtOZ0Zvcm19IGZyb20gJy4vbmdfZm9ybSc7XG5pbXBvcnQge05nTW9kZWxHcm91cH0gZnJvbSAnLi9uZ19tb2RlbF9ncm91cCc7XG5pbXBvcnQge2NvbXBvc2VBc3luY1ZhbGlkYXRvcnMsIGNvbXBvc2VWYWxpZGF0b3JzLCBjb250cm9sUGF0aCwgaXNQcm9wZXJ0eVVwZGF0ZWQsIHNlbGVjdFZhbHVlQWNjZXNzb3IsIHNldFVwQ29udHJvbH0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtUZW1wbGF0ZURyaXZlbkVycm9yc30gZnJvbSAnLi90ZW1wbGF0ZV9kcml2ZW5fZXJyb3JzJztcbmltcG9ydCB7QXN5bmNWYWxpZGF0b3IsIEFzeW5jVmFsaWRhdG9yRm4sIFZhbGlkYXRvciwgVmFsaWRhdG9yRm59IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5cbmV4cG9ydCBjb25zdCBmb3JtQ29udHJvbEJpbmRpbmc6IGFueSA9IHtcbiAgcHJvdmlkZTogTmdDb250cm9sLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ01vZGVsKVxufTtcblxuLyoqXG4gKiBgbmdNb2RlbGAgZm9yY2VzIGFuIGFkZGl0aW9uYWwgY2hhbmdlIGRldGVjdGlvbiBydW4gd2hlbiBpdHMgaW5wdXRzIGNoYW5nZTpcbiAqIEUuZy46XG4gKiBgYGBcbiAqIDxkaXY+e3tteU1vZGVsLnZhbGlkfX08L2Rpdj5cbiAqIDxpbnB1dCBbKG5nTW9kZWwpXT1cIm15VmFsdWVcIiAjbXlNb2RlbD1cIm5nTW9kZWxcIj5cbiAqIGBgYFxuICogSS5lLiBgbmdNb2RlbGAgY2FuIGV4cG9ydCBpdHNlbGYgb24gdGhlIGVsZW1lbnQgYW5kIHRoZW4gYmUgdXNlZCBpbiB0aGUgdGVtcGxhdGUuXG4gKiBOb3JtYWxseSwgdGhpcyB3b3VsZCByZXN1bHQgaW4gZXhwcmVzc2lvbnMgYmVmb3JlIHRoZSBgaW5wdXRgIHRoYXQgdXNlIHRoZSBleHBvcnRlZCBkaXJlY3RpdmVcbiAqIHRvIGhhdmUgYW5kIG9sZCB2YWx1ZSBhcyB0aGV5IGhhdmUgYmVlblxuICogZGlydHkgY2hlY2tlZCBiZWZvcmUuIEFzIHRoaXMgaXMgYSB2ZXJ5IGNvbW1vbiBjYXNlIGZvciBgbmdNb2RlbGAsIHdlIGFkZGVkIHRoaXMgc2Vjb25kIGNoYW5nZVxuICogZGV0ZWN0aW9uIHJ1bi5cbiAqXG4gKiBOb3RlczpcbiAqIC0gdGhpcyBpcyBqdXN0IG9uZSBleHRyYSBydW4gbm8gbWF0dGVyIGhvdyBtYW55IGBuZ01vZGVsYCBoYXZlIGJlZW4gY2hhbmdlZC5cbiAqIC0gdGhpcyBpcyBhIGdlbmVyYWwgcHJvYmxlbSB3aGVuIHVzaW5nIGBleHBvcnRBc2AgZm9yIGRpcmVjdGl2ZXMhXG4gKi9cbmNvbnN0IHJlc29sdmVkUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShudWxsKTtcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBDcmVhdGVzIGEgYEZvcm1Db250cm9sYCBpbnN0YW5jZSBmcm9tIGEgZG9tYWluIG1vZGVsIGFuZCBiaW5kcyBpdFxuICogdG8gYSBmb3JtIGNvbnRyb2wgZWxlbWVudC5cbiAqXG4gKiBUaGUgYEZvcm1Db250cm9sYCBpbnN0YW5jZSB3aWxsIHRyYWNrIHRoZSB2YWx1ZSwgdXNlciBpbnRlcmFjdGlvbiwgYW5kXG4gKiB2YWxpZGF0aW9uIHN0YXR1cyBvZiB0aGUgY29udHJvbCBhbmQga2VlcCB0aGUgdmlldyBzeW5jZWQgd2l0aCB0aGUgbW9kZWwuIElmIHVzZWRcbiAqIHdpdGhpbiBhIHBhcmVudCBmb3JtLCB0aGUgZGlyZWN0aXZlIHdpbGwgYWxzbyByZWdpc3RlciBpdHNlbGYgd2l0aCB0aGUgZm9ybSBhcyBhIGNoaWxkXG4gKiBjb250cm9sLlxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIGNhbiBiZSB1c2VkIGJ5IGl0c2VsZiBvciBhcyBwYXJ0IG9mIGEgbGFyZ2VyIGZvcm0uIEFsbCB5b3UgbmVlZCBpcyB0aGVcbiAqIGBuZ01vZGVsYCBzZWxlY3RvciB0byBhY3RpdmF0ZSBpdC5cbiAqXG4gKiBJdCBhY2NlcHRzIGEgZG9tYWluIG1vZGVsIGFzIGFuIG9wdGlvbmFsIGBJbnB1dGAuIElmIHlvdSBoYXZlIGEgb25lLXdheSBiaW5kaW5nXG4gKiB0byBgbmdNb2RlbGAgd2l0aCBgW11gIHN5bnRheCwgY2hhbmdpbmcgdGhlIHZhbHVlIG9mIHRoZSBkb21haW4gbW9kZWwgaW4gdGhlIGNvbXBvbmVudFxuICogY2xhc3Mgd2lsbCBzZXQgdGhlIHZhbHVlIGluIHRoZSB2aWV3LiBJZiB5b3UgaGF2ZSBhIHR3by13YXkgYmluZGluZyB3aXRoIGBbKCldYCBzeW50YXhcbiAqIChhbHNvIGtub3duIGFzICdiYW5hbmEtYm94IHN5bnRheCcpLCB0aGUgdmFsdWUgaW4gdGhlIFVJIHdpbGwgYWx3YXlzIGJlIHN5bmNlZCBiYWNrIHRvXG4gKiB0aGUgZG9tYWluIG1vZGVsIGluIHlvdXIgY2xhc3MgYXMgd2VsbC5cbiAqXG4gKiBJZiB5b3Ugd2lzaCB0byBpbnNwZWN0IHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBhc3NvY2lhdGVkIGBGb3JtQ29udHJvbGAgKGxpa2VcbiAqIHZhbGlkaXR5IHN0YXRlKSwgeW91IGNhbiBhbHNvIGV4cG9ydCB0aGUgZGlyZWN0aXZlIGludG8gYSBsb2NhbCB0ZW1wbGF0ZSB2YXJpYWJsZSB1c2luZ1xuICogYG5nTW9kZWxgIGFzIHRoZSBrZXkgKGV4OiBgI215VmFyPVwibmdNb2RlbFwiYCkuIFlvdSBjYW4gdGhlbiBhY2Nlc3MgdGhlIGNvbnRyb2wgdXNpbmcgdGhlXG4gKiBkaXJlY3RpdmUncyBgY29udHJvbGAgcHJvcGVydHksIGJ1dCBtb3N0IHByb3BlcnRpZXMgeW91J2xsIG5lZWQgKGxpa2UgYHZhbGlkYCBhbmQgYGRpcnR5YClcbiAqIHdpbGwgZmFsbCB0aHJvdWdoIHRvIHRoZSBjb250cm9sIGFueXdheSwgc28geW91IGNhbiBhY2Nlc3MgdGhlbSBkaXJlY3RseS4gWW91IGNhbiBzZWUgYVxuICogZnVsbCBsaXN0IG9mIHByb3BlcnRpZXMgZGlyZWN0bHkgYXZhaWxhYmxlIGluIGBBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmVgLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgaXMgYW4gZXhhbXBsZSBvZiBhIHNpbXBsZSBzdGFuZGFsb25lIGNvbnRyb2wgdXNpbmcgYG5nTW9kZWxgOlxuICpcbiAqIHtAZXhhbXBsZSBmb3Jtcy90cy9zaW1wbGVOZ01vZGVsL3NpbXBsZV9uZ19tb2RlbF9leGFtcGxlLnRzIHJlZ2lvbj0nQ29tcG9uZW50J31cbiAqXG4gKiBXaGVuIHVzaW5nIHRoZSBgbmdNb2RlbGAgd2l0aGluIGA8Zm9ybT5gIHRhZ3MsIHlvdSdsbCBhbHNvIG5lZWQgdG8gc3VwcGx5IGEgYG5hbWVgIGF0dHJpYnV0ZVxuICogc28gdGhhdCB0aGUgY29udHJvbCBjYW4gYmUgcmVnaXN0ZXJlZCB3aXRoIHRoZSBwYXJlbnQgZm9ybSB1bmRlciB0aGF0IG5hbWUuXG4gKlxuICogSXQncyB3b3J0aCBub3RpbmcgdGhhdCBpbiB0aGUgY29udGV4dCBvZiBhIHBhcmVudCBmb3JtLCB5b3Ugb2Z0ZW4gY2FuIHNraXAgb25lLXdheSBvclxuICogdHdvLXdheSBiaW5kaW5nIGJlY2F1c2UgdGhlIHBhcmVudCBmb3JtIHdpbGwgc3luYyB0aGUgdmFsdWUgZm9yIHlvdS4gWW91IGNhbiBhY2Nlc3NcbiAqIGl0cyBwcm9wZXJ0aWVzIGJ5IGV4cG9ydGluZyBpdCBpbnRvIGEgbG9jYWwgdGVtcGxhdGUgdmFyaWFibGUgdXNpbmcgYG5nRm9ybWAgKGV4OlxuICogYCNmPVwibmdGb3JtXCJgKS4gVGhlbiB5b3UgY2FuIHBhc3MgaXQgd2hlcmUgaXQgbmVlZHMgdG8gZ28gb24gc3VibWl0LlxuICpcbiAqIElmIHlvdSBkbyBuZWVkIHRvIHBvcHVsYXRlIGluaXRpYWwgdmFsdWVzIGludG8geW91ciBmb3JtLCB1c2luZyBhIG9uZS13YXkgYmluZGluZyBmb3JcbiAqIGBuZ01vZGVsYCB0ZW5kcyB0byBiZSBzdWZmaWNpZW50IGFzIGxvbmcgYXMgeW91IHVzZSB0aGUgZXhwb3J0ZWQgZm9ybSdzIHZhbHVlIHJhdGhlclxuICogdGhhbiB0aGUgZG9tYWluIG1vZGVsJ3MgdmFsdWUgb24gc3VibWl0LlxuICpcbiAqIFRha2UgYSBsb29rIGF0IGFuIGV4YW1wbGUgb2YgdXNpbmcgYG5nTW9kZWxgIHdpdGhpbiBhIGZvcm06XG4gKlxuICoge0BleGFtcGxlIGZvcm1zL3RzL3NpbXBsZUZvcm0vc2ltcGxlX2Zvcm1fZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKlxuICogVG8gc2VlIGBuZ01vZGVsYCBleGFtcGxlcyB3aXRoIGRpZmZlcmVudCBmb3JtIGNvbnRyb2wgdHlwZXMsIHNlZTpcbiAqXG4gKiAqIFJhZGlvIGJ1dHRvbnM6IGBSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yYFxuICogKiBTZWxlY3RzOiBgU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3JgXG4gKlxuICogKipucG0gcGFja2FnZSoqOiBgQGFuZ3VsYXIvZm9ybXNgXG4gKlxuICogKipOZ01vZHVsZSoqOiBgRm9ybXNNb2R1bGVgXG4gKlxuICpcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nTW9kZWxdOm5vdChbZm9ybUNvbnRyb2xOYW1lXSk6bm90KFtmb3JtQ29udHJvbF0pJyxcbiAgcHJvdmlkZXJzOiBbZm9ybUNvbnRyb2xCaW5kaW5nXSxcbiAgZXhwb3J0QXM6ICduZ01vZGVsJ1xufSlcbmV4cG9ydCBjbGFzcyBOZ01vZGVsIGV4dGVuZHMgTmdDb250cm9sIGltcGxlbWVudHMgT25DaGFuZ2VzLFxuICAgIE9uRGVzdHJveSB7XG4gIHB1YmxpYyByZWFkb25seSBjb250cm9sOiBGb3JtQ29udHJvbCA9IG5ldyBGb3JtQ29udHJvbCgpO1xuICAvKiogQGludGVybmFsICovXG4gIF9yZWdpc3RlcmVkID0gZmFsc2U7XG4gIHZpZXdNb2RlbDogYW55O1xuXG4gIEBJbnB1dCgpIG5hbWU6IHN0cmluZztcbiAgQElucHV0KCdkaXNhYmxlZCcpIGlzRGlzYWJsZWQ6IGJvb2xlYW47XG4gIEBJbnB1dCgnbmdNb2RlbCcpIG1vZGVsOiBhbnk7XG5cbiAgLyoqXG4gICAqIE9wdGlvbnMgb2JqZWN0IGZvciB0aGlzIGBuZ01vZGVsYCBpbnN0YW5jZS4gWW91IGNhbiBjb25maWd1cmUgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICAgKlxuICAgKiAqKm5hbWUqKjogQW4gYWx0ZXJuYXRpdmUgdG8gc2V0dGluZyB0aGUgbmFtZSBhdHRyaWJ1dGUgb24gdGhlIGZvcm0gY29udHJvbCBlbGVtZW50LlxuICAgKiBTb21ldGltZXMsIGVzcGVjaWFsbHkgd2l0aCBjdXN0b20gZm9ybSBjb21wb25lbnRzLCB0aGUgbmFtZSBhdHRyaWJ1dGUgbWlnaHQgYmUgdXNlZFxuICAgKiBhcyBhbiBgQElucHV0YCBwcm9wZXJ0eSBmb3IgYSBkaWZmZXJlbnQgcHVycG9zZS4gSW4gY2FzZXMgbGlrZSB0aGVzZSwgeW91IGNhbiBjb25maWd1cmVcbiAgICogdGhlIGBuZ01vZGVsYCBuYW1lIHRocm91Z2ggdGhpcyBvcHRpb24uXG4gICAqXG4gICAqIGBgYGh0bWxcbiAgICogPGZvcm0+XG4gICAqICAgPG15LXBlcnNvbi1jb250cm9sIG5hbWU9XCJOYW5jeVwiIG5nTW9kZWwgW25nTW9kZWxPcHRpb25zXT1cIntuYW1lOiAndXNlcid9XCI+XG4gICAqICAgPC9teS1wZXJzb24tY29udHJvbD5cbiAgICogPC9mb3JtPlxuICAgKiA8IS0tIGZvcm0gdmFsdWU6IHt1c2VyOiAnJ30gLS0+XG4gICAqIGBgYFxuICAgKlxuICAgKiAqKnN0YW5kYWxvbmUqKjogRGVmYXVsdHMgdG8gZmFsc2UuIElmIHRoaXMgaXMgc2V0IHRvIHRydWUsIHRoZSBgbmdNb2RlbGAgd2lsbCBub3RcbiAgICogcmVnaXN0ZXIgaXRzZWxmIHdpdGggaXRzIHBhcmVudCBmb3JtLCBhbmQgd2lsbCBhY3QgYXMgaWYgaXQncyBub3QgaW4gdGhlIGZvcm0uIFRoaXNcbiAgICogY2FuIGJlIGhhbmR5IGlmIHlvdSBoYXZlIGZvcm0gbWV0YS1jb250cm9scywgYS5rLmEuIGZvcm0gZWxlbWVudHMgbmVzdGVkIGluXG4gICAqIHRoZSBgPGZvcm0+YCB0YWcgdGhhdCBjb250cm9sIHRoZSBkaXNwbGF5IG9mIHRoZSBmb3JtLCBidXQgZG9uJ3QgY29udGFpbiBmb3JtIGRhdGEuXG4gICAqXG4gICAqIGBgYGh0bWxcbiAgICogPGZvcm0+XG4gICAqICAgPGlucHV0IG5hbWU9XCJsb2dpblwiIG5nTW9kZWwgcGxhY2Vob2xkZXI9XCJMb2dpblwiPlxuICAgKiAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuZ01vZGVsIFtuZ01vZGVsT3B0aW9uc109XCJ7c3RhbmRhbG9uZTogdHJ1ZX1cIj4gU2hvdyBtb3JlIG9wdGlvbnM/XG4gICAqIDwvZm9ybT5cbiAgICogPCEtLSBmb3JtIHZhbHVlOiB7bG9naW46ICcnfSAtLT5cbiAgICogYGBgXG4gICAqXG4gICAqICoqdXBkYXRlT24qKjogRGVmYXVsdHMgdG8gYCdjaGFuZ2UnYC4gRGVmaW5lcyB0aGUgZXZlbnQgdXBvbiB3aGljaCB0aGUgZm9ybSBjb250cm9sXG4gICAqIHZhbHVlIGFuZCB2YWxpZGl0eSB3aWxsIHVwZGF0ZS4gQWxzbyBhY2NlcHRzIGAnYmx1cidgIGFuZCBgJ3N1Ym1pdCdgLlxuICAgKlxuICAgKiBgYGBodG1sXG4gICAqIDxpbnB1dCBbKG5nTW9kZWwpXT1cImZpcnN0TmFtZVwiIFtuZ01vZGVsT3B0aW9uc109XCJ7dXBkYXRlT246ICdibHVyJ31cIj5cbiAgICogYGBgXG4gICAqXG4gICAqL1xuICBASW5wdXQoJ25nTW9kZWxPcHRpb25zJykgb3B0aW9uczoge25hbWU/OiBzdHJpbmcsIHN0YW5kYWxvbmU/OiBib29sZWFuLCB1cGRhdGVPbj86IEZvcm1Ib29rc307XG5cbiAgQE91dHB1dCgnbmdNb2RlbENoYW5nZScpIHVwZGF0ZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBASG9zdCgpIHBhcmVudDogQ29udHJvbENvbnRhaW5lcixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHZhbGlkYXRvcnM6IEFycmF5PFZhbGlkYXRvcnxWYWxpZGF0b3JGbj4sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19BU1lOQ19WQUxJREFUT1JTKSBhc3luY1ZhbGlkYXRvcnM6IEFycmF5PEFzeW5jVmFsaWRhdG9yfEFzeW5jVmFsaWRhdG9yRm4+LFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMVUVfQUNDRVNTT1IpXG4gICAgICAgICAgICAgIHZhbHVlQWNjZXNzb3JzOiBDb250cm9sVmFsdWVBY2Nlc3NvcltdKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmF3VmFsaWRhdG9ycyA9IHZhbGlkYXRvcnMgfHwgW107XG4gICAgICAgICAgICAgICAgdGhpcy5fcmF3QXN5bmNWYWxpZGF0b3JzID0gYXN5bmNWYWxpZGF0b3JzIHx8IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVBY2Nlc3NvciA9IHNlbGVjdFZhbHVlQWNjZXNzb3IodGhpcywgdmFsdWVBY2Nlc3NvcnMpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NoZWNrRm9yRXJyb3JzKCk7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9yZWdpc3RlcmVkKSB0aGlzLl9zZXRVcENvbnRyb2woKTtcbiAgICAgICAgICAgICAgICBpZiAoJ2lzRGlzYWJsZWQnIGluIGNoYW5nZXMpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURpc2FibGVkKGNoYW5nZXMpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpc1Byb3BlcnR5VXBkYXRlZChjaGFuZ2VzLCB0aGlzLnZpZXdNb2RlbCkpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVZhbHVlKHRoaXMubW9kZWwpO1xuICAgICAgICAgICAgICAgICAgdGhpcy52aWV3TW9kZWwgPSB0aGlzLm1vZGVsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIG5nT25EZXN0cm95KCk6IHZvaWQgeyB0aGlzLmZvcm1EaXJlY3RpdmUgJiYgdGhpcy5mb3JtRGlyZWN0aXZlLnJlbW92ZUNvbnRyb2wodGhpcyk7IH1cblxuICAgICAgICAgICAgICBnZXQgcGF0aCgpOiBzdHJpbmdbXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudCA/IGNvbnRyb2xQYXRoKHRoaXMubmFtZSwgdGhpcy5fcGFyZW50KSA6IFt0aGlzLm5hbWVdO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgZ2V0IGZvcm1EaXJlY3RpdmUoKTogYW55IHsgcmV0dXJuIHRoaXMuX3BhcmVudCA/IHRoaXMuX3BhcmVudC5mb3JtRGlyZWN0aXZlIDogbnVsbDsgfVxuXG4gICAgICAgICAgICAgIGdldCB2YWxpZGF0b3IoKTogVmFsaWRhdG9yRm58bnVsbCB7IHJldHVybiBjb21wb3NlVmFsaWRhdG9ycyh0aGlzLl9yYXdWYWxpZGF0b3JzKTsgfVxuXG4gICAgICAgICAgICAgIGdldCBhc3luY1ZhbGlkYXRvcigpOiBBc3luY1ZhbGlkYXRvckZufG51bGwge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHRoaXMuX3Jhd0FzeW5jVmFsaWRhdG9ycyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB2aWV3VG9Nb2RlbFVwZGF0ZShuZXdWYWx1ZTogYW55KTogdm9pZCB7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3TW9kZWwgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZS5lbWl0KG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHByaXZhdGUgX3NldFVwQ29udHJvbCgpOiB2b2lkIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRVcGRhdGVTdHJhdGVneSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzU3RhbmRhbG9uZSgpID8gdGhpcy5fc2V0VXBTdGFuZGFsb25lKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtRGlyZWN0aXZlLmFkZENvbnRyb2wodGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVnaXN0ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBwcml2YXRlIF9zZXRVcGRhdGVTdHJhdGVneSgpOiB2b2lkIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy51cGRhdGVPbiAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLmNvbnRyb2wuX3VwZGF0ZU9uID0gdGhpcy5vcHRpb25zLnVwZGF0ZU9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHByaXZhdGUgX2lzU3RhbmRhbG9uZSgpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIXRoaXMuX3BhcmVudCB8fCAhISh0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLnN0YW5kYWxvbmUpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcHJpdmF0ZSBfc2V0VXBTdGFuZGFsb25lKCk6IHZvaWQge1xuICAgICAgICAgICAgICAgIHNldFVwQ29udHJvbCh0aGlzLmNvbnRyb2wsIHRoaXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udHJvbC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBwcml2YXRlIF9jaGVja0ZvckVycm9ycygpOiB2b2lkIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2lzU3RhbmRhbG9uZSgpKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLl9jaGVja1BhcmVudFR5cGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fY2hlY2tOYW1lKCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBwcml2YXRlIF9jaGVja1BhcmVudFR5cGUoKTogdm9pZCB7XG4gICAgICAgICAgICAgICAgaWYgKCEodGhpcy5fcGFyZW50IGluc3RhbmNlb2YgTmdNb2RlbEdyb3VwKSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wYXJlbnQgaW5zdGFuY2VvZiBBYnN0cmFjdEZvcm1Hcm91cERpcmVjdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgVGVtcGxhdGVEcml2ZW5FcnJvcnMuZm9ybUdyb3VwTmFtZUV4Y2VwdGlvbigpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICEodGhpcy5fcGFyZW50IGluc3RhbmNlb2YgTmdNb2RlbEdyb3VwKSAmJiAhKHRoaXMuX3BhcmVudCBpbnN0YW5jZW9mIE5nRm9ybSkpIHtcbiAgICAgICAgICAgICAgICAgIFRlbXBsYXRlRHJpdmVuRXJyb3JzLm1vZGVsUGFyZW50RXhjZXB0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcHJpdmF0ZSBfY2hlY2tOYW1lKCk6IHZvaWQge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLm5hbWUpIHRoaXMubmFtZSA9IHRoaXMub3B0aW9ucy5uYW1lO1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0YW5kYWxvbmUoKSAmJiAhdGhpcy5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICBUZW1wbGF0ZURyaXZlbkVycm9ycy5taXNzaW5nTmFtZUV4Y2VwdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHByaXZhdGUgX3VwZGF0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlZFByb21pc2UudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4geyB0aGlzLmNvbnRyb2wuc2V0VmFsdWUodmFsdWUsIHtlbWl0Vmlld1RvTW9kZWxDaGFuZ2U6IGZhbHNlfSk7IH0pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdXBkYXRlRGlzYWJsZWQoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpc2FibGVkVmFsdWUgPSBjaGFuZ2VzWydpc0Rpc2FibGVkJ10uY3VycmVudFZhbHVlO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgaXNEaXNhYmxlZCA9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkVmFsdWUgPT09ICcnIHx8IChkaXNhYmxlZFZhbHVlICYmIGRpc2FibGVkVmFsdWUgIT09ICdmYWxzZScpO1xuXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGlzRGlzYWJsZWQgJiYgIXRoaXMuY29udHJvbC5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRyb2wuZGlzYWJsZSgpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghaXNEaXNhYmxlZCAmJiB0aGlzLmNvbnRyb2wuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250cm9sLmVuYWJsZSgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG59XG4iXX0=