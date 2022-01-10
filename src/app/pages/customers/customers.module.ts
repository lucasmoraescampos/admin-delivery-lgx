import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersComponent } from './customers.component';
import { CustomersRoutingModule } from './customers-routing.module';
import { SofboxModule } from 'src/app/components/sofbox/sofbox.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterModule } from 'src/app/pipes/filter/filter.module';

@NgModule({
  declarations: [CustomersComponent],
  imports: [
    CommonModule,
    CustomersRoutingModule,
    SofboxModule,
    FormsModule,
    ReactiveFormsModule,
    FilterModule
  ]
})
export class CustomersModule { }
