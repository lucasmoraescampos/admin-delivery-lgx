import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ConfigHelper } from 'src/app/helpers/config.helper';

@Injectable({ providedIn: 'root' })

export class AuthGuard implements CanActivate {
    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        const accessToken = localStorage.getItem(ConfigHelper.Storage.AccessToken);

        if (accessToken) {
            return true;
        }

        this.router.navigateByUrl('/signin');
        
        return false;

    }
}