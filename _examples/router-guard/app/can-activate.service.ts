import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  Route,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import { UserProfileService } from './login/user-profile.service';

@Injectable()
export class CanActivateAuthGuard implements CanActivate, CanActivateChild {
  constructor(private userProfileService: UserProfileService, private router: Router) { }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(next, state);
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.userProfileService.isLoggedIn) {
      return true;
    }
    this.router.navigate(['/login'], { queryParams: { redirectTo: state.url } });
    return false;
  }
}
