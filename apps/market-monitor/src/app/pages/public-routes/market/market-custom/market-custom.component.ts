import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageMarketCustomComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-market-custom',
  standalone: true,
  imports: [CommonModule, PageMarketCustomComponent],
  templateUrl: './market-custom.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketCustomComponent {}
