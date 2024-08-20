import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeModule } from './Home/home.module';
import { SharedModule } from './Shared/shared.module';
import { PanelModule } from './Panel/panel.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RequestHeaderInterceptor } from './Services/httpService/request-header.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HomeModule,
    SharedModule,
    PanelModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TranslateModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: RequestHeaderInterceptor, multi: true },
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
