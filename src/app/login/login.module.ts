import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { File } from '@ionic-native/file/ngx';
import { VideoEditor } from '@ionic-native/video-editor/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LoginPageRoutingModule
  ],
  providers: [
    // MediaCapture,
    // File,
    // VideoEditor,
    // StreamingMedia,
    // FileTransfer
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}
