import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { NavbarService } from 'src/app/services/navbar.service';

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss']
})
export class DriversComponent implements OnInit, OnDestroy {

  public report: any[];

  public formGroup: FormGroup;

  private unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private formBuilder: FormBuilder,
    private alertSrv: AlertService,
    private navbarSrv: NavbarService
  ) { }

  ngOnInit() {

    this.navbarSrv.setTitle('Drivers Report');

    this.navbarSrv.setBreadcrumb([
      {
        isActive: true,
        label: 'Reports'
      },
      {
        isActive: true,
        label: 'Drivers'
      }
    ]);

    this.formGroup = this.formBuilder.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
    });

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public submit() {

    if (this.formGroup.invalid) {

      this.alertSrv.toast({
        icon: 'error',
        message: 'Please enter a valid date range'
      });

      return;

    }

    const post = {
      'from': this.formatDate(this.formGroup.value.from),
      'to': this.formatDate(this.formGroup.value.to)
    };

    this.apiSrv.reportDrivers(post)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        if (res.success) {
          this.report = res.data;
        }

        else {

          this.alertSrv.toast({
            icon: 'error',
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

  public download() {

    if (this.formGroup.invalid) {

      this.alertSrv.toast({
        icon: 'error',
        message: 'Please enter a valid date range'
      });

      return;

    }

    const from = this.formatDate(this.formGroup.value.from);

    const to = this.formatDate(this.formGroup.value.to);

    this.apiSrv.reportDriversDownload({ from, to })
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {

        let binaryData = [];
        binaryData.push(data);

        const download = document.createElement('a');
        download.style.display = 'none';
        download.href = window.URL.createObjectURL(new Blob(binaryData, { type: data.type }));
        download.setAttribute('download', `drivers-from-${from}-to-${to}.xls`);
        document.body.appendChild(download);
        download.click();

      });

  }

  public formatDate(date: Date) {

    const day = (`0${date.getDate()}`).slice(-2);

    const month = (`0${date.getMonth() + 1}`).slice(-2);

    return `${date.getFullYear()}-${month}-${day}`;

  }

}
