import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null, limit = 25, ellipsis = '...') {
    if (!value) {
      return '';
    }
    return value.length > limit ? value.substring(0, limit) + ellipsis : value;
  }
}

@Pipe({
  name: 'truncateWords',
  standalone: true,
})
export class TruncateWordsPipe implements PipeTransform {
  transform(value: string, limit = 5, ellipsis = '...') {
    const words = value.split(' ');
    return words.length > limit ? words.slice(0, limit).join(' ') + ' ' + ellipsis : value;
  }
}
