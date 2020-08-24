import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { Observable, of, Subject, from } from 'rxjs';
import { ResponseInfoModel } from '../models/common.model';
import { CustomLoaderService } from './loader-operator.service';
//import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationEvents, BackgroundGeolocationResponse, BackgroundGeolocationCurrentPositionConfig } from '@ionic-native/background-geolocation/ngx';
//import * as moment from 'moment';
import { LocationsServiceProvider } from './location.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private isLogIn = false;
  private _userInfo: UserInfoModel = undefined;
  // {
  //   Account: 'cchuang',
  //   password: 'mail0731',
  //   Name: '黃建中',
  //   mobile: '',
  //   email: '',
  //   Pointnum: '40',
  //   registtime: '',
  //   DES1: '0',
  //   EMO1: '0',
  //   GPS1: '0',
  //   GPS2: '0',
  //   GPS3: '0',
  //   GPS4: '0',
  //   GPS5: '0',
  //   DES2: '0',
  //   DES3: '0',
  //   DES4: '0',
  //   DES5: '0',
  //   DES6: '0',
  //   EMO2: '0',
  //   EMO3: '0',
  //   EMO4: '0',
  //   EMO5: '0',
  //   EMO6: '0',
  //   SCL1: '0',
  //   SCL2: '0',
  //   SCL3: '0',
  //   SCL4: '0',
  //   GES1: '0',
  //   GES2: '0',
  //   GES3: '0',
  //   GES4: '0',
  //   GES5: '0'
  // }
  // private _locationList = [];
  private locationSubject = new Subject<any>();
  get location$() {
    return this.locationSubject.asObservable();
  }
  get userInfo(): UserInfoModel {
    return this._userInfo;
  }
  // get locationList() {
  //   return this._locationList;
  // }
  constructor(private http: HttpClient,
    private loaderService: CustomLoaderService,
    private locationService: LocationsServiceProvider,
    private nativeStorage: NativeStorage) { }
  /**
   * 驗證是否登入
   */
  isAuthenticated() {
    const promise = new Promise(
      (resolve, rejct) => {
        setTimeout(() => {
          resolve(this.isLogIn)
        }, 200);
      }
    );
    return promise;
  }

  /**
   * 登入驗證
   * @param account 帳號
   * @param password 密碼
   */
  login(account, password) {
    const options = {
      params: { at: account, pw: password }
    };

    return this.loaderService.getLoderService(this.http.get(`checkAccount.php`, options)
      .pipe(
        tap((response: any) => {
          if (response.success === 1) {
            this._userInfo = response.data;
            this.isLogIn = true;
          }
        }),
        map((response: any) => {
          return response.success === 1;
        }),
      ));
  }

  /**
   * 1.	創建帳號
   * http://140.116.82.102:8080/app/RegistUser.php?name=&at=&pw=&mobile=&email=
   */
  newAccount({ name, account, password, mobile, email }) {
    const options = {
      params: { name: name, at: account, pw: password, mobile: mobile, email: email }
    }
    return this.loaderService.getLoderService(this.http.post(`RegistUser.php`, options));
  }

  /**
   * 登出
   */
  logout() {
    this._userInfo = undefined;
    this.isLogIn = false;
    this.locationService.stopBackgroundGeolocation();
    this.loaderService.getLoderService(of(''), '登出作業').subscribe();
  }

  /**
   * 確認帳號是否存在
   * http://140.116.82.102:8080/app/checkAccount.php?&at=&pw=
   * @param account 帳號
   * @param password 不傳值default為0
   */
  checkAccount(account) {
    const options = {
      params: { at: account, pw: '0' }
    };
    return this.http.get(`checkAccount.php`, options)
      .pipe(map((response: any) => {
        return response.success === 1;
      }));
  }

  reloadAccountInfo() {
    return this.login(this._userInfo.Account, this._userInfo.password);
  }

  registration(regUserInfo): Observable<any> {
    const options = {
      params: regUserInfo,
      data: regUserInfo
    };
    //
    return this.loaderService.getLoderService(this.http.get(`RegistUser.php`, options)
      .pipe(
        map((response: ResponseInfoModel) => {
          console.log(response);
          return response.success === 1;
        })
      ));
  }

  getLocalStorageAccount() {
    return from(this.nativeStorage.getItem('account'));
  }

  setLocalStorageAccount(rememberMe = false) {
    let account = '';
    if (rememberMe) {
      account = this._userInfo.Account;
    }

    return from(this.nativeStorage.setItem('account', account));
  }
}
