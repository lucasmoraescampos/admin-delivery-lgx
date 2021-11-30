import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArrayHelper } from 'src/app/helpers/array.helper';
import { ModalSwapRouteComponent } from 'src/app/modals/modal-swap-route/modal-swap-route.component';
import { AlertService } from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ProjectService } from 'src/app/services/project.service';
import { environment } from 'src/environments/environment';
import * as md5 from 'md5';

@Component({
  selector: 'app-project-manager',
  templateUrl: './project-manager.component.html',
  styleUrls: ['./project-manager.component.scss']
})
export class ProjectManagerComponent implements OnInit, OnDestroy {

  @Input() colors: string[];

  @Output() driverInfo     = new EventEmitter();
  @Output() stopInfo       = new EventEmitter();
  @Output() setStopChanged = new EventEmitter();

  public collapse         : boolean = true;
  public tooltip          : boolean = true;
  public options          : any;
  public project          : any;
  public unscheduled      : any[] = [];
  public unscheduled_order: any[] = [];

  private unsubscribe = new Subject();

  constructor(
    private projectSrv : ProjectService,
    private loadingSrv : LoadingService,
    private alertSrv   : AlertService,
    private modalSrv   : BsModalService
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

        if( event.from.id && typeof this.project?.drivers[event.from.id].pivot?.routes[event.oldIndex] !== 'undefined' )
        {
          this.setStopChanged.emit({
            start_lat : this.project?.drivers[event.from.id].pivot?.routes[event.oldIndex].start_lat,
            start_lng : this.project?.drivers[event.from.id].pivot?.routes[event.oldIndex].start_lng,
          });
        }
        else
        {
          this.setStopChanged.emit({
            start_lat : this.unscheduled[event.oldIndex].lat,
            start_lng : this.unscheduled[event.oldIndex].lng,
          });
        }

        this.reorder( this.project.drivers[event.to.id] );
      },
      onUpdate: (event: any) => {
        this.reorder(this.project.drivers[event.to.id]);
      }
    }

    this.projectSrv.currentProject.pipe(takeUntil(this.unsubscribe))
      .subscribe(project => {

        this.project = project;

        this.setTime();

        this.unscheduled = this.project.stops.filter((stop: any) => {
          return stop.driver_id == null;
        });
    
        this.unscheduled_order = this.unscheduled.map((stop: any) => {
          return stop.id;
        });

      });

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public downloadSummary() {

    this.loadingSrv.show();

    this.projectSrv.downloadSummary(this.project.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {

        this.loadingSrv.hide();

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

    this.loadingSrv.show();

    this.projectSrv.downloadSolution(this.project.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {

        this.loadingSrv.hide();

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

    this.loadingSrv.show();

    this.projectSrv.downloadRoute(this.project.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {

        this.loadingSrv.hide();

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

  public stopInfoById(id: number) {

    const index = ArrayHelper.getIndexByKey(this.project.stops, 'id', id);

    const stop = this.project.stops[index];

    this.stopInfo.emit(stop);

  }

  public driverInfoById(id: number) {

    const index = ArrayHelper.getIndexByKey(this.project.drivers, 'id', id);

    if (index == -1) return;

    const driver = this.project.drivers[index];
    
    this.driverInfo.emit(driver);

  }

  public dispatch() {

    this.loadingSrv.show();

    this.projectSrv.dispatch(this.project.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.loadingSrv.hide();

        if (res.success) {

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });

        }

      });

  }

  public modalSwapRoute(driver: any) {

    this.modalSrv.show(ModalSwapRouteComponent, {
      keyboard: false,
      class: 'modal-dialog-centered modal-sm',
      backdrop: 'static',
      initialState: {
        driver: driver,
        project: this.project
      }
    });

  }

  public reverseRoute(driver: any) {

    this.alertSrv.show({
      icon: 'question',
      message: `Reverse driver ${driver.name} route?`,
      onConfirm: () => {

        this.loadingSrv.show();

        this.projectSrv.reverseRoute(this.project.id, { driver_id: driver.id })
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            this.loadingSrv.hide();

            if (res.success) {

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });
    
            }

          });

      }
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

  private reorder(driver: any) {

    this.loadingSrv.show();

    const data = {
      driver_id: driver.id,
      stops_order: driver.pivot.stops_order
    }

    this.projectSrv.reorder(this.project.id, data)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.loadingSrv.hide();

        if (res.success) {

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });

        }

      }, ( res : any ) => {

        this.loadingSrv.hide();

        this.alertSrv.toast({
          icon   : 'error',
          message: res.error.message
        });

      });

  }

  private setTime() {

    this.project.drivers.forEach((driver: any) => {

      let duration = 0;
      let start_time : string = '';

      if( driver.pivot?.routes.length > 0 && typeof driver.pivot?.routes[0].started_at != 'undefined' && driver.pivot?.routes[0].started_at != null )
      {
        let do_ = new Date( driver.pivot?.routes[0].started_at );
        start_time = do_.getHours() + ':' + do_.getMinutes();
      }
      else if( driver.pivot?.start_time )
        start_time = driver.pivot?.start_time;
      else
        start_time = driver.start_time;

      let split : any = start_time.split(':');
      let date = new Date();
      date.setHours(split[0], split[1], 0, 0);

      driver.time = date.toLocaleTimeString(navigator.language, {
        hour  : '2-digit',
        minute: '2-digit'
      });

      let last : any     = null; // ultimo registro realizado
      let lf   : boolean = false; //

      driver.pivot.routes?.forEach((route: any) => {

        // if 'completo' ou 'skipped'
        if( route.status == 2 || route.status == 3 )
        {
          const dt = new Date( ( route.status == 2 ) ? route.arrived_at : route.skipped_at );

          route.time = dt.toLocaleTimeString(navigator.language, {
            hour  : '2-digit',
            minute: '2-digit'
          });

          last = route;
        }
        else // se stop em espera
        {
          // se ultimo stop foi atendido calcula previsão de entrega a partir da ultima stop
          if( last )
          {
            // se a ultima stop foi atendida zera a duração
            if( !lf )
            {
              lf = true;
              duration = 0;
            }

            date = new Date();

            let dtz   : any = ( last.status == 2 ) ? last.arrived_at : last.skipped_at;
            let doz_  : any = new Date( dtz );
            let timez : any = doz_.getHours() + ':' + doz_.getMinutes();
            let splitz: any = timez.split(':');

            duration += route.duration;

            date.setHours(Number(splitz[0]), Number(splitz[1]), date.getSeconds() + duration, 0);
          }
          else
          {
            duration += route.duration;
            date.setHours(Number(split[0]), Number(split[1]), date.getSeconds() + duration, 0);
          }

          route.time = date.toLocaleTimeString(navigator.language, {
            hour  : '2-digit',
            minute: '2-digit'
          });

          duration += route.downtime;
        }

      });

    });

  }
  


  sendSms( driverId )
  {
    this.loadingSrv.show();

    this.projectSrv.sendSms(this.project.id, driverId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( ( res : any ) => {

        this.loadingSrv.hide();

        if (res.success)
        {
          this.alertSrv.toast({
            icon   : 'success',
            message: res.message
          });
        }

      }, ( res : any ) => {

        this.loadingSrv.hide();

        this.alertSrv.toast({
          icon   : 'error',
          message: res.error.message
        });

      });
  }


  sendSms2All()
  {
    this.loadingSrv.show();

    let driversIdsArr = [];
    let driversIds    = '';

    this.project.drivers.forEach( ar => {
      driversIdsArr.push(ar.id);
    });

    driversIds = driversIdsArr.join(',');

    this.projectSrv.sendSms2All(this.project.id, driversIds)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( ( res : any ) => {

        this.loadingSrv.hide();

        if (res.success)
        {
          this.alertSrv.toast({
            icon   : 'success',
            message: res.message
          });
        }

      }, ( res : any ) => {

        this.loadingSrv.hide();

        this.alertSrv.toast({
          icon   : 'error',
          message: res.error.message
        });

      });

  }


}
