import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilsHelper } from 'src/app/helpers/utils.helper';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-where-is-my-order',
  templateUrl: './where-is-my-order.component.html',
  styleUrls: ['./where-is-my-order.component.scss']
})
export class WhereIsMyOrderComponent implements OnInit, OnDestroy {

  public id: string;

  public phone: string;

  public formGroup: FormGroup;

  private unsubscribe$ = new Subject();

  public stop: any;

  constructor(
    private route: ActivatedRoute,
    private apiSrv: ApiService,
    private formBuilder: FormBuilder,
    private alertSrv: AlertService,
    public router: Router
  ) { }

  ngOnInit() {
    
    this.id = this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.queryParamMap.get('id');

    this.phone = this.route.snapshot.paramMap.get('phone') ?? this.route.snapshot.queryParamMap.get('phone');
    
    if (this.id && this.phone) {

      this.loadStop(this.id, this.phone);

    }

    this.formGroup = this.formBuilder.group({
      stop_id: [null, Validators.required],
      evaluation: [0, Validators.required],
      note: ['']
    });

  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public find() {

    if (!this.id) {

      this.alertSrv.toast({
        icon: 'error',
        message: 'Enter a valid Order Id'
      });

    }

    else if (!this.phone) {

      this.alertSrv.toast({
        icon: 'error',
        message: 'Enter a valid Phone Number'
      });

    }

    else {

      this.loadStop(this.id, this.phone);

    }

  }

  public sendFeedback() {
    this.apiSrv.sendFeedback(this.formGroup.value)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (res.success) {
          this.stop.feedback = res.data;
        }
      });
  }

  private loadStop(order_id: string, phone: string) {

    this.apiSrv.getOrder({ order_id, phone })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {

        if (!res.message) {

          this.stop = res.data;

          this.stop.datetime = formatDate(this.stop.timestamp, 'MMM d, y — h:mm a', 'en-US', UtilsHelper.utcOffsetString(this.stop.utc_offset));

          this.formGroup.patchValue({
            stop_id: this.stop.id,
            evaluation: this.stop.feedback?.evaluation,
            note: this.stop.feedback?.note
          });
          
          setTimeout(() => {

              window.scrollTo({
                top: document.getElementById('info-content').offsetTop,
                behavior: 'smooth'
              });

          }, 100);

        }

      }, err => {

        this.alertSrv.toast({
          icon: 'error',
          message: err.statusText
        });

      });

  }

}
