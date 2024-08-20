import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { config, firstValueFrom } from 'rxjs';
import { Result } from 'src/app/Models/EntityResultModel';
import { CompanyService } from 'src/app/Services/httpService/company.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { SnackBarService } from 'src/app/Services/customService/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-edit-company',
  templateUrl: './edit-company.component.html',
  styleUrls: ['./edit-company.component.css']
})
export class EditCompanyComponent implements OnInit {
  companyId: any;
  loading = false;
  cdnUrl = environment.cdnUrl;
  selectedFile: File | null = null;
  previewUrl: any = null;
  allowedTypes = ["image/jpeg", "image/jpg", "image/webp", "image/png"]
  company: any = {
    title: "",
    address: "",
    description: "",
    webSite: "",
    image: "",
  }
  constructor(private router: Router, private companyService: CompanyService, private snackBarService: SnackBarService, private translateService : TranslateService) { }

  async ngOnInit(): Promise<void> {
    this.companyId = this.router.url.split("/")[3];
    await this.getCompany()

  }

  async getCompany() {
    var response = await firstValueFrom(this.companyService.getCompany(this.companyId));

    if (response.result == Result.Success) {
      this.company.title = response.resultObject?.title;
      this.company.address = response.resultObject?.address;
      this.company.description = response.resultObject?.description;
      this.company.webSite = response.resultObject?.webSite;
      this.company.image = response.resultObject?.imageUrl;

    }
    else if (response.result == Result.Error) {
      this.snackBarService.error(response.resultMessage);
    }
  }

  update(form: NgForm) {
    if (form.invalid) {
      this.snackBarService.error(this.translateService.instant("General.formValidationError"));
      return;
    }
    this.loading = true;
    this.companyService.updateCompany(this.companyId,this.company.title,this.company.address,this.company.description,this.company.webSite,this.selectedFile).subscribe({
      next: response => {
        this.loading = false;
        if(response.result == Result.Error){
          this.snackBarService.error(response.resultMessage);
        }else{
          this.snackBarService.success(this.translateService.instant("General.updatedCompany"))
        }
      },
      error: err => {
        this.snackBarService.error(this.translateService.instant("General.anUnexpectedErrorOccurred"))
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (!this.allowedTypes.includes(file.type)) {
      this.snackBarService.error(this.translateService.instant("General.fileTypeIsInvalid"));
      return
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if(file.size > maxSize){
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
