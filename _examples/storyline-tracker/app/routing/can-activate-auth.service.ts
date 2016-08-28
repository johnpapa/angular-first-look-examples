import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanLoad,
  Route,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import { UserProfileService } from '../core';

@Injectable()
export class CanActivateAuthGuard implements CanActivate, CanLoad {
  constructor(private userProfileService: UserProfileService, private router: Router) { }

  canLoad(route: Route) {
    return this.userProfileService.isLoggedIn;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    if (this.userProfileService.isLoggedIn) {
      return true;
    }
    this.router.navigate(['/login'], { queryParams: { redirectTo: state.url }});

    return false;
  }
}
