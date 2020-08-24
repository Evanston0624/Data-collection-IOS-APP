import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  }, {
    path: 'tabs', canLoad: [ AuthGuardService ],
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  }, {
    path: 'reg',
    loadChildren: () => import('./registration/registration.module').then( m => m.RegistrationPageModule)
  }, {
    path: 'redeem', canLoad: [ AuthGuardService ],
    loadChildren: () => import('./points-redeem/points-redeem.module').then( m => m.PointsRedeemPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
