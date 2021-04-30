import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterDateBetweenPipe } from './filter-date-between.pipe';



@NgModule({
  declarations: [FilterDateBetweenPipe],
  imports: [
    CommonModule
  ],
  exports: [FilterDateBetweenPipe]
})
export class FilterDateBetweenModule { }
