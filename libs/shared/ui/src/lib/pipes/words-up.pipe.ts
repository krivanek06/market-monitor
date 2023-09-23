import { Pipe, PipeTransform } from '@angular/core';

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
