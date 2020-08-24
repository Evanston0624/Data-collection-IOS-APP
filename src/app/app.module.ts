import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ModalComponent } from './components/modal/modal.component';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MomentModule } from 'ngx-moment';
import { HttpConfigInterceptor } from './services/http-config.interceptor';
import { AlertService } from './services/alert.service';
import { environment } from '../environments/environment';
import { CustomLoaderService } from './services/loader-operator.service';
import { BackgroundGeolocation } from "@ionic-native/background-geolocation/ngx";
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Network } from '@ionic-native/network/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@NgModule({
  declarations: [AppComponent, ModalComponent, ],
  entryComponents: [],
  imports: [
    BrowserModule, 
    CommonModule,
    IonicModule.forRoot(), 
    AppRoutingModule, 
    HttpClientModule,
    MomentModule],
  providers: [
    InAppBrowser,
    StatusBar,
    SplashScreen,
    AlertService,
    CustomLoaderService,
    BackgroundGeolocation,
    Diagnostic,
    Network,
    NativeStorage,
    { provide: "API_URL", useValue: environment.apiURL },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: LoaderInterceptor,
    //   multi: true
    // },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
