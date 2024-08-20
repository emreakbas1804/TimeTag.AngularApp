import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { Result } from 'src/app/Models/EntityResultModel';
import { SnackBarService } from 'src/app/Services/customService/snack-bar.service';
import { CompanyService } from 'src/app/Services/httpService/company.service';
import { EmployeeService } from 'src/app/Services/httpService/employee.service';
declare var $: any;
@Component({
  selector: 'app-my-employees',
  templateUrl: './my-employees.component.html',
  styleUrls: ['./my-employees.component.css']
})
export class MyEmployeesComponent implements OnInit {

  dataSourceList: any[] = [];
  displayedColumns: string[] = ["nameSurname", "phone", "departmentName", 'id',];
  dataSourcee = new MatTableDataSource<any>(this.dataSourceList);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  departments: any[] = [];
  selectedDepartment: any = 0;
  constructor(private employeeService: EmployeeService, private companyService: CompanyService, private snackBarService: SnackBarService) { }

  async ngOnInit(): Promise<void> {
    await this.getDepartments();
    $("#selectDepartment").select2();

    $('#selectDepartment').on('change', async (event: any) => {
      
      this.selectedDepartment = $("#selectDepartment").val();
      await this.getEmployees();

    });

    await this.getEmployees();
    this.dataSourcee.paginator = this.paginator;
  }


  async getEmployees() {
    var companyId = this.companyService.getCurrentCompany();
    const response = await firstValueFrom(this.employeeService.getEmployees(companyId, this.selectedDepartment));
    if (response.result == Result.Success) {

      this.dataSourceList = response.resultObject.map((item: { id: any, nameSurname: any, phone: any, departmentName: any }) => ({
        nameSurname: item.nameSurname,
        id: item.id,
        phone: item.phone,
        departmentName: item.departmentName        
      }
      ));
      this.dataSourcee.data = this.dataSourceList;
    }

  }

  async getDepartments() {
    var companyId = this.companyService.getCurrentCompany();
    const response = await firstValueFrom(this.companyService.getDepartments(companyId));
    if (response.result == Result.Success) {

      this.departments = response.resultObject.map((item: { id: any, name: any }) => ({
        name: item.name,
        id: item.id,
      }
      ));
    }

  }

}

