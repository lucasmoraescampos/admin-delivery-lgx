import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilsHelper } from 'src/app/helpers/utils.helper';
import { ApiService } from 'src/app/services/api.service';
import { NavbarService } from 'src/app/services/navbar.service';

@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.component.html',
  styleUrls: ['./deliveries.component.scss']
})
export class DeliveriesComponent implements OnInit {

  public perPage: number;

  public total: number;

  public deliveries: any[];

  public orderIdSearch: string;

  public dateSearch: string;

  private searchTimeout: NodeJS.Timeout;

  private unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private navbarSrv: NavbarService
  ) { }

  ngOnInit(): void {

    this.navbarSrv.setTitle('Deliveries');

    this.navbarSrv.setBreadcrumb([
      {
        isActive: false,
        label: 'Home',
        link: '/home'
      },
      {
        isActive: true,
        label: 'Deliveries'
      }
    ]);

    this.loadDeliveries();

  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public finishedAt(delivery: any) {
    return formatDate(delivery.finished_at, 'MMM d, yyyy, h:mm a', 'en-US', UtilsHelper.utcOffsetString(delivery.utc_offset));
  }

  public changeDateFilter(date: Date) {

    const day = (`0${date.getDate()}`).slice(-2);

    const month = (`0${date.getMonth() + 1}`).slice(-2);

    this.dateSearch = `${date.getFullYear()}-${month}-${day}`;

    this.loadDeliveries();

  }

  public searchChanged() {

    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {

      this.loadDeliveries();

    }, 500);

  }

  public clearDateSearch() {
    this.dateSearch = '';
    this.loadDeliveries();
  }

  public clearSearch() {
    this.orderIdSearch = '';
    this.loadDeliveries();
  }

  public loadDeliveries(page: number = 1) {

    const params: any = {
      page: page,
      limit: 15
    }

    if (this.orderIdSearch) {
      params.order_id = this.orderIdSearch;
    }

    if (this.dateSearch) {
      params.date = this.dateSearch;
    }

    this.apiSrv.deliveries(params)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        if (res.success) {
          this.perPage = res.data.per_page;
          this.deliveries = res.data.stops;
          this.total = res.data.total;
        }
      });

  }

}
