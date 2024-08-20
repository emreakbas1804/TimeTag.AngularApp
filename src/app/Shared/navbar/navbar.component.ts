import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
declare var $: any;
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(public translateService: TranslateService, private router : Router) { }

  ngOnInit(): void {
    $( "#toggle-button" ).click(function() {
      $( "#mobil" ).toggle( "slow", function() {
        // Animation complete.
      });
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        $('#navbModal').removeClass('fade').modal('hide');
      }
    });
  }



}
