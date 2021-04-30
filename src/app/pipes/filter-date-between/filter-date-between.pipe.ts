import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterDateBetween'
})
export class FilterDateBetweenPipe implements PipeTransform {

  transform(items: any[], field: string, value1: string, value2: string): any[] {

    if (!items) {
      return [];
    }

    if (!field || !value1 || !value2) {
      return items;
    }

    return items.filter((item) => {
      if (item[field] >= value1 && item[field] <= value2) {
        return true;
      }
      else {
        return false;
      }
    });

  }

}