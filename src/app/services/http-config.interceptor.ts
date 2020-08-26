/**
 * Http Config Interceptor for Http Request
 */

import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse,
    HttpParams
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Injectable, Inject } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { UserService } from './user.service';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
    loaderToShow: any;
    constructor(public loadingController: LoadingController, private userService: UserService,
        @Inject('API_URL') private baseUrl: string) { }


    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Authentication by setting header with token value
        // const token = "my-token-string-from-server";
        // if (token) {
        //     request = request.clone({
        //         setHeaders: {
        //             'Authorization': token
        //         }
        //     });
        // }

        if (request.params.has('qat') && this.userService.userInfo != null) {
            let params: HttpParams = new HttpParams();
            request = request.clone({
                params: request.params.delete('qat')
                    .set('at', this.userService.userInfo.Account),

            })
        }
        else if (request.params.has('qaccount') && this.userService.userInfo != null) {
            let params: HttpParams = new HttpParams();
            request = request.clone({
                params: request.params.delete('qaccount')
                    .set('Account', this.userService.userInfo.Account),

            })
        }

        // if (!request.headers.has('Content-Type')) {
        //     request = request.clone({
        //         setHeaders: {
        //             'content-type': 'application/json; charset=UTF-8'
        //         }
        //     });
        // }

        request = request.clone({
            headers: request.headers.set('Accept', 'application/json')
        });
        // add api base url here
        if (!request.url.startsWith('http://140.116.82.102')) {
            request = request.clone({ url: `${this.baseUrl}/${request.url}` });
        }
        // this.showLoader();
        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    // console.log('event--->>>', event);
                }
                // this.hideLoader();
                return event;
            }),
            catchError((error: HttpErrorResponse) => {
                console.error('error--->>>', error);
                // this.hideLoader();
                return throwError(error);
            }));
    }

    // showLoader() {
    //     console.log(this.loaderToShow);
    //     this.loaderToShow = this.loadingController.create({
    //         message: 'Processing Server Request'
    //     }).then((res) => {
    //         res.present();
    //         res.onDidDismiss().then((dis) => {
    //             console.log('Loading dismissed!');
    //         });
    //     });
    //     //this.hideLoader();
    // }

    // hideLoader() {
    //     this.loadingController.dismiss();
    // }


}