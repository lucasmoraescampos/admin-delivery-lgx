import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateTz'
})
export class DateTzPipe implements PipeTransform {

  transform(value: string | number | Date, utcOffset: number, format?: string, locale?: string): string {
    format = format ?? 'MMM d, yyyy, h:mm a';
    locale = locale ?? 'en-US';
    return formatDate(value, format, locale, this.utcOffsetString(utcOffset));
  }

  private utcOffsetString(seconds: number) {
    const date = new Date(0);
    date.setSeconds(Math.abs(seconds));
    const time = date.toISOString().slice(11, 16);
    return seconds < 0 ? 'UTC-' + time : 'UTC+' + time;
  }

}
