/**
 * Geolocation Service
 */
import { Injectable } from '@angular/core';
import {
    BackgroundGeolocation, BackgroundGeolocationConfig,
    BackgroundGeolocationResponse,
    BackgroundGeolocationCurrentPositionConfig
} from '@ionic-native/background-geolocation/ngx';
import * as moment from 'moment';
import { Subject, from, interval, BehaviorSubject, Observable, combineLatest, of, throwError, EMPTY } from 'rxjs';
import { switchMap, takeUntil, map, reduce, retryWhen, delay, mergeMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ResponseInfoModel } from '../models/common.model';

export class GPSDataRequest {
    qaccount: string;
    startlat: number;
    startlng: number;
    endlat: number;
    endlng: number;
    starttime: string;
    endtime: string;
    costtime: number;
    speed: number;
    offl: number;
    constructor() {
        this.qaccount = '';
        this.offl = 1;
    }
}

const DEFAULT_MAX_RETRIES = 5;
const DEFAULT_BACKOFF = 1000;

@Injectable({
    providedIn: 'root'
})
export class LocationsServiceProvider {

    options: BackgroundGeolocationConfig;
    currentPos: any;
    private unSendData = [];
    private destory$ = new Subject<boolean>();
    private locationSubject = new Subject<BackgroundGeolocationResponse>();
    private sendLocationSubject = new Subject<any>();
    private locationPermissionStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    /**
     * 每6秒回傳 getCurrentLocation
     */
    get location$() {
        return this.locationSubject.asObservable();
    }
    /**
     * 每次上傳的location資料
     */
    get sendLocation$() {
        return this.sendLocationSubject.asObservable();
    }
    /**
     * 取得目前location service permission
     */
    get locationPermission$() {
        return this.locationPermissionStatus.asObservable();
    }
    // 
    constructor(private backgroundGeolocation: BackgroundGeolocation,
        // private networkProviderService: NetworkProviderService,
        // private pluginProvider: PluginProvider,
        private http: HttpClient) { }

    /**
     * Start background geolocation
     */
    startBackgroundGeolocation() {
        const config: BackgroundGeolocationConfig = {
            desiredAccuracy: 10,
            stationaryRadius: 20,
            distanceFilter: 500,
            debug: false, //  enable this hear sounds for background-geolocation life-cycle.
            stopOnTerminate: true // enable this to clear background location settings when the app terminates
        };

        this.backgroundGeolocation.configure(config).then(() => {
            const options: BackgroundGeolocationCurrentPositionConfig = {
                timeout: 6000,
                maximumAge: 6000,
                enableHighAccuracy: true
            };
            // 
            this.getCurrentLocation(options)
                .pipe(
                    map(resp => this.extractLocationResponse(resp))
                )
                .subscribe(
                    (resp: any) => {
                        this.locationSubject.next(resp);
                    });
            this.backgroundGeolocation.finish(); // FOR IOS ONLY
            // 
            // this.backgroundGeolocation.on(BackgroundGeolocationEvents.authorization)
            //     .subscribe((status: any) => {
            //         this.locationPermissionStatus.next(status);
            //     });
            // 
            // this.backgroundGeolocation.checkStatus()
            // this.backgroundGeolocation.configure(config)
            // from(this.backgroundGeolocation.configure(config)).subscribe({
            //   next: (location: BackgroundGeolocationResponse) => { 
            //     console.log(location);
            //     this._locationList.push(location);
            //   }
            // });
            //
            // this.backgroundGeolocation.watchLocationMode()
            // this.backgroundGeolocation.configure(config).then(() => {
            //     // location change
            //     this.backgroundGeolocation
            //         .on(BackgroundGeolocationEvents.location)
            //         .subscribe((location: BackgroundGeolocationResponse) => {
            //             console.log(location);
            //             // this._locationList = [...this._locationList, 
            //             this.locationSubject.next(
            //                 {
            //                     time: moment().format('YYYY/MM/DD HH:mm:ss'),
            //                     loc: location
            //                 });
            //             //];
            //             //this.sendGPS(location);
            //             // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
            //             // and the background-task may be completed.  You must do this regardless if your operations are successful or not.
            //             // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
            //             this.backgroundGeolocation.finish(); // FOR IOS ONLY
            //         });
            // });
        });
        // start recording location
        this.backgroundGeolocation.start();
    }

    private extractLocationResponse({ latitude, longitude, time }) {
        return { lat: latitude, lng: longitude, time: moment(time).format('x') };
    }

    /**
     * 定時6秒取得一次gps的location並做運算
     * @param options options
     */
    getCurrentLocation(options) {

        // 定時6秒取得一次gps的location並做運算
        return interval(6000).pipe(
            takeUntil(this.destory$),
            switchMap((count) => {
                return from(this.backgroundGeolocation.getCurrentLocation(options))
            })
        );
    }
    /**
     * Stop background geolocation
     */
    stopBackgroundGeolocation() {
        this.destory$.next(true);
        // If you wish to turn OFF background-tracking, call the #stop method.
        this.backgroundGeolocation.stop();
    }

    /**
     * Calculate Distance between two geolocation 
     * @param lat1 lat of location 1
     * @param lon1 lon of location 1
     * @param lat2 lat of location 2
     * @param lon2 lon of location 2
     * @param unit K: for kilometer, N: for mile
     */
    distance(lat1, lon1, lat2, lon2, unit) {
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            var theta = lon1 - lon2;
            var radtheta = Math.PI * theta / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit == "K") { dist = dist * 1.609344 }
            if (unit == "N") { dist = dist * 0.8684 }
            if (unit == "M") { dist = dist * 1.609344 * 1000}
            return dist;
        }
    }
    /**
     * 上傳GPS Data
     * @param requestData GPS Data
     */
    private doSendGPS(requestData) {
        //this.sendLocationSubject.next(requestData);
        return this.http.get(`InsertNewGPSData.php`, { params: requestData })
            .pipe(
                this.delayRetry(5000, 3),
                catchError(error => {
                    console.log(error);
                    this.unSendData.push(requestData);
                    return EMPTY;
                })
            );
    }
    /**
     * 整理location list資料並上傳
     * @param locationList 未整理的location list
     */
    sendGPS(locationList) {
        let obsResult = {
            qaccount: '', startlat: undefined, startlng: undefined, endlat: undefined, endlng: undefined,
            starttime: undefined, endtime: undefined, distance: 0, costtime: 0, speed: 0,
            time: moment().format('YYYY-MM-DD+HH:mm:ss'), offl: 1
        };
        return from(locationList)
            .pipe(
                reduce((accm, current: any, index) => {
                    if (index === 0) {
                        accm.startlat = current.lat;
                        accm.startlng = current.lng;
                        accm.starttime = current.time;
                    }
                    else {
                        accm.endlat = current.lat;
                        accm.endlng = current.lng;
                        accm.endtime = current.time;
                        accm.distance += this.distance(accm.startlat, accm.startlng, accm.endlat, accm.endlng, 'M');
                        if (index === 5) {
                            accm.costtime = Math.round(moment(+accm.endtime).diff(+accm.starttime) / 1000);
                            accm.speed = accm.distance === 0 ? 0 : accm.distance / accm.costtime;
                        }
                    }
                    return accm;
                }, obsResult),
                switchMap(requestData => this.doSendGPS(requestData))
            ).subscribe((res: ResponseInfoModel) => {
                console.log(res);
            });
    }

    /**
     * delay Retry of Observable
     * @param delayMs delay ms
     * @param maxRetry max retry times
     * @param backoffMs add delay ms each retry
     */
    delayRetry(delayMs: number, maxRetry = DEFAULT_MAX_RETRIES, backoffMs = DEFAULT_BACKOFF) {
        let retries = delayMs;
        return (src: Observable<any>) => src.pipe(
            retryWhen((error: Observable<any>) => error.pipe(
                mergeMap(error => {
                    if (retries-- > 0) {
                        const backoffTime = delayMs + (maxRetry - retries) * backoffMs;
                        return of(error).pipe(delay(backoffTime));
                    }
                    return throwError(`retry ${maxRetry} times`);
                })
            ))
        )
    }


}