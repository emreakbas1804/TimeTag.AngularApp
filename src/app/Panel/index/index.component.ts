import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { EntityResultModel } from 'src/app/Models/EntityResultModel';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.css'],
})
export class IndexComponent implements OnInit {
    dashboardResults: any;

    constructor(private http: HttpClient) {}

    async ngOnInit(): Promise<void> {
        await this.getDashboardResults();
    }

    async getDashboardResults(): Promise<void> {
        try {
            const response = await this.http.get<EntityResultModel>(`${environment.apiUrl}/Common/GetDashboardResults`).toPromise();
            this.dashboardResults = response?.ResultObject;
        } catch (error) {
            console.error('Error fetching dashboard results:', error);
        }
    }
}
