import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsComponent } from './teams.component';
import { TeamsRoutingModule } from './teams-routing.module';
import { SofboxModule } from 'src/app/components/sofbox/sofbox.module';
import { FormsModule } from '@angular/forms';
import { FilterModule } from 'src/app/pipes/filter/filter.module';

@NgModule({
  declarations: [TeamsComponent],
  imports: [
    CommonModule,
    SofboxModule,
    TeamsRoutingModule,
    FormsModule,
    FilterModule
  ]
})
export class TeamsModule { }
