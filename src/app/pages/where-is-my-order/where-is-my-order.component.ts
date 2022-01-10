import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilsHelper } from 'src/app/helpers/utils.helper';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-where-is-my-order',
  templateUrl: './where-is-my-order.component.html',
  styleUrls: ['./where-is-my-order.component.scss']
})
export class WhereIsMyOrderComponent implements OnInit, OnDestroy {

  public formGroup: FormGroup;

  private unsubscribe = new Subject();

  public stop: any;

  constructor(
    private apiSrv: ApiService,
    private formBuilder: FormBuilder,
    private alertSrv: AlertService,
    public router: Router
  ) { }

  ngOnInit() {

    this.formGroup = this.formBuilder.group({
      order: ['', Validators.required],
      phone: ['', Validators.required]
    });

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public get formControl() {
    return this.formGroup.controls;
  }

  public send() {

    if (this.formGroup.valid) {

      if (!this.formControl.phone.value) {

        this.alertSrv.toast({
          icon: 'error',
          message: 'Enter a valid Phone Number'
        });

      }
      
      else if (!this.formControl.order.value) {

        this.alertSrv.toast({
          icon: 'error',
          message: 'Enter a valid Order Id'
        });

      }
      
      else {

        this.apiSrv.findMyOrder(this.formControl.phone.value, this.formControl.order.value)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            if (!res.message) {

              this.stop = res.data;

              this.stop.datetime = formatDate(this.stop.timestamp, 'MMM d, y — h:mm a', 'en-US', UtilsHelper.utcOffsetString(this.stop.timezone_time * -3600));

              setTimeout(() => {

                window.scrollTo({
                  top: document.getElementById('info-content').offsetTop,
                  behavior: 'smooth'
                });

              }, 100);

            }

          });

      }

    }

  }

}
