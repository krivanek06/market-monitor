import { inject, InjectionToken } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { WINDOW } from '@mm/api-client';
import { auditTime, fromEvent, map, startWith } from 'rxjs';

/**
 *
 * @returns listener for window resize event
 */
export const WINDOW_RESIZE_LISTENER = new InjectionToken('Window resize listener', {
  factory: () => {
    const windowRef = inject(WINDOW);

    return toSignal(
      fromEvent(windowRef, 'resize').pipe(
        auditTime(300),
        map(() => windowRef.innerWidth),
        startWith(windowRef.innerWidth),
        takeUntilDestroyed(),
      ),
      { initialValue: windowRef.innerWidth },
    );
  },
});
