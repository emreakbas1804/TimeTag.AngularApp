import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import * as $ from 'jquery';
import 'datatables.net-dt'; 
import { environment } from 'src/environments/environment';
import { FormMode } from 'src/app/Models/EntityResultModel';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { SnackBarService } from 'src/app/Services/customService/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, AfterViewInit {

  dataTable: any;
  modalTitle: string = '';
  modalMode: FormMode | null = null;
  FormMode = FormMode;
  user: any = {};
  cardList :any ;
  modalInstance: any;

  constructor(private http: HttpClient,private snackBarService: SnackBarService,private translateService: TranslateService,) {
    
  }
  ngOnInit(): void {

    this.fPopulateCardList();
  }

  ngAfterViewInit(): void {
    this.initDataTable();
  }

  fPopulateCardList(): Promise<void> {
  return new Promise((resolve, reject) => {
    this.http.get<any>(`${environment.apiUrl}/Common/PopulateCardList`).subscribe({
      next: (response) => {
        this.cardList = response.ResultObject;        
        resolve();
      },
      error: (err) => {        
        reject(err);
      }
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
      next: (response) => {
        this.user = response.ResultObject;     
      if (recordId === 0) {
        $("#rlt_Card_Id").prop("disabled", false);
        this.user.rlt_Card_Id = ""; 
      } else {
        $("#rlt_Card_Id").prop("disabled", true);
      }
        resolve();
      },
      error: (err) => {        
        reject(err);
      }
    });
  });
}

  
fSubmitRecord(form: NgForm) {
  if (form.invalid) {
    this.snackBarService.error(this.translateService.instant("General.formValidationError"));
    return;
  }

  Swal.fire({
    title: this.translateService.instant("Common.Confirm"),
    text: this.translateService.instant("Common.AreYouSure"),
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: this.translateService.instant("Common.Yes"),
    cancelButtonText: this.translateService.instant("Common.No"),
  }).then((result) => {
    if (result.isConfirmed) {
      const formData = new FormData();

      for (const key in this.user) {
        if (this.user.hasOwnProperty(key) && this.user[key] !== null && this.user[key] !== undefined) {
          formData.append(key, this.user[key]);
        }
      }

      this.http.post(`${environment.apiUrl}/User/post`, formData).subscribe({
        next: (res) => {
          this.snackBarService.success(this.translateService.instant("Common.Success"));
          this.closeModal();
          this.reloadTable();
        },
        error: (err) => {
          console.error('Error:', err);
          this.snackBarService.error('An error occurred.');
        }
      });
    }
  });
}

 initDataTable(): void {
  this.dataTable = $('#tblUserList').DataTable({
    processing: true,
    serverSide: true,
    searching: false,
    ordering: true,
    orderMulti: false,
    order: [[1, 'asc']],
    lengthMenu: [[5, 10, 20, 50], [5, 10, 20, 50]],
    ajax: (d: any, callback: any) => {
      d.p_sKeyword = ($('#txtKeyword').val() as string) || '';
      $.ajax({
        url: environment.apiUrl + '/User/List',
        method: 'POST',
        data: d,
        success: (resp: any) => {
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: resp.data
          });
        },
        error: (err: any) => {
          console.error('DataTables AJAX error:', err);
        }
      });
    },
    columns: [
      { data: 'FullName', title: 'Full Name' },
      { data: 'Title', title: 'Title' },
      { data: 'Email', title: 'Email' },
      { data: 'Phone', title: 'Phone' },
      {
        data: 'StartTime',
        title: 'Start Time',
        
        render: (data: any, type: any, row: any) => row.StartTimeText
      },
       {
        data: 'EndTime',
        title: 'End Time',
        
        render: (data: any, type: any, row: any) => row.EndTimeText
      },
      {
        data: 'HireDate',
        title: 'Hire Date',
        
        render: (data: any, type: any, row: any) => row.HireDateText
      },
     {
  title: 'Action',
  orderable: false,
  className: 'action-buttons-cell',
  render: (data: any, type: any, row: any) => {
    let btns = `<button class="btn btn-sm btn-success dt-action-view" data-id="${row.Id}" data-mode="View">
                  <i class="bi bi-eye"></i> View
                </button>`;
    if (row.Status !== 0) {
      btns += `<button class="btn btn-sm btn-warning dt-action-edit" data-id="${row.Id}" data-mode="Update">
                 <i class="bi bi-pencil"></i> Edit
               </button>`;
    }
    if (row.Status === 1) {
      btns += `<button class="btn btn-sm btn-danger dt-action-inactivate" data-id="${row.Id}" data-module="User" data-table="tblUserList">
                 <i class="bi bi-slash-circle"></i> Inactivate
               </button>`;
    }
    if (row.Status === -1) {
      btns += `<button class="btn btn-sm btn-danger dt-action-delete" data-id="${row.Id}" data-module="User" data-confirm="true" data-table="tblUserList">
                 <i class="bi bi-trash"></i> Delete
               </button>`;
    }
    return btns;
  }
}


    ],
    // Olayları bağlamak için rowCallback ekliyoruz
    rowCallback: (row: any, data: any) => {
      // View butonu
      $(row).find('.dt-action-view').on('click', () => {
        this.viewUser(data.Id, "View User");
      });

      // Edit butonu
      $(row).find('.dt-action-edit').on('click', () => {
        this.addOrUpdateUser(data.Id, "Update User");
      });

    }
  });
}

searchByKeyword(tableId: string): void {
  console.log('Search keyword for table:', tableId);
  this.reloadTable();
}

resetFilters(tableId: string): void {
  
  this.reloadTable();
}

exportUserList(format: number): void {
  console.log('Export User list as:', format === 0 ? 'Excel' : 'PDF');
  
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
