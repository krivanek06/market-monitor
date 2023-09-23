import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getDataByIndex',
  standalone: true,
})
export class GetDataByIndexPipe<T> implements PipeTransform {
  transform(values: T[], index: number): T | null {
    return values[index] ?? null;
  }
}
