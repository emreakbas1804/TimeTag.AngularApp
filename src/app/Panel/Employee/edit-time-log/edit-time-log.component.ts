import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { Result } from 'src/app/Models/EntityResultModel';
import { SnackBarService } from 'src/app/Services/customService/snack-bar.service';
import { EmployeeService } from 'src/app/Services/httpService/employee.service';
declare var $: any;
@Component({
  selector: 'app-edit-time-log',
  templateUrl: './edit-time-log.component.html',
  styleUrls: ['./edit-time-log.component.css']
})
export class EditTimeLogComponent implements OnInit {

  constructor(private router: Router, private employeeService: EmployeeService, private snackBarService: SnackBarService, private translateService : TranslateService, private datePipe : DatePipe) { }
  logId: any;
  loading = false;
  timeLog: any = {
    type: 1,
    processTime: ""
  }
  async ngOnInit(): Promise<void> {
    this.logId = this.router.url.split("/")[3];
    $("#selectType").select2();
    await this.getLog();
  }
  async getLog() {
    var response = await firstValueFrom(this.employeeService.getLog(this.logId));

    if (response.result == Result.Success) {
      this.timeLog.type = response.resultObject?.type;
      var backEndTime = response.resultObject?.processTime;
      this.timeLog.processTime = this.datePipe.transform(new Date(backEndTime), 'yyyy-MM-ddTHH:mm');
    }
    else if (response.result == Result.Error) {
      this.snackBarService.error(response.resultMessage);
    }
  }

  updateLog(form: NgForm) {
    if (form.invalid) {
      this.snackBarService.error(this.translateService.instant("General.formValidationError"));
      return;
    }
    this.loading = true;
    var processTime =new Date(form.value.processTime).toISOString();
    this.employeeService.updateLog(this.logId,form.value.type,form.value.processTime).subscribe({
      next: response => {
        this.loading = false;
        if (response.result == Result.Error) {
          this.snackBarService.error(response.resultMessage);
        } else {
          this.snackBarService.success(this.translateService.instant("General.updatedLog"))
        }
      },
      error: err => {
        this.snackBarService.error(this.translateService.instant("General.anUnexpectedErrorOccurred"))
        this.loading = false;
      }
    });
  }


}
