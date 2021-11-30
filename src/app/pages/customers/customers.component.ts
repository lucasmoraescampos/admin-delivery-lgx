import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CustomersService } from 'src/app/services/customers.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AlertService } from 'src/app/services/alert.service';


@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit, OnDestroy
{


  private _unsubscribeAll: Subject<any>

  public name     : string;
  public modalRef : BsModalRef;
  public formGroup: FormGroup;
  public formNew  : boolean = true;

  private idEdt: number;

  public customers    = [];
  public customersAux = [];



  constructor(
    private loadingSrv       : LoadingService,
    private modalSrv         : BsModalService,
    private formBuilder      : FormBuilder,
    private _customersService: CustomersService,
    private alertSrv         : AlertService
  )
  {
    this._unsubscribeAll = new Subject();
  }



  ngOnInit()
  {
    this.loadingSrv.show();

    this._customersService.getAll()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {

        this.loadingSrv.hide();

        this.customers    = res.data;
        this.customersAux = res.data;

      }, err => {

        this.loadingSrv.hide();
        this.alertSrv.toast({ icon: 'error', message: err.message });

      });

    this.formGroup = new FormGroup({
      name     : new FormControl(),
      email    : new FormControl(),
      password : new FormControl(),
    });

    this.formGroup.controls['name'    ].setValidators([ Validators.required ]);
    this.formGroup.controls['email'   ].setValidators([ Validators.required, Validators.email ]);
    this.formGroup.controls['password'].setValidators([ Validators.minLength(6) ]);
  }



  ngOnDestroy(): void
  {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }



  updateFilter( event : any )
  {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.customersAux.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.customers = temp;
  }



  public openModal(template: TemplateRef<any>)
  {
    this.formNew = true;

    this.formGroup.controls['name' ].setValue( '' );
    this.formGroup.controls['email'].setValue( '' );

    this.formGroup.controls['password'].setValidators([ Validators.required, Validators.minLength(6) ]);

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered'
    });
  }



  edit( customer, template: TemplateRef<any> )
  {
    this.formNew = false;
    this.idEdt   = customer.id;

    this.formGroup.controls['password'].setValidators([ Validators.minLength(6) ]);

    this.formGroup.controls['name' ].setValue( customer.name  );
    this.formGroup.controls['email'].setValue( customer.email );

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered'
    });

  } // - edit()



  save()
  {
    if (this.formGroup.invalid)
      return;

    this.loadingSrv.show();

    let control = ( this.formNew )
      ? this._customersService.create(this.formGroup.value)
      : this._customersService.update(this.idEdt, this.formGroup.value)

    control.pipe( takeUntil( this._unsubscribeAll ) )
      .subscribe( res => {

        this.loadingSrv.hide();

        if (res.success)
        {
          if( this.formNew )
            this.formGroup.reset();

          this.customers    = res.data;
          this.customersAux = res.data;

          this.alertSrv.toast({ icon: 'success', message: res.message });
        }
        else
          this.alertSrv.toast({ icon: 'error', message: res.message });

      }, err => { // error

        this.loadingSrv.hide();
        let msg = '';

        // if is a laravel error array
        if( typeof err.error.message === 'object' )
        {
          Object.keys( err.error.message ).forEach( key => {

            let msgs = err.error.message[key].join('<br>');
            msg = ( msg == '' ) ? msgs : msg + '<br>' + msgs;

          });
        }
        else
          msg = err.error.message;

        this.alertSrv.toast({ icon: 'error', message: msg });

      });


  } // end - save()



}
