import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriversComponent } from './drivers.component';
import { DriversRoutingModule } from './drivers-routing.module';
import { SofboxModule } from 'src/app/components/sofbox/sofbox.module';
import { FormsModule } from '@angular/forms';
import { ModalDriverModule } from 'src/app/modals/modal-driver/modal-driver.module';
import { FilterModule } from 'src/app/pipes/filter/filter.module';

@NgModule({
  declarations: [DriversComponent],
  imports: [
    CommonModule,
    DriversRoutingModule,
    SofboxModule,
    FormsModule,
    ModalDriverModule,
    FilterModule
  ]
})
export class DriversModule { }
