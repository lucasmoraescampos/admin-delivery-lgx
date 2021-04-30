import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsComponent } from './projects.component';
import { ProjectsRoutingModule } from './projects-routing.module';
import { SofboxModule } from 'src/app/components/sofbox/sofbox.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FilterModule } from 'src/app/pipes/filter/filter.module';
import { FilterDateBetweenModule } from 'src/app/pipes/filter-date-between/filter-date-between.module';

@NgModule({
  declarations: [ProjectsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ProjectsRoutingModule,
    SofboxModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    ReactiveFormsModule,
    FilterModule,
    FilterDateBetweenModule
  ]
})
export class ProjectsModule { }
