import { Component, OnDestroy, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArrayHelper } from 'src/app/helpers/array.helper';
import { ModalDriverComponent } from 'src/app/modals/modal-driver/modal-driver.component';
import { AlertService } from 'src/app/services/alert.service';
import { DriverService } from 'src/app/services/driver.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss']
})
export class DriversComponent implements OnInit, OnDestroy {

  public search: string;

  public drivers: any[];

  private unsubscribe = new Subject();

  constructor(
    private loadingSrv: LoadingService,
    private driverSrv: DriverService,
    private modalSrv: BsModalService,
    private alertSrv: AlertService
  ) { }

  ngOnInit() {
    this.initDrivers();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public modalDriver(index?: number) {
    const modal = this.modalSrv.show(ModalDriverComponent, {
      keyboard: false,
      class: 'modal-dialog-centered',
      backdrop: 'static',
      initialState: {
        driver: this.drivers[index]
      }
    });

    modal.content.onClose.pipe(takeUntil(this.unsubscribe))
      .subscribe((driver: any) => {
        if (index !== undefined) {
          this.drivers[index] = driver;
        }
        else {
          this.drivers.unshift(driver);
        }
      });
  }

  public delete(index: number) {

    const driver = this.drivers[index];

    this.alertSrv.show({
      icon: 'warning',
      message: `This will permanently delete the driver "${driver.name}". Continue?`,
      onConfirm: () => {
        this.loadingSrv.show();
        this.driverSrv.delete(driver.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            this.loadingSrv.hide();

            if (res.success) {

              this.drivers = ArrayHelper.removeItem(this.drivers, index);

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

            }

          });
      }
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

}
