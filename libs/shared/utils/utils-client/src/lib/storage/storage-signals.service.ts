import { Signal, computed, signal } from '@angular/core';

// export function InitializeStore<T>(
//   storeId: string,
//   config?: Partial<SignalStoreConfig<T>>
// ): Provider[] {
//     return [
//       {
//         provide: SignalStore<T>,
//         useFactory: () => new SignalStore<T>(storeId, config as SignalStoreConfig<T>)
//       }
//     ]
//   }

// @Injectable({
//   providedIn: 'root'
// })
export abstract class StorageSignalsService<T> {
  readonly state = signal<T>({} as T);

  constructor(
    private readonly storeId: string,
    private initialState: T,
  ) {
    this.initialState = Object.assign(this.initialState ?? {}, { _storeId: this.storeId }) as T;
    this.state.set(this.initialState);
  }

  set(state: T) {
    this.state.set(state);
  }

  setKey<K extends keyof T>(key: K, value: T[K]) {
    this.state.update((state) => ({ ...state, [key]: value }));
  }

  update(updater: (state: T) => T) {
    this.state.update(updater);
  }

  reset() {
    this.state.set(this.initialState as T);
  }

  select<U>(selector: (state: T) => U) {
    return computed(() => selector(this.state()));
  }

  selectFrom<T, U>(signal: Signal<T>, selector: (state: T) => U) {
    return computed(() => selector(signal()));
  }
}
