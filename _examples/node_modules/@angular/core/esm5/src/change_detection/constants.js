/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Describes within the change detector which strategy will be used the next time change
 * detection is triggered.
 *
 */
export var ChangeDetectionStrategy;
(function (ChangeDetectionStrategy) {
    /**
     * `OnPush` means that the change detector's mode will be initially set to `CheckOnce`.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["OnPush"] = 0] = "OnPush";
    /**
     * `Default` means that the change detector's mode will be initially set to `CheckAlways`.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["Default"] = 1] = "Default";
})(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
/**
 * Describes the status of the detector.
 */
export var ChangeDetectorStatus;
(function (ChangeDetectorStatus) {
    /**
     * `CheckOnce` means that after calling detectChanges the mode of the change detector
     * will become `Checked`.
     */
    ChangeDetectorStatus[ChangeDetectorStatus["CheckOnce"] = 0] = "CheckOnce";
    /**
     * `Checked` means that the change detector should be skipped until its mode changes to
     * `CheckOnce`.
     */
    ChangeDetectorStatus[ChangeDetectorStatus["Checked"] = 1] = "Checked";
    /**
     * `CheckAlways` means that after calling detectChanges the mode of the change detector
     * will remain `CheckAlways`.
     */
    ChangeDetectorStatus[ChangeDetectorStatus["CheckAlways"] = 2] = "CheckAlways";
    /**
     * `Detached` means that the change detector sub tree is not a part of the main tree and
     * should be skipped.
     */
    ChangeDetectorStatus[ChangeDetectorStatus["Detached"] = 3] = "Detached";
    /**
     * `Errored` means that the change detector encountered an error checking a binding
     * or calling a directive lifecycle method and is now in an inconsistent state. Change
     * detectors in this state will no longer detect changes.
     */
    ChangeDetectorStatus[ChangeDetectorStatus["Errored"] = 4] = "Errored";
    /**
     * `Destroyed` means that the change detector is destroyed.
     */
    ChangeDetectorStatus[ChangeDetectorStatus["Destroyed"] = 5] = "Destroyed";
})(ChangeDetectorStatus || (ChangeDetectorStatus = {}));
export function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
    return changeDetectionStrategy == null ||
        changeDetectionStrategy === ChangeDetectionStrategy.Default;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBR0g7Ozs7R0FJRztBQUNILE1BQU0sQ0FBTixJQUFZLHVCQVVYO0FBVkQsV0FBWSx1QkFBdUI7SUFDakM7O09BRUc7SUFDSCx5RUFBVSxDQUFBO0lBRVY7O09BRUc7SUFDSCwyRUFBVyxDQUFBO0FBQ2IsQ0FBQyxFQVZXLHVCQUF1QixLQUF2Qix1QkFBdUIsUUFVbEM7QUFFRDs7R0FFRztBQUNILE1BQU0sQ0FBTixJQUFZLG9CQW9DWDtBQXBDRCxXQUFZLG9CQUFvQjtJQUM5Qjs7O09BR0c7SUFDSCx5RUFBUyxDQUFBO0lBRVQ7OztPQUdHO0lBQ0gscUVBQU8sQ0FBQTtJQUVQOzs7T0FHRztJQUNILDZFQUFXLENBQUE7SUFFWDs7O09BR0c7SUFDSCx1RUFBUSxDQUFBO0lBRVI7Ozs7T0FJRztJQUNILHFFQUFPLENBQUE7SUFFUDs7T0FFRztJQUNILHlFQUFTLENBQUE7QUFDWCxDQUFDLEVBcENXLG9CQUFvQixLQUFwQixvQkFBb0IsUUFvQy9CO0FBRUQsTUFBTSwyQ0FBMkMsdUJBQWdEO0lBRS9GLE1BQU0sQ0FBQyx1QkFBdUIsSUFBSSxJQUFJO1FBQ2xDLHVCQUF1QixLQUFLLHVCQUF1QixDQUFDLE9BQU8sQ0FBQztBQUNsRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbi8qKlxuICogRGVzY3JpYmVzIHdpdGhpbiB0aGUgY2hhbmdlIGRldGVjdG9yIHdoaWNoIHN0cmF0ZWd5IHdpbGwgYmUgdXNlZCB0aGUgbmV4dCB0aW1lIGNoYW5nZVxuICogZGV0ZWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAqXG4gKi9cbmV4cG9ydCBlbnVtIENoYW5nZURldGVjdGlvblN0cmF0ZWd5IHtcbiAgLyoqXG4gICAqIGBPblB1c2hgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvcidzIG1vZGUgd2lsbCBiZSBpbml0aWFsbHkgc2V0IHRvIGBDaGVja09uY2VgLlxuICAgKi9cbiAgT25QdXNoID0gMCxcblxuICAvKipcbiAgICogYERlZmF1bHRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvcidzIG1vZGUgd2lsbCBiZSBpbml0aWFsbHkgc2V0IHRvIGBDaGVja0Fsd2F5c2AuXG4gICAqL1xuICBEZWZhdWx0ID0gMSxcbn1cblxuLyoqXG4gKiBEZXNjcmliZXMgdGhlIHN0YXR1cyBvZiB0aGUgZGV0ZWN0b3IuXG4gKi9cbmV4cG9ydCBlbnVtIENoYW5nZURldGVjdG9yU3RhdHVzIHtcbiAgLyoqXG4gICAqIGBDaGVja09uY2VgIG1lYW5zIHRoYXQgYWZ0ZXIgY2FsbGluZyBkZXRlY3RDaGFuZ2VzIHRoZSBtb2RlIG9mIHRoZSBjaGFuZ2UgZGV0ZWN0b3JcbiAgICogd2lsbCBiZWNvbWUgYENoZWNrZWRgLlxuICAgKi9cbiAgQ2hlY2tPbmNlLFxuXG4gIC8qKlxuICAgKiBgQ2hlY2tlZGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIHNob3VsZCBiZSBza2lwcGVkIHVudGlsIGl0cyBtb2RlIGNoYW5nZXMgdG9cbiAgICogYENoZWNrT25jZWAuXG4gICAqL1xuICBDaGVja2VkLFxuXG4gIC8qKlxuICAgKiBgQ2hlY2tBbHdheXNgIG1lYW5zIHRoYXQgYWZ0ZXIgY2FsbGluZyBkZXRlY3RDaGFuZ2VzIHRoZSBtb2RlIG9mIHRoZSBjaGFuZ2UgZGV0ZWN0b3JcbiAgICogd2lsbCByZW1haW4gYENoZWNrQWx3YXlzYC5cbiAgICovXG4gIENoZWNrQWx3YXlzLFxuXG4gIC8qKlxuICAgKiBgRGV0YWNoZWRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBzdWIgdHJlZSBpcyBub3QgYSBwYXJ0IG9mIHRoZSBtYWluIHRyZWUgYW5kXG4gICAqIHNob3VsZCBiZSBza2lwcGVkLlxuICAgKi9cbiAgRGV0YWNoZWQsXG5cbiAgLyoqXG4gICAqIGBFcnJvcmVkYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IgZW5jb3VudGVyZWQgYW4gZXJyb3IgY2hlY2tpbmcgYSBiaW5kaW5nXG4gICAqIG9yIGNhbGxpbmcgYSBkaXJlY3RpdmUgbGlmZWN5Y2xlIG1ldGhvZCBhbmQgaXMgbm93IGluIGFuIGluY29uc2lzdGVudCBzdGF0ZS4gQ2hhbmdlXG4gICAqIGRldGVjdG9ycyBpbiB0aGlzIHN0YXRlIHdpbGwgbm8gbG9uZ2VyIGRldGVjdCBjaGFuZ2VzLlxuICAgKi9cbiAgRXJyb3JlZCxcblxuICAvKipcbiAgICogYERlc3Ryb3llZGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIGlzIGRlc3Ryb3llZC5cbiAgICovXG4gIERlc3Ryb3llZCxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGVmYXVsdENoYW5nZURldGVjdGlvblN0cmF0ZWd5KGNoYW5nZURldGVjdGlvblN0cmF0ZWd5OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSk6XG4gICAgYm9vbGVhbiB7XG4gIHJldHVybiBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9PSBudWxsIHx8XG4gICAgICBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdDtcbn1cbiJdfQ==