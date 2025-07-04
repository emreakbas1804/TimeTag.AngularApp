import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { EntityResultModel, Result } from 'src/app/Models/EntityResultModel';
import { CompanyService } from 'src/app/Services/httpService/company.service';
import { environment } from 'src/environments/environment';

declare var $: any;
@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class IndexComponent implements OnInit {
    constructor(private http: HttpClient) {}

    dashboardResults: any;

    ngOnInit(): void {
        this.GetDashboardResults();
    }

    GetDashboardResults() {
        this.http.get<EntityResultModel>(`${environment.apiUrl}/Common/GetDashboardResults`).subscribe({
            next: response => {
                this.dashboardResults = response.ResultObject;
            },
            error: err => {
                console.error(err);
            },
        });
    }
}
