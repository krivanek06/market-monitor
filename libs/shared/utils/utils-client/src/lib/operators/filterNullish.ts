import { Observable, OperatorFunction, UnaryFunction, filter, pipe } from 'rxjs';

export function filterNullish<T>(): UnaryFunction<Observable<T | null | undefined>, Observable<T>> {
  return pipe(filter((x) => x !== null && x !== undefined) as OperatorFunction<T | null | undefined, T>);
}
