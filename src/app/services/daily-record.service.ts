/**
 * Daily Record Service 
 * Set or Update Data 
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ResponseInfoModel } from '../models/common.model';
import { CustomLoaderService } from './loader-operator.service';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class DailyRecordService {


  constructor(private http: HttpClient, private iab: InAppBrowser, private userService: UserService,
              private loaderService: CustomLoaderService) { }

  /**
   * 3.	上傳資料(text, speech, video, sleep time, scale, daily mood)
   * http://140.116.82.102:8080/apptext/InsertNewData.php?
   * Account=
   * &type=
   * &content=
   *   0: Text         = user input, 
   * 
   *   1: Speech       = yyyyMMdd-hh-mm-ss.wav, 
   *   3: Video        = yyyyMMdd-hh-mm-ss.mp4, 
   *
   *   2: Emoji        = '', 
   *   4: Daily mood   = 0-6,
   *
   *   5: Get up time  = yyyy-MM-dd+hh:mm, 
   *   8: Sleep time   = yyyy-MM-dd+hh:mm
   * 
   *   6: DAAS scale   = 'SCL1', 
   *   7: ASRM scale   = 'SCL2', 
   * &time             = current date time yyyy-MM-dd+hh:mm;ss
   * &object_Anger     = 0-3
   * &object_Boredom   = 0-3
   * &object_Disgust   = 0-3
   * &object_Anxiety   = 0-3
   * &object_Happiness = 0-3
   * &object_Sadness   = 0-3
   * &object_Surprised = 0-3
   * 
   * 語音: http://140.116.82.102:8080/app/SER/wav/
   * 影音: http://140.116.82.102:8080/app/upload_video/
   */
  setRecord({type, time, content, object_Anger, object_Boredom, object_Disgust,object_Anxiety, object_Happiness, object_Sadness, object_Surprised }) {
    const options = {
      params: {qaccount:'', type, time, content, object_Anger, object_Boredom,object_Anxiety, object_Disgust, object_Happiness, object_Sadness, object_Surprised }
    };
    return this.loaderService.getLoderService(this.http.get(`InsertNewData.php`, options)
               .pipe(map((response: ResponseInfoModel)=>response.success === 1)));
  }

  upadteRecord({type, time, content, object_Anger, object_Boredom, object_Disgust,object_Anxiety, object_Happiness, object_Sadness, object_Surprised }) {
    const options = {
      params: {qat:'', type, time, content, object_Anger, object_Boredom,object_Anxiety, object_Disgust, object_Happiness, object_Sadness, object_Surprised }
    };
    return this.loaderService.getLoderService(this.http.get(`UpdateDailyData.php`, options)
               .pipe(map((response: ResponseInfoModel)=>response.success === 1)));
  }

  /**
   * 12.	[GET]取得影音情緒資料(第一頁面的使用者回饋)
   * http://140.116.82.102:8080/apptext/SelectInfHistory.php?at=
   * (at)account=0-9^A-Z^a-z^_
   * 0:	Text#
   * 1: Speech#
   * 2: Emoji#
   * 3: Video#
   */
  getHistoryInfo() {
    const options = {
      params: {
        qat: ''
      }
    }
    return this.loaderService.getLoderService(this.http.get(`SelectInfHistory.php`, options));
  }
  /**
   * 依類型連結不同的google表單並回傳資料
   * @param newData 每日資料
   */
  showGoogleForm(newData) {
    const options : InAppBrowserOptions = {
      location : 'yes',//Or 'no' 
      hidden : 'no', //Or  'yes'
      clearcache : 'yes',
      clearsessioncache : 'yes',
      zoom : 'yes',//Android only ,shows browser zoom controls 
      hardwareback : 'yes',
      mediaPlaybackRequiresUserAction : 'no',
      shouldPauseOnSuspend : 'no', //Android only 
      closebuttoncaption : 'Close', //iOS only
      disallowoverscroll : 'no', //iOS only 
      toolbar : 'yes', //iOS only 
      enableViewportScale : 'no', //iOS only 
      allowInlineMediaPlayback : 'no',//iOS only 
      presentationstyle : 'pagesheet',//iOS only 
      fullscreen : 'yes',//Windows only    
    };
    // DASS or ASRM
    const url = newData.type === '7' ? 
                'https://docs.google.com/forms/d/e/1FAIpQLSePaLbHb9bmnFJ5DcGrh7q2DGS-3L28raYjkABYwgzJjfz6qQ/viewform?usp=pp_url&entry.105677866=' :
                'https://docs.google.com/forms/d/e/1FAIpQLSc4eCccuMyk71uN7DzLGFCZk6ZUYAmitylwKf70HdSeL-KxeA/viewform?entry.697311666=';
    let target = "_system";
    const browser = this.iab.create(`${url}${this.userService.userInfo.Account}`, target, options);
    // submit event data
    return this.setRecord(newData);
  }
}
