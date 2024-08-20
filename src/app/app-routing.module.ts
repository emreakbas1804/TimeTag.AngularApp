import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './Home/index/index.component';
import { RegisterComponent } from './Home/register/register.component';
import { LoginComponent } from './Home/login/login.component';
import { IndexComponent as PanelIndexComponent } from './Panel/index/index.component';
import { PanelGuard } from './Panel/panel.guard';
import { AddCompanyComponent } from './Panel/Company/add-company/add-company.component';
import { MyCompaniesComponent } from './Panel/Company/my-companies/my-companies.component';
import { EditCompanyComponent } from './Panel/Company/edit-company/edit-company.component';
import { AddDepartmentComponent } from './Panel/Department/add-department/add-department.component';
import { MyDepartmentsComponent } from './Panel/Department/my-departments/my-departments.component';
import { EditDepartmentComponent } from './Panel/Department/edit-department/edit-department.component';
import { AddEmployeeComponent } from './Panel/Employee/add-employee/add-employee.component';
import { MyEmployeesComponent } from './Panel/Employee/my-employees/my-employees.component';
import { EmployeeDetailComponent } from './Panel/Employee/employee-detail/employee-detail.component';
import { BankAccountsComponent } from './Panel/Employee/bank-accounts/bank-accounts.component';
import { TimeLogsComponent } from './Panel/Employee/time-logs/time-logs.component';
import { ProfileComponent } from './Panel/profile/profile.component';
import { ForgotPasswordComponent } from './Home/forgot-password/forgot-password.component';
import { EditTimeLogComponent } from './Panel/Employee/edit-time-log/edit-time-log.component';

const routes: Routes = [

  { path: "", component: IndexComponent },
  { path: "register", component: RegisterComponent },
  { path: "login", component: LoginComponent },
  { path: "forgot-password", component: ForgotPasswordComponent },
  { path: "panel", component: PanelIndexComponent, canActivate: [PanelGuard] },
  { path: "panel/add-company", component: AddCompanyComponent, canActivate: [PanelGuard] },
  { path: "panel/my-companies", component: MyCompaniesComponent, canActivate: [PanelGuard] },
  { path: "panel/edit-company/:Id:", component: EditCompanyComponent, canActivate: [PanelGuard] },
  { path: "panel/add-department", component: AddDepartmentComponent, canActivate: [PanelGuard] },
  { path: "panel/my-departments", component: MyDepartmentsComponent, canActivate: [PanelGuard] },
  { path: "panel/edit-department/:Id:", component: EditDepartmentComponent, canActivate: [PanelGuard] },
  { path: "panel/add-employee", component: AddEmployeeComponent, canActivate: [PanelGuard] },
  { path: "panel/my-employees", component: MyEmployeesComponent, canActivate: [PanelGuard] },
  { path: "panel/employee-detail/:Id:", component: EmployeeDetailComponent, canActivate: [PanelGuard] },
  { path: "panel/bank-accounts/:Id:", component: BankAccountsComponent, canActivate: [PanelGuard] },
  { path: "panel/logs/:Id:", component: TimeLogsComponent, canActivate: [PanelGuard] },
  { path: "panel/edit-log/:Id:", component: EditTimeLogComponent, canActivate: [PanelGuard] },
  { path: "panel/profile", component: ProfileComponent, canActivate: [PanelGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
