/**
 * Alert Service 
 * Alert or Confirm
 */

import { AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';

@Injectable()
export class AlertService {
  constructor(private alertCtrl: AlertController) { }
  /**
   * 依照傳入參數呈現 Alert
   * @param message Message Content
   * @param buttonsOption Buttons option of Alert
   * @param header Header Content
   */
  async presentAlert(message, buttonsOption?, header?) {
    if (!buttonsOption) {
      buttonsOption = ['知道了']
    }
    const alert = await this.alertCtrl.create({
      header: header,
      // subHeader: 'Subtitle',
      message: message,
      buttons: buttonsOption
    });

    await alert.present();
  }
  /**
   * Dismiss Alert
   */
  dismissAlert() {
    this.alertCtrl.dismiss();
  }
  /**
   * 依照傳入參數呈現Confirm Alert
   * @param message Message Content
   * @param buttonsOption Buttons option of Alert
   * @param header Header Content
   */
  async presentConfirm(message, buttonsOption?, header?) {
    if (!buttonsOption) {
      buttonsOption = [
        {
          text: '確定',
          cssClass: 'primary',
          handler: () => {
            console.log('Confirm Ok');
          }
        }, {
          text: '取消',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');

          }
        }
      ]
    }
    const confirm = await this.alertCtrl.create({
      header: header ? header : '',
      // subHeader: 'Subtitle',
      message: message,
      buttons: buttonsOption
    });

    await confirm.present();
  }
}