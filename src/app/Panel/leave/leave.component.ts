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
    selector: 'app-leave',
    templateUrl: './leave.component.html',
    styleUrls: ['./leave.component.css'],
})
export class LeaveComponent implements OnInit {
    dataTable: any;
    modalTitle: string = '';
    modalMode: FormMode | null = null;
    FormMode = FormMode;
    ExportType = ExportType;
    leave: any = {};
    userList: any;
    modalInstance: any;
    datepickerConfig: Partial<BsDatepickerConfig> | undefined;
    canAdd: boolean = false;
    canUpdate: boolean = false;
    canView: boolean = false;
    UserRole = UserRole;
    activeUserRole: UserRole | null = null;
    isLoading: boolean = false;
    keywordFilter: string = '';
    selectedUserIdFilter: any | null = '';
    submitType: 'draft' | 'submit' | null = null;
    activeUserId: number | null = 0;
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
        this.activeUserId = this.accountService.activeUserId();
    }

    ngAfterViewInit() {
        this.translateService.get(['Leave.Name', 'Leave.Email', 'Leave.Type', 'Leave.StartDate', 'Leave.EndDate', 'Leave.Status', 'Common.Action']).subscribe(translations => {
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

    viewLeave(id: number, action: string): void {
        this.modalTitle = action;
        this.modalMode = FormMode.View;
        this.get(id).then(() => {
            this.openModal();
        });
    }

    addOrUpdateLeave(id: number, action: string): void {
        this.modalTitle = action;
        this.modalMode = FormMode.AddOrUpdate;
        this.get(id).then(() => {
            this.openModal();
        });
    }

    get(recordId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<any>(`${environment.apiUrl}/Leave/Get?recordId=${recordId}`).subscribe({
                next: response => {
                    var resultData = response.ResultObject;
                    this.leave = resultData;

                    if (recordId === 0) {
                        this.leave.Type = '';
                        this.leave.StartDate = null;
                        this.leave.EndDate = null;
                    } else {
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

                for (const key in this.leave) {
                    if (this.leave.hasOwnProperty(key) && this.leave[key] !== null && this.leave[key] !== undefined) {
                        if (this.leave[key] instanceof Date) {
                            formData.append(key, this.leave[key].toISOString());
                        } else {
                            formData.append(key, this.leave[key]);
                        }
                    }
                }
                if (this.submitType == 'submit') {
                    formData.append('isSubmit', 'true');
                }

                this.http.post(`${environment.apiUrl}/Leave/post`, formData).subscribe({
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
        return {
            p_sKeyword: this.keywordFilter,
            userId: this.selectedUserIdFilter,
        };
    }

    initDataTable(translations: any): void {
        this.dataTable = $('#tblLeaveList').DataTable({
            processing: true,
            serverSide: true,
            searching: false,
            ordering: true,
            orderMulti: false,
            order: [[1, 'asc']],
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

                    this.http.post(`${environment.apiUrl}/Leave/List`, formData).subscribe({
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
                { data: 'FullName', title: translations['Leave.Name'] },
                { data: 'Email', title: translations['Leave.Email'] },
                {
                    data: 'Type',
                    title: translations['Leave.Type'],
                    render: (data: any, type: any, row: any) => row.TypeText,
                },
                {
                    data: 'StartDate',
                    title: translations['Leave.StartDate'],
                    render: (data: any, type: any, row: any) => row.StartDateText,
                },
                {
                    data: 'EndDate',
                    title: translations['Leave.EndDate'],
                    render: (data: any, type: any, row: any) => row.EndDateText,
                },
                {
                    data: 'Status',
                    title: translations['Leave.Status'],
                    render: (data: any, type: any, row: any) => row.StatusText,
                },
                {
                    title: translations['Common.Action'],
                    orderable: false,
                    className: 'action-buttons-cell',
                    render: (data: any, type: any, row: any) => {
                        let btns = `<button class="btn btn-sm btn-success view" data-id="${row.Id}" data-mode="View">
                          <i class="bi bi-eye"></i> View
                        </button>`;
                        debugger;
                        if (this.activeUserId == row.UserId && row.Status == '0')
                            btns += `<button class="btn btn-sm btn-warning edit" data-id="${row.Id}" data-mode="Update">
                              <i class="bi bi-pencil"></i> Edit
                            </button>`;

                        if ((this.activeUserRole == UserRole.CompanyOwner || this.activeUserRole == UserRole.SystemManager) && row.Status == '3') {
                            btns += `<button class="btn btn-sm btn-primary approve" data-id="${row.Id}" data-mode="Update">
            <i class="bi bi-check-circle"></i> Approve
         </button>`;

                            btns += `<button class="btn btn-sm btn-danger reject" data-id="${row.Id}" data-mode="Update">
            <i class="bi bi-x-circle"></i> Reject
         </button>`;
                        }
                        return btns;
                    },
                },
            ],
            rowCallback: (row: any, data: any) => {
                $(row)
                    .find('.view')
                    .on('click', () => {
                        this.viewLeave(data.Id, 'View Leave');
                    });
                $(row)
                    .find('.edit')
                    .on('click', () => {
                        this.addOrUpdateLeave(data.Id, 'Update Leave');
                    });

                $(row)
                    .find('.approve')
                    .on('click', () => {
                        this.changeRecordStatus(data.Id, 1);
                    });

                $(row)
                    .find('.reject')
                    .on('click', () => {
                        this.changeRecordStatus(data.Id, 2);
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

        this.reloadTable();
    }

    exportLeaveList(format: ExportType): void {
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

        const url = `${environment.apiUrl}/Leave/ExportData`;

        this.http.post(url, formData, { responseType: 'blob' }).subscribe(blob => {
            const objectUrl = URL.createObjectURL(blob);
            window.open(objectUrl, '_blank');
            this.isLoading = false;
        });
    }

    changeRecordStatus(recordId: number, status: number): void {
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
                formData.append('recordId', recordId.toString());
                formData.append('status', status.toString());

                this.http.post(`${environment.apiUrl}/Leave/ChangeRecordStatus`, formData).subscribe({
                    next: res => {
                        this.snackBarService.success(this.translateService.instant('Common.Success'));
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
