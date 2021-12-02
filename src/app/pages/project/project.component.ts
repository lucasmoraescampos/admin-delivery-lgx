import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArrayHelper } from 'src/app/helpers/array.helper';
import { ModalDriverComponent } from 'src/app/modals/modal-driver/modal-driver.component';
import { ModalStopComponent } from 'src/app/modals/modal-stop/modal-stop.component';
import { ModalUploadStopsComponent } from 'src/app/modals/modal-upload-stops/modal-upload-stops.component';
import { ModalDriverTimeComponent } from 'src/app/modals/modal-driver-time/modal-driver-time.component';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormGroupDirective } from '@angular/forms';

import { AlertService } from 'src/app/services/alert.service';
import { DriverService } from 'src/app/services/driver.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ProjectService } from 'src/app/services/project.service';

declare const google: any;

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {

  @ViewChild('map', { static: true }) mapElement: ElementRef;

  @ViewChild('modal', { static: true }) modalElement: ElementRef;

  private lastStopChanged: any = null;

  public mapFullscreen: boolean;

  public project: any;

  private map: any;

  public drivers: any[] = [];

  public driversAux: any[] = [];

  public stops_markers: any[];

  public drivers_markers: any[];

  private polyline: any[] = [];

  public colors = ['#0000cd', '#ff0000', '#2e8b57', '#ffa500', '#c71585', '#ff4500', '#808000', '#1e90ff', '#e9967a', '#2f4f4f', '#8b0000', '#191970', '#ff00ff', '#00ff00', '#ba55d3', '#00fa9a', '#f0e68c', '#dda0dd', '#006400', '#ffd700'];

  private infoWindow = new google.maps.InfoWindow();
  private unsubscribe = new Subject();

  private modalRef: BsModalRef;

  formGroupDriverTime: FormGroup;


  constructor(
    private modalSrv: BsModalService,
    private loadingSrv: LoadingService,
    private alertSrv: AlertService,
    private driverSrv: DriverService,
    private projectSrv: ProjectService,
    private _formBuilder: FormBuilder
  ) {
  }


  ngOnInit() {
    this.initMap();
    this.initProject();

    this.formGroupDriverTime = this._formBuilder.group({
      start_time: [],
      end_time: [],
    });
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
            .subscribe(res => {

              this.loadingSrv.hide();

              if (res.success) {

                this.alertSrv.toast({
                  icon: 'success',
                  message: res.message
                });

              }

            }, err => {
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
      const initialState = { driver: driver };

      this.modalRef = this.modalSrv.show(ModalDriverTimeComponent, {
        class: 'modal-dialog-centered',
        keyboard: false,
        backdrop: 'static',
        initialState: { initialState }
      });

      this.modalRef.content.onClose.subscribe(res => {
        if (res == false)
          ev.target.checked = !ev.target.checked;
      });

      this.modalRef.content.onSubmit.subscribe(post => {
        this.addDriver(driver, ev, post);
      });
    }
  }



  public addDriver(driver: any, ev: any, post: any) {
    this.loadingSrv.show();

    this.projectSrv.addProjectDriver(this.project.id, driver.id, post)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.loadingSrv.hide();

        if (res.success) {
          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });
        }

      }, err => {

        this.loadingSrv.hide();
        ev.target.checked = !ev.target.checked;
      }

      );
  }



  public modalDismiss() {
    //this.formGroup.reset();
    this.modalRef.hide();
  }



  public driverAddress(driver: any) {

    const index = ArrayHelper.getIndexByKey(this.project.drivers, 'id', driver.id);

    if (index != -1 && this.project.drivers[index].pivot.routes.length > 0) {
      return this.project.drivers[index].pivot.routes[0].start_address;
    }
    else {
      return driver.start_address;
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

    modal.content.onUpdated.pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {

        this.loadingSrv.show();

        this.projectSrv.getById(this.project.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            this.loadingSrv.hide();

          });
        
      });

  }



  public modalUploadStops() {
    this.modalSrv.show(ModalUploadStopsComponent, {
      keyboard: false,
      class: 'modal-dialog-centered',
      backdrop: 'static'
    });
  }



  public stopInfo(stop: any) {

    let content = document.createElement('div');

    const driver_index = stop.driver_id ? ArrayHelper.getIndexByKey(this.project.drivers, 'id', stop.driver_id) : null;
    const route_index = driver_index !== null ? ArrayHelper.getIndexByKey(this.project.drivers[driver_index].pivot.routes, 'end_id', stop.id) : null;
    const route = route_index !== null ? this.project.drivers[driver_index].pivot.routes[route_index] : null;

    if (stop.status == 0) {
      content.innerHTML = `
        <div class="d-flex mt-1">
          <div class="flex-shrink-0">
            <h5>Stop</h5>
          </div>
          <div class="flex-grow-1 ms-3 text-right">
            <span class="badge badge-light">Waiting</span>
          </div>
        </div>
      `;
    }
    else if (stop.status == 1) {

      const started_at = new Date(route.started_at)
        .toLocaleTimeString(navigator.language, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

      content.innerHTML = `
        <div class="d-flex mt-1">
          <div class="flex-shrink-0">
            <h5>Stop</h5>
          </div>
          <div class="flex-grow-1 ms-3 text-right">
            <span class="badge badge-primary">Started</span>
          </div>
        </div>

        <div class="d-flex mt-1">
          <div class="flex-shrink-0">
            <h6>Started at:</h6>
          </div>
          <div class="flex-grow-1 ms-3 text-right">
            <b>${started_at}</b>
          </div>
        </div>
      `;

    }
    else if (stop.status == 2) {

      const arrived_at = new Date(route.arrived_at)
        .toLocaleTimeString(navigator.language, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

      content.innerHTML = `
        <div class="d-flex mt-1">
          <div class="flex-shrink-0">
            <h5>Stop</h5>
          </div>
          <div class="flex-grow-1 ms-3 text-right">
            <span class="badge badge-success">Delivered</span>
          </div>
        </div>

        <div class="d-flex mt-1">
          <div class="flex-shrink-0">
            <h6>Delivered at:</h6>
          </div>
          <div class="flex-grow-1 ms-3 text-right">
            <b>${arrived_at}</b>
          </div>
        </div>
      `;

    }
    else if (stop.status == 3) {

      const skipped_at = new Date(route.skipped_at)
        .toLocaleTimeString(navigator.language, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

      content.innerHTML = `
        <div class="d-flex mt-1">
          <div class="flex-shrink-0">
            <h5>Stop</h5>
          </div>
          <div class="flex-grow-1 ms-3 text-right">
            <span class="badge badge-danger">Skipped</span>
          </div>
        </div>

        <div class="d-flex mt-1">
          <div class="flex-shrink-0">
            <h6>Skipped at:</h6>
          </div>
          <div class="flex-grow-1 ms-3 text-right">
            <b>${skipped_at}</b>
          </div>
        </div>
      `;

    }

    content.innerHTML += `
      <div class="d-flex mt-1">
        <div class="flex-shrink-0">
          <h6>Order ID:</h6>
        </div>
        <div class="flex-grow-1 ms-3 text-right">
          <b>${stop.order_id}</b>
        </div>
      </div>

      <div class="d-flex mt-1">
        <div class="flex-shrink-0">
          <h6>Name:</h6>
        </div>
        <div class="flex-grow-1 ms-3 text-right">
          <b>${stop.name}</b>
        </div>
      </div>

      <div class="d-flex mt-1">
        <div class="flex-shrink-0">
          <h6>Phone:</h6>
        </div>
        <div class="flex-grow-1 ms-3 text-right">
          <b>${stop.phone}</b>
        </div>
      </div>

      <div class="d-flex mt-1">
        <div class="flex-shrink-0">
          <h6>Address:</h6>
        </div>
        <div class="flex-grow-1 ms-3 text-right">
          <b>${stop.address}</b>
        </div>
      </div>
    `;

    const buttonEdit = document.createElement('button');
    buttonEdit.setAttribute('class', 'btn btn-outline-dark btn-sm m-1');
    buttonEdit.innerHTML = '<i class="ri-edit-box-line"></i> Edit';
    buttonEdit.onclick = () => this.modalStop(stop);

    if (stop.status == 0) {

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
          <div class="d-flex mt-1">
            <div class="flex-shrink-0">
              <h6>Bags:</h6>
            </div>
            <div class="flex-grow-1 ms-3 text-right">
              <b>${route.bags}</b>
            </div>
          </div>
        `;
      }

      if (route.note) {
        content.innerHTML += `
          <div class="d-flex mt-1">
            <div class="flex-shrink-0">
              <h6>Note:</h6>
            </div>
            <div class="flex-grow-1 ms-3 text-right">
              <b>${route.note}</b>
            </div>
          </div>
        `;
      }

      if (route.image) {
        content.innerHTML += `
          <div class="d-flex mt-1">
            <div class="flex-shrink-0">
              <h6>Image:</h6>
            </div>
            <div class="flex-grow-1 ms-3 text-right">
              <a href="${route.image}" target="_blank">
                <img class="img-thumbnail fit-image" src="${route.image}" style="width: 60px; height: 60px">
              </a>
            </div>
          </div>
        `;
      }

      content.appendChild(buttonEdit);

    }

    this.drivers_markers.forEach((driver_marker: any, index: number) => {
      driver_marker.marker.setZIndex((index + 1) * 9);
    });

    this.stops_markers.forEach((stop_marker: any, index: number) => {

      if (stop_marker.id == stop.id) {

        stop_marker.marker.setZIndex(9999999999);
        this.map.panTo(stop_marker.marker.position);
        // this.map.setZoom(9);
        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, stop_marker.marker);
      }
      else {
        stop_marker.marker.setZIndex((index + 1) * 9);
      }
    });
  }



  public deleteStop(stop: any) {

    this.alertSrv.show({
      icon: 'warning',
      message: `This will permanently delete the stop "${stop.name}". Continue?`,
      onConfirm: () => {

        this.loadingSrv.show();

        this.infoWindow.close();

        this.projectSrv.deleteProjectStop(this.project.id, stop.id)
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

            this.project.drivers[index].name = result.name;
            this.project.drivers[index].phone = result.phone;
            this.project.drivers[index].start_time = result.start_time;
            this.project.drivers[index].end_time = result.end_time;
            this.project.drivers[index].start_address = result.start_address;

            this.projectSrv.setCurrentProject(this.project);

          }

        }
        else {

          this.drivers.push(result);
          this.project.drivers.push(result);
          this.projectSrv.setCurrentProject(this.project);
        }

      });

  }



  public driverInfo(driver: any) {
    let content = document.createElement('div');
    let parts = [];

    if (driver.pivot?.start_time)
      parts = driver.pivot?.start_time.split(':');
    else if (typeof driver.projectInfo !== 'undefined' && driver.projectInfo.start_time !== null)
      parts = driver.projectInfo.start_time.split(':');
    else
      parts = driver.start_time.split(':');

    const date = new Date();

    date.setHours(parts[0], parts[1], 0, 0);

    const start_time = date.toLocaleTimeString(navigator.language, {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (driver.pivot?.end_time)
      parts = driver.pivot?.end_time.split(':');
    else if (typeof driver.projectInfo !== 'undefined' && driver.projectInfo.end_time !== null)
      parts = driver.projectInfo.end_time.split(':');
    else
      parts = driver.end_time.split(':');

    date.setHours(parts[0], parts[1], 0, 0);

    const end_time = date.toLocaleTimeString(navigator.language, {
      hour: '2-digit',
      minute: '2-digit'
    });

    let startAddress = '';

    if (driver.pivot?.start_address)
      startAddress = driver.pivot?.start_address;
    else if (typeof driver.projectInfo !== 'undefined' && driver.projectInfo.start_address !== null)
      startAddress = driver.projectInfo.start_address;
    else
      startAddress = driver.start_address;

    let flag = false;

    this.project.drivers.forEach((drv: any, index: number) => {
      if (driver.id == drv.id && (drv.pivot.start_lat == 'null' || drv.pivot.start_lng == 'null')) {
        flag = true;

        this.alertSrv.toast({
          icon: 'error',
          message: 'Driver "' + drv.name + '" : position not found'
        });
      }
    });

    if (flag)
      return;

    content.innerHTML = `
      <div class="d-flex mt-1">
        <div class="flex-shrink-0">
          <h5>Driver</h5>
        </div>
      </div>

      <div class="d-flex mt-1">
        <div class="flex-shrink-0">
          <h6>Name:</h6>
        </div>
        <div class="flex-grow-1 ms-3 text-right">
          <b>${driver.name}</b>
        </div>
      </div>

      <div class="d-flex mt-1">
        <div class="flex-shrink-0">
          <h6>Phone:</h6>
        </div>
        <div class="flex-grow-1 ms-3 text-right">
          <b>${driver.phone}</b>
        </div>
      </div>

      <div class="d-flex mt-1">
        <div class="flex-shrink-0">
          <h6>Start Time:</h6>
        </div>
        <div class="flex-grow-1 ms-3 text-right">
          <b>${start_time}</b>
        </div>
      </div>

      <div class="d-flex mt-1">
        <div class="flex-shrink-0">
          <h6>End Time:</h6>
        </div>
        <div class="flex-grow-1 ms-3 text-right">
          <b>${end_time}</b>
        </div>
      </div>

      <div class="d-flex mt-1">
        <div class="flex-shrink-0">
          <h6>Start Address:</h6>
        </div>
        <div class="flex-grow-1 ms-3 text-right">
          <b>${startAddress}</b>
        </div>
      </div>
    `;

    const buttonEdit = document.createElement('button');

    buttonEdit.setAttribute('class', 'btn btn-outline-dark btn-sm m-1');

    buttonEdit.innerHTML = '<i class="ri-edit-box-line"></i> Edit';

    //buttonEdit.onclick = () => this.modalDriver(driver);
    buttonEdit.onclick = () => this.updateDriver(driver);

    content.appendChild(buttonEdit);

    this.stops_markers.forEach((stop_marker: any, index: number) => {
      stop_marker.marker.setZIndex((index + 1) * 9);
    });

    this.drivers_markers.forEach((driver_marker: any, index: number) => {

      if (driver_marker.id == driver.id) {
        driver_marker.marker.setZIndex(9999999999);

        this.map.panTo(driver_marker.marker.position);
        this.map.setZoom(9);
        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, driver_marker.marker);
      }
      else {
        driver_marker.marker.setZIndex((index + 1) * 9);
      }

    });

  }



  private updateDriver(driver) {
    const initialState = { driver: driver };

    this.modalRef = this.modalSrv.show(ModalDriverTimeComponent, {
      class: 'modal-dialog-centered',
      keyboard: false,
      backdrop: 'static',
      initialState: { initialState }
    });

    this.modalRef.content.onSubmit.subscribe(post => {

      this.loadingSrv.show();

      this.projectSrv.editProjectDriver(this.project.id, driver.id, post)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          this.loadingSrv.hide();

          if (res.success) {
            this.alertSrv.toast({
              icon: 'success',
              message: res.message
            });
          }

        }, err => {
          this.loadingSrv.hide();
        });
    });
  }



  public optimize() {

    this.loadingSrv.show();

    this.alertSrv.toast({
      icon: 'warning',
      message: 'Optimizing the route. Please wait.',
      duration: 30000
    });

    this.projectSrv.optimize(this.project.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.loadingSrv.hide();

        if (res.success) {
          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });
        }

      }, res => {

        this.loadingSrv.hide();

        this.alertSrv.toast({
          icon: 'error',
          message: res.error.message
        });
      });
  }



  private setPolyline() {

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

    this.drivers_markers = [];
    this.stops_markers = [];

    this.project.drivers.forEach((driver: any, driver_index: number) => {

      if (driver.pivot && driver.pivot.stops_order.length > 0) {
        const marker = new google.maps.Marker({
          map: this.map,
          position: new google.maps.LatLng(driver.pivot.routes[0].start_lat, driver.pivot.routes[0].start_lng),
          zIndex: (driver_index + 1) * 9,
          icon: {
            path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
            fillColor: this.colors[driver_index],
            fillOpacity: 1,
            strokeWeight: 1.5,
            strokeColor: '#FFFFFF',
            scale: 1.3
          }
        });

        this.drivers_markers.push({
          id: driver.id,
          marker: marker
        });

        google.maps.event.addListener(marker, 'click', (() => this.driverInfo(driver)));

        driver.pivot.stops_order.forEach((stop_id: number, route_index: number) => {

          const index = ArrayHelper.getIndexByKey(this.project.stops, 'id', stop_id);

          const stop = this.project.stops[index];

          const marker = new google.maps.Marker({
            map: this.map,
            position: new google.maps.LatLng(stop.lat, stop.lng),
            zIndex: (route_index + 1) * 9,
            icon: {
              path: 'M28.545,35.9 C34.615,32.749 38.748,26.454 38.748,19.204 C38.748,8.797 30.224,0.36 19.708,0.36 C9.193,0.36 0.668,8.797 0.668,19.204 C0.668,26.455 4.805,32.749 10.871,35.9 C13.848,48.462 17.636,62.487 19.707,62.487 C21.779,62.487 25.566,48.467 28.543,35.9',
              fillColor: this.colors[driver_index],
              fillOpacity: 1,
              strokeWeight: 1.5,
              strokeColor: '#FFFFFF',
              scale: 0.6,
              labelOrigin: new google.maps.Point(20, 18),
              anchor: new google.maps.Point(20, 50)
            },
            label: {
              text: String(route_index + 1),
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: '300'
            }
          });

          this.stops_markers.push({
            id: stop.id,
            marker: marker
          });

          google.maps.event.addListener(marker, 'click', (() => this.stopInfo(stop)));

        });

      }
      else // if (driver.pivot && driver.pivot.stops_order.length > 0)
      {

        if (driver.pivot.start_lat == 'null' || driver.pivot.start_lng == 'null')
          this.alertSrv.toast({
            icon: 'error',
            message: 'Driver "' + driver.name + '" : position not found'
          });

        const marker = new google.maps.Marker({
          map: this.map,
          position: new google.maps.LatLng(driver.pivot.start_lat, driver.pivot.start_lng),
          zIndex: (driver_index + 1) * 9,
          icon: {
            path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
            fillColor: this.colors[driver_index],
            fillOpacity: 1,
            strokeWeight: 1.5,
            strokeColor: '#FFFFFF',
            scale: 1.3
          }
        });

        this.drivers_markers.push({
          id: driver.id,
          marker: marker
        });

        google.maps.event.addListener(marker, 'click', (() => this.driverInfo(driver)));

      } // else - if (driver.pivot && driver.pivot.stops_order.length > 0)

    });

    let number = 1;

    this.project.stops.forEach((stop: any, index: number) => {

      if (stop.driver_id == null) {

        const marker = new google.maps.Marker({
          map: this.map,
          position: new google.maps.LatLng(stop.lat, stop.lng),
          zIndex: (index + 1) * 9,
          icon: {
            path: 'M28.545,35.9 C34.615,32.749 38.748,26.454 38.748,19.204 C38.748,8.797 30.224,0.36 19.708,0.36 C9.193,0.36 0.668,8.797 0.668,19.204 C0.668,26.455 4.805,32.749 10.871,35.9 C13.848,48.462 17.636,62.487 19.707,62.487 C21.779,62.487 25.566,48.467 28.543,35.9',
            fillColor: '#6F6C6B',
            fillOpacity: 1,
            strokeWeight: 1.5,
            strokeColor: '#FFFFFF',
            scale: 0.6,
            labelOrigin: new google.maps.Point(20, 18),
            anchor: new google.maps.Point(20, 50)
          },
          label: {
            text: String(number),
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: '300'
          }
        });

        this.stops_markers.push({
          id: stop.id,
          marker: marker
        });

        google.maps.event.addListener(marker, 'click', (() => this.stopInfo(stop)));

        number++;

      }

    });

  }



  private centerMap() {

    const bounds = new google.maps.LatLngBounds();

    this.project.drivers.forEach((driver: any) => {

      if (driver.pivot && driver.pivot.stops_order.length > 0) {
        bounds.extend(new google.maps.LatLng(driver.pivot.routes[0].start_lat, driver.pivot.routes[0].start_lng));
      }
      else {
        bounds.extend(new google.maps.LatLng(driver.pivot.start_lat, driver.pivot.start_lng));
      }

    });

    this.project.stops.forEach((stop: any) => {
      bounds.extend(new google.maps.LatLng(stop.lat, stop.lng));
    });

    if (this.project.stops.length && this.project.drivers.length) {
      this.map.fitBounds(bounds);
    }

    if (this.project.drivers.length > 0) {
      let start_lat;
      let start_lng;
      let last = this.project.drivers.slice(-1)[0];

      if (this.lastStopChanged) {
        start_lat = +this.lastStopChanged.start_lat
        start_lng = +this.lastStopChanged.start_lng
      }
      else {
        start_lat = +last.pivot.start_lat;
        start_lng = +last.pivot.start_lng;
      }

      if (start_lat == 0 && start_lng == 0) {
        if (this.project.drivers.length > 0) {
          start_lat = this.project.drivers[0].start_lat;
          start_lng = this.project.drivers[0].start_lng;
        }
        else if (this.project.stops.length > 0) {
          start_lat = this.project.stops[0].lat;
          start_lng = this.project.stops[0].lng;
        }
      }

      let initialLocation = new google.maps.LatLng(start_lat, start_lng);

      this.map.setCenter(initialLocation);

      if (this.lastStopChanged) {
        this.map.setZoom(12);
        this.lastStopChanged = null;
      }
    }
  }



  private clearMap() {

    this.polyline.forEach(line => {
      line.setMap(null);
    });

    this.drivers_markers?.forEach((driver_marker: any) => {
      if (driver_marker.marker) {
        driver_marker.marker.setMap(null);
      }
    });

    this.stops_markers?.forEach((stop_marker: any) => {
      if (stop_marker.marker) {
        stop_marker.marker.setMap(null);
      }
    });

  }



  private initMap() {

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: {
        lat: 37.33772,
        lng: -121.88741
      },
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
        this.driversAux = res.data;

        this.driveInfo();
      });
  }



  private initProject() {

    this.loadingSrv.show();

    const project = this.projectSrv.getCurrentProject();

    if (project.status > 0) {
      this.mapFullscreen = true;
    }

    this.projectSrv.getById(project.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.loadingSrv.hide();
        this.initDrivers();

        this.projectSrv.currentProject.pipe(takeUntil(this.unsubscribe))
          .subscribe(project => {

            this.clearMap();
            this.project = project;
            this.driveInfo();
            this.setMarkers();
            this.centerMap();

            setTimeout(() => this.setPolyline(), 500);

          });

      });

  }



  private driveInfo() {
    this.drivers = this.driversAux.map(x => Object.assign({}, x));

    this.project.drivers.forEach(pd => {
      this.drivers.forEach(e => {

        if (pd.id == e.id) {
          e.projectInfo = {
            'start_address': pd.pivot.start_address,
            'start_time': pd.pivot.start_time,
            'end_time': pd.pivot.end_time,
          }
        }

      });
    });
  }



  public setStopChanged(e) {
    this.lastStopChanged = e;
  }



}
