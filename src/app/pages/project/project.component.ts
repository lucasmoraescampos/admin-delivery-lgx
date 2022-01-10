import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArrayHelper } from 'src/app/helpers/array.helper';
import { ModalStopComponent } from 'src/app/modals/modal-stop/modal-stop.component';
import { ModalUploadStopsComponent } from 'src/app/modals/modal-upload-stops/modal-upload-stops.component';
import { ModalDriverTimeComponent } from 'src/app/modals/modal-driver-time/modal-driver-time.component';
import { AlertService } from 'src/app/services/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { formatDate } from '@angular/common';
import { UtilsHelper } from 'src/app/helpers/utils.helper';

declare const google: any;

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {

  @ViewChild('map', { static: true }) mapElement: ElementRef;

  public mapFullscreen: boolean;

  public project: any;

  private map: any;

  public drivers: any[] = [];

  public stops_markers: any[];

  public drivers_markers: any[];

  private polyline: any[];

  public colors = ['#0000cd', '#ff0000', '#2e8b57', '#ffa500', '#c71585', '#ff4500', '#808000', '#1e90ff', '#e9967a', '#2f4f4f', '#8b0000', '#191970', '#ff00ff', '#00ff00', '#ba55d3', '#00fa9a', '#f0e68c', '#dda0dd', '#006400', '#ffd700'];

  private timezone: number;

  private infoWindow = new google.maps.InfoWindow();

  private unsubscribe = new Subject();

  private modalRef: BsModalRef;

  constructor(
    private apiSrv: ApiService,
    private modalSrv: BsModalService,
    private alertSrv: AlertService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    this.initMap();

    this.initProject();

    this.initDrivers();

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public setProject(project: any) {

    this.project = project;

    this.loadMapComponents();

  }

  public modalDismiss() {
    this.modalRef.hide();
  }

  public driverStartAddress(driver: any) {

    const index = ArrayHelper.getIndexByKey(this.project.drivers, 'id', driver.id);

    return index != -1 ? this.project.drivers[index].pivot.start_address : driver.start_address;

  }

  public driverStartLat(driver: any) {

    const index = ArrayHelper.getIndexByKey(this.project.drivers, 'id', driver.id);

    return index != -1 ? this.project.drivers[index].pivot.start_lat : driver.start_lat;

  }

  public driverStartLng(driver: any) {

    const index = ArrayHelper.getIndexByKey(this.project.drivers, 'id', driver.id);

    return index != -1 ? this.project.drivers[index].pivot.start_lng : driver.start_lng;

  }

  public driverStartTime(driver: any) {

    const index = ArrayHelper.getIndexByKey(this.project.drivers, 'id', driver.id);

    if (index != -1) {

      const pivot = this.project.drivers[index].pivot;

      if (pivot.routes[0]?.started_at) {

        return formatDate(pivot.routes[0].started_at, 'h:mm a', 'en-US', UtilsHelper.utcOffsetString(pivot.timezone_time * -3600));
  
      }
  
      else {
  
        const [hours, min] = pivot.start_time.split(':');
  
        return formatDate(new Date().setHours(hours, min), 'h:mm a', 'en-US');
  
      }

    }

    else {

      const date = new Date();

      const [hours, min] = driver.start_time.split(':');

      date.setHours(hours, min);

      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

    }

  }

  public driverEndTime(driver: any) {

    const index = ArrayHelper.getIndexByKey(this.project.drivers, 'id', driver.id);

    if (index != -1) {

      const pivot = this.project.drivers[index].pivot;

      const last = pivot.routes[pivot.routes.length - 1];

      if (last?.arrived_at || last?.skipped_at) {

        const end_time = last.arrived_at ?? last.skipped_at;

        return formatDate(end_time, 'h:mm a', 'en-US', UtilsHelper.utcOffsetString(pivot.timezone_time * -3600));
  
      }
  
      else {
  
        const [hours, min] = pivot.end_time.split(':');
  
        return formatDate(new Date().setHours(hours, min), 'h:mm a', 'en-US');
  
      }

    }

    else {

      const date = new Date();

      const [hours, min] = driver.end_time.split(':');

      date.setHours(hours, min);

      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

    }

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

    if (ev.target.checked) {

      this.modalRef = this.modalSrv.show(ModalDriverTimeComponent, {
        class: 'modal-dialog-centered',
        keyboard: false,
        backdrop: 'static',
        initialState: {
          start_address:  this.driverStartAddress(driver),
          start_lat:      this.driverStartLat(driver),
          start_lng:      this.driverStartLng(driver),
          start_time:     this.driverStartTime(driver),
          end_time:       this.driverEndTime(driver)
        }
      });

      this.modalRef.content.onClose.pipe(takeUntil(this.unsubscribe))
        .subscribe((data: any) => {

          if (data) {

            data.timezone_time = new Date().getTimezoneOffset() / 60;

            this.apiSrv.addProjectDriver(this.project.id, driver.id, data)
              .pipe(takeUntil(this.unsubscribe))
              .subscribe(res => {

                if (res.success) {

                  this.setProject(res.data);

                  this.alertSrv.toast({
                    icon: 'success',
                    message: res.message
                  });

                }

              }, err => {
                
                ev.target.checked = !ev.target.checked;

                this.alertSrv.toast({
                  icon: 'error',
                  message: err.error.message
                });
              
              });

          }

          else {
            ev.target.checked = !ev.target.checked;
          }

        });

    }

    else {

      this.alertSrv.show({
        icon: 'warning',
        message: `The driver "${driver.name}" will be disabled. Continue?`,
        onConfirm: () => {

          this.apiSrv.deleteProjectDriver(this.project.id, driver.id)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(res => {

              if (res.success) {

                this.setProject(res.data);

                this.alertSrv.toast({
                  icon: 'success',
                  message: res.message
                });

              }

            }, err => ev.target.checked = !ev.target.checked);

        },
        onCancel: () => {
          ev.target.checked = true;
        }
      });

    }

  }

  public driverInfo(driver: any) {

    if (!driver.pivot) {

      const index = ArrayHelper.getIndexByKey(this.project.drivers, 'id', driver.id);

      if (index == -1) return;

      driver = this.project.drivers[index];

    }

    let content = document.createElement('div');

    const start_address = this.driverStartAddress(driver);

    const start_time = this.driverStartTime(driver);

    const end_time = this.driverEndTime(driver);

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
          <b>${start_address}</b>
        </div>
      </div>
    `;

    if (driver.pivot.routes.length == 0 || driver.pivot.routes[0]?.status == 0) {

        const buttonEdit = document.createElement('button');

        buttonEdit.setAttribute('class', 'btn btn-outline-dark btn-sm m-1');

        buttonEdit.innerHTML = '<i class="ri-edit-box-line"></i> Edit';

        buttonEdit.onclick = () => this.updateProjectDriver(driver);

        content.appendChild(buttonEdit);

    }

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

  public modalStop(stop?: any) {

    const isUpdate = stop ? true : false;

    const modal = this.modalSrv.show(ModalStopComponent, {
      keyboard: false,
      class: 'modal-dialog-centered',
      backdrop: 'static',
      initialState: {
        project: this.project,
        stop: stop
      }
    });

    modal.content.onClose.pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {

        if (data) {

          if (isUpdate) {

            const index = ArrayHelper.getIndexByKey(this.project.stops, 'id', stop.id);

            this.project.stops[index] = data;

            this.loadMapComponents();

          }

          else {

            this.project.stops.push(data);

            this.loadMapComponents();

          }

        }

      });

  }
  
  public modalUploadStops() {

    this.modalRef = this.modalSrv.show(ModalUploadStopsComponent, {
      keyboard: false,
      class: 'modal-dialog-centered',
      backdrop: 'static',
      initialState: {
        project: this.project
      }
    });

    this.modalRef.content.onClose.pipe(takeUntil(this.unsubscribe))
      .subscribe((project: any) => {
        
        if (project) {

          this.setProject(project);

        }
        
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

      const started_at = formatDate(route.started_at, 'h:mm a', 'en-US', UtilsHelper.utcOffsetString(this.timezone * -3600));

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

      const arrived_at = formatDate(route.arrived_at, 'h:mm a', 'en-US', UtilsHelper.utcOffsetString(this.timezone * -3600));

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

      const skipped_at = formatDate(route.skipped_at, 'h:mm a', 'en-US', UtilsHelper.utcOffsetString(this.timezone * -3600));

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
        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, stop_marker.marker);
      }
      else {
        stop_marker.marker.setZIndex((index + 1) * 9);
      }
    });
  }

  public optimize() {

    const confirm = () => {

      this.alertSrv.toast({
        icon: 'warning',
        message: 'Optimizing the route. Please wait.',
        duration: 30000
      });
  
      this.apiSrv.optimize(this.project.id)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {
  
          if (res.success) {
  
            this.setProject(res.data);
  
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

    if (this.project.status > 0) {

        this.alertSrv.show({
          icon: 'warning',
          message: 'You are about to reoptimize this project. Do you want to continue?',
          confirmButtonText: 'Continue',
          onConfirm: confirm
        });

    }

    else {
      confirm();
    }
    
  }

  private deleteStop(stop: any) {

    this.alertSrv.show({
      icon: 'warning',
      message: `This will permanently delete the stop "${stop.name}". Continue?`,
      onConfirm: () => {

        this.infoWindow.close();

        this.apiSrv.deleteProjectStop(this.project.id, stop.id)
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

  private updateProjectDriver(driver: any) {

    this.modalRef = this.modalSrv.show(ModalDriverTimeComponent, {
      class: 'modal-dialog-centered',
      keyboard: false,
      backdrop: 'static',
      initialState: {
        start_address:  this.driverStartAddress(driver),
        start_lat:      this.driverStartLat(driver),
        start_lng:      this.driverStartLng(driver),
        start_time:     this.driverStartTime(driver),
        end_time:       this.driverEndTime(driver)
      }
    });

    this.modalRef.content.onClose.pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {

        if (data) {

          this.apiSrv.updateProjectDriver(this.project.id, driver.id, data)
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

  private loadMapComponents() {

    /*
     * Set Markers
     */ 
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

    this.drivers_markers = [];

    this.stops_markers = [];

    this.project.drivers.forEach((driver: any, driver_index: number) => {

      this.timezone = driver.pivot.timezone_time;

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

      if (driver.pivot && driver.pivot.stops_order.length > 0) {

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


    /*
     * Center Map
     */
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

    if (this.project.stops.length > 0 || this.project.drivers.length > 0) {
      this.map.fitBounds(bounds);
      this.map.setZoom(9);
    }


    /*
     * Set Polyline
     */
    this.polyline?.forEach(line => {
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

  private initProject() {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.apiSrv.getProjectById(id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.mapFullscreen = res.data.status == 2 ? true : false;

        this.setProject(res.data);

      }, err => {

        if (err.status == 404) {

          this.router.navigateByUrl('/projects');

        }

      });

  }

  private initDrivers() {
    this.apiSrv.getAllDrivers()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        this.drivers = res.data;
      });
  }

}
