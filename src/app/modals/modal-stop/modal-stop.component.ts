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

  public formGroup: FormGroup;

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

  public save() {

    if (this.formGroup.valid) {

      this.loadingSrv.show();

      const project = this.projectSrv.getCurrentProject();

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

              const index = ArrayHelper.getIndexByKey(project.stops, 'id', res.data.id);

              project.stops[index] = res.data;

              this.projectSrv.setCurrentProject(project);

              this.bsModalRef.hide();

            }

          });
      
      }

      else {

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

              project.stops.push(res.data);

              this.projectSrv.setCurrentProject(project);
              
              this.bsModalRef.hide();

            }
            
          });

      }

    }

  }

}
