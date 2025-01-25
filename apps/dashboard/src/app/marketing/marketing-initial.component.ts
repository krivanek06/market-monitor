import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageMarketingComponent } from '@mm/page-builder';

@Component({
  selector: 'app-marketing-initial',
  imports: [PageMarketingComponent],
  template: `<app-page-marketing />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingInitialComponent {
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.document.body.classList.add('dark-theme');
  }
}
