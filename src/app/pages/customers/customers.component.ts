import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ArrayHelper } from 'src/app/helpers/array.helper';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit, OnDestroy {

  public search: string;

  public togglePassword: boolean;

  public customerIndex: number;

  public customers: any[];

  public modalRef: BsModalRef;

  public formGroup: FormGroup;

  private unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private formBuilder: FormBuilder,
    private modalSrv: BsModalService,
    private alertSrv: AlertService
  ) { }

  ngOnInit() {
    this.initCustomers();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public changeStatus(event: any, index: number) {
    
    this.apiSrv.updateCustomer(this.customers[index].id, { status: event.target.checked })
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.customers[this.customerIndex] = res.data;

        this.alertSrv.toast({
          icon: 'success',
          message: res.message
        });

      });

  }

  public create(template: TemplateRef<any>) {

    this.customerIndex = undefined;

    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered'
    });

  }

  public edit(template: TemplateRef<any>, index: number) {

    this.togglePassword = false;

    this.customerIndex = index;

    this.formGroup = this.formBuilder.group({
      name: [this.customers[index].name, Validators.required],
      email: [this.customers[index].email, [Validators.required, Validators.email]],
      password: ['']
    });

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered'
    });

  }

  public delete(index: number) {

    const customer = this.customers[index];

    this.alertSrv.show({
      icon: 'warning',
      message: `This will permanently delete the customer "${customer.name}". Continue?`,
      onConfirm: () => {

        this.apiSrv.deleteCustomer(customer.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            this.customers = ArrayHelper.removeItem(this.customers, index);

            this.alertSrv.toast({
              icon: 'success',
              message: res.message
            });

          });

      }
    });

  }

  public save() {

    if (this.customerIndex >= 0) {

      const id = this.customers[this.customerIndex].id;

      this.apiSrv.updateCustomer(id, this.formGroup.value)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          this.customers[this.customerIndex] = res.data;

          this.modalRef.hide();

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });

        });

    }

    else {

      this.apiSrv.createCustomer(this.formGroup.value)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          this.customers.unshift(res.data);

          this.modalRef.hide();

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });

        });

    }

  }

  private initCustomers() {
    this.apiSrv.getAllCustomers()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        this.customers = res.data;
      });
  }

}
