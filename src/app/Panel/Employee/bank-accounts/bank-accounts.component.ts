import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { Result } from 'src/app/Models/EntityResultModel';
import { SnackBarService } from 'src/app/Services/customService/snack-bar.service';
import { EmployeeService } from 'src/app/Services/httpService/employee.service';
declare var $ : any;
@Component({
  selector: 'app-bank-accounts',
  templateUrl: './bank-accounts.component.html',
  styleUrls: ['./bank-accounts.component.css']
})
export class BankAccountsComponent implements OnInit {

  constructor(private employeeService : EmployeeService, private router: Router, private snackBarService : SnackBarService, private translateService : TranslateService) { }
  employeeId: any = null;
  banks: any[] = [];
  loading = false;
  employee: any = {
    nameSurname: "",  
  }
  async ngOnInit(): Promise<void> {
    this.employeeId = this.router.url.split("/")[3];
    await this.getEmployee();
    await this.getEmployeeBanks();
  }

  async getEmployeeBanks() {

    const response = await firstValueFrom(this.employeeService.getEmployeeBanks(this.employeeId));
    if (response.result == Result.Success) {
      this.banks = response.resultObject.map((item: { bankName: any, ownerName: any, iban: any }) => ({
        bankName: item.bankName,
        ownerName: item.ownerName,
        iban: item.iban
      }
      ));
    }
  }

  addBankAccount(form: NgForm) {
    if (form.invalid) {
      this.snackBarService.error(this.translateService.instant("General.formValidationError"));
      return;
    }
    this.loading = true;    
    this.employeeService.addEmployeeBank(this.employeeId, form.value.bankName, form.value.ownerName, form.value.iban).subscribe({
      next: async response => {
        this.loading = false;
        if (response.result == Result.Success) {
          this.snackBarService.success(this.translateService.instant("General.createdBankAccount"));
          $('#add_bank_account_modal').modal('hide');
          form.reset();
          await this.getEmployeeBanks();
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
  
  async getEmployee() {
    var response = await firstValueFrom(this.employeeService.getEmployee(this.employeeId));
    if (response.result == Result.Success) {
      this.employee.nameSurname = response.resultObject?.nameSurname;     

    } else if (response.result == Result.Error) {
      this.snackBarService.error(response.resultMessage);
      this.router.navigate(["/panel/my-employees"]);
    }
  }


}
