import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Result } from 'src/app/Models/EntityResultModel';
import { SnackBarService } from 'src/app/Services/customService/snack-bar.service';
import { AccountService } from 'src/app/Services/httpService/account.service';
declare var $: any;
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  constructor(private snackBarService: SnackBarService, private translateService: TranslateService, private accountService: AccountService, private router : Router) { }
  loading = false;
  email = "";
  info: string | null = null;
  infoColor: string | null = null;
  ngOnInit(): void {

  }

  forgotPassword(form: NgForm) {
    if (form.invalid) {
      this.snackBarService.error(this.translateService.instant("General.formValidationError"));
      return;
    }
    this.loading = true;
    this.accountService.forgotPassword(form.value.email).subscribe({
      next: response => {
        if (response.result == Result.Success) {
          this.snackBarService.success(this.translateService.instant("Forgot-password.theVerificationCodeHasBeenSentToYourEmailAccount"));
          this.email = form.value.email;          
          form.reset();
          $("#reset_password_modal").modal("show");

        }
        else this.snackBarService.error(response.resultMessage);

        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.snackBarService.error(this.translateService.instant("General.anUnexpectedErrorOccurred"))
      }
    });
  }

  resetPassword(form: NgForm) {
    if (form.invalid) {
      this.info = this.translateService.instant("General.formValidationError");
      this.infoColor = "danger";      
      return;
    }
    this.loading = true;
    this.accountService.resetPassword(this.email, form.value.code, form.value.password).subscribe({
      next: response => {
        if (response.result == Result.Success) {
          $("#reset_password_modal").modal("hide");
          this.snackBarService.success(this.translateService.instant("General.changedPassword"));
          this.router.navigate(["/login"])          

        }
        else{
          this.info = response.resultMessage;
          this.infoColor = "danger";
        }

        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.info = this.translateService.instant("General.anUnexpectedErrorOccurred")
        this.infoColor = "danger";        
      }
    });

  }
}
