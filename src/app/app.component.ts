import { Component, OnInit } from '@angular/core';

import { Platform, LoadingController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { CustomLoaderService } from './services/loader-operator.service';
import { AppInfoService } from './services/appInfo.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  // loading;
  isLoading = false;
  constructor(
    private loaderService: CustomLoaderService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private loadingCtrl: LoadingController,
    private appInfoService: AppInfoService
  ) {
    this.initializeApp();
  }
  ngOnInit(): void {
    this.loaderService.isLoading$.subscribe((loadingMessage) => {
      // console.log(status);
      this.isLoading = loadingMessage.status;
      if (loadingMessage.status) {
        // console.log('on present loading');
        this.presentLoading(loadingMessage.message);

      } else {
        // console.log('on dismiss present loading');
        this.loadingCtrl.dismiss()
          .catch(err => console.log('dismiss error: ', err))
          .then(resp => console.log('dismiss success', resp));
      }
    });
    this.appInfoService.getAppInfo().subscribe();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

    });
  }

  async presentLoading(message?: string) {
    console.log(message);
    const showMessage = message === '' ? '資料讀取中...請稍候' : message;
    const loading = await this.loadingCtrl.create({
      message: showMessage
    }).then((loading) => {
      loading.present();
      loading.onDidDismiss().then((dis) => {
        // console.log('Loading dismissed!');
      });
      if (!this.isLoading) {
        loading.dismiss();
      }
    });
    // this.loadingCtrl.dismiss();
    // 
  }
}
