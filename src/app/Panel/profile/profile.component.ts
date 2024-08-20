import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { Result } from 'src/app/Models/EntityResultModel';
import { SnackBarService } from 'src/app/Services/customService/snack-bar.service';
import { AccountService } from 'src/app/Services/httpService/account.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private translateService: TranslateService, private accountService: AccountService, private snackBarService: SnackBarService) { }
  loading = false;
  user: any = {
    name: "",
    surname: "",
    email: "",
    phone: "",
    password: ""
  }
  ngOnInit(): void {
    this.getUserProfile()
  }

  update(form: NgForm) {
    console.log(form.value);
    if (form.invalid) {
      this.snackBarService.error(this.translateService.instant("General.formValidationError"));
      return;
    }
    if (form.value.password != "" && form.value.password?.length < 6) {
      this.snackBarService.error(this.translateService.instant("Profile.passwordShouldBeLongerThan5Char"));
      return;
    }

    this.loading = true;
    this.accountService.updateProfile(form.value.email, form.value.phone, form.value.password).subscribe({
      next: response => {
        this.loading = false;
        if (response.result == Result.Error) {
          this.snackBarService.error(response.resultMessage);
        } else {
          this.snackBarService.success(this.translateService.instant("General.updatedProfile"))
        }
      },
      error: err => {
        this.snackBarService.error(this.translateService.instant("General.anUnexpectedErrorOccurred"))
        this.loading = false;
      }
    });
  }

  async getUserProfile() {
    const response = await firstValueFrom(this.accountService.getUserProfile());
    if (response.result == Result.Success) {
      this.user = response.resultObject;
    }
  }

}
