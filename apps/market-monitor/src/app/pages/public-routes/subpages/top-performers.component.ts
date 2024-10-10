import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageMarketTopPerformersComponent } from '@mm/page-builder';

@Component({
  selector: 'app-market-top-performers',
  standalone: true,
  imports: [PageMarketTopPerformersComponent],
  template: `<app-page-market-top-performers />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopPerformersComponent {}
