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

  companies: any[] = [];
  selectedCompany: any = 0;
  employeeCount = 0;
  departmentCount = 0;
  startDate : any;
  endDate : any;
  page : any = 1;
  count : any = 5;
  logLenght : any = null;
  dataSourceList: any[] = [];
  displayedColumns: string[] = ["nameSurname", "processTime", "type"];
  dataSourcee = new MatTableDataSource<any>(this.dataSourceList);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  async ngOnInit(): Promise<void> {
    await this.getCompanies();

    $("#selectCompany").select2();
    if (this.companyService.getCurrentCompany() == null) {
      this.selectedCompany = this.companies[0]?.id;
      if (this.selectedCompany != undefined && this.selectedCompany != 0) {
        this.companyService.setCurrentCompany(this.selectedCompany);
      }
    } else {
      this.selectedCompany = parseInt(this.companyService.getCurrentCompany()!);
    }
    if (this.selectedCompany != 0 && this.selectedCompany != undefined) {
      $('#selectCompany option[value="0"]').prop("disabled", true);
    }

    $('#selectCompany').on('change', async (event: any) => {
      if ($("#selectCompany").val() != 0) {
        this.companyService.setCurrentCompany($("#selectCompany").val());
        this.selectedCompany = $("#selectCompany").val();
        await this.getDepartmentsCount();
        await this.getEmployeesCount();
      }
    });

    await this.getDepartmentsCount();
    await this.getEmployeesCount();
    await this.getTimeLogs();
  }
  


  async getCompanies() {
    const response = await firstValueFrom(this.companyService.getCompanies());
    if (response.result == Result.Success) {
      this.companies = response.resultObject.map((item: { title: any; id: number; }) => ({ title: item.title, id: item.id }));
    }

  }

  async getDepartmentsCount() {
    const response = await firstValueFrom(this.companyService.getDepartmentsCount(this.selectedCompany));
    if (response.result == Result.Success) {
      this.departmentCount = parseInt(response.resultObject);
    }
  }

  async getEmployeesCount() {
    const response = await firstValueFrom(this.employeeService.getEmployeesCount(this.selectedCompany));
    if (response.result == Result.Success) {
      this.employeeCount = response.resultObject;
    }
  }

  async getTimeLogs(startDate? : any, endDate? : any) {  
    this.startDate = startDate != undefined ? startDate : null;
    this.endDate = endDate != undefined ? endDate : null;
    const response = await firstValueFrom(this.employeeService.getCurrentEmployeeTimeLogs(this.startDate, this.endDate, this.page, this.count));    
    if (response.result == Result.Success) {

      this.dataSourceList = response.resultObject?.logDetails.map((item: { nameSurname: any, processTime: any, type: any, isLatedToJob :any }) => ({
        nameSurname: item.nameSurname,
        processTime: item.processTime,
        type : item.type,
        isLatedToJob : item.isLatedToJob,             
      }
      ));
      this.logLenght = response.resultObject?.totalCount;
      this.dataSourcee.data = this.dataSourceList;
    }

  }

  async changedPage(event: any) {           
    this.page = event.pageIndex + 1;
    this.count = event.pageSize;
    await this.getTimeLogs();
  }




}
