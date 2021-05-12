import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { DriverService } from 'src/app/services/driver.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-modal-driver',
  templateUrl: './modal-driver.component.html',
  styleUrls: ['./modal-driver.component.scss']
})
export class ModalDriverComponent implements OnInit, OnDestroy {

  @Input() driver: any;

  @Input() project_id: number;

  public formGroup: FormGroup;

  public onClose = new Subject();

  private unsubscribe = new Subject();

  constructor(
    private ngZone: NgZone,
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef,
    private alertSrv: AlertService,
    private loadingSrv: LoadingService,
    private driverSrv: DriverService
  ) { }

  ngOnInit() {

    this.formGroup = this.formBuilder.group({
      name: [this.driver?.name ?? '', Validators.required],
      phone: [this.driver?.phone ?? '', Validators.required],
      start_address: [this.driver?.start_address ?? '', Validators.required],
      start_lat: [this.driver?.start_lat ?? '', Validators.required],
      start_lng: [this.driver?.start_lng ?? '', Validators.required],
      start_time: [this.driver?.start_time ?? '', Validators.required],
      project_id: [this.project_id ?? null]
    });

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public dismiss() {
    this.bsModalRef.hide();
  }

  public get formControl() {
    return this.formGroup.controls;
  }

  public changeStartAddress(event: any) {
    this.ngZone.run(() => {
      this.formGroup.patchValue({
        start_address: event.address,
        start_lat: String(event.latLng.lat),
        start_lng: String(event.latLng.lng),
      });
    });
  }

  public save() {

    if (this.formGroup.valid) {

      this.loadingSrv.show();

      if (this.driver) {

        this.driverSrv.update(this.driver.id, this.formGroup.value)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            this.loadingSrv.hide();

            if (res.success) {

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

              this.onClose.next(res.data);

              this.bsModalRef.hide();

            }

            else {

              this.alertSrv.toast({
                icon: 'error',
                message: res.message
              });

            }

          });
      
      }

      else {

        this.driverSrv.create(this.formGroup.value)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            this.loadingSrv.hide();

            if (res.success) {

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

              this.onClose.next(res.data);

              this.bsModalRef.hide();

            }

            else {

              this.alertSrv.toast({
                icon: 'error',
                message: res.message
              });

            }

          });

      }

    }

  }

}
