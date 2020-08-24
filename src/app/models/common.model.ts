
/**
 * 0: Text#
 * 1: Speech#
 * 2: Emoji#
 * 3: Video#
 * 4: Daily mood
 * 5: Get up time
 * 6: DASS scale
 * 7: ASRM scale
 * 8: Sleep time
 */
export enum RecordDataType {
    Text = '0',
    Speech = '1',
    Emoji = '2',
    Video = '3',
    DailyMood = '4',
    GetUpTime = '5',
    DASSScale = '6',
    ASRMScale = '7',
    SleepTime = '8'
}

export interface ResponseInfoModel {
    success:number;
    data?:any;
}

export interface InsertNewDataModel {
    // Account:string;
    type:string;
    time:string;
    content:string;
    object_Anger:number;
    object_Boredom:number;
    object_Disgust:number;
    object_Anxiety:number;
    object_Happiness:number;
    object_Sadness:number;
    object_Surprised:number;
}