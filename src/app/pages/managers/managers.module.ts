import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagersComponent } from './managers.component';
import { ManagersRoutingModule } from './managers-routing.module';
import { SofboxModule } from 'src/app/components/sofbox/sofbox.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterModule } from 'src/app/pipes/filter/filter.module';

@NgModule({
  declarations: [ManagersComponent],
  imports: [
    CommonModule,
    ManagersRoutingModule,
    SofboxModule,
    FormsModule,
    ReactiveFormsModule,
    FilterModule
  ]
})
export class ManagersModule { }
