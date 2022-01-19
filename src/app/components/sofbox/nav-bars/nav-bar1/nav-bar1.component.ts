import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as $ from 'jquery';
import { BsDropdownConfig } from "ngx-bootstrap/dropdown";
import { NavbarService } from 'src/app/services/navbar.service';

@Component({
  selector: 'app-nav-bar1',
  templateUrl: './nav-bar1.component.html',
  styleUrls: [],
  providers: [
    {
      provide: BsDropdownConfig,
      useValue: { isAnimated: true, autoClose: true }
    }
  ]
})
export class NavBar1Component implements OnInit, OnDestroy {

  public usr: any;
  public lst: any;
  public title: string;
  public breadCrumbItems: any[];
  private unsubscribe = new Subject();

  constructor(
    private navbarSrv: NavbarService
  ) { }

  ngOnInit() {
    
    this.navbarSrv.title.pipe(takeUntil(this.unsubscribe))
      .subscribe(title => {
        this.title = title;
      });

    this.navbarSrv.breadcrumb.pipe(takeUntil(this.unsubscribe))
      .subscribe(breadCrumbItems => {
        this.breadCrumbItems = breadCrumbItems;
      });
      
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  clickPaymentShow(countTicketBooking: any) {
    if (countTicketBooking > 0) {
      $('.iq-sidebar-right-menu').addClass('film-side');
    }
  }

}
