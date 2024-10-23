import { Pipe, PipeTransform } from '@angular/core';

/**
 * split the value string by the keys and return the displayStringPart
 *
 * example:
 * const input2 = {
      value: "Senior Vice President, Gen. Counsel & Sec.",
      keys: [",", "&"]
    };
 * output: ["Senior Vice President", " Gen. Counsel ", " Sec."]
 */
@Pipe({
  name: 'splitString',
  standalone: true,
})
export class SplitStringPipe implements PipeTransform {
  transform(value: string, keys: string[], displayStringPart = 0): string | null {
    const regex = new RegExp(keys.join('|'), 'g');
    return value.split(regex)[displayStringPart] ?? null;
  }
}

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit = 25, ellipsis = '...') {
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

@Pipe({
  name: 'wordsUp',
  standalone: true,
})
export class WordsUpPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return value;
    }

    return value
      .trim()
      .split(' ')
      .map((word) => word[0]?.toUpperCase() + word.slice(1))
      .join(' ');
  }
}
