import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Routes } from '@angular/router';
import { PageCryptoComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-crypto',
  standalone: true,
  imports: [CommonModule, PageCryptoComponent],
  template: `<app-page-crypto></app-page-crypto>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CryptoComponent {}

export const route: Routes = [
  {
    path: '',
    component: CryptoComponent,
  },
];
