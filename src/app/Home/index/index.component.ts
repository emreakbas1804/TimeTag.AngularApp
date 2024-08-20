import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Result } from 'src/app/Models/EntityResultModel';
import { SnackBarService } from 'src/app/Services/customService/snack-bar.service';
import { AccountService } from 'src/app/Services/httpService/account.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  constructor(private snackBarService : SnackBarService, public translateService : TranslateService, private accountService  :AccountService) { }
  loading = false;
  ngOnInit(): void {
  }

  changeLang(langCode: string) {
    this.translateService.use(langCode);
    localStorage.setItem("langCode", langCode)
  }

  addOffer(form : NgForm){
    if (form.invalid) {
      this.snackBarService.error(this.translateService.instant("General.formValidationError"));
      return;
    }
    this.loading = true;
    this.accountService.addContactMessage(form.value.nameSurname, form.value.phone, form.value.email, form.value.message).subscribe({
      next: response => {
        if (response.result == Result.Success) {
          this.snackBarService.success(this.translateService.instant("General.gettedOffer"));
          form.reset();
        }else this.snackBarService.error(response.resultMessage);
                
        this.loading = false;       
      },
      error: err => {
        this.loading = false;
        this.snackBarService.error(this.translateService.instant("General.anUnexpectedErrorOccurred"))
      }
    });
  }

}
