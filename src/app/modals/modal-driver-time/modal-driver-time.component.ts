import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal-driver-time',
  templateUrl: './modal-driver-time.component.html',
  styleUrls: ['./modal-driver-time.component.scss']
})
export class ModalDriverTimeComponent implements OnInit, OnDestroy {

  @Input() start_address: string;

  @Input() start_lat: string;

  @Input() start_lng: string;

  @Input() start_time: string;
  
  @Input() end_time: string;

  public formGroup: FormGroup;

  public onClose = new Subject();

  private unsubscribe = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef
  ) { }

  ngOnInit() {

    this.start_time = this.convertTimepicker(this.start_time);

    this.end_time = this.convertTimepicker(this.end_time);

    this.formGroup = this.formBuilder.group({
      start_address:  [this.start_address, Validators.required],
      start_lat:      [this.start_lat, Validators.required],
      start_lng:      [this.start_lng, Validators.required],
      start_time:     [this.start_time, Validators.required],
      end_time:       [this.end_time, Validators.required]
    });

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public get formControl() {
    return this.formGroup.controls;
  }

  public dismiss() {
    this.onClose.next();
    this.bsModalRef.hide();
  }

  public changeAddress(event: any) {
    this.formGroup.patchValue({
      start_address: event.address,
      start_lat: String(event.latLng.lat),
      start_lng: String(event.latLng.lng),
    });
  }

  public send() {

    if (this.formGroup.valid) {

      const data = this.formGroup.value;
      
      data.start_time = new Date(data.start_time).toTimeString().slice(0, 8);

      data.end_time = new Date(data.end_time).toTimeString().slice(0, 8);

      this.onClose.next(data);

      this.bsModalRef.hide();

    }

  }

  private convertTimepicker(time: string) {

    const date = new Date();

    const shift = time.slice(-2);

    let [hours, min]: any = time.slice(0, 5).split(':');

    hours = shift == 'AM' ? Number(hours) : Number(hours) + 12;

    hours = hours < 24 ? hours : 0;

    date.setHours(hours, min, 0, 0);

    return date.toString();

  }

}
