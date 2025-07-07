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

declare var $: any;
@Component({
    selector: 'app-public-holiday',
    templateUrl: './public-holiday.component.html',
    styleUrls: ['./public-holiday.component.css'],
})
export class PublicHolidayComponent implements OnInit {
    dataTable: any;
    modalTitle: string = '';
    modalMode: FormMode | null = null;
    FormMode = FormMode;
    ExportType = ExportType;
    publicHoliday: any = {};
    userList: any;
    modalInstance: any;
    datepickerConfig: Partial<BsDatepickerConfig> | undefined;
    canAdd: boolean = false;
    canUpdate: boolean = false;
    canView: boolean = false;
    activeUserRole: UserRole | null = null;
    isLoading = false;
    userAssignmentDataTable: any;
    selectedHolidayId: any;
    keywordFilter: any | null = null;
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
            .get(['PublicHoliday.Title', 'PublicHoliday.Description', 'PublicHoliday.StartDate', 'PublicHoliday.EndDate', 'Common.Status', 'Common.Action'])
            .subscribe(translations => {
                this.initDataTable(translations);
            });

        this.translateService.get(['PublicHoliday.User', 'Common.Action']).subscribe(translations => {
            this.initAssignUserDataTable(translations);
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

    viewPublicHoliday(id: number, action: string): void {
        this.modalTitle = action;
        this.modalMode = FormMode.View;
        this.get(id).then(() => {
            this.openModal('mdlForm');
        });
    }

    addOrUpdatePublicHoliday(id: number, action: string): void {
        this.modalTitle = action;
        this.modalMode = FormMode.AddOrUpdate;
        this.get(id).then(() => {
            this.openModal('mdlForm');
        });
    }
    changeStatus(id: number) {
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

                formData.append('recordId', id.toString());

                this.http.post(`${environment.apiUrl}/PublicHoliday/ChangeStatus`, formData).subscribe({
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

    assignUser(id: number) {
        this.selectedHolidayId = id;
        this.openModal('mdlAssignUser');
        this.reloadAssignmentUserDataTable();
    }

    get(recordId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<any>(`${environment.apiUrl}/PublicHoliday/Get?recordId=${recordId}`).subscribe({
                next: response => {
                    var resultData = response.ResultObject;
                    this.publicHoliday = resultData;

                    if (recordId === 0) {
                        this.publicHoliday.rlt_User_Id = '';
                        this.publicHoliday.Type = '';
                        this.publicHoliday.StartTime = '';
                        this.publicHoliday.EndTime = '';
                        this.publicHoliday.ProcessTime = '';
                    } else {
                        const pad = (n: number) => (n < 10 ? '0' + n : n.toString());

                        const date: Date = new Date(resultData.StartDate);
                        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

                        const date2: Date = new Date(resultData.EndDate);
                        const formatted2 = `${date2.getFullYear()}-${pad(date2.getMonth() + 1)}-${pad(date2.getDate())}T${pad(date2.getHours())}:${pad(date2.getMinutes())}`;

                        this.publicHoliday.StartDate = formatted;
                        this.publicHoliday.EndDate = formatted2;
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

                for (const key in this.publicHoliday) {
                    if (this.publicHoliday.hasOwnProperty(key) && this.publicHoliday[key] !== null && this.publicHoliday[key] !== undefined) {
                        if (this.publicHoliday[key] instanceof Date) {
                            formData.append(key, this.publicHoliday[key].toISOString());
                        } else {
                            formData.append(key, this.publicHoliday[key]);
                        }
                    }
                }

                this.http.post(`${environment.apiUrl}/PublicHoliday/post`, formData).subscribe({
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
            startDate: this.startDateFilter,
            endDate: this.endDateFilter,
        };

        return params;
    }

    initDataTable(translations: any): void {
        this.dataTable = $('#tblPublicHolidayList').DataTable({
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

                    this.http.post(`${environment.apiUrl}/PublicHoliday/List`, formData).subscribe({
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
                { data: 'Title', title: translations['PublicHoliday.Title'] },
                { data: 'Description', title: translations['PublicHoliday.Description'] },
                {
                    data: 'StartDate',
                    title: translations['PublicHoliday.StartDate'],
                    render: (data: any, type: any, row: any) => row.StartDateText,
                },
                {
                    data: 'EndDate',
                    title: translations['PublicHoliday.EndDate'],
                    render: (data: any, type: any, row: any) => row.EndDateText,
                },
                {
                    data: 'Status',
                    title: translations['Common.Status'],
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
                        if (this.activeUserRole == UserRole.CompanyOwner || UserRole.SystemManager) {
                            btns += `<button class="btn btn-sm btn-warning edit" data-id="${row.Id}" data-mode="Update">
                                      <i class="bi bi-pencil"></i> Edit
                                    </button>`;
                            if (row.Status == 1) {
                                // active
                                btns += `<button class="btn btn-sm btn-danger change-status" data-id="${row.Id}" data-mode="Update">
                                            <i class="bi bi-x-circle"></i> Inactivate
                                        </button>`;
                                btns += `<button class="btn btn-sm btn-primary assign-user" data-id="${row.Id}" data-mode="Update">
                                            <i class="bi bi-check-circle"></i> Assign User
                                        </button>`;
                            } else if (row.Status == 2) {
                                btns += `<button class="btn btn-sm btn-primary change-status" data-id="${row.Id}" data-mode="Update">
                                          <i class="bi bi-check-circle"></i> Activate
                                      </button>`;
                            }
                        }

                        return btns;
                    },
                },
            ],
            rowCallback: (row: any, data: any) => {
                $(row)
                    .find('.view')
                    .on('click', () => {
                        this.viewPublicHoliday(data.Id, 'View Public Holiday');
                    });
                $(row)
                    .find('.edit')
                    .on('click', () => {
                        this.addOrUpdatePublicHoliday(data.Id, 'Update Public Holiday');
                    });

                $(row)
                    .find('.change-status')
                    .on('click', () => {
                        this.changeStatus(data.Id);
                    });
                $(row)
                    .find('.assign-user')
                    .on('click', () => {
                        this.assignUser(data.Id);
                    });
            },
        });
    }

    filterChange(): void {
        this.reloadTable();
    }

    resetFilters(): void {
        this.keywordFilter = '';
        this.startDateFilter = null;
        this.endDateFilter = null;

        this.reloadTable();
    }

    exportPublicHolidayList(format: ExportType): void {
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

        const url = `${environment.apiUrl}/PublicHoliday/ExportData`;

        this.http.post(url, formData, { responseType: 'blob' }).subscribe(blob => {
            const objectUrl = URL.createObjectURL(blob);
            window.open(objectUrl, '_blank');
            this.isLoading = false;
        });
    }

    initAssignUserDataTable(translations: any): void {
        this.userAssignmentDataTable = $('#tblAssignUserList').DataTable({
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
                const formData = new FormData();
                for (const key in d) {
                    if (Object.prototype.hasOwnProperty.call(d, key)) {
                        formData.append(key, d[key]);
                    }
                }

                formData.append('publicHolidayId', this.selectedHolidayId);

                this.http.post(`${environment.apiUrl}/PublicHoliday/UserList`, formData).subscribe({
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
            },
            columns: [
                { data: 'FullName', title: translations['PublicHoliday.User'] },

                {
                    title: translations['Common.Action'],
                    orderable: false,
                    className: 'action-buttons-cell',
                    render: (data: any, type: any, row: any) => {
                        const checked = row.IsSelected ? 'checked' : '';
                        return `<input type="checkbox" ${checked} data-user-id="${row.Id}" class="form-check-input select-user" />`;
                    },
                },
            ],
            rowCallback: (row: any, data: any) => {
                $(row)
                    .find('.select-user')
                    .on('click', () => {
                        this.selectUser(data.Id);
                    });
            },
        });
    }
    selectUser(userId: number) {
        const formData = new FormData();
        formData.append('userId', userId.toString());
        formData.append('holidayId', this.selectedHolidayId.toString());

        this.http.post(`${environment.apiUrl}/PublicHoliday/AddOrRemoveUserAssignment`, formData).subscribe({
            next: res => {},
            error: err => {
                console.error('Error:', err);
                this.snackBarService.error('An error occurred.');
            },
        });
    }

    private openModal(modalId: string | null = 'mdlForm'): void {
        const modalEl = modalId ? document.getElementById(modalId) : null;
        if (!modalEl) {
            console.warn('Modal element not found!');
            return;
        }

        this.modalInstance = new (window as any).bootstrap.Modal(modalEl);

        this.modalInstance.show();
    }

    private closeModal(): void {
        if (this.modalInstance) {
            this.modalInstance.hide();
            this.modalInstance = null;
        }
    }
    private reloadTable(): void {
        if (this.dataTable) {
            this.dataTable.ajax.reload();
        }
    }
    private reloadAssignmentUserDataTable(): void {
        if (this.userAssignmentDataTable) {
            this.userAssignmentDataTable.ajax.reload();
        }
    }
}
