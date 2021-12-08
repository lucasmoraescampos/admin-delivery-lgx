import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';
import { WhereIsMyOrderService } from './where-is-my-order.service';

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
    private formBuilder: FormBuilder,
    private alertSrv: AlertService,
    private loadingSrv: LoadingService,
    public router: Router,
    public whereIsMyOrderService: WhereIsMyOrderService
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

        this.loadingSrv.show();

        this.whereIsMyOrderService.get(this.formControl.phone.value, this.formControl.order.value)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            this.loadingSrv.hide();

            if (!res.message) {

              this.stop = res.data;

              setTimeout(() => {

                window.scrollTo({
                  top: document.getElementById('info-content').offsetTop,
                  behavior: 'smooth'
                });

              }, 100);

            }

          }, (err) => {

            this.alertSrv.toast({
              icon: 'error',
              message: 'No records were found for this phone and order id'
            });

          });

      }

    }

  }

}
