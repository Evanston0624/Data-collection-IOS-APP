import { Component, OnInit, Input, ViewChild, AfterViewInit, OnDestroy, Inject } from '@angular/core';
import { ModalController, IonDatetime, IonTextarea } from '@ionic/angular';
import { InsertNewDataModel, ResponseInfoModel } from '../../models/common.model';
import * as moment from 'moment';
import { AlertService } from 'src/app/services/alert.service';
import { DailyRecordService } from '../../services/daily-record.service';
import { map, tap, takeUntil, filter, switchMap, max } from 'rxjs/operators';
import { combineLatest, Subject, from } from 'rxjs';
import { ChartService } from '../../services/chart.service';

import { VideoEditor } from '@ionic-native/video-editor/ngx';
import { FileTransfer, FileTransferObject, FileUploadOptions, FileUploadResult } from '@ionic-native/file-transfer/ngx';

// import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { MediaCapture, CaptureVideoOptions, MediaFile, CaptureAudioOptions } from '@ionic-native/media-capture/ngx';
import { File } from '@ionic-native/file/ngx';
import { CustomLoaderService } from '../../services/loader-operator.service';

// const MEDIA_FOLDER_NAME = 'my_media';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, AfterViewInit, OnDestroy {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  /**
   * emotion type, 0: 每日情緒、起床及睡眠時間, 1: 每日情緒標記(文字、錄音、錄影)
   */
  @Input() emotionType: number;
  /**
   * 資料類型
   * ==============
   * 0: Text#	     
   * 1: Speech#	   
   * 2: Emoji#	   
   * 3: Video#	  
   * ==============
   * 4: Daily mood
   * 5: Get up time
   * 8: Sleep time
   * ==============
   * 6: DASS scale
   * 7: ASRM scale
   */
  @Input() dataType: number;
  @ViewChild('datePicker') datePicker: IonDatetime;
  @ViewChild('timePicker') timePicker: IonDatetime;
  @ViewChild('inputTextArea') inputTextArea: IonTextarea;
  /**
   * 日期選單 Option
   */
  datePickerOptions = {
    backdropDismiss: false,
    buttons: [{
      text: '取消'
    }, {
      text: '昨天',
      handler: () => {
        this.setDateTime(1, 1);
      }
    }, {
      text: '今天',
      handler: () => {
        this.setDateTime(1);
      }
    }, {
      text: '確定',
      handler: (res) => {
        this.datePicker.value = `${res.year.text}-${res.month.text}-${res.day.text}`;
      }
    }]
  }
  /**
   * 時間選單 Option
   */
  timePickerOptions = {
    backdropDismiss: false,
    buttons: [{
      text: '取消'
    }, {
      text: '現在',
      handler: () => {
        this.setDateTime(2);
      }
    }, {
      text: '確定',
      handler: (res) => {
        this.timePicker.value = `${res.hour.text}:${res.minute.text}`;
      }
    }]
  }
  /**
   * 資料物件 Option
   */
  eventObject = {
    score: 3,
    text: '',
    audio: '',
    video: '',
    emoji: [{
      id: 'object_Anger',
      value: 0,
      title: '生氣',
      icon: 'assets/icon/emoji/angry.svg'
    }, {
      id: 'object_Boredom',
      value: 0,
      title: '無聊',
      icon: 'assets/icon/emoji/boring.svg'
    }, {
      id: 'object_Disgust',
      value: 0,
      title: '厭惡',
      icon: 'assets/icon/emoji/hate.svg'
    }, {
      id: 'object_Anxiety',
      value: 0,
      title: '焦慮',
      icon: 'assets/icon/emoji/nurvous.svg'
    }, {
      id: 'object_Happiness',
      value: 0,
      title: '開心',
      icon: 'assets/icon/emoji/happy.svg'
    }, {
      id: 'object_Sadness',
      value: 0,
      title: '難過',
      icon: 'assets/icon/emoji/cry.svg'
    }, {
      id: 'object_Surprised',
      value: 0,
      title: '驚訝',
      icon: 'assets/icon/emoji/surprise.svg'
    }]
  };
  /**
   * 本次要上傳的資料物件
   */
  newData: InsertNewDataModel;
  videoFilePath = '';
  dailyWorkExists = { dataType4: undefined, dataType5: undefined, dataType8: undefined };
  dailyWorkName = { dataType4: '每日情緒', dataType5: '起床時間', dataType8: '睡眠時間' };
  //confirmButtonClickedValue = 'C'; // I: Insert, U: Update, C: Cancel
  confirmButtonsOption = [
    {
      text: '更新資料',
      cssClass: 'primary',
      handler: () => {
        // this.confirmButtonClickedValue = 'U';
        this.doSubmitData(false);
        console.log('修改舊的');
      }
    }, {
      text: '新增一筆',
      cssClass: 'secondary',
      handler: () => {
        this.doSubmitData();
        // this.confirmButtonClickedValue = 'I';
        console.log('再傳一個');
      }
    }, {
      text: '取消',
      // cssClass: 'secondary',
      handler: () => {
        console.log('取消');
      }
    }
  ];
  /**
   * 設定日期/時間
   * @param type 0: 日期/時間, 1: 日期, 2:時間
   */
  private setDateTime(type, subtractDays = 0) {
    if (type === 1 || type === 0) {
      this.datePicker.value = moment().subtract(subtractDays, 'days').format('YYYY-MM-DD');
    }
    else if (type === 2 || type === 0) {
      this.timePicker.value = moment().format('HH:mm');
    }
  }
  /**
   * 依照傳入的資料(ResponseInfoModel)找出今天的最後一筆
   * @param res ResponseInfoModel
   */
  private findLatestRecord = (res: ResponseInfoModel) =>{
    // 當天4點以前算前一天
    const todayDateTime = moment().hours() >= 4 ? moment().format('YYYY-MM-DD 04:00:00') 
                                                : moment().subtract(1,'days').format('YYYY-MM-DD 04:00:00');
    if(res.success === 1) {
      const todayRecords = res.data.filter(x=>x.Datetime >= todayDateTime);
      if(todayRecords.length > 0) {
        return todayRecords.reduce((x,y)=> x.Datetime > y.Datetime ? x : y);
      }
    }
    return undefined;
  };
  //
  message = '';
  constructor(public modalController: ModalController, private alertService: AlertService,
    private dailyRecordService: DailyRecordService, private chartService: ChartService,
    private loaderService: CustomLoaderService,
    private mediaCapture: MediaCapture, private videoEditor: VideoEditor, 
    private file: File, private fileTransfer: FileTransfer, @Inject('API_URL') private baseUrl: string) { }
  ngAfterViewInit(): void {
    if (this.emotionType === 0) {
      this.setDateTime(1);
      //
      combineLatest(
        this.chartService.getChartInfo('1').pipe(
          map(this.findLatestRecord)
        ),
        this.chartService.getChartInfo('2').pipe(
          map(this.findLatestRecord)
        ),
        this.chartService.getChartInfo('3').pipe(
          map(this.findLatestRecord)
        ))
        .pipe(
          //tap(([respType1, respType2, respType3]) => console.log(respType1, respType2, respType3)),
          tap(([respType1, respType2, respType3])=>{
            this.dailyWorkExists = {
              dataType4: respType1,
              dataType8: respType2,
              dataType5: respType3
            };
            console.log(this.dailyWorkExists);
          }),
          takeUntil(this.destroyed$)
        ).subscribe();
    }
  }
  getDailyWorkValue(arr, key) {
    const reward = arr.filter(y => y[key]);
    if (reward.length > 0 && +reward[0][key] > 0) {
      //x.goal = reward[0][x.typeCode] > 0;
      return true;
    }
    return false;
  }
  ngOnInit() { }

  /**
   * emoji and daily emotion range change
   * @param id 0: daily emotion, other: emoji
   * @param $event 
   */
  rangeChange(id, $event) {
    // console.log(type, $event);
    if (id === 0) {
      this.eventObject.score = $event.detail.value;
    }
    else {
      this.eventObject.emoji.filter(x => x.id === id).map(x => x.value = $event.detail.value);
    }
  }

  async dismiss(reloadData=false, message?) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    // const modalData = this.emotionType === 0 ? this.eventObject : this.eventObject;
    if (message) {
      await this.alertService.presentAlert(message);
    }
    this.modalController.dismiss({
      reloadData: reloadData,
      message: message
    });
  }

  /**
   * 準備/檢核/上傳資料
   * @param submitType 0: daily emotion, 1: Get Up/ Sleep Datetime, 2: emoji
   */
  submitData(submitType) {
    let errorMessage = '';
    /* 
    0:	Text#	    5:	Get up time
    1:	Speech#	  6:	DASS scale
    2:	Emoji#	  7:	ASRM scale
    3:	Video#	  8:	Sleep time
    4:	Daily mood		
    */
    // let newData: InsertNewDataModel;
    this.newData = {
      type: this.dataType.toString(),
      time: moment().format('YYYY-MM-DD+HH:mm:ss'),
      content: '',
      object_Anger: 0,
      object_Anxiety: 0,
      object_Boredom: 0,
      object_Disgust: 0,
      object_Happiness: 0,
      object_Sadness: 0,
      object_Surprised: 0
    }
    //
    if (submitType === 0) {
      // 每日情緒
      this.newData.type = '4';
      this.newData.content = this.eventObject.score.toString();
    }
    // 檢核資料是否完整
    // 0: 文字/ 1: 聲音/ 2: 情緒/ 3: 影片/ 5: 起床時間/ 8: 睡眠
    else if (submitType === 2 || submitType === 1) {
      if (this.dataType === 0) { // 文字
        if (this.inputTextArea.value.trim().length === 0) {
          errorMessage = '文字內容不可空白';
        }
        else {
          this.newData.content = this.inputTextArea.value;
        }
      }
      else if (this.dataType === 1) { // 聲音
        if(this.eventObject.audio.trim().length === 0)
        {
          errorMessage = '還沒有錄音哦!!';
        }
      }
      // else if (this.dataType === 2) {
      //   // 情緒
      // }
      else if (this.dataType === 3) { // 影片
        if(this.eventObject.video.trim().length === 0)
        {
          errorMessage = '還沒有錄影哦!!';
        }
      }
      else if (this.dataType === 5 || this.dataType === 8) { // 起床時間 // 睡眠時間
        if (this.datePicker.value === undefined || this.timePicker.value === undefined) {
          errorMessage = '日期時間不可空白!!';
        }
        else{
          this.newData.content = `${this.datePicker.value}+${this.timePicker.value}`;
        }
      }
    }
    // 如有錯誤顯示訊息後離開
    if (errorMessage.trim().length > 0) {
      this.alertService.presentAlert(errorMessage);
      return; 
    }
    // 
    const emojiObject = this.eventObject.emoji.map(x => { return { [x.id]: x.value }; }).reduce((accum, val) => {
      Object.assign(accum, val);
      return accum;
    }, {})
    console.log({ ...this.newData, ...emojiObject });
    if (this.dailyWorkExists[`dataType${this.newData.type}`] !== undefined) {
      let confirmMessage = undefined;
      // 當天已有資料存在
      if(this.newData.type === '4') {
        confirmMessage = `今天己填寫過情緒資料 <br>
                          情緒分數為: ${this.dailyWorkExists.dataType4.write}<br>
                          要修改舊的或再傳一次呢?`;
      }
      else if(this.newData.type === '5') {
        confirmMessage = `今天己填寫過起床時間 <br>
                          起床時間為: ${this.dailyWorkExists.dataType5.write}<br>
                          要修改舊的或再傳一次呢?`;
      }
      else if(this.newData.type === '8') {
        confirmMessage = `今天己填寫過睡眠時間 <br>
                          睡眠時間時間為: ${this.dailyWorkExists.dataType8.write}<br>
                          要修改舊的或再傳一次呢?`;
      }
      if(!!confirmMessage){
        this.alertService.presentConfirm(confirmMessage, this.confirmButtonsOption);
      }
    }
    else {
      // 
      if(this.newData.type === '1' || this.newData.type === '3'){
        this.doUploadFileAndSubmitData();
      }
      else {
        this.doSubmitData();
      }
    }
  }
  /**
   * Submit an event data in type 
   * @param insertData is insert or not
   */
  doSubmitData(insertData = true) {
    // const reloadData = this.newData.type === '0' || this.newData.type === '1' || this.newData.type === '3';
    if(insertData){
      this.dailyRecordService.setRecord(this.newData).subscribe({
        next: (res) => {
          if (res) {
            this.dismiss(true,'儲存成功');
          }
          else {
            this.alertService.presentAlert('儲存失敗');
          }
        }
      });
    }
    else {
      // 如果更新資料為4: 每日情緒,5: 起床時間,8: 睡眠時間
      if (this.dailyWorkExists[`dataType${this.newData.type}`] !== undefined) {
        // 時間為要更新的那筆資料的時間
        this.newData.time = this.dailyWorkExists[`dataType${this.newData.type}`].Datetime;
      }
      this.dailyRecordService.upadteRecord(this.newData).subscribe({
        next: (res) => {
          if (res) {
            this.dismiss(false,'更新成功');
          }
          else {
            this.alertService.presentAlert('更新失敗');
          }
        }
      });
    }
  }
  /**
   * 上傳檔案及daily record
   */
  doUploadFileAndSubmitData() {
    let fileName = '';
    let apiName = '';
    // 如果類型是聲音
    if (this.newData.type === '1') {
      fileName = this.eventObject.audio;
      apiName = 'upload_mic.php';
    }
    // 如果類型是影片
    else if (this.newData.type === '3') {
      fileName = this.eventObject.video;
      apiName = 'upload_video.php';
    }
    // 取得上傳的媒體檔案名稱
    this.newData.content = fileName.substr(fileName.lastIndexOf('/') + 1);
    
    // 建立檔案上傳的Option
    const fileTransfer: FileTransferObject = this.fileTransfer.create();
    let options: FileUploadOptions = {
       fileKey: 'uploadedfile',
       fileName: this.newData.content,
       headers: {}
    }
    // 上傳檔案並switchMap setRecord
    this.message = `start upload media ${fileName}`;
    this.loaderService.getLoderService(
    from(fileTransfer.upload(`file://${fileName}`,`${this.baseUrl}/${apiName}`, options))
    .pipe(
      map((res: FileUploadResult)=>JSON.parse(res.response).success === 1),
      tap(mediaUploadResult=>{
        if(!mediaUploadResult){
          this.alertService.presentAlert('上傳影像失敗', undefined, '存檔作業')
        }
      }),
      filter(mediaUploadResult=>mediaUploadResult),
      switchMap((mediaUploadResult)=>{
        return this.dailyRecordService.setRecord(this.newData)
      })
    ), '影音檔及資料上傳中...請稍候')
    .subscribe({
      next: (res) => {
        if(res) {
          // this.alertService.presentAlert('存檔成功');
          this.dismiss(true,'更新成功');
        }
        else {
          this.alertService.presentAlert('存檔失敗!!!');
        }
      }
    });
  }

  /**
   * 睡覺及起床時間切換
   * @param $event 
   */
  segmentChanged($event) {
    this.dataType = +$event.detail.value;
    if (this.dataType === 5) {
      this.setDateTime(0);
    }
    else {
      this.setDateTime(1);
      this.timePicker.value = '';
    }
  }

  /**
   * 錄影及轉檔
   */
  recordVideo() {
    let options: CaptureVideoOptions = { limit: 1, quality: 0 };
    from(this.mediaCapture.captureVideo(options))
    .pipe(
      filter((data: MediaFile[])=>data.length > 0),
      map((data: MediaFile[])=>data[0].fullPath),
      tap((fullPath)=>{ this.message = `start trans video ${fullPath}`; }),
      switchMap((fullPath)=>{
        const transCodeOption = {
          fileUri: fullPath,
          outputFileName: moment().format('YYYYMMDD-HH-mm-ss'),
          outputFileType: this.videoEditor.OutputFileType.MPEG4
        };
        return this.loaderService.getLoderService(from(this.videoEditor.transcodeVideo(transCodeOption)),'影像處理中...請稍候!!')
      })
    ).subscribe({
      next: (fileUri) => {
        this.message = `trans video success ${fileUri}`;
        // 取得錄好且轉好檔的影像名稱
        this.eventObject.video = fileUri;
      },
      error: (error) => {
        if(error.message !== undefined){
          this.alertService.presentAlert(error.message,undefined, '錄影錯誤');
        }
      }
    });
  }

  /**
   * 錄音並修改檔名
   */
  recordAudio() {
    let options: CaptureAudioOptions = { limit: 1 };
    from(this.mediaCapture.captureAudio(options))
    .pipe(
      filter((data: MediaFile[])=>data.length > 0),
      map((data: MediaFile[])=>data[0].fullPath),
      switchMap((fileUri)=>{
        return this.copyFileToLocalDir(fileUri)
      })
    ).subscribe({
      next: (fileUri) => {
        // 取得錄好且轉好檔的聲音名稱
        this.eventObject.audio = fileUri;
      },
      error: (error)=>{
        console.log(error);
        this.alertService.presentAlert(`取得錄音檔失敗:${error}`)
      }
    });
  }
  /**
   * 修改檔名為 YYYYMMDD-HH-mm-ss
   */
  copyFileToLocalDir(fullPath) {
    let myPath = fullPath;
    // Make sure we copy from the right location
    if (fullPath.indexOf('file://') < 0) {
      myPath = 'file://' + fullPath;
    }
    const ext = myPath.split('.').pop();
    const d = moment().format('YYYYMMDD-HH-mm-ss');
    const newName = `${d}.${ext}`;
    const name = myPath.substr(myPath.lastIndexOf('/') + 1);
    const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
    // const copyTo = this.file.dataDirectory + MEDIA_FOLDER_NAME;
    console.log(copyFrom,  name, copyFrom, newName);
    return from(this.file.moveFile(copyFrom, name, copyFrom, newName)).pipe(
      map((success)=>{
        return `${copyFrom}/${newName}`;
      }));
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.destroyed$.next(true);
  }
}
