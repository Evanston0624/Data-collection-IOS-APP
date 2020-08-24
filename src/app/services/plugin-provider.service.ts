/**
 * Native Plugin Provider
 * Diagnostic and Network Provider
 */

import { Injectable } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { from, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { NetworkProviderService } from './network-provider.service';

@Injectable({
    providedIn: 'root'
  })
export class PluginProvider {
    // options: GeolocationOptions;
    // currentPos: Geoposition;
    subscription: any;
    locationCoords: any;
    apiResponse: any;
    constructor(private diagnostic: Diagnostic, private networkProviderService: NetworkProviderService) { }
    /**
     * check location & network status
     */
    checkStatus() {
        
        return combineLatest(
            this.networkProviderService.getNetworkStatus(),
            this.locationEnabled(), 
            this.locationAvailable(),
            // this.networkProviderService.getNetworkStatus(),
        )
        .pipe(
            map(([isNetworkAvaliable, isLocationEnabled, isLocationAvailable])=>{
                return { isNetworkAvaliable, isLocationEnabled, isLocationAvailable};
            })
        );
    }

    //To check whether Location Service is enabled or Not
    private locationEnabled() {
        return from(this.diagnostic.isLocationEnabled());
    }

    private locationAvailable() {
        return from(this.diagnostic.isLocationAvailable());
    }

    private networkAvailable(){
        
    }

    
    

}