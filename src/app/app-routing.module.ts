import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './Home/index/index.component';
import { LoginComponent } from './Home/login/login.component';
import { IndexComponent as PanelIndexComponent } from './Panel/index/index.component';
import { PanelGuard } from './Panel/panel.guard';
import { ProfileComponent } from './Panel/profile/profile.component';
import { ForgotPasswordComponent } from './Home/forgot-password/forgot-password.component';
import { UserComponent } from './Panel/user/user.component';
import { TimeLogComponent } from './Panel/time-log/time-log.component';
import { BankComponent } from './Panel/bank/bank.component';
import { PublicHolidayComponent } from './Panel/public-holiday/public-holiday.component';

const routes: Routes = [
    { path: '', component: IndexComponent },
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'panel', component: PanelIndexComponent, canActivate: [PanelGuard] },
    { path: 'panel/user', component: UserComponent, canActivate: [PanelGuard] },
    { path: 'panel/profile', component: ProfileComponent, canActivate: [PanelGuard] },
    { path: 'panel/time-log', component: TimeLogComponent, canActivate: [PanelGuard] },
    { path: 'panel/bank', component: BankComponent, canActivate: [PanelGuard] },
    { path: 'panel/public-holiday', component: PublicHolidayComponent, canActivate: [PanelGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
