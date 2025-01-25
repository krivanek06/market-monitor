import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-marketing-base',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingBaseComponent implements OnDestroy {
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.document.body.classList.add('dark-theme');
    this.document.body.classList.add('marketing-styles');
  }

  ngOnDestroy(): void {
    this.document.body.classList.remove('marketing-styles');
  }
}
