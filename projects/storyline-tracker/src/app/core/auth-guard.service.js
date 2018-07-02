"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var user_profile_service_1 = require("./user-profile.service");
var AuthGuard = /** @class */ (function () {
    function AuthGuard(userProfileService, router) {
        this.userProfileService = userProfileService;
        this.router = router;
    }
    AuthGuard.prototype.canLoad = function (route) {
        if (this.userProfileService.isLoggedIn) {
            return true;
        }
        var url = "/" + route.path;
        this.router.navigate(['/login'], { queryParams: { redirectTo: url } });
        return this.userProfileService.isLoggedIn;
    };
    AuthGuard.prototype.canActivate = function (next, state) {
        if (this.userProfileService.isLoggedIn) {
            return true;
        }
        this.router.navigate(['/login'], { queryParams: { redirectTo: state.url } });
        return false;
    };
    AuthGuard.prototype.canActivateChild = function (route, state) {
        return this.canActivate(route, state);
    };
    AuthGuard = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [user_profile_service_1.UserProfileService, router_1.Router])
    ], AuthGuard);
    return AuthGuard;
}());
exports.AuthGuard = AuthGuard;
//# sourceMappingURL=auth-guard.service.js.map