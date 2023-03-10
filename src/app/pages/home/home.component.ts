import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { NavbarService } from 'src/app/services/navbar.service';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dataviz from "@amcharts/amcharts4/themes/dataviz";
import { Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  public resume: any;
  public deliveryTimeStatistics: any;
  public deliveries: any[];
  public settings: any;
  public unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private navbarSrv: NavbarService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.navbarSrv.setTitle('Home');
    this.navbarSrv.setBreadcrumb([]);
    this.initDeliveries();
    this.initResume();
    this.initDeliveryTimeStatistics();
    this.initSettings();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public navigate(url: string) {
    this.router.navigateByUrl(url);
  }

  public changeSmsStatus(status: boolean) {
    this.apiSrv.setSettings({ sms_server_status: status })
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        if (res.success) {
          this.settings = res.data;
          this.alertService.toast({
            icon: 'success',
            message: `SMS Server ${status ? 'On' : 'Off'}`
          })
        }
      });
  }

  private initDeliveryTimeStatistics() {

    const now = new Date();

    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    const start_date = [year, (`0${month}`).slice(-2), '01'].join('-');

    const end_date = [month == 12 ? year + 1 : year, (`0${(month % 12) + 1}`).slice(-2), '01'].join('-');

    this.apiSrv.deliveryTimeStatistics({ start_date, end_date })
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        if (res.success) {

          this.deliveryTimeStatistics = res.data;

          am4core.useTheme(am4themes_animated);
          am4core.useTheme(am4themes_dataviz);

          const chart = am4core.create('chart', am4charts.PieChart3D);

          chart.legend = new am4charts.Legend();

          chart.data = [
            {
              status: 'On Time',
              amount: this.deliveryTimeStatistics.on_time,
              color: am4core.color('#28a745')
            },
            {
              status: 'Late',
              amount: this.deliveryTimeStatistics.late,
              color: am4core.color('#dc3545')
            },
            {
              status: 'Early',
              amount: this.deliveryTimeStatistics.early,
              color: am4core.color('#fc9d20')
            }
          ];

          const series = chart.series.push(new am4charts.PieSeries3D());

          series.dataFields.category = 'status';

          series.dataFields.value = 'amount';

          series.slices.template.propertyFields.fill = 'color';

          series.hiddenState.properties.endAngle = -90;

        }

      });

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

  private initSettings() {
    this.apiSrv.getSettings()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        if (res.success) {
          this.settings = res.data;
        }
      });
  }
}
