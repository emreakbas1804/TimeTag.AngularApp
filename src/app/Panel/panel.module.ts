import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { SharedModule } from '../Shared/shared.module';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileComponent } from './profile/profile.component';
import { UserComponent } from './user/user.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TimeLogComponent } from './time-log/time-log.component';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BankComponent } from './bank/bank.component';
import { PublicHolidayComponent } from './public-holiday/public-holiday.component';
import { ReportComponent } from './report/report.component';

@NgModule({
    providers: [{ provide: MAT_DATE_LOCALE, useValue: 'tr-TR' }, DatePipe],
    declarations: [IndexComponent, ProfileComponent, UserComponent, TimeLogComponent, BankComponent, PublicHolidayComponent, ReportComponent],
    imports: [
        BrowserAnimationsModule, // mutlaka gerekli!
        BsDatepickerModule.forRoot(),
        TimepickerModule,
        TimepickerModule.forRoot(),
        CommonModule,
        SharedModule,
        NgxMaterialTimepickerModule.setOpts('format', '24h'),
        FormsModule,
        RouterModule,
        MatTableModule,
        MatPaginatorModule,
        MatSnackBarModule,
        TranslateModule,
    ],
})
export class PanelModule {}
