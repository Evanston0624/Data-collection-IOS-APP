/**
 * 
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ResponseInfoModel } from '../models/common.model';
import { CustomLoaderService } from './loader-operator.service';
export interface IAppInfo {
  AppVersion: string;
  UpdateInf: string;
  ExchangeMessage: string;
}
@Injectable({
  providedIn: 'root'
})
export class AppInfoService {
  exchangeMessage = '';
  private appInfo$ = new BehaviorSubject<IAppInfo>({ AppVersion: '', UpdateInf: '', ExchangeMessage: '' });
  get appInfo() {
    return this.appInfo$.asObservable();
  }
  // appInfo = { AppVersion: '', UpdateInf: '', ExchangeMessage: '' };
  constructor(private http: HttpClient, private loaderService: CustomLoaderService) { }



  getAppInfo() {
    return this.http.get('messInf.php')
      .pipe(tap((data: any) => {
        this.appInfo$.next(data);
      }));
  }
}
