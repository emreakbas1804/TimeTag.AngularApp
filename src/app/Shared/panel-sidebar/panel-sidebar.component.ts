import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from 'src/app/Services/httpService/account.service';
declare var $: any;
@Component({
  selector: 'app-panel-sidebar',
  templateUrl: './panel-sidebar.component.html',
  styleUrls: ['./panel-sidebar.component.css']
})
export class PanelSidebarComponent implements OnInit {

  constructor(private router: Router, public translateService : TranslateService, private accountService : AccountService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        $('#left_side_bar_modal').removeClass('fade').modal('hide');
      }
    });
  }

  ngOnInit(): void {

  }

  logOut() {
    this.accountService.logOut();
    this.router.navigate(["/"]);
  }


}
