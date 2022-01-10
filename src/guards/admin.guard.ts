import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })

export class AdminGuard implements CanActivate {
    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        const user = JSON.parse(localStorage.getItem('current_user'));

        if (user.type === 1) {
            return true;
        }

        this.router.navigateByUrl('/home');
        
        return false;

    }
}