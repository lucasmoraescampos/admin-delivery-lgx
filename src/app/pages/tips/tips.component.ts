import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss']
})
export class TipsComponent implements OnInit {

  public step: number = 0;

  public formGroup: FormGroup;

  public stop: any;

  public cardError: string;

  public spinner: boolean;

  private stripe: any;

  private card: any;

  private unsubscribe$ = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private apiSrv: ApiService,
    private alertSrv: AlertService
  ) { }

  ngOnInit() {

    this.formGroup = this.formBuilder.group({
      stop_id: [''],
      evaluation: [''],
      compliment: [''],
      tip: ['0.00'],
      token: ['']
    });

    this.loadOrder();

  }

  public get formCtrl() {
    return this.formGroup.controls;
  }

  public setTip(value: string, toggle?: boolean) {
    if (toggle && this.formCtrl.tip.value == value) {
      this.formGroup.patchValue({ tip: '0.00' });
    }
    else {
      this.formGroup.patchValue({ tip: value });
    }
    this.step = 0;
  }

  public done() {
    const data = this.formGroup.value;
    if (data.tip != '0.00') {
      if (Number(data.tip.replace(',', '')) < 2) {
        this.alertSrv.toast({
          icon: 'error',
          message: 'Amount must be at least $2.00 usd'
        });
      }
      else {
        this.step = 3;
      }
    }
    else {
      this.send();
    }
  }

  public pay() {
    this.spinner = true;
    this.stripe.createToken(this.card).then((event: any) => {
      if (event.error) {
        this.spinner = false;
        this.cardError = event.error.message;
      } else {
        this.spinner = false;
        this.cardError = '';
        this.formGroup.patchValue({ token: event.token.id });
        this.send();
      }
    });
  }

  private send() {

    const data = this.formGroup.value;
    
    data.tip = Number(data.tip.replace(',', ''));

    this.apiSrv.sendFeedback(this.formGroup.value)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {

        this.stop.feedback = res.data;

        this.step = 0;

        this.alertSrv.toast({
          icon: 'success',
          message: res.message
        });

      }, err => {
        this.alertSrv.toast({
          icon: 'error',
          message: err.error.message
        });
      });

  }

  private loadOrder() {

    const order_id = this.route.snapshot.paramMap.get('id');

    const phone = this.route.snapshot.paramMap.get('phone');

    this.apiSrv.getOrder({ order_id, phone })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.stop = res.data;
        this.formGroup.patchValue({ stop_id: this.stop.id });
        if (!this.stop.feedback) {
          this.loadCard();
        }
      });

  }

  private loadCard() {

    this.stripe = (<any>window).Stripe(environment.stripeKey);

    const elements = this.stripe.elements();

    this.card = elements.create('card', {
      hidePostalCode: true,
      style: {
        base: {
          iconColor: '#fc9d20',
          color: '#31325F',
          lineHeight: '48px',
          fontSize: '14px'
        },
      }
    });

    setTimeout(() => this.card.mount('#card-element'));

    this.card.on('change', (event: any) => {
      if (event.error) {
        this.cardError = event.error.message;
      }
      else {
        this.cardError = '';
      }
    });

  }

}
