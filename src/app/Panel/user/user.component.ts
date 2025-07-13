import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import 'datatables.net-dt';
import { environment } from 'src/environments/environment';
import { EntityResultModel, ExportType, FormMode, Result, UserRole } from 'src/app/Models/EntityResultModel';
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
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit, AfterViewInit {
    dataTable: any;
    modalTitle: string = '';
    modalMode: FormMode | null = null;
    FormMode = FormMode;
    ExportType = ExportType;
    user: any = {};
    cardList: any;
    modalInstance: any;
    datepickerConfig: Partial<BsDatepickerConfig> | undefined;
    canAdd: boolean = false;
    canUpdate: boolean = false;
    canView: boolean = false;
    isLoading = false;
    activeUserRole: UserRole | null = null;
    constructor(private http: HttpClient, private snackBarService: SnackBarService, private translateService: TranslateService, private datePipe: DatePipe, private accountService: AccountService) {
        this.datepickerConfig = {
            dateInputFormat: 'DD/MM/YYYY',
            containerClass: 'theme-blue',
            showWeekNumbers: false,
            isAnimated: true,
        };
    }

    ngOnInit(): void {
        this.fPopulateCardList();
        this.canAdd = this.accountService.canAdd();
        this.canUpdate = this.accountService.canUpdate();
        this.canView = this.accountService.canView();
        this.activeUserRole = this.accountService.activeUserRole();
    }

    ngAfterViewInit() {
        this.translateService.get(['User.Name', 'User.Title', 'User.Email', 'User.Phone', 'User.StartTime', 'User.EndTime', 'User.HireDate', 'Common.Action']).subscribe(translations => {
            this.initDataTable(translations);
        });
    }

    fPopulateCardList(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<any>(`${environment.apiUrl}/Common/PopulateCardList`).subscribe({
                next: response => {
                    this.cardList = response.ResultObject;
                    resolve();
                },
                error: err => {
                    reject(err);
                },
            });
        });
    }

    viewUser(id: number, action: string): void {
        this.modalTitle = action;
        this.modalMode = FormMode.View;
        this.get(id).then(() => {
            this.openModal();
        });
    }

    addOrUpdateUser(id: number, action: string): void {
        this.modalTitle = action;
        this.modalMode = FormMode.AddOrUpdate;
        this.get(id).then(() => {
            this.openModal();
        });
    }

    get(recordId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<any>(`${environment.apiUrl}/User/Get?recordId=${recordId}`).subscribe({
                next: response => {
                    this.user = response.ResultObject;

                    Object.keys(this.user).forEach(key => {
                        const val = this.user[key];
                        if (val && typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
                            this.user[key] = new Date(val);
                        }
                    });

                    if (recordId === 0) {
                        $('#rlt_Card_Id').prop('disabled', false);
                        this.user.rlt_Card_Id = '';
                    } else {
                        $('#rlt_Card_Id').prop('disabled', true);
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

                for (const key in this.user) {
                    if (this.user.hasOwnProperty(key) && this.user[key] !== null && this.user[key] !== undefined) {
                        if (this.user[key] instanceof Date) {
                            formData.append(key, this.user[key].toISOString());
                        } else {
                            formData.append(key, this.user[key]);
                        }
                    }
                }

                this.http.post<EntityResultModel>(`${environment.apiUrl}/User/post`, formData).subscribe({
                    next: (response: EntityResultModel) => {
                        if (response.Result == Result.Success) {
                            this.snackBarService.success(this.translateService.instant('Common.Success'));
                            this.closeModal();
                            this.reloadTable();
                        } else {
                            this.snackBarService.error(response.ResultMessage);
                        }
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
            p_sKeyword: ($('#txtKeyword').val() as string) || '',
        };
    }

    initDataTable(translations: any): void {
        this.dataTable = $('#tblUserList').DataTable({
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

                this.http.post(`${environment.apiUrl}/User/List`, formData).subscribe({
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
                { data: 'FullName', title: translations['User.Name'] },
                { data: 'Title', title: translations['User.Title'] },
                { data: 'Email', title: translations['User.Email'] },
                { data: 'Phone', title: translations['User.Phone'] },
                {
                    data: 'StartTime',
                    title: translations['User.StartTime'],
                    render: (data: any, type: any, row: any) => row.StartTimeText,
                },
                {
                    data: 'EndTime',
                    title: translations['User.EndTime'],
                    render: (data: any, type: any, row: any) => row.EndTimeText,
                },
                {
                    data: 'HireDate',
                    title: translations['User.HireDate'],
                    render: (data: any, type: any, row: any) => row.HireDateText,
                },
                {
                    title: translations['Common.Action'],
                    orderable: false,
                    className: 'action-buttons-cell',
                    render: (data: any, type: any, row: any) => {
                        let btns = `<button class="btn btn-sm btn-success view" data-id="${row.Id}" data-mode="View">
                                        <i class="bi bi-eye"></i> View
                                    </button>`;
                        if (this.activeUserRole == UserRole.CompanyOwner || this.activeUserRole == UserRole.SystemManager) {
                            btns += `<button class="btn btn-sm btn-warning edit" data-id="${row.Id}" data-mode="Update">
                                        <i class="bi bi-pencil"></i> Edit
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
                        this.viewUser(data.Id, 'View User');
                    });
                $(row)
                    .find('.edit')
                    .on('click', () => {
                        this.addOrUpdateUser(data.Id, 'Update User');
                    });
            },
        });
    }

    filterChange(): void {
        this.reloadTable();
    }

    resetFilters(tableId: string): void {
        $('.filter').val('');
        this.reloadTable();
    }

    exportUserList(format: ExportType): void {
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

        const url = `${environment.apiUrl}/User/ExportData`;

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
