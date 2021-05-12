import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal-upload-stops-columns',
  templateUrl: './modal-upload-stops-columns.component.html',
  styleUrls: ['./modal-upload-stops-columns.component.scss']
})
export class ModalUploadStopsColumnsComponent implements OnInit {

  @Input() columns: string[];
  
  public formGroup: FormGroup;

  public onClose = new Subject();

  private unsubscribe = new Subject();
  
  constructor(
    private bsModalRef: BsModalRef,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {

    this.formGroup = this.formBuilder.group({
      order_id:   [this.columns.indexOf('order_id')   != -1 ? 'order_id'    : '', Validators.required],
      first_name: [this.columns.indexOf('first_name') != -1 ? 'first_name'  : '', Validators.required],
      last_name:  [this.columns.indexOf('last_name')  != -1 ? 'last_name'   : ''                     ],
      street:     [this.columns.indexOf('street')     != -1 ? 'street'      : '', Validators.required],
      city:       [this.columns.indexOf('city')       != -1 ? 'city'        : '', Validators.required],
      zip_code:    [this.columns.indexOf('zip_code')    != -1 ? 'zip_code'     : '', Validators.required],
      phone:      [this.columns.indexOf('phone')      != -1 ? 'phone'       : '', Validators.required]
    });

  }

  public get formControl() {
    return this.formGroup.controls;
  }

  public dismiss() {
    this.bsModalRef.hide();
    this.onClose.next();
    this.onClose.complete();
  }

  public done() {
    this.bsModalRef.hide();
    this.onClose.next(this.formGroup.value);
    this.onClose.complete();
  }

}
