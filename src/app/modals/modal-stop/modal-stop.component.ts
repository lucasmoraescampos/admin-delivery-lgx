import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArrayHelper } from 'src/app/helpers/array.helper';
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

  public project: any;

  public formGroup: FormGroup;

  public status: number;

  public image: string | ArrayBuffer;

  public datetime: string;

  public bags: number;

  public note: string;

  public onUpdated = new Subject();

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

    this.status = this.stop?.status ?? 0;

    this.project = this.projectSrv.getCurrentProject();

    this.formGroup = this.formBuilder.group({
      order_id: [this.stop?.order_id ?? '', Validators.required],
      name: [this.stop?.name ?? '', Validators.required],
      phone: [this.stop?.phone ?? '', Validators.required],
      address: [this.stop?.address ?? '', Validators.required],
      lat: [this.stop?.lat ?? '', Validators.required],
      lng: [this.stop?.lng ?? '', Validators.required]
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

      this.loadingSrv.show();

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

        this.stopSrv.update(this.stop.id, data)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            this.loadingSrv.hide();

            if (res.success) {

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

              const index = ArrayHelper.getIndexByKey(this.project.stops, 'id', res.data.id);

              this.project.stops[index] = res.data;

              this.projectSrv.setCurrentProject(this.project);

              this.bsModalRef.hide();

              this.onUpdated.next();

            }

          });
      
      }

      else {

        const data: any = this.formGroup.value;

        data.project_id = this.project.id;

        this.stopSrv.create(data)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            this.loadingSrv.hide();

            if (res.success) {

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

              this.project.stops.push(res.data);

              this.projectSrv.setCurrentProject(this.project);
              
              this.bsModalRef.hide();

            }
            
          });

      }

    }

  }

}
