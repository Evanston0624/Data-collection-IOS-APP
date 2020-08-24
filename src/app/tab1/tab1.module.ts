import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { VideoEditor } from '@ionic-native/video-editor/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { ScrollHideDirective } from '../components/scroll-hide.directive';
import { SearchFilterPipe } from '../services/searchFilter.pipe';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule
  ],
  declarations: [Tab1Page, SearchFilterPipe, ScrollHideDirective],
  providers: [StreamingMedia, MediaCapture, VideoEditor, FileTransfer, File]
})
export class Tab1PageModule {}
