import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CompanyService } from 'src/app/Services/httpService/company.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { Result } from 'src/app/Models/EntityResultModel';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-my-companies',
  templateUrl: './my-companies.component.html',
  styleUrls: ['./my-companies.component.css'],
  // encapsulation: ViewEncapsulation.None  // we did this for work the material code in this component
})


export class MyCompaniesComponent implements OnInit {

  dataSourceList: any[] = [];

  displayedColumns: string[] = ["title" , "recordCreateTime", "imageUrl",'id',];
  dataSourcee = new MatTableDataSource<any>(this.dataSourceList);

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;


  constructor(private companyService: CompanyService) { }
  private readonly cdnUrl = environment.cdnUrl;
  async ngOnInit(): Promise<void> {    
    await this.getCompanies();
    this.dataSourcee.paginator = this.paginator;
  }

  async getCompanies() {
    const response = await firstValueFrom(this.companyService.getCompanies());
    if (response.result == Result.Success) {
      
      this.dataSourceList = response.resultObject.map((item: { id : any, imageUrl : any, recordCreateTime : Date, title: any, }) => ({
         title: item.title,
          id: item.id ,
          imageUrl : item.imageUrl !== null ? this.cdnUrl + item.imageUrl : null,
          recordCreateTime : item.recordCreateTime}
        ));
      this.dataSourcee.data = this.dataSourceList; // dataSourcee.data'ya verileri set et
    }

  }

}
