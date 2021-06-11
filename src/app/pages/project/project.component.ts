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
import { environment } from 'src/environments/environment';
import * as md5 from 'md5';

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
   * 2 : Expand "map footer".
   */
  public display: 0 | 1 | 2 = 0;

  /*
   * 1 : Show "timeline".
   * 2 : Show "dispatch".
   */
  public tab: 1 | 2 = 1;

  public project: any;

  public drivers: any[] = [];

  public unscheduled: any[] = [];

  public unscheduled_order: any[] = [];

  public colors = ['#0000cd', '#ff0000', '#2e8b57', '#ffa500', '#c71585', '#ff4500', '#808000', '#1e90ff', '#e9967a', '#2f4f4f', '#8b0000', '#191970', '#ff00ff', '#00ff00', '#ba55d3', '#00fa9a', '#f0e68c', '#dda0dd', '#006400', '#ffd700'];

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
      group: 'stops',
      onAdd: (event: any) => {
        this.reorder(this.project.drivers[event.to.id]);
      },
      onUpdate: (event: any) => {
        this.reorder(this.project.drivers[event.to.id]);
      }
    }

    this.initMap();

    this.initProject();

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
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

                  this.clearMarkers();

                  this.project = res.data;

                  this.setTime();

                  this.setUnscheduled();

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

              this.setTime();

              this.setUnscheduled();

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

          if (stop.driver_id != result.driver_id) {





          }

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
        this.setUnscheduled();
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

    this.map.setZoom(11);

    this.map.panTo(stop.marker.position);

    let content = document.createElement('div');

    const driver_index = ArrayHelper.getIndexByKey(this.project.drivers, 'id', stop.driver_id);

    const route_index = ArrayHelper.getIndexByKey(this.project.drivers[driver_index].pivot.routes, 'end_id', stop.id);

    const route = this.project.drivers[driver_index].pivot.routes[route_index];

    if (stop.status == 0) {

      content.innerHTML = `
        <div class="row mt-1">
          <div class="col">
            <h5>Stop</h5>
          </div>
          <div class="col text-right">
            <span class="badge badge-light">Waiting</span>
          </div>
        </div>
      `;
    }

    else if (stop.status == 1) {

      content.innerHTML = `
        <div class="row mt-1">
          <div class="col">
            <h5>Stop</h5>
          </div>
          <div class="col text-right">
            <span class="badge badge-primary">Started</span>
          </div>
        </div>

        <div class="row mt-1">
          <div class="col">
            <h6>Started at:</h6>
          </div>
          <div class="col text-right">
            <b>${route.started_at}</b>
          </div>
        </div>
      `;

    }

    else if (stop.status == 2) {

      content.innerHTML = `
        <div class="row mt-1">
          <div class="col">
            <h5>Stop</h5>
          </div>
          <div class="col text-right">
            <span class="badge badge-success">Arrived</span>
          </div>
        </div>

        <div class="row mt-1">
          <div class="col">
            <h6>Arrived at:</h6>
          </div>
          <div class="col text-right">
            <b>${route.arrived_at}</b>
          </div>
        </div>
      `;

    }

    else if (stop.status == 3) {

      content.innerHTML = `
        <div class="row mt-1">
          <div class="col">
            <h5>Stop</h5>
          </div>
          <div class="col text-right">
            <span class="badge badge-danger">Skipped</span>
          </div>
        </div>

        <div class="row mt-1">
          <div class="col">
            <h6>Skipped at:</h6>
          </div>
          <div class="col text-right">
            <b>${route.skipped_at}</b>
          </div>
        </div>
      `;

    }

    content.innerHTML += `
      <div class="row mt-1">
        <div class="col">
          <h6>Order ID:</h6>
        </div>
        <div class="col text-right">
          <b>${stop.order_id}</b>
        </div>
      </div>

      <div class="row mt-1">
        <div class="col">
          <h6>Name:</h6>
        </div>
        <div class="col text-right">
          <b>${stop.name}</b>
        </div>
      </div>

      <div class="row mt-1">
        <div class="col">
          <h6>Phone:</h6>
        </div>
        <div class="col text-right">
          <b>${stop.phone}</b>
        </div>
      </div>

      <div class="row mt-1">
        <div class="col">
          <h6>Address:</h6>
        </div>
        <div class="col text-right">
          <b>${stop.address}</b>
        </div>
      </div>
    `;

    if (stop.status == 0) {

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

    }

    else {

      if (route.bags) {

        content.innerHTML += `
          <div class="row mt-1">
            <div class="col">
              <h6>Bags:</h6>
            </div>
            <div class="col text-right">
              <b>${route.bags}</b>
            </div>
          </div>
        `;

      }

      if (route.note) {

        content.innerHTML += `
          <div class="row mt-1">
            <div class="col">
              <h6>Note:</h6>
            </div>
            <div class="col text-right">
              <b>${route.note}</b>
            </div>
          </div>
        `;

      }

      if (route.image) {

        content.innerHTML += `
          <div class="row mt-1">
            <div class="col">
              <h6>Image:</h6>
            </div>
            <div class="col text-right">
              <a href="${route.image}" target="_blank">
                <img class="img-thumbnail fit-image" src="${route.image}" style="width: 60px; height: 60px">
              </a>
            </div>
          </div>
        `;

      }

    }

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

  public modalDriver(driver?: any) {

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

          let index = ArrayHelper.getIndexByKey(this.drivers, 'id', driver.id);

          this.drivers[index] = result;

          index = ArrayHelper.getIndexByKey(this.project.drivers, 'id', driver.id);

          if (index != -1) {
            this.clearMarkers();
            this.project.drivers[index].name = result.name;
            this.project.drivers[index].phone = result.phone;
            this.project.drivers[index].start_time = result.start_time;
            this.project.drivers[index].end_time = result.end_time;
            this.project.drivers[index].start_address = result.start_address;
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

    this.map.setZoom(11);

    this.map.panTo(driver.marker.position);

    let content = document.createElement('div');

    content.innerHTML = `
      <div class="row mt-1">
        <div class="col">
          <h5>Driver</h5>
        </div>
      </div>

      <div class="row mt-1">
        <div class="col">
          <h6>Name:</h6>
        </div>
        <div class="col text-right">
          <b>${driver.name}</b>
        </div>
      </div>

      <div class="row mt-1">
        <div class="col">
          <h6>Phone:</h6>
        </div>
        <div class="col text-right">
          <b>${driver.phone}</b>
        </div>
      </div>

      <div class="row mt-1">
        <div class="col">
          <h6>Start Time:</h6>
        </div>
        <div class="col text-right">
          <b>${driver.start_time.slice(0, 5)}</b>
        </div>
      </div>

      <div class="row mt-1">
        <div class="col">
          <h6>End Time:</h6>
        </div>
        <div class="col text-right">
          <b>${driver.end_time?.slice(0, 5) ?? '-'}</b>
        </div>
      </div>

      <div class="row mt-1">
        <div class="col">
          <h6>Start Address:</h6>
        </div>
        <div class="col text-right">
          <b>${driver.start_address}</b>
        </div>
      </div>
    `;

    const buttonEdit = document.createElement('button');

    buttonEdit.setAttribute('class', 'btn btn-outline-dark btn-sm m-1');

    buttonEdit.innerHTML = '<i class="ri-edit-box-line"></i> Edit';

    buttonEdit.onclick = () => this.modalDriver(driver);

    content.appendChild(buttonEdit);

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

          this.setTime();

          this.setUnscheduled();

          this.setMarkers();

          this.setPolyline();

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

          this.project.status = 2;

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

  // public progress(driver: any) {

  //   const start_time = new 

  //   var date1 = new Date(dtPartida.slice(0,4), dtPartida.slice(4,6),dtPartida.slice(6,8), dtPartida.slice(9,11), dtPartida.slice(12,14)),
  //       date2 = new Date(dtChegada.slice(0,4), dtChegada.slice(4,6),dtChegada.slice(6,8), dtChegada.slice(9,11), dtChegada.slice(12,14));

  //   var diffMs = (date2 - date1);

  // }

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

    this.unscheduled.forEach((stop: any, index: number) => {

      if (!stop.driver_id) {

        if (stop.marker) {
          stop.marker.setMap(null);
        }

        stop.marker = new google.maps.Marker({
          map: this.map,
          position: new google.maps.LatLng(stop.lat, stop.lng),
          zIndex: (index + 1) * 9,
          icon: {
            path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
            fillColor: '#6F6C6B',
            fillOpacity: 1,
            strokeWeight: 1.5,
            strokeColor: '#FFFFFF',
            scale: 1.2,
            labelOrigin: new google.maps.Point(0, -29),
            anchor: new google.maps.Point(0, 0)
          },
          label: {
            text: String(index + 1),
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: '500'
          }
        });

        google.maps.event.addListener(stop.marker, 'click', (() => this.stopInfo(stop)));

      }

    });

    this.centerMap();

  }

  private setUnscheduled() {

    this.unscheduled = this.project.stops.filter((stop: any) => {
      return stop.driver_id == null;
    });

    this.unscheduled_order = this.unscheduled.map((stop: any) => {
      return stop.id;
    });

  }

  private setTime() {

    this.project.drivers.forEach((driver: any) => {

      let duration = 0;

      const split = driver.start_time.split(':');

      const date = new Date();

      driver.pivot.routes.forEach((route: any) => {

        duration += route.duration;

        date.setHours(Number(split[0]), Number(split[1]), 0, 0);

        date.setSeconds(date.getSeconds() + duration);

        route.time = date.toLocaleTimeString(navigator.language, {
          hour: '2-digit',
          minute: '2-digit'
        });

        duration += route.downtime;
        
      });

    });

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
      if (stop.marker) {
        bounds.extend(stop.marker.position);
      }
    });

    if (this.project.stops.length > 0 || this.project.drivers.length > 0) {

      this.map.fitBounds(bounds);

      this.map.setZoom(10);

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

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });

          this.clearMarkers();

          this.project = res.data;

          this.setTime();

          this.setUnscheduled();

          this.setMarkers();

          this.setPolyline();

        }

      });

  }

  private initMap() {

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: {
        lat: 37.33772,
        lng: -121.88741
      },
      zoom: 11,
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

        this.setTime();

        if (this.project.status == 0) {
          this.display = 1;
        }

        else if (this.project.status > 0) {
          this.display = 2;
        }

        this.setUnscheduled();

        this.setMarkers();

        this.setPolyline();

        this.initDrivers();

      });

  }

}
