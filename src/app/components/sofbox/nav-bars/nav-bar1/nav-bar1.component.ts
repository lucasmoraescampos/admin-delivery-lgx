import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as $ from 'jquery';
import { ProjectService } from 'src/app/services/project.service';
import { BsDropdownConfig } from "ngx-bootstrap/dropdown";
import { UserService } from 'src/app/services/user.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-nav-bar1',
  templateUrl: './nav-bar1.component.html',
  styleUrls: ['./nav-bar1.component.scss'],
  providers: [
    {
      provide: BsDropdownConfig,
      useValue: { isAnimated: true, autoClose: true }
    }
  ]
})
export class NavBar1Component implements OnInit, OnDestroy {

  public usr : any;
  public lst : any;
  public title: string;
  public breadCrumbItems: any[];
  private unsubscribe = new Subject();

  constructor(
    private router     : Router,
    private projectSrv : ProjectService,
    private usrSrv     : UserService,
    private loadingSrv : LoadingService,
    private alertSrv   : AlertService
  )
  {
    this.usr = this.usrSrv.getCurrentUser();
    this.lst = this.usrSrv.getLst();
  }

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
          this.title = 'Customer';
        }
        else if (location.pathname == '/notifications') {
          this.title = 'Customer Notifications';
        }
        else if (location.pathname == '/account') {
          this.title = 'My account';
        }
        else if (location.pathname == '/reports') {
          this.title = 'Reports - On Time';
        }
        else if (location.pathname == '/reports/bags') {
          this.title = 'Reports - Bags';
        }
        else if (location.pathname == '/reports/drivers') {
          this.title = 'Reports - Drivers';
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


  change( id )
  {
    this.usrSrv.change( id )
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.loadingSrv.hide();

        if (res.success)
        {
          this.alertSrv.toast({
            icon   : 'success',
            message: res.message
          });

          window.location.href = "/";
          //window.location.reload();
          //this.router.navigateByUrl('/projects');
        }
        else
        {
          this.alertSrv.toast({
            icon   : 'error',
            message: res.message
          });
        }

      }, err => {

        this.loadingSrv.hide();

        this.alertSrv.toast({
          icon   : 'error',
          message: err.message
        });

      });
  }



}
