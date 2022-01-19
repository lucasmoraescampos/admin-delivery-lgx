import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { NavbarService } from 'src/app/services/navbar.service';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  public resume: any;

  public deliveries: any[];

  public unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private navbarSrv: NavbarService
  ) { }

  ngOnInit(): void {

    this.navbarSrv.setTitle('Home');

    this.navbarSrv.setBreadcrumb([]);

    this.initDeliveries();

    this.initResume();

    this.initChart();

  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public initChart() {

    const chart = am4core.create('chart', am4charts.PieChart3D);

    chart.legend = new am4charts.Legend();

    chart.data = [
      {
        status: 'On Time',
        amount: 501.9,
        color: am4core.color('#28a745')
      },
      {
        status: 'Late',
        amount: 165.8,
        color: am4core.color('#dc3545')
      },
      {
        status: 'Early',
        amount: 139.9,
        color: am4core.color('#fc9d20')
      }
    ];

    const series = chart.series.push(new am4charts.PieSeries3D());

    series.dataFields.category = 'status';
  
    series.dataFields.value = 'amount';

    series.slices.template.propertyFields.fill = 'color';

  }

  private initDeliveries() {
    this.apiSrv.deliveries()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        if (res.success) {
          this.deliveries = res.data.stops;
        }
      });
  }

  private initResume() {
    this.apiSrv.resume()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        if (res.success) {
          this.resume = res.data;
        }
      });
  }

}
