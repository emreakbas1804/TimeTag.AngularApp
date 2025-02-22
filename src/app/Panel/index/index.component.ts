import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { Result } from 'src/app/Models/EntityResultModel';
import { CompanyService } from 'src/app/Services/httpService/company.service';
import { EmployeeService } from 'src/app/Services/httpService/employee.service';
declare var $: any;
@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class IndexComponent implements OnInit {
  
  constructor(private companyService: CompanyService, private employeeService : EmployeeService) { }


  employeeCount = 0;
  departmentCount = 0;
  companyId = 0;
  
  async ngOnInit(): Promise<void> {
    
    var response = await this.companyService.getCompanyIdActiveUser().toPromise();
    debugger
    this.companyId = response?.resultObject;

    await this.companyService.setCurrentCompany(this.companyId);
    await this.getDepartmentsCount();
    await this.getEmployeesCount();
  }
  


  async getDepartmentsCount() {
    const response = await firstValueFrom(this.companyService.getDepartmentsCount(this.companyId));
    if (response.result == Result.Success) {
      this.departmentCount = parseInt(response.resultObject);
    }
  }

  async getEmployeesCount() {
    const response = await firstValueFrom(this.employeeService.getEmployeesCount(this.companyId));
    if (response.result == Result.Success) {
      this.employeeCount = response.resultObject;
    }
  }

}
