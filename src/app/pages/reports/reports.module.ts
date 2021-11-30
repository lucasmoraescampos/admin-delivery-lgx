import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SofboxModule } from 'src/app/components/sofbox/sofbox.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FilterModule } from 'src/app/pipes/filter/filter.module';
import { FilterDateBetweenModule } from 'src/app/pipes/filter-date-between/filter-date-between.module';

import { ReportsComponent } from './percent/reports.component';
import { BagsComponent } from './bags/bags.component';
import { DriversComponent } from './drivers/drivers.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsComponent
  },
  {
    path: 'bags',
    component: BagsComponent
  },
  {
    path: 'drivers',
    component: DriversComponent
  }
];

@NgModule({
  declarations: [
    ReportsComponent,
    BagsComponent,
    DriversComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SofboxModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    FilterModule,
    FilterDateBetweenModule
  ]
})
export class ReportsModule { }
