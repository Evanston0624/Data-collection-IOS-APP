/**
 * Daily Record Tab
 */

import { Component, OnInit, Inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../components/modal/modal.component';
import { UserService } from '../services/user.service';
import { DailyRecordService } from '../services/daily-record.service';
import { AlertService } from '../services/alert.service';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { InsertNewDataModel } from '../models/common.model';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { RewardService } from '../services/reward.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  dailyRecordList = [];
  dailyGoal = {};
  dailyGoalList = [
    { group: 0, typeCode: 'data1', text: '每日心情', goal: false },
    { group: 0, typeCode: 'data2', text: '起床時間', goal: false },
    { group: 0, typeCode: 'data3', text: '睡眠時間', goal: false },
    { group: 1, typeCode: 'data0', text: '每日情緒標記', goal: false },
    { group: 1, typeCode: 'data4', text: 'DASS量表', goal: false },
    { group: 1, typeCode: 'data5', text: 'ASMR量表', goal: false }
  ]
  options: StreamingVideoOptions = {
    successCallback: () => { console.log('Video played') },
    errorCallback: (e) => { console.log('Error streaming') },
    orientation: 'landscape',
    shouldAutoClose: false,
    controls: true
  };

  showFab = false;

  constructor(public modalController: ModalController,
    private rewardService: RewardService,
    private userService: UserService,
    private dailyRecordService: DailyRecordService,
    private alertService: AlertService,
    private streamingMedia: StreamingMedia, @Inject('API_URL') private baseUrl: string) { }
  ngOnInit(): void {
    this.loadDailyRecordData();
  }
  /**
   * 讀取每日達成目標及文字/錄音/錄影記錄
   */
  loadDailyRecordData() {
    this.showFab = false;
    forkJoin(
      this.rewardService.getDailyGoal(),
      this.dailyRecordService.getHistoryInfo(),
    )
      .pipe(
        map(([respDaily, respHistory]) => {
          // console.log([respDaily, userInfo]);
          return [
            respDaily.success === 1 ? respDaily.data : [],
            respHistory.success === 1 ? respHistory.data : [],
          ]
        }),
        tap(([dataDaily, dataHistory]) => {
          // 處理 每日達成資料
          dataDaily.reduce((accum, val) => {
            Object.assign(accum, val);
            return accum;
          }, this.dailyGoal);
          this.dailyGoalList.forEach(element=>{
            element.goal = +this.dailyGoal[element.typeCode] > 0;
          });
          // console.log(this.dailyGoal);
          // 處理 Point達成資料
          this.dailyRecordList = dataHistory.sort((a, b) => { return a.Datetime > b.Datetime ? -1 : 1; });
        })
      ).subscribe(() => {
        this.showFab = true;
      });
  }
  /**
   * 依照emotion type and data type modal component
   * @param emotionType 0: 每日心情與睡眠, 1: 文字/錄音/錄影/情緒 2: DASS/ASRM
   * @param dataType 0: Text#	1: Speech# 2: Emoji# 3: Video# 5: Get up time 
   *                 1: DASS scale 2: ASRM scale
   */
  showModal(emotionType, dataType) {
    if (emotionType === 1 || emotionType === 0) {
      this.presentModal(emotionType, dataType);
    }
    else if (emotionType === 2) {
      this.showGoogleForm(dataType === 1 ? 'DASS' : 'ASRM');
    }

  }
  /**
   * 呈現Modal
   * @param emotionType 0: 每日心情與睡眠, 1: 文字/錄音/錄影/情緒 2: DASS/ASRM
   * @param dataType 0: Text#	1: Speech# 2: Emoji# 3: Video# 5: Get up time 
   *                 1: DASS scale 2: ASRM scale
   */
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
    if (data.reloadData) {
      this.loadDailyRecordData();
    }
    console.log(data);
  }
  /**
   * 依照檔名播放錄音/錄影檔
   * @param fileName 檔案名稱(*.wav/*.mp4)
   */
  playMedia(fileName) {
    console.log(fileName);
    this.streamingMedia.playVideo(`${this.baseUrl}/SelectInfAv.php?fileP=${fileName}`, this.options);
  }
  /**
   * 依類別開啟Google 表單量表
   * @param type 7: ASRM, 6: DASS
   */
  showGoogleForm(type) {
    const newData: InsertNewDataModel = {
      // Account: '',//this.userService.userInfo.Account,
      type: type === 'ASRM' ? '7' : '6',
      time: moment().format('YYYY-MM-DD+HH:mm:ss'),
      content: type === 'ASRM' ? 'SCL2' : 'SCL1',
      object_Anger: 0,
      object_Anxiety: 0,
      object_Boredom: 0,
      object_Disgust: 0,
      object_Happiness: 0,
      object_Sadness: 0,
      object_Surprised: 0
    };
    this.dailyRecordService.showGoogleForm(newData)
      .subscribe({
        next: (res) => {
          // do nothing...
          this.loadDailyRecordData();
        }
      });
  }

  getFabBtnColor(typeCodes) {
    // console.log(fabBtn);
    let res = true;
    typeCodes.forEach(element => {
      res = res && this.dailyGoal[element] != null && +this.dailyGoal[element] > 0;
    });
    console.log(res, typeCodes);
    return res ? 'tertiary' : 'medium';
  }
}
