import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objectValueByKey',
  standalone: true,
})
export class ObjectValueByKeyPipe implements PipeTransform {
  transform<T, K extends keyof T>(value: T, key: K): T[K] {
    return value[key];
  }
}

@Pipe({
  name: 'objectArrayValuesByKey',
  standalone: true,
})
export class ObjectArrayValueByKeyPipe implements PipeTransform {
  transform<T, K extends keyof T>(values: T[], key: K): T[K][] {
    return values.map((d) => d[key]);
  }
}
