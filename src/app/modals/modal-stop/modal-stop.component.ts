import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-modal-stop',
  templateUrl: './modal-stop.component.html',
  styleUrls: ['./modal-stop.component.scss']
})
export class ModalStopComponent implements OnInit, OnDestroy {

  @Input() stop: any;

  @Input() project: any;

  public formGroup: FormGroup;

  public status: number;

  public image: string | ArrayBuffer;

  public datetime: string;

  public bags: number;

  public note: string;

  public onClose = new Subject();

  private unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef,
    private alertSrv: AlertService ,
    private loadingSrv: LoadingService   
  ) { }

  ngOnInit() {

    this.status = this.stop?.status ?? 0;

    this.formGroup = this.formBuilder.group({
      order_id: [this.stop?.order_id  ?? '',  Validators.required],
      name:     [this.stop?.name      ?? '',  Validators.required],
      phone:    [this.stop?.phone     ?? '',  Validators.required],
      address:  [this.stop?.address   ?? '',  Validators.required],
      lat:      [this.stop?.lat       ?? '',  Validators.required],
      lng:      [this.stop?.lng       ?? '',  Validators.required]
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
    this.formGroup.patchValue({
      address: event.address,
      lat: event.latLng.lat,
      lng: event.latLng.lng,
    });
  }

  public chooseFile(files: FileList) {

    this.loadingSrv.show();

    const file = files.item(0);

    const reader = new FileReader();

    reader.onloadend = () => {

      this.image = reader.result;

      this.loadingSrv.hide();

    };

    if (file) {
      reader.readAsDataURL(file);
    }

  }

  public save() {

    if (this.formGroup.valid) {

      if (this.stop) {

        const data: any = this.formGroup.value;

        if (this.status != this.stop.status && (this.status == 1 || this.status == 2 || this.status == 3)) {

          data.status = this.status;

          data.datetime = new Date(this.datetime);

          if (this.status == 2) {

            if (this.note) {
              data.note = this.note;
            }

            if (this.image) {
              data.image = this.image;
            }
            
            if (this.bags) {
              data.bags = this.bags;
            }

          }

          else if (this.status == 3) {

            if (this.note) {
              data.note = this.note;
            }

          }

        }

        this.apiSrv.updateStop(this.stop.id, data)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

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

        const data: any = this.formGroup.value;

        data.project_id = this.project.id;

        this.apiSrv.createStop(data)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

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
