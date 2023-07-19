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
  transform(value: string, keys: string[], displayStringPart: number = 0): string | null {
    let regex = new RegExp(keys.join('|'), 'g');
    return value.split(regex)[displayStringPart] ?? null;
  }
}
