import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageStockDetailsOverviewComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-details-overview',
  standalone: true,
  imports: [CommonModule, PageStockDetailsOverviewComponent],
  template: `<app-page-details-overview></app-page-details-overview> `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsOverviewComponent {}
