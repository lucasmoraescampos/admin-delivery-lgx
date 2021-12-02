import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArrayHelper } from 'src/app/helpers/array.helper';
import { AlertService } from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ReportsService } from 'src/app/services/reports.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy
{

  private unsubscribe = new Subject();
  public  formGroup : FormGroup;

  private post : any = null;

  arr  : any = [];

  constructor(
    private modalSrv      : BsModalService,
    private formBuilder   : FormBuilder,
    private reportsService: ReportsService,
    private loadingSrv    : LoadingService,
    private alertSrv      : AlertService,
    private router        : Router
  )
  {
  }


  ngOnInit(): void
  {
    this.formGroup = this.formBuilder.group({
      from: ['', Validators.required],
      to  : ['', Validators.required],
    });
  }


  ngOnDestroy()
  {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }


  submit()
  {
    if (this.formGroup.invalid)
    {
      this.alertSrv.toast({
        icon   : 'error',
        message: 'Please enter a valid date range'
      });

      return;
    }

    this.loadingSrv.show();

    this.alertSrv.toast({
      icon   : 'info',
      message: 'Loading! This may take some time. '
    });

    const post = {
      'from' : this.formatDate( this.formGroup.value.from ),
      'to'   : this.formatDate( this.formGroup.value.to   ),
    };

    this.post = post

    this.reportsService.get( post )
      .pipe( takeUntil( this.unsubscribe ) )
      .subscribe( res => {

        this.loadingSrv.hide();

        if (res.success)
        {
          this.arr = res.data
        }
        else
        {
          this.alertSrv.toast({
            icon: 'error',
            message: res.message
          });
        }

      }, err => {

        this.alertSrv.toast({
          icon   : 'error',
          message: err.error.message
        });

      });
  }



  download()
  {
    this.loadingSrv.show();

    this.reportsService.getDownload( this.post )
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






  public formatDate( date: Date )
  {
    date = new Date( date );
    const day   = date.getDate()      > 9 ? date.getDate()      : '0' + date.getDate();
    const month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + String(date.getMonth() + 1);

    return `${date.getFullYear()}-${month}-${day}`;
  }




}