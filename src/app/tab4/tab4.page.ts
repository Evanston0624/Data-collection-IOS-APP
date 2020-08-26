/**
 * 其他 Tab
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { UserService } from '../services/user.service';
import { InsertNewDataModel } from '../models/common.model';
import * as moment from 'moment';
import { DailyRecordService } from '../services/daily-record.service';
import { RewardService } from '../services/reward.service';
@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  /* options : InAppBrowserOptions = {
  //   location : 'yes',//Or 'no'
  //   hidden : 'no', //Or  'yes'
  //   clearcache : 'yes',
  //   clearsessioncache : 'yes',
  //   zoom : 'yes',//Android only ,shows browser zoom controls
  //   hardwareback : 'yes',
  //   mediaPlaybackRequiresUserAction : 'no',
  //   shouldPauseOnSuspend : 'no', //Android only
  //   closebuttoncaption : 'Close', //iOS only
  //   disallowoverscroll : 'no', //iOS only
  //   toolbar : 'yes', //iOS only
  //   enableViewportScale : 'no', //iOS only
  //   allowInlineMediaPlayback : 'no',//iOS only
  //   presentationstyle : 'pagesheet',//iOS only
  //   fullscreen : 'yes',//Windows only
  // };  */
  exchangeMessage = '';
  constructor(private router: Router, private iab: InAppBrowser,
              private userService: UserService,
              private dailyRecordService: DailyRecordService,
              private rewardService: RewardService ) { }

  ngOnInit() { }

  showPointRedeem() {
    this.router.navigate(['/redeem']);
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }

  // showGoogleForm(type) {
  //   const newData: InsertNewDataModel = {
  //     // Account: '',//this.userService.userInfo.Account,
  //     type: type === 'ASRM' ? '7' : '6',
  //     time: moment().format('YYYY-MM-DD+HH:mm:ss'),
  //     content: type === 'ASRM' ? 'SCL2' : 'SCL1',
  //     object_Anger: 0,
  //     object_Anxiety: 0,
  //     object_Boredom: 0,
  //     object_Disgust: 0,
  //     object_Happiness: 0,
  //     object_Sadness: 0,
  //     object_Surprised: 0
  //   };
  //   this.dailyRecordService.showGoogleForm(newData)
  //     .subscribe({
  //       next: (res) => {
  //         // do nothing...
  //       }
  //   });
  // }
}
