import { Component, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ProjectService } from 'src/app/services/project.service';
import { StopService } from 'src/app/services/stop.service';
import { ModalUploadStopsColumnsComponent } from '../modal-upload-stops-columns/modal-upload-stops-columns.component';

@Component({
  selector: 'app-modal-upload-stops',
  templateUrl: './modal-upload-stops.component.html',
  styleUrls: ['./modal-upload-stops.component.scss']
})
export class ModalUploadStopsComponent implements OnInit, OnDestroy {

  public columnNames: any;

  public file: File;

  public onClose = new Subject();

  private unsubscribe = new Subject();

  constructor(
    private bsModalRef: BsModalRef,
    private loadingSrv: LoadingService,
    private alertSrv: AlertService,
    private stopSrv: StopService,
    private projectSrv: ProjectService,
    private modalSrv: BsModalService
  ) { }

  ngOnInit() { }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public dismiss() {
    this.bsModalRef.hide();
  }

  public chooseFile(files: FileList) {

    this.loadingSrv.show();

    this.file = files.item(0);

    const data = new FormData();

    data.append('file', this.file);

    this.stopSrv.columnNames(data)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.loadingSrv.hide();

        if (res.success) {

          const modal = this.modalSrv.show(ModalUploadStopsColumnsComponent, {
            keyboard: false,
            class: 'modal-dialog-centered',
            backdrop: 'static',
            initialState: {
              columns: res.data
            }
          });
      
          modal.content.onClose.pipe(takeUntil(this.unsubscribe))
            .subscribe((columnNames: any) => {
              
              if (columnNames) {

                this.columnNames = columnNames;

                this.import();

              }

              else {
                this.bsModalRef.hide();
              }
              
            });
          
        }

      });

  }

  private import() {

    this.loadingSrv.show();

    const project = this.projectSrv.getCurrentProject();

    const data = new FormData();

    data.append('project_id', String(project.id));
    data.append('file', this.file);

    for (let key in this.columnNames) {
      data.append(`column_names[${key}]`, this.columnNames[key]);
    }

    this.alertSrv.toast({
      icon: 'warning',
      message: 'This may take a while. Please wait.',
      position: 'center',
      duration: 60000
    });

    this.stopSrv.import(data)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(

        res => {

          this.loadingSrv.hide();

          if (res.success) {

            this.alertSrv.toast({
              icon: 'success',
              message: res.message
            });

            this.onClose.next(res.data);

            this.onClose.complete();

            this.bsModalRef.hide();

          }

          else {

            this.alertSrv.toast({
              icon: 'error',
              message: res.message
            });

            this.bsModalRef.hide();

          }

        },

        err => {

          this.loadingSrv.hide();

          this.alertSrv.toast({
            icon: 'error',
            message: 'It was not possible to import the stops. Please contact support.',
            duration: 7500
          });

          this.bsModalRef.hide();

        }

      );

  }
}
