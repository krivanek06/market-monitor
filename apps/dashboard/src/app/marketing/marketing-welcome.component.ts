import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageMarketingComponent } from '@mm/page-builder';

@Component({
  selector: 'app-marketing-welcome',
  imports: [PageMarketingComponent],
  template: `<app-page-marketing />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingWelcomeComponent {}
