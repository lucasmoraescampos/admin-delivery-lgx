import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilsHelper } from 'src/app/helpers/utils.helper';
import { PluginsService } from 'src/app/plugins.service';
import { AlertService } from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';
import { WhereIsMyOrderService } from './where-is-my-order.service';

@Component({
  selector: 'app-where-is-my-order',
  templateUrl: './where-is-my-order.component.html',
  styleUrls: ['./where-is-my-order.component.scss']
})
export class WhereIsMyOrderComponent implements OnInit, OnDestroy
{

  public formGroup: FormGroup;
  private unsubscribe = new Subject();

  public routez  : any = null;
  public project : any = null;

  constructor(
    private plugins: PluginsService,
    private formBuilder: FormBuilder,
    private alertSrv: AlertService,
    private loadingSrv: LoadingService,
    public router: Router,
    public whereIsMyOrderService: WhereIsMyOrderService
  )
  {
  }



  ngOnInit()
  {
    this.formGroup = this.formBuilder.group({
      order: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }



  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }



  public get formControl() {
    return this.formGroup.controls;
  }



  public save() {

    this.routez  = null;
    this.project = null;

    if (this.formGroup.valid) {

      if ( !this.formControl.phone.value ) {

        this.alertSrv.toast({
          icon: 'error',
          message: 'Enter a valid Phone Number'
        });

      } else if ( !this.formControl.order.value ) {

        this.alertSrv.toast({
          icon: 'error',
          message: 'Enter a valid Order Id'
        });

      } else {

        this.loadingSrv.show();

        this.whereIsMyOrderService.get( this.formControl.phone.value, this.formControl.order.value )
          .pipe(takeUntil(this.unsubscribe))
          .subscribe( res => {

            this.loadingSrv.hide();

            if ( !res.message ) {

              this.project = res.data;
              this.calc( res.data );

            } else {

              this.alertSrv.toast({
                icon: 'error',
                message: res.message
              });

            }

          }, ( er ) => {

            this.alertSrv.toast({
              icon: 'error',
              message: er.error.message
            });

          });
      }
    }
  }



  calc( project )
  {
    let id         = project.id
    let start_time = project.start_time
    let duration   = 0;

    if( project.routes?.length > 0 && typeof project.routes[0].started_at != 'undefined' && project.routes[0].started_at != '' )
    {
      let do_ = new Date( project.routes[0].started_at );
      start_time = do_.getHours() + ':' + do_.getMinutes();
    }

    let split : any = start_time.split(':');
    let date = new Date();
    date.setHours(split[0], split[1], 0, 0);

    let last : any     = null; // ultimo registro realizado
    let lf   : boolean = false; //

    project.routes.forEach( ( route:any ) => {

      // if 'completo' ou 'skipped'
      if( route.status == 2 || route.status == 3 )
      {
        const dt = new Date( ( route.status == 2 ) ? route.arrived_at : route.skipped_at );

        route.date = dt.getFullYear()  + "-" + ( dt.getMonth() + 1 ) + "-" + dt.getDate();

        route.time = this.tConvert( dt.toLocaleTimeString( "en-US", {
          timeZone: "America/Los_Angeles",
          hour    : '2-digit',
          minute  : '2-digit'
        } ) );

        last = route;
      }
      else // se stop em espera
      {
        // se ultimo stop foi atendido calcula previsão de entrega a partir da ultima stop
        if( last )
        {
          // se a ultima stop foi atendida zera a duração
          if( !lf )
          {
            lf = true;
            duration = 0;
          }

          date = new Date();

          let dtz    : any = ( last.status == 2 ) ? last.arrived_at : last.skipped_at;
          let doz_   : any = new Date( dtz );
          let timez  : any = doz_.getHours() + ':' + doz_.getMinutes();
          let splitz : any = timez.split(':');

          duration += route.duration;

          date.setHours( Number( splitz[0] ), Number( splitz[1] ), date.getSeconds() + duration, 0 );

          route.date = date.getFullYear() + "-" + ( date.getMonth() + 1 ) + "-" + date.getDate();

          route.time = this.tConvert( date.toLocaleTimeString( "en-US", {
            timeZone: "America/Los_Angeles",
            hour    : '2-digit',
            minute  : '2-digit'
          } ) );
        }
        else
        {
          duration += route.duration;

          date.setHours( Number( split[0] ), Number( split[1] ), date.getSeconds() + duration, 0 );

          route.date = date.getFullYear() + "-" + ( date.getMonth() + 1 ) + "-" + date.getDate();

          let gmt       = date.toISOString();
          let gmtsplit  = gmt.split("T");
          let hourSplit = gmtsplit[1].split('.');

          var dtzz = new Date( gmtsplit[0] + 'T' + hourSplit[0] + 'Z' ).toLocaleTimeString('en-US', {
            timeZone: "America/Los_Angeles",
            hour    : '2-digit',
            minute  : '2-digit'
          });

          route.time = this.tConvert( dtzz );
        }

        duration += route.downtime;
      }

      if( route.id == id )
        this.routez = route;

    });

  }


  tConvert (time)
  {
    let timeAr = time.split(":");
    time   = timeAr[0]+":"+timeAr[1];
    // Check correct time format and split into components
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) // If time format correct
    {
        time    = time.slice (1);  // Remove full string match value
        time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join (''); // return adjusted time or original string
  }


}
