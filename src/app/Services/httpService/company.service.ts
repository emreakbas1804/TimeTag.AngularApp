import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { EntityResultModel } from '../../Models/EntityResultModel';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private http: HttpClient) { }
  private readonly apiUrl = environment.apiUrl;

  getCompanies() {
    return this.http.get<EntityResultModel>(this.apiUrl + "/company/getCompanies").pipe(
      catchError(this.handleError),
    );
  }
  getDepartmentsCount(companyId: number) {
    const params = new HttpParams().set('companyId', companyId);

    return this.http.get<EntityResultModel>(this.apiUrl + '/company/getDepartmentsCount', { params }).pipe(
      catchError(this.handleError)
    );
  }

  addCompany(title: any, address: any, description: any, webSite: any, licanceKey: any, logo: any) {

    const formData: FormData = new FormData();
    formData.append("title", title);
    formData.append("address", address);
    formData.append("description", description);
    formData.append("webSite", webSite);
    formData.append("serialNumber", licanceKey);
    formData.append("logo", logo);


    return this.http.post<EntityResultModel>(this.apiUrl + "/company/addCompany", formData).pipe(
      catchError(this.handleError)
    );
  }

  updateCompany(companyId: any, title: any, address: any, description: any, webSite: any, logo: any) {

    const formData: FormData = new FormData();
    formData.append('logo', logo);
    formData.append("companyId", companyId);
    formData.append("title", title);
    formData.append("address", address);
    formData.append("description", description);
    formData.append("webSite", webSite);
    return this.http.post<EntityResultModel>(this.apiUrl + "/company/updateCompany", formData).pipe(
      catchError(this.handleError)
    );
  }

  getCompany(companyId: number) {
    const params = new HttpParams().set('companyId', companyId);
    return this.http.get<EntityResultModel>(this.apiUrl + "/company/getCompany", { params }).pipe(
      catchError(this.handleError),
    )
  }


  addDepartment(companyId: any, name: any, address: any, description: any, startJobTime: any, finishJobTime: any) {

    const formData: FormData = new FormData();
    formData.append("companyId", companyId);
    formData.append("name", name);
    formData.append("address", address);
    formData.append("description", description);
    formData.append("startJobTime", startJobTime);
    formData.append("finishJobTime", finishJobTime);

    return this.http.post<EntityResultModel>(this.apiUrl + "/company/addDepartment", formData).pipe(
      catchError(this.handleError)
    );

  }

  getDepartments(companyId: any) {

    const params = new HttpParams().set('companyId', companyId);

    return this.http.get<EntityResultModel>(this.apiUrl + "/company/getDepartments", { params }).pipe(
      catchError(this.handleError)
    );

  }

  getDepartment(departmentId: any) {
    const params = new HttpParams().set('departmentId', departmentId);
    return this.http.get<EntityResultModel>(this.apiUrl + "/company/getDepartment", { params }).pipe(
      catchError(this.handleError),
    )
  }

  updateDepartment(departmentId: any, name: any, address: any, description: any, startJobTime: any, finishJobTime: any) {
    const formData: FormData = new FormData();
    formData.append('departmentId', departmentId);
    formData.append("name", name);
    formData.append("address", address);
    formData.append("description", description);
    formData.append("startJobTime", startJobTime);
    formData.append("finishJobTime", finishJobTime);
    return this.http.put<EntityResultModel>(this.apiUrl + "/company/updateDepartment", formData).pipe(
      catchError(this.handleError)
    );
  }

  deleteDepartment(departmentId: any) {
    const params = new HttpParams().set('departmentId', departmentId);
    return this.http.delete<EntityResultModel>(this.apiUrl + "/company/deleteDepartment", { params }).pipe(
      catchError(this.handleError),
    )
  }

  getCompanyTokens(companyId: any) {
    const params = new HttpParams().set('companyId', companyId);
    return this.http.get<EntityResultModel>(this.apiUrl + "/company/getCompanyTokens", { params }).pipe(
      catchError(this.handleError),
    )
  }


  setCurrentCompany(id: number) {
    localStorage.setItem("currentCompanyId", id?.toString());
  }
  getCurrentCompany() {
    return localStorage.getItem("currentCompanyId");
  }
  handleError(err: HttpErrorResponse) {
    let message = "Beklenmedik bir hata oluştu";
    return throwError(() => message);
  }


}
