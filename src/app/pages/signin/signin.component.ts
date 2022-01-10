import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigHelper } from 'src/app/helpers/config.helper';
import { UtilsHelper } from 'src/app/helpers/utils.helper';
import { PluginsService } from 'src/app/plugins.service';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit, OnDestroy {

  public authSlideOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: { items: 1 },
      400: { items: 1 },
      740: { items: 1 },
      940: { items: 1 }
    },
    nav: true
  };

  public formGroup: FormGroup;

  private unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private plugins: PluginsService,
    private formBuilder: FormBuilder,
    private alertSrv: AlertService,
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
          icon: 'error',
          message: 'Enter a valid email address'
        });

      }

      else {

        this.apiSrv.authenticate(this.formGroup.value)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            localStorage.setItem(ConfigHelper.Storage.AccessToken, res.token);
            localStorage.setItem(ConfigHelper.Storage.CurrentUser, JSON.stringify(res.data));

            this.alertSrv.toast({
              icon: 'success',
              message: res.message
            });

            this.router.navigateByUrl('/home');

          });

      }

    }

  }

}
