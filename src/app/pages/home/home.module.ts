import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { SofboxModule } from 'src/app/components/sofbox/sofbox.module';
import { NgxViewerModule } from 'ngx-viewer';
import { DateTzModule } from 'src/app/pipes/date-tz/date-tz.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SofboxModule,
    NgxViewerModule,
    DateTzModule
  ]
})
export class HomeModule { }
