import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from 'src/app/Services/httpService/account.service';

@Component({
  selector: 'app-panel-navbar',
  templateUrl: './panel-navbar.component.html',
  styleUrls: ['./panel-navbar.component.css']
})
export class PanelNavbarComponent implements OnInit {

  constructor(private router: Router, private accountService: AccountService, public translateService: TranslateService) { }
  FirstName: string | null | undefined = "";
  LastName: string | null | undefined = "";
  ngOnInit(): void {
    var user = localStorage.getItem("user");
    this.FirstName = user?.split("-")[0]?.toUpperCase();
    this.LastName = user?.split("-")[1]?.toUpperCase();

  }

  logOut() {
    this.accountService.logOut();
    this.router.navigate(["/"]);
  }

  changeLang(langCode: string) {
    this.translateService.use(langCode);
    localStorage.setItem("langCode", langCode)
  }













}
