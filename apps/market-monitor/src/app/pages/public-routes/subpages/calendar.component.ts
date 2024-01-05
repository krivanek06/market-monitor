import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageMarketCalendarComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-market-calendar',
  standalone: true,
  imports: [CommonModule, PageMarketCalendarComponent],
  template: `<app-page-market-calendar></app-page-market-calendar>`,
  styles: `
      :host {
        display: block;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {}
