import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { NgShowDirective } from '@market-monitor/shared-directives';
import { LoaderMainService } from '@market-monitor/shared-services';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, NgShowDirective],
  selector: 'app-root',
  template: `
    <main class="min-h-screen min-w-full">
      <div *ngIf="loadingSignal()" class="grid place-content-center pb-[15%] min-h-screen min-w-full">
        <mat-spinner></mat-spinner>
      </div>

      <router-outlet></router-outlet>
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
  loadingSignal = toSignal(inject(LoaderMainService).getLoading());
}
