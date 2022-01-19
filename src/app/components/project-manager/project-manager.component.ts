import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArrayHelper } from 'src/app/helpers/array.helper';
import { ModalSwapRouteComponent } from 'src/app/modals/modal-swap-route/modal-swap-route.component';
import { AlertService } from 'src/app/services/alert.service';
import { environment } from 'src/environments/environment';
import { ApiService } from 'src/app/services/api.service';
import * as md5 from 'md5';
import { formatDate } from '@angular/common';
import { UtilsHelper } from 'src/app/helpers/utils.helper';

@Component({
  selector: 'app-project-manager',
  templateUrl: './project-manager.component.html',
  styleUrls: ['./project-manager.component.scss']
})
export class ProjectManagerComponent implements OnInit, OnDestroy {

  @Input() project: any;

  @Input() colors: string[];

  @Output() driverInfo = new EventEmitter();

  @Output() stopInfo = new EventEmitter();

  @Output() projectChanged = new EventEmitter();

  public collapse: boolean = true;

  public tooltip: boolean = true;

  public options: any;

  public unscheduled: any[] = [];

  public unscheduled_order: any[] = [];

  private unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private alertSrv: AlertService,
    private modalSrv: BsModalService
  ) { }

  ngOnInit() {

    this.options = {
      group: 'stops',
      onStart: (event: any) => {
        this.tooltip = false;
      },
      onEnd: (event: any) => {
        this.tooltip = true;
      },
      onAdd: (event: any) => {
        this.reorder(this.project.drivers[event.to.id]);
      },
      onUpdate: (event: any) => {
        this.reorder(this.project.drivers[event.to.id]);
      }
    }

    this.setProject(this.project);

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public downloadSummary() {

    this.apiSrv.projectDownloadSummary(this.project.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {

        let binaryData = [];

        binaryData.push(data);

        const download = document.createElement('a');

        download.style.display = 'none';

        download.href = window.URL.createObjectURL(new Blob(binaryData, { type: data.type }));

        download.setAttribute('download', 'summary.xls');

        document.body.appendChild(download);

        download.click();

      });

  }

  public downloadSolution() {

    this.apiSrv.projectDownloadSolution(this.project.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {

        let binaryData = [];

        binaryData.push(data);

        const download = document.createElement('a');

        download.style.display = 'none';

        download.href = window.URL.createObjectURL(new Blob(binaryData, { type: data.type }));

        download.setAttribute('download', 'solution.xls');

        document.body.appendChild(download);

        download.click();

      });

  }

  public downloadRoute() {

    this.apiSrv.projectDownloadRoute(this.project.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {

        let binaryData = [];
        binaryData.push(data);

        const download = document.createElement('a');
        download.style.display = 'none';
        download.href = window.URL.createObjectURL(new Blob(binaryData, { type: data.type }));
        download.setAttribute('download', 'route.xls');
        document.body.appendChild(download);
        download.click();

      });

  }

  public driverTime(pivot: any) {

    if (pivot.routes[0]?.started_at) {

      return formatDate(pivot.routes[0].started_at, 'h:mm a', 'en-US', UtilsHelper.utcOffsetString(pivot.utc_offset));

    }

    else {

      const [hours, min] = pivot.start_time.split(':');

      return formatDate(new Date().setHours(hours, min), 'h:mm a', 'en-US');

    }

  }

  public stopTime(route: any, UTCOffset: number) {

    const value = route.arrived_at ?? route.skipped_at ?? route.forecast;

    return formatDate(value, 'h:mm a', 'en-US', UtilsHelper.utcOffsetString(UTCOffset));

  }

  public stopInfoById(id: number) {

    const index = ArrayHelper.getIndexByKey(this.project.stops, 'id', id);

    const stop = this.project.stops[index];

    this.stopInfo.emit(stop);

    this.collapse = true;

  }

  public driverInfoById(id: number) {

    const index = ArrayHelper.getIndexByKey(this.project.drivers, 'id', id);

    if (index == -1) return;

    const driver = this.project.drivers[index];

    this.driverInfo.emit(driver);

    this.collapse = true;

  }

  public dispatch() {

    this.apiSrv.dispatch(this.project.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        if (res.success) {

          this.setProject(res.data);

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });

        }

      });

  }

  public modalSwapRoute(driver: any) {

    const modal = this.modalSrv.show(ModalSwapRouteComponent, {
      keyboard: false,
      class: 'modal-dialog-centered modal-sm',
      backdrop: 'static',
      initialState: {
        driver: driver,
        project: this.project
      }
    });

    modal.content.onClose.pipe(takeUntil(this.unsubscribe))
      .subscribe((project: any) => {
        if (project) {
          this.setProject(project);
        }
      });

  }

  public reverseRoute(driver: any) {

    this.alertSrv.show({
      icon: 'question',
      message: `Reverse driver ${driver.name} route?`,
      onConfirm: () => {

        this.apiSrv.reverseRoute(this.project.id, { driver_id: driver.id })
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            if (res.success) {

              this.setProject(res.data);

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

            }

          });

      }
    });

  }

  private reorder(driver: any) {

    const data = {
      driver_id: driver.id,
      stops_order: driver.pivot.stops_order
    }

    this.apiSrv.reorder(this.project.id, data)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        if (res.success) {

          this.setProject(res.data);

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });

        }

      }, (res: any) => {

        this.alertSrv.toast({
          icon: 'error',
          message: res.error.message
        });

      });

  }

  public driverLink(driver_id: number) {
    return `${environment.driverUrl}/${md5(String(driver_id))}/stops/route/${md5(String(this.project.id))}`;
  }

  public copyLinkSuccess() {

    this.alertSrv.toast({
      icon: 'success',
      message: 'The route link has been copied to your clipboard'
    });

  }

  public sendSms(driver_id: number) {

    this.apiSrv.sendSms(this.project.id, driver_id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res: any) => {

        if (res.success) {

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });

        }

      }, err => {

        this.alertSrv.toast({
          icon: 'error',
          message: err.error.message
        });

      });
  }

  public sendSmsAll() {

    this.apiSrv.sendSmsAll(this.project.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res: any) => {

        if (res.success) {
          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });
        }

      }, (res: any) => {

        this.alertSrv.toast({
          icon: 'error',
          message: res.error.message
        });

      });

  }

  private setProject(project: any) {

    this.project = project;

    this.projectChanged.emit(this.project);

    this.unscheduled = this.project.stops.filter((stop: any) => {
      return stop.driver_id == null;
    });

    this.unscheduled_order = this.unscheduled.map((stop: any) => {
      return stop.id;
    });

  }

}
