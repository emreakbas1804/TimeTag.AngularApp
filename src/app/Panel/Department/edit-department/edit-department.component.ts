import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, firstValueFrom } from 'rxjs';
import { EntityResultModel, Result } from 'src/app/Models/EntityResultModel';
import { SnackBarService } from 'src/app/Services/customService/snack-bar.service';
import { CompanyService } from 'src/app/Services/httpService/company.service';
declare var $ : any;
@Component({
  selector: 'app-edit-department',
  templateUrl: './edit-department.component.html',
  styleUrls: ['./edit-department.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EditDepartmentComponent implements OnInit {

  loading = false;
  constructor(private router: Router, private companyService: CompanyService, private snackBarService: SnackBarService, private translateService : TranslateService) { }
  departmentId: any = null;
  department: any = {
    name: "",
    address: "",
    description: "",
    startJobTime: "",
    finishJobTime: ""
  }
  async ngOnInit(): Promise<void> {
    this.departmentId = this.router.url.split("/")[3];
    await this.getDepartment();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        $('#delete_department').removeClass('fade').modal('hide');
      }
    });
  }

  async getDepartment() {
    var response = await firstValueFrom(this.companyService.getDepartment(this.departmentId));
    if (response.result == Result.Success) {
      this.department.name = response.resultObject?.name;
      this.department.address = response.resultObject?.address;
      this.department.description = response.resultObject?.description;
      this.department.startJobTime = response.resultObject?.startJobTime;
      this.department.finishJobTime = response.resultObject?.finishJobTime;

    } else if (response.result == Result.Error) {
      this.snackBarService.error(response.resultMessage);
    }
    
  }
  updateDepartment(form: NgForm) {
    if (form.invalid) {
      this.snackBarService.error(this.translateService.instant("General.formValidationError"));
      return;
    }
    this.loading = true;
    this.companyService.updateDepartment(this.departmentId, form.value.name, form.value.address, form.value.description, form.value.startJobTime, form.value.finishJobTime).subscribe({
      next: response => {
        this.loading = false;
        if (response.result == Result.Success) {
          this.snackBarService.success(this.translateService.instant("General.updatedDepartment"));
        } else {
          this.snackBarService.error(response.resultMessage);
        }
      },
      error: err => {
        this.snackBarService.error(this.translateService.instant("General.anUnexpectedErrorOccurred"))
      }
    })

  }
  async deleteDepartment(confirmValue: any) {
    if (confirmValue.toLowerCase() == "confirm" || confirmValue.toUpperCase() == "CONFIRM" || confirmValue.toUpperCase() == "CONFİRM") {
      this.loading = true;
      var response = await firstValueFrom(this.companyService.deleteDepartment(this.departmentId));
      if (response.result == Result.Success) {
        this.snackBarService.success(this.translateService.instant("General.deletedDepartment"));
        this.router.navigate(["/panel/my-departments"]);
      } else {
        this.snackBarService.error(response.resultMessage);
      }      
      this.loading = false;
    } else {
      
    }
  }


}


