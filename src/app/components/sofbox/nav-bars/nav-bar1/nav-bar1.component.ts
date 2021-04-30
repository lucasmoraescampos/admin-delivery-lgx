import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as $ from 'jquery';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-nav-bar1',
  templateUrl: './nav-bar1.component.html',
  styleUrls: []
})
export class NavBar1Component implements OnInit, OnDestroy {

  public title: string;

  public breadCrumbItems: any[];

  private unsubscribe = new Subject();

  constructor(
    private router: Router,
    private projectSrv: ProjectService
  ) { }

  ngOnInit() {

    this.setTitle();

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

  private setTitle() {
    this.router.events.pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {

        this.breadCrumbItems = [];

        if (location.pathname == '/projects') {
          this.title = 'All Projects';
        }
        else if (location.pathname == '/drivers') {
          this.title = 'All Drivers';
        }
        else if (location.pathname == '/customers') {
          this.title = 'Customer Profiles';
        }
        else if (location.pathname == '/notifications') {
          this.title = 'Customer Notifications';
        }
        else if (location.pathname == '/account') {
          this.title = 'My account';
        }
        else if (location.pathname == '/project') {

          const project = this.projectSrv.getCurrentProject();

          this.title = project.name;

          this.breadCrumbItems = [
            {
              isActive: false,
              label: 'All Projects',
              link: '/projects'
            },
            {
              isActive: true,
              label: project.name,
              link: '/project'
            }
          ];

        }
        else {
          this.title = '';
        }
      });
  }

}
