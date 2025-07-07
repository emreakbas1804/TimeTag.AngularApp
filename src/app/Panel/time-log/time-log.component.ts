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
import { param } from 'jquery';

declare var $: any;
@Component({
    selector: 'app-time-log',
    templateUrl: './time-log.component.html',
    styleUrls: ['./time-log.component.css'],
})
export class TimeLogComponent implements OnInit {
    dataTable: any;
    modalTitle: string = '';
    modalMode: FormMode | null = null;
    FormMode = FormMode;
    ExportType = ExportType;
    timeLog: any = {};
    userList: any;
    modalInstance: any;
    datepickerConfig: Partial<BsDatepickerConfig> | undefined;
    canAdd: boolean = false;
    canUpdate: boolean = false;
    canView: boolean = false;
    activeUserRole: UserRole | null = null;
    isLoading = false;

    keywordFilter: string = '';
    selectedUserIdFilter: any | null = '';
    selectedLogTypeFilter: any | null = '';
    startDateFilter: Date | null = null;
    endDateFilter: Date | null = null;

    constructor(private http: HttpClient, private snackBarService: SnackBarService, private translateService: TranslateService, private datePipe: DatePipe, private accountService: AccountService) {
        this.datepickerConfig = {
            dateInputFormat: 'DD/MM/YYYY',
            containerClass: 'theme-blue',
            showWeekNumbers: false,
            isAnimated: true,
        };
    }

    ngOnInit(): void {
        this.fPopulateUserList();
        this.canAdd = this.accountService.canAdd();
        this.canUpdate = this.accountService.canUpdate();
        this.canView = this.accountService.canView();
        this.activeUserRole = this.accountService.activeUserRole();
    }

    ngAfterViewInit() {
        this.translateService
            .get(['TimeLog.Name', 'TimeLog.Email', 'TimeLog.Phone', 'TimeLog.StartTime', 'TimeLog.EndTime', 'TimeLog.ProcessTime', 'TimeLog.Type', 'Common.Action'])
            .subscribe(translations => {
                this.initDataTable(translations);
            });
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

    viewTimeLog(id: number, action: string): void {
        this.modalTitle = action;
        this.modalMode = FormMode.View;
        this.get(id).then(() => {
            this.openModal();
        });
    }

    addOrUpdateTimeLog(id: number, action: string): void {
        this.modalTitle = action;
        this.modalMode = FormMode.AddOrUpdate;
        this.get(id).then(() => {
            this.openModal();
        });
    }

    get(recordId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<any>(`${environment.apiUrl}/TimeLog/Get?recordId=${recordId}`).subscribe({
                next: response => {
                    var resultData = response.ResultObject;
                    this.timeLog = resultData;

                    Object.keys(this.timeLog).forEach(key => {
                        const val = this.timeLog[key];
                        if (val && typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
                            this.timeLog[key] = new Date(val);
                        }
                    });

                    if (recordId === 0) {
                        this.timeLog.rlt_User_Id = '';
                        this.timeLog.Type = '';
                        this.timeLog.StartTime = '';
                        this.timeLog.EndTime = '';
                        this.timeLog.ProcessTime = '';
                    } else {
                        const date: Date = new Date(resultData.ProcessTime);
                        const pad = (n: number) => (n < 10 ? '0' + n : n);
                        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

                        this.timeLog.ProcessTime = formatted;
                    }

                    resolve();
                },
                error: err => {
                    reject(err);
                },
            });
        });
    }

    fSubmitRecord(form: NgForm) {
        if (form.invalid) {
            this.snackBarService.error(this.translateService.instant('General.formValidationError'));
            return;
        }

        Swal.fire({
            title: this.translateService.instant('Common.Confirm'),
            text: this.translateService.instant('Common.AreYouSure'),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: this.translateService.instant('Common.Yes'),
            cancelButtonText: this.translateService.instant('Common.No'),
        }).then(result => {
            if (result.isConfirmed) {
                const formData = new FormData();

                for (const key in this.timeLog) {
                    if (this.timeLog.hasOwnProperty(key) && this.timeLog[key] !== null && this.timeLog[key] !== undefined) {
                        if (this.timeLog[key] instanceof Date) {
                            formData.append(key, this.timeLog[key].toISOString());
                        } else {
                            formData.append(key, this.timeLog[key]);
                        }
                    }
                }

                this.http.post(`${environment.apiUrl}/TimeLog/post`, formData).subscribe({
                    next: res => {
                        this.snackBarService.success(this.translateService.instant('Common.Success'));
                        this.closeModal();
                        this.reloadTable();
                    },
                    error: err => {
                        console.error('Error:', err);
                        this.snackBarService.error('An error occurred.');
                    },
                });
            }
        });
    }

    getDataTableParams(): any {
        var params = {
            p_sKeyword: this.keywordFilter,
            userId: this.selectedUserIdFilter,
            type: this.selectedLogTypeFilter,
            startDate: this.startDateFilter,
            endDate: this.endDateFilter,
        };

        return params;
    }

    initDataTable(translations: any): void {
        this.dataTable = $('#tblTimeLogList').DataTable({
            processing: true,
            serverSide: true,
            searching: false,
            ordering: true,
            orderMulti: false,
            order: [[5, 'desc']],
            lengthMenu: [
                [5, 10, 20, 50],
                [5, 10, 20, 50],
            ],
            ajax: (d: any, callback: any) => {
                setTimeout(() => {
                    const extraParams = this.getDataTableParams();
                    const formData = new FormData();
                    for (const key in d) {
                        if (Object.prototype.hasOwnProperty.call(d, key)) {
                            formData.append(key, d[key]);
                        }
                    }

                    for (const key in extraParams) {
                        if (Object.prototype.hasOwnProperty.call(extraParams, key)) {
                            formData.append(key, extraParams[key]);
                        }
                    }

                    this.http.post(`${environment.apiUrl}/TimeLog/List`, formData).subscribe({
                        next: (resp: any) => {
                            callback({
                                draw: d.draw,
                                recordsTotal: resp.recordsTotal,
                                recordsFiltered: resp.recordsFiltered,
                                data: resp.data,
                            });
                        },
                        error: err => {
                            console.error('DataTable error', err);
                        },
                    });
                }, 50);
            },
            columns: [
                { data: 'FullName', title: translations['TimeLog.Name'] },
                { data: 'Email', title: translations['TimeLog.Email'] },
                { data: 'Phone', title: translations['TimeLog.Phone'] },
                {
                    data: 'StartTime',
                    title: translations['TimeLog.StartTime'],
                    render: (data: any, type: any, row: any) => row.StartTimeText,
                },
                {
                    data: 'EndTime',
                    title: translations['TimeLog.EndTime'],
                    render: (data: any, type: any, row: any) => row.EndTimeText,
                },
                {
                    data: 'ProcessTime',
                    title: translations['TimeLog.ProcessTime'],
                    render: (data: any, type: any, row: any) => row.ProcessTimeText,
                },
                {
                    data: 'Type',
                    title: translations['TimeLog.Type'],
                    render: (data: any, type: any, row: any) => {
                        if (row.Type == 0) {
                            return `<span class="badge bg-success"> Login </span>`;
                        }

                        return `<span class="badge bg-danger"> Logout </span>`;
                    },
                },
                {
                    title: translations['Common.Action'],
                    orderable: false,
                    className: 'action-buttons-cell',
                    render: (data: any, type: any, row: any) => {
                        let btns = `<button class="btn btn-sm btn-success view" data-id="${row.Id}" data-mode="View">
                        <i class="bi bi-eye"></i> View
                      </button>`;

                        if (this.activeUserRole == UserRole.CompanyOwner || this.activeUserRole == UserRole.SystemManager)
                            btns += `<button class="btn btn-sm btn-warning edit" data-id="${row.Id}" data-mode="Update">
                            <i class="bi bi-pencil"></i> Edit
                            </button>`;

                        return btns;
                    },
                },
            ],
            rowCallback: (row: any, data: any) => {
                $(row)
                    .find('.view')
                    .on('click', () => {
                        this.viewTimeLog(data.Id, 'View TimeLog');
                    });
                $(row)
                    .find('.edit')
                    .on('click', () => {
                        this.addOrUpdateTimeLog(data.Id, 'Update TimeLog');
                    });
            },
        });
    }

    filterChange(): void {
        this.reloadTable();
    }

    resetFilters(): void {
        this.keywordFilter = '';
        this.selectedUserIdFilter = '';
        this.selectedLogTypeFilter = '';
        this.startDateFilter = null;
        this.endDateFilter = null;

        this.reloadTable();
    }

    exportTimeLogList(format: ExportType): void {
        this.isLoading = true;
        const params = this.getDataTableParams();

        const formData = new FormData();

        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                const value = params[key];
                formData.append(key, value != null ? value.toString() : '');
            }
        }

        formData.append('targetFormat', format.toString());

        const url = `${environment.apiUrl}/TimeLog/ExportData`;

        this.http.post(url, formData, { responseType: 'blob' }).subscribe(blob => {
            const objectUrl = URL.createObjectURL(blob);
            window.open(objectUrl, '_blank');
            this.isLoading = false;
        });
    }

    private openModal(): void {
        const modalEl = document.getElementById('mdlForm');
        if (!this.modalInstance) {
            this.modalInstance = new (window as any).bootstrap.Modal(modalEl);
        }
        this.modalInstance.show();
    }

    private closeModal(): void {
        if (this.modalInstance) {
            this.modalInstance.hide();
        }
    }
    private reloadTable(): void {
        if (this.dataTable) {
            this.dataTable.ajax.reload();
        }
    }
}
