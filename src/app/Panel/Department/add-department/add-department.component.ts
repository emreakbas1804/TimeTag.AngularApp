import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Result } from 'src/app/Models/EntityResultModel';
import { SnackBarService } from 'src/app/Services/customService/snack-bar.service';
import { CompanyService } from 'src/app/Services/httpService/company.service';

@Component({
  selector: 'app-add-department',
  templateUrl: './add-department.component.html',
  styleUrls: ['./add-department.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AddDepartmentComponent implements OnInit {

  loading = false;
  constructor(private companyService: CompanyService, private snackBarService: SnackBarService, private translateService : TranslateService) { }

  ngOnInit(): void {
  }

  addDepartment(form: NgForm) {
    if (form.invalid) {
      this.snackBarService.error(this.translateService.instant("General.formValidationError"));
      return;
    }
    this.loading = true;
    var companyId = this.companyService.getCurrentCompany();    
    this.companyService.addDepartment(companyId, form.value.name, form.value.address, form.value.description, form.value.startJobTime, form.value.finishJobTime).subscribe({
      next: response => {
        if (response.result == Result.Success) {
          this.snackBarService.success(this.translateService.instant("General.createdDepartment"));
          form.reset();
        } else this.snackBarService.error(response.resultMessage);

        this.loading = false;

      },
      error: err => {
        this.snackBarService.error(this.translateService.instant("General.anUnexpectedErrorOccurred"))
        this.loading = false;
      }
    })

  }

}
