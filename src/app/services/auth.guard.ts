/**
 * Auth Guard
 */
import { CanLoad, Route, Router } from '@angular/router';
import { UrlSegment } from "@angular/router";
import { UserService } from './user.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthGuardService implements CanLoad {
    constructor(private userService: UserService,
                private router: Router) { }
    canLoad(route: Route, segments: UrlSegment[]): boolean | Observable<boolean> | Promise<boolean> {
        return this.userService.isAuthenticated().then(
            (authenticated: boolean) => {
                if(authenticated){
                    return true;
                }
                else {
                    this.router.navigate(['/']);
                    return false;
                }
            }
        );
    }

}