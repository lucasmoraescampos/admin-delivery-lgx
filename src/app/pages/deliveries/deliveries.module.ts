import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveriesComponent } from './deliveries.component';
import { SofboxModule } from 'src/app/components/sofbox/sofbox.module';
import { DeliveriesRoutingModule } from './deliveries-routing.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxViewerModule } from 'ngx-viewer';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [DeliveriesComponent],
  imports: [
    CommonModule,
    SofboxModule,
    DeliveriesRoutingModule,
    PaginationModule,
    BsDatepickerModule.forRoot(),
    NgxViewerModule,
    FormsModule
  ]
})
export class DeliveriesModule { }
