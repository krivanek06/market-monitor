import { Observable, filter } from 'rxjs';

export function isNonNullable<T>() {
  return (source$: Observable<null | undefined | T>) =>
    source$.pipe(filter((v): v is NonNullable<T> => v !== null && v !== undefined));
}
