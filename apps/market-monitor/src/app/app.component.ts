import { NgClass } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { StorageLocalService } from '@mm/shared/storage-local';

@Component({
  standalone: true,
  imports: [RouterModule, MatProgressSpinnerModule, NgClass],
  selector: 'app-root',
  template: `
    <main class="min-h-screen min-w-full">
      @if (isLoading()) {
        <div class="grid min-h-screen min-w-full place-content-center pb-[15%]">
          <mat-spinner />
        </div>
      }

      <div [ngClass]="{ hidden: isLoading() }">
        <router-outlet />
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
  private readonly storageLocalService = inject(StorageLocalService);
  readonly isLoading = computed(() => !!this.storageLocalService.localData()?.loader?.enabled);
}
