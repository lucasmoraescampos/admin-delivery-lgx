import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-modal-driver-time',
  templateUrl: './modal-driver-time.component.html',
  styleUrls: ['./modal-driver-time.component.scss']
})
export class ModalDriverTimeComponent implements OnInit, OnDestroy
{

  public formGroup   : FormGroup;
  public initialState: any;
  public address     : string = '';

  public  onClose     = new Subject();
  public  onSubmit    = new Subject();
  private unsubscribe = new Subject();

  constructor(
    private ngZone     : NgZone,
    private formBuilder: FormBuilder,
    private bsModalRef : BsModalRef,
    private alertSrv   : AlertService,
    private loadingSrv : LoadingService
  ) { }


  ngOnInit()
  {
    let start_address = '';
    let start_lat     = '';
    let start_lng     = '';
    let start_time    = '08:00';
    let end_time      = '16:00';

    if( typeof this.initialState?.driver?.pivot != 'undefined' )
    {
      start_address = this.initialState?.driver?.pivot?.start_address;
      start_lat     = this.initialState?.driver?.pivot?.start_lat;
      start_lng     = this.initialState?.driver?.pivot?.start_lng;
      start_time    = this.initialState?.driver?.pivot?.start_time;
      end_time      = this.initialState?.driver?.pivot?.end_time;
    }
    else if( typeof this.initialState?.driver?.projectInfo != 'undefined' )
    {
      start_address = ( this.initialState?.driver?.projectInfo?.start_address != null ) ? this.initialState?.driver?.projectInfo?.start_address : this.initialState?.driver?.start_address;
      start_lat     = ( this.initialState?.driver?.start_lat                  != null ) ? this.initialState?.driver?.start_lat                  : this.initialState?.driver?.start_lat;
      start_lng     = ( this.initialState?.driver?.start_lng                  != null ) ? this.initialState?.driver?.start_lng                  : this.initialState?.driver?.start_lng;
      start_time    = ( this.initialState?.driver?.projectInfo?.start_time    != null ) ? this.initialState?.driver?.projectInfo?.start_time    : this.initialState?.driver?.start_time;
      end_time      = ( this.initialState?.driver?.projectInfo?.end_time      != null ) ? this.initialState?.driver?.projectInfo?.end_time      : this.initialState?.driver?.end_time;
    }
    else
    {
      start_address = this.initialState?.driver?.start_address;
      start_lat     = this.initialState?.driver?.start_lat;
      start_lng     = this.initialState?.driver?.start_lng;
      start_time    = this.initialState?.driver?.start_time;
      end_time      = this.initialState?.driver?.end_time;
    }

    this.formGroup = this.formBuilder.group({
      start_address: [start_address ?? '' , Validators.required],
      start_lat    : [start_lat     ?? '' , Validators.required],
      start_lng    : [start_lng     ?? '' , Validators.required],
      start_time   : [start_time    ?? '' , Validators.required],
      end_time     : [end_time      ?? '' , Validators.required],
    });

    this.address = start_address;
  }


  ngOnDestroy()
  {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }


  public dismiss()
  {
    this.onClose.next(false);
    this.bsModalRef.hide();
  }


  save()
  {
    if (this.formGroup.invalid)
      return false;

    this.onSubmit.next({
      start_address: this.formGroup.controls.start_address.value,
      start_lat    : this.formGroup.controls.start_lat.value,
      start_lng    : this.formGroup.controls.start_lng.value,
      start_time   : this.formGroup.controls.start_time.value,
      end_time     : this.formGroup.controls.end_time.value
    })

    this.bsModalRef.hide();
  }


  public changeStartAddress(event: any)
  {
    this.ngZone.run(() => {

      this.formGroup.patchValue({
        start_address: event.address,
        start_lat    : String(event.latLng.lat),
        start_lng    : String(event.latLng.lng),
      });

    });
  }


}
