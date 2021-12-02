import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoadingService } from 'src/app/services/loading.service';
import { UserService } from 'src/app/services/user.service';
import { MenuItem } from '../../../../models/menu-item';

@Component({
  selector    : 'app-side-bar1',
  templateUrl : './side-bar1.component.html',
  styleUrls   : ['./side-bar1.component.scss'],
})
export class SideBar1Component implements OnInit {

  public menuItems: MenuItem[] = [
    /*
    {
      title: '',
      isHeading: true,
      isActive: false,
      className: '',
      isIconClass: true,
      icon: 'ri-separator'
    },*/
    {
      title      : 'Projects',
      isHeading  : false,
      isActive   : false,
      link       : '/projects',
      className  : '',
      isIconClass: true,
      icon       : 'ri-profile-line'
    },
    {
      title      : 'Drivers',
      isHeading  : false,
      isActive   : false,
      link       : '/drivers',
      className  : '',
      isIconClass: true,
      icon       : 'ri-truck-line'
    },
    {
      title      : 'Customers',
      isHeading  : false,
      isActive   : false,
      link       : '/customers',
      className  : '',
      isIconClass: true,
      icon       : 'ri-shopping-bag-line'
    },

    {
      title      : "Reports",
      name       : "reports",
      isHeading  : false,
      isActive   : false,
      link       : "",
      className  : "",
      isIconClass: true,
      icon       : "ri-file-chart-line",
      children   : [
        {
          title      : "On Time",
          isHeading  : false,
          isActive   : false,
          link       : "/reports",
          className  : "",
          isIconClass: false,
          icon       : ""
        },
        {
          title      : "Bags",
          isHeading  : false,
          isActive   : false,
          link       : "/reports/bags",
          className  : "",
          isIconClass: false,
          icon       : ""
        },
        {
          title      : "Drivers",
          isHeading  : false,
          isActive   : false,
          link       : "/reports/drivers",
          className  : "",
          isIconClass: false,
          icon       : ""
        },
      ]
    },


    // {
    //   title: 'Customer Notifications',
    //   isHeading: false,
    //   isActive: false,
    //   link: '/notifications',
    //   className: '',
    //   isIconClass: true,
    //   icon: 'ri-mail-send-line'
    // },
    // {
    //   title: 'My Account',
    //   isHeading: false,
    //   isActive: false,
    //   link: '/account',
    //   className: '',
    //   isIconClass: true,
    //   icon: 'ri-user-settings-line'
    // },
    {
      title      : 'Logout',
      isHeading  : false,
      isActive   : false,
      className  : '',
      isIconClass: true,
      icon       : 'ri-login-box-line',
      onclick    : () => {
        this.logout();
      } 
    },
  ];

  private unsubscribe = new Subject();

  public userName : any;



  constructor(
    private userSrv    : UserService,
    private loadingSrv : LoadingService,
    private router     : Router
  )
  {
    this.userName = this.userSrv.getCurrentUser();
  }



  ngOnInit()
  {}



  private logout()
  {
    this.loadingSrv.show();

    this.userSrv.logout()
      .pipe( takeUntil( this.unsubscribe ) )
      .subscribe( res => {

        this.loadingSrv.hide();
        this.router.navigateByUrl('/signin');

      });
  }



}