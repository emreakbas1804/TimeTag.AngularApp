import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, NavigationExtras, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { AccountService } from '../Services/httpService/account.service';

@Injectable({
  providedIn: 'root'
})
export class PanelGuard implements CanActivate {

  constructor(private accountService: AccountService, private router: Router) {


  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.accountService.user.pipe(
      map(user => {
        return !!user
      }),
      tap(isCanLogin => {
        if (!isCanLogin) {
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        }
      })
    )
  }

}
