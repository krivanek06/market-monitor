import { Observable, OperatorFunction, UnaryFunction, filter, pipe } from 'rxjs';

export function filterNullish<T>(): UnaryFunction<Observable<T | null | undefined>, Observable<T>> {
  return pipe(filter((x) => x != null) as OperatorFunction<T | null | undefined, T>);
}
