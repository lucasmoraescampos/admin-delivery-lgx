import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ConfigHelper } from './helpers/config.helper';
import { Router } from '@angular/router';
import { LoadingService } from './services/loading.service';
import { AlertService } from './services/alert.service';

@Injectable()
export class AppInterceptor implements HttpInterceptor {


    constructor(
        private router: Router,
        private alertSrv: AlertService,
        private loadingSrv: LoadingService
    ) { }


    private handleAuthError(err: HttpErrorResponse): Observable<any> {

        this.loadingSrv.hide();

        if (err.status === 401) {

            localStorage.clear();

            this.router.navigateByUrl('signin');

            return of(err.message);

        }

        else if (err.status === 422) {

            const key = Object.keys(err.error.message)[0];

            this.alertSrv.toast({
                icon: 'error',
                message: err.error.message[key][0]
            });

        }

        return throwError(err);
    }


    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        this.loadingSrv.show();

        const token = localStorage.getItem(ConfigHelper.Storage.AccessToken);

        if (token != null) {

            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });

        }

        return next.handle(request)
            .pipe(catchError(err => this.handleAuthError(err)))
            .pipe(finalize(() => this.loadingSrv.hide()));
    }


}