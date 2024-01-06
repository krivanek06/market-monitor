import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageWatchlistComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [PageWatchlistComponent],
  template: `<app-page-watchlist></app-page-watchlist>`,
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchlistComponent {}
