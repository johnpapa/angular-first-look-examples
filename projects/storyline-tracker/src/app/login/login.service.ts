import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';
import { SpinnerService, UserProfileService } from '../../app/core';

@Injectable()
export class LoginService {
  constructor(
    private spinnerService: SpinnerService,
    private userProfileService: UserProfileService
  ) {}

  login() {
    return of(true).pipe(
      tap(_ => this.spinnerService.show()),
      delay(1000),
      tap(this.toggleLogState.bind(this))
    );
  }

  logout() {
    this.toggleLogState(false);
  }

  private toggleLogState(val: boolean) {
    this.userProfileService.isLoggedIn = val;
    this.spinnerService.hide();
  }
}
