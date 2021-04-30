import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArrayHelper } from 'src/app/helpers/array.helper';
import { ModalDriverComponent } from 'src/app/modals/modal-driver/modal-driver.component';
import { ModalStopComponent } from 'src/app/modals/modal-stop/modal-stop.component';
import { ModalUploadStopsComponent } from 'src/app/modals/modal-upload-stops/modal-upload-stops.component';
import { AlertService } from 'src/app/services/alert.service';
import { DriverService } from 'src/app/services/driver.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ProjectService } from 'src/app/services/project.service';
import { StopService } from 'src/app/services/stop.service';

declare const google: any;

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {

  @ViewChild('map', { static: true }) mapElement: ElementRef;

  /*
   * 0 : Show only the "map".
   * 1 : Show "map" and "drivers and map".
   * 2 : Expand "plan".
   */
  public display: 0 | 1 | 2 = 0;

  public project: any;

  public drivers: any[] = [];

  public page: number = 1;

  public colors = ['#0000FF', '#FF0000', '#039103', '#9400D3', '#babd00', '#FF00FF', '#029696', '#FF4500', '#114011', '#8B4513', '#2F4F4F', '#4682B4', '#00704b', '#808000', '#222222'];

  public options: any;

  private map: any;

  private polyline: any[] = [];

  private infoWindow = new google.maps.InfoWindow();

  private unsubscribe = new Subject();

  constructor(
    private modalSrv: BsModalService,
    private loadingSrv: LoadingService,
    private alertSrv: AlertService,
    private driverSrv: DriverService,
    private projectSrv: ProjectService,
    private stopSrv: StopService
  ) { }

  ngOnInit() {

    this.options = {
      onUpdate: (event: any) => {
        this.reorder(this.project.drivers[event.clone.value])
      }
    }

    this.initMap();

    this.initProject();

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public pageChanged(event: any): void {
    this.page = event.page;
  }

  public isDriverchecked(driver: any) {
    if (ArrayHelper.exist(this.project.drivers, 'id', driver.id)) {
      return true;
    }
    else {
      return false;
    }
  }

  public checkDriver(driver: any, ev: any) {

    if (ev.target.checked == false) {

      this.alertSrv.show({
        icon: 'warning',
        message: `The driver "${driver.name}" will be disabled. Continue?`,
        onConfirm: () => {

          this.loadingSrv.show();

          this.projectSrv.deleteProjectDriver(this.project.id, driver.id)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(

              res => {

                this.loadingSrv.hide();

                if (res.success) {

                  const index = ArrayHelper.getIndexByKey(this.project.drivers, 'id', driver.id);

                  this.project.drivers[index].marker.setMap(null);

                  this.project = res.data;

                  this.setMarkers();

                  this.setPolyline();

                  this.alertSrv.toast({
                    icon: 'success',
                    message: res.message
                  });

                }

              },

              err => {

                this.loadingSrv.hide();

                ev.target.checked = !ev.target.checked;

              }

            );

        },
        onCancel: () => {
          ev.target.checked = true;
        }
      });

    }

    else {

      this.loadingSrv.show();

      this.projectSrv.addProjectDriver(this.project.id, driver.id)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(

          res => {

            this.loadingSrv.hide();

            if (res.success) {

              this.clearMarkers();

              this.project = res.data;

              this.setMarkers();

              this.setPolyline();

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

            }

          },

          err => {

            this.loadingSrv.hide();

            ev.target.checked = !ev.target.checked;

          }

        );

    }

  }

  public modalStop(stop?: any) {
    const modal = this.modalSrv.show(ModalStopComponent, {
      keyboard: false,
      class: 'modal-dialog-centered',
      backdrop: 'static',
      initialState: {
        stop: stop
      }
    });

    modal.content.onClose.pipe(takeUntil(this.unsubscribe))
      .subscribe((result: any) => {

        this.clearMarkers();

        if (stop) {
          const index = ArrayHelper.getIndexByKey(this.project.stops, 'id', stop.id);
          this.project.stops[index] = result;
        }

        else {
          this.project.stops.push(result);
        }

        this.setMarkers();

        this.setPolyline();

      });
  }

  public modalUploadStops() {
    const modal = this.modalSrv.show(ModalUploadStopsComponent, {
      keyboard: false,
      class: 'modal-dialog-centered',
      backdrop: 'static'
    });

    modal.content.onClose.pipe(takeUntil(this.unsubscribe))
      .subscribe((stops: any) => {
        this.clearMarkers();
        this.project.stops = stops;
        this.setMarkers();
        this.setPolyline();
      });
  }

  public stopInfo(stop: any) {

    this.project.stops.forEach((stop: any, index: number) => {
      stop.marker.setZIndex((index + 1) * 9);
    });

    this.project.drivers.forEach((driver: any, index: number) => {
      driver.marker.setZIndex((index + 1) * 9);
    });

    stop.marker.setZIndex(9999999999);

    this.map.setZoom(13);

    this.map.panTo(stop.marker.position);

    let content = document.createElement('div');

    content.innerHTML = `
      <h5 class="text-dark m-1">Stop</h5>
      <p class="text-dark m-1">
        <strong>
          <b class="mr-1">Order ID:</b> ${stop.order_id}
        </strong>
      </p>
      <p class="text-dark m-1">
        <strong>
          <b class="mr-1">Name:</b> ${stop.name}
        </strong>
      </p>
      <p class="text-dark m-1">
        <strong>
          <b class="mr-1">Phone:</b> ${stop.phone}
        </strong>
      </p>
      <p class="text-dark m-1">
        <strong>
          <b class="mr-1">Address:</b> ${stop.address}
        </strong>
      </p>
    `;

    const buttonEdit = document.createElement('button');

    buttonEdit.setAttribute('class', 'btn btn-outline-dark btn-sm m-1');

    buttonEdit.innerHTML = '<i class="ri-edit-box-line"></i> Edit';

    buttonEdit.onclick = () => this.modalStop(stop);

    content.appendChild(buttonEdit);

    const buttonDelete = document.createElement('button');

    buttonDelete.setAttribute('class', 'btn btn-outline-dark btn-sm m-1');

    buttonDelete.innerHTML = '<i class="ri-delete-bin-line"></i> Delete';

    buttonDelete.onclick = () => this.deleteStop(stop);

    content.appendChild(buttonDelete);

    this.infoWindow.setContent(content);

    this.infoWindow.open(this.map, stop.marker);

  }

  public stopInfoById(id: number) {

    const index = ArrayHelper.getIndexByKey(this.project.stops, 'id', id);

    const stop = this.project.stops[index];

    this.stopInfo(stop);

  }

  public deleteStop(stop: any) {

    this.alertSrv.show({
      icon: 'warning',
      message: `This will permanently delete the stop "${stop.name}". Continue?`,
      onConfirm: () => {
        this.loadingSrv.show();
        this.stopSrv.delete(stop.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            this.loadingSrv.hide();

            if (res.success) {

              const index = ArrayHelper.getIndexByKey(this.project.stops, 'id', stop.id);

              this.clearMarkers();

              this.project.stops = ArrayHelper.removeItem(this.project.stops, index);

              this.setMarkers();

              this.setPolyline();

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

            }

          });
      }
    });

  }

  public modalDriver(index?: number) {

    const driver = this.drivers[index];

    const modal = this.modalSrv.show(ModalDriverComponent, {
      keyboard: false,
      class: 'modal-dialog-centered',
      backdrop: 'static',
      initialState: {
        driver: driver,
        project_id: driver ? null : this.project.id
      }
    });

    modal.content.onClose.pipe(takeUntil(this.unsubscribe))
      .subscribe((result: any) => {

        if (driver) {

          this.drivers[index] = result;

          const index2 = ArrayHelper.getIndexByKey(this.project.drivers, 'id', driver.id);

          if (index2 != -1) {
            this.clearMarkers();
            this.project.drivers[index2] = result;
          }

        }

        else {
          this.project.drivers.push(result);
          this.drivers.push(result);
        }

        this.setMarkers();

        this.setPolyline();

      });
  }

  public driverInfo(driver: any) {

    this.project.stops.forEach((stop: any, index: number) => {
      stop.marker.setZIndex((index + 1) * 9);
    });

    this.project.drivers.forEach((driver: any, index: number) => {
      driver.marker.setZIndex((index + 1) * 9);
    });

    driver.marker.setZIndex(9999999999);

    this.map.setZoom(13);

    this.map.panTo(driver.marker.position);

    let content = document.createElement('div');

    content.innerHTML = `
      <h5 class="text-dark m-1">Driver</h5>
      <p class="text-dark m-1">
        <strong>
          <b class="mr-1">Name:</b> ${driver.name}
        </strong>
      </p>
      <p class="text-dark m-1">
        <strong>
          <b class="mr-1">Phone:</b> ${driver.phone}
        </strong>
      </p>
      <p class="text-dark m-1">
        <strong>
          <b class="mr-1">Start Address:</b> ${driver.start_address}
        </strong>
      </p>
    `;

    this.infoWindow.setContent(content);

    this.infoWindow.open(this.map, driver.marker);

  }

  public driverInfoById(id: number) {

    const index = ArrayHelper.getIndexByKey(this.project.drivers, 'id', id);

    if (index == -1) return;

    const driver = this.project.drivers[index];

    this.driverInfo(driver);

  }

  public optimize() {

    this.loadingSrv.show();

    this.projectSrv.optimize(this.project.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.loadingSrv.hide();

        if (res.success) {

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });

          this.clearMarkers();

          this.project = res.data;

          this.setPolyline();

          this.setMarkers();

        }

      });

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

  private setPolyline() {

    this.polyline.forEach(line => {
      line.setMap(null);
    });

    this.polyline = [];

    this.project.drivers.forEach((driver: any, index: number) => {

      if (driver.pivot && driver.pivot.polyline_points) {

        driver.pivot.polyline_points.forEach((polyline: any) => {

          const path = google.maps.geometry.encoding.decodePath(polyline);

          this.polyline.push(new google.maps.Polyline({
            map: this.map,
            path: path,
            strokeColor: this.colors[index],
            strokeOpacity: 0.6,
            strokeWeight: 4
          }));

        });

      }

    });

  }

  private setMarkers() {

    this.project.drivers.forEach((driver: any, driver_index: number) => {

      if (driver.marker) {
        driver.marker.setMap(null);
      }

      driver.marker = new google.maps.Marker({
        map: this.map,
        position: new google.maps.LatLng(driver.start_lat, driver.start_lng),
        zIndex: (driver_index + 1) * 9,
        icon: {
          path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0",
          fillColor: this.colors[driver_index],
          fillOpacity: 1,
          strokeWeight: 1.5,
          strokeColor: '#FFFFFF',
          scale: 1.5
        }
      });

      google.maps.event.addListener(driver.marker, 'click', (() => this.driverInfo(driver)));

      if (driver.pivot && driver.pivot.stops_order) {

        driver.pivot.stops_order.forEach((stop_id: number, stop_order_index: number) => {

          const index = ArrayHelper.getIndexByKey(this.project.stops, 'id', stop_id);

          const stop = this.project.stops[index];

          if (stop.marker) {
            stop.marker.setMap(null);
          }

          stop.marker = new google.maps.Marker({
            map: this.map,
            position: new google.maps.LatLng(stop.lat, stop.lng),
            zIndex: (stop_order_index + 1) * 9,
            icon: {
              path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
              fillColor: this.colors[driver_index],
              fillOpacity: 1,
              strokeWeight: 1.5,
              strokeColor: '#FFFFFF',
              scale: 1.2,
              labelOrigin: new google.maps.Point(0, -29),
              anchor: new google.maps.Point(0, 0)
            },
            label: {
              text: String(stop_order_index + 1),
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: '500'
            }
          });

          google.maps.event.addListener(stop.marker, 'click', (() => this.stopInfo(stop)));

          this.project.stops[index] = stop;

        });

      }

    });

    this.project.stops.forEach((stop: any, index: number) => {

      if (!stop.driver_id) {

        if (stop.marker) {
          stop.marker.setMap(null);
        }

        stop.marker = new google.maps.Marker({
          map: this.map,
          position: new google.maps.LatLng(stop.lat, stop.lng),
          zIndex: (index + 1) * 9,
          icon: {
            path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0",
            fillColor: '#6F6C6B',
            fillOpacity: 1,
            strokeWeight: 1.5,
            strokeColor: '#FFFFFF',
            scale: 1.2
          }
        });

        google.maps.event.addListener(stop.marker, 'click', (() => this.stopInfo(stop)));

      }

    });

    this.centerMap();

  }

  private clearMarkers() {

    this.project.drivers.forEach((driver: any) => {
      if (driver.marker) {
        driver.marker.setMap(null);
      }
    });

    this.project.stops.forEach((stop: any) => {
      if (stop.marker) {
        stop.marker.setMap(null);
      }
    });

  }

  private centerMap() {

    const bounds = new google.maps.LatLngBounds();
    
    this.project.drivers.forEach((driver: any) => {
      bounds.extend(driver.marker.position);
    });

    this.project.stops.forEach((stop: any) => {
      bounds.extend(stop.marker.position);
    });

    if (this.project.stops.length > 0 || this.project.drivers.length > 0) {

      this.map.fitBounds(bounds);

      this.map.setZoom(9);

    }

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

          this.project = res.data;

          this.setPolyline();

        }

      });

  }

  private initMap() {

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: new google.maps.LatLng(37.33772, -121.88741),
      zoom: 9,
      zoomControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

  }

  private initDrivers() {

    this.loadingSrv.show();

    this.driverSrv.getAll()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.loadingSrv.hide();

        this.drivers = res.data;

      });

  }

  private initProject() {

    this.loadingSrv.show();

    const project = this.projectSrv.getCurrentProject();

    this.projectSrv.getById(project.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.loadingSrv.hide();

        this.project = res.data;

        if (this.project.status == 0) {
          this.display = 1;
        }

        else if (this.project.status > 0) {
          this.display = 2;
        }

        this.setMarkers();

        this.setPolyline();

        this.initDrivers();

      });

  }

}
