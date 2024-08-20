import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Result } from 'src/app/Models/EntityResultModel';
import { SnackBarService } from 'src/app/Services/customService/snack-bar.service';
import { CompanyService } from 'src/app/Services/httpService/company.service';
import { EmployeeService } from 'src/app/Services/httpService/employee.service';

@Component({
  selector: 'app-time-logs',
  templateUrl: './time-logs.component.html',
  styleUrls: ['./time-logs.component.css']
})
export class TimeLogsComponent implements OnInit {

  dataSourceList: any[] = [];
  displayedColumns: string[] = ["nameSurname", "processTime", "type","id"];
  dataSourcee = new MatTableDataSource<any>(this.dataSourceList);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  departments: any[] = [];
  selectedDepartment: any = 0;
  employeeId : any = null;
  startDate : any = null;
  endDate : any = null;  
  page : any = 1;
  count : any = 5;
  logLenght : any = null;
  constructor(private employeeService: EmployeeService, private companyService: CompanyService, private snackBarService: SnackBarService, private router : Router) { }


  async ngOnInit(): Promise<void> {
    
    this.employeeId = this.router.url.split("/")[3];
    await this.getTimeLogs();
  }

  async getTimeLogs(startDate? : any, endDate? : any) {  
    this.startDate = startDate != undefined ? startDate : null;
    this.endDate = endDate != undefined ? endDate : null;
    const response = await firstValueFrom(this.employeeService.getTimeLogs(this.employeeId, this.startDate, this.endDate, this.page, this.count));    
    if (response.result == Result.Success) {

      this.dataSourceList = response.resultObject?.logDetails.map((item: { id : any,nameSurname: any, processTime: any, type: any, isLatedToJob :any }) => ({
        id : item.id,
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
