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
    selector: 'app-bank',
    templateUrl: './bank.component.html',
    styleUrls: ['./bank.component.css'],
})
export class BankComponent implements OnInit {
    dataTable: any;
    modalTitle: string = '';
    modalMode: FormMode | null = null;
    FormMode = FormMode;
    ExportType = ExportType;
    bank: any = {};
    userList: any;
    modalInstance: any;
    datepickerConfig: Partial<BsDatepickerConfig> | undefined;
    canAdd: boolean = false;
    canUpdate: boolean = false;
    canView: boolean = false;
    UserRole = UserRole;
    activeUserRole: UserRole | null = null;
    isLoading: boolean = false;

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
        this.translateService.get(['Bank.Name', 'Bank.Email', 'Bank.Phone', 'Bank.AccountTitle', 'Bank.OwnerName', 'Bank.Iban', 'Common.Action']).subscribe(translations => {
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

    viewBank(id: number, action: string): void {
        this.modalTitle = action;
        this.modalMode = FormMode.View;
        this.get(id).then(() => {
            this.openModal();
        });
    }

    addOrUpdateBank(id: number, action: string): void {
        this.modalTitle = action;
        this.modalMode = FormMode.AddOrUpdate;
        this.get(id).then(() => {
            this.openModal();
        });
    }

    get(recordId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<any>(`${environment.apiUrl}/Bank/Get?recordId=${recordId}`).subscribe({
                next: response => {
                    var resultData = response.ResultObject;
                    this.bank = resultData;

                    if (recordId === 0) {
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

                for (const key in this.bank) {
                    if (this.bank.hasOwnProperty(key) && this.bank[key] !== null && this.bank[key] !== undefined) {
                        if (this.bank[key] instanceof Date) {
                            formData.append(key, this.bank[key].toISOString());
                        } else {
                            formData.append(key, this.bank[key]);
                        }
                    }
                }

                this.http.post(`${environment.apiUrl}/Bank/post`, formData).subscribe({
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
            p_sKeyword: ($('#txtKeyword').val() as string) || '',
            userId: $('#BankUserFilter').val(),
        };
    }

    initDataTable(translations: any): void {
        this.dataTable = $('#tblBankList').DataTable({
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

                this.http.post(`${environment.apiUrl}/Bank/List`, formData).subscribe({
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
                { data: 'FullName', title: translations['Bank.Name'] },
                { data: 'Email', title: translations['Bank.Email'] },
                { data: 'Phone', title: translations['Bank.Phone'] },
                { data: 'Title', title: translations['Bank.AccountTitle'] },
                { data: 'OwnerName', title: translations['Bank.OwnerName'] },
                { data: 'Iban', title: translations['Bank.Iban'] },
                {
                    title: translations['Common.Action'],
                    orderable: false,
                    className: 'action-buttons-cell',
                    render: (data: any, type: any, row: any) => {
                        let btns = `<button class="btn btn-sm btn-success view" data-id="${row.Id}" data-mode="View">
                        <i class="bi bi-eye"></i> View
                      </button>`;
                        if (this.activeUserRole == UserRole.CompanyOwner || UserRole.SystemManager)
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
                        this.viewBank(data.Id, 'View Bank');
                    });
                $(row)
                    .find('.edit')
                    .on('click', () => {
                        this.addOrUpdateBank(data.Id, 'Update Bank');
                    });
            },
        });
    }

    filterChange(): void {
        this.reloadTable();
    }

    resetFilters(): void {
        $('.filter').val('');
        this.reloadTable();
    }

    exportBankList(format: ExportType): void {
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

        const url = `${environment.apiUrl}/Bank/ExportData`;

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
