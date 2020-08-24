/**
 * Service of 每日Point點數 及 點數兌換
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseInfoModel } from '../models/common.model';
import { CustomLoaderService } from './loader-operator.service';

@Injectable({
  providedIn: 'root'
})
export class RewardService {

  constructor(private http: HttpClient, private loaderService: CustomLoaderService) { }

  /**
   * http://140.116.82.102:8080/apptext/PointExchangeHistory.php?at=
   * (at)account=0-9^A-Z^a-z^_
   */
  exchangeHistory(): Observable<any> {
    const options = {
      params: {
        qat: ''
      }
    }
    return this.loaderService.getLoderService(this.http.get('PointExchangeHistory.php', options));
  }
  /**
   * http://140.116.82.102:8080/apptext/DayWork.php?at=
   * (at)  account = 0-9^A-Z^a-z^_
   * 此處只要count>1就算達成。
   */
  getDailyGoal(): Observable<any> {
    const options = {
      params: {
        qat: ''
      }
    }
    return this.loaderService.getLoderService(this.http.get('DayWork.php', options));
  }

  /**
   * http://140.116.82.102:8080/apptext/PointCal.php?at=
   * (at)  account = 0-9^A-Z^a-z^_
   * 此處只要count>1就算達成。
   */
  getPointReward(): Observable<any> {
    const options = {
      params: {
        qat: ''
      }
    }
    return this.loaderService.getLoderService(this.http.get('PointCal.php', options));
  }
  /**
   * http://140.116.82.102:8080/apptext/PointExchangeUpd.php?at=&Pointnum=&time=&Ptn=
   * 	(at)account= 0-9^A-Z^a-z^_
	 *  Pointnum= 0-9
	 *  time= yyyy-MM-dd+hh:mm;ss
	 *  (Ptn)Point exchange num= 0-9

   * 點數兌換
   * @param params 點數兌換資料
   */
  setPointsExchange(params) {
    const options = {
      params: params
    }
    return this.loaderService.getLoderService(this.http.get('PointExchangeUpd.php', options).pipe(
      map((response:ResponseInfoModel)=>{
        console.log(response);
        return response.success === 1 ? response.data.Pointnum : -1;
      })));
  }
}
