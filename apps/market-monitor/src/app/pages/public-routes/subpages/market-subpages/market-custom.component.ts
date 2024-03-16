import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageMarketCustomComponent } from '@mm/page-builder';

@Component({
  selector: 'app-market-custom',
  standalone: true,
  imports: [CommonModule, PageMarketCustomComponent],
  template: `<app-page-market-custom></app-page-market-custom>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketCustomComponent {}
