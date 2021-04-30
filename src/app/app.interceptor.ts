import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigHelper } from './helpers/config.helper';
import { Router } from '@angular/router';

@Injectable()
export class AppInterceptor implements HttpInterceptor {

    constructor(
        private router: Router
    ) { }

    private handleAuthError(err: HttpErrorResponse): Observable<any> {

        if (err.status === 401) {

            localStorage.clear();

            this.router.navigateByUrl('signin');

            return of(err.message);

        }

        return throwError(err);

    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const token = localStorage.getItem(ConfigHelper.Storage.AccessToken);

        if (token != null) {

            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            
        }

        return next.handle(request).pipe(catchError(err => this.handleAuthError(err)));
    }
}