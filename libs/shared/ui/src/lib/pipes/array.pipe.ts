import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inArray',
  standalone: true,
})
export class InArrayPipe<T> implements PipeTransform {
  transform(valueArray: T[], value: T, key?: keyof T): boolean {
    // array of numbers, strings
    if (!key) {
      return !!valueArray.find((d) => d === value);
    }

    // array of objects
    return !!valueArray.find((d) => d[key] === value[key]);
  }
}

// -----------------

@Pipe({
  name: 'flattenArray',
  standalone: true,
})
export class FlattenArrayPipe<T> implements PipeTransform {
  transform(values: T[][], index: number): T[] {
    return values.reduce((acc, val) => acc.concat(val[index]), []);
  }
}

// -----------------

@Pipe({
  name: 'sortByKey',
  standalone: true,
})
export class SortByKeyPipe<T> implements PipeTransform {
  transform(
    values: (T extends any[] ? T[] : 'Do not other than array') | null,
    key: keyof T,
    order: 'asc' | 'desc' = 'asc',
  ): T[] {
    if (!values || typeof values === 'string') {
      return [];
    }
    return values.slice().sort((a, b) => (order === 'desc' ? (a[key] < b[key] ? 1 : -1) : a[key] < b[key] ? -1 : 1));
  }
}

// -----------------

@Pipe({
  name: 'sortReverse',
  standalone: true,
})
export class SortReversePipe<T> implements PipeTransform {
  transform(values: (T extends unknown[] ? T[] : 'Do not other than array') | null): T[] {
    if (!values || typeof values === 'string') {
      return [];
    }
    return values.slice().reverse();
  }
}

// -----------------

@Pipe({
  name: 'multiplyData',
  standalone: true,
})
export class MultiplyDtaPipe implements PipeTransform {
  transform(array: number[], mul: number): number[] {
    return array.map((d) => d * mul);
  }
}

// -----------------
@Pipe({
  name: 'arrayReverse',
  standalone: true,
})
export class ArrayReversePipe implements PipeTransform {
  transform<T extends unknown>(value: T[]): T[] {
    return value.slice().reverse();
  }
}

// -----------------
@Pipe({
  name: 'arrayExclude',
  standalone: true,
})
export class ArrayExcludePipe implements PipeTransform {
  transform<T extends Record<string, unknown>>(arrayItems: T[], excludeData: T[], excludeKey: keyof T): T[] {
    return arrayItems.filter(
      (item) => !excludeData.some((excludeItem) => excludeItem[excludeKey] === item[excludeKey]),
    );
  }
}
