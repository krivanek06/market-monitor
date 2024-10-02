import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { PageAppLoadingComponent } from '@mm/page-builder';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { delay, filter, map } from 'rxjs';

@Component({
  selector: 'app-app-loading',
  standalone: true,
  imports: [PageAppLoadingComponent],
  template: `<app-page-app-loading />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLoadingComponent {
  private readonly authStore = inject(AuthenticationUserStoreService);
  private readonly router = inject(Router);

  readonly authState$ = toObservable(this.authStore.state);

  constructor() {
    this.authState$
      .pipe(
        map((state) => state.authenticationState),
        filter((state) => state !== 'LOADING'),
        delay(2000), // keep the loading screen for 2s
        map((isLoaded) => (isLoaded === 'SUCCESS' ? ROUTES_MAIN.DASHBOARD : ROUTES_MAIN.LOGIN)),
        takeUntilDestroyed(),
      )
      .subscribe((direction) => {
        console.log('Loading Component Redirect', direction);
        this.router.navigate([direction]);
      });
  }
}
