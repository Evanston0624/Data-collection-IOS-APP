import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../services/user.service';
import { RewardService } from '../services/reward.service';
import { map, takeUntil } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import * as moment from 'moment';
import { AlertService } from '../services/alert.service';
import { AppInfoService } from '../services/appInfo.service';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-points-redeem',
  templateUrl: './points-redeem.page.html',
  styleUrls: ['./points-redeem.page.scss'],
})
export class PointsRedeemPage implements OnInit, OnDestroy {
  destory$ = new Subject<boolean>();
  points = 0;
  title = 'aaa';
  buttonsOption = [
    {
      text: '我知道了',
      cssClass: 'primary',
      handler: () => {
        // this.reloadPoint();
        console.log('更新資料');
      }
    }
  ];
  exchangeMessage = '';
  constructor(private userService: UserService, private rewardService: RewardService,
              private alertService: AlertService, private appInfoService: AppInfoService) { }
  ngOnDestroy(): void {
    this.destory$.next(true);
  }

  ngOnInit() {
    this.reloadPoint();
  }

  /**
   * 重新查詢Points
   */
  reloadPoint() {
    this.userService.reloadAccountInfo().subscribe({
      next: () => {
        this.points = +this.userService.userInfo.Pointnum;
      }
    });
    this.appInfoService.appInfo
      .pipe(takeUntil(this.destory$))
      .subscribe({
        next: (appInfo) => {
          this.exchangeMessage = appInfo.ExchangeMessage;
        }
      });
  }

  /**
   * 顯示歷次兌換
   */
  showExchangeHistory() {
    // this.rewardService.exchangeHistory(this.userService.userInfo.Account)
    this.rewardService.exchangeHistory()
      .pipe(
        map((response: any) => {
          return response.success === 1 ? response.data : [];
        }),
        map((data) => {
          return data.map(x => `[${x.Datetime}] 兌換${x.wrile}張`).join('<br/>');
        })
      )
      .subscribe({
        next: (data) => {
          console.log(data);
          if (data.length > 0) {
            this.alertService.presentAlert(data, undefined, '歷次兌換資料');
          }
          else {
            this.alertService.presentAlert('查無歷次兌換資料');
          }
        }
      });
  }

  /**
   * 兌換
   * @param exchangeType 兌換類別 0: 1張, 1: 全部
   */
  doPointExchange(exchangeType) {
    const pointExchangeNum = exchangeType === 0 ? 1 : Math.trunc(this.points / 100);
    const params = {
      qat: '',
      Pointnum: this.points - (pointExchangeNum * 100),
      time: moment().format('YYYY-MM-DD+HH:mm:ss'),
      Ptn: pointExchangeNum
    }
    console.log(params);
    this.rewardService.setPointsExchange(params).subscribe({
      next: (res) => {
        if (res >= 0) {
          // 兌換成功 
          this.points = res;
          this.alertService.presentAlert(`兌換成功!!(共${pointExchangeNum}張)`, this.buttonsOption);
        }
        else {
          // 兌換失敗
          this.alertService.presentAlert('兌換失敗');
        }
      }
    });
  }

  /**
   * 點選兌換事件
   * @param exchangeType 兌換類別 0: 1張, 1: 全部
   * @param doExchange 是否確認執行兌換
   */
  pointsExchange(exchangeType, doExchange = false) {
    const headerText = exchangeType === 0 ? `兌換1張` : '兌換全部'
    //const exchangeMessage = 
    const message = !doExchange ? '請交由兌換人員進行兌換' : `確定要兌換${headerText}(請由兌換人員操作)`;
    this.alertService.presentConfirm(message, [
      {
        text: doExchange ? '兌換' : '確認兌換',
        cssClass: 'primary',
        handler: () => {
          if (doExchange) {
            this.doPointExchange(exchangeType);
            console.log('do exchange');
          }
          else {
            // trigger 2nd confirm
            this.pointsExchange(exchangeType, true);
          }
        }
      }, {
        text: '取消'
      }
    ], headerText);
  }
}
