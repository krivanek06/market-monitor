import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { LoaderMainService } from '@mm/shared/general-features';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  selector: 'app-root',
  template: `
    <main class="min-h-screen min-w-full">
      @defer {
        <div *ngIf="loadingSignal()" class="grid min-h-screen min-w-full place-content-center pb-[15%]">
          <mat-spinner></mat-spinner>
        </div>
      }

      <div [ngClass]="{ hidden: loadingSignal() }">
        <router-outlet></router-outlet>
      </div>
    </main>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class AppComponent {
  loadingSignal = toSignal(inject(LoaderMainService).getLoading());
}
