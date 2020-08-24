
import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { ModalComponent } from '../components/modal/modal.component';
import { CustomLoaderService } from '../services/loader-operator.service';
import { AlertService } from '../services/alert.service';
import { LocationsServiceProvider } from '../services/location.service';
import { NetworkProviderService } from '../services/network-provider.service';
import { combineLatest, Subject, from, iif } from 'rxjs';
import { ServiceStatus } from '@ionic-native/background-geolocation/ngx';
import { PluginProvider } from '../services/plugin-provider.service';
import { takeUntil, mergeMap, take } from 'rxjs/operators';
import { NativeStorage } from '@ionic-native/native-storage/ngx';



const MEDIA_FOLDER_NAME = 'my_media';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  user = { Account: '', Password: '' };
  loginForm: FormGroup;
  locationList = [];
  sendLocationList = [];
  locationObs;
  sendLocationObs;
  locationStatus = { Enabled: false, Available: false };
  networkStatus = {};
  nativeStatus$;
  destory$: Subject<boolean> = new Subject<boolean>();
  rememberme: boolean;

  constructor(private route: Router, private userService: UserService, private zone: NgZone,
    private fb: FormBuilder, private alertService: AlertService,
    public modalController: ModalController, private platform: Platform,
    private locationService: LocationsServiceProvider, private pluginProvider: PluginProvider,
    private customLoaderService: CustomLoaderService) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      account: [
        '',
        [Validators.required]
      ],
      password: [
        '',
        [Validators.required, Validators.minLength(4)]
      ],
      rememberme: [

      ]
    });
    this.platform.ready().then(() => {
      // 取得 location enabled, permission and network status
      if (!this.nativeStatus$) {
        this.nativeStatus$ = this.pluginProvider.checkStatus()
          .pipe(takeUntil(this.destory$))
          .subscribe({
            next: (resStatus) => {
              this.zone.run(() => {
                this.networkStatus = resStatus.isNetworkAvaliable;
                this.locationStatus.Available = resStatus.isLocationAvailable;
                this.locationStatus.Enabled = resStatus.isLocationEnabled;
              });
            },
            error: (error) => {
              console.log(error);
            }
          });

        this.userService.getLocalStorageAccount()
          .pipe(takeUntil(this.destory$))
          .subscribe({
            next: (account) => {
              console.log(account);
              this.loginForm.controls.account = account;
            },
            error: (err) => console.log(err)
          });
      }
    });
  }
  /**
   * Login
   */
  login() {
    // console.log(this.loginForm.controls.account.value, this.loginForm.controls.password.value);
    // console.log(this.loginForm.controls.rememberme.value);

    this.userService.login(this.loginForm.controls.account.value, this.loginForm.controls.password.value)
      .pipe(
        this.customLoaderService.load()
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.alertService.presentAlert(`${this.userService.userInfo.Name} 您好`, [{
              text: '我知道了',
              cssClass: 'primary',
              handler: () => {
                this.startGPS();
                this.userService.setLocalStorageAccount(this.loginForm.controls.rememberme.value)
                  .pipe(take(1)).subscribe({
                    next: () => { console.log('set local storage success'); },
                    error: (err) => { console.log(err); }
                  });
                this.route.navigateByUrl('tabs');
              }
            }], '登入成功');
          }
          else {
            this.alertService.presentAlert('登入失敗，請確認帳號密碼');
            // this.presentAlert('');
          }
        }
      });
  }

  showModal(emotionType, dataType) {
    this.presentModal(emotionType, dataType);
  }

  async presentModal(emotionType, dataType) {
    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        'emotionType': emotionType,
        'dataType': dataType
      }
    });
    modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data);
  }
  /**
   * Start GPS
   */
  startGPS() {
    // this.sendLocationObs = this.locationService.sendLocation$
    //   .subscribe({
    //     next: (data)=>{
    //       this.sendLocationList.push(data);
    //     }
    //   });
    // process location data
    this.locationObs = this.locationService.location$
      .subscribe((data) => {
        // if list length === 6 then send GPS
        if (this.locationList.length === 6) {
          // 取得要上傳的資料集
          const requestData = this.locationList.slice();
          // 清空原來清單剩最後一筆
          this.locationList = this.locationList.slice(5);
          this.locationService.sendGPS(requestData);
        }
        else {
          this.locationList.push(data);
        }
      });

    // Start background geolocation
    this.locationService.startBackgroundGeolocation();
  }
  /**
   * Stop GPS
   */
  stopGPS() {
    // Stop background geolocation
    this.locationService.stopBackgroundGeolocation();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.destory$.next(true);
  }

  ionViewDidEnter() {
    // this.startGPS();

  }


}
