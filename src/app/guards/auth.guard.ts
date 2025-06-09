import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class  authGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    // Check if user is logged in
    if (!this.auth.isLoggedIn()) {
        return this.router.parseUrl('/login');
    }

    // Check for required permission
    
    const requiredPermission = route.data['permission'];
    if (requiredPermission && !this.auth.hasPermission(requiredPermission)) {
        return this.router.parseUrl('/unauthorized');
    }

    
    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles && !this.auth.getRoles().some(role => requiredRoles.includes(role))) {
        return this.router.parseUrl('/unauthorized');
    }

    return true;
}

}