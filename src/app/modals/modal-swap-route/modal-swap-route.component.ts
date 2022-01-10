import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-modal-swap-route',
  templateUrl: './modal-swap-route.component.html',
  styleUrls: ['./modal-swap-route.component.scss']
})
export class ModalSwapRouteComponent implements OnInit, OnDestroy {

  @Input() driver: any;

  @Input() project: any;

  public to: any;

  public onClose = new Subject();

  private unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private bsModalRef: BsModalRef,
    private loadingSrv: LoadingService,
    private alertSrv: AlertService
  ) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public dismiss() {
    this.bsModalRef.hide();
  }

  public select(ev: any) {
    this.to = ev.target.value;
  }

  public save() {

    this.loadingSrv.show();

    const data = {
      from: this.driver.id,
      to: this.to
    }

    this.apiSrv.swapRoute(this.project.id, data)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.loadingSrv.hide();

        if (res.success) {

          this.onClose.next(res.data);

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });

          this.bsModalRef.hide();

        }

      });
  }

}
