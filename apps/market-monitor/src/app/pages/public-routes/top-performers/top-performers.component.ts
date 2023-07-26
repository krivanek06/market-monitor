import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageMarketTopPerformersComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-market-top-performers',
  standalone: true,
  imports: [CommonModule, PageMarketTopPerformersComponent],
  templateUrl: './top-performers.component.html',
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
