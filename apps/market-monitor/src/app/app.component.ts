import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Meta } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { DialogServiceModule } from '@market-monitor/shared/features/dialog-manager';
import { LoaderMainService } from '@market-monitor/shared/features/general-features';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, DialogServiceModule],
  selector: 'app-root',
  template: `
    <main class="min-h-screen min-w-full">
      <div *ngIf="loadingSignal()" class="grid place-content-center pb-[15%] min-h-screen min-w-full">
        <mat-spinner></mat-spinner>
      </div>

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
export class AppComponent implements OnInit {
  loadingSignal = toSignal(inject(LoaderMainService).getLoading());

  constructor(private metaTagService: Meta) {}

  ngOnInit(): void {
    this.metaTagService.addTags([
      {
        name: 'keywords',
        content: 'Stock search application',
      },
      {
        name: 'description',
        content: 'Application for searching financial information about publicly traded companies.',
      },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'Eduard Krivanek' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'date', content: '2023', scheme: 'YYYY' },
      { charset: 'UTF-8' },
    ]);
  }
}
