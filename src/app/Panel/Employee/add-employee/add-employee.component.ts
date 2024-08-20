import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { Result } from 'src/app/Models/EntityResultModel';
import { SnackBarService } from 'src/app/Services/customService/snack-bar.service';
import { CompanyService } from 'src/app/Services/httpService/company.service';
import { EmployeeService } from 'src/app/Services/httpService/employee.service';
declare var $: any;
@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AddEmployeeComponent implements OnInit {
  loading = false;
  selectedFile: File | null = null;
  previewUrl: any = null;
  allowedTypes = ["image/jpeg", "image/jpg", "image/webp", "image/png"];
  departments: any[] = [];
  tokens: any[] = [];
  selectedDepartment: any = 0;
  selectedToken: any = 0;
  
  constructor(private snackBarService: SnackBarService, private employeeService: EmployeeService, private companyService: CompanyService, private router: Router, private translateService : TranslateService) { }

  async ngOnInit(): Promise<void> {
    await this.getDepartments();
    await this.getTokens();
    $("#selectDepartment").select2();
    $("#selectToken").select2();

    if (this.tokens.length == 0) {
      this.snackBarService.warning(this.translateService.instant("General.thereIsNoAnyCard"));
      this.router.navigate(['/panel']);
    }

    if (this.departments.length == 0) {
      this.snackBarService.warning(this.translateService.instant("General.thereIsNoAnyDepartment"));
      this.router.navigate(['/panel/add-department']);
    }

    $('#selectDepartment').on('change', async (event: any) => {
      if ($("#selectDepartment").val() != 0) {
        this.selectedDepartment = $("#selectDepartment").val();
      }
    });

    $('#selectToken').on('change', async (event: any) => {
      if ($("#selectToken").val() != 0) {
        this.selectedToken = $("#selectToken").val();
      }
    });


  }

  addEmployee(form: NgForm) {
    if (form.invalid || this.selectedDepartment == 0 || this.selectedToken == 0) {
      this.snackBarService.error(this.translateService.instant("General.formValidationError"));
      return;
    }
    this.loading = true;
    var companyId = this.companyService.getCurrentCompany();
    this.employeeService.addEmployee(companyId, this.selectedDepartment, this.selectedToken,form.value.fullName, form.value.title, form.value.phone, form.value.address, form.value.email, form.value.birthDay, this.selectedFile).subscribe({
      next: response => {
        this.loading = false;
        if (response.result == Result.Success) {
          this.snackBarService.success(this.translateService.instant("General.createdEmployee"));
          form.reset();
          this.selectedFile = null;
        }
        else {
          this.loading = false;
          this.snackBarService.error(response.resultMessage);
        }
      },
      error: err => {
        this.snackBarService.error(this.translateService.instant("General.anUnexpectedErrorOccurred"))
        this.loading = false;
      }
    })

  }



  async getDepartments() {
    var companyId = this.companyService.getCurrentCompany();
    const response = await firstValueFrom(this.companyService.getDepartments(companyId));
    if (response.result == Result.Success && response.resultObject != null) {

      this.departments = response.resultObject.map((item: { id: any, name: any }) => ({
        name: item.name,
        id: item.id,
      }
      ));
    }

  }

  async getTokens(){
    var companyId = this.companyService.getCurrentCompany();
    const response = await firstValueFrom(this.companyService.getCompanyTokens(companyId));
    if (response.result == Result.Success && response.resultObject != null) {

      this.tokens = response.resultObject.map((item: { id: any, token: any }) => ({
        token: item.token,
        id: item.id,
      }
      ));
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (!this.allowedTypes.includes(file.type)) {
      this.snackBarService.error(this.translateService.instant("General.fileSizeConnotBiggerThan10Mb"));
      return
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.snackBarService.error(this.translateService.instant("General.fileSizeConnotBiggerThan10Mb"));
      return
    }
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();

      reader.onload = () => {
        this.previewUrl = reader.result;
      };

      reader.readAsDataURL(this.selectedFile as Blob);
    }
  }



}
