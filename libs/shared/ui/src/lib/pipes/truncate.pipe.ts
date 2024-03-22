import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 25, ellipsis = '...') {
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

/**
 * based on the provided name it creates initials
 * example: John Doe => JD.
 * example JohnLoh => J.
 * example superlongname => S.
 */
@Pipe({
  name: 'nameInitials',
  standalone: true,
})
export class NameInitialsPipe implements PipeTransform {
  transform(value: string) {
    const words = value.split(' ').reduce((acc, word) => acc + (word.at(0) ?? '').toUpperCase(), '');
    return `${words}.`;
  }
}
