import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { Result } from 'src/app/Models/EntityResultModel';
import { CompanyService } from 'src/app/Services/httpService/company.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-departments',
  templateUrl: './my-departments.component.html',
  styleUrls: ['./my-departments.component.css']
})
export class MyDepartmentsComponent implements OnInit {
  
  dataSourceList: any[] = [];
  displayedColumns: string[] = ["name", "startJobTime","finishJobTime" ,'id',];
  dataSourcee = new MatTableDataSource<any>(this.dataSourceList);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private companyService: CompanyService) { }  
  
  
  async ngOnInit(): Promise<void> {
    await this.getDepartments();
    this.dataSourcee.paginator = this.paginator;    
  }

  async getDepartments() {
    var companyId = this.companyService.getCurrentCompany();
    const response = await firstValueFrom(this.companyService.getDepartments(companyId));
    if (response.result == Result.Success) {

      this.dataSourceList = response.resultObject.map((item: { id: any, name: any, startJobTime: Date, finishJobTime: any, }) => ({
        name: item.name,        
        id: item.id,        
        startJobTime : item.startJobTime,
        finishJobTime : item.finishJobTime
      }
      ));
      this.dataSourcee.data = this.dataSourceList; // dataSourcee.data'ya verileri set et
    }

  }
  
  

}
