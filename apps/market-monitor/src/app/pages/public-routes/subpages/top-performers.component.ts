import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Routes } from '@angular/router';
import { PageMarketTopPerformersComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-market-top-performers',
  standalone: true,
  imports: [CommonModule, PageMarketTopPerformersComponent],
  template: `<app-page-market-top-performers></app-page-market-top-performers>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopPerformersComponent {}

export const route: Routes = [
  {
    path: '',
    component: TopPerformersComponent,
  },
];
