"use strict";
var CanDeactivateGuard = (function () {
    function CanDeactivateGuard() {
    }
    CanDeactivateGuard.prototype.canDeactivate = function (component) {
        return component.canDeactivate ? component.canDeactivate() : true;
    };
    return CanDeactivateGuard;
}());
exports.CanDeactivateGuard = CanDeactivateGuard;
//# sourceMappingURL=app.interfaces.js.map