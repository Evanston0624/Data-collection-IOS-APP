/**
 * 每日達成事項 Tab
 */

import { Component, OnInit } from '@angular/core';
import { RewardService } from '../services/reward.service';
import { map, tap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  rewardObject = [
    { seq: 1, typeCode: '', eventDTTM: '', title: '每日達成事項(每天清晨4點更新)', goal: true, goalDTTM: '' },
    { seq: 2, typeCode: 'data0', eventDTTM: '', title: '今天的情緒標記', goal: false, goalDTTM: '' },
    { seq: 3, typeCode: 'data1', eventDTTM: '', title: '今天的每日情緒', goal: false, goalDTTM: '' },
    { seq: 4, typeCode: 'data2', eventDTTM: '', title: '昨天的起床時間', goal: false, goalDTTM: '' },
    { seq: 5, typeCode: 'data3', eventDTTM: '', title: '昨天的睡覺時間', goal: false, goalDTTM: '' },
    { seq: 6, typeCode: 'data4', eventDTTM: '', title: '上週的DASS量表', goal: false, goalDTTM: '' },
    { seq: 7, typeCode: 'data5', eventDTTM: '', title: '上週的ASRM量表', goal: false, goalDTTM: '' }];
  awardObject = [
    { id: 'Pointnum', points: 0, goal: true, title: '目前累積點數(每天清晨4點~5點更新)' },
    { id: 'GPS1', points: 10, goal: true, title: '一週有GPS紀錄5天' },
    { id: 'GPS2', points: 10, goal: false, title: '一個月有GPS紀錄20天' },
    { id: 'GPS3', points: 15, goal: false, title: '一個月有GPS紀錄28天' },
    { id: 'GPS4', points: 25, goal: false, title: '兩個月有GPS紀錄55天' },
    { id: 'GPS5', points: 40, goal: false, title: '三個月有GPS紀錄80天' },

    { id: 'DES1', points: 5, goal: false, title: '每日情緒、睡眠紀錄1次' },
    { id: 'DES2', points: 20, goal: false, title: '每日情緒、睡眠一週紀錄5天' },
    { id: 'DES3', points: 30, goal: false, title: '每日情緒、睡眠一個月紀錄20天' },
    { id: 'DES4', points: 40, goal: false, title: '每日情緒、睡眠一個月紀錄28天' },
    { id: 'DES5', points: 70, goal: false, title: '每日情緒、睡眠兩個月紀錄55天' },
    { id: 'DES6', points: 100, goal: false, title: '每日情緒、睡眠三個月紀錄80天' },

    { id: 'EMO1', points: 5, goal: false, title: '聲音、影像情緒資訊記錄1次' },
    { id: 'EMO2', points: 20, goal: false, title: '聲音、影像達成一週紀錄5天' },
    { id: 'EMO3', points: 30, goal: false, title: '聲音、影像達成一個月紀錄20天' },
    { id: 'EMO4', points: 50, goal: false, title: '聲音、影像達成一個月紀錄28天' },
    { id: 'EMO5', points: 70, goal: false, title: '聲音、影像達成三個月紀錄55天' },
    { id: 'EMO6', points: 100, goal: false, title: '聲音、影像達成三個月紀錄80天' },

    { id: 'SCL1', points: 10, goal: false, title: '達成填寫1次每週的量表' },
    { id: 'SCL2', points: 15, goal: false, title: '達成一個月填寫每週的量表3次' },
    { id: 'SCL3', points: 25, goal: false, title: '達成兩個月填寫每週的量表10次' },
    { id: 'SCL4', points: 30, goal: false, title: '達成三個月填寫每週的量表12次' },

    { id: 'GES1', points: 20, goal: false, title: '達成一週GPS、每日記錄、隨時紀錄皆有5天。' },
    { id: 'GES2', points: 30, goal: false, title: '達成一個月GPS、每日記錄、隨時紀錄皆有20天' },
    { id: 'GES3', points: 40, goal: false, title: '達成一個月GPS、每日記錄、隨時紀錄皆有28天' },
    { id: 'GES4', points: 70, goal: false, title: '達成兩個月GPS、每日記錄、隨時紀錄皆有55天' },
    { id: 'GES5', points: 100, goal: false, title: '達成三個月GPS、每日記錄、隨時紀錄皆有80天' },

  ];
  constructor(private rewardService: RewardService,
              private userService: UserService) { }
  ngOnInit(): void {
    // this.loadData();
  }

  loadData() {
    forkJoin(
      this.rewardService.getDailyGoal(),
      this.userService.reloadAccountInfo(),
    ).pipe(
        map(([respDaily, userInfo]) => {
          // console.log([respDaily, userInfo]);
          return [
            respDaily.success === 1 ? respDaily.data : [],
            userInfo ? this.userService.userInfo : [],
          ];
        }),
        tap(([dataDaily, dataUser]) => {
          // 處理 每日達成資料
          dataDaily.map(x => {
            this.rewardObject.forEach(x => {
              const reward = dataDaily.filter(y => y[x.typeCode]);
              if (reward.length > 0) {
                x.goal = reward[0][x.typeCode] > 0;
              }
            });
          });
          // console.log(dataUser);
          // 處理 Point達成資料
          this.awardObject.forEach(element => {
            if (element.id === 'Pointnum') {
              element.points = +dataUser[element.id];
            }
            else {
              element.goal = dataUser[element.id] > 0;
            }
          });
        })
      ).subscribe();
  }

  ionViewDidEnter() {
    this.loadData();
    // console.log('on ionViewDidEnter');
  }
}
