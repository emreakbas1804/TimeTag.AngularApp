import { Injectable, resolveForwardRef } from '@angular/core';
import { BehaviorSubject, catchError, last, tap, throwError } from 'rxjs';
import { UserModel } from '../../Models/UserModel';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { EntityResultModel, Result } from '../../Models/EntityResultModel';
import { JsonPipe } from '@angular/common';
import { RegisterModel } from '../../Models/RegisterModel';
import { EmailValidator } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient) { }
  private readonly apiUrl = environment.apiUrl;
  user = new BehaviorSubject<UserModel | null>(null);



  login(email: string, password: string) {    
    const formData: FormData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    return this.http.post<EntityResultModel>(this.apiUrl + "/account/login", formData).pipe(

      tap(response => {
        if (response.result == Result.Success) {
          this.handleUser(response.resultObject.token, response.resultObject.firstName, response.resultObject.surName);
        }
      }),

      catchError(this.handleError)
    );
  }

  register(user: RegisterModel) {
    var body = new HttpParams();
    body = body.set("Name", user.Name);
    body = body.set("Surname", user.Surname);
    body = body.set("Email", user.Email);
    body = body.set("Password", user.Password);
    body = body.set("Phone", user.Phone)

    return this.http.post<EntityResultModel>(this.apiUrl + "/account/register", body).pipe(
      catchError(this.handleError)
    );
  }

  getUserProfile() {
    return this.http.get<EntityResultModel>(this.apiUrl + "/account/getUserProfile").pipe(
      catchError(this.handleError)
    );
  }
  updateProfile(email: any, phone: any, password: string) {

    const formData: FormData = new FormData();
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);


    return this.http.put<EntityResultModel>(this.apiUrl + "/account/updateUserProfile", formData).pipe(
      catchError(this.handleError)
    );
  }

  addContactMessage(nameSurname: any, phone: any, email: any, message: any) {
    const formData: FormData = new FormData();
    formData.append("nameSurname", nameSurname);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("message", message);


    return this.http.post<EntityResultModel>(this.apiUrl + "/account/addContactMessage", formData).pipe(
      catchError(this.handleError)
    );
  }

  forgotPassword(email: any) {
    var body = new HttpParams();
    body = body.set("email", email);

    return this.http.post<EntityResultModel>(this.apiUrl + "/account/forgotPassword", body).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(email : any, code : any, password : any){
    var body = new HttpParams();
    body = body.set("email", email);
    body = body.set("code", code);
    body = body.set("password", password);

    return this.http.post<EntityResultModel>(this.apiUrl + "/account/resetPassword", body).pipe(
      catchError(this.handleError)
    );
  }

  autoLogin() {
    if (localStorage.getItem("accessToken") == null) {
      return
    }
    var accessToken = localStorage.getItem("user") || "";
    const user = new UserModel(accessToken);
    this.user.next(user)
  }

  handleError(err: HttpErrorResponse) {
    let message = "Beklenmedik bir hata oluştu";
    return throwError(() => message);
  }

  logOut() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentCompanyId");
    localStorage.removeItem("user");
    this.user.next(null);
  }

  private handleUser(jwtToken: string, firstName: string, surName: string) {
    const user = new UserModel(jwtToken);
    this.user.next(user);
    localStorage.setItem("accessToken", jwtToken);
    localStorage.setItem("user", firstName + "-" + surName);
  }

}




