import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTzPipe } from './date-tz.pipe';



@NgModule({
  declarations: [DateTzPipe],
  imports: [
    CommonModule
  ],
  exports: [DateTzPipe]
})
export class DateTzModule { }
