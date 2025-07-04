import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { SharedModule } from '../Shared/shared.module';
import { FormsModule } from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileComponent } from './profile/profile.component';
import { UserComponent } from './user/user.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  providers :[
    { provide: MAT_DATE_LOCALE, useValue: 'tr-TR' },
    DatePipe
  ],
  declarations: [
    IndexComponent,
    ProfileComponent,
    UserComponent
  ],
  imports: [
    BrowserAnimationsModule,         // mutlaka gerekli!
    BsDatepickerModule.forRoot(),
    CommonModule,
    SharedModule,
    NgxMaterialTimepickerModule.setOpts("format" , "24h"),    
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule,
    TranslateModule  
  ],
 
})
export class PanelModule { }
