import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilsHelper } from 'src/app/helpers/utils.helper';
import { PluginsService } from 'src/app/plugins.service';
import { AlertService } from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit, OnDestroy {


  public authSlideOptions: OwlOptions =  {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0  : { items: 1 },
      400: { items: 1 },
      740: { items: 1 },
      940: { items: 1 }
    },
    nav: true
  };


  public authSlides = [
    {
      id: 1,
      image: '/assets/images/login/1.png',
      title: 'Manage your orders',
      description: 'It is a long established fact that a reader will be distracted by the readable content.'
    },
    {
      id: 2,
      image: '/assets/images/login/1.png',
      title: 'Manage your orders',
      description: 'It is a long established fact that a reader will be distracted by the readable content.'
    },
    {
      id: 3,
      image: '/assets/images/login/1.png',
      title: 'Manage your orders',
      description: 'It is a long established fact that a reader will be distracted by the readable content.'
    },
    {
      id: 4,
      image: '/assets/images/login/1.png',
      title: 'Manage your orders',
      description: 'It is a long established fact that a reader will be distracted by the readable content.'
    }
  ];



  public formGroup: FormGroup;

  private unsubscribe = new Subject();



  constructor(
    private plugins: PluginsService,
    private formBuilder: FormBuilder,
    private alertSrv: AlertService,
    private userSrv: UserService,
    private loadingSrv: LoadingService,
    private router: Router
  ) { }



  ngOnInit() {
    // Init all plugins...
    const current = this;

    setTimeout(() => current.plugins.index(), 200);

    this.formGroup = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }



  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }



  public get formControl() {
    return this.formGroup.controls;
  }



  public save() {

    if (this.formGroup.valid) {

      if (!UtilsHelper.validateEmail(this.formControl.email.value)) {

        this.alertSrv.toast({
          icon   : 'error',
          message: 'Enter a valid email address'
        });

      }
      else {

        this.loadingSrv.show();

        this.userSrv.authenticate(this.formGroup.value)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {
            
            this.loadingSrv.hide();

            if (res.success)
            {
              this.alertSrv.toast({
                icon   : 'success',
                message: res.message
              });

              this.router.navigateByUrl('/projects');
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

  }

}
