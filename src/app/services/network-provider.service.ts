/**
 * Network status 
 */

import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { Platform } from '@ionic/angular';
import { fromEvent, merge, of, Observable, BehaviorSubject } from 'rxjs';
import { mapTo } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class NetworkProviderService {
    private online$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    constructor(public network: Network, public platform: Platform) {
        if (this.platform.is('cordova')) {
            // on Device
            merge(
                this.network.onConnect().pipe(mapTo(true)),
                this.network.onDisconnect().pipe(mapTo(false))
            ).subscribe((status)=>{ this.online$.next(status); });
        } else {
            // on Browser
            merge(
                of(navigator.onLine),
                fromEvent(window, 'online').pipe(mapTo(true)),
                fromEvent(window, 'offline').pipe(mapTo(false))
            ).subscribe((status)=>{ this.online$.next(status); });;
        }
    }

    public getNetworkType(): string {
        return this.network.type;
    }

    public getNetworkStatus(): Observable<boolean> {
        return this.online$.asObservable();
    }
}