import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AccountService } from './account.service';
import { Router } from '@angular/router';
import { SnackBarService } from '../customService/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class RequestHeaderInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService, private router: Router, private snackbarService: SnackBarService, private translateService: TranslateService) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const jwtToken = localStorage.getItem('accessToken');
        const langCode = localStorage.getItem('langCode') ?? 'en';
        if (jwtToken) {
            const clonedRequest = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${jwtToken}`,
                    AccessToken: '1234567!',
                    langCode: langCode,
                },
            });

            return next.handle(clonedRequest).pipe(
                catchError((error: HttpErrorResponse) => {
                    if (error.status == 401 || error.status == 0) {
                        this.accountService.logOut();
                        this.router.navigate(['/login']);
                        this.snackbarService.error(this.translateService.instant('Common.LoginExpired'));
                    }
                    return throwError(() => error);
                })
            );
        } else {
            const clonedRequest = request.clone({
                setHeaders: {
                    langCode: langCode,
                },
            });

            return next.handle(clonedRequest).pipe(
                catchError((error: HttpErrorResponse) => {
                    if (error.status == 401 || error.status == 0) {
                        // this.accountService.logOut();
                        // this.router.navigate(['/panel']);
                    }
                    return throwError(() => error);
                })
            );
        }

        return next.handle(request);
    }
}
