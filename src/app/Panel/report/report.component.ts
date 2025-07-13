import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import 'datatables.net-dt';
import { environment } from 'src/environments/environment';
import { ExportType, FormMode, UserRole } from 'src/app/Models/EntityResultModel';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { SnackBarService } from 'src/app/Services/customService/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'jquery-ui-dist/jquery-ui';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { AccountService } from 'src/app/Services/httpService/account.service';
@Component({
    selector: 'app-report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit {
    userList: any;
    isLoading: boolean = false;
    keywordFilter: string = '';
    dashboardResults: any | null = null;
    selectedUserIdFilter: any | null = '';
    UserRole = UserRole;
    activeUserRole: UserRole | null = null;
    statistics: any | null = null;

    constructor(private http: HttpClient, private snackBarService: SnackBarService, private translateService: TranslateService, private accountService: AccountService) {}

    ngOnInit(): void {
        this.fPopulateUserList();
        this.activeUserRole = this.accountService.activeUserRole();
        this.GetUserStatistics();
    }

    fPopulateUserList(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<any>(`${environment.apiUrl}/Common/PopulateUserList`).subscribe({
                next: response => {
                    this.userList = response.ResultObject;
                    resolve();
                },
                error: err => {
                    reject(err);
                },
            });
        });
    }

    GetUserStatistics(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<any>(`${environment.apiUrl}/Common/GetUserStatistics?userId=${this.selectedUserIdFilter}`).subscribe({
                next: response => {
                    this.statistics = response.ResultObject;
                    resolve();
                },
                error: err => {
                    reject(err);
                },
            });
        });
    }

    filterChange(): void {
        this.GetUserStatistics();
    }

    resetFilters(): void {
        this.keywordFilter = '';
        this.selectedUserIdFilter = '';
    }
}
