import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityResultModel } from '../../Models/EntityResultModel';
import { environment } from 'src/environments/environment';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private http: HttpClient) { }
  private readonly apiUrl = environment.apiUrl;
  getEmployeesCount(companyId: number) {
    const params = new HttpParams().set('companyId', companyId);
    return this.http.get<EntityResultModel>(this.apiUrl + "/employee/getEmployeesCompanyCount", { params }).pipe(
      catchError(this.handleError),
    )
  }

  addEmployee(companyId: any, departmentId: any, tokenId : any,nameSurname: any, title: any, phone: any, address: any, email: any, birthDay: any, photo: any) {
    const formData: FormData = new FormData();
    formData.append("companyId", companyId);
    formData.append("departmentId", departmentId);
    formData.append("tokenId", tokenId);
    formData.append("nameSurname", nameSurname);
    formData.append("title", title);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("email", email);
    formData.append("birthDay", birthDay);
    formData.append("photo", photo);
    return this.http.post<EntityResultModel>(this.apiUrl + "/employee/addEmployee", formData).pipe(
      catchError(this.handleError)
    );
  }

  getEmployees(companyId: any, departmentId?: any) {
    const params = new HttpParams().set('companyId', companyId).set("departmentId", departmentId);
    return this.http.get<EntityResultModel>(this.apiUrl + "/employee/getEmployeesCompany", { params }).pipe(
      catchError(this.handleError),
    )
  }

  getEmployee(employeeId: any) {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<EntityResultModel>(this.apiUrl + "/employee/getEmployeeCompany", { params }).pipe(
      catchError(this.handleError),
    )
  }
  updateEmployee(departmentId: any, employeeId: any, nameSurname: any, title: any, phone: any, address: any, email: any, isActive: any, birthDay: any, photo: any) {
    const formData: FormData = new FormData();
    formData.append("departmentId", departmentId);
    formData.append("employeeId", employeeId);
    formData.append("nameSurname", nameSurname);
    formData.append("title", title);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("email", email);
    formData.append("birthDay", birthDay);
    formData.append("photo", photo);
    formData.append("isActive", isActive);
    return this.http.put<EntityResultModel>(this.apiUrl + "/employee/updateEmployee", formData).pipe(
      catchError(this.handleError)
    );
  }

  addEmployeeBank(employeeId: any, bankName: any, ownerName: any, iban: any) {
    const formData: FormData = new FormData();
    formData.append("employeeId", employeeId);
    formData.append("bankName", bankName);
    formData.append("ownerName", ownerName);
    formData.append("iban", iban);
    return this.http.post<EntityResultModel>(this.apiUrl + "/employee/addEmployeeBank", formData).pipe(
      catchError(this.handleError)
    );
  }

  getEmployeeBanks(employeeId: any) {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<EntityResultModel>(this.apiUrl + "/employee/getEmployeeBanks", { params }).pipe(
      catchError(this.handleError),
    )
  }
  getTimeLogs(employeeId: any, startDate: any, endDate: any, page: any, count: any) {
    const params = new HttpParams().set('employeeId', employeeId).set("startDate", startDate).set("endDate", endDate).set("page", page).set("count", count);

    return this.http.get<EntityResultModel>(this.apiUrl + "/employee/getLogsEmployee", { params }).pipe(
      catchError(this.handleError),
    )
  }

  getCurrentEmployeeTimeLogs(startDate: any, endDate: any, page: any, count: any) {
    const params = new HttpParams().set("startDate", startDate).set("endDate", endDate).set("page", page).set("count", count);

    return this.http.get<EntityResultModel>(this.apiUrl + "/employee/getLogsCurrentEmployee", { params }).pipe(
      catchError(this.handleError),
    )
  }
  getLog(logId: any) {
    const params = new HttpParams().set("logId", logId);
    return this.http.get<EntityResultModel>(this.apiUrl + "/employee/getLog", { params }).pipe(
      catchError(this.handleError)
    );
  }
  updateLog(logId: any, type: any, processTime: any) {
    const formData: FormData = new FormData();
    formData.append("logId", logId);
    formData.append("type", type);
    formData.append("processTime", processTime);
    return this.http.put<EntityResultModel>(this.apiUrl + "/employee/updateLog", formData).pipe(
      catchError(this.handleError)
    );
  }

  handleError(err: HttpErrorResponse) {
    let message = "Beklenmedik bir hata oluştu";
    return throwError(() => message);
  }
}
