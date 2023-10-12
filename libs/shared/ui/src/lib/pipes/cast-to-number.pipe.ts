import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'castToNumber',
  standalone: true,
})
export class CastToNumberPipe implements PipeTransform {
  transform(value: string): number {
    return !isNaN(Number(value)) ? Number(value) : 0;
  }
}
