import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ProjectService } from 'src/app/services/project.service';
import { StopService } from 'src/app/services/stop.service';

@Component({
  selector: 'app-modal-stop',
  templateUrl: './modal-stop.component.html',
  styleUrls: ['./modal-stop.component.scss']
})
export class ModalStopComponent implements OnInit, OnDestroy {

  @Input() stop: any;

  @Input() drivers: any;

  public formGroup: FormGroup;

  public onClose = new Subject();

  private unsubscribe = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef,
    private ngZone: NgZone,
    private alertSrv: AlertService,
    private loadingSrv: LoadingService,
    private stopSrv: StopService,
    private projectSrv: ProjectService
  ) { }

  ngOnInit() {

    this.formGroup = this.formBuilder.group({
      order_id: [this.stop?.order_id ?? '', Validators.required],
      name: [this.stop?.name ?? '', Validators.required],
      phone: [this.stop?.phone ?? '', Validators.required],
      address: [this.stop?.address ?? '', Validators.required],
      lat: [this.stop?.lat ?? '', Validators.required],
      lng: [this.stop?.lng ?? '', Validators.required],
      driver_id: [this.stop?.driver_id ?? '']
    });

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public dismiss() {
    this.bsModalRef.hide();
  }

  public changeAddress(event: any) {
    this.ngZone.run(() => {
      this.formGroup.patchValue({
        address: event.address,
        lat: String(event.latLng.lat),
        lng: String(event.latLng.lng),
      });
    });
  }

  public save() {

    if (this.formGroup.valid) {

      this.loadingSrv.show();

      if (this.stop) {

        this.stopSrv.update(this.stop.id, this.formGroup.value)
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

          });
      
      }

      else {

        const project = this.projectSrv.getCurrentProject();

        const data: any = this.formGroup.value;

        data.project_id = project.id;

        this.stopSrv.create(data)
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
            
          });

      }

    }

  }

}
