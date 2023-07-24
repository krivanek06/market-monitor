import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wordsUp',
  standalone: true,
})
export class WordsUpPipe implements PipeTransform {
  transform(value: string): string {
    return value
      .split(' ')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  }
}
