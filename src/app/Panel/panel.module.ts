import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AddCompanyComponent } from './Company/add-company/add-company.component';
import { IndexComponent } from './index/index.component';
import { SharedModule } from '../Shared/shared.module';
import { FormsModule } from '@angular/forms';
import { MyCompaniesComponent } from './Company/my-companies/my-companies.component';
import {MatTableModule} from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { EditCompanyComponent } from './Company/edit-company/edit-company.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AddDepartmentComponent } from './Department/add-department/add-department.component';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { MyDepartmentsComponent } from './Department/my-departments/my-departments.component';
import { EditDepartmentComponent } from './Department/edit-department/edit-department.component';
import { AddEmployeeComponent } from './Employee/add-employee/add-employee.component';
import { MyEmployeesComponent } from './Employee/my-employees/my-employees.component';
import { EmployeeDetailComponent } from './Employee/employee-detail/employee-detail.component';
import { BankAccountsComponent } from './Employee/bank-accounts/bank-accounts.component';
import { TimeLogsComponent } from './Employee/time-logs/time-logs.component';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileComponent } from './profile/profile.component';
import { EditTimeLogComponent } from './Employee/edit-time-log/edit-time-log.component';

@NgModule({
  providers :[
    { provide: MAT_DATE_LOCALE, useValue: 'tr-TR' },
    DatePipe
  ],
  declarations: [
    AddCompanyComponent,
    IndexComponent,
    MyCompaniesComponent,
    EditCompanyComponent,
    AddDepartmentComponent,
    MyDepartmentsComponent,
    EditDepartmentComponent,
    AddEmployeeComponent,
    MyEmployeesComponent,
    EmployeeDetailComponent,
    BankAccountsComponent,    
    TimeLogsComponent, ProfileComponent, EditTimeLogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgxMaterialTimepickerModule.setOpts("format" , "24h"),    
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule,
    CommonModule,
    TranslateModule  
  ],
 
})
export class PanelModule { }
