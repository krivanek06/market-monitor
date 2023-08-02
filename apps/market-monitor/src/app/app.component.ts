import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterEvent,
  RouterModule,
} from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  selector: 'app-root',
  template: `
    <main class="min-h-screen min-w-full">
      <div *ngIf="loadingSignal(); else showRoute" class="grid place-content-center pb-[15%] min-h-screen min-w-full">
        <mat-spinner></mat-spinner>
      </div>

      <ng-template #showRoute>
        <router-outlet></router-outlet>
      </ng-template>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AppComponent {
  loadingSignal = signal(false);

  constructor(private router: Router) {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((routerEvent) => {
      this.checkRouterEvent(routerEvent as RouterEvent);
    });
  }

  checkRouterEvent(routerEvent: RouterEvent): void {
    if (routerEvent instanceof NavigationStart) {
      this.loadingSignal.set(true);
    }

    if (
      routerEvent instanceof NavigationEnd ||
      routerEvent instanceof NavigationCancel ||
      routerEvent instanceof NavigationError
    ) {
      this.loadingSignal.set(false);
    }
  }
}
