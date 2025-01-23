import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-marketing-initial',
  imports: [],
  template: `<p>marketing-initial works!</p>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingInitialComponent {}
