/**
 * 找出符合資料
 */

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'searchFilter'
})
export class SearchFilterPipe implements PipeTransform {
    transform(items: any[], field : string, value): any[] {
      if (!items) return [];
      if (value == null || value.length === 0) return items;
      return items.filter(it => it[field] === value);
    }
}
