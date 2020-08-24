import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PointsRedeemPageRoutingModule } from './points-redeem-routing.module';

import { PointsRedeemPage } from './points-redeem.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PointsRedeemPageRoutingModule
  ],
  declarations: [PointsRedeemPage]
})
export class PointsRedeemPageModule {}
