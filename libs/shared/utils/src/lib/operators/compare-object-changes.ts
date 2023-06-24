import { isEqual } from 'lodash';
import { Observable, OperatorFunction, map, startWith } from 'rxjs';

export function compareObjectChanges<T>(initialState: T): OperatorFunction<T, boolean> {
  return (source: Observable<T>): Observable<boolean> => {
    return source.pipe(
      map((currentState: T) => !isEqual(currentState, initialState)),
      startWith(false)
    );
  };
}
