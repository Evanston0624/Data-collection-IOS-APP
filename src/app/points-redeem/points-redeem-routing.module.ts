import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PointsRedeemPage } from './points-redeem.page';

const routes: Routes = [
  {
    path: '',
    component: PointsRedeemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PointsRedeemPageRoutingModule {}
