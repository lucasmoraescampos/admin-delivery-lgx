import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { MenuItem } from '../../../../models/menu-item';

@Component({
  selector: 'app-side-bar1',
  templateUrl: './side-bar1.component.html',
  styleUrls: ['./side-bar1.component.scss'],
})
export class SideBar1Component implements OnInit {

  public user: any;

  public menuItems: MenuItem[];

  private unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private router: Router
  ) { }

  ngOnInit() {

    this.user = JSON.parse(localStorage.getItem('current_user'));

    this.menuItems = [
      {
        title: 'Home',
        isHeading: false,
        isActive: false,
        link: '/home',
        className: '',
        isIconClass: true,
        icon: 'ri-home-line'
      },
      {
        title: 'Teams',
        isHeading: false,
        isActive: false,
        link: '/teams',
        className: '',
        isIconClass: true,
        icon: 'ri-git-branch-line',
        hidden: this.user.type != 1
      },
      {
        title: 'Projects',
        isHeading: false,
        isActive: false,
        link: '/projects',
        className: '',
        isIconClass: true,
        icon: 'ri-briefcase-line'
      },
      {
        title: 'Drivers',
        isHeading: false,
        isActive: false,
        link: '/drivers',
        className: '',
        isIconClass: true,
        icon: 'ri-truck-line'
      },
      {
        title: 'Managers',
        isHeading: false,
        isActive: false,
        link: '/managers',
        className: '',
        isIconClass: true,
        icon: 'ri-user-settings-line',
        hidden: this.user.type != 1
      },
      {
        title: 'Customers',
        isHeading: false,
        isActive: false,
        link: '/customers',
        className: '',
        isIconClass: true,
        icon: 'ri-user-star-line'
      },
      {
        title: "Reports",
        name: "reports",
        isHeading: false,
        isActive: false,
        link: "",
        className: "",
        isIconClass: true,
        icon: "ri-file-chart-line",
        children: [
          {
            title: "On Time",
            isHeading: false,
            isActive: false,
            link: "/reports",
            className: "",
            isIconClass: false,
            icon: ""
          },
          {
            title: "Bags",
            isHeading: false,
            isActive: false,
            link: "/reports/bags",
            className: "",
            isIconClass: false,
            icon: ""
          },
          {
            title: "Drivers",
            isHeading: false,
            isActive: false,
            link: "/reports/drivers",
            className: "",
            isIconClass: false,
            icon: ""
          },
        ]
      },
      {
        title: 'Logout',
        isHeading: false,
        isActive: false,
        className: '',
        isIconClass: true,
        icon: 'ri-login-box-line',
        onclick: () => {
          this.logout();
        }
      },
    ];

  }

  private logout() {
    this.apiSrv.logout()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        localStorage.clear();
        this.router.navigateByUrl('/signin');
      }, err => {
        localStorage.clear();
        this.router.navigateByUrl('/signin');
      });
  }

}
