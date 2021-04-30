import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersComponent } from './customers.component';
import { CustomersRoutingModule } from './customers-routing.module';
import { SofboxModule } from 'src/app/components/sofbox/sofbox.module';
import { PopoverModule } from 'ngx-bootstrap/popover';


@NgModule({
  declarations: [CustomersComponent],
  imports: [
    CommonModule,
    CustomersRoutingModule,
    SofboxModule,
    PopoverModule.forRoot()
  ]
})
export class CustomersModule { }
