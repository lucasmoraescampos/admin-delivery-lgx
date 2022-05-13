import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArrayHelper } from 'src/app/helpers/array.helper';
import { ModalDriverComponent } from 'src/app/modals/modal-driver/modal-driver.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { NavbarService } from 'src/app/services/navbar.service';

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss']
})
export class DriversComponent implements OnInit, OnDestroy {

  public search: string;

  public drivers: any[];

  public status: number;

  private unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private modalSrv: BsModalService,
    private alertSrv: AlertService,
    private navbarSrv: NavbarService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {

    this.navbarSrv.setTitle('Drivers');

    this.navbarSrv.setBreadcrumb([]);

    this.status = Number(this.route.snapshot.queryParamMap.get('status') ?? 0);

    this.loadDrivers();

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public statusChanged() {
    if (this.status == 0) {
      this.router.navigateByUrl('drivers');
    }
    else {
      this.router.navigateByUrl(`drivers?status=${this.status}`);
    }
    this.loadDrivers();
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

        this.apiSrv.deleteDriver(driver.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

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

  private loadDrivers() {

    const params: any = {};

    if (this.status != 0) {
      params.status = this.status;
    }

    this.apiSrv.getAllDrivers(params)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        this.drivers = res.data;
      });
      
  }

}
