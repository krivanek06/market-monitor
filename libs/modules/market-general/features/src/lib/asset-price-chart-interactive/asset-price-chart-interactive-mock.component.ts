import { Component, input } from '@angular/core';

@Component({
  selector: 'app-asset-price-chart-interactive',
  standalone: true,
  imports: [],
  template: ``,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class AssetPriceChartInteractiveComponentMock {
  readonly symbol = input.required<string>();
  readonly chartHeightPx = input(420);
  readonly priceName = input('price');
  readonly priceShowSign = input(true);
  readonly title = input('Historical Prices');
  readonly imageName = input('');
  readonly displayVolume = input(true);

  /** parent can set that some error happened and no data will be loaded */
  readonly errorFromParent = input(false);
}
