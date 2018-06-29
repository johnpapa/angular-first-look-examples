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
import { Directive, EventEmitter, Inject, Input, Optional, Output, Self, forwardRef } from '@angular/core';
import { FormGroup } from '../../model';
import { NG_ASYNC_VALIDATORS, NG_VALIDATORS, Validators } from '../../validators';
import { ControlContainer } from '../control_container';
import { ReactiveErrors } from '../reactive_errors';
import { cleanUpControl, composeAsyncValidators, composeValidators, removeDir, setUpControl, setUpFormContainer, syncPendingControls } from '../shared';
export const /** @type {?} */ formDirectiveProvider = {
    provide: ControlContainer,
    useExisting: forwardRef(() => FormGroupDirective)
};
/**
 * \@description
 *
 * Binds an existing `FormGroup` to a DOM element.
 *
 * This directive accepts an existing `FormGroup` instance. It will then use this
 * `FormGroup` instance to match any child `FormControl`, `FormGroup`,
 * and `FormArray` instances to child `FormControlName`, `FormGroupName`,
 * and `FormArrayName` directives.
 *
 * **Set value**: You can set the form's initial value when instantiating the
 * `FormGroup`, or you can set it programmatically later using the `FormGroup`'s
 * {\@link AbstractControl#setValue setValue} or {\@link AbstractControl#patchValue patchValue}
 * methods.
 *
 * **Listen to value**: If you want to listen to changes in the value of the form, you can subscribe
 * to the `FormGroup`'s {\@link AbstractControl#valueChanges valueChanges} event.  You can also
 * listen to its {\@link AbstractControl#statusChanges statusChanges} event to be notified when the
 * validation status is re-calculated.
 *
 * Furthermore, you can listen to the directive's `ngSubmit` event to be notified when the user has
 * triggered a form submission. The `ngSubmit` event will be emitted with the original form
 * submission event.
 *
 * ### Example
 *
 * In this example, we create form controls for first name and last name.
 *
 * {\@example forms/ts/simpleFormGroup/simple_form_group_example.ts region='Component'}
 *
 * **npm package**: `\@angular/forms`
 *
 * **NgModule**: `ReactiveFormsModule`
 *
 *
 */
export class FormGroupDirective extends ControlContainer {
    /**
     * @param {?} _validators
     * @param {?} _asyncValidators
     */
    constructor(_validators, _asyncValidators) {
        super();
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        this.submitted = false;
        this.directives = [];
        this.form = /** @type {?} */ ((null));
        this.ngSubmit = new EventEmitter();
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        this._checkFormPresent();
        if (changes.hasOwnProperty('form')) {
            this._updateValidators();
            this._updateDomValue();
            this._updateRegistrations();
        }
    }
    /**
     * @return {?}
     */
    get formDirective() { return this; }
    /**
     * @return {?}
     */
    get control() { return this.form; }
    /**
     * @return {?}
     */
    get path() { return []; }
    /**
     * @param {?} dir
     * @return {?}
     */
    addControl(dir) {
        const /** @type {?} */ ctrl = this.form.get(dir.path);
        setUpControl(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
        this.directives.push(dir);
        return ctrl;
    }
    /**
     * @param {?} dir
     * @return {?}
     */
    getControl(dir) { return /** @type {?} */ (this.form.get(dir.path)); }
    /**
     * @param {?} dir
     * @return {?}
     */
    removeControl(dir) { removeDir(this.directives, dir); }
    /**
     * @param {?} dir
     * @return {?}
     */
    addFormGroup(dir) {
        const /** @type {?} */ ctrl = this.form.get(dir.path);
        setUpFormContainer(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
    }
    /**
     * @param {?} dir
     * @return {?}
     */
    removeFormGroup(dir) { }
    /**
     * @param {?} dir
     * @return {?}
     */
    getFormGroup(dir) { return /** @type {?} */ (this.form.get(dir.path)); }
    /**
     * @param {?} dir
     * @return {?}
     */
    addFormArray(dir) {
        const /** @type {?} */ ctrl = this.form.get(dir.path);
        setUpFormContainer(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
    }
    /**
     * @param {?} dir
     * @return {?}
     */
    removeFormArray(dir) { }
    /**
     * @param {?} dir
     * @return {?}
     */
    getFormArray(dir) { return /** @type {?} */ (this.form.get(dir.path)); }
    /**
     * @param {?} dir
     * @param {?} value
     * @return {?}
     */
    updateModel(dir, value) {
        const /** @type {?} */ ctrl = /** @type {?} */ (this.form.get(dir.path));
        ctrl.setValue(value);
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    onSubmit($event) {
        (/** @type {?} */ (this)).submitted = true;
        syncPendingControls(this.form, this.directives);
        this.ngSubmit.emit($event);
        return false;
    }
    /**
     * @return {?}
     */
    onReset() { this.resetForm(); }
    /**
     * @param {?=} value
     * @return {?}
     */
    resetForm(value = undefined) {
        this.form.reset(value);
        (/** @type {?} */ (this)).submitted = false;
    }
    /**
     * \@internal
     * @return {?}
     */
    _updateDomValue() {
        this.directives.forEach(dir => {
            const /** @type {?} */ newCtrl = this.form.get(dir.path);
            if (dir.control !== newCtrl) {
                cleanUpControl(dir.control, dir);
                if (newCtrl)
                    setUpControl(newCtrl, dir);
                (/** @type {?} */ (dir)).control = newCtrl;
            }
        });
        this.form._updateTreeValidity({ emitEvent: false });
    }
    /**
     * @return {?}
     */
    _updateRegistrations() {
        this.form._registerOnCollectionChange(() => this._updateDomValue());
        if (this._oldForm)
            this._oldForm._registerOnCollectionChange(() => { });
        this._oldForm = this.form;
    }
    /**
     * @return {?}
     */
    _updateValidators() {
        const /** @type {?} */ sync = composeValidators(this._validators);
        this.form.validator = Validators.compose([/** @type {?} */ ((this.form.validator)), /** @type {?} */ ((sync))]);
        const /** @type {?} */ async = composeAsyncValidators(this._asyncValidators);
        this.form.asyncValidator = Validators.composeAsync([/** @type {?} */ ((this.form.asyncValidator)), /** @type {?} */ ((async))]);
    }
    /**
     * @return {?}
     */
    _checkFormPresent() {
        if (!this.form) {
            ReactiveErrors.missingFormException();
        }
    }
}
FormGroupDirective.decorators = [
    { type: Directive, args: [{
                selector: '[formGroup]',
                providers: [formDirectiveProvider],
                host: { '(submit)': 'onSubmit($event)', '(reset)': 'onReset()' },
                exportAs: 'ngForm'
            },] }
];
/** @nocollapse */
FormGroupDirective.ctorParameters = () => [
    { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALIDATORS,] }] },
    { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_ASYNC_VALIDATORS,] }] }
];
FormGroupDirective.propDecorators = {
    form: [{ type: Input, args: ['formGroup',] }],
    ngSubmit: [{ type: Output }]
};
function FormGroupDirective_tsickle_Closure_declarations() {
    /** @type {?} */
    FormGroupDirective.prototype.submitted;
    /** @type {?} */
    FormGroupDirective.prototype._oldForm;
    /** @type {?} */
    FormGroupDirective.prototype.directives;
    /** @type {?} */
    FormGroupDirective.prototype.form;
    /** @type {?} */
    FormGroupDirective.prototype.ngSubmit;
    /** @type {?} */
    FormGroupDirective.prototype._validators;
    /** @type {?} */
    FormGroupDirective.prototype._asyncValidators;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9ncm91cF9kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9mb3Jtcy9zcmMvZGlyZWN0aXZlcy9yZWFjdGl2ZV9kaXJlY3RpdmVzL2Zvcm1fZ3JvdXBfZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBYSxRQUFRLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBaUIsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ25JLE9BQU8sRUFBeUIsU0FBUyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzlELE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDaEYsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFdEQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ2xELE9BQU8sRUFBQyxjQUFjLEVBQUUsc0JBQXNCLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUt0SixNQUFNLENBQUMsdUJBQU0scUJBQXFCLEdBQVE7SUFDeEMsT0FBTyxFQUFFLGdCQUFnQjtJQUN6QixXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDO0NBQ2xELENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0Q0YsTUFBTSx5QkFBMEIsU0FBUSxnQkFBZ0I7Ozs7O0lBVXRELFlBQ3VELFdBQWtCLEVBQ1osZ0JBQXVCO1FBQ2xGLEtBQUssRUFBRSxDQUFDO1FBRjZDLGdCQUFXLEdBQVgsV0FBVyxDQUFPO1FBQ1oscUJB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QUFNLFNBQUMsYUFBYTt3Q0FDeEMsUUFBUSxZQUFJLElBQUksWUFBSSxNQUFNLFNBQUMsbUJBQW1COzs7bUJBTGxELEtBQUssU0FBQyxXQUFXO3VCQUNqQixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRXZlbnRFbWl0dGVyLCBJbmplY3QsIElucHV0LCBPbkNoYW5nZXMsIE9wdGlvbmFsLCBPdXRwdXQsIFNlbGYsIFNpbXBsZUNoYW5nZXMsIGZvcndhcmRSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtGb3JtQXJyYXksIEZvcm1Db250cm9sLCBGb3JtR3JvdXB9IGZyb20gJy4uLy4uL21vZGVsJztcbmltcG9ydCB7TkdfQVNZTkNfVkFMSURBVE9SUywgTkdfVkFMSURBVE9SUywgVmFsaWRhdG9yc30gZnJvbSAnLi4vLi4vdmFsaWRhdG9ycyc7XG5pbXBvcnQge0NvbnRyb2xDb250YWluZXJ9IGZyb20gJy4uL2NvbnRyb2xfY29udGFpbmVyJztcbmltcG9ydCB7Rm9ybX0gZnJvbSAnLi4vZm9ybV9pbnRlcmZhY2UnO1xuaW1wb3J0IHtSZWFjdGl2ZUVycm9yc30gZnJvbSAnLi4vcmVhY3RpdmVfZXJyb3JzJztcbmltcG9ydCB7Y2xlYW5VcENvbnRyb2wsIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnMsIGNvbXBvc2VWYWxpZGF0b3JzLCByZW1vdmVEaXIsIHNldFVwQ29udHJvbCwgc2V0VXBGb3JtQ29udGFpbmVyLCBzeW5jUGVuZGluZ0NvbnRyb2xzfSBmcm9tICcuLi9zaGFyZWQnO1xuXG5pbXBvcnQge0Zvcm1Db250cm9sTmFtZX0gZnJvbSAnLi9mb3JtX2NvbnRyb2xfbmFtZSc7XG5pbXBvcnQge0Zvcm1BcnJheU5hbWUsIEZvcm1Hcm91cE5hbWV9IGZyb20gJy4vZm9ybV9ncm91cF9uYW1lJztcblxuZXhwb3J0IGNvbnN0IGZvcm1EaXJlY3RpdmVQcm92aWRlcjogYW55ID0ge1xuICBwcm92aWRlOiBDb250cm9sQ29udGFpbmVyLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBGb3JtR3JvdXBEaXJlY3RpdmUpXG59O1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEJpbmRzIGFuIGV4aXN0aW5nIGBGb3JtR3JvdXBgIHRvIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgYWNjZXB0cyBhbiBleGlzdGluZyBgRm9ybUdyb3VwYCBpbnN0YW5jZS4gSXQgd2lsbCB0aGVuIHVzZSB0aGlzXG4gKiBgRm9ybUdyb3VwYCBpbnN0YW5jZSB0byBtYXRjaCBhbnkgY2hpbGQgYEZvcm1Db250cm9sYCwgYEZvcm1Hcm91cGAsXG4gKiBhbmQgYEZvcm1BcnJheWAgaW5zdGFuY2VzIHRvIGNoaWxkIGBGb3JtQ29udHJvbE5hbWVgLCBgRm9ybUdyb3VwTmFtZWAsXG4gKiBhbmQgYEZvcm1BcnJheU5hbWVgIGRpcmVjdGl2ZXMuXG4gKlxuICogKipTZXQgdmFsdWUqKjogWW91IGNhbiBzZXQgdGhlIGZvcm0ncyBpbml0aWFsIHZhbHVlIHdoZW4gaW5zdGFudGlhdGluZyB0aGVcbiAqIGBGb3JtR3JvdXBgLCBvciB5b3UgY2FuIHNldCBpdCBwcm9ncmFtbWF0aWNhbGx5IGxhdGVyIHVzaW5nIHRoZSBgRm9ybUdyb3VwYCdzXG4gKiB7QGxpbmsgQWJzdHJhY3RDb250cm9sI3NldFZhbHVlIHNldFZhbHVlfSBvciB7QGxpbmsgQWJzdHJhY3RDb250cm9sI3BhdGNoVmFsdWUgcGF0Y2hWYWx1ZX1cbiAqIG1ldGhvZHMuXG4gKlxuICogKipMaXN0ZW4gdG8gdmFsdWUqKjogSWYgeW91IHdhbnQgdG8gbGlzdGVuIHRvIGNoYW5nZXMgaW4gdGhlIHZhbHVlIG9mIHRoZSBmb3JtLCB5b3UgY2FuIHN1YnNjcmliZVxuICogdG8gdGhlIGBGb3JtR3JvdXBgJ3Mge0BsaW5rIEFic3RyYWN0Q29udHJvbCN2YWx1ZUNoYW5nZXMgdmFsdWVDaGFuZ2VzfSBldmVudC4gIFlvdSBjYW4gYWxzb1xuICogbGlzdGVuIHRvIGl0cyB7QGxpbmsgQWJzdHJhY3RDb250cm9sI3N0YXR1c0NoYW5nZXMgc3RhdHVzQ2hhbmdlc30gZXZlbnQgdG8gYmUgbm90aWZpZWQgd2hlbiB0aGVcbiAqIHZhbGlkYXRpb24gc3RhdHVzIGlzIHJlLWNhbGN1bGF0ZWQuXG4gKlxuICogRnVydGhlcm1vcmUsIHlvdSBjYW4gbGlzdGVuIHRvIHRoZSBkaXJlY3RpdmUncyBgbmdTdWJtaXRgIGV2ZW50IHRvIGJlIG5vdGlmaWVkIHdoZW4gdGhlIHVzZXIgaGFzXG4gKiB0cmlnZ2VyZWQgYSBmb3JtIHN1Ym1pc3Npb24uIFRoZSBgbmdTdWJtaXRgIGV2ZW50IHdpbGwgYmUgZW1pdHRlZCB3aXRoIHRoZSBvcmlnaW5hbCBmb3JtXG4gKiBzdWJtaXNzaW9uIGV2ZW50LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogSW4gdGhpcyBleGFtcGxlLCB3ZSBjcmVhdGUgZm9ybSBjb250cm9scyBmb3IgZmlyc3QgbmFtZSBhbmQgbGFzdCBuYW1lLlxuICpcbiAqIHtAZXhhbXBsZSBmb3Jtcy90cy9zaW1wbGVGb3JtR3JvdXAvc2ltcGxlX2Zvcm1fZ3JvdXBfZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKlxuICogKipucG0gcGFja2FnZSoqOiBgQGFuZ3VsYXIvZm9ybXNgXG4gKlxuICogKipOZ01vZHVsZSoqOiBgUmVhY3RpdmVGb3Jtc01vZHVsZWBcbiAqXG4gKlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbZm9ybUdyb3VwXScsXG4gIHByb3ZpZGVyczogW2Zvcm1EaXJlY3RpdmVQcm92aWRlcl0sXG4gIGhvc3Q6IHsnKHN1Ym1pdCknOiAnb25TdWJtaXQoJGV2ZW50KScsICcocmVzZXQpJzogJ29uUmVzZXQoKSd9LFxuICBleHBvcnRBczogJ25nRm9ybSdcbn0pXG5leHBvcnQgY2xhc3MgRm9ybUdyb3VwRGlyZWN0aXZlIGV4dGVuZHMgQ29udHJvbENvbnRhaW5lciBpbXBsZW1lbnRzIEZvcm0sXG4gICAgT25DaGFuZ2VzIHtcbiAgcHVibGljIHJlYWRvbmx5IHN1Ym1pdHRlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX29sZEZvcm06IEZvcm1Hcm91cDtcbiAgZGlyZWN0aXZlczogRm9ybUNvbnRyb2xOYW1lW10gPSBbXTtcblxuICBASW5wdXQoJ2Zvcm1Hcm91cCcpIGZvcm06IEZvcm1Hcm91cCA9IG51bGwgITtcbiAgQE91dHB1dCgpIG5nU3VibWl0ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHByaXZhdGUgX3ZhbGlkYXRvcnM6IGFueVtdLFxuICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX0FTWU5DX1ZBTElEQVRPUlMpIHByaXZhdGUgX2FzeW5jVmFsaWRhdG9yczogYW55W10pIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIHRoaXMuX2NoZWNrRm9ybVByZXNlbnQoKTtcbiAgICBpZiAoY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eSgnZm9ybScpKSB7XG4gICAgICB0aGlzLl91cGRhdGVWYWxpZGF0b3JzKCk7XG4gICAgICB0aGlzLl91cGRhdGVEb21WYWx1ZSgpO1xuICAgICAgdGhpcy5fdXBkYXRlUmVnaXN0cmF0aW9ucygpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBmb3JtRGlyZWN0aXZlKCk6IEZvcm0geyByZXR1cm4gdGhpczsgfVxuXG4gIGdldCBjb250cm9sKCk6IEZvcm1Hcm91cCB7IHJldHVybiB0aGlzLmZvcm07IH1cblxuICBnZXQgcGF0aCgpOiBzdHJpbmdbXSB7IHJldHVybiBbXTsgfVxuXG4gIGFkZENvbnRyb2woZGlyOiBGb3JtQ29udHJvbE5hbWUpOiBGb3JtQ29udHJvbCB7XG4gICAgY29uc3QgY3RybDogYW55ID0gdGhpcy5mb3JtLmdldChkaXIucGF0aCk7XG4gICAgc2V0VXBDb250cm9sKGN0cmwsIGRpcik7XG4gICAgY3RybC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgdGhpcy5kaXJlY3RpdmVzLnB1c2goZGlyKTtcbiAgICByZXR1cm4gY3RybDtcbiAgfVxuXG4gIGdldENvbnRyb2woZGlyOiBGb3JtQ29udHJvbE5hbWUpOiBGb3JtQ29udHJvbCB7IHJldHVybiA8Rm9ybUNvbnRyb2w+dGhpcy5mb3JtLmdldChkaXIucGF0aCk7IH1cblxuICByZW1vdmVDb250cm9sKGRpcjogRm9ybUNvbnRyb2xOYW1lKTogdm9pZCB7IHJlbW92ZURpcjxGb3JtQ29udHJvbE5hbWU+KHRoaXMuZGlyZWN0aXZlcywgZGlyKTsgfVxuXG4gIGFkZEZvcm1Hcm91cChkaXI6IEZvcm1Hcm91cE5hbWUpOiB2b2lkIHtcbiAgICBjb25zdCBjdHJsOiBhbnkgPSB0aGlzLmZvcm0uZ2V0KGRpci5wYXRoKTtcbiAgICBzZXRVcEZvcm1Db250YWluZXIoY3RybCwgZGlyKTtcbiAgICBjdHJsLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgfVxuXG4gIHJlbW92ZUZvcm1Hcm91cChkaXI6IEZvcm1Hcm91cE5hbWUpOiB2b2lkIHt9XG5cbiAgZ2V0Rm9ybUdyb3VwKGRpcjogRm9ybUdyb3VwTmFtZSk6IEZvcm1Hcm91cCB7IHJldHVybiA8Rm9ybUdyb3VwPnRoaXMuZm9ybS5nZXQoZGlyLnBhdGgpOyB9XG5cbiAgYWRkRm9ybUFycmF5KGRpcjogRm9ybUFycmF5TmFtZSk6IHZvaWQge1xuICAgIGNvbnN0IGN0cmw6IGFueSA9IHRoaXMuZm9ybS5nZXQoZGlyLnBhdGgpO1xuICAgIHNldFVwRm9ybUNvbnRhaW5lcihjdHJsLCBkaXIpO1xuICAgIGN0cmwudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICB9XG5cbiAgcmVtb3ZlRm9ybUFycmF5KGRpcjogRm9ybUFycmF5TmFtZSk6IHZvaWQge31cblxuICBnZXRGb3JtQXJyYXkoZGlyOiBGb3JtQXJyYXlOYW1lKTogRm9ybUFycmF5IHsgcmV0dXJuIDxGb3JtQXJyYXk+dGhpcy5mb3JtLmdldChkaXIucGF0aCk7IH1cblxuICB1cGRhdGVNb2RlbChkaXI6IEZvcm1Db250cm9sTmFtZSwgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGN0cmzCoCA9IDxGb3JtQ29udHJvbD50aGlzLmZvcm0uZ2V0KGRpci5wYXRoKTtcbiAgICBjdHJsLnNldFZhbHVlKHZhbHVlKTtcbiAgfVxuXG4gIG9uU3VibWl0KCRldmVudDogRXZlbnQpOiBib29sZWFuIHtcbiAgICAodGhpcyBhc3tzdWJtaXR0ZWQ6IGJvb2xlYW59KS5zdWJtaXR0ZWQgPSB0cnVlO1xuICAgIHN5bmNQZW5kaW5nQ29udHJvbHModGhpcy5mb3JtLCB0aGlzLmRpcmVjdGl2ZXMpO1xuICAgIHRoaXMubmdTdWJtaXQuZW1pdCgkZXZlbnQpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG9uUmVzZXQoKTogdm9pZCB7IHRoaXMucmVzZXRGb3JtKCk7IH1cblxuICByZXNldEZvcm0odmFsdWU6IGFueSA9IHVuZGVmaW5lZCk6IHZvaWQge1xuICAgIHRoaXMuZm9ybS5yZXNldCh2YWx1ZSk7XG4gICAgKHRoaXMgYXN7c3VibWl0dGVkOiBib29sZWFufSkuc3VibWl0dGVkID0gZmFsc2U7XG4gIH1cblxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VwZGF0ZURvbVZhbHVlKCkge1xuICAgIHRoaXMuZGlyZWN0aXZlcy5mb3JFYWNoKGRpciA9PiB7XG4gICAgICBjb25zdCBuZXdDdHJsOiBhbnkgPSB0aGlzLmZvcm0uZ2V0KGRpci5wYXRoKTtcbiAgICAgIGlmIChkaXIuY29udHJvbCAhPT0gbmV3Q3RybCkge1xuICAgICAgICBjbGVhblVwQ29udHJvbChkaXIuY29udHJvbCwgZGlyKTtcbiAgICAgICAgaWYgKG5ld0N0cmwpIHNldFVwQ29udHJvbChuZXdDdHJsLCBkaXIpO1xuICAgICAgICAoZGlyIGFze2NvbnRyb2w6IEZvcm1Db250cm9sfSkuY29udHJvbCA9IG5ld0N0cmw7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmZvcm0uX3VwZGF0ZVRyZWVWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlUmVnaXN0cmF0aW9ucygpIHtcbiAgICB0aGlzLmZvcm0uX3JlZ2lzdGVyT25Db2xsZWN0aW9uQ2hhbmdlKCgpID0+IHRoaXMuX3VwZGF0ZURvbVZhbHVlKCkpO1xuICAgIGlmICh0aGlzLl9vbGRGb3JtKSB0aGlzLl9vbGRGb3JtLl9yZWdpc3Rlck9uQ29sbGVjdGlvbkNoYW5nZSgoKSA9PiB7fSk7XG4gICAgdGhpcy5fb2xkRm9ybSA9IHRoaXMuZm9ybTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVZhbGlkYXRvcnMoKSB7XG4gICAgY29uc3Qgc3luYyA9IGNvbXBvc2VWYWxpZGF0b3JzKHRoaXMuX3ZhbGlkYXRvcnMpO1xuICAgIHRoaXMuZm9ybS52YWxpZGF0b3IgPSBWYWxpZGF0b3JzLmNvbXBvc2UoW3RoaXMuZm9ybS52YWxpZGF0b3IgISwgc3luYyAhXSk7XG5cbiAgICBjb25zdCBhc3luYyA9IGNvbXBvc2VBc3luY1ZhbGlkYXRvcnModGhpcy5fYXN5bmNWYWxpZGF0b3JzKTtcbiAgICB0aGlzLmZvcm0uYXN5bmNWYWxpZGF0b3IgPSBWYWxpZGF0b3JzLmNvbXBvc2VBc3luYyhbdGhpcy5mb3JtLmFzeW5jVmFsaWRhdG9yICEsIGFzeW5jICFdKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NoZWNrRm9ybVByZXNlbnQoKSB7XG4gICAgaWYgKCF0aGlzLmZvcm0pIHtcbiAgICAgIFJlYWN0aXZlRXJyb3JzLm1pc3NpbmdGb3JtRXhjZXB0aW9uKCk7XG4gICAgfVxuICB9XG59XG4iXX0=